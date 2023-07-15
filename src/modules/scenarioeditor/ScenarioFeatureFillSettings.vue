<script setup lang="ts">
import { computed, ref } from "vue";
import { FillStyleSpec, SimpleStyleSpec } from "@/geo/simplestyle";
import { ScenarioFeature } from "@/types/scenarioGeoModels";
import ColorPicker from "@/components/ColorPicker.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{ (e: "update", value: Partial<SimpleStyleSpec>): void }>();

const color = ref("#eab308");

const marker = computed(() => {
  const { properties } = props.feature;
  return {
    fill: properties["fill"] || "black",
    "fill-opacity": properties["fill-opacity"] ?? 0.5,
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
  <div>
    <section class="mt-4">
      <ColorPicker
        class="mt-4"
        :model-value="marker['fill']"
        @update:model-value="updateValue('fill', $event)"
        label="Fill"
      />
    </section>
    <section class="mt-4 grid w-full grid-cols-3 gap-x-6 gap-y-2 text-sm">
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
