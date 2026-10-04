<script setup lang="ts">
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from "reka-ui";

// The installed Slider wrapper cannot label its thumb, so compose Reka here.
defineProps<{ labelledby: string; min: number; max: number; step: number }>();
const model = defineModel<number>({ required: true });

function update(values?: number[]) {
  if (values?.[0] !== undefined) model.value = values[0];
}
</script>

<template>
  <SliderRoot
    class="relative flex w-full touch-none items-center select-none"
    :model-value="[model]"
    :min="min"
    :max="max"
    :step="step"
    @update:model-value="update"
  >
    <SliderTrack class="bg-muted relative h-1.5 grow overflow-hidden rounded-full">
      <SliderRange class="bg-primary absolute h-full" />
    </SliderTrack>
    <SliderThumb
      :aria-labelledby="labelledby"
      class="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm focus-visible:ring-4 focus-visible:outline-hidden"
    />
  </SliderRoot>
</template>
