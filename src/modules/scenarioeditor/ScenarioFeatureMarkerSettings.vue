<script setup lang="ts">
import { computed } from "vue";

import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { MarkerStyleSpec, MarkerSymbol } from "@/geo/simplestyle";
import { ScenarioFeature } from "@/types/scenarioGeoModels";
import { SelectItem } from "@/components/types";
import DrawMarker from "@/components/DrawMarker.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{ (e: "update", value: Partial<MarkerStyleSpec>): void }>();

const sizeOptions = [
  { name: "S", value: "small" },
  { name: "M", value: "medium" },
  { name: "L", value: "large" },
];

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
</script>
<template>
  <div>
    <section class="mt-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium leading-6 text-gray-900">Symbol size</h2>
      </div>

      <RadioGroup
        :model-value="marker['marker-size']"
        @update:model-value="updateValue('marker-size', $event)"
        class="mt-2"
      >
        <RadioGroupLabel class="sr-only">Select marker size</RadioGroupLabel>
        <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
          <RadioGroupOption
            as="template"
            v-for="option in sizeOptions"
            :key="option.name"
            :value="option.value"
            v-slot="{ active, checked }"
          >
            <div
              :class="[
                active ? 'ring-2 ring-indigo-600 ring-offset-2' : '',
                checked
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
                'flex cursor-pointer items-center justify-center rounded-md px-3 py-3 text-sm font-semibold uppercase sm:flex-1',
              ]"
            >
              <RadioGroupLabel as="span">{{ option.name }}</RadioGroupLabel>
            </div>
          </RadioGroupOption>
        </div>
      </RadioGroup>
    </section>
    <section class="mt-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium leading-6 text-gray-900">Shape</h2>
      </div>

      <RadioGroup
        :model-value="marker['marker-symbol']"
        @update:model-value="updateValue('marker-symbol', $event)"
        class="mt-2"
      >
        <RadioGroupLabel class="sr-only">Select marker size</RadioGroupLabel>
        <div class="grid gap-1 sm:grid-cols-8">
          <RadioGroupOption
            as="template"
            v-for="option in markerItems"
            :key="option.value"
            :value="option.value"
            v-slot="{ active, checked }"
          >
            <div
              :class="[
                active ? 'ring-2 ring-indigo-600 ring-offset-2' : '',
                checked
                  ? 'bg-indigo-300 text-white hover:bg-indigo-500'
                  : 'bg-white text-gray-900 ring-0 ring-inset hover:bg-gray-50',
                'flex cursor-pointer items-center justify-center rounded-md px-3 py-3 text-sm font-semibold uppercase sm:flex-1',
              ]"
            >
              <RadioGroupLabel as="span" class="sr-only">{{
                option.label
              }}</RadioGroupLabel>
              <span aria-hidden="true"><DrawMarker :marker="option.value" /></span>
            </div>
          </RadioGroupOption>
        </div>
      </RadioGroup>
    </section>
  </div>
</template>
