<script setup lang="ts">
import { computed } from "vue";
import {
  defaultFillColor,
  defaultFillOpacity,
  type FillStyleSpec,
  type SimpleStyleSpec,
} from "@/geo/simplestyle";
import { type ScenarioFeature } from "@/types/scenarioGeoModels";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";
import { Slider } from "@/components/ui/slider";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{
  (e: "update", value: { style: Partial<SimpleStyleSpec> }): void;
}>();

const marker = computed(() => {
  const { style } = props.feature;
  return {
    fill: style["fill"] ?? defaultFillColor,
    "fill-opacity": style["fill-opacity"] ?? defaultFillOpacity,
  };
});

function updateValue(name: keyof FillStyleSpec, value: string | number) {
  emit("update", { style: { [name]: value } });
}

const opacity = computed({
  get: () => [marker.value["fill-opacity"]],
  set: ([v]) => emit("update", { style: { "fill-opacity": v } }),
});

const opacityAsPercent = computed(() => (opacity.value[0]! * 100).toFixed(0));

function onChange(e: any) {}
</script>

<template>
  <div class="col-span-2 -mb-2 font-semibold">Fill</div>
  <div class="self-center">Color</div>
  <PopoverColorPicker
    :model-value="marker['fill']"
    @update:model-value="updateValue('fill', $event)"
  />

  <label for="stroke-opacity">Opacity</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <Slider
      id="stroke-opacity"
      v-model="opacity"
      :min="0"
      :max="1"
      :step="0.01"
      class="min-w-20"
      @change="onChange($event)"
    />
    <span class="ml-2">{{ opacityAsPercent }}%</span>
  </div>
</template>
