<script setup lang="ts">
import { computed } from "vue";
import { SimpleStyleSpec, StrokeStyleSpec, TextStyleSpec } from "@/geo/simplestyle";
import { ScenarioFeature } from "@/types/scenarioGeoModels";
import ColorPicker from "@/components/ColorPicker.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{
  (e: "update", value: { style: Partial<SimpleStyleSpec> }): void;
}>();

const marker = computed(() => {
  const { style } = props.feature;
  return {
    stroke: style["stroke"] || "black",
    "stroke-width": style["stroke-width"] || 2,
    "stroke-opacity": style["stroke-opacity"] ?? 1,
  };
});

function updateValue(
  name: keyof (StrokeStyleSpec & TextStyleSpec),
  value: string | number | boolean,
) {
  emit("update", { style: { [name]: value } });
}

const width = computed({
  get: () => marker.value["stroke-width"],
  set: (v) => emit("update", { style: { "stroke-width": v } }),
});

const opacity = computed({
  get: () => marker.value["stroke-opacity"],
  set: (v) => emit("update", { style: { "stroke-opacity": v } }),
});

const opacityAsPercent = computed(() => (opacity.value! * 100).toFixed(0));

function onChange(e: any) {}
</script>

<template>
  <div class="col-span-2 -mb-2 font-semibold">Stroke</div>
  <div class="self-center">Color</div>
  <ColorPicker
    class=""
    :model-value="marker['stroke']"
    @update:model-value="updateValue('stroke', $event)"
  />
  <label for="stroke-width" class="">Width</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <input
      id="stroke-width"
      v-model.number="width"
      type="range"
      min="1"
      max="10"
      step="1"
      @change="onChange($event)"
      class="min-w-20"
    />
    <span class="">{{ marker["stroke-width"] }} px</span>
  </div>
  <label for="stroke-opacity">Opacity</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <input
      id="stroke-opacity"
      v-model.number="opacity"
      type="range"
      min="0"
      max="1"
      step="0.01"
      @change="onChange($event)"
      class="min-w-20"
    />
    <span class="">{{ opacityAsPercent }}%</span>
  </div>
</template>
