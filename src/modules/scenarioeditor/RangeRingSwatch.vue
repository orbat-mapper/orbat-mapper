<script setup lang="ts">
import { computed } from "vue";
import { resolveRingColors } from "@/composables/maplibreRangeRings";
import type { RangeRingStyle } from "@/types/scenarioGeoModels";

const props = defineProps<{
  /** Stroke and fill of the ring; muted when left out. */
  styling?: Partial<RangeRingStyle>;
}>();

const swatchStyle = computed(() => {
  const s = props.styling;
  if (!s) return undefined;
  const { strokeColor, fillColor } = resolveRingColors(s);
  const dashed = s["stroke-style"] && s["stroke-style"] !== "solid";
  return {
    borderColor: strokeColor,
    borderStyle: dashed ? "dashed" : "solid",
    backgroundColor: fillColor,
  };
});
</script>

<template>
  <span
    class="inline-block shrink-0 rounded-full border-2"
    :class="{ 'border-muted-foreground border-dashed': !styling }"
    :style="swatchStyle"
  />
</template>
