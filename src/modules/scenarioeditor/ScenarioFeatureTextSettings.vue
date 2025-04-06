<script setup lang="ts">
import { computed } from "vue";
import type { SimpleStyleSpec, TextStyleSpec } from "@/geo/simplestyle";
import type { ScenarioFeature } from "@/types/scenarioGeoModels";
import ToggleField from "@/components/ToggleField.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{
  (e: "update", value: { style: Partial<SimpleStyleSpec> }): void;
}>();

const marker = computed((): Partial<TextStyleSpec> => {
  const { style } = props.feature;
  return {
    showLabel: style["showLabel"] ?? false,
    "text-placement": style["text-placement"] || "point",
    "text-align": style["text-align"] || "center",
    "text-offset-x": style["text-offset-x"] ?? 15,
    "text-offset-y": style["text-offset-y"] ?? 0,
  };
});

const placements = [
  { label: "Point", value: "point" },
  { label: "Line", value: "line" },
];

const align = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Start", value: "start" },
  { label: "End", value: "end" },
];

function updateValue(name: keyof TextStyleSpec, value: boolean) {
  emit("update", { style: { [name]: value } });
}
</script>
<template>
  <div class="col-span-2 -mb-6 font-semibold">Text</div>
  <div class="self-end">Label</div>
  <ToggleField
    class="mt-4"
    :model-value="marker['showLabel']"
    @update:model-value="updateValue('showLabel', $event)"
  />
  <template v-if="marker.showLabel">
    <div class="self-center">Placement</div>
    <SimpleSelect
      :model-value="marker['text-placement']"
      @update:model-value="updateValue('text-placement', $event)"
      :items="placements"
      class="max-w-[10rem]"
    >
    </SimpleSelect>
    <div class="self-center">Alignment</div>
    <SimpleSelect
      :model-value="marker['text-align']"
      @update:model-value="updateValue('text-align', $event)"
      :items="align"
      class="max-w-[10rem]"
    />
    <div class="self-center">Offset X</div>
    <NumberInputGroup
      :model-value="marker['text-offset-x']"
      @update:model-value="updateValue('text-offset-x', $event)"
      class="max-w-[10rem]"
    />
    <div class="self-center">Offset Y</div>
    <NumberInputGroup
      :model-value="marker['text-offset-y']"
      @update:model-value="updateValue('text-offset-y', $event)"
      class="max-w-[10rem]"
    />
  </template>
</template>
