<script setup lang="ts">
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CONTROL_MEASURE_STROKE_WIDTH_PRESETS } from "@/modules/scenarioeditor/controlMeasureStyleOptions";

defineProps<{ modelValue: number }>();
const emit = defineEmits<{ "update:modelValue": [value: number] }>();

function choose(value: unknown) {
  if (typeof value === "number") emit("update:modelValue", value);
}
</script>

<template>
  <ToggleGroup
    type="single"
    :disable-deselection="true"
    :model-value="modelValue"
    variant="outline"
    class="grid w-full grid-cols-3 gap-1"
    aria-label="Stroke width"
    @update:model-value="choose"
  >
    <ToggleGroupItem
      v-for="preset in CONTROL_MEASURE_STROKE_WIDTH_PRESETS"
      :key="preset.value"
      :value="preset.value"
      class="w-full px-2"
      :aria-label="`${preset.label} stroke, ${preset.value} ${preset.value === 1 ? 'pixel' : 'pixels'}`"
      :title="preset.label"
    >
      <span
        class="block w-10 max-w-full border-t border-current"
        aria-hidden="true"
        :style="{ borderTopWidth: `${preset.value}px` }"
      />
    </ToggleGroupItem>
  </ToggleGroup>
</template>
