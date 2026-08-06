<script setup lang="ts">
import ChevronPanel from "@/components/ChevronPanel.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import {
  IconClockOutline,
  IconEye,
  IconEyeOff,
  IconLockOpenVariantOutline,
  IconLockOutline,
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

/**
 * A control-measures section: one top-level layer, rendered outside the layer tree.
 *
 * Outside the tree because control measures render on their own tactical-draw stack
 * above every plain shape regardless of layer order (ADR-0006), so offering the tree's
 * reorder affordances here would promise an ordering the map does not honour. It is
 * still a real layer, which is why the header carries visibility and lock exactly as a
 * tree layer's does.
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
    v-model:open="layer._isOpen"
    header-class="-ml-2"
    :data-control-measure-layer-id="layer.id"
  >
    <template #left><span class="h-6 w-6" /></template>
    <template #label>
      <div :class="layer.isHidden ? 'opacity-50' : ''">{{ layer.name }}</div>
    </template>
    <template #right>
      <div class="-mr-2 flex items-center">
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
          :items="layerMenuItems"
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
        :menu-items="itemMenuItems"
        @item-click="emit('item-click', item, layer, $event)"
        @item-double-click="emit('item-double-click', item, layer, $event)"
        @item-action="emit('item-action', item.id, $event)"
        @toggle-visibility="toggleItemVisibility(item)"
      />
    </ul>
  </ChevronPanel>
</template>
