import type { Map as MlMap, MapMouseEvent, MapTouchEvent, PointLike } from "maplibre-gl";
import { featureCollection, lineString, point, polygon } from "@turf/helpers";
import type { Feature as GeoJsonFeature, Geometry, Point, Position } from "geojson";
import { onKeyStroke, tryOnBeforeUnmount } from "@vueuse/core";
import { ref, toValue, unref, watch, type MaybeRef, type MaybeRefOrGetter } from "vue";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { GeometryLayerItem } from "@/types/scenarioLayerItems";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { DrawType } from "@/composables/geoEditing";
import { unwrapPositionRelative } from "@/geo/longitude";

const DRAW_PREVIEW_OVERLAY_ID = "maplibre-draw-preview";
const DRAW_VERTEX_HANDLES_OVERLAY_ID = "maplibre-draw-vertex-handles";
const DRAW_MIDPOINT_HANDLES_OVERLAY_ID = "maplibre-draw-midpoint-handles";
const DRAW_VERTEX_HANDLE_LAYER_ID = `geojson-overlay-circle-${DRAW_VERTEX_HANDLES_OVERLAY_ID}`;
const DRAW_MIDPOINT_HANDLE_LAYER_ID = `geojson-overlay-circle-${DRAW_MIDPOINT_HANDLES_OVERLAY_ID}`;

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
  handle?: EditHandle;
  interactions: MapDragInteractionState;
}

interface EditHandle {
  featureId: FeatureId;
  kind: "vertex" | "midpoint";
  path: number[];
  position?: Position;
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
    mapAdapter.removeGeoJsonOverlay(DRAW_VERTEX_HANDLES_OVERLAY_ID);
    mapAdapter.removeGeoJsonOverlay(DRAW_MIDPOINT_HANDLES_OVERLAY_ID);
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
    renderPathPreview(getPreviewPosition(position));
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
        renderPathPreview(getPreviewPosition(position));
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
        handle,
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
    const unwrappedPosition = unwrapDrawPosition(position);
    const last = vertices.value[vertices.value.length - 1];
    if (last && distanceMeters(last, unwrappedPosition) < 3) return;
    vertices.value = [...vertices.value, unwrappedPosition];
    renderPathPreview(unwrappedPosition);
  }

  function appendClickVertex(position: Position) {
    const unwrappedPosition = unwrapDrawPosition(position);
    const last = vertices.value[vertices.value.length - 1];
    if (last && samePosition(last, unwrappedPosition)) return;
    vertices.value = [...vertices.value, unwrappedPosition];
  }

  function getPreviewPosition(position: Position): Position {
    const last = vertices.value[vertices.value.length - 1];
    return last ? unwrapPositionRelative(last, position) : position;
  }

  function unwrapDrawPosition(position: Position): Position {
    const last = vertices.value[vertices.value.length - 1];
    return last ? unwrapPositionRelative(last, position) : position;
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
    renderHandleOverlays(options.getSelectedFeatures());
  }

  function getTopDrawHandle(pointLike: PointLike): EditHandle | undefined {
    const hits = mlMap.queryRenderedFeatures(pointLike, {
      layers: [DRAW_VERTEX_HANDLE_LAYER_ID, DRAW_MIDPOINT_HANDLE_LAYER_ID],
    });
    const hit = hits[0];
    if (!hit?.properties?.featureId || !hit.properties.path) return;
    return {
      featureId: String(hit.properties.featureId),
      kind: hit.properties.kind === "midpoint" ? "midpoint" : "vertex",
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
    renderHandleOverlays(
      options.getSelectedFeatures().map((feature) => ({
        ...feature,
        geometry: updatedById.get(feature.id)?.geometry ?? feature.geometry,
      })),
    );
  }

  function renderHandleOverlays(
    features: Array<Pick<GeometryLayerItem, "id" | "geometry">>,
  ) {
    const handleFeatures = features.flatMap((feature) =>
      getEditHandles(feature, getRenderedMidpoint).flatMap((handle) => {
        const coordinate =
          handle.position ?? getVertexAtPath(feature.geometry, handle.path);
        if (!coordinate) return [];
        return [
          {
            type: "Feature" as const,
            geometry: point(coordinate).geometry,
            properties: {
              featureId: handle.featureId,
              kind: handle.kind,
              path: JSON.stringify(handle.path),
            },
          },
        ];
      }),
    );
    const vertexFeatures: GeoJsonFeature[] = handleFeatures.filter(
      (feature) => feature.properties.kind === "vertex",
    );
    const midpointFeatures: GeoJsonFeature[] = handleFeatures.filter(
      (feature) => feature.properties.kind === "midpoint",
    );

    mapAdapter.addGeoJsonOverlay(
      DRAW_VERTEX_HANDLES_OVERLAY_ID,
      featureCollection(vertexFeatures),
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
    mapAdapter.addGeoJsonOverlay(
      DRAW_MIDPOINT_HANDLES_OVERLAY_ID,
      featureCollection(midpointFeatures),
      {
        style: {
          strokeColor: "#2563eb",
          strokeWidth: 1.5,
          fillColor: "rgba(37,99,235,0.12)",
          circleRadius: 4,
          circleFillColor: "#60a5fa",
          circleStrokeColor: "#1e3a8a",
        },
      },
    );
  }

  function getRenderedMidpoint(a: Position, b: Position): Position {
    if (isGlobeProjection(mlMap)) {
      return projectedMercatorSegmentMidpoint(mlMap, a, b);
    }
    try {
      const projectedA = mlMap.project(a as [number, number]);
      const projectedB = mlMap.project(b as [number, number]);
      const renderedMidpoint = mlMap.unproject([
        (projectedA.x + projectedB.x) / 2,
        (projectedA.y + projectedB.y) / 2,
      ]);
      return [renderedMidpoint.lng, renderedMidpoint.lat];
    } catch {
      return midpoint(a, b);
    }
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
    const unwrappedPosition = unwrapPositionRelative(dragState.start, position);
    const delta: Position = [
      unwrappedPosition[0] - dragState.start[0],
      unwrappedPosition[1] - dragState.start[1],
    ];
    return dragState.features.map((feature) => ({
      featureId: feature.id,
      geometry: translateGeometry(feature.geometry, delta),
      geometryMeta: feature.geometryMeta,
    }));
  }
  if (!dragState.handle) return [];
  return dragState.features
    .filter((feature) => feature.id === dragState.handle?.featureId)
    .map((feature) => {
      const unwrappedPosition = unwrapPositionRelative(
        getDragPositionReference(feature.geometry, dragState.handle!),
        position,
      );
      return {
        featureId: feature.id,
        geometry:
          dragState.handle!.kind === "midpoint"
            ? insertVertexAtPath(
                feature.geometry,
                dragState.handle!.path,
                unwrappedPosition,
              )
            : updateVertexAtPath(
                feature.geometry,
                dragState.handle!.path,
                unwrappedPosition,
              ),
        geometryMeta: feature.geometryMeta,
      };
    });
}

function getDragPositionReference(geometry: Geometry, handle: EditHandle): Position {
  if (handle.position) return handle.position;
  return getVertexAtPath(geometry, handle.path) ?? [0, 0];
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

type MidpointCalculator = (a: Position, b: Position) => Position;

function getEditHandles(
  feature: Pick<GeometryLayerItem, "id" | "geometry">,
  midpointCalculator: MidpointCalculator = midpoint,
): EditHandle[] {
  return [
    ...getVertexHandles(feature),
    ...getMidpointHandles(feature, midpointCalculator),
  ];
}

function getVertexHandles(
  feature: Pick<GeometryLayerItem, "id" | "geometry">,
): EditHandle[] {
  const handles: EditHandle[] = [];
  visitGeometryVertices(feature.geometry, (path) => {
    handles.push({ featureId: feature.id, kind: "vertex", path });
  });
  return handles;
}

function getMidpointHandles(
  feature: Pick<GeometryLayerItem, "id" | "geometry">,
  midpointCalculator: MidpointCalculator,
): EditHandle[] {
  const handles: EditHandle[] = [];
  visitGeometryEdges(feature.geometry, (insertPath, a, b) => {
    handles.push({
      featureId: feature.id,
      kind: "midpoint",
      path: insertPath,
      position: midpointCalculator(a, b),
    });
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

function visitGeometryEdges(
  geometry: Geometry,
  visit: (insertPath: number[], a: Position, b: Position) => void,
) {
  if (geometry.type === "LineString") {
    geometry.coordinates.forEach((coordinate, index) => {
      const next = geometry.coordinates[index + 1];
      if (next) visit([index + 1], coordinate, next);
    });
  } else if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring, ringIndex) => {
      ring.forEach((coordinate, coordinateIndex) => {
        const next = ring[coordinateIndex + 1];
        if (next) visit([ringIndex, coordinateIndex + 1], coordinate, next);
      });
    });
  } else if (geometry.type === "MultiLineString") {
    geometry.coordinates.forEach((line, lineIndex) => {
      line.forEach((coordinate, coordinateIndex) => {
        const next = line[coordinateIndex + 1];
        if (next) visit([lineIndex, coordinateIndex + 1], coordinate, next);
      });
    });
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygon, polygonIndex) => {
      polygon.forEach((ring, ringIndex) => {
        ring.forEach((coordinate, coordinateIndex) => {
          const next = ring[coordinateIndex + 1];
          if (next) {
            visit([polygonIndex, ringIndex, coordinateIndex + 1], coordinate, next);
          }
        });
      });
    });
  }
}

function midpoint(a: Position, b: Position): Position {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function isGlobeProjection(map: MlMap) {
  const projection = (map as any).getProjection?.();
  const projectionType =
    typeof projection === "string" ? projection : (projection?.type ?? projection?.name);
  return projectionType === "globe";
}

function projectedMercatorSegmentMidpoint(
  map: MlMap,
  a: Position,
  b: Position,
): Position {
  try {
    const coordinates = sampleMercatorSegmentCoordinates(a, b);
    const projected = coordinates.map((coordinate) => ({
      coordinate,
      point: map.project(coordinate as [number, number]),
    }));
    const lengths: number[] = [];
    let totalLength = 0;

    for (let index = 0; index < projected.length - 1; index++) {
      const start = projected[index]!.point;
      const end = projected[index + 1]!.point;
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      lengths.push(length);
      totalLength += length;
    }

    if (totalLength === 0) return midpoint(a, b);

    let remaining = totalLength / 2;
    for (let index = 0; index < lengths.length; index++) {
      const length = lengths[index]!;
      if (remaining > length) {
        remaining -= length;
        continue;
      }
      const start = projected[index]!.coordinate;
      const end = projected[index + 1]!.coordinate;
      const ratio = length === 0 ? 0 : remaining / length;
      return unwrapPositionRelative(a, [
        start[0] + (end[0] - start[0]) * ratio,
        start[1] + (end[1] - start[1]) * ratio,
      ]);
    }

    return coordinates[Math.floor(coordinates.length / 2)]!;
  } catch {
    return midpoint(a, b);
  }
}

function sampleMercatorSegmentCoordinates(a: Position, b: Position): Position[] {
  const end = unwrapPositionRelative(a, b);
  const startY = latitudeToMercatorY(a[1]);
  const endY = latitudeToMercatorY(end[1]);
  const coordinates: Position[] = [];

  for (let index = 0; index <= 64; index++) {
    const ratio = index / 64;
    coordinates.push([
      a[0] + (end[0] - a[0]) * ratio,
      mercatorYToLatitude(startY + (endY - startY) * ratio),
    ]);
  }

  return coordinates;
}

function latitudeToMercatorY(latitude: number) {
  const clampedLatitude = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  const radians = (clampedLatitude * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

function mercatorYToLatitude(y: number) {
  return (Math.atan(Math.exp(y)) * 2 - Math.PI / 2) * (180 / Math.PI);
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

function insertVertexAtPath(
  geometry: Geometry,
  path: number[],
  position: Position,
): Geometry {
  if (geometry.type === "LineString") {
    const coordinates = [...geometry.coordinates];
    coordinates.splice(path[0], 0, position);
    return { ...geometry, coordinates };
  }
  if (geometry.type === "Polygon") {
    const coordinates = geometry.coordinates.map((ring) => [...ring]);
    coordinates[path[0]].splice(path[1], 0, position);
    return { ...geometry, coordinates };
  }
  if (geometry.type === "MultiLineString") {
    const coordinates = geometry.coordinates.map((line) => [...line]);
    coordinates[path[0]].splice(path[1], 0, position);
    return { ...geometry, coordinates };
  }
  if (geometry.type === "MultiPolygon") {
    const coordinates = geometry.coordinates.map((polygon) =>
      polygon.map((ring) => [...ring]),
    );
    coordinates[path[0]][path[1]].splice(path[2], 0, position);
    return { ...geometry, coordinates };
  }
  return updateVertexAtPath(geometry, path, position);
}
