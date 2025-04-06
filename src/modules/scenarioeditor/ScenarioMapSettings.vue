<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed } from "vue";
import { type SelectItem } from "@/components/types";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

const scn = injectStrict(activeScenarioKey);
const { store } = scn;
const mapSettings = useMapSettingsStore();

const baseMapItems: SelectItem[] = [
  { label: "Open Street Map", value: "osm" },
  { label: "Open Street Map (DE)", value: "osm-de" },
  { label: "Gray Basemap", value: "grayBasemap" },
  { label: "Open Topo Map", value: "openTopoMap" },
  { label: "ESRI World Imagery", value: "esriWorldImagery" },
  { label: "Topographic Map Norway", value: "kartverketTopo4" },
  { label: "No base map", value: "None" },
];

const baseMap = computed({
  get: () => store.state.mapSettings.baseMapId,
  set: (value: string) => {
    store.update((s) => {
      s.mapSettings.baseMapId = value;
      mapSettings.baseLayerName = value;
    });
  },
});
</script>

<template>
  <div>
    <SimpleSelect label="Default base map" :items="baseMapItems" v-model="baseMap" />
  </div>
</template>
