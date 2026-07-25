import type {
  GeoJSONSource,
  MapLayerMouseEvent,
  MapMouseEvent,
  Map as MlMap,
} from "maplibre-gl";
import type {
  Feature as GeoJsonFeature,
  FeatureCollection,
  LineString as GeoJsonLineString,
} from "geojson";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import { distanceMeters } from "@/geo/distance";
import type { TScenario } from "@/scenariostore";
import type { LegSegmentMeta, LegVertexMeta } from "@/geo/history";
import {
  createArcCoords,
  createUnitPathGeoJson,
  findClosestLegSegment,
} from "@/geo/history";
import { unwindCoordinates, wrapLongitude } from "@/geo/longitude";
import { getRenderedMidpoint } from "@/geo/maplibreMidpoint";
import { useSelectedItems } from "@/stores/selectedStore";
import { useSelectedWaypoints } from "@/stores/selectedWaypoints";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { convertSpeedToMetric } from "@/utils/convert";

const ARC_SOURCE_ID = "unitHistoryArcSource";
const LEG_SOURCE_ID = "unitHistoryLegSource";
const WAYPOINT_SOURCE_ID = "unitHistoryWaypointSource";
const VIA_SOURCE_ID = "unitHistoryViaSource";
const MIDPOINT_SOURCE_ID = "unitHistoryLegMidpointSource";

const ARC_LAYER_ID = "unitHistoryArcLayer";
const LEG_LAYER_ID = "unitHistoryLegLayer";
export const WAYPOINT_LAYER_ID = "unitHistoryWaypointLayer";
const WAYPOINT_LABEL_LAYER_ID = "unitHistoryWaypointLabelLayer";
export const VIA_LAYER_ID = "unitHistoryViaLayer";
const MIDPOINT_LAYER_ID = "unitHistoryLegMidpointLayer";

export const UNIT_HISTORY_LAYER_IDS = [
  ARC_LAYER_ID,
  LEG_LAYER_ID,
  MIDPOINT_LAYER_ID,
  VIA_LAYER_ID,
  WAYPOINT_LAYER_ID,
  WAYPOINT_LABEL_LAYER_ID,
];

// The handle circles are small, so a single-pixel query is nearly impossible to
// hit. Buffer the press into a small box, as the draw interaction does.
const HANDLE_HIT_TOLERANCE_PX = 12;
const TOUCH_HANDLE_HIT_TOLERANCE_PX = 26;

const coarsePointerQuery =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(pointer: coarse)")
    : null;

const EMPTY_FC: FeatureCollection = { type: "FeatureCollection", features: [] };

export function useMaplibreUnitHistory(mlMap: MlMap, activeScenario: TScenario) {
  const { geo, unitActions } = activeScenario;
  const state = activeScenario.store.state;
  const getUnitById = (id: string) => activeScenario.helpers?.getUnitById(id);

  const { selectedUnitIds } = useSelectedItems();
  const { selectedWaypointIds } = useSelectedWaypoints();
  selectedWaypointIds.value.clear();
  const unitSettings = useUnitSettingsStore();
  const { showHistory, editHistory, showWaypointTimestamps } = storeToRefs(unitSettings);
  const fmt = useTimeFormatStore();

  const appliedWaypointStates = new Set<string>();
  let waypointFeatureCollection: FeatureCollection = EMPTY_FC;
  let viaFeatureCollection: FeatureCollection = EMPTY_FC;
  // Kept so a mousedown on a leg can be resolved to the segment that was
  // grabbed, without reading MapLibre source internals.
  let legFeatures: GeoJsonFeature<GeoJsonLineString>[] = [];
  type DragState = {
    source: "waypoint" | "via";
    // Identifies the dragged feature in the rendered collection, for the preview.
    matches: (feature: GeoJsonFeature) => boolean;
    // Identifies the leg coordinate to rewrite, so the line follows the cursor.
    matchesVertex: (vertex: LegVertexMeta) => boolean;
    commit: (lngLat: [number, number]) => void;
  };
  let dragState: DragState | null = null;

  function setupUnitHistoryLayers(beforeLayerId?: string) {
    for (const id of [ARC_SOURCE_ID, LEG_SOURCE_ID]) {
      if (!mlMap.getSource(id)) {
        mlMap.addSource(id, { type: "geojson", data: EMPTY_FC });
      }
    }
    if (!mlMap.getSource(WAYPOINT_SOURCE_ID)) {
      // MapLibre coerces top-level GeoJSON feature ids with parseInt, which turns
      // our nanoid waypoint ids into NaN. Promoting the id from a property keeps
      // it intact for queryRenderedFeatures and feature state.
      mlMap.addSource(WAYPOINT_SOURCE_ID, {
        type: "geojson",
        data: waypointFeatureCollection,
        promoteId: "waypointId",
      });
    }
    if (!mlMap.getSource(VIA_SOURCE_ID)) {
      mlMap.addSource(VIA_SOURCE_ID, { type: "geojson", data: viaFeatureCollection });
    }
    if (!mlMap.getSource(MIDPOINT_SOURCE_ID)) {
      mlMap.addSource(MIDPOINT_SOURCE_ID, { type: "geojson", data: EMPTY_FC });
    }
    if (!mlMap.getLayer(ARC_LAYER_ID)) {
      mlMap.addLayer(
        {
          id: ARC_LAYER_ID,
          type: "line",
          source: ARC_SOURCE_ID,
          paint: {
            "line-color": "rgba(255,0,0,0.65)",
            "line-width": 2,
          },
        },
        beforeLayerId,
      );
    }
    if (!mlMap.getLayer(LEG_LAYER_ID)) {
      mlMap.addLayer(
        {
          id: LEG_LAYER_ID,
          type: "line",
          source: LEG_SOURCE_ID,
          paint: {
            "line-color": "rgba(255,0,0,0.65)",
            "line-width": 2,
          },
        },
        beforeLayerId,
      );
    }
    if (!mlMap.getLayer(MIDPOINT_LAYER_ID)) {
      // Same gesture as the midpoint handles of the feature draw editor, but
      // muted so they read as hints rather than competing with the real points.
      mlMap.addLayer(
        {
          id: MIDPOINT_LAYER_ID,
          type: "circle",
          source: MIDPOINT_SOURCE_ID,
          paint: {
            "circle-radius": 4,
            "circle-color": "#ffffff",
            "circle-opacity": 0.5,
            "circle-stroke-color": "#475569",
            "circle-stroke-width": 1,
            "circle-stroke-opacity": 0.5,
          },
        },
        beforeLayerId,
      );
    }
    if (!mlMap.getLayer(VIA_LAYER_ID)) {
      mlMap.addLayer(
        {
          id: VIA_LAYER_ID,
          type: "circle",
          source: VIA_SOURCE_ID,
          paint: {
            "circle-radius": 4,
            "circle-color": "rgba(101,213,57,0.73)",
            "circle-stroke-color": "green",
            "circle-stroke-width": 1,
          },
        },
        beforeLayerId,
      );
    }
    if (!mlMap.getLayer(WAYPOINT_LAYER_ID)) {
      mlMap.addLayer(
        {
          id: WAYPOINT_LAYER_ID,
          type: "circle",
          source: WAYPOINT_SOURCE_ID,
          paint: {
            "circle-radius": 5,
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "red",
              "orange",
            ],
            "circle-stroke-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "yellow",
              "green",
            ],
            "circle-stroke-width": 3,
          },
        },
        beforeLayerId,
      );
    }
    if (!mlMap.getLayer(WAYPOINT_LABEL_LAYER_ID)) {
      mlMap.addLayer(
        {
          id: WAYPOINT_LABEL_LAYER_ID,
          type: "symbol",
          source: WAYPOINT_SOURCE_ID,
          layout: {
            "text-field": ["get", "label"],
            "text-font": ["Noto Sans Italic"],
            "text-offset": [1, -1],
            "text-anchor": "left",
            "text-size": 12,
            "text-allow-overlap": false,
            "text-optional": true,
            "text-ignore-placement": false,
          },
          paint: {
            "text-color": "#aa3300",
            "text-halo-color": "white",
            "text-halo-width": 2,
          },
        },
        beforeLayerId,
      );
    }
    applyVisibility();
  }

  function applyVisibility() {
    const set = (layerId: string, visible: boolean) => {
      if (!mlMap.getLayer(layerId)) return;
      mlMap.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    };
    const base = showHistory.value;
    set(ARC_LAYER_ID, base);
    set(LEG_LAYER_ID, base && editHistory.value);
    set(MIDPOINT_LAYER_ID, base && editHistory.value);
    set(VIA_LAYER_ID, base);
    set(WAYPOINT_LAYER_ID, base);
    set(WAYPOINT_LABEL_LAYER_ID, base && showWaypointTimestamps.value);
    if (mlMap.getLayer(ARC_LAYER_ID)) {
      mlMap.setPaintProperty(ARC_LAYER_ID, "line-opacity", editHistory.value ? 0.4 : 1);
    }
  }

  function clearWaypointFeatureStates() {
    for (const id of appliedWaypointStates) {
      try {
        mlMap.removeFeatureState({ source: WAYPOINT_SOURCE_ID, id });
      } catch {
        // source may be gone during style reload
      }
    }
    appliedWaypointStates.clear();
  }

  function applyWaypointFeatureStates() {
    clearWaypointFeatureStates();
    selectedWaypointIds.value.forEach((id) => {
      try {
        mlMap.setFeatureState({ source: WAYPOINT_SOURCE_ID, id }, { selected: true });
        appliedWaypointStates.add(id);
      } catch {
        // source may be gone during style reload
      }
    });
  }

  // Keeps our own copy of the rendered points so the drag preview can rewrite a
  // single coordinate without reading MapLibre source internals.
  function setWaypointData(source: GeoJSONSource, features: GeoJsonFeature[]) {
    waypointFeatureCollection = { type: "FeatureCollection", features };
    source.setData(waypointFeatureCollection);
  }

  function setViaData(source: GeoJSONSource, features: GeoJsonFeature[]) {
    viaFeatureCollection = { type: "FeatureCollection", features };
    source.setData(viaFeatureCollection);
  }

  function getWaypointId(feature: {
    id?: string | number;
    properties?: Record<string, unknown> | null;
  }): string | undefined {
    const id = feature.properties?.waypointId ?? feature.id;
    return typeof id === "string" ? id : undefined;
  }

  function drawHistory() {
    const arcSource = mlMap.getSource(ARC_SOURCE_ID) as GeoJSONSource | undefined;
    const legSource = mlMap.getSource(LEG_SOURCE_ID) as GeoJSONSource | undefined;
    const waypointSource = mlMap.getSource(WAYPOINT_SOURCE_ID) as
      | GeoJSONSource
      | undefined;
    const viaSource = mlMap.getSource(VIA_SOURCE_ID) as GeoJSONSource | undefined;
    if (!arcSource || !legSource || !waypointSource || !viaSource) return;

    applyVisibility();

    if (!showHistory.value) {
      arcSource.setData({ type: "FeatureCollection", features: [] });
      legFeatures = [];
      legSource.setData({ type: "FeatureCollection", features: [] });
      setWaypointData(waypointSource, []);
      setViaData(viaSource, []);
      drawMidpointHandles();
      clearWaypointFeatureStates();
      return;
    }

    const allArcs: any[] = [];
    const allLegs: any[] = [];
    const allWaypoints: any[] = [];
    const allVia: any[] = [];
    selectedUnitIds.value.forEach((unitId) => {
      const unit = getUnitById(unitId);
      if (!unit?._state?.location) return;
      const path = createUnitPathGeoJson(unit);
      allArcs.push(...path.arcs);
      if (editHistory.value) allLegs.push(...path.legs);
      allWaypoints.push(...path.waypoints);
      allVia.push(...path.viaPoints);
    });

    arcSource.setData({ type: "FeatureCollection", features: allArcs });
    legFeatures = allLegs;
    legSource.setData({ type: "FeatureCollection", features: allLegs });
    setWaypointData(waypointSource, allWaypoints);
    setViaData(viaSource, allVia);
    drawMidpointHandles();

    applyWaypointFeatureStates();
  }

  /**
   * One handle per leg segment, placed at the segment's on-screen midpoint.
   * Dragging one inserts a via point there, mirroring how the draw interaction
   * adds a vertex to a line.
   */
  function drawMidpointHandles() {
    const source = mlMap.getSource(MIDPOINT_SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;
    if (!showHistory.value || !editHistory.value || legFeatures.length === 0) {
      source.setData(EMPTY_FC);
      return;
    }
    const features: GeoJsonFeature[] = [];
    for (const leg of legFeatures) {
      const unitId = leg.properties?.unitId as string | undefined;
      const segments = leg.properties?.segments as LegSegmentMeta[] | undefined;
      const coordinates = leg.geometry?.coordinates ?? [];
      if (!segments) continue;
      for (let i = 0; i < coordinates.length - 1; i++) {
        const meta = segments[i];
        if (!meta) continue;
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: getRenderedMidpoint(mlMap, coordinates[i]!, coordinates[i + 1]!),
          },
          properties: { unitId, stateIndex: meta.stateIndex, viaIndex: meta.viaIndex },
        });
      }
    }
    source.setData({ type: "FeatureCollection", features });
  }

  function queryLayer(point: MapMouseEvent["point"], layerId: string) {
    if (!mlMap.getLayer(layerId)) return [];
    return mlMap
      .queryRenderedFeatures(point, { layers: [layerId] })
      .filter((f) => f.layer?.id === layerId);
  }

  /**
   * True for the modifier combination that appends a waypoint on click. The
   * press handlers use it to keep out of the way, so a ctrl-click near a leg
   * does not also insert a via point.
   */
  function isAddWaypointModifier(e: MouseEvent): boolean {
    return (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey;
  }

  /**
   * MapLibre reports a press of any button as `mousedown`, so the edit handlers
   * have to keep out of the way of the right click that opens the context menu.
   */
  function isPrimaryButton(e: MapMouseEvent): boolean {
    return (e.originalEvent?.button ?? 0) === 0;
  }

  function handleCtrlClick(e: MapMouseEvent): boolean {
    if (selectedUnitIds.value.size === 0) return false;
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    selectedUnitIds.value.forEach((unitId) => {
      const unit = getUnitById(unitId);
      if (!unit) return;
      const lastLocationEntry = unit.state?.filter((s) => s.location).pop();
      let newTime: number | undefined;
      if (lastLocationEntry) {
        const { location, t } = lastLocationEntry;
        const travelDistance = distanceMeters(location!, lngLat);
        const speedValue = unit.properties?.averageSpeed || unit.properties?.maxSpeed;
        const speed = speedValue
          ? convertSpeedToMetric(speedValue.value, speedValue.uom)
          : convertSpeedToMetric(30, "km/h");
        const travel = travelDistance / speed;
        newTime = Math.round(t + travel * 1000);
      }
      geo.addUnitPosition(unitId, lngLat, newTime);
    });
    drawHistory();
    return true;
  }

  /**
   * Handles a map click. Returns true if the history system consumed the event
   * so the caller can skip its own click handling.
   */
  function handleMapClick(e: MapMouseEvent): boolean {
    if (!showHistory.value) return false;
    const originalEvent = e.originalEvent;
    const isCtrl = isAddWaypointModifier(originalEvent);
    const isAlt = originalEvent.altKey && !originalEvent.shiftKey;
    const hits = queryLayer(e.point, WAYPOINT_LAYER_ID);
    if (hits.length > 0) {
      const feature = hits[0];
      const unitId = feature.properties?.unitId as string | undefined;
      const waypointId = getWaypointId(feature);
      const stateIndex = (feature.properties?.stateIndex as number) ?? -1;
      const isInitial = feature.properties?.isInitial === true;

      if (isAlt) {
        if (unitId && !isInitial && stateIndex >= 0) {
          unitActions.deleteUnitStateEntry(unitId, stateIndex);
          drawHistory();
        }
        return true;
      }
      if (waypointId) {
        if (selectedWaypointIds.value.has(waypointId)) {
          selectedWaypointIds.value.delete(waypointId);
        } else {
          selectedWaypointIds.value.add(waypointId);
        }
        applyWaypointFeatureStates();
      }
      return true;
    }

    if (isAlt && editHistory.value) {
      const viaHits = queryLayer(e.point, VIA_LAYER_ID);
      const viaFeature = viaHits[0];
      if (viaFeature) {
        const unitId = viaFeature.properties?.unitId as string | undefined;
        const stateIndex = viaFeature.properties?.stateIndex as number | undefined;
        const viaIndex = viaFeature.properties?.viaIndex as number | undefined;
        if (
          unitId &&
          stateIndex !== undefined &&
          stateIndex >= 0 &&
          viaIndex !== undefined &&
          viaIndex >= 0
        ) {
          unitActions.updateUnitStateVia(unitId, "remove", stateIndex, viaIndex, [
            e.lngLat.lng,
            e.lngLat.lat,
          ]);
          unitActions.updateUnitState(unitId);
          drawHistory();
        }
        return true;
      }
    }

    if (isCtrl) return handleCtrlClick(e);
    return false;
  }

  function startDrag(e: MapMouseEvent, drag: DragState) {
    e.preventDefault();
    dragState = drag;
    mlMap.getCanvas().style.cursor = "grabbing";
    mlMap.on("mousemove", onDragMove);
    mlMap.once("mouseup", onDragEnd);
  }

  function onWaypointMouseDown(e: MapLayerMouseEvent) {
    if (!editHistory.value || !isPrimaryButton(e)) return;
    const feature = e.features?.[0];
    if (!feature) return;
    const unitId = feature.properties?.unitId as string | undefined;
    const waypointId = getWaypointId(feature);
    const t = feature.properties?.t as number | undefined;
    const isInitial = feature.properties?.isInitial === true;
    const stateIndex = feature.properties?.stateIndex as number | undefined;
    // The initial waypoint is the unit's own location, so it has no state id.
    if (!unitId || t === undefined || (!waypointId && !isInitial)) return;

    startDrag(e, {
      source: "waypoint",
      matches: (f) =>
        isInitial
          ? f.properties?.isInitial === true && f.properties?.unitId === unitId
          : getWaypointId(f) === waypointId,
      matchesVertex: (v) =>
        v.viaIndex === undefined &&
        (isInitial ? v.isInitial === true : v.stateIndex === stateIndex),
      commit: (lngLat) => {
        if (isInitial) {
          unitActions.updateUnit(unitId, { location: lngLat });
          unitActions.updateUnitState(unitId);
        } else {
          geo.addUnitPosition(unitId, lngLat, t);
        }
      },
    });
  }

  function onViaMouseDown(e: MapLayerMouseEvent) {
    // A waypoint drawn on top of a via point wins; its handler runs first.
    if (!editHistory.value || dragState || !isPrimaryButton(e)) return;
    // Alt-click removes the via point, so it must not start a drag.
    if (e.originalEvent.altKey) return;
    // Ctrl-click appends a waypoint instead.
    if (isAddWaypointModifier(e.originalEvent)) return;
    const feature = e.features?.[0];
    if (!feature) return;
    const unitId = feature.properties?.unitId as string | undefined;
    const stateIndex = feature.properties?.stateIndex as number | undefined;
    const viaIndex = feature.properties?.viaIndex as number | undefined;
    if (!unitId || stateIndex === undefined || stateIndex < 0 || viaIndex === undefined) {
      return;
    }

    startDrag(e, {
      source: "via",
      matches: (f) =>
        f.properties?.unitId === unitId &&
        f.properties?.stateIndex === stateIndex &&
        f.properties?.viaIndex === viaIndex,
      matchesVertex: (v) => v.stateIndex === stateIndex && v.viaIndex === viaIndex,
      commit: (lngLat) => {
        unitActions.updateUnitStateVia(unitId, "modify", stateIndex, viaIndex, lngLat);
        unitActions.updateUnitState(unitId);
      },
    });
  }

  /**
   * Grabbing the middle of a leg segment inserts a new via point there and
   * starts dragging it, like the OpenLayers Modify interaction does.
   */
  function onLegMouseDown(e: MapLayerMouseEvent) {
    if (!editHistory.value || dragState || !isPrimaryButton(e)) return;
    // Alt-click is reserved for deleting points.
    if (e.originalEvent.altKey) return;
    // Ctrl-click appends a waypoint, so it must not also insert a via point.
    if (isAddWaypointModifier(e.originalEvent)) return;
    // Existing points win over the line they are drawn on.
    if (
      queryLayer(e.point, WAYPOINT_LAYER_ID).length > 0 ||
      queryLayer(e.point, VIA_LAYER_ID).length > 0
    ) {
      return;
    }
    const unitId = e.features?.[0]?.properties?.unitId as string | undefined;
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    const hit = findClosestLegSegment(legFeatures, lngLat, unitId);
    if (!hit?.unitId || hit.stateIndex < 0) return;
    const { unitId: hitUnitId, stateIndex, viaIndex } = hit;

    unitActions.updateUnitStateVia(hitUnitId, "add", stateIndex, viaIndex, lngLat);
    unitActions.updateUnitState(hitUnitId);
    drawHistory();

    startDrag(e, {
      source: "via",
      matches: (f) =>
        f.properties?.unitId === hitUnitId &&
        f.properties?.stateIndex === stateIndex &&
        f.properties?.viaIndex === viaIndex,
      matchesVertex: (v) => v.stateIndex === stateIndex && v.viaIndex === viaIndex,
      commit: (position) => {
        unitActions.updateUnitStateVia(
          hitUnitId,
          "modify",
          stateIndex,
          viaIndex,
          position,
        );
        unitActions.updateUnitState(hitUnitId);
      },
    });
  }

  function getHandleHitTolerance(e: MapMouseEvent): number {
    const isTouch =
      (e.originalEvent?.type?.startsWith("touch") ?? false) ||
      (coarsePointerQuery?.matches ?? false);
    return isTouch ? TOUCH_HANDLE_HIT_TOLERANCE_PX : HANDLE_HIT_TOLERANCE_PX;
  }

  /**
   * Dragging a midpoint handle inserts a via point at that segment. Runs off a
   * map-level mousedown so the press can be buffered into a tolerance box
   * instead of having to land on the 4px circle exactly.
   */
  function onMapMouseDown(e: MapMouseEvent) {
    if (!showHistory.value || !editHistory.value || dragState) return;
    if (!isPrimaryButton(e)) return;
    if (e.originalEvent.altKey) return;
    // Ctrl-click appends a waypoint, so it must not also insert a via point.
    if (isAddWaypointModifier(e.originalEvent)) return;
    if (!mlMap.getLayer(MIDPOINT_LAYER_ID)) return;
    // Existing points win over the handle between them.
    if (
      queryLayer(e.point, WAYPOINT_LAYER_ID).length > 0 ||
      queryLayer(e.point, VIA_LAYER_ID).length > 0
    ) {
      return;
    }
    const tolerance = getHandleHitTolerance(e);
    const { x, y } = e.point;
    const hits = mlMap.queryRenderedFeatures(
      [
        [x - tolerance, y - tolerance],
        [x + tolerance, y + tolerance],
      ],
      { layers: [MIDPOINT_LAYER_ID] },
    );
    if (hits.length === 0) return;
    const closest = hits.reduce((best, feature) => {
      const distance = (f: (typeof hits)[number]) => {
        const coordinates = (f.geometry as { coordinates?: [number, number] })
          .coordinates;
        if (!coordinates) return Number.POSITIVE_INFINITY;
        const projected = mlMap.project(coordinates);
        return Math.hypot(projected.x - x, projected.y - y);
      };
      return distance(feature) < distance(best) ? feature : best;
    }, hits[0]!);

    const unitId = closest.properties?.unitId as string | undefined;
    const stateIndex = closest.properties?.stateIndex as number | undefined;
    const viaIndex = closest.properties?.viaIndex as number | undefined;
    if (!unitId || stateIndex === undefined || stateIndex < 0 || viaIndex === undefined) {
      return;
    }

    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    unitActions.updateUnitStateVia(unitId, "add", stateIndex, viaIndex, lngLat);
    unitActions.updateUnitState(unitId);
    drawHistory();

    startDrag(e, {
      source: "via",
      matches: (f) =>
        f.properties?.unitId === unitId &&
        f.properties?.stateIndex === stateIndex &&
        f.properties?.viaIndex === viaIndex,
      matchesVertex: (v) => v.stateIndex === stateIndex && v.viaIndex === viaIndex,
      commit: (position) => {
        unitActions.updateUnitStateVia(unitId, "modify", stateIndex, viaIndex, position);
        unitActions.updateUnitState(unitId);
      },
    });
  }

  function onDragMove(e: MapMouseEvent) {
    if (!dragState) return;
    const isVia = dragState.source === "via";
    const sourceId = isVia ? VIA_SOURCE_ID : WAYPOINT_SOURCE_ID;
    const source = mlMap.getSource(sourceId) as GeoJSONSource | undefined;
    if (!source) return;
    // Visually move just the dragged point by rewriting its coordinates.
    const collection = isVia ? viaFeatureCollection : waypointFeatureCollection;
    const features = collection.features.map((f) => {
      if (!dragState!.matches(f)) return f;
      return {
        ...f,
        geometry: {
          type: "Point" as const,
          coordinates: [e.lngLat.lng, e.lngLat.lat],
        },
      };
    });
    if (isVia) {
      setViaData(source, features);
    } else {
      setWaypointData(source, features);
    }
    previewLines([e.lngLat.lng, e.lngLat.lat]);
  }

  /**
   * Rewrites the dragged coordinate in the leg and arc lines so the whole path
   * follows the cursor, instead of only the dragged point moving.
   */
  function previewLines(lngLat: [number, number]) {
    if (!dragState) return;
    const legSource = mlMap.getSource(LEG_SOURCE_ID) as GeoJSONSource | undefined;
    const arcSource = mlMap.getSource(ARC_SOURCE_ID) as GeoJSONSource | undefined;
    if (!legSource && !arcSource) return;

    const previewLegs: GeoJsonFeature<GeoJsonLineString>[] = [];
    const previewArcs: GeoJsonFeature<GeoJsonLineString>[] = [];
    for (const leg of legFeatures) {
      const vertices = leg.properties?.vertices as LegVertexMeta[] | undefined;
      const coordinates = leg.geometry.coordinates.map((coordinate, index) => {
        const vertex = vertices?.[index];
        return vertex && dragState!.matchesVertex(vertex) ? lngLat : coordinate;
      });
      const unwound = unwindCoordinates(coordinates);
      previewLegs.push({
        ...leg,
        geometry: { type: "LineString", coordinates: unwound },
      });
      previewArcs.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          // The arc helper expects wrapped longitudes, as the store holds them.
          coordinates: unwindCoordinates(
            createArcCoords(unwound.map((c) => [wrapLongitude(c[0]!), c[1]!])),
          ),
        },
        properties: { unitId: leg.properties?.unitId },
      });
    }
    legSource?.setData({ type: "FeatureCollection", features: previewLegs });
    arcSource?.setData({ type: "FeatureCollection", features: previewArcs });
  }

  function onDragEnd(e: MapMouseEvent) {
    mlMap.off("mousemove", onDragMove);
    if (!dragState) return;
    const { commit } = dragState;
    dragState = null;
    mlMap.getCanvas().style.cursor = "";
    commit([e.lngLat.lng, e.lngLat.lat]);
    drawHistory();
  }

  mlMap.on("mousedown", WAYPOINT_LAYER_ID, onWaypointMouseDown);
  mlMap.on("mousedown", VIA_LAYER_ID, onViaMouseDown);
  mlMap.on("mousedown", LEG_LAYER_ID, onLegMouseDown);
  mlMap.on("mousedown", onMapMouseDown);
  // The handles sit at on-screen midpoints, so they move with the camera.
  mlMap.on("moveend", drawMidpointHandles);

  activeScenario.store.onUndoRedo?.(({ meta }) => {
    if (meta?.value && selectedUnitIds.value.has(meta.value as string)) {
      drawHistory();
    }
  });

  watch([showHistory, editHistory, showWaypointTimestamps], () => drawHistory());
  watch(
    () => [...selectedUnitIds.value],
    () => drawHistory(),
  );
  watch(
    () => state.unitStateCounter,
    () => drawHistory(),
  );
  watch(
    () => fmt.trackFormatter,
    () => drawHistory(),
  );

  function dispose() {
    mlMap.off("mousedown", WAYPOINT_LAYER_ID, onWaypointMouseDown);
    mlMap.off("mousedown", VIA_LAYER_ID, onViaMouseDown);
    mlMap.off("mousedown", LEG_LAYER_ID, onLegMouseDown);
    mlMap.off("mousedown", onMapMouseDown);
    mlMap.off("moveend", drawMidpointHandles);
    mlMap.off("mousemove", onDragMove);
    clearWaypointFeatureStates();
  }

  return {
    setupUnitHistoryLayers,
    drawHistory,
    handleMapClick,
    dispose,
  };
}
