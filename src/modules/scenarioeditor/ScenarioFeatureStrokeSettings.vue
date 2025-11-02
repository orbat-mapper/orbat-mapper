<script setup lang="ts">
import { computed } from "vue";
import type { SimpleStyleSpec, StrokeStyleSpec, TextStyleSpec } from "@/geo/simplestyle";
import {
  defaultStrokeColor,
  defaultStrokeOpacity,
  defaultStrokeWidth,
} from "@/geo/simplestyle";
import type { ScenarioFeature } from "@/types/scenarioGeoModels";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";
import { Slider } from "@/components/ui/slider";
import NewSelect from "@/components/NewSelect.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{
  (e: "update", value: { style: Partial<SimpleStyleSpec> }): void;
}>();

const marker = computed(() => {
  const { style } = props.feature;
  return {
    stroke: style["stroke"] ?? defaultStrokeColor,
    "stroke-width": style["stroke-width"] ?? defaultStrokeWidth,
    "stroke-opacity": style["stroke-opacity"] ?? defaultStrokeOpacity,
    "stroke-style": style["stroke-style"] ?? "solid",
  };
});

function updateValue(
  name: keyof (StrokeStyleSpec & TextStyleSpec),
  value: string | number | boolean,
) {
  emit("update", { style: { [name]: value } });
}

const width = computed({
  get: () => [marker.value["stroke-width"]],
  set: ([v]) => emit("update", { style: { "stroke-width": v } }),
});

const opacity = computed({
  get: () => [marker.value["stroke-opacity"]],
  set: ([v]) => emit("update", { style: { "stroke-opacity": v } }),
});

const opacityAsPercent = computed(() => (opacity.value[0]! * 100).toFixed(0));

function onChange(e: any) {}
</script>

<template>
  <div class="col-span-2 -mb-2 font-semibold">Stroke</div>
  <div class="self-center">Color</div>
  <PopoverColorPicker
    class=""
    :model-value="marker['stroke']"
    @update:model-value="updateValue('stroke', $event)"
  />
  <label for="stroke-width" class="">Width</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <Slider
      id="stroke-width"
      v-model="width"
      :min="1"
      :max="10"
      :step="1"
      @change="onChange($event)"
      class="min-w-20"
    />
    <span class="">{{ marker["stroke-width"] }} px</span>
  </div>
  <label for="stroke-opacity">Opacity</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <Slider
      id="stroke-opacity"
      v-model="opacity"
      :min="0"
      :max="1"
      :step="0.01"
      @change="onChange($event)"
      class="min-w-20"
    />
    <span>{{ opacityAsPercent }}%</span>
  </div>
  <label for="stroke-style" class="self-center">Style</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <NewSelect
      id="stroke-style"
      :model-value="marker['stroke-style']"
      @update:model-value="updateValue('stroke-style', $event!)"
      :items="[
        { label: 'Solid', value: 'solid' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Dotted', value: 'dotted' },
      ]"
    />
  </div>
</template>
