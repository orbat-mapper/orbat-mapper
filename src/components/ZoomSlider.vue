<script setup lang="ts">
import type { SliderRootEmits, SliderRootProps } from "reka-ui";
import { cn } from "@/lib/utils";
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  useForwardPropsEmits,
} from "reka-ui";
import { computed, type HTMLAttributes } from "vue";
import { useMapViewStore } from "@/stores/mapViewStore";

const props = defineProps<SliderRootProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<SliderRootEmits>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <SliderRoot
    :class="
      cn(
        'relative flex w-full touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2 data-[orientation=vertical]:flex-col',
        props.class,
      )
    "
    v-bind="forwarded"
  >
    <SliderTrack
      class="bg-secondary relative h-2 w-full grow overflow-hidden rounded-full data-[orientation=vertical]:w-2"
    >
      <SliderRange
        class="bg-primary absolute h-full data-[orientation=vertical]:w-full"
      />
    </SliderTrack>
    <SliderThumb
      v-for="(_, key) in modelValue"
      :key="key"
      class="border-primary bg-background ring-offset-background focus-visible:ring-ring flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 text-center text-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      >{{ _ }}</SliderThumb
    >
  </SliderRoot>
</template>
