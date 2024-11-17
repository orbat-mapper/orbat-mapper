<script setup lang="ts">
import { computed } from "vue";

import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { MarkerStyleSpec, MarkerSymbol, SimpleStyleSpec } from "@/geo/simplestyle";
import { ScenarioFeature } from "@/types/scenarioGeoModels";
import { SelectItem } from "@/components/types";
import DrawMarker from "@/components/DrawMarker.vue";
import ColorPicker from "@/components/ColorPicker.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{
  (e: "update", value: { style: Partial<SimpleStyleSpec> }): void;
}>();

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
  const { style } = props.feature;
  return {
    "marker-color": style["marker-color"] || "black",
    "marker-symbol": style["marker-symbol"] || "circle",
    "marker-size": style["marker-size"] || "medium",
  };
});

function updateValue(name: keyof MarkerStyleSpec, value: string | number | boolean) {
  if (name === "marker-color") {
    emit("update", {
      style: {
        fill: value as string,
        stroke: value as string,
        "marker-color": value as string,
      },
    });
  } else {
    emit("update", { style: { [name]: value } });
  }
}
</script>
<template>
  <div class="col-span-2 -mb-2 font-semibold">Symbol</div>
  <div class="self-center">Color</div>
  <ColorPicker
    :model-value="marker['marker-color']"
    @update:model-value="updateValue('marker-color', $event)"
  />
  <div class="self-center">Size</div>
  <RadioGroup
    :model-value="marker['marker-size']"
    @update:model-value="updateValue('marker-size', $event)"
    class=""
  >
    <RadioGroupLabel class="sr-only">Select marker size</RadioGroupLabel>
    <div class="flex flex-wrap items-center gap-2">
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
            'flex cursor-pointer items-center justify-center rounded-md px-5 py-3 text-sm font-semibold uppercase',
          ]"
        >
          <RadioGroupLabel as="span">{{ option.name }}</RadioGroupLabel>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>

  <div class="self-center">Shape</div>

  <RadioGroup
    :model-value="marker['marker-symbol']"
    @update:model-value="updateValue('marker-symbol', $event)"
    class="mt-2"
  >
    <RadioGroupLabel class="sr-only">Select marker size</RadioGroupLabel>
    <div class="flex flex-wrap items-center gap-1">
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
            'flex cursor-pointer items-center justify-center rounded-md px-2 py-2 text-sm font-semibold uppercase',
          ]"
        >
          <RadioGroupLabel as="span" class="sr-only">{{ option.label }}</RadioGroupLabel>
          <span aria-hidden="true"
            ><DrawMarker :marker="option.value" :color="marker['marker-color']"
          /></span>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>
