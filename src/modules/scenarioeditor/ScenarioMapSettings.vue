<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";
import { NPersonnelData } from "@/types/internalModels";
import DotsMenu from "@/components/DotsMenu.vue";
import { useNotifications } from "@/composables/notifications";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";
import InputGroup from "@/components/InputGroup.vue";
import { SelectItem } from "@/components/types";
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
