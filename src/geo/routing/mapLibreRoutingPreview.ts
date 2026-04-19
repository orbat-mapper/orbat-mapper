import { onUnmounted, toValue, watch, type MaybeRefOrGetter } from "vue";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import type { Map as MlMap } from "maplibre-gl";
import { useRoutingStore } from "@/stores/routingStore";

const ROUTING_PREVIEW_SOURCE_ID = "routing-preview-source";
const ROUTING_PREVIEW_LINE_LAYER_ID = "routing-preview-line";
const ROUTING_PREVIEW_PENDING_LINE_LAYER_ID = "routing-preview-pending-line";
const ROUTING_PREVIEW_POINT_LAYER_ID = "routing-preview-points";

export function useMapLibreRoutingPreview(
  mapSource: MaybeRefOrGetter<MlMap | undefined>,
) {
  const routingStore = useRoutingStore();
  let currentMap: MlMap | undefined;

  function safelyRemovePreview(map: MlMap | undefined) {
    if (!map) return;

    try {
      if (typeof map.off === "function") {
        map.off("style.load", onStyleLoad);
      }
    } catch {
      // The map may already be torn down while switching engines.
    }

    try {
      if (map.getLayer?.(ROUTING_PREVIEW_LINE_LAYER_ID)) {
        map.removeLayer(ROUTING_PREVIEW_LINE_LAYER_ID);
      }
      if (map.getLayer?.(ROUTING_PREVIEW_PENDING_LINE_LAYER_ID)) {
        map.removeLayer(ROUTING_PREVIEW_PENDING_LINE_LAYER_ID);
      }
      if (map.getLayer?.(ROUTING_PREVIEW_POINT_LAYER_ID)) {
        map.removeLayer(ROUTING_PREVIEW_POINT_LAYER_ID);
      }
      if (map.getSource?.(ROUTING_PREVIEW_SOURCE_ID)) {
        map.removeSource(ROUTING_PREVIEW_SOURCE_ID);
      }
    } catch {
      // MapLibre can throw here if the style or internal style graph is already gone.
    }
  }

  function ensureLayers() {
    const mlMap = currentMap;
    if (!mlMap || typeof mlMap.getSource !== "function") return;
    if (!mlMap.getSource(ROUTING_PREVIEW_SOURCE_ID)) {
      mlMap.addSource(ROUTING_PREVIEW_SOURCE_ID, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
    }

    if (!mlMap.getLayer(ROUTING_PREVIEW_LINE_LAYER_ID)) {
      mlMap.addLayer({
        id: ROUTING_PREVIEW_LINE_LAYER_ID,
        type: "line",
        source: ROUTING_PREVIEW_SOURCE_ID,
        filter: ["==", ["get", "kind"], "path"],
        paint: {
          "line-color": "#1d4ed8",
          "line-width": 4,
        },
      });
    }

    if (!mlMap.getLayer(ROUTING_PREVIEW_PENDING_LINE_LAYER_ID)) {
      mlMap.addLayer({
        id: ROUTING_PREVIEW_PENDING_LINE_LAYER_ID,
        type: "line",
        source: ROUTING_PREVIEW_SOURCE_ID,
        filter: ["==", ["get", "kind"], "pending-path"],
        paint: {
          "line-color": "#1d4ed8",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });
    }

    if (!mlMap.getLayer(ROUTING_PREVIEW_POINT_LAYER_ID)) {
      mlMap.addLayer({
        id: ROUTING_PREVIEW_POINT_LAYER_ID,
        type: "circle",
        source: ROUTING_PREVIEW_SOURCE_ID,
        filter: ["==", ["get", "kind"], "point"],
        paint: {
          "circle-color": "#1d4ed8",
          "circle-radius": 6,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
    }
  }

  function drawPreview() {
    const mlMap = currentMap;
    if (!mlMap || typeof mlMap.getSource !== "function") return;
    ensureLayers();

    const source = mlMap.getSource(ROUTING_PREVIEW_SOURCE_ID) as
      | { setData(data: FeatureCollection): void }
      | undefined;
    if (!source) return;

    if (!routingStore.active) {
      source.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const features: Feature<LineString | Point>[] = [];
    if (routingStore.previewRoutePath) {
      features.push({
        ...routingStore.previewRoutePath,
        properties: { kind: "path" },
      });
    }
    if (routingStore.pendingLegPath) {
      features.push({
        ...routingStore.pendingLegPath,
        properties: { kind: "pending-path" },
      });
    }
    if (routingStore.cursorLegPath) {
      features.push({
        ...routingStore.cursorLegPath,
        properties: { kind: "pending-path" },
      });
    }
    if (routingStore.displayStart) {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: routingStore.displayStart },
        properties: { kind: "point" },
      });
    }
    if (routingStore.displayDestination) {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: routingStore.displayDestination },
        properties: { kind: "point" },
      });
    }

    source.setData({ type: "FeatureCollection", features });
  }

  const onStyleLoad = () => {
    ensureLayers();
    drawPreview();
  };

  watch(
    () => [
      routingStore.active,
      routingStore.routeOrigin,
      routingStore.destination,
      routingStore.isBusy,
      routingStore.start,
      routingStore.currentLegPreview,
      routingStore.draftWaypoints,
      routingStore.cursorLegPath,
    ],
    drawPreview,
    { immediate: true, deep: true },
  );

  watch(
    () => toValue(mapSource),
    (map, previousMap) => {
      safelyRemovePreview(previousMap);
      currentMap = map;
      if (currentMap && "on" in currentMap) {
        currentMap.on("style.load", onStyleLoad);
      }
      drawPreview();
    },
    { immediate: true },
  );

  onUnmounted(() => {
    safelyRemovePreview(currentMap);
    currentMap = undefined;
  });
}
