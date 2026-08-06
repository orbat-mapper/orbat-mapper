<script setup lang="ts">
import ChevronPanel from "@/components/ChevronPanel.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import {
  IconClockOutline,
  IconEye,
  IconEyeOff,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconStar,
  IconStarOutline,
} from "@iconify-prerendered/vue-mdi";
import { Button } from "@/components/ui/button";
import EditLayerInlineForm from "@/modules/scenarioeditor/EditLayerInlineForm.vue";
import ControlMeasureListItem from "@/modules/scenarioeditor/ControlMeasureListItem.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import type { MenuItemData } from "@/components/types";
import type { ScenarioFeatureActions, ScenarioLayerAction } from "@/types/constants";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { NScenarioLayer } from "@/types/internalModels";
import type { NTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import {
  getScenarioFeatureLayerDragItem,
  idle,
  isScenarioFeatureDragItem,
  isScenarioFeatureLayerDragItem,
  type ItemState,
} from "@/types/draggables";
import DropIndicator from "@/components/DropIndicator.vue";
import { IconDrag } from "@iconify-prerendered/vue-mdi";
import { isControlMeasureLayer } from "@/modules/scenarioeditor/controlMeasureLayers";
import { resolveControlMeasureControlPoints } from "@/geo/controlMeasures";
import { isSupportedTacticalGraphic } from "@/scenariostore/tacticalGraphics";

/**
 * One specialized control-measure layer, rendered in the separate control-measure stack.
 *
 * Outside the tree because control measures render on their own tactical-draw stack
 * above every plain shape regardless of layer order (ADR-0006), so offering the tree's
 * cross-family reorder affordances would promise unsupported interleaving. Within the
 * control-measure stack it carries the same applicable management interactions as a
 * feature layer.
 */
const props = defineProps<{
  layer: NScenarioOverlayLayer;
  items: NTacticalGraphicLayerItem[];
  layerMenuItems: MenuItemData<ScenarioLayerAction>[];
  itemMenuItems: MenuItemData<ScenarioFeatureActions>[];
}>();

const emit = defineEmits<{
  (
    e: "item-click",
    item: NTacticalGraphicLayerItem,
    layer: NScenarioOverlayLayer,
    event: MouseEvent,
  ): void;
  (
    e: "item-double-click",
    item: NTacticalGraphicLayerItem,
    layer: NScenarioOverlayLayer,
    event: MouseEvent,
  ): void;
  (e: "item-action", itemId: FeatureId, action: ScenarioFeatureActions): void;
  (e: "layer-action", layer: NScenarioOverlayLayer, action: ScenarioLayerAction): void;
}>();

const { geo } = injectStrict(activeScenarioKey);
const { selectedFeatureIds, activeFeatureId } = useSelectedItems();

const editedLayerId = defineModel<FeatureId | null>("editedLayerId");
const activeLayerId = defineModel<FeatureId | null | undefined>("activeLayerId");
const layerOpen = computed({
  get: () => props.layer._isOpen,
  set: (open: boolean) =>
    geo.updateLayer(props.layer.id, { _isOpen: open }, { undoable: false, noEmit: true }),
});
const elRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const itemState = ref<ItemState>(idle);

function menuItemsFor(item: NTacticalGraphicLayerItem) {
  if (!props.layer.locked && !item.locked) return props.itemMenuItems;
  const mutationActions = new Set(["moveUp", "moveDown", "delete", "duplicate"]);
  return props.itemMenuItems.map((menuItem) =>
    mutationActions.has(menuItem.action) ? { ...menuItem, disabled: true } : menuItem,
  );
}

const availableLayerMenuItems = computed(() => {
  const hasVisibleExtent =
    !props.layer.isHidden &&
    !props.layer._hidden &&
    props.items.some(
      (item) =>
        !item.isHidden &&
        !item._hidden &&
        isSupportedTacticalGraphic(item) &&
        resolveControlMeasureControlPoints(item).length > 0,
    );
  return props.layerMenuItems.map((menuItem) =>
    menuItem.action === "Zoom"
      ? { ...menuItem, disabled: menuItem.disabled || !hasVisibleExtent }
      : menuItem,
  );
});

let dndCleanup = () => {};
onMounted(() => {
  if (!elRef.value) return;
  dndCleanup = combine(
    draggable({
      element: elRef.value,
      dragHandle: handleRef.value!,
      getInitialData: () =>
        getScenarioFeatureLayerDragItem({
          layer: props.layer as unknown as NScenarioLayer,
        }),
      onDragStart: () => (itemState.value = { type: "dragging" }),
      onDrop: () => (itemState.value = idle),
    }),
    dropTargetForElements({
      element: elRef.value,
      canDrop: ({ source }) => {
        if (isScenarioFeatureDragItem(source.data)) {
          const sourceOwner = geo.getLayerById(source.data.feature._pid);
          return (
            source.data.feature.kind === "tacticalGraphic" &&
            !source.data.feature.locked &&
            !sourceOwner?.locked &&
            !props.layer.locked &&
            source.data.feature._pid !== props.layer.id
          );
        }
        return (
          isScenarioFeatureLayerDragItem(source.data) &&
          source.data.layer.id !== props.layer.id &&
          isControlMeasureLayer(source.data.layer as unknown as NScenarioOverlayLayer)
        );
      },
      getData: ({ input, element, source }) => {
        const data = getScenarioFeatureLayerDragItem({
          layer: props.layer as unknown as NScenarioLayer,
        });
        return isScenarioFeatureLayerDragItem(source.data)
          ? attachClosestEdge(data, {
              input,
              element,
              allowedEdges: ["top", "bottom"],
            })
          : data;
      },
      onDrag: ({ self }) =>
        (itemState.value = {
          type: "drag-over",
          closestEdge: extractClosestEdge(self.data),
        }),
      onDragLeave: () => (itemState.value = idle),
      onDrop: () => (itemState.value = idle),
    }),
  );
});
onUnmounted(() => dndCleanup());

function toggleLayerVisibility() {
  geo.updateLayer(props.layer.id, { isHidden: !props.layer.isHidden });
}

function toggleLayerLocked() {
  geo.updateLayer(props.layer.id, { locked: !props.layer.locked });
}

function toggleItemVisibility(item: NTacticalGraphicLayerItem) {
  // Kind-agnostic door: `updateFeature` narrows to geometry and would no-op here.
  geo.updateLayerItem(item.id, { isHidden: !item.isHidden });
}
</script>

<template>
  <ChevronPanel
    :label="layer.name"
    v-model:open="layerOpen"
    header-class="-ml-2"
    :data-control-measure-layer-id="layer.id"
    v-model:header-ref="elRef"
  >
    <template #left>
      <span ref="handleRef">
        <IconDrag
          class="text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0"
        />
      </span>
    </template>
    <template #label>
      <div
        @dblclick="activeLayerId = layer.id"
        :class="[
          layer.isHidden ? 'opacity-50' : '',
          activeLayerId === layer.id ? 'dark:text-army2 text-red-800' : '',
        ]"
      >
        {{ layer.name }}
      </div>
      <DropIndicator
        v-if="itemState.type === 'drag-over' && itemState.closestEdge"
        :edge="itemState.closestEdge"
        gap="0px"
      />
    </template>
    <template #right>
      <div class="-mr-2 flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          @click="activeLayerId = layer.id"
          @keydown.stop
          class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
          title="Set as active layer"
        >
          <IconStar v-if="activeLayerId === layer.id" class="size-5" />
          <IconStarOutline v-else class="size-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          @click="toggleLayerLocked()"
          @keydown.stop
          class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
          title="Toggle layer lock"
        >
          <IconLockOutline v-if="layer.locked" class="size-5" />
          <IconLockOpenVariantOutline class="size-5" v-else />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          @click="toggleLayerVisibility()"
          @keydown.stop
          class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
          title="Toggle layer visibility"
        >
          <IconEyeOff v-if="layer.isHidden" class="size-5" />
          <IconEye class="size-5" v-else />
        </Button>

        <IconClockOutline
          v-if="layer.visibleFromT || layer.visibleUntilT"
          class="text-muted-foreground size-5"
        />
        <DotsMenu
          class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
          :items="availableLayerMenuItems"
          @action="emit('layer-action', layer, $event)"
        />
      </div>
    </template>
    <EditLayerInlineForm
      v-if="editedLayerId === layer.id"
      :layer="layer as unknown as NScenarioLayer"
      class="-mt-6 -ml-5 border"
      @close="editedLayerId = null"
      @update="geo.updateLayer(layer.id, $event)"
    />
    <ul class="-mt-6 -ml-5">
      <ControlMeasureListItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :layer="layer"
        :selected="selectedFeatureIds.has(item.id)"
        :active="activeFeatureId === item.id"
        :menu-items="menuItemsFor(item)"
        @item-click="emit('item-click', item, layer, $event)"
        @item-double-click="emit('item-double-click', item, layer, $event)"
        @item-action="emit('item-action', item.id, $event)"
        @toggle-visibility="toggleItemVisibility(item)"
      />
    </ul>
  </ChevronPanel>
</template>
