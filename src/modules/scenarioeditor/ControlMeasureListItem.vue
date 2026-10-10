<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
  IconAlertOutline,
  IconClockOutline,
  IconLockOutline,
  IconDrag,
} from "@iconify-prerendered/vue-mdi";
import LayerItemActions from "@/modules/scenarioeditor/LayerItemActions.vue";
import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import { getControlMeasureLabel } from "@/modules/scenarioeditor/controlMeasureLayers";
import { resolveControlMeasureStyle } from "@/geo/controlMeasures";
import { isSupportedGraphicKind } from "@/scenariostore/tacticalGraphics";
import type { ScenarioFeatureActions } from "@/types/constants";
import type { ControlMeasureLayerEntry } from "@/modules/scenarioeditor/controlMeasureLayers";
import { isControlMeasureLayerItemKind } from "@/types/scenarioLayerItems";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import type { MenuItemData } from "@/components/types";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import DropIndicator from "@/components/DropIndicator.vue";
import {
  getScenarioFeatureDragItem,
  idle,
  isScenarioFeatureDragItem,
  type ItemState,
} from "@/types/draggables";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

interface Props {
  item: ControlMeasureLayerEntry;
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

const hidden = computed(
  () => props.layer.isHidden || props.item.isHidden || props.item._hidden,
);
const supported = computed(
  () =>
    props.item.kind === "pointSymbol" || isSupportedGraphicKind(props.item.graphicKind),
);
const label = computed(() => getControlMeasureLabel(props.item));
const elRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const itemState = ref<ItemState>(idle);
const { geo } = injectStrict(activeScenarioKey);

let dndCleanup = () => {};
let mounted = false;
function installDragAndDrop() {
  dndCleanup();
  dndCleanup = () => {};
  if (!mounted || !elRef.value || props.layer.locked || props.item.locked) return;
  dndCleanup = combine(
    draggable({
      element: elRef.value,
      dragHandle: handleRef.value!,
      getInitialData: () => getScenarioFeatureDragItem({ feature: props.item }),
      onDragStart: () => (itemState.value = { type: "dragging" }),
      onDrop: () => (itemState.value = idle),
    }),
    dropTargetForElements({
      element: elRef.value,
      canDrop: ({ source }) => {
        if (!isScenarioFeatureDragItem(source.data)) return false;
        const sourceOwner = geo.getLayerById(source.data.feature._pid);
        return (
          isControlMeasureLayerItemKind(source.data.feature.kind) &&
          source.data.feature.id !== props.item.id &&
          !source.data.feature.locked &&
          !sourceOwner?.locked
        );
      },
      getData: ({ input, element }) =>
        attachClosestEdge(getScenarioFeatureDragItem({ feature: props.item }), {
          input,
          element,
          allowedEdges: ["top", "bottom"],
        }),
      onDrag: ({ self }) =>
        (itemState.value = {
          type: "drag-over",
          closestEdge: extractClosestEdge(self.data),
        }),
      onDragLeave: () => (itemState.value = idle),
      onDrop: () => (itemState.value = idle),
    }),
  );
}
onMounted(() => {
  mounted = true;
  installDragAndDrop();
});
watch(
  () => [props.layer.locked, props.item.locked],
  () => installDragAndDrop(),
);
onUnmounted(() => {
  mounted = false;
  dndCleanup();
});

/**
 * Read-time only. The tint is the same projection the map renders with — an authored
 * stroke colour, else the identity/monochrome colour resolved from `standardIdentity`
 * and `colorMode`. Nothing derived is stored, so this recomputes rather than caches.
 */
const strokeColor = computed(() => {
  if (props.item.kind === "pointSymbol") return undefined;
  const style = resolveControlMeasureStyle(props.item);
  return style.strokeColor ?? style.color;
});
</script>

<template>
  <li
    ref="elRef"
    class="group hover:bg-accent relative flex items-center justify-between border-l select-none"
    :data-feature-id="item.id"
    :class="
      itemState.type === 'dragging'
        ? 'opacity-20'
        : selected
          ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900'
          : 'focus-within:bg-accent border-transparent'
    "
  >
    <span ref="handleRef">
      <IconDrag
        class="text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0"
        :class="{ invisible: layer.locked || item.locked }"
      />
    </span>
    <button
      @click="emit('item-click', $event)"
      @dblclick="emit('item-double-click', $event)"
      class="flex min-w-0 flex-auto items-center py-1.5"
    >
      <span
        v-if="item.kind === 'pointSymbol'"
        class="flex size-5 shrink-0 items-center justify-center"
      >
        <MilitarySymbol :sidc="item.sidc" :size="12" />
      </span>
      <ControlMeasurePreview
        v-else-if="supported"
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
      <span
        class="group-hover:text-accent-foreground text-foreground ml-2 truncate text-left text-sm"
        :class="{ 'font-bold': active, 'opacity-50': hidden }"
      >
        {{ label }}
      </span>
      <!-- `title` on the wrapper, not the svg: SVG needs a <title> child to show one. -->
      <span
        v-if="item.visibleFromT || item.visibleUntilT"
        class="ml-1.5 flex shrink-0 items-center"
        title="Visible only part of the time"
      >
        <IconClockOutline class="text-muted-foreground size-3.5 opacity-60" />
      </span>
      <span v-if="item.locked" class="ml-1.5 flex shrink-0 items-center" title="Locked">
        <IconLockOutline class="text-muted-foreground size-3.5 opacity-60" />
      </span>
      <span
        v-if="item.kind === 'tacticalGraphic' && !supported"
        class="ml-1 flex shrink-0 items-center"
        :title="`Unsupported control measure kind '${item.graphicKind}' — kept in the scenario, but not drawn`"
      >
        <IconAlertOutline class="text-muted-foreground size-4" />
        <span class="sr-only">Unsupported</span>
      </span>
    </button>
    <LayerItemActions
      :hidden="item.isHidden"
      :toggle-disabled="layer.locked || item.locked"
      :menu-items="menuItems"
      @toggle-visibility="emit('toggle-visibility')"
      @action="emit('item-action', $event)"
    />
    <DropIndicator
      v-if="itemState.type === 'drag-over' && itemState.closestEdge"
      :edge="itemState.closestEdge"
      gap="0px"
    />
  </li>
</template>
