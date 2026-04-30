import type {
  GeoJSONSource,
  Map as MlMap,
  MapMouseEvent,
  MapTouchEvent,
  PointLike,
} from "maplibre-gl";
import type {
  Feature as GeoJsonFeature,
  FeatureCollection,
  Geometry,
  LineString,
  Point,
  Polygon,
  Position,
} from "geojson";
import { featureCollection, lineString, point, polygon } from "@turf/helpers";
import turfLength from "@turf/length";
import turfArea from "@turf/area";
import turfCircle from "@turf/circle";
import centerOfMass from "@turf/center-of-mass";
import { onKeyStroke, tryOnBeforeUnmount } from "@vueuse/core";
import { ref, toValue, unref, watch, type MaybeRef, type MaybeRefOrGetter } from "vue";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import {
  type MeasurementInteractionOptions,
  type MeasurementTypes,
  type MeasurementUnit,
} from "@/composables/geoMeasurement";
import { formatArea, formatLength } from "@/geo/utils";
import { unwrapPositionRelative } from "@/geo/longitude";
import { GLOBE_SCENARIO_FEATURE_PREFIX } from "@/modules/maplibreview/maplibreScenarioFeatures";
import {
  createTouchDoubleTapTracker,
  getPreviousDistinctVertex,
  isZeroLengthSegment,
  normalizePathCoordinates,
  suppressMapEvent,
} from "@/composables/maplibreTouchDrawing";

const MEASUREMENT_SOURCE_ID = "maplibre-measurement";
const MEASUREMENT_LABEL_SOURCE_ID = "maplibre-measurement-labels";
const MEASUREMENT_HANDLE_SOURCE_ID = "maplibre-measurement-handles";
const MEASUREMENT_FILL_LAYER_ID = "maplibre-measurement-fill";
const MEASUREMENT_LINE_BACK_LAYER_ID = "maplibre-measurement-line-back";
const MEASUREMENT_LINE_LAYER_ID = "maplibre-measurement-line";
const MEASUREMENT_POINT_LAYER_ID = "maplibre-measurement-point";
const MEASUREMENT_LABEL_LAYER_ID = "maplibre-measurement-label";
const MEASUREMENT_HANDLE_LAYER_ID = "maplibre-measurement-handle";
const SNAP_TOLERANCE_PX = 12;

interface MeasurementFeature {
  id: string;
  geometry: LineString | Polygon;
}

interface DragState {
  measurementId: string;
  kind: EditHandle["kind"];
  path: number[];
  position: Position | null;
  interactions: MapDragInteractionState;
}

interface MapDragInteractionState {
  dragPanEnabled: boolean;
  touchZoomRotateEnabled: boolean;
  doubleClickZoomEnabled: boolean;
}

interface LabelProperties {
  text: string;
  kind: "total" | "segment";
}

interface EditHandle {
  kind: "vertex" | "midpoint";
  path: number[];
  position: Position;
}

export function useMapLibreMeasurementInteraction(
  mapSource: MaybeRefOrGetter<MapAdapter>,
  measurementType: MaybeRef<MeasurementTypes>,
  options: MeasurementInteractionOptions = {},
) {
  const mapAdapter = toValue(mapSource);
  const mlMap = mapAdapter.getNativeMap() as MlMap;
  const measurementTypeRef = ref(measurementType);
  const showSegmentsRef = ref(options.showSegments ?? true);
  const clearPreviousRef = ref(options.clearPrevious ?? true);
  const enableRef = ref(options.enable ?? true);
  const measurementUnitRef = ref(options.measurementUnit ?? "metric");
  const snapRef = ref(options.snap ?? true);
  const showCircleRef = ref(options.showCircle ?? true);
  const measurements = ref<MeasurementFeature[]>([]);
  const vertices = ref<Position[]>([]);

  let activePointer: Position | null = null;
  let drawInProgress = false;
  let dragState: DragState | null = null;
  let idCounter = 0;
  let cleanupEnter: (() => void) | undefined;
  let disposed = false;
  let layersInitialized = false;
  const touchDoubleTap = createTouchDoubleTapTracker();

  function onStyleLoad() {
    layersInitialized = false;
    render();
  }

  function onClick(e: MapMouseEvent) {
    if (!unref(enableRef)) return;
    if (dragState) return;
    suppressMapEvent(e);

    if (!drawInProgress) {
      drawInProgress = true;
      if (unref(clearPreviousRef)) measurements.value = [];
    }

    const position = getEventPosition(e);
    appendVertex(position);
    activePointer = position;
    render();
  }

  function onDoubleClick(e: MapMouseEvent) {
    if (!unref(enableRef)) return;
    suppressMapEvent(e);
    finishDrawing();
  }

  function onMouseMove(e: MapMouseEvent) {
    if (!unref(enableRef)) return;
    const position = getEventPosition(e);
    if (dragState) {
      updateDraggedVertex(position);
      render();
      return;
    }
    if (drawInProgress) {
      activePointer = unwrapDrawPosition(position);
      mlMap.getCanvas().style.cursor = "crosshair";
      render();
      return;
    }
    mlMap.getCanvas().style.cursor = getTopHandle(e.point) ? "grab" : "crosshair";
  }

  function onMouseDown(e: MapMouseEvent | MapTouchEvent) {
    if (!unref(enableRef) || drawInProgress) return;
    const handle = getTopHandle(e.point);
    if (!handle) return;
    dragState = {
      measurementId: handle.measurementId,
      kind: handle.kind,
      path: handle.path,
      position: null,
      interactions: suspendMapDragInteractions(mlMap),
    };
    suppressMapEvent(e);
    mlMap.getCanvas().style.cursor = "grabbing";
  }

  function onMouseUp() {
    if (!dragState) return;
    commitDraggedVertex();
    restoreMapDragInteractions(mlMap, dragState.interactions);
    dragState = null;
    mlMap.getCanvas().style.cursor = "";
    render();
  }

  function onTouchEnd(e: MapTouchEvent) {
    if (dragState) {
      onMouseUp();
      return;
    }
    if (!unref(enableRef) || !drawInProgress) return;

    if (!touchDoubleTap.isDoubleTap(e, vertices.value.length >= 2)) return;

    suppressMapEvent(e);
    finishDrawing();
  }

  function getEventPosition(e: MapMouseEvent | MapTouchEvent): Position {
    const raw: Position = [e.lngLat.lng, e.lngLat.lat];
    if (!unref(snapRef)) return raw;
    return getSnapPosition(raw, e.point) ?? raw;
  }

  function appendVertex(position: Position) {
    const unwrappedPosition = unwrapDrawPosition(position);
    const last = vertices.value[vertices.value.length - 1];
    if (last && isZeroLengthSegment(last, unwrappedPosition)) return;
    vertices.value = [...vertices.value, unwrappedPosition];
  }

  function unwrapDrawPosition(position: Position): Position {
    const last = vertices.value[vertices.value.length - 1];
    return last ? unwrapPositionRelative(last, position) : position;
  }

  function finishDrawing() {
    const type = unref(measurementTypeRef);
    const coordinates = normalizePathCoordinates(vertices.value);
    if (type === "LineString" && coordinates.length >= 2) {
      measurements.value = [
        ...measurements.value,
        { id: nextMeasurementId(), geometry: lineString(coordinates).geometry },
      ];
    }
    if (type === "Polygon" && coordinates.length >= 3) {
      measurements.value = [
        ...measurements.value,
        { id: nextMeasurementId(), geometry: polygon([closeRing(coordinates)]).geometry },
      ];
    }
    cancelDrawing();
    render();
  }

  function cancelDrawing() {
    drawInProgress = false;
    vertices.value = [];
    activePointer = null;
    touchDoubleTap.reset();
  }

  function clear() {
    measurements.value = [];
    cancelDrawing();
    if (disposed) return;
    render();
  }

  function setActive(enabled: boolean) {
    if (!enabled) {
      cancelDrawing();
      dragState = null;
      mlMap.getCanvas().style.cursor = "";
    } else {
      mlMap.getCanvas().style.cursor = "crosshair";
    }
    render();
  }

  function render() {
    if (disposed) return;
    ensureLayers();
    const renderedMeasurements = getRenderedMeasurements();
    const measurementFeatures = getMeasurementGeoJsonFeatures(renderedMeasurements);
    setSourceData(MEASUREMENT_SOURCE_ID, featureCollection(measurementFeatures));
    setSourceData(
      MEASUREMENT_LABEL_SOURCE_ID,
      featureCollection(getLabelFeatures(renderedMeasurements)),
    );
    setSourceData(
      MEASUREMENT_HANDLE_SOURCE_ID,
      featureCollection(getHandleFeatures(renderedMeasurements)),
    );
  }

  function getRenderedMeasurements(): MeasurementFeature[] {
    if (!dragState || dragState.kind !== "midpoint" || !dragState.position) {
      return measurements.value;
    }
    const { measurementId, path, position } = dragState;
    return measurements.value.map((measurement) => {
      if (measurement.id !== measurementId) return measurement;
      return {
        ...measurement,
        geometry: insertVertexAtPath(measurement.geometry, path, position),
      };
    });
  }

  function getMeasurementGeoJsonFeatures(
    renderedMeasurements: MeasurementFeature[],
  ): GeoJsonFeature[] {
    const features: GeoJsonFeature[] = renderedMeasurements.map((measurement) => ({
      type: "Feature",
      id: measurement.id,
      geometry: measurement.geometry,
      properties: { kind: "measurement" },
    }));
    const preview = getPreviewGeometry();
    if (preview) {
      features.push({
        type: "Feature",
        id: "preview",
        geometry: preview,
        properties: { kind: "preview" },
      });
    }
    const circle = getRangeCircleGeometry();
    if (circle) {
      features.push({
        type: "Feature",
        id: "range-circle",
        geometry: circle,
        properties: { kind: "range-circle" },
      });
    }
    return features;
  }

  function getPreviewGeometry(): Geometry | null {
    if (!drawInProgress) return null;
    const pointer = activePointer;
    const coordinates = pointer ? [...vertices.value, pointer] : vertices.value;
    const pathCoordinates = normalizePathCoordinates(coordinates);
    if (unref(measurementTypeRef) === "LineString" && pathCoordinates.length >= 2) {
      return lineString(pathCoordinates).geometry;
    }
    if (unref(measurementTypeRef) === "Polygon") {
      if (pathCoordinates.length >= 3)
        return polygon([closeRing(pathCoordinates)]).geometry;
      if (pathCoordinates.length >= 2) return lineString(pathCoordinates).geometry;
    }
    if (coordinates.length === 1) return point(coordinates[0]).geometry;
    return null;
  }

  function getRangeCircleGeometry(): Polygon | null {
    if (
      !drawInProgress ||
      unref(measurementTypeRef) !== "LineString" ||
      !unref(showCircleRef) ||
      vertices.value.length < 1
    ) {
      return null;
    }
    const endpoints = getRangeCircleEndpoints();
    if (!endpoints) return null;
    const radius = turfLength(lineString([endpoints.center, endpoints.edge]), {
      units: "kilometers",
    });
    if (radius === 0) return null;
    return turfCircle(endpoints.center, radius, {
      steps: 128,
      units: "kilometers",
    }).geometry;
  }

  function getRangeCircleEndpoints(): { center: Position; edge: Position } | null {
    const lastVertex = vertices.value[vertices.value.length - 1]!;
    const previousVertex = getPreviousDistinctVertex(
      vertices.value,
      vertices.value.length - 1,
    );
    if (!activePointer) {
      return previousVertex ? { center: previousVertex, edge: lastVertex } : null;
    }
    if (previousVertex && isZeroLengthSegment(lastVertex, activePointer)) {
      return { center: previousVertex, edge: lastVertex };
    }
    return isZeroLengthSegment(lastVertex, activePointer)
      ? null
      : { center: lastVertex, edge: activePointer };
  }

  function getLabelFeatures(
    renderedMeasurements: MeasurementFeature[],
  ): GeoJsonFeature<Point, LabelProperties>[] {
    const features: GeoJsonFeature<Point, LabelProperties>[] = [];
    const allMeasurements = [...renderedMeasurements];
    const preview = getPreviewGeometry();
    if (preview?.type === "LineString" || preview?.type === "Polygon") {
      allMeasurements.push({ id: "preview", geometry: preview });
    }

    for (const measurement of allMeasurements) {
      features.push(...getLabelsForGeometry(measurement.geometry));
    }
    return features;
  }

  function getLabelsForGeometry(
    geometry: LineString | Polygon,
  ): GeoJsonFeature<Point, LabelProperties>[] {
    const features: GeoJsonFeature<Point, LabelProperties>[] = [];
    const measurementUnit = toValue(measurementUnitRef) as MeasurementUnit;
    const lineCoordinates =
      geometry.type === "Polygon" ? geometry.coordinates[0] : geometry.coordinates;
    if (geometry.type === "LineString") {
      const last = geometry.coordinates[geometry.coordinates.length - 1];
      if (last) {
        features.push({
          type: "Feature",
          geometry: point(last).geometry,
          properties: {
            text: formatLength(
              turfLength(
                { type: "Feature", geometry, properties: {} },
                { units: "kilometers" },
              ) * 1000,
              measurementUnit,
            ),
            kind: "total",
          },
        });
      }
    } else {
      features.push({
        type: "Feature",
        geometry: centerOfMass({ type: "Feature", geometry, properties: {} }).geometry,
        properties: {
          text: formatArea(
            turfArea({ type: "Feature", geometry, properties: {} }),
            measurementUnit,
          ),
          kind: "total",
        },
      });
    }

    if (unref(showSegmentsRef) && lineCoordinates.length > 2) {
      for (let index = 0; index < lineCoordinates.length - 1; index += 1) {
        const a = lineCoordinates[index]!;
        const b = lineCoordinates[index + 1]!;
        if (isZeroLengthSegment(a, b)) continue;
        features.push({
          type: "Feature",
          geometry: point(midpoint(a, b)).geometry,
          properties: {
            text: formatLength(
              turfLength(lineString([a, b]), { units: "kilometers" }) * 1000,
              measurementUnit,
            ),
            kind: "segment",
          },
        });
      }
    }
    return features;
  }

  function getHandleFeatures(
    renderedMeasurements: MeasurementFeature[],
  ): GeoJsonFeature<Point>[] {
    if (!unref(enableRef) || drawInProgress) return [];
    return renderedMeasurements.flatMap((measurement) =>
      getVertexHandles(measurement).map((handle) => ({
        type: "Feature" as const,
        geometry: point(handle.position).geometry,
        properties: {
          measurementId: measurement.id,
          kind: handle.kind,
          path: encodePath(handle.path),
        },
      })),
    );
  }

  function getTopHandle(
    pointLike: PointLike,
  ): { measurementId: string; kind: EditHandle["kind"]; path: number[] } | null {
    const hits = mlMap.queryRenderedFeatures(pointLike, {
      layers: [MEASUREMENT_HANDLE_LAYER_ID],
    });
    const hit = hits[0];
    if (!hit?.properties?.measurementId || !hit.properties.path) return null;
    return {
      measurementId: String(hit.properties.measurementId),
      kind: hit.properties.kind === "midpoint" ? "midpoint" : "vertex",
      path: decodePath(hit.properties.path),
    };
  }

  function updateDraggedVertex(position: Position) {
    if (!dragState) return;
    if (dragState.kind === "midpoint") {
      dragState.position = position;
      return;
    }
    measurements.value = measurements.value.map((measurement) => {
      if (measurement.id !== dragState?.measurementId) return measurement;
      return {
        ...measurement,
        geometry: updateVertexAtPath(measurement.geometry, dragState.path, position),
      };
    });
  }

  function commitDraggedVertex() {
    if (!dragState || dragState.kind !== "midpoint" || !dragState.position) return;
    const { measurementId, path, position } = dragState;
    measurements.value = measurements.value.map((measurement) => {
      if (measurement.id !== measurementId) return measurement;
      return {
        ...measurement,
        geometry: insertVertexAtPath(measurement.geometry, path, position),
      };
    });
  }

  function getSnapPosition(position: Position, pointLike: PointLike): Position | null {
    const renderedFeatures = mlMap.queryRenderedFeatures(pointLike).filter((feature) => {
      const layerId = feature.layer?.id;
      return (
        typeof layerId === "string" &&
        layerId.startsWith(GLOBE_SCENARIO_FEATURE_PREFIX) &&
        feature.geometry
      );
    });
    const projectedPointer = toXY(mlMap.project(position as [number, number]));
    const candidates = renderedFeatures.flatMap((feature) =>
      getSnapCandidates(feature.geometry, mlMap, projectedPointer),
    );
    let best: { position: Position; distance: number; rank: number } | null = null;
    for (const candidate of candidates) {
      const projectedCandidate = toXY(
        mlMap.project(candidate.position as [number, number]),
      );
      const distance = Math.hypot(
        projectedCandidate.x - projectedPointer.x,
        projectedCandidate.y - projectedPointer.y,
      );
      if (distance > SNAP_TOLERANCE_PX) continue;
      if (
        !best ||
        candidate.rank < best.rank ||
        (candidate.rank === best.rank && distance < best.distance)
      ) {
        best = { position: candidate.position, distance, rank: candidate.rank };
      }
    }
    return best?.position ?? null;
  }

  function ensureLayers(force = false) {
    if (layersInitialized && !force) return;
    ensureSource(MEASUREMENT_SOURCE_ID);
    ensureSource(MEASUREMENT_LABEL_SOURCE_ID);
    ensureSource(MEASUREMENT_HANDLE_SOURCE_ID);
    upsertLayer(MEASUREMENT_FILL_LAYER_ID, {
      id: MEASUREMENT_FILL_LAYER_ID,
      type: "fill",
      source: MEASUREMENT_SOURCE_ID,
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: { "fill-color": "rgba(255, 255, 255, 0.2)" },
    });
    upsertLayer(MEASUREMENT_LINE_BACK_LAYER_ID, {
      id: MEASUREMENT_LINE_BACK_LAYER_ID,
      type: "line",
      source: MEASUREMENT_SOURCE_ID,
      paint: { "line-color": "rgba(255, 255, 255, 0.7)", "line-width": 5 },
    });
    upsertLayer(MEASUREMENT_LINE_LAYER_ID, {
      id: MEASUREMENT_LINE_LAYER_ID,
      type: "line",
      source: MEASUREMENT_SOURCE_ID,
      paint: {
        "line-color": "rgb(0, 0, 0)",
        "line-width": 2,
        "line-dasharray": [5, 5],
      },
    });
    upsertLayer(MEASUREMENT_POINT_LAYER_ID, {
      id: MEASUREMENT_POINT_LAYER_ID,
      type: "circle",
      source: MEASUREMENT_SOURCE_ID,
      filter: ["==", ["geometry-type"], "Point"],
      paint: {
        "circle-radius": 5,
        "circle-color": "rgba(255, 255, 255, 0.2)",
        "circle-stroke-color": "rgba(0, 0, 0, 0.7)",
        "circle-stroke-width": 1,
      },
    });
    upsertLayer(MEASUREMENT_LABEL_LAYER_ID, {
      id: MEASUREMENT_LABEL_LAYER_ID,
      type: "symbol",
      source: MEASUREMENT_LABEL_SOURCE_ID,
      layout: {
        "text-field": ["get", "text"],
        "text-font": ["Noto Sans Regular"],
        "text-size": ["case", ["==", ["get", "kind"], "segment"], 12, 14],
        "text-offset": [0, -1.15],
        "text-anchor": "bottom",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "rgba(0, 0, 0, 0.7)",
        "text-halo-width": 8,
        "text-halo-blur": 0,
      },
    });
    upsertLayer(MEASUREMENT_HANDLE_LAYER_ID, {
      id: MEASUREMENT_HANDLE_LAYER_ID,
      type: "circle",
      source: MEASUREMENT_HANDLE_SOURCE_ID,
      paint: {
        "circle-radius": ["case", ["==", ["get", "kind"], "midpoint"], 4, 5],
        "circle-color": [
          "case",
          ["==", ["get", "kind"], "midpoint"],
          "rgba(255, 255, 255, 0.9)",
          "rgba(0, 0, 0, 0.4)",
        ],
        "circle-stroke-color": [
          "case",
          ["==", ["get", "kind"], "midpoint"],
          "rgba(0, 0, 0, 0.55)",
          "rgba(0, 0, 0, 0.7)",
        ],
        "circle-stroke-width": ["case", ["==", ["get", "kind"], "midpoint"], 2, 1],
      },
    });
    layersInitialized = true;
  }

  function cleanup() {
    disposed = true;
    mlMap.off("click", onClick);
    mlMap.off("dblclick", onDoubleClick);
    mlMap.off("mousemove", onMouseMove);
    mlMap.off("mousedown", onMouseDown);
    mlMap.off("touchstart", onMouseDown);
    mlMap.off("mouseup", onMouseUp);
    mlMap.off("touchend", onTouchEnd);
    mlMap.off("touchmove", onMouseMove);
    mlMap.off("touchcancel", onMouseUp);
    mlMap.off("style.load", onStyleLoad);
    cleanupEnter?.();
    removeLayersAndSources();
    layersInitialized = false;
    mlMap.getCanvas().style.cursor = "";
  }

  mlMap.on("click", onClick);
  mlMap.on("dblclick", onDoubleClick);
  mlMap.on("mousemove", onMouseMove);
  mlMap.on("mousedown", onMouseDown);
  mlMap.on("touchstart", onMouseDown);
  mlMap.on("mouseup", onMouseUp);
  mlMap.on("touchend", onTouchEnd);
  mlMap.on("touchmove", onMouseMove);
  mlMap.on("touchcancel", onMouseUp);
  mlMap.on("style.load", onStyleLoad);
  cleanupEnter = onKeyStroke("Enter", () => finishDrawing());
  ensureLayers();
  setActive(toValue(enableRef) as boolean);

  watch(measurementTypeRef, () => {
    cancelDrawing();
    render();
  });
  watch(showSegmentsRef, () => render());
  watch(measurementUnitRef, () => render(), { immediate: true });
  watch(showCircleRef, () => render());
  watch(enableRef, (enabled) => setActive(enabled), { immediate: true });

  tryOnBeforeUnmount(cleanup);

  return { clear, enabled: enableRef };

  function nextMeasurementId() {
    idCounter += 1;
    return `measurement-${idCounter}`;
  }

  function ensureSource(id: string) {
    if (!getSourceSafe(id)) {
      mlMap.addSource(id, {
        type: "geojson",
        data: featureCollection([]),
      });
    }
  }

  function setSourceData(id: string, data: FeatureCollection) {
    const source = getSourceSafe(id) as GeoJSONSource | undefined;
    source?.setData(data);
  }

  function upsertLayer(id: string, spec: Record<string, unknown>) {
    if (getLayerSafe(id)) return;
    mlMap.addLayer(spec as any);
  }

  function removeLayersAndSources() {
    for (const layerId of [
      MEASUREMENT_HANDLE_LAYER_ID,
      MEASUREMENT_LABEL_LAYER_ID,
      MEASUREMENT_POINT_LAYER_ID,
      MEASUREMENT_LINE_LAYER_ID,
      MEASUREMENT_LINE_BACK_LAYER_ID,
      MEASUREMENT_FILL_LAYER_ID,
    ]) {
      if (getLayerSafe(layerId)) mlMap.removeLayer(layerId);
    }
    for (const sourceId of [
      MEASUREMENT_HANDLE_SOURCE_ID,
      MEASUREMENT_LABEL_SOURCE_ID,
      MEASUREMENT_SOURCE_ID,
    ]) {
      if (getSourceSafe(sourceId)) mlMap.removeSource(sourceId);
    }
  }

  function getSourceSafe(id: string) {
    try {
      return mlMap.getSource(id);
    } catch {
      return undefined;
    }
  }

  function getLayerSafe(id: string) {
    try {
      return mlMap.getLayer(id);
    } catch {
      return undefined;
    }
  }
}

function encodePath(path: number[]) {
  return JSON.stringify(path);
}

function decodePath(path: unknown): number[] {
  return typeof path === "string" ? JSON.parse(path) : (path as number[]);
}

function getVertexHandles(measurement: MeasurementFeature): EditHandle[] {
  if (measurement.geometry.type === "LineString") {
    const coordinates = measurement.geometry.coordinates;
    const vertexHandles = coordinates.map((position, index) => ({
      kind: "vertex" as const,
      position,
      path: [index],
    }));
    const midpointHandles = coordinates.slice(0, -1).map(
      (position, index) =>
        ({
          kind: "midpoint" as const,
          position: midpoint(position, coordinates[index + 1]!),
          path: [index + 1],
        }) satisfies EditHandle,
    );
    return [...vertexHandles, ...midpointHandles];
  }
  const ring = measurement.geometry.coordinates[0];
  const vertexHandles = ring
    .slice(0, -1)
    .map((position, index) => ({ kind: "vertex" as const, position, path: [0, index] }));
  const midpointHandles = ring.slice(0, -1).map((position, index) => ({
    kind: "midpoint" as const,
    position: midpoint(position, ring[index + 1]!),
    path: [0, index + 1],
  }));
  return [...vertexHandles, ...midpointHandles];
}

function updateVertexAtPath(
  geometry: LineString | Polygon,
  path: number[],
  position: Position,
): LineString | Polygon {
  if (geometry.type === "LineString") {
    const coordinates = [...geometry.coordinates];
    coordinates[path[0]] = position;
    return { ...geometry, coordinates };
  }
  const coordinates = geometry.coordinates.map((ring) => [...ring]);
  coordinates[path[0]][path[1]] = position;
  if (path[1] === 0) coordinates[path[0]][coordinates[path[0]].length - 1] = position;
  return { ...geometry, coordinates };
}

function insertVertexAtPath(
  geometry: LineString | Polygon,
  path: number[],
  position: Position,
): LineString | Polygon {
  if (geometry.type === "LineString") {
    const coordinates = [...geometry.coordinates];
    coordinates.splice(path[0], 0, position);
    return { ...geometry, coordinates };
  }
  const coordinates = geometry.coordinates.map((ring) => [...ring]);
  coordinates[path[0]].splice(path[1], 0, position);
  return { ...geometry, coordinates };
}

function getSnapCandidates(
  geometry: Geometry,
  mlMap: MlMap,
  projectedPointer: { x: number; y: number },
): Array<{ position: Position; rank: number }> {
  const vertices: Array<{ position: Position; rank: number }> = [];
  const segments: Array<{ position: Position; rank: number }> = [];
  visitGeometryLines(geometry, (coordinates) => {
    coordinates.forEach((coordinate) => vertices.push({ position: coordinate, rank: 0 }));
    for (let index = 0; index < coordinates.length - 1; index += 1) {
      const a = coordinates[index]!;
      const b = coordinates[index + 1]!;
      segments.push({
        position: closestRenderedSegmentPosition(mlMap, projectedPointer, a, b),
        rank: 1,
      });
    }
  });
  return [...vertices, ...segments];
}

function closestRenderedSegmentPosition(
  mlMap: MlMap,
  projectedPointer: { x: number; y: number },
  a: Position,
  b: Position,
): Position {
  const projectedA = toXY(mlMap.project(a as [number, number]));
  const projectedB = toXY(mlMap.project(b as [number, number]));
  const dx = projectedB.x - projectedA.x;
  const dy = projectedB.y - projectedA.y;
  const lengthSquared = dx * dx + dy * dy;
  const ratio =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((projectedPointer.x - projectedA.x) * dx +
              (projectedPointer.y - projectedA.y) * dy) /
              lengthSquared,
          ),
        );
  return [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio];
}

function visitGeometryLines(
  geometry: Geometry,
  visit: (coordinates: Position[]) => void,
) {
  if (geometry.type === "LineString" || geometry.type === "MultiPoint") {
    visit(geometry.coordinates);
  } else if (geometry.type === "Polygon" || geometry.type === "MultiLineString") {
    geometry.coordinates.forEach(visit);
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((poly) => poly.forEach(visit));
  } else if (geometry.type === "Point") {
    visit([geometry.coordinates]);
  } else if (geometry.type === "GeometryCollection") {
    geometry.geometries.forEach((child) => visitGeometryLines(child, visit));
  }
}

function closeRing(coordinates: Position[]): Position[] {
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first && last && isZeroLengthSegment(first, last)) return coordinates;
  return first ? [...coordinates, [...first]] : coordinates;
}

function midpoint(a: Position, b: Position): Position {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function toXY(pointLike: { x: number; y: number } | { 0: number; 1: number }) {
  if ("x" in pointLike) return pointLike;
  return { x: pointLike[0], y: pointLike[1] };
}

function suspendMapDragInteractions(mlMap: MlMap): MapDragInteractionState {
  const dragPanEnabled = mlMap.dragPan.isEnabled();
  const touchZoomRotateEnabled = mlMap.touchZoomRotate.isEnabled();
  const doubleClickZoomEnabled = mlMap.doubleClickZoom.isEnabled();
  if (dragPanEnabled) mlMap.dragPan.disable();
  if (touchZoomRotateEnabled) mlMap.touchZoomRotate.disable();
  if (doubleClickZoomEnabled) mlMap.doubleClickZoom.disable();
  return { dragPanEnabled, touchZoomRotateEnabled, doubleClickZoomEnabled };
}

function restoreMapDragInteractions(mlMap: MlMap, state: MapDragInteractionState) {
  if (state.dragPanEnabled && !mlMap.dragPan.isEnabled()) mlMap.dragPan.enable();
  if (state.touchZoomRotateEnabled && !mlMap.touchZoomRotate.isEnabled()) {
    mlMap.touchZoomRotate.enable();
  }
  if (state.doubleClickZoomEnabled && !mlMap.doubleClickZoom.isEnabled()) {
    mlMap.doubleClickZoom.enable();
  }
}
