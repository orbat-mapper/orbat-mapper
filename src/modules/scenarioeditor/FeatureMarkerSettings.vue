<script setup lang="ts">
import { computed, ref } from "vue";
import { MarkerStyleSpec } from "@/geo/simplestyle";
import { type ScenarioFeature } from "@/types/scenarioGeoModels";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { SelectItem } from "@/components/types";

const settings = ref<Partial<MarkerStyleSpec>>({});
const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{ (e: "update", value: Partial<MarkerStyleSpec>): void }>();

const marker = computed((): Partial<MarkerStyleSpec> => {
  const { properties } = props.feature;
  return {
    "marker-symbol": properties["marker-symbol"] || "circle",
  };
});

function updateValue(name: keyof MarkerStyleSpec, value: string | number) {
  emit("update", { [name]: value });
}

const markerItems: SelectItem[] = [
  { label: "Circle", value: "circle" },
  { label: "Cross", value: "cross" },
  { label: "Hexagon", value: "hexagon" },
  { label: "Pentagon", value: "pentagon" },
  { label: "Star", value: "star" },
  { label: "Square", value: "square" },
  { label: "Triangle", value: "triangle" },
  { label: "X", value: "x" },
];
</script>

<template>
  <header class="flex items-center justify-between">
    <h4 class="text-sm font-bold text-gray-700">Marker</h4>
  </header>
  <div class="mt-4 space-y-4">
    <SimpleSelect
      :items="markerItems"
      :model-value="marker['marker-symbol']"
      @update:model-value="updateValue('marker-symbol', $event)"
    />
  </div>
</template>
