<script setup lang="ts">
import { injectStrict, nanoid, triggerPostMoveFlash } from "@/utils";
import {
  activeLayerKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";
import {
  featureMenuItems,
  layerItemsToGeoJsonString,
} from "@/modules/scenarioeditor/featureLayerUtils";
import ChevronPanel from "@/components/ChevronPanel.vue";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import type { NGeometryLayerItem, NScenarioLayer } from "@/types/internalModels";
import type {
  FeatureId,
  ScenarioMapLayer,
  ScenarioMapLayerType,
} from "@/types/scenarioGeoModels";
import { IconEye, IconEyeOff } from "@iconify-prerendered/vue-mdi";
import DotsMenu from "@/components/DotsMenu.vue";
import { useUiStore } from "@/stores/uiStore";
import type { ButtonGroupItem, DropTarget, MenuItemData } from "@/components/types";
import type {
  ScenarioFeatureActions,
  ScenarioLayerAction,
  ScenarioMapLayerAction,
} from "@/types/constants";
import { ScenarioLayerActions } from "@/types/constants";
import { useSelectedItems } from "@/stores/selectedStore";
import { addMapLayer, getMapLayerIcon } from "@/modules/scenarioeditor/scenarioMapLayers";
import SplitButton from "@/components/SplitButton.vue";
import ScenarioFeatureLayer from "@/modules/scenarioeditor/ScenarioFeatureLayer.vue";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  isScenarioFeatureDragItem,
  isScenarioFeatureLayerDragItem,
} from "@/types/draggables";
import { useNotifications } from "@/composables/notifications";
import {
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { isNGeometryLayerItem } from "@/types/scenarioLayerItems";
import {
  isScenarioOverlayLayer,
  isScenarioReferenceLayer,
  type NScenarioOverlayLayer,
  type NScenarioReferenceLayer,
} from "@/types/scenarioStackLayers";

const emit = defineEmits(["feature-click"]);

const activeLayerId = injectStrict(activeLayerKey);
const engineRef = injectStrict(activeScenarioMapEngineKey);
const uiStore = useUiStore();
const { send: notify } = useNotifications();
const {
  geo,
  store: { groupUpdate },
} = injectStrict(activeScenarioKey);
uiStore.layersPanelActive = true;
onUnmounted(() => (uiStore.layersPanelActive = false));

const canZoomFeatures = computed(() =>
  Boolean(engineRef.value?.layers.capabilities.zoomToFeature),
);
const canPanFeatures = computed(() =>
  Boolean(engineRef.value?.layers.capabilities.panToFeature),
);
const canZoomScenarioLayers = computed(() =>
  Boolean(engineRef.value?.layers.capabilities.zoomToScenarioLayer),
);
const canZoomMapLayers = computed(
  () =>
    Boolean(engineRef.value?.layers.capabilities.zoomToMapLayer) &&
    Boolean(engineRef.value?.layers.capabilities.mapLayerExtent),
);

const mapLayerMenuItems = computed<MenuItemData<ScenarioMapLayerAction>[]>(() => [
  { label: "Zoom to", action: "zoom", disabled: !canZoomMapLayers.value },
  { label: "Move up", action: "moveUp" },
  { label: "Move down", action: "moveDown" },
  { label: "Delete", action: "delete" },
]);

const mapLayerButtonItems: ButtonGroupItem[] = [
  {
    label: "Add feature layer",
    onClick: () => {
      const newLayer = addNewLayer();
    },
  },
  {
    label: "Add image layer",
    onClick: () => addNewMapLayer("ImageLayer"),
  },
  {
    label: "Add XYZ tile layer",
    onClick: () => addNewMapLayer("XYZLayer"),
  },
  {
    label: "Add TileJSON layer",
    onClick: () => addNewMapLayer("TileJSONLayer"),
  },
];

const scenarioLayers = computed(() => geo.layerItemsLayers.value);
const stackLayers = computed(() => {
  // Compatibility fallback for tests and older injected geo mocks that still
  // expose split overlay/reference collections instead of canonical stackLayers.
  if (geo.stackLayers?.value) return geo.stackLayers.value;
  const referenceLayers = (geo.mapLayers?.value ?? []).map((layer) => ({
    id: String(layer.id),
    kind: "reference" as const,
    name: layer.name,
    source: layer,
  }));
  const overlayLayers = scenarioLayers.value.map((layer) => ({
    ...layer,
    id: String(layer.id),
    kind: "overlay" as const,
  }));
  return [...referenceLayers, ...overlayLayers];
});

function isOverlayStackEntry(layer: unknown): layer is NScenarioOverlayLayer {
  return isScenarioOverlayLayer(layer as any);
}

function isReferenceStackEntry(layer: unknown): layer is NScenarioReferenceLayer {
  return isScenarioReferenceLayer(layer as any);
}

function getReferenceLayerSource(layer: NScenarioReferenceLayer) {
  return layer.source;
}

const layerMenuItems = computed<MenuItemData<ScenarioLayerAction>[]>(() => [
  {
    label: "Zoom to",
    action: ScenarioLayerActions.Zoom,
    disabled: !canZoomScenarioLayers.value,
  },
  { label: "Set as active", action: ScenarioLayerActions.SetActive },
  { label: "Edit", action: ScenarioLayerActions.Edit },
  { label: "Move up", action: ScenarioLayerActions.MoveUp },
  { label: "Move down", action: ScenarioLayerActions.MoveDown },
  { label: "Copy as GeoJSON", action: ScenarioLayerActions.CopyAsGeoJson },
  { label: "Delete", action: ScenarioLayerActions.Delete },
]);

const availableFeatureMenuItems = computed<MenuItemData<ScenarioFeatureActions>[]>(() =>
  featureMenuItems.map((item) => ({
    ...item,
    disabled:
      (item.action === "zoom" && !canZoomFeatures.value) ||
      (item.action === "pan" && !canPanFeatures.value),
  })),
);

const { selectedFeatureIds, selectedMapLayerIds, activeMapLayerId, activeFeatureId } =
  useSelectedItems();

const editedLayerId = ref<FeatureId | null>(null);

function calculateSelectedFeatureIds(newFeatureId: FeatureId): FeatureId[] {
  const lastSelectedId = [...selectedFeatureIds.value].pop();
  if (lastSelectedId === undefined) return [newFeatureId];
  const allOpenFeatures: FeatureId[] = [];
  for (const layer of scenarioLayers.value) {
    if (!(layer._isOpen === false)) {
      layer.items.forEach((layerItem) => {
        allOpenFeatures.push(layerItem.id);
      });
    }
  }
  const lastSelectedIndex = allOpenFeatures.indexOf(lastSelectedId);
  const newFeatureIndex = allOpenFeatures.indexOf(newFeatureId);
  if (lastSelectedIndex === -1 || newFeatureIndex === -1) return [newFeatureId];
  return allOpenFeatures.slice(
    Math.min(lastSelectedIndex, newFeatureIndex),
    Math.max(lastSelectedIndex, newFeatureIndex) + 1,
  );
}

function onFeatureClick(
  feature: NGeometryLayerItem,
  layer: NScenarioLayer,
  event?: MouseEvent,
) {
  const ids = selectedFeatureIds.value;
  if (event && event.shiftKey) {
    const selectedIds = calculateSelectedFeatureIds(feature.id);
    selectedIds.forEach((id) => {
      ids.add(id);
    });
  } else if (event && (event.ctrlKey || event.metaKey)) {
    if (ids.has(feature.id)) {
      ids.delete(feature.id);
    } else {
      ids.add(feature.id);
    }
  } else {
    activeFeatureId.value = feature.id;
  }
  emit("feature-click", feature, layer, event);
}

function onFeatureDoubleClick(
  feature: NGeometryLayerItem,
  layer: NScenarioLayer,
  event?: MouseEvent,
) {
  engineRef.value?.layers.zoomToFeature(feature.id);
}

function onImageLayerClick(layer: ScenarioMapLayer, event?: MouseEvent) {
  if (event?.ctrlKey || event?.shiftKey) {
    if (selectedMapLayerIds.value.has(layer.id)) {
      selectedMapLayerIds.value.delete(layer.id);
    } else {
      selectedMapLayerIds.value.add(layer.id);
    }
  } else {
    selectedMapLayerIds.value.clear();
    selectedMapLayerIds.value.add(layer.id);
  }
}

function onImageLayerDoubleClick(layer: ScenarioMapLayer) {
  engineRef.value?.layers.zoomToMapLayer(layer.id);
}

const mapLayersMenuItems: MenuItemData[] = [
  { label: "Add image layer", action: () => addNewMapLayer("ImageLayer") },
  { label: "Add TileJSON layer", action: () => addNewMapLayer("TileJSONLayer") },
  { label: "Add XYZ tile layer", action: () => addNewMapLayer("XYZLayer") },
];

function onMapLayerAction(layer: ScenarioMapLayer, action: ScenarioMapLayerAction) {
  if (action === "zoom") engineRef.value?.layers.zoomToMapLayer(layer.id);
  if (action === "delete") {
    geo.deleteMapLayer(layer.id);
    activeMapLayerId.value = null;
  }
  if (action === "moveUp") {
    geo.moveMapLayer(layer.id, { direction: "up" });
  }
  if (action === "moveDown") {
    geo.moveMapLayer(layer.id, { direction: "down" });
  }
}

function onLayerAction(layer: NScenarioLayer, action: ScenarioLayerAction) {
  if (action === ScenarioLayerActions.SetActive) activeLayerId.value = layer.id;
  if (action === ScenarioLayerActions.Zoom) {
    engineRef.value?.layers.zoomToScenarioLayer(layer.id);
  }
  if (action === ScenarioLayerActions.Edit) {
    editedLayerId.value = layer.id;
    layer._isOpen = true;
  }
  if (action === ScenarioLayerActions.Delete) {
    /* if (activeLayer.value === layer.id) {
      activeLayer.value = null;
      olCurrentLayer.value = null;
    }*/
    geo.deleteLayer(layer.id);
  }
  if (
    action === ScenarioLayerActions.MoveUp ||
    action === ScenarioLayerActions.MoveDown
  ) {
    const direction = action === ScenarioLayerActions.MoveUp ? "up" : "down";
    let toIndex = geo.getLayerIndex(layer.id);
    if (direction === "up") toIndex--;
    if (direction === "down") toIndex++;
    geo.moveLayer(layer.id, toIndex);
  }
  if (action === ScenarioLayerActions.CopyAsGeoJson) {
    const fullLayer = geo.getFullLayerItemsLayer(layer.id);
    if (fullLayer) {
      navigator.clipboard.writeText(layerItemsToGeoJsonString(fullLayer.items));
      notify({ message: "Copied GeoJSON to clipboard" });
    }
  }
}

function onFeatureAction(
  featureOrFeaturesId: FeatureId | FeatureId[],
  action: ScenarioFeatureActions,
) {
  const isArray = Array.isArray(featureOrFeaturesId);

  if (action === "copyAsGeoJson") {
    const ids = isArray ? featureOrFeaturesId : [featureOrFeaturesId];
    const layerItems = ids
      .map((id) => geo.getGeometryLayerItemById(id)?.layerItem)
      .filter((layerItem): layerItem is NGeometryLayerItem => !!layerItem);
    if (layerItems.length) {
      navigator.clipboard.writeText(layerItemsToGeoJsonString(layerItems));
      notify({ message: "Copied GeoJSON to clipboard" });
    }
    return;
  }

  if (isArray && (action === "zoom" || action === "pan")) {
    if (action === "zoom") {
      engineRef.value?.layers.zoomToFeatures(featureOrFeaturesId);
    } else {
      featureOrFeaturesId.forEach((featureId) => {
        engineRef.value?.layers.panToFeature(featureId);
      });
    }
    return;
  }
  const tmp = isArray ? featureOrFeaturesId : [featureOrFeaturesId];
  groupUpdate(
    () =>
      tmp.forEach((featureId) => {
        const { layerItem: feature, layer } =
          geo.getGeometryLayerItemById(featureId) || {};
        if (action === "zoom") engineRef.value?.layers.zoomToFeature(featureId);
        if (action === "pan") engineRef.value?.layers.panToFeature(featureId);

        if (!feature || !layer) return;

        if (action === "delete") {
          geo.deleteFeature(feature.id);
          selectedFeatureIds.value.delete(feature.id);
        }
        if (action === "moveUp" || action === "moveDown") {
          const direction = action === "moveUp" ? "up" : "down";
          const layer = geo.getLayerById(feature._pid);
          if (!layer) return;
          let toIndex = layer.items.indexOf(feature.id);

          if (direction === "up") toIndex--;
          if (direction === "down") toIndex++;
          geo.moveFeature(feature.id, toIndex);
        }

        if (action === "duplicate") {
          const newId = geo.duplicateFeature(featureId);
          if (selectedFeatureIds.value.size === 1) {
            activeFeatureId.value = newId;
          }
        }
      }),
    { label: "batchLayer", value: "dummy" },
  );
}

function onFeatureDrop(data: {
  feature: NGeometryLayerItem;
  destinationFeature: NGeometryLayerItem | NScenarioLayer;
  target: DropTarget;
}) {
  const { feature, destinationFeature, target } = data;
  geo.reorderFeature(feature.id, destinationFeature.id, target);
}

function addNewLayer() {
  const addedLayer = geo.addLayer({
    id: nanoid(),
    name: `New layer`,
    items: [],
    _isNew: false,
  });
  if (!addedLayer) return;
  activeLayerId.value = addedLayer.id;
  editedLayerId.value = addedLayer.id;
  return addedLayer;
}

function addNewMapLayer(layerType: ScenarioMapLayerType): ScenarioMapLayer {
  const newLayer = addMapLayer(layerType, geo);
  uiStore.mapLayersPanelOpen = true;
  nextTick(() => {
    activeMapLayerId.value = newLayer.id;
  });
  return newLayer;
}

function toggleMapLayerVisibility(layer: ScenarioMapLayer) {
  geo.updateMapLayer(layer.id, { isHidden: !layer.isHidden });
}

function getOverlayFeatures(layer: NScenarioOverlayLayer): NGeometryLayerItem[] {
  return layer.items
    .map((itemId) => geo.getGeometryLayerItemById(itemId).layerItem)
    .filter((item): item is NGeometryLayerItem => !!item);
}

function onLayerDrop(layer: NScenarioLayer, feature: NGeometryLayerItem) {
  onFeatureDrop({
    feature,
    destinationFeature: layer,
    target: "on",
  });
}

let dndCleanup: () => void = () => {};
onMounted(() => {
  dndCleanup = monitorForElements({
    canMonitor: ({ source }) =>
      isScenarioFeatureDragItem(source.data) ||
      isScenarioFeatureLayerDragItem(source.data),
    onDrop: ({ source, location }) => {
      const destination = location.current.dropTargets[0];
      if (!destination) {
        // if dropped outside any drop targets
        return;
      }
      const closestEdgeOfTarget: Edge | null = extractClosestEdge(destination.data);

      if (
        isScenarioFeatureDragItem(source.data) &&
        isScenarioFeatureDragItem(destination.data)
      ) {
        const target = closestEdgeOfTarget === "top" ? "above" : "below";
        onFeatureDrop({
          feature: source.data.feature,
          destinationFeature: destination.data.feature,
          target,
        });
        // get element by data id
        const featureId = source.data.feature.id;
        nextTick(() => {
          const el = document.querySelector(`[data-feature-id="${featureId}"]`);
          if (el) {
            triggerPostMoveFlash(el);
          }
        });
      } else if (
        isScenarioFeatureLayerDragItem(destination.data) &&
        isScenarioFeatureDragItem(source.data)
      ) {
        onLayerDrop(destination.data.layer, source.data.feature);
        const featureId = source.data.feature.id;
        nextTick(() => {
          const el = document.querySelector(`[data-feature-id="${featureId}"]`);
          if (el) {
            triggerPostMoveFlash(el);
          }
        });
      } else if (
        isScenarioFeatureLayerDragItem(source.data) &&
        isScenarioFeatureLayerDragItem(destination.data)
      ) {
        const fromIndex = geo.getLayerIndex(source.data.layer.id);
        let toIndex = geo.getLayerIndex(destination.data.layer.id);
        if (closestEdgeOfTarget === "bottom") toIndex++;
        if (fromIndex < toIndex) toIndex--;
        geo.moveLayer(source.data.layer.id, toIndex);
        const layerId = source.data.layer.id;
        nextTick(() => {
          const el = document.querySelector(`[data-layer-id="${layerId}"]`);
          if (el) {
            triggerPostMoveFlash(el);
          }
        });
      }
    },
  });
});

onUnmounted(() => {
  dndCleanup();
});
</script>

<template>
  <div>
    <ChevronPanel
      label="Layers"
      class="mb-4"
      header-class="ml-4"
      v-model:open="uiStore.mapLayersPanelOpen"
    >
      <template #right>
        <div class="flex items-center">
          <DotsMenu
            class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
            :items="mapLayersMenuItems"
          />
        </div>
      </template>
      <div class="-mt-6">
        <template v-for="layer in stackLayers" :key="layer.id">
          <ScenarioFeatureLayer
            v-if="isOverlayStackEntry(layer)"
            :features="getOverlayFeatures(layer as NScenarioOverlayLayer)"
            :layer="layer as unknown as NScenarioLayer"
            :layer-menu-items="layerMenuItems"
            :feature-menu-items="availableFeatureMenuItems"
            v-model:activeLayerId="activeLayerId"
            v-model:editedLayerId="editedLayerId"
            @feature-click="onFeatureClick"
            @feature-double-click="onFeatureDoubleClick"
            @feature-action="onFeatureAction"
            @layer-action="onLayerAction"
          />
          <ul v-else-if="isReferenceStackEntry(layer)">
            <li
              class="group hover:bg-accent relative flex items-center justify-between border-l select-none"
              @dblclick="onImageLayerDoubleClick(getReferenceLayerSource(layer))"
              @click="onImageLayerClick(getReferenceLayerSource(layer), $event)"
              :class="
                selectedMapLayerIds.has(getReferenceLayerSource(layer).id)
                  ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900'
                  : 'border-transparent'
              "
            >
              <button class="flex flex-auto items-center py-2.5 sm:py-2">
                <component
                  :is="getMapLayerIcon(getReferenceLayerSource(layer))"
                  class="text-muted-foreground size-5"
                />
                <span
                  class="group-hover:text-accent-foreground text-foreground ml-2 text-left text-sm"
                  :class="{
                    'font-bold': activeMapLayerId === getReferenceLayerSource(layer).id,
                    'opacity-50': getReferenceLayerSource(layer).isHidden,
                  }"
                >
                  {{ layer.name }}
                </span>
              </button>
              <div class="relative flex items-center">
                <span
                  v-if="getReferenceLayerSource(layer)._isTemporary"
                  class="badge"
                  title="Temporary layer. Not saved"
                  >TEMP</span
                >
                <button
                  type="button"
                  @click="toggleMapLayerVisibility(getReferenceLayerSource(layer))"
                  @keydown.stop
                  class="text-muted-foreground hover:text-muted-foreground ml-1 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
                  title="Toggle layer visibility"
                >
                  <IconEyeOff
                    v-if="getReferenceLayerSource(layer).isHidden"
                    class="h-5 w-5"
                  />
                  <IconEye class="h-5 w-5" v-else />
                </button>
                <DotsMenu
                  :items="mapLayerMenuItems"
                  @action="onMapLayerAction(getReferenceLayerSource(layer), $event)"
                  class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
                />
              </div>
            </li>
          </ul>
        </template>
      </div>
    </ChevronPanel>

    <footer class="my-8 text-right">
      <SplitButton :items="mapLayerButtonItems" />
    </footer>
  </div>
</template>
