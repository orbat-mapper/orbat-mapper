<script setup lang="ts">
import { computed } from "vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import { resolveControlMeasureStyle } from "@/geo/controlMeasures";
import { isSupportedGraphicKind } from "@/scenariostore/tacticalGraphics";
import type { NScenarioLayerItem } from "@/types/scenarioLayerItems";

/** How a layer item is pictured in lists: its symbol, its graphic, or its shape. */
const props = defineProps<{ item: NScenarioLayerItem }>();

/**
 * Read-time only. The tint is the same projection the map renders with — an authored
 * stroke colour, else the identity/monochrome colour resolved from `standardIdentity`
 * and `colorMode`. Nothing derived is stored, so this recomputes rather than caches.
 */
const strokeColor = computed(() => {
  if (props.item.kind !== "tacticalGraphic") return undefined;
  const style = resolveControlMeasureStyle(props.item);
  return style.strokeColor ?? style.color;
});
</script>

<template>
  <span
    v-if="item.kind === 'pointSymbol'"
    class="flex size-5 shrink-0 items-center justify-center"
  >
    <MilitarySymbol :sidc="item.sidc" :size="12" />
  </span>
  <ControlMeasurePreview
    v-else-if="
      item.kind === 'tacticalGraphic' && isSupportedGraphicKind(item.graphicKind)
    "
    :kind="item.graphicKind"
    class="size-5 shrink-0"
    :style="{ color: strokeColor }"
    :stroke-width="1.5"
    :pad="4"
    non-scaling-stroke
  />
  <component
    v-else
    :is="getGeometryIcon(item)"
    class="text-muted-foreground size-5 shrink-0"
  />
</template>
