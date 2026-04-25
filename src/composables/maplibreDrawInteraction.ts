import type { Map as MlMap, MapMouseEvent, MapTouchEvent, PointLike } from "maplibre-gl";
import { featureCollection, lineString, point, polygon } from "@turf/helpers";
import type { Feature as GeoJsonFeature, Geometry, Point, Position } from "geojson";
import { onKeyStroke, tryOnBeforeUnmount } from "@vueuse/core";
import { ref, toValue, unref, watch, type MaybeRef, type MaybeRefOrGetter } from "vue";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { GeometryLayerItem } from "@/types/scenarioLayerItems";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { DrawType } from "@/composables/geoEditing";

const DRAW_PREVIEW_OVERLAY_ID = "maplibre-draw-preview";
const DRAW_HANDLES_OVERLAY_ID = "maplibre-draw-handles";
const DRAW_HANDLE_LAYER_ID = `geojson-overlay-circle-${DRAW_HANDLES_OVERLAY_ID}`;

interface DrawUpdate {
  featureId: FeatureId;
  geometry: Geometry;
  geometryMeta?: Partial<GeometryLayerItem["geometryMeta"]>;
}

interface MapLibreDrawInteractionOptions {
  addMultiple?: MaybeRef<boolean>;
  snap?: MaybeRef<boolean>;
  translate?: MaybeRef<boolean>;
  freehand?: MaybeRef<boolean>;
  getSelectedFeatures: () => GeometryLayerItem[];
  addFeature: (feature: GeometryLayerItem) => void;
  updateFeatures: (updates: DrawUpdate[]) => void;
  onDrawingChange?: (drawing: boolean) => void;
  onModifyingChange?: (modifying: boolean) => void;
}

interface DragState {
  mode: "translate" | "vertex";
  start: Position;
  features: GeometryLayerItem[];
  vertex?: VertexHandle;
  interactions: MapDragInteractionState;
}

interface VertexHandle {
  featureId: FeatureId;
  path: number[];
}

interface MapDragInteractionState {
  dragPanEnabled: boolean;
  touchZoomRotateEnabled: boolean;
  doubleClickZoomEnabled: boolean;
}

export function useMapLibreDrawInteraction(
  mapSource: MaybeRefOrGetter<MapAdapter>,
  options: MapLibreDrawInteractionOptions,
) {
  const mapAdapter = toValue(mapSource);
  const mlMap = mapAdapter.getNativeMap() as MlMap;
  const currentDrawType = ref<DrawType | null>(null);
  const isDrawing = ref(false);
  const isModifying = ref(false);
  const vertices = ref<Position[]>([]);
  let dragState: DragState | null = null;
  let circleCenter: Position | null = null;
  let cleanupEsc: (() => void) | undefined;
  let cleanupEnter: (() => void) | undefined;

  function startDrawing(drawType: DrawType) {
    cancel();
    currentDrawType.value = drawType;
    isDrawing.value = true;
    options.onDrawingChange?.(true);
    mlMap.getCanvas().style.cursor = "crosshair";
    if (mlMap.doubleClickZoom.isEnabled()) mlMap.doubleClickZoom.disable();
  }

  function startModify() {
    if (isModifying.value) {
      stopModify();
      return;
    }
    cancelDrawing();
    isModifying.value = true;
    options.onModifyingChange?.(true);
    renderHandles();
    mlMap.getCanvas().style.cursor = "";
  }

  function stopModify() {
    isModifying.value = false;
    dragState = null;
    options.onModifyingChange?.(false);
    mapAdapter.removeGeoJsonOverlay(DRAW_HANDLES_OVERLAY_ID);
  }

  function cancelDrawing() {
    currentDrawType.value = null;
    isDrawing.value = false;
    vertices.value = [];
    circleCenter = null;
    mapAdapter.removeGeoJsonOverlay(DRAW_PREVIEW_OVERLAY_ID);
    options.onDrawingChange?.(false);
    restoreDoubleClickZoom();
  }

  function cancel() {
    cancelDrawing();
    stopModify();
    mlMap.getCanvas().style.cursor = "";
  }

  function restoreDoubleClickZoom() {
    if (!mlMap.doubleClickZoom.isEnabled()) mlMap.doubleClickZoom.enable();
  }

  function onClick(e: MapMouseEvent) {
    if (!isDrawing.value || !currentDrawType.value) return;
    e.preventDefault();
    e.originalEvent.preventDefault();
    e.originalEvent.stopPropagation();
    const position: Position = [e.lngLat.lng, e.lngLat.lat];

    if (currentDrawType.value === "Point") {
      commitFeature({
        geometry: point(position).geometry,
        geometryMeta: { geometryKind: "Point" },
      });
      return;
    }

    if (currentDrawType.value === "Circle") {
      if (!circleCenter) {
        circleCenter = position;
        renderPreview(point(position).geometry);
        return;
      }
      commitFeature({
        geometry: point(circleCenter).geometry,
        geometryMeta: {
          geometryKind: "Circle",
          radius: distanceMeters(circleCenter, position),
        },
      });
      return;
    }

    appendClickVertex(position);
    renderPathPreview(position);
  }

  function onDoubleClick(e: MapMouseEvent) {
    if (!isDrawing.value || !currentDrawType.value) return;
    e.preventDefault();
    e.originalEvent.preventDefault();
    e.originalEvent.stopPropagation();
    finishPathDrawing();
  }

  function onMouseMove(e: MapMouseEvent) {
    const position: Position = [e.lngLat.lng, e.lngLat.lat];
    if (dragState) {
      previewDrag(position);
      return;
    }
    if (isDrawing.value) {
      mlMap.getCanvas().style.cursor = "crosshair";
      if (
        unref(options.freehand) &&
        (currentDrawType.value === "LineString" || currentDrawType.value === "Polygon") &&
        (e.originalEvent as MouseEvent).buttons === 1
      ) {
        appendFreehandVertex(position);
        return;
      }
      if (currentDrawType.value === "Circle" && circleCenter) {
        renderPreview(createCirclePreview(circleCenter, position));
        return;
      }
      if (
        (currentDrawType.value === "LineString" || currentDrawType.value === "Polygon") &&
        vertices.value.length
      ) {
        renderPathPreview(position);
      }
      return;
    }
    if (isModifying.value || unref(options.translate)) {
      mlMap.getCanvas().style.cursor = getTopDrawHandle(e.point) ? "grab" : "";
    }
  }

  function onMouseDown(e: MapMouseEvent | MapTouchEvent) {
    if (
      isDrawing.value &&
      unref(options.freehand) &&
      (currentDrawType.value === "LineString" || currentDrawType.value === "Polygon")
    ) {
      e.preventDefault();
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      vertices.value = [[e.lngLat.lng, e.lngLat.lat]];
      return;
    }
    if (isDrawing.value) return;
    const selectedFeatures = options.getSelectedFeatures();
    if (!selectedFeatures.length) return;

    const position: Position = [e.lngLat.lng, e.lngLat.lat];
    const handle = isModifying.value ? getTopDrawHandle(e.point) : undefined;
    if (handle) {
      dragState = {
        mode: "vertex",
        start: position,
        features: selectedFeatures,
        vertex: handle,
        interactions: suspendMapDragInteractions(),
      };
    } else if (unref(options.translate)) {
      dragState = {
        mode: "translate",
        start: position,
        features: selectedFeatures,
        interactions: suspendMapDragInteractions(),
      };
    }
    if (dragState) {
      e.preventDefault();
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      mlMap.getCanvas().style.cursor = "grabbing";
    }
  }

  function onMouseUp(e: MapMouseEvent | MapTouchEvent) {
    if (
      isDrawing.value &&
      unref(options.freehand) &&
      (currentDrawType.value === "LineString" || currentDrawType.value === "Polygon")
    ) {
      finishPathDrawing();
      return;
    }
    if (!dragState) return;
    const position: Position = [e.lngLat.lng, e.lngLat.lat];
    const updates = getDragUpdates(dragState, position);
    restoreMapDragInteractions(dragState.interactions);
    dragState = null;
    mapAdapter.removeGeoJsonOverlay(DRAW_PREVIEW_OVERLAY_ID);
    mlMap.getCanvas().style.cursor = "";
    if (updates.length) {
      options.updateFeatures(updates);
      renderHandles();
    }
  }

  function commitFeature(input: {
    geometry: Geometry;
    geometryMeta: GeometryLayerItem["geometryMeta"];
  }) {
    options.addFeature({
      kind: "geometry",
      id: "",
      geometry: input.geometry,
      geometryMeta: input.geometryMeta,
      style: {},
      userData: {},
    });
    if (unref(options.addMultiple)) {
      vertices.value = [];
      circleCenter = null;
      mapAdapter.removeGeoJsonOverlay(DRAW_PREVIEW_OVERLAY_ID);
      return;
    }
    cancelDrawing();
  }

  function finishPathDrawing() {
    const drawType = currentDrawType.value;
    const coordinates = withoutTrailingDuplicate(vertices.value);
    if (drawType === "LineString" && coordinates.length >= 2) {
      commitFeature({
        geometry: lineString(coordinates).geometry,
        geometryMeta: { geometryKind: "LineString" },
      });
    }
    if (drawType === "Polygon" && coordinates.length >= 3) {
      const ring = closeRing(coordinates);
      commitFeature({
        geometry: polygon([ring]).geometry,
        geometryMeta: { geometryKind: "Polygon" },
      });
    }
  }

  function renderPathPreview(pointer: Position) {
    if (currentDrawType.value === "LineString") {
      const coordinates = [...vertices.value, pointer];
      if (coordinates.length >= 2) {
        renderPreview(lineString(coordinates).geometry, { fill: false });
      }
      return;
    }
    if (currentDrawType.value === "Polygon") {
      const coordinates = [...vertices.value, pointer];
      if (coordinates.length >= 3) {
        renderPreview(polygon([closeRing(coordinates)]).geometry);
      } else if (coordinates.length >= 2) {
        renderPreview(lineString(coordinates).geometry, { fill: false });
      }
    }
  }

  function appendFreehandVertex(position: Position) {
    const last = vertices.value[vertices.value.length - 1];
    if (last && distanceMeters(last, position) < 3) return;
    vertices.value = [...vertices.value, position];
    renderPathPreview(position);
  }

  function appendClickVertex(position: Position) {
    const last = vertices.value[vertices.value.length - 1];
    if (last && samePosition(last, position)) return;
    vertices.value = [...vertices.value, position];
  }

  function renderPreview(geometry: Geometry, options: { fill?: boolean } = {}) {
    mapAdapter.addGeoJsonOverlay(
      DRAW_PREVIEW_OVERLAY_ID,
      featureCollection([{ type: "Feature", geometry, properties: {} }]),
      {
        style: {
          strokeColor: "#2563eb",
          strokeWidth: 2,
          strokeLineDash: [6, 4],
          fillColor:
            options.fill === false ? "rgba(37,99,235,0)" : "rgba(37,99,235,0.16)",
          circleRadius: 5,
          circleFillColor: "#2563eb",
          circleStrokeColor: "#ffffff",
        },
      },
    );
  }

  function renderHandles() {
    if (!isModifying.value) return;
    const handleFeatures = options.getSelectedFeatures().flatMap((feature) =>
      getVertexHandles(feature).map((handle) => ({
        type: "Feature" as const,
        geometry: point(getVertexAtPath(feature.geometry, handle.path)!).geometry,
        properties: {
          featureId: handle.featureId,
          path: JSON.stringify(handle.path),
        },
      })),
    );
    mapAdapter.addGeoJsonOverlay(
      DRAW_HANDLES_OVERLAY_ID,
      featureCollection(handleFeatures),
      {
        style: {
          strokeColor: "#facc15",
          strokeWidth: 2,
          fillColor: "rgba(250,204,21,0.2)",
          circleRadius: 6,
          circleFillColor: "#facc15",
          circleStrokeColor: "#111827",
        },
      },
    );
  }

  function getTopDrawHandle(pointLike: PointLike): VertexHandle | undefined {
    const hits = mlMap.queryRenderedFeatures(pointLike, {
      layers: [DRAW_HANDLE_LAYER_ID],
    });
    const hit = hits[0];
    if (!hit?.properties?.featureId || !hit.properties.path) return;
    return {
      featureId: String(hit.properties.featureId),
      path:
        typeof hit.properties.path === "string"
          ? JSON.parse(hit.properties.path)
          : hit.properties.path,
    };
  }

  function previewDrag(position: Position) {
    if (!dragState) return;
    const updates = getDragUpdates(dragState, position);
    renderDragPreview(updates);
    renderHandlePreview(updates);
  }

  function renderDragPreview(updates: DrawUpdate[]) {
    const features: GeoJsonFeature[] = updates.map((update) => ({
      type: "Feature",
      id: update.featureId,
      geometry: update.geometry,
      properties: {},
    }));
    mapAdapter.addGeoJsonOverlay(DRAW_PREVIEW_OVERLAY_ID, featureCollection(features), {
      style: {
        strokeColor: "#2563eb",
        strokeWidth: 2,
        fillColor: "rgba(37,99,235,0)",
        circleRadius: 5,
        circleFillColor: "#2563eb",
        circleStrokeColor: "#ffffff",
      },
    });
  }

  function renderHandlePreview(updates: DrawUpdate[]) {
    if (!isModifying.value) return;
    const updatedById = new Map(updates.map((update) => [update.featureId, update]));
    const features = options.getSelectedFeatures().flatMap((feature) => {
      const geometry = updatedById.get(feature.id)?.geometry ?? feature.geometry;
      return getVertexHandles({ ...feature, geometry }).map((handle) => ({
        type: "Feature" as const,
        geometry: point(getVertexAtPath(geometry, handle.path)!).geometry,
        properties: {
          featureId: handle.featureId,
          path: JSON.stringify(handle.path),
        },
      }));
    });
    mapAdapter.addGeoJsonOverlay(DRAW_HANDLES_OVERLAY_ID, featureCollection(features));
  }

  function suspendMapDragInteractions(): MapDragInteractionState {
    const dragPanEnabled = mlMap.dragPan.isEnabled();
    const touchZoomRotateEnabled = mlMap.touchZoomRotate.isEnabled();
    const doubleClickZoomEnabled = mlMap.doubleClickZoom.isEnabled();
    if (dragPanEnabled) mlMap.dragPan.disable();
    if (touchZoomRotateEnabled) mlMap.touchZoomRotate.disable();
    if (doubleClickZoomEnabled) mlMap.doubleClickZoom.disable();
    return { dragPanEnabled, touchZoomRotateEnabled, doubleClickZoomEnabled };
  }

  function restoreMapDragInteractions(state: MapDragInteractionState) {
    if (state.dragPanEnabled && !mlMap.dragPan.isEnabled()) mlMap.dragPan.enable();
    if (state.touchZoomRotateEnabled && !mlMap.touchZoomRotate.isEnabled()) {
      mlMap.touchZoomRotate.enable();
    }
    if (state.doubleClickZoomEnabled && !mlMap.doubleClickZoom.isEnabled()) {
      mlMap.doubleClickZoom.enable();
    }
  }

  mlMap.on("click", onClick);
  mlMap.on("dblclick", onDoubleClick);
  mlMap.on("mousemove", onMouseMove);
  mlMap.on("mousedown", onMouseDown);
  mlMap.on("touchstart", onMouseDown);
  mlMap.on("mouseup", onMouseUp);
  mlMap.on("touchend", onMouseUp);
  mlMap.on("touchcancel", onMouseUp);

  cleanupEsc = onKeyStroke("Escape", () => cancel());
  cleanupEnter = onKeyStroke("Enter", () => finishPathDrawing());

  watch(
    () => [...options.getSelectedFeatures().map((feature) => feature.id)],
    () => renderHandles(),
  );

  tryOnBeforeUnmount(() => {
    mlMap.off("click", onClick);
    mlMap.off("dblclick", onDoubleClick);
    mlMap.off("mousemove", onMouseMove);
    mlMap.off("mousedown", onMouseDown);
    mlMap.off("touchstart", onMouseDown);
    mlMap.off("mouseup", onMouseUp);
    mlMap.off("touchend", onMouseUp);
    mlMap.off("touchcancel", onMouseUp);
    cleanupEsc?.();
    cleanupEnter?.();
    cancel();
  });

  return {
    startDrawing,
    currentDrawType,
    startModify,
    isModifying,
    cancel,
    isDrawing,
  };
}

function closeRing(coordinates: Position[]): Position[] {
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first && last && samePosition(first, last)) return coordinates;
  return [...coordinates, first];
}

function withoutTrailingDuplicate(coordinates: Position[]): Position[] {
  if (coordinates.length < 2) return coordinates;
  const previous = coordinates[coordinates.length - 2];
  const last = coordinates[coordinates.length - 1];
  if (!previous || !last || !samePosition(previous, last)) return coordinates;
  return coordinates.slice(0, -1);
}

function samePosition(a: Position, b: Position) {
  return a[0] === b[0] && a[1] === b[1];
}

function createCirclePreview(center: Position, edge: Position): Geometry {
  const radius = distanceMeters(center, edge);
  const steps = 64;
  const coordinates: Position[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const bearing = (i / steps) * Math.PI * 2;
    coordinates.push(destination(center, radius, bearing));
  }
  return polygon([coordinates]).geometry;
}

function distanceMeters(a: Position, b: Position) {
  const earthRadius = 6_371_008.8;
  const phi1 = degreesToRadians(a[1]);
  const phi2 = degreesToRadians(b[1]);
  const deltaPhi = degreesToRadians(b[1] - a[1]);
  const deltaLambda = degreesToRadians(b[0] - a[0]);
  const h =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function destination(
  center: Position,
  distance: number,
  bearingRadians: number,
): Position {
  const earthRadius = 6_371_008.8;
  const angularDistance = distance / earthRadius;
  const longitude1 = degreesToRadians(center[0]);
  const latitude1 = degreesToRadians(center[1]);
  const latitude2 = Math.asin(
    Math.sin(latitude1) * Math.cos(angularDistance) +
      Math.cos(latitude1) * Math.sin(angularDistance) * Math.cos(bearingRadians),
  );
  const longitude2 =
    longitude1 +
    Math.atan2(
      Math.sin(bearingRadians) * Math.sin(angularDistance) * Math.cos(latitude1),
      Math.cos(angularDistance) - Math.sin(latitude1) * Math.sin(latitude2),
    );
  return [radiansToDegrees(longitude2), radiansToDegrees(latitude2)];
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function getDragUpdates(dragState: DragState, position: Position): DrawUpdate[] {
  if (dragState.mode === "translate") {
    const delta: Position = [
      position[0] - dragState.start[0],
      position[1] - dragState.start[1],
    ];
    return dragState.features.map((feature) => ({
      featureId: feature.id,
      geometry: translateGeometry(feature.geometry, delta),
      geometryMeta: feature.geometryMeta,
    }));
  }
  if (!dragState.vertex) return [];
  return dragState.features
    .filter((feature) => feature.id === dragState.vertex?.featureId)
    .map((feature) => ({
      featureId: feature.id,
      geometry: updateVertexAtPath(feature.geometry, dragState.vertex!.path, position),
      geometryMeta: feature.geometryMeta,
    }));
}

function translateGeometry(geometry: Geometry, delta: Position): Geometry {
  return mapGeometryCoordinates(geometry, ([x, y]) => [x + delta[0], y + delta[1]]);
}

function mapGeometryCoordinates(
  geometry: Geometry,
  mapper: (coordinate: Position) => Position,
): Geometry {
  if (geometry.type === "Point") {
    return { ...geometry, coordinates: mapper(geometry.coordinates) };
  }
  if (geometry.type === "LineString" || geometry.type === "MultiPoint") {
    return { ...geometry, coordinates: geometry.coordinates.map(mapper) };
  }
  if (geometry.type === "Polygon" || geometry.type === "MultiLineString") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((line) => line.map(mapper)),
    };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((line) => line.map(mapper)),
      ),
    };
  }
  if (geometry.type === "GeometryCollection") {
    return {
      ...geometry,
      geometries: geometry.geometries.map((child) =>
        mapGeometryCoordinates(child, mapper),
      ),
    };
  }
  return geometry;
}

function getVertexHandles(
  feature: Pick<GeometryLayerItem, "id" | "geometry">,
): VertexHandle[] {
  const handles: VertexHandle[] = [];
  visitGeometryVertices(feature.geometry, (path) => {
    handles.push({ featureId: feature.id, path });
  });
  return handles;
}

function visitGeometryVertices(geometry: Geometry, visit: (path: number[]) => void) {
  if (geometry.type === "Point") {
    visit([]);
  } else if (geometry.type === "LineString" || geometry.type === "MultiPoint") {
    geometry.coordinates.forEach((_coordinate, index) => visit([index]));
  } else if (geometry.type === "Polygon" || geometry.type === "MultiLineString") {
    geometry.coordinates.forEach((line, lineIndex) => {
      line.forEach((_coordinate, coordinateIndex) => {
        if (geometry.type === "Polygon" && coordinateIndex === line.length - 1) return;
        visit([lineIndex, coordinateIndex]);
      });
    });
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((poly, polygonIndex) => {
      poly.forEach((line, lineIndex) => {
        line.forEach((_coordinate, coordinateIndex) => {
          if (coordinateIndex === line.length - 1) return;
          visit([polygonIndex, lineIndex, coordinateIndex]);
        });
      });
    });
  }
}

function getVertexAtPath(geometry: Geometry, path: number[]): Position | undefined {
  if (geometry.type === "Point") return geometry.coordinates;
  if (geometry.type === "GeometryCollection") return;
  let current: any = geometry.coordinates;
  for (const segment of path) current = current?.[segment];
  return Array.isArray(current) && typeof current[0] === "number" ? current : undefined;
}

function updateVertexAtPath(
  geometry: Geometry,
  path: number[],
  position: Position,
): Geometry {
  if (geometry.type === "Point") {
    return { ...geometry, coordinates: position } as Point;
  }
  const clone = JSON.parse(JSON.stringify(geometry)) as Geometry;
  let current: any = (clone as any).coordinates;
  for (let i = 0; i < path.length - 1; i += 1) current = current[path[i]];
  current[path[path.length - 1]] = position;
  if (clone.type === "Polygon") {
    const ring = clone.coordinates[path[0]];
    if (ring.length > 1 && path[1] === 0) ring[ring.length - 1] = position;
  }
  if (clone.type === "MultiPolygon") {
    const ring = clone.coordinates[path[0]][path[1]];
    if (ring.length > 1 && path[2] === 0) ring[ring.length - 1] = position;
  }
  return clone;
}
