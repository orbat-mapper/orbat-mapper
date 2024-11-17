<script setup lang="ts">
import { computed } from "vue";
import { SimpleStyleSpec, TextStyleSpec } from "@/geo/simplestyle";
import { ScenarioFeature } from "@/types/scenarioGeoModels";
import ToggleField from "@/components/ToggleField.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{
  (e: "update", value: { style: Partial<SimpleStyleSpec> }): void;
}>();

const marker = computed((): Partial<TextStyleSpec> => {
  const { style } = props.feature;
  return {
    showLabel: style["showLabel"] ?? false,
  };
});

function updateValue(name: keyof TextStyleSpec, value: boolean) {
  emit("update", { style: { [name]: value } });
}
</script>
<template>
  <div class="self-end">Label</div>
  <ToggleField
    class="mt-4"
    :model-value="marker['showLabel']"
    @update:model-value="updateValue('showLabel', $event)"
  />
</template>
