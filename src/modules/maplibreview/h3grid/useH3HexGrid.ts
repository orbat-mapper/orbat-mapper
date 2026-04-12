import { ref, watch, type ShallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import { useDebounceFn } from "@vueuse/core";
import { polygonToCells, cellToBoundary } from "h3-js";
import { registerH3Protocol, setH3Resolution, H3_PROTOCOL } from "./h3TileProtocol";

const H3_SOURCE = "h3HexSource";
const H3_LAYER_LINE = "h3HexLine";

/** Approximate H3 resolution from map zoom level */
function zoomToDefaultResolution(zoom: number): number {
  if (zoom < 2) return 0;
  if (zoom < 3) return 1;
  if (zoom < 4.5) return 2;
  if (zoom < 6) return 3;
  if (zoom < 7.5) return 4;
  if (zoom < 9) return 5;
  if (zoom < 10.5) return 6;
  if (zoom < 12) return 7;
  return 8;
}

/**
 * Map H3 resolution to a fixed tile zoom level.
 * This prevents tile boundaries from shifting as the user zooms,
 * which would cause hex edges to visibly clip at different positions.
 */
function h3ResToTileZoom(res: number): number {
  // Tile zoom must be high enough that hex geometry doesn't extend too far
  // beyond tile edges (which causes visible clipping when overzoomed).
  const mapping = [2, 3, 4, 5, 7, 9, 10, 11, 12];
  return mapping[Math.min(res, mapping.length - 1)];
}

let protocolRegistered = false;

export function useH3HexGrid(mlMap: ShallowRef<MlMap | undefined>) {
  const showHexGrid = ref(false);
  const hexResolution = ref(3);
  const autoResolution = ref(false);
  const lineColor = ref("#3b82f6");
  const lineOpacity = ref(0.5);
  const lineWidth = ref(1.5);

  if (!protocolRegistered) {
    registerH3Protocol();
    protocolRegistered = true;
  }

  function resolveTargetResolution(map: MlMap): number {
    return autoResolution.value
      ? zoomToDefaultResolution(map.getZoom())
      : hexResolution.value;
  }

  function addH3SourceAndLayer(map: MlMap, res: number) {
    if (!map.getSource(H3_SOURCE)) {
      const tileZoom = h3ResToTileZoom(res);
      map.addSource(H3_SOURCE, {
        type: "vector",
        tiles: [`${H3_PROTOCOL}://{z}/{x}/{y}`],
        minzoom: 0,
        maxzoom: tileZoom,
      });
    }
    const beforeLayer = map.getLayer("unitLayer") ? "unitLayer" : undefined;
    if (!map.getLayer(H3_LAYER_LINE)) {
      map.addLayer(
        {
          id: H3_LAYER_LINE,
          type: "line",
          source: H3_SOURCE,
          "source-layer": "h3",
          paint: {
            "line-color": lineColor.value,
            "line-opacity": lineOpacity.value,
            "line-width": lineWidth.value,
          },
        },
        beforeLayer,
      );
    }
  }

  function addSourceAndLayers(map: MlMap, res: number) {
    addH3SourceAndLayer(map, res);
  }

  function removeH3SourceAndLayer(map: MlMap) {
    if (map.getLayer(H3_LAYER_LINE)) map.removeLayer(H3_LAYER_LINE);
    if (map.getSource(H3_SOURCE)) map.removeSource(H3_SOURCE);
  }

  function removeSourceAndLayers(map: MlMap) {
    removeH3SourceAndLayer(map);
  }

  /** Force MapLibre to re-fetch H3 vector tiles. */
  function reloadH3Tiles(map: MlMap, res: number) {
    removeH3SourceAndLayer(map);
    addH3SourceAndLayer(map, res);
  }

  function applyResolution(map: MlMap, res: number) {
    hexResolution.value = res;
    setH3Resolution(res);
    reloadH3Tiles(map, res);
  }

  function updateResolution() {
    const map = mlMap.value;
    if (!map || !showHexGrid.value) return;

    const res = resolveTargetResolution(map);

    if (res !== hexResolution.value || !map.getSource(H3_SOURCE)) {
      applyResolution(map, res);
    }
  }

  const debouncedUpdateResolution = useDebounceFn(updateResolution, 200);

  function onZoom() {
    if (!autoResolution.value) return;

    const map = mlMap.value;
    if (!map || !showHexGrid.value) return;

    const res = resolveTargetResolution(map);
    if (res < hexResolution.value) {
      applyResolution(map, res);
    }
  }

  function onZoomEnd() {
    if (!autoResolution.value) return;
    debouncedUpdateResolution();
  }

  function onStyleLoad() {
    if (showHexGrid.value) {
      const map = mlMap.value!;
      const res = resolveTargetResolution(map);
      hexResolution.value = res;
      setH3Resolution(res);
      addSourceAndLayers(map, res);
    }
  }

  watch(
    mlMap,
    (map, oldMap) => {
      if (oldMap) {
        oldMap.off("zoom", onZoom);
        oldMap.off("zoomend", onZoomEnd);
        oldMap.off("style.load", onStyleLoad);
      }
      if (map) {
        map.on("zoom", onZoom);
        map.on("zoomend", onZoomEnd);
        map.on("style.load", onStyleLoad);
        if (showHexGrid.value) {
          const res = resolveTargetResolution(map);
          hexResolution.value = res;
          setH3Resolution(res);
          addSourceAndLayers(map, res);
        }
      }
    },
    { immediate: true },
  );

  watch(showHexGrid, (val) => {
    const map = mlMap.value;
    if (!map) return;
    if (val) {
      const res = resolveTargetResolution(map);
      hexResolution.value = res;
      setH3Resolution(res);
      addSourceAndLayers(map, res);
    } else {
      removeSourceAndLayers(map);
    }
  });

  watch(hexResolution, (res) => {
    const map = mlMap.value;
    if (!map || !showHexGrid.value || autoResolution.value) return;
    applyResolution(map, res);
  });

  watch(autoResolution, () => {
    if (showHexGrid.value) updateResolution();
  });

  watch([lineColor, lineOpacity, lineWidth], ([color, opacity, width]) => {
    const map = mlMap.value;
    if (!map || !map.getLayer(H3_LAYER_LINE)) return;
    map.setPaintProperty(H3_LAYER_LINE, "line-color", color);
    map.setPaintProperty(H3_LAYER_LINE, "line-opacity", opacity);
    map.setPaintProperty(H3_LAYER_LINE, "line-width", width);
  });

  return {
    showHexGrid,
    hexResolution,
    autoResolution,
    lineColor,
    lineOpacity,
    lineWidth,
  };
}
