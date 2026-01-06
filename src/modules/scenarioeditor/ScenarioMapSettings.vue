<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed } from "vue";
import { type SelectItem } from "@/components/types";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useBaseLayersStore } from "@/stores/baseLayersStore";

const scn = injectStrict(activeScenarioKey);
const { store } = scn;
const mapSettings = useMapSettingsStore();
const baseLayersStore = useBaseLayersStore();

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
</script>

<template>
  <div>
    <SimpleSelect label="Default base map" :items="baseMapItems" v-model="baseMap" />
  </div>
</template>
