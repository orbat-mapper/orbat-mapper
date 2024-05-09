<script setup lang="ts">
import { computed } from "vue";
import { FillStyleSpec, SimpleStyleSpec } from "@/geo/simplestyle";
import { ScenarioFeature } from "@/types/scenarioGeoModels";
import ColorPicker from "@/components/ColorPicker.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{ (e: "update", value: Partial<SimpleStyleSpec>): void }>();

const marker = computed(() => {
  const { properties } = props.feature;
  return {
    fill: properties["fill"] ?? "black",
    "fill-opacity": properties["fill-opacity"] ?? 0,
  };
});

function updateValue(name: keyof FillStyleSpec, value: string | number) {
  emit("update", { [name]: value });
}

const opacity = computed({
  get: () => marker.value["fill-opacity"],
  set: (v) => emit("update", { "fill-opacity": v }),
});

const opacityAsPercent = computed(() => (opacity.value! * 100).toFixed(0));

function onChange(e: any) {}
</script>

<template>
  <div class="col-span-2 -mb-2 font-semibold">Fill</div>
  <div class="self-center">Color</div>
  <ColorPicker
    :model-value="marker['fill']"
    @update:model-value="updateValue('fill', $event)"
  />

  <label for="stroke-opacity">Opacity</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <input
      id="stroke-opacity"
      v-model.number="opacity"
      type="range"
      min="0"
      max="1"
      step="0.01"
      class="min-w-20"
      @change="onChange($event)"
    />
    <span class="ml-2">{{ opacityAsPercent }}%</span>
  </div>
</template>
