<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import { useMapHover } from "@/composables/geoHover";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

const props = withDefaults(
  defineProps<{
    isDragging?: boolean;
  }>(),
  { isDragging: false },
);

const { geo } = injectStrict(activeScenarioKey);
const mapSettings = useMapSettingsStore();

const SHOW_DELAY_MS = 150;
const { features: hoveredFeatures, pixel: hoveredPixel } = useMapHover();

const rawHoveredFeatureName = computed(() => {
  for (const hoveredFeature of hoveredFeatures.value) {
    const featureId = hoveredFeature?.getId?.();
    if (featureId === undefined || featureId === null) continue;
    const { feature } = geo.getFeatureById(featureId);
    const name = feature?.meta?.name?.trim();
    if (name) return name;
  }
  return "";
});

const delayedHoveredFeatureName = ref("");
const pendingHoveredFeatureName = ref("");

const { start: startShowTimer, stop: stopShowTimer } = useTimeoutFn(
  () => {
    delayedHoveredFeatureName.value = pendingHoveredFeatureName.value;
  },
  SHOW_DELAY_MS,
  { immediate: false },
);

watch(
  [rawHoveredFeatureName, () => props.isDragging, () => mapSettings.showFeatureTooltip],
  ([name, isDragging, showFeatureTooltip]) => {
    stopShowTimer();
    if (isDragging || !showFeatureTooltip || !name) {
      pendingHoveredFeatureName.value = "";
      delayedHoveredFeatureName.value = "";
      return;
    }
    pendingHoveredFeatureName.value = name;
    startShowTimer();
  },
  { immediate: true },
);

const hoverTooltipStyle = computed(() => {
  const pixel = hoveredPixel.value;
  if (!pixel) return {};
  return {
    left: `${pixel[0] + 12}px`,
    top: `${pixel[1] + 12}px`,
  };
});
</script>

<template>
  <div
    v-if="
      mapSettings.showFeatureTooltip &&
      delayedHoveredFeatureName &&
      hoveredPixel &&
      !props.isDragging
    "
    data-test="hover-feature-tooltip"
    class="bg-background/95 text-foreground pointer-events-none absolute z-40 rounded px-2 py-1 text-xs shadow-md"
    :style="hoverTooltipStyle"
  >
    {{ delayedHoveredFeatureName }}
  </div>
</template>
