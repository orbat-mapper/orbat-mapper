<script setup lang="ts">
import { computed, ref } from "vue";
import { MarkerSize, MarkerStyleSpec, MarkerSymbol } from "@/geo/simplestyle";
import { type ScenarioFeature } from "@/types/scenarioGeoModels";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { SelectItem } from "@/components/types";
import SettingsPanel from "@/components/SettingsPanel.vue";
import { useStorage } from "@vueuse/core";

const settings = ref<Partial<MarkerStyleSpec>>({});
const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{ (e: "update", value: Partial<MarkerStyleSpec>): void }>();

const marker = computed((): Partial<MarkerStyleSpec> => {
  const { properties } = props.feature;
  return {
    "marker-symbol": properties["marker-symbol"] || "circle",
    "marker-size": properties["marker-size"] || "medium",
  };
});

function updateValue(name: keyof MarkerStyleSpec, value: string | number) {
  emit("update", { [name]: value });
}

const markerItems: SelectItem<MarkerSymbol>[] = [
  { label: "Circle", value: "circle" },
  { label: "Cross", value: "cross" },
  { label: "Hexagon", value: "hexagon" },
  { label: "Pentagon", value: "pentagon" },
  { label: "Star", value: "star" },
  { label: "Square", value: "square" },
  { label: "Triangle", value: "triangle" },
  { label: "X", value: "x" },
];

const markerSize: SelectItem<MarkerSize>[] = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

const open = useStorage("marker-settings", true);
</script>

<template>
  <SettingsPanel label="Marker" v-model:open="open">
    <SimpleSelect
      :items="markerItems"
      :model-value="marker['marker-symbol']"
      @update:model-value="updateValue('marker-symbol', $event)"
    />
    <SimpleSelect
      label="Size"
      :items="markerSize"
      :model-value="marker['marker-size']"
      @update:model-value="updateValue('marker-size', $event)"
    />
  </SettingsPanel>
</template>
