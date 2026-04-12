<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed } from "vue";
import { type SelectItem } from "@/components/types";
import SimpleSelect from "@/components/SimpleSelect.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useBaseLayersStore } from "@/stores/baseLayersStore";
import { useGeoStore } from "@/stores/geoStore";
import { useMapViewStore } from "@/stores/mapViewStore";
import { Button } from "@/components/ui/button";

const scn = injectStrict(activeScenarioKey);
const { store } = scn;
const mapSettings = useMapSettingsStore();
const baseLayersStore = useBaseLayersStore();
const geoStore = useGeoStore();
const mapViewStore = useMapViewStore();

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

const formattedExtent = computed(() => {
  const ext = store.state.mapSettings.maxExtent;
  if (!ext || ext.length !== 4) return "Not set";
  const [minLon, minLat, maxLon, maxLat] = ext;
  return `SW: ${minLat.toFixed(4)}, ${minLon.toFixed(4)} — NE: ${maxLat.toFixed(4)}, ${maxLon.toFixed(4)}`;
});

function setExtentFromMapView() {
  const bbox = geoStore.getMapViewBbox();
  if (!bbox) return;
  store.update((s) => {
    s.mapSettings.maxExtent = bbox;
  });
}

function clearExtent() {
  store.update((s) => {
    s.mapSettings.maxExtent = undefined;
  });
}

function clearMinZoom() {
  store.update((s) => {
    s.mapSettings.minZoom = undefined;
  });
}

function clearMaxZoom() {
  store.update((s) => {
    s.mapSettings.maxZoom = undefined;
  });
}
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
