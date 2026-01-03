<script setup lang="ts">
import { computed } from "vue";
import { RadioGroupRoot, RadioGroupItem, Label } from "reka-ui";
import type { MarkerStyleSpec, MarkerSymbol, SimpleStyleSpec } from "@/geo/simplestyle";
import type { ScenarioFeature } from "@/types/scenarioGeoModels";
import type { SelectItem } from "@/components/types";
import DrawMarker from "@/components/DrawMarker.vue";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";

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
  <PopoverColorPicker
    :model-value="marker['marker-color']"
    @update:model-value="updateValue('marker-color', $event)"
  />
  <div class="self-center">Size</div>
  <RadioGroupRoot
    :model-value="marker['marker-size']"
    @update:model-value="updateValue('marker-size', $event)"
    class=""
  >
    <Label class="sr-only">Select marker size</Label>
    <div class="flex flex-wrap items-center gap-2">
      <RadioGroupItem
        v-for="option in sizeOptions"
        :key="option.name"
        :value="option.value"
        :class="[
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
          'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:hover:bg-primary/90',
          'bg-muted text-foreground border-border hover:bg-muted/90 border',
          'flex cursor-pointer items-center justify-center rounded-md px-5 py-3 text-sm font-semibold uppercase focus:outline-hidden',
        ]"
      >
        <span>{{ option.name }}</span>
      </RadioGroupItem>
    </div>
  </RadioGroupRoot>

  <div class="self-center">Shape</div>

  <RadioGroupRoot
    :model-value="marker['marker-symbol']"
    @update:model-value="updateValue('marker-symbol', $event)"
    class="mt-2"
  >
    <div class="flex flex-wrap items-center gap-1">
      <RadioGroupItem
        v-for="option in markerItems"
        :key="option.value"
        :value="option.value"
        :class="[
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
          'data-[state=checked]:bg-primary/80 data-[state=checked]:text-primary-foreground data-[state=checked]:hover:bg-primary',
          'bg-muted text-foreground hover:bg-muted/90',
          'flex cursor-pointer items-center justify-center rounded-md px-2 py-2 text-sm font-semibold uppercase focus:outline-hidden',
        ]"
      >
        <span class="sr-only">{{ option.label }}</span>
        <span aria-hidden="true"
          ><DrawMarker :marker="option.value" :color="marker['marker-color']"
        /></span>
      </RadioGroupItem>
    </div>
  </RadioGroupRoot>
</template>
