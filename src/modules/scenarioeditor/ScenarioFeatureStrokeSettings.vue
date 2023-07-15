<script setup lang="ts">
import { computed, ref } from "vue";
import { SimpleStyleSpec, StrokeStyleSpec } from "@/geo/simplestyle";
import { ScenarioFeature } from "@/types/scenarioGeoModels";
import ColorPicker from "@/components/ColorPicker.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{ (e: "update", value: Partial<SimpleStyleSpec>): void }>();

const color = ref("#eab308");

const marker = computed(() => {
  const { properties } = props.feature;
  return {
    stroke: properties["stroke"] || "black",
    "stroke-width": properties["stroke-width"] || 2,
    "stroke-opacity": properties["stroke-opacity"] ?? 1,
  };
});

function updateValue(name: keyof StrokeStyleSpec, value: string | number) {
  emit("update", { [name]: value });
}

const width = computed({
  get: () => marker.value["stroke-width"],
  set: (v) => emit("update", { "stroke-width": v }),
});

const opacity = computed({
  get: () => marker.value["stroke-opacity"],
  set: (v) => emit("update", { "stroke-opacity": v }),
});

const opacityAsPercent = computed(() => (opacity.value! * 100).toFixed(0));

function onChange(e: any) {}
</script>

<template>
  <div>
    <section class="mt-4">
      <ColorPicker
        class="mt-4"
        :model-value="marker['stroke']"
        @update:model-value="updateValue('stroke', $event)"
        label="Stroke"
      />
    </section>
    <section class="mt-4 grid w-full grid-cols-3 gap-x-6 gap-y-2 text-sm">
      <label for="stroke-width">Width</label>
      <input
        id="stroke-width"
        v-model.number="width"
        type="range"
        min="1"
        max="10"
        step="1"
        class="w-28"
        @change="onChange($event)"
      />
      <span class="ml-2">{{ marker["stroke-width"] }}</span>
      <label for="stroke-opacity">Opacity</label>
      <input
        id="stroke-opacity"
        v-model.number="opacity"
        type="range"
        min="0"
        max="1"
        step="0.01"
        class="w-28"
        @change="onChange($event)"
      />
      <span class="ml-2">{{ opacityAsPercent }}%</span>
    </section>
  </div>
</template>
