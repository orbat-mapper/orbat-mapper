<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, onMounted, onUnmounted, watch } from "vue";
import { type SelectItem } from "@/components/types";
import SimpleSelect from "@/components/SimpleSelect.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useBaseLayersStore } from "@/stores/baseLayersStore";
import { useGeoStore } from "@/stores/geoStore";
import { useMapViewStore } from "@/stores/mapViewStore";
import { Button } from "@/components/ui/button";
import { useBoxDraw } from "@/composables/geoBoxDraw";
import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { drawGeoJsonLayer } from "@/composables/openlayersHelpers";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import bboxPolygon from "@turf/bbox-polygon";
import type { ViewConstraints } from "@/geo/contracts/mapAdapter";

const EXTENT_SOURCE_ID = "mapSettingsExtentSource";
const EXTENT_FILL_LAYER_ID = "mapSettingsExtentFill";
const EXTENT_LINE_LAYER_ID = "mapSettingsExtentLine";

const scn = injectStrict(activeScenarioKey);
const { store } = scn;
const mapSettings = useMapSettingsStore();
const baseLayersStore = useBaseLayersStore();
const geoStore = useGeoStore();
const mapViewStore = useMapViewStore();

const {
  isActive: isDrawing,
  start: startDrawing,
  cancel: stopDrawing,
  onDrawEnd,
} = useBoxDraw(() => geoStore.mapAdapter);

onDrawEnd((bbox) => {
  store.update((s) => {
    s.mapSettings.maxExtent = bbox;
  });
});

const baseMapItems = computed((): SelectItem[] => {
  const layers = baseLayersStore.layers.map((l) => ({ label: l.title, value: l.name }));
  return [...layers, { label: "No base map", value: "None" }];
});

const baseMap = computed({
  get: () => store.state.mapSettings.baseMapId,
  set: (value: string) => {
    store.update((s) => {
      s.mapSettings.baseMapId = value;
      mapSettings.baseLayerName = value;
    });
    baseLayersStore.selectLayer(value);
  },
});

const minZoom = computed({
  get: () => store.state.mapSettings.minZoom,
  set: (value: number | undefined) => {
    store.update((s) => {
      s.mapSettings.minZoom = value;
    });
  },
});

const maxZoom = computed({
  get: () => store.state.mapSettings.maxZoom,
  set: (value: number | undefined) => {
    store.update((s) => {
      s.mapSettings.maxZoom = value;
    });
  },
});

const hasMaxExtent = computed(() => {
  const ext = store.state.mapSettings.maxExtent;
  return ext && ext.length === 4;
});

const maxExtent = computed(() => store.state.mapSettings.maxExtent);

const formattedExtent = computed(() => {
  const ext = store.state.mapSettings.maxExtent;
  if (!ext || ext.length !== 4) return "Not set";
  const [minLon, minLat, maxLon, maxLat] = ext;
  return `SW: ${minLat.toFixed(4)}, ${minLon.toFixed(4)} — NE: ${maxLat.toFixed(4)}, ${maxLon.toFixed(4)}`;
});

function toggleDrawing() {
  if (isDrawing.value) {
    stopDrawing();
  } else {
    startDrawing();
  }
}

function setExtentFromMapView() {
  const bbox = geoStore.getMapViewBbox();
  if (!bbox) return;
  store.update((s) => {
    s.mapSettings.maxExtent = bbox;
  });
}

function clearExtent() {
  store.update((s) => {
    delete s.mapSettings.maxExtent;
  });
}

function clearMinZoom() {
  store.update((s) => {
    delete s.mapSettings.minZoom;
  });
}

function clearMaxZoom() {
  store.update((s) => {
    delete s.mapSettings.maxZoom;
  });
}

// --- Disable view constraints while panel is open ---

function disableViewConstraints() {
  const adapter = geoStore.mapAdapter;
  if (!adapter) return;
  adapter.setViewConstraints({ extent: null, minZoom: null, maxZoom: null });
}

function applyCurrentConstraints() {
  const adapter = geoStore.mapAdapter;
  if (!adapter) return;
  const s = store.state.mapSettings;
  adapter.setViewConstraints({
    extent: s.maxExtent ?? null,
    minZoom: s.minZoom ?? null,
    maxZoom: s.maxZoom ?? null,
  });
}

// --- Bbox visualization helpers ---

function getNativeMap(): OLMap | MlMap | undefined {
  return geoStore.mapAdapter?.getNativeMap() as OLMap | MlMap | undefined;
}

function isOLMap(map: unknown): map is OLMap {
  return map instanceof OLMap;
}

const isOL = computed(() => isOLMap(getNativeMap()));

// --- OpenLayers bbox layer ---
let olBboxLayer: VectorLayer | null = null;

function setupOLLayer(olMap: OLMap) {
  olBboxLayer = new VectorLayer({
    source: new VectorSource({}),
    style: {
      "stroke-color": "#3b82f6",
      "stroke-width": 2,
      "stroke-line-dash": [8, 8],
      "fill-color": "rgba(59, 130, 246, 0.1)",
    },
  });
  olMap.addLayer(olBboxLayer);
}

function drawOLBbox() {
  if (!olBboxLayer) return;
  const ext = maxExtent.value;
  if (ext && ext.length === 4) {
    drawGeoJsonLayer(olBboxLayer, bboxPolygon(ext));
  } else {
    olBboxLayer.getSource()?.clear();
  }
}

function cleanupOLLayer() {
  const map = getNativeMap();
  if (olBboxLayer && map && isOLMap(map)) {
    olBboxLayer.getSource()?.clear();
    map.removeLayer(olBboxLayer);
  }
  olBboxLayer = null;
}

// --- MapLibre bbox layer ---
let mlMapRef: MlMap | null = null;

function setupMLLayers(mlMap: MlMap) {
  mlMapRef = mlMap;
  if (!mlMap.getSource(EXTENT_SOURCE_ID)) {
    mlMap.addSource(EXTENT_SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
  }
  if (!mlMap.getLayer(EXTENT_FILL_LAYER_ID)) {
    mlMap.addLayer({
      id: EXTENT_FILL_LAYER_ID,
      type: "fill",
      source: EXTENT_SOURCE_ID,
      paint: { "fill-color": "rgba(59, 130, 246, 0.1)" },
    });
  }
  if (!mlMap.getLayer(EXTENT_LINE_LAYER_ID)) {
    mlMap.addLayer({
      id: EXTENT_LINE_LAYER_ID,
      type: "line",
      source: EXTENT_SOURCE_ID,
      paint: {
        "line-color": "#3b82f6",
        "line-width": 2,
        "line-dasharray": [4, 4],
      },
    });
  }
}

function drawMLBbox() {
  if (!mlMapRef) return;
  const source = mlMapRef.getSource(EXTENT_SOURCE_ID) as GeoJSONSource | undefined;
  if (!source) return;
  const ext = maxExtent.value;
  if (ext && ext.length === 4) {
    source.setData(bboxPolygon(ext));
  } else {
    source.setData({ type: "FeatureCollection", features: [] });
  }
}

function cleanupMLLayers() {
  if (!mlMapRef) return;
  if (mlMapRef.getLayer(EXTENT_LINE_LAYER_ID)) mlMapRef.removeLayer(EXTENT_LINE_LAYER_ID);
  if (mlMapRef.getLayer(EXTENT_FILL_LAYER_ID)) mlMapRef.removeLayer(EXTENT_FILL_LAYER_ID);
  if (mlMapRef.getSource(EXTENT_SOURCE_ID)) mlMapRef.removeSource(EXTENT_SOURCE_ID);
  mlMapRef = null;
}

function drawBboxOnMap() {
  if (isOL.value) {
    drawOLBbox();
  } else {
    drawMLBbox();
  }
}

watch(maxExtent, () => drawBboxOnMap());

onMounted(() => {
  disableViewConstraints();
  const map = getNativeMap();
  if (!map) return;
  if (isOLMap(map)) {
    setupOLLayer(map);
    drawOLBbox();
  } else {
    setupMLLayers(map as MlMap);
    drawMLBbox();
  }
});

onUnmounted(() => {
  stopDrawing();
  cleanupOLLayer();
  cleanupMLLayers();
  applyCurrentConstraints();
});
</script>

<template>
  <div class="space-y-4">
    <SimpleSelect label="Default base map" :items="baseMapItems" v-model="baseMap" />

    <section class="space-y-3">
      <h4 class="text-sm font-medium">View constraints</h4>
      <p class="text-muted-foreground text-sm">
        Limit the map view to a specific area and zoom range. Current zoom:
        {{ mapViewStore.zoomLevel.toFixed(1) }}.
      </p>

      <div class="space-y-2">
        <div class="flex items-end gap-2">
          <NumberInputGroup
            label="Min zoom"
            v-model="minZoom"
            :min="0"
            :max="28"
            :step="1"
            class="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            @click="clearMinZoom"
            :disabled="minZoom == null"
          >
            Clear
          </Button>
        </div>
        <div class="flex items-end gap-2">
          <NumberInputGroup
            label="Max zoom"
            v-model="maxZoom"
            :min="0"
            :max="28"
            :step="1"
            class="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            @click="clearMaxZoom"
            :disabled="maxZoom == null"
          >
            Clear
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Max extent</label>
        <p class="text-sm" :class="hasMaxExtent ? '' : 'text-muted-foreground'">
          {{ formattedExtent }}
        </p>
        <div class="flex flex-wrap gap-2">
          <Button
            :variant="isDrawing ? 'default' : 'outline'"
            size="sm"
            @click="toggleDrawing"
          >
            {{ isDrawing ? "Cancel drawing" : "Draw on map" }}
          </Button>
          <Button variant="outline" size="sm" @click="setExtentFromMapView">
            Set from map view
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="clearExtent"
            :disabled="!hasMaxExtent"
          >
            Clear
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>
