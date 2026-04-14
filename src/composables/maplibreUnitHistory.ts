import type {
  GeoJSONSource,
  MapLayerMouseEvent,
  MapMouseEvent,
  Map as MlMap,
} from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import { getDistance } from "ol/sphere";
import type { TScenario } from "@/scenariostore";
import { createUnitPathGeoJson } from "@/geo/history";
import { useSelectedItems } from "@/stores/selectedStore";
import { useSelectedWaypoints } from "@/stores/selectedWaypoints";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { convertSpeedToMetric } from "@/utils/convert";

const ARC_SOURCE_ID = "unitHistoryArcSource";
const LEG_SOURCE_ID = "unitHistoryLegSource";
const WAYPOINT_SOURCE_ID = "unitHistoryWaypointSource";
const VIA_SOURCE_ID = "unitHistoryViaSource";

const ARC_LAYER_ID = "unitHistoryArcLayer";
const LEG_LAYER_ID = "unitHistoryLegLayer";
const WAYPOINT_LAYER_ID = "unitHistoryWaypointLayer";
const WAYPOINT_LABEL_LAYER_ID = "unitHistoryWaypointLabelLayer";
const VIA_LAYER_ID = "unitHistoryViaLayer";

export const UNIT_HISTORY_LAYER_IDS = [
  ARC_LAYER_ID,
  LEG_LAYER_ID,
  VIA_LAYER_ID,
  WAYPOINT_LAYER_ID,
  WAYPOINT_LABEL_LAYER_ID,
];

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
  let dragState: {
    unitId: string;
    waypointId: string;
    t: number;
    isInitial: boolean;
  } | null = null;

  function setupUnitHistoryLayers(beforeLayerId?: string) {
    for (const id of [ARC_SOURCE_ID, LEG_SOURCE_ID, WAYPOINT_SOURCE_ID, VIA_SOURCE_ID]) {
      if (!mlMap.getSource(id)) {
        mlMap.addSource(id, { type: "geojson", data: EMPTY_FC });
      }
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
      legSource.setData({ type: "FeatureCollection", features: [] });
      waypointSource.setData({ type: "FeatureCollection", features: [] });
      viaSource.setData({ type: "FeatureCollection", features: [] });
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
    legSource.setData({ type: "FeatureCollection", features: allLegs });
    waypointSource.setData({ type: "FeatureCollection", features: allWaypoints });
    viaSource.setData({ type: "FeatureCollection", features: allVia });

    applyWaypointFeatureStates();
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
        const distance = getDistance(location!, lngLat);
        const speedValue = unit.properties?.averageSpeed || unit.properties?.maxSpeed;
        const speed = speedValue
          ? convertSpeedToMetric(speedValue.value, speedValue.uom)
          : convertSpeedToMetric(30, "km/h");
        const travel = distance / speed;
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
    const isCtrl =
      (originalEvent.metaKey || originalEvent.ctrlKey) &&
      !originalEvent.shiftKey &&
      !originalEvent.altKey;

    const hits = mlMap.getLayer(WAYPOINT_LAYER_ID)
      ? mlMap
          .queryRenderedFeatures(e.point, { layers: [WAYPOINT_LAYER_ID] })
          .filter((f) => f.layer?.id === WAYPOINT_LAYER_ID)
      : [];
    if (hits.length > 0) {
      const feature = hits[0];
      const unitId = feature.properties?.unitId as string | undefined;
      const waypointId = feature.id as string | undefined;
      const stateIndex = (feature.properties?.stateIndex as number) ?? -1;
      const isInitial = feature.properties?.isInitial === true;

      if (originalEvent.altKey && !originalEvent.shiftKey) {
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

    if (isCtrl) return handleCtrlClick(e);
    return false;
  }

  function onWaypointMouseDown(e: MapLayerMouseEvent) {
    if (!editHistory.value) return;
    const feature = e.features?.[0];
    if (!feature) return;
    const unitId = feature.properties?.unitId as string | undefined;
    const waypointId = feature.id as string | undefined;
    const t = feature.properties?.t as number | undefined;
    const isInitial = feature.properties?.isInitial === true;
    if (!unitId || !waypointId || t === undefined) return;

    e.preventDefault();
    dragState = { unitId, waypointId, t, isInitial };
    mlMap.getCanvas().style.cursor = "grabbing";
    mlMap.on("mousemove", onDragMove);
    mlMap.once("mouseup", onDragEnd);
  }

  function onDragMove(e: MapMouseEvent) {
    if (!dragState) return;
    const waypointSource = mlMap.getSource(WAYPOINT_SOURCE_ID) as
      | GeoJSONSource
      | undefined;
    if (!waypointSource) return;
    // Visually move just the dragged waypoint by rewriting its coordinates.
    const data = (waypointSource as any)._data as FeatureCollection | undefined;
    if (!data) return;
    const next: FeatureCollection = {
      type: "FeatureCollection",
      features: data.features.map((f) => {
        if (f.id !== dragState!.waypointId) return f;
        return {
          ...f,
          geometry: {
            type: "Point",
            coordinates: [e.lngLat.lng, e.lngLat.lat],
          },
        };
      }),
    };
    waypointSource.setData(next);
  }

  function onDragEnd(e: MapMouseEvent) {
    mlMap.off("mousemove", onDragMove);
    if (!dragState) return;
    const { unitId, t, isInitial } = dragState;
    dragState = null;
    mlMap.getCanvas().style.cursor = "";
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    if (isInitial) {
      // Dragging the initial location (unit origin) is not supported.
      drawHistory();
      return;
    }
    geo.addUnitPosition(unitId, lngLat, t);
    drawHistory();
  }

  mlMap.on("mousedown", WAYPOINT_LAYER_ID, onWaypointMouseDown);

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
