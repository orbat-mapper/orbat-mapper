<script setup lang="ts">
import { computed } from "vue";
import {
  IconAlertOutline,
  IconClockOutline,
  IconEye,
  IconEyeOff,
} from "@iconify-prerendered/vue-mdi";
import DotsMenu from "@/components/DotsMenu.vue";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import { getControlMeasureLabel } from "@/modules/scenarioeditor/controlMeasureLayers";
import { resolveControlMeasureStyle } from "@/geo/controlMeasures";
import { isSupportedGraphicKind } from "@/scenariostore/tacticalGraphics";
import type { ScenarioFeatureActions } from "@/types/constants";
import type { NTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import type { MenuItemData } from "@/components/types";

interface Props {
  item: NTacticalGraphicLayerItem;
  layer: NScenarioOverlayLayer;
  selected?: boolean;
  active?: boolean;
  menuItems: MenuItemData<ScenarioFeatureActions>[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "item-click", data: MouseEvent): void;
  (e: "item-double-click", data: MouseEvent): void;
  (e: "item-action", data: ScenarioFeatureActions): void;
  (e: "toggle-visibility"): void;
}>();

const hidden = computed(() => props.layer.isHidden || props.item._hidden);
const supported = computed(() => isSupportedGraphicKind(props.item.graphicKind));
const label = computed(() => getControlMeasureLabel(props.item));

/**
 * Read-time only. The tint is the same projection the map renders with — an authored
 * stroke colour, else the identity/monochrome colour resolved from `standardIdentity`
 * and `colorMode`. Nothing derived is stored, so this recomputes rather than caches.
 */
const strokeColor = computed(() => {
  const style = resolveControlMeasureStyle(props.item);
  return style.strokeColor ?? style.color;
});
</script>

<template>
  <li
    class="group hover:bg-accent relative flex items-center justify-between border-l select-none"
    :data-feature-id="item.id"
    :class="
      selected
        ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900'
        : 'border-transparent'
    "
  >
    <button
      @click="emit('item-click', $event)"
      @dblclick="emit('item-double-click', $event)"
      class="flex flex-auto items-center py-2.5 pl-6 sm:py-2"
    >
      <component
        :is="getGeometryIcon(item)"
        class="size-5 shrink-0"
        :style="supported ? { color: strokeColor } : undefined"
        :class="supported ? '' : 'text-muted-foreground'"
      />
      <span
        class="group-hover:text-accent-foreground text-foreground ml-2 truncate text-left text-sm"
        :class="{ 'font-bold': active, 'opacity-50': hidden }"
      >
        {{ label }}
      </span>
      <!-- `title` on the wrapper, not the svg: SVG needs a <title> child to show one. -->
      <span
        v-if="!supported"
        class="ml-1 flex shrink-0 items-center"
        :title="`Unsupported control measure kind '${item.graphicKind}' — kept in the scenario, but not drawn`"
      >
        <IconAlertOutline class="text-muted-foreground size-4" />
        <span class="sr-only">Unsupported</span>
      </span>
    </button>
    <div class="relative flex items-center">
      <button
        type="button"
        @click.stop="emit('toggle-visibility')"
        class="text-muted-foreground hover:text-foreground mr-1 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        title="Toggle visibility"
      >
        <IconEyeOff v-if="item.isHidden" class="size-5" />
        <IconEye v-else class="size-5" />
      </button>

      <IconClockOutline
        v-if="item.visibleFromT || item.visibleUntilT"
        class="text-muted-foreground h-5 w-5"
      />
      <DotsMenu
        :items="menuItems"
        @action="emit('item-action', $event)"
        class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
      />
    </div>
  </li>
</template>
