<script setup lang="ts">
import { computed } from "vue";
import { SimpleStyleSpec, VisibilityStyleSpec } from "@/geo/simplestyle";
import { ScenarioFeature } from "@/types/scenarioGeoModels";
import ToggleField from "@/components/ToggleField.vue";
import ZoomSelector from "@/components/ZoomSelector.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{
  (e: "update", value: { style: Partial<SimpleStyleSpec> }): void;
}>();

const marker = computed((): Partial<VisibilityStyleSpec> => {
  const { style } = props.feature;
  return {
    limitVisibility: style["limitVisibility"] ?? false,
    minZoom: style["minZoom"] ?? 0,
    maxZoom: style["maxZoom"] ?? 24,
  };
});

function updateValue(name: keyof VisibilityStyleSpec, value: boolean | number | string) {
  emit("update", { style: { [name]: value } });
}

const range = computed({
  get: (): [number, number] => [marker.value.minZoom ?? 0, marker.value.maxZoom ?? 24],
  set: (v) => {
    emit("update", { style: { minZoom: +v[0], maxZoom: +v[1] } });
  },
});
</script>
<template>
  <div class="col-span-2 -mb-6 mt-2 font-semibold">Visibility</div>
  <div class="self-end">Limit</div>
  <ToggleField
    class="mt-4"
    :model-value="marker['limitVisibility']"
    @update:model-value="updateValue('limitVisibility', $event)"
  />
  <template v-if="marker.limitVisibility">
    <div>Zoom levels</div>
    <ZoomSelector v-model="range" class="mt-4 flex-auto" />
  </template>
</template>
