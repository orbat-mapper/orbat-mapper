import { ref, watch, type ShallowRef } from "vue";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import { useDebounceFn } from "@vueuse/core";
import { polygonToCells, cellToBoundary } from "h3-js";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import { registerH3Protocol, setH3Resolution, H3_PROTOCOL } from "./h3TileProtocol";
import icelandGeo from "./iceland.geo.json";
import greenlandGeo from "./greenland.geo.json";

const H3_SOURCE = "h3HexSource";
const H3_LAYER_LINE = "h3HexLine";
const ICELAND_SOURCE = "h3IcelandSource";
const ICELAND_FILL_LAYER = "h3IcelandFill";
const GREENLAND_SOURCE = "h3GreenlandSource";
const GREENLAND_FILL_LAYER = "h3GreenlandFill";
const COUNTRY_OVERLAY_MAX_RES = 5;

/**
 * LRU cache for computed country cell FeatureCollections. Keyed on geo object
 * with a nested Map<res, FC>. Each nested Map keeps at most MAX_CACHED_RES
 * entries; least-recently-used entries are evicted first.
 */
const MAX_CACHED_RES = 3;
const countryCellsCache = new WeakMap<object, Map<number, FeatureCollection<Polygon>>>();

/** Build a GeoJSON FeatureCollection of H3 cells covering a country polygon */
function buildCountryCells(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geo: any,
  res: number,
): FeatureCollection<Polygon> {
  let byRes = countryCellsCache.get(geo);
  if (!byRes) {
    byRes = new Map();
    countryCellsCache.set(geo, byRes);
  }

  // LRU hit: delete + re-set to move entry to the "newest" position.
  const cached = byRes.get(res);
  if (cached) {
    byRes.delete(res);
    byRes.set(res, cached);
    return cached;
  }

  const feature = geo.features[0];
  const { type, coordinates } = feature.geometry;

  // polygonToCells only accepts a single polygon; iterate over MultiPolygon parts
  const polygons: number[][][][] = type === "MultiPolygon" ? coordinates : [coordinates];

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
  const fc: FeatureCollection<Polygon> = { type: "FeatureCollection", features };

  byRes.set(res, fc);
  // Evict oldest entries if over the cap.
  while (byRes.size > MAX_CACHED_RES) {
    const oldest = byRes.keys().next().value;
    if (oldest === undefined) break;
    byRes.delete(oldest);
  }
  return fc;
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

  function resolveCountryOverlayResolution(res: number): number {
    return Math.min(res, COUNTRY_OVERLAY_MAX_RES);
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

  function updateCountrySourceData(map: MlMap, res: number) {
    const overlayRes = resolveCountryOverlayResolution(res);
    const icelandSource = map.getSource(ICELAND_SOURCE) as GeoJSONSource | undefined;
    if (icelandSource) {
      icelandSource.setData(buildCountryCells(icelandGeo, overlayRes));
    }

    const greenlandSource = map.getSource(GREENLAND_SOURCE) as GeoJSONSource | undefined;
    if (greenlandSource) {
      greenlandSource.setData(buildCountryCells(greenlandGeo, overlayRes));
    }
  }

  function addCountrySourcesAndLayers(map: MlMap, res: number) {
    const overlayRes = resolveCountryOverlayResolution(res);
    if (!map.getSource(ICELAND_SOURCE)) {
      map.addSource(ICELAND_SOURCE, {
        type: "geojson",
        data: buildCountryCells(icelandGeo, overlayRes),
      });
    }
    if (!map.getSource(GREENLAND_SOURCE)) {
      map.addSource(GREENLAND_SOURCE, {
        type: "geojson",
        data: buildCountryCells(greenlandGeo, overlayRes),
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
  }

  function addSourceAndLayers(map: MlMap, res: number) {
    addH3SourceAndLayer(map, res);
    addCountrySourcesAndLayers(map, res);
  }

  function removeH3SourceAndLayer(map: MlMap) {
    if (map.getLayer(H3_LAYER_LINE)) map.removeLayer(H3_LAYER_LINE);
    if (map.getSource(H3_SOURCE)) map.removeSource(H3_SOURCE);
  }

  function removeCountrySourcesAndLayers(map: MlMap) {
    if (map.getLayer(GREENLAND_FILL_LAYER)) map.removeLayer(GREENLAND_FILL_LAYER);
    if (map.getLayer(ICELAND_FILL_LAYER)) map.removeLayer(ICELAND_FILL_LAYER);
    if (map.getSource(GREENLAND_SOURCE)) map.removeSource(GREENLAND_SOURCE);
    if (map.getSource(ICELAND_SOURCE)) map.removeSource(ICELAND_SOURCE);
  }

  function removeSourceAndLayers(map: MlMap) {
    removeH3SourceAndLayer(map);
    removeCountrySourcesAndLayers(map);
  }

  /** Force MapLibre to re-fetch H3 vector tiles without rebuilding country layers */
  function reloadH3Tiles(map: MlMap, res: number) {
    removeH3SourceAndLayer(map);
    addH3SourceAndLayer(map, res);
  }

  function applyResolution(map: MlMap, res: number) {
    hexResolution.value = res;
    setH3Resolution(res);
    updateCountrySourceData(map, res);
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
