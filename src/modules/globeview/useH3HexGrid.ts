import { ref, watch, type ShallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import { polygonToCells, cellToBoundary } from "h3-js";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import {
  registerH3Protocol,
  setH3Resolution,
  H3_PROTOCOL,
} from "./h3TileProtocol";
import icelandGeo from "./iceland.geo.json";
import greenlandGeo from "./greenland.geo.json";

const H3_SOURCE = "h3HexSource";
const H3_LAYER_LINE = "h3HexLine";
const ICELAND_SOURCE = "h3IcelandSource";
const ICELAND_FILL_LAYER = "h3IcelandFill";
const GREENLAND_SOURCE = "h3GreenlandSource";
const GREENLAND_FILL_LAYER = "h3GreenlandFill";

/** Build a GeoJSON FeatureCollection of H3 cells covering a country polygon */
function buildCountryCells(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geo: any,
  res: number,
): FeatureCollection<Polygon> {
  const feature = geo.features[0];
  const { type, coordinates } = feature.geometry;

  // polygonToCells only accepts a single polygon; iterate over MultiPolygon parts
  const polygons: number[][][][] =
    type === "MultiPolygon" ? coordinates : [coordinates];

  const cellSet = new Set<string>();
  for (const poly of polygons) {
    for (const cell of polygonToCells(poly, res, true)) {
      cellSet.add(cell);
    }
  }

  const features: Feature<Polygon>[] = Array.from(cellSet).map((cell) => {
    const boundary = cellToBoundary(cell, true);
    boundary.push(boundary[0]);
    return {
      type: "Feature",
      properties: { h3index: cell },
      geometry: { type: "Polygon", coordinates: [boundary] },
    };
  });
  return { type: "FeatureCollection", features };
}

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
  const showHexGrid = ref(true);
  const hexResolution = ref(3);
  const autoResolution = ref(false);

  if (!protocolRegistered) {
    registerH3Protocol();
    protocolRegistered = true;
  }

  function addSourceAndLayers(map: MlMap) {
    if (!map.getSource(H3_SOURCE)) {
      const tileZoom = h3ResToTileZoom(hexResolution.value);
      map.addSource(H3_SOURCE, {
        type: "vector",
        tiles: [`${H3_PROTOCOL}://{z}/{x}/{y}`],
        minzoom: 0,
        maxzoom: tileZoom,
      });
    }
    if (!map.getSource(ICELAND_SOURCE)) {
      map.addSource(ICELAND_SOURCE, {
        type: "geojson",
        data: buildCountryCells(icelandGeo, hexResolution.value),
      });
    }
    if (!map.getSource(GREENLAND_SOURCE)) {
      map.addSource(GREENLAND_SOURCE, {
        type: "geojson",
        data: buildCountryCells(greenlandGeo, hexResolution.value),
      });
    }
    const beforeLayer = map.getLayer("unitLayer") ? "unitLayer" : undefined;
    if (!map.getLayer(ICELAND_FILL_LAYER)) {
      map.addLayer(
        {
          id: ICELAND_FILL_LAYER,
          type: "fill",
          source: ICELAND_SOURCE,
          paint: {
            "fill-color": "#ef4444",
            "fill-opacity": 0.4,
          },
        },
        beforeLayer,
      );
    }
    if (!map.getLayer(GREENLAND_FILL_LAYER)) {
      map.addLayer(
        {
          id: GREENLAND_FILL_LAYER,
          type: "fill",
          source: GREENLAND_SOURCE,
          paint: {
            "fill-color": "#10b981",
            "fill-opacity": 0.4,
          },
        },
        beforeLayer,
      );
    }
    if (!map.getLayer(H3_LAYER_LINE)) {
      map.addLayer(
        {
          id: H3_LAYER_LINE,
          type: "line",
          source: H3_SOURCE,
          "source-layer": "h3",
          paint: {
            "line-color": "#3b82f6",
            "line-opacity": 0.5,
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              1,
              0.5,
              5,
              1.5,
              10,
              2,
            ],
          },
        },
        beforeLayer,
      );
    }
  }

  function removeSourceAndLayers(map: MlMap) {
    if (map.getLayer(H3_LAYER_LINE)) map.removeLayer(H3_LAYER_LINE);
    if (map.getLayer(GREENLAND_FILL_LAYER)) map.removeLayer(GREENLAND_FILL_LAYER);
    if (map.getLayer(ICELAND_FILL_LAYER)) map.removeLayer(ICELAND_FILL_LAYER);
    if (map.getSource(H3_SOURCE)) map.removeSource(H3_SOURCE);
    if (map.getSource(GREENLAND_SOURCE)) map.removeSource(GREENLAND_SOURCE);
    if (map.getSource(ICELAND_SOURCE)) map.removeSource(ICELAND_SOURCE);
  }

  /** Force MapLibre to re-fetch all tiles (after resolution change) */
  function reloadTiles(map: MlMap) {
    removeSourceAndLayers(map);
    addSourceAndLayers(map);
  }

  function updateResolution() {
    const map = mlMap.value;
    if (!map || !showHexGrid.value) return;

    const zoom = map.getZoom();
    const res = autoResolution.value
      ? zoomToDefaultResolution(zoom)
      : hexResolution.value;

    if (res !== hexResolution.value || !map.getSource(H3_SOURCE)) {
      hexResolution.value = res;
      setH3Resolution(res);
      reloadTiles(map);
    }
  }

  function onMoveEnd() {
    if (!autoResolution.value) return;
    updateResolution();
  }

  function onStyleLoad() {
    if (showHexGrid.value) {
      setH3Resolution(hexResolution.value);
      addSourceAndLayers(mlMap.value!);
    }
  }

  watch(
    mlMap,
    (map, oldMap) => {
      if (oldMap) {
        oldMap.off("moveend", onMoveEnd);
        oldMap.off("style.load", onStyleLoad);
      }
      if (map) {
        map.on("moveend", onMoveEnd);
        map.on("style.load", onStyleLoad);
        if (showHexGrid.value) {
          setH3Resolution(hexResolution.value);
          addSourceAndLayers(map);
        }
      }
    },
    { immediate: true },
  );

  watch(showHexGrid, (val) => {
    const map = mlMap.value;
    if (!map) return;
    if (val) {
      setH3Resolution(hexResolution.value);
      addSourceAndLayers(map);
      if (autoResolution.value) updateResolution();
    } else {
      removeSourceAndLayers(map);
    }
  });

  watch(hexResolution, (res) => {
    const map = mlMap.value;
    if (!map || !showHexGrid.value || autoResolution.value) return;
    setH3Resolution(res);
    reloadTiles(map);
  });

  watch(autoResolution, () => {
    if (showHexGrid.value) updateResolution();
  });

  return {
    showHexGrid,
    hexResolution,
    autoResolution,
  };
}
