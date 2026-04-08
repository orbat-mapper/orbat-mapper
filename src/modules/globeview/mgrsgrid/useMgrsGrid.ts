import { ref, watch, type ShallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import { useDebounceFn } from "@vueuse/core";
import type { Feature, FeatureCollection, LineString, Point, Position } from "geojson";
import {
  registerMgrsProtocol,
  setMgrsAccuracy,
  MGRS_PROTOCOL,
  type MgrsAccuracy,
} from "./mgrsTileProtocol";

const GZD_LINE_SOURCE = "mgrsGzdLineSource";
const GZD_LINE_LAYER = "mgrsGzdLine";
const GZD_LABEL_SOURCE = "mgrsGzdLabelSource";
const GZD_LABEL_LAYER = "mgrsGzdLabel";

const FINE_SOURCE = "mgrsFineSource";
const FINE_LINE_LAYER = "mgrsFineLine";
const FINE_LABEL_LAYER = "mgrsFineLabel";

/** Below this map zoom only the GZD graticule shows — the tile source is removed. */
const FINE_MIN_ZOOM = 5;

function zoomToAccuracy(zoom: number): MgrsAccuracy {
  if (zoom < 8) return 0; // 100 km
  if (zoom < 11) return 1; // 10 km
  if (zoom < 14) return 2; // 1 km
  if (zoom < 17) return 3; // 100 m
  return 4; // 10 m
}

/**
 * Fixed tile-zoom per accuracy so tile boundaries don't shift as the user
 * zooms — mirrors the strategy in the H3 tile protocol.
 */
function accuracyToTileZoom(a: MgrsAccuracy): number {
  return [5, 8, 11, 14, 17][a];
}

// ---------- GZD graticule (static) ----------

function buildGzdLines(): FeatureCollection<LineString> {
  const features: Feature<LineString>[] = [];

  const lats = [
    -80, -72, -64, -56, -48, -40, -32, -24, -16, -8, 0, 8, 16, 24, 32, 40, 48, 56, 64, 72,
    84,
  ];
  for (const lat of lats) {
    const coords: Position[] = [];
    for (let lng = -180; lng <= 180; lng += 2) coords.push([lng, lat]);
    features.push({
      type: "Feature",
      properties: { kind: "parallel", lat },
      geometry: { type: "LineString", coordinates: coords },
    });
  }

  for (let lng = -180; lng <= 180; lng += 6) {
    features.push(meridianSegment(lng, -80, 56));
    features.push(meridianSegment(lng, 64, 72));
  }

  // V band: 31V = 0–3°, 32V = 3–12°.
  for (let lng = -180; lng <= 0; lng += 6) features.push(meridianSegment(lng, 56, 64));
  features.push(meridianSegment(3, 56, 64));
  for (let lng = 12; lng <= 180; lng += 6) features.push(meridianSegment(lng, 56, 64));

  // X band: 31X, 33X, 35X, 37X (Svalbard); 32X, 34X, 36X do not exist.
  for (let lng = -180; lng <= 0; lng += 6) features.push(meridianSegment(lng, 72, 84));
  for (const lng of [9, 21, 33, 42]) features.push(meridianSegment(lng, 72, 84));
  for (let lng = 48; lng <= 180; lng += 6) features.push(meridianSegment(lng, 72, 84));

  return { type: "FeatureCollection", features };
}

function meridianSegment(lng: number, lat1: number, lat2: number): Feature<LineString> {
  const coords: Position[] = [];
  for (let lat = lat1; lat <= lat2; lat += 1) coords.push([lng, lat]);
  return {
    type: "Feature",
    properties: { kind: "meridian", lng },
    geometry: { type: "LineString", coordinates: coords },
  };
}

const BANDS = "CDEFGHJKLMNPQRSTUVWX";

function bandLatRange(band: string): [number, number] {
  if (band === "X") return [72, 84];
  const idx = BANDS.indexOf(band);
  return [-80 + idx * 8, -80 + (idx + 1) * 8];
}

function buildGzdLabels(): FeatureCollection<Point> {
  const features: Feature<Point>[] = [];
  for (let zone = 1; zone <= 60; zone++) {
    for (const band of BANDS) {
      if (band === "X" && (zone === 32 || zone === 34 || zone === 36)) continue;
      const [latS, latN] = bandLatRange(band);
      let lngW = -180 + (zone - 1) * 6;
      let lngE = -180 + zone * 6;
      if (band === "V") {
        if (zone === 31) lngE = 3;
        else if (zone === 32) {
          lngW = 3;
          lngE = 12;
        }
      }
      if (band === "X") {
        if (zone === 31) {
          lngW = 0;
          lngE = 9;
        } else if (zone === 33) {
          lngW = 9;
          lngE = 21;
        } else if (zone === 35) {
          lngW = 21;
          lngE = 33;
        } else if (zone === 37) {
          lngW = 33;
          lngE = 42;
        }
      }
      features.push({
        type: "Feature",
        properties: { id: `${zone}${band}` },
        geometry: {
          type: "Point",
          coordinates: [(lngW + lngE) / 2, (latS + latN) / 2],
        },
      });
    }
  }
  return { type: "FeatureCollection", features };
}

let cachedGzdLines: FeatureCollection<LineString> | null = null;
let cachedGzdLabels: FeatureCollection<Point> | null = null;
function getGzdLines(): FeatureCollection<LineString> {
  return (cachedGzdLines ??= buildGzdLines());
}
function getGzdLabels(): FeatureCollection<Point> {
  return (cachedGzdLabels ??= buildGzdLabels());
}

// ---------- Composable ----------

let protocolRegistered = false;

export function useMgrsGrid(mlMap: ShallowRef<MlMap | undefined>) {
  const showMgrsGrid = ref(false);
  const showLabels = ref(true);
  const lineColor = ref("#f59e0b");
  const lineOpacity = ref(0.7);
  const lineWidth = ref(1.2);
  const currentAccuracy = ref<MgrsAccuracy>(0);

  if (!protocolRegistered) {
    registerMgrsProtocol();
    protocolRegistered = true;
  }

  function addGzdLayers(map: MlMap) {
    if (!map.getSource(GZD_LINE_SOURCE)) {
      map.addSource(GZD_LINE_SOURCE, { type: "geojson", data: getGzdLines() });
    }
    if (!map.getSource(GZD_LABEL_SOURCE)) {
      map.addSource(GZD_LABEL_SOURCE, { type: "geojson", data: getGzdLabels() });
    }
    const beforeLayer = map.getLayer("unitLayer") ? "unitLayer" : undefined;
    if (!map.getLayer(GZD_LINE_LAYER)) {
      map.addLayer(
        {
          id: GZD_LINE_LAYER,
          type: "line",
          source: GZD_LINE_SOURCE,
          paint: {
            "line-color": lineColor.value,
            "line-opacity": lineOpacity.value,
            "line-width": lineWidth.value + 0.6,
          },
        },
        beforeLayer,
      );
    }
    if (!map.getLayer(GZD_LABEL_LAYER)) {
      map.addLayer(
        {
          id: GZD_LABEL_LAYER,
          type: "symbol",
          source: GZD_LABEL_SOURCE,
          layout: {
            "text-field": ["get", "id"],
            "text-font": ["Noto Sans Italic"],
            "text-size": 16,
          },
          paint: {
            "text-color": lineColor.value,
            "text-halo-color": "rgba(0, 0, 0, 0.7)",
            "text-halo-width": 1.2,
            "text-opacity": showLabels.value ? 1 : 0,
          },
        },
        beforeLayer,
      );
    }
  }

  function addFineSourceAndLayers(map: MlMap, accuracy: MgrsAccuracy) {
    const tileZoom = accuracyToTileZoom(accuracy);
    if (!map.getSource(FINE_SOURCE)) {
      map.addSource(FINE_SOURCE, {
        type: "vector",
        tiles: [`${MGRS_PROTOCOL}://{z}/{x}/{y}`],
        minzoom: Math.max(0, tileZoom - 1),
        maxzoom: tileZoom,
      });
    }
    const beforeLayer = map.getLayer("unitLayer") ? "unitLayer" : undefined;
    if (!map.getLayer(FINE_LINE_LAYER)) {
      map.addLayer(
        {
          id: FINE_LINE_LAYER,
          type: "line",
          source: FINE_SOURCE,
          "source-layer": "mgrs",
          paint: {
            "line-color": lineColor.value,
            "line-opacity": lineOpacity.value * 0.85,
            "line-width": lineWidth.value,
          },
        },
        beforeLayer,
      );
    }
    if (!map.getLayer(FINE_LABEL_LAYER)) {
      map.addLayer(
        {
          id: FINE_LABEL_LAYER,
          type: "symbol",
          source: FINE_SOURCE,
          "source-layer": "mgrs_labels",
          layout: {
            "text-field": ["get", "label"],
            "text-font": ["Noto Sans Italic"],
            "text-size": 11,
            "text-max-width": 8,
          },
          paint: {
            "text-color": lineColor.value,
            "text-halo-color": "rgba(0, 0, 0, 0.7)",
            "text-halo-width": 1.2,
            "text-opacity": showLabels.value ? 1 : 0,
          },
        },
        beforeLayer,
      );
    }
  }

  function removeFineSourceAndLayers(map: MlMap) {
    if (map.getLayer(FINE_LABEL_LAYER)) map.removeLayer(FINE_LABEL_LAYER);
    if (map.getLayer(FINE_LINE_LAYER)) map.removeLayer(FINE_LINE_LAYER);
    if (map.getSource(FINE_SOURCE)) map.removeSource(FINE_SOURCE);
  }

  function removeAllLayers(map: MlMap) {
    removeFineSourceAndLayers(map);
    if (map.getLayer(GZD_LABEL_LAYER)) map.removeLayer(GZD_LABEL_LAYER);
    if (map.getLayer(GZD_LINE_LAYER)) map.removeLayer(GZD_LINE_LAYER);
    if (map.getSource(GZD_LABEL_SOURCE)) map.removeSource(GZD_LABEL_SOURCE);
    if (map.getSource(GZD_LINE_SOURCE)) map.removeSource(GZD_LINE_SOURCE);
  }

  function applyAccuracy(map: MlMap, accuracy: MgrsAccuracy) {
    currentAccuracy.value = accuracy;
    setMgrsAccuracy(accuracy);
    // Re-add with a fresh source so MapLibre flushes any cached tiles that
    // were generated with the previous accuracy.
    removeFineSourceAndLayers(map);
    addFineSourceAndLayers(map, accuracy);
  }

  function updateAccuracy() {
    const map = mlMap.value;
    if (!map || !showMgrsGrid.value) return;
    const zoom = map.getZoom();
    if (zoom < FINE_MIN_ZOOM) {
      removeFineSourceAndLayers(map);
      return;
    }
    const target = zoomToAccuracy(zoom);
    if (!map.getSource(FINE_SOURCE) || target !== currentAccuracy.value) {
      applyAccuracy(map, target);
    }
  }

  const debouncedUpdate = useDebounceFn(updateAccuracy, 200);

  function onZoomEnd() {
    debouncedUpdate();
  }

  function onStyleLoad() {
    if (showMgrsGrid.value && mlMap.value) {
      addGzdLayers(mlMap.value);
      updateAccuracy();
    }
  }

  watch(
    mlMap,
    (map, oldMap) => {
      if (oldMap) {
        oldMap.off("style.load", onStyleLoad);
        oldMap.off("zoomend", onZoomEnd);
      }
      if (map) {
        map.on("style.load", onStyleLoad);
        map.on("zoomend", onZoomEnd);
        if (showMgrsGrid.value) {
          addGzdLayers(map);
          updateAccuracy();
        }
      }
    },
    { immediate: true },
  );

  watch(showMgrsGrid, (val) => {
    const map = mlMap.value;
    if (!map) return;
    if (val) {
      addGzdLayers(map);
      updateAccuracy();
    } else {
      removeAllLayers(map);
    }
  });

  watch(showLabels, (val) => {
    const map = mlMap.value;
    if (!map) return;
    const opacity = val ? 1 : 0;
    for (const id of [GZD_LABEL_LAYER, FINE_LABEL_LAYER]) {
      if (map.getLayer(id)) map.setPaintProperty(id, "text-opacity", opacity);
    }
  });

  watch([lineColor, lineOpacity, lineWidth], ([color, opacity, width]) => {
    const map = mlMap.value;
    if (!map) return;
    if (map.getLayer(GZD_LINE_LAYER)) {
      map.setPaintProperty(GZD_LINE_LAYER, "line-color", color);
      map.setPaintProperty(GZD_LINE_LAYER, "line-opacity", opacity);
      map.setPaintProperty(GZD_LINE_LAYER, "line-width", width + 0.6);
    }
    if (map.getLayer(FINE_LINE_LAYER)) {
      map.setPaintProperty(FINE_LINE_LAYER, "line-color", color);
      map.setPaintProperty(FINE_LINE_LAYER, "line-opacity", opacity * 0.85);
      map.setPaintProperty(FINE_LINE_LAYER, "line-width", width);
    }
    for (const id of [GZD_LABEL_LAYER, FINE_LABEL_LAYER]) {
      if (map.getLayer(id)) map.setPaintProperty(id, "text-color", color);
    }
  });

  return {
    showMgrsGrid,
    showLabels,
    lineColor,
    lineOpacity,
    lineWidth,
    currentAccuracy,
  };
}
