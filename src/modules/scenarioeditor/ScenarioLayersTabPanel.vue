<script setup lang="ts">
import { injectStrict, nanoid, triggerPostMoveFlash } from "@/utils";
import {
  activeLayerKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
  scenarioDrawKey,
  tacticalGraphicRenderFeedKey,
} from "@/components/injects";
import {
  featureMenuItems,
  layerItemsToGeoJsonString,
} from "@/modules/scenarioeditor/featureLayerUtils";
import { computed, inject, nextTick, onMounted, onUnmounted, ref } from "vue";
import type { NGeometryLayerItem, NScenarioLayer } from "@/types/internalModels";
import type {
  FeatureId,
  ScenarioMapLayer,
  ScenarioMapLayerType,
} from "@/types/scenarioGeoModels";
import ScenarioReferenceLayerRow from "@/modules/scenarioeditor/ScenarioReferenceLayerRow.vue";
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
import { addMapLayer } from "@/modules/scenarioeditor/scenarioMapLayerUtils";
import SplitButton from "@/components/SplitButton.vue";
import ScenarioFeatureLayer from "@/modules/scenarioeditor/ScenarioFeatureLayer.vue";
import ControlMeasureLayer from "@/modules/scenarioeditor/ControlMeasureLayer.vue";
import {
  createControlMeasureLayer,
  getControlMeasureLayerGroups,
  isControlMeasureLayer,
  NEW_CONTROL_MEASURE_LAYER_NAME,
} from "@/modules/scenarioeditor/controlMeasureLayers";
import type {
  NScenarioLayerItem,
  NTacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  isScenarioFeatureDragItem,
  isScenarioFeatureLayerDragItem,
  isScenarioMapLayerDragItem,
} from "@/types/draggables";
import { useNotifications } from "@/composables/notifications";
import {
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { isNTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import { isSupportedTacticalGraphic } from "@/scenariostore/tacticalGraphics";
import {
  isScenarioOverlayLayer,
  isScenarioReferenceLayer,
  type NScenarioOverlayLayer,
  type NScenarioReferenceLayer,
  type NScenarioStackLayer,
} from "@/types/scenarioStackLayers";

const emit = defineEmits(["feature-click"]);

const activeLayerId = injectStrict(activeLayerKey);
const engineRef = injectStrict(activeScenarioMapEngineKey);
const scenarioDraw = inject(scenarioDrawKey, null);
const tacticalGraphicRenderFeed = inject(tacticalGraphicRenderFeedKey, null);
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
    onClick: () => addNewLayer(),
  },
  {
    label: "Add control-measure layer",
    onClick: () => addNewControlMeasureLayer(),
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
  return isScenarioOverlayLayer(layer as NScenarioStackLayer);
}

function isReferenceStackEntry(layer: unknown): layer is NScenarioReferenceLayer {
  return isScenarioReferenceLayer(layer as NScenarioStackLayer);
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

/**
 * The specialized control-measure stack, outside the mixed overlay/reference tree.
 * Empty specialized layers deliberately remain present.
 *
 * `layersItems` is optional-chained because older injected `geo` mocks in tests only
 * expose `layerItemsLayers`.
 */
const controlMeasureGroups = computed(() =>
  getControlMeasureLayerGroups(geo.layersItems?.value ?? []),
);

/**
 * Specialized layers the feature/reference tree must not also render.
 */
const controlMeasureOnlyLayerIds = computed(
  () => new Set(controlMeasureGroups.value.map(({ layer }) => layer.id)),
);

const availableItemMenuItems = computed<MenuItemData<ScenarioFeatureActions>[]>(() =>
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

// Widened past NGeometryLayerItem: the control-measures section reuses this, and the
// only thing selection has ever needed is the id. Range-select works across kinds
// already — calculateSelectedFeatureIds walks layer.items without narrowing.
function onFeatureClick(
  feature: { id: FeatureId },
  layer: { id: FeatureId },
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

function onFeatureDoubleClick(feature: NGeometryLayerItem) {
  engineRef.value?.layers.zoomToFeature(feature.id);
}

function settleEditedControlMeasureBeforeDelete(itemIds: readonly FeatureId[]) {
  const tool = scenarioDraw?.armed.value;
  if (tool?.kind !== "cmEdit" || !itemIds.includes(tool.featureId)) return;
  tacticalGraphicRenderFeed?.settle("delete");
}

/**
 * Control-measure actions share the kind-aware store operations while retaining their
 * rendered GeoJSON copy path and settle-first deletion.
 */
function onControlMeasureAction(itemId: FeatureId, action: ScenarioFeatureActions) {
  if (action === "zoom") engineRef.value?.layers.zoomToFeature(itemId);
  if (action === "pan") engineRef.value?.layers.panToFeature(itemId);
  if (action === "delete") {
    settleEditedControlMeasureBeforeDelete([itemId]);
    geo.deleteFeature(itemId);
    selectedFeatureIds.value.delete(itemId);
  }
  if (action === "moveUp" || action === "moveDown") {
    const item = geo.getLayerItemById(itemId).layerItem;
    if (!item) return;
    const owner = geo.getLayerById(item._pid);
    if (!owner || owner.locked || item.locked) return;
    const index = owner.items.indexOf(itemId);
    geo.moveFeature(itemId, action === "moveUp" ? index - 1 : index + 1);
  }
  if (action === "duplicate") {
    const newId = geo.duplicateFeature(itemId);
    if (newId) activeFeatureId.value = newId;
  }
  if (action === "copyAsGeoJson") {
    const item = geo.getLayerItemById(itemId).layerItem;
    if (!item) return;
    navigator.clipboard.writeText(layerItemsToGeoJsonString([item]));
    notify({
      message: isSupportedTacticalGraphic(item)
        ? "Copied GeoJSON to clipboard"
        : "The unsupported control measure was omitted from GeoJSON copy.",
      type: isSupportedTacticalGraphic(item) ? undefined : "warning",
    });
  }
}

function onControlMeasureLayerAction(
  layer: { id: FeatureId; items?: FeatureId[]; _isOpen?: boolean },
  action: ScenarioLayerAction,
) {
  onLayerAction(layer as NScenarioLayer, action);
}

function onControlMeasureDoubleClick(item: NTacticalGraphicLayerItem) {
  engineRef.value?.layers.zoomToFeature(item.id);
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
    settleEditedControlMeasureBeforeDelete(layer.items);
    if (
      scenarioDraw?.armed.value.kind === "cmDraw" &&
      scenarioDraw.controlMeasureDrawDestinationLayerId?.value === layer.id
    ) {
      tacticalGraphicRenderFeed?.settle("delete");
    }
    const overlays = geo.overlayLayers?.value ?? [];
    const sameFamily = overlays.filter(
      (candidate) =>
        candidate.id !== layer.id &&
        isControlMeasureLayer(candidate) ===
          isControlMeasureLayer(layer as unknown as NScenarioOverlayLayer),
    );
    const layerIndex = overlays.findIndex((candidate) => candidate.id === layer.id);
    const nearest = (candidates: NScenarioOverlayLayer[]) =>
      candidates.find(
        (candidate) =>
          overlays.findIndex((overlay) => overlay.id === candidate.id) > layerIndex,
      ) ??
      [...candidates]
        .reverse()
        .find(
          (candidate) =>
            overlays.findIndex((overlay) => overlay.id === candidate.id) < layerIndex,
        );
    const otherFamily = overlays.filter(
      (candidate) =>
        candidate.id !== layer.id &&
        isControlMeasureLayer(candidate) !==
          isControlMeasureLayer(layer as unknown as NScenarioOverlayLayer),
    );
    const fallback = nearest(sameFamily) ?? nearest(otherFamily);
    geo.deleteLayer(layer.id);
    if (activeLayerId.value === layer.id) activeLayerId.value = fallback?.id ?? null;
  }
  if (
    action === ScenarioLayerActions.MoveUp ||
    action === ScenarioLayerActions.MoveDown
  ) {
    const direction = action === ScenarioLayerActions.MoveUp ? "up" : "down";
    const current = geo.getLayerById(layer.id) as NScenarioOverlayLayer | undefined;
    if (current && isControlMeasureLayer(current)) {
      const family = (geo.overlayLayers?.value ?? []).filter(isControlMeasureLayer);
      const familyIndex = family.findIndex((candidate) => candidate.id === layer.id);
      const neighbor = family[direction === "up" ? familyIndex - 1 : familyIndex + 1];
      if (neighbor) geo.moveLayer(layer.id, geo.getLayerIndex(neighbor.id));
    } else {
      let toIndex = geo.getLayerIndex(layer.id);
      if (direction === "up") toIndex--;
      if (direction === "down") toIndex++;
      geo.moveLayer(layer.id, toIndex);
    }
  }
  if (action === ScenarioLayerActions.CopyAsGeoJson) {
    const fullLayer = geo.getFullLayerItemsLayer(layer.id);
    if (fullLayer) {
      navigator.clipboard.writeText(layerItemsToGeoJsonString(fullLayer.items));
      const unsupportedCount = fullLayer.items.filter(
        (item) => isNTacticalGraphicLayerItem(item) && !isSupportedTacticalGraphic(item),
      ).length;
      notify({
        message: unsupportedCount
          ? `Copied GeoJSON; omitted ${unsupportedCount} unsupported control measure${unsupportedCount === 1 ? "" : "s"}.`
          : "Copied GeoJSON to clipboard",
        type: unsupportedCount ? "warning" : undefined,
      });
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
  feature: NScenarioLayerItem;
  destinationFeature: NScenarioLayerItem | NScenarioLayer;
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

function addNewControlMeasureLayer() {
  const addedLayer = createControlMeasureLayer(geo, NEW_CONTROL_MEASURE_LAYER_NAME);
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

function onLayerDrop(layer: NScenarioLayer, feature: NScenarioLayerItem) {
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
      isScenarioFeatureLayerDragItem(source.data) ||
      isScenarioMapLayerDragItem(source.data),
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
        (isScenarioFeatureLayerDragItem(source.data) ||
          isScenarioMapLayerDragItem(source.data)) &&
        (isScenarioFeatureLayerDragItem(destination.data) ||
          isScenarioMapLayerDragItem(destination.data))
      ) {
        const sourceId = isScenarioFeatureLayerDragItem(source.data)
          ? source.data.layer.id
          : source.data.mapLayer.id;
        const destinationId = isScenarioFeatureLayerDragItem(destination.data)
          ? destination.data.layer.id
          : destination.data.mapLayer.id;
        if (isScenarioFeatureLayerDragItem(source.data)) {
          const sourceIsControlMeasure = isControlMeasureLayer(
            source.data.layer as unknown as NScenarioOverlayLayer,
          );
          if (
            !isScenarioFeatureLayerDragItem(destination.data) ||
            sourceIsControlMeasure !==
              isControlMeasureLayer(
                destination.data.layer as unknown as NScenarioOverlayLayer,
              )
          ) {
            return;
          }
        }
        if (sourceId !== destinationId) {
          const fromIndex = geo.getLayerIndex(sourceId);
          let toIndex = geo.getLayerIndex(destinationId);
          if (closestEdgeOfTarget === "bottom") toIndex++;
          if (fromIndex < toIndex) toIndex--;
          if (isScenarioMapLayerDragItem(source.data)) {
            geo.moveMapLayer(sourceId, { toIndex });
          } else {
            geo.moveLayer(sourceId, toIndex);
          }
          nextTick(() => {
            const el =
              document.querySelector(`[data-layer-id="${sourceId}"]`) ??
              document.querySelector(`[data-map-layer-id="${sourceId}"]`);
            if (el) {
              triggerPostMoveFlash(el);
            }
          });
        }
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
    <div class="group flex items-center justify-end">
      <DotsMenu :items="mapLayersMenuItems" />
    </div>
    <div>
      <template v-for="layer in stackLayers" :key="layer.id">
        <ScenarioFeatureLayer
          v-if="isOverlayStackEntry(layer) && !controlMeasureOnlyLayerIds.has(layer.id)"
          :features="getOverlayFeatures(layer as NScenarioOverlayLayer)"
          :layer="layer as unknown as NScenarioLayer"
          :layer-menu-items="layerMenuItems"
          :feature-menu-items="availableItemMenuItems"
          v-model:activeLayerId="activeLayerId"
          v-model:editedLayerId="editedLayerId"
          @feature-click="onFeatureClick"
          @feature-double-click="onFeatureDoubleClick"
          @feature-action="onFeatureAction"
          @layer-action="onLayerAction"
        />
        <ScenarioReferenceLayerRow
          v-else-if="isReferenceStackEntry(layer)"
          :map-layer="getReferenceLayerSource(layer)"
          :label="layer.name"
          :active-map-layer-id="activeMapLayerId"
          :selected="selectedMapLayerIds.has(getReferenceLayerSource(layer).id)"
          :menu-items="mapLayerMenuItems"
          @click="onImageLayerClick(getReferenceLayerSource(layer), $event)"
          @dblclick="onImageLayerDoubleClick(getReferenceLayerSource(layer))"
          @toggle-visibility="toggleMapLayerVisibility(getReferenceLayerSource(layer))"
          @action="onMapLayerAction(getReferenceLayerSource(layer), $event)"
        />
      </template>
    </div>

    <!--
      The control-measure stack sits below the feature/reference tree in the panel,
      reflecting that tactical-draw renders the whole stack above plain geometry.
    -->
    <div v-if="controlMeasureGroups.length">
      <ControlMeasureLayer
        v-for="group in controlMeasureGroups"
        :key="group.layer.id"
        :layer="group.layer"
        :items="group.items"
        :layer-menu-items="layerMenuItems"
        :item-menu-items="availableItemMenuItems"
        v-model:activeLayerId="activeLayerId"
        v-model:editedLayerId="editedLayerId"
        @item-click="onFeatureClick"
        @item-double-click="onControlMeasureDoubleClick"
        @item-action="onControlMeasureAction"
        @layer-action="onControlMeasureLayerAction"
      />
    </div>

    <footer class="my-8 text-right">
      <SplitButton :items="mapLayerButtonItems" />
    </footer>
  </div>
</template>
