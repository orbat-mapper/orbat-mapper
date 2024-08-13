<script setup lang="ts">
import { injectStrict, nanoid } from "@/utils";
import { activeLayerKey, activeMapKey, activeScenarioKey } from "@/components/injects";
import {
  useFeatureLayerUtils,
  useScenarioLayerSync,
} from "@/modules/scenarioeditor/featureLayerUtils";
import ChevronPanel from "@/components/ChevronPanel.vue";
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { NScenarioFeature, NScenarioLayer } from "@/types/internalModels";
import {
  FeatureId,
  ScenarioLayer,
  ScenarioMapLayer,
  ScenarioMapLayerType,
} from "@/types/scenarioGeoModels";
import { IconEye, IconEyeOff } from "@iconify-prerendered/vue-mdi";
import DotsMenu from "@/components/DotsMenu.vue";
import { useUiStore } from "@/stores/uiStore";
import { ButtonGroupItem, DropTarget, MenuItemData } from "@/components/types";
import {
  ScenarioFeatureActions,
  ScenarioLayerAction,
  ScenarioLayerActions,
  ScenarioMapLayerAction,
} from "@/types/constants";
import { useSelectedItems } from "@/stores/selectedStore";
import { useEventBus } from "@vueuse/core";
import { imageLayerAction } from "@/components/eventKeys";
import { addMapLayer, getMapLayerIcon } from "@/modules/scenarioeditor/scenarioMapLayers";
import SplitButton from "@/components/SplitButton.vue";
import { useDragStore } from "@/stores/dragStore";
import ScenarioFeatureLayer from "@/modules/scenarioeditor/ScenarioFeatureLayer.vue";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  isScenarioFeatureDragItem,
  isScenarioFeatureLayerDragItem,
} from "@/types/draggables";
import {
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

const emit = defineEmits(["feature-click"]);

const mapRef = injectStrict(activeMapKey);
const activeLayerId = injectStrict(activeLayerKey);
const uiStore = useUiStore();
const {
  geo,
  store: { groupUpdate, state },
} = injectStrict(activeScenarioKey);

const { mapLayers } = geo;
uiStore.layersPanelActive = true;
const dragStore = useDragStore();
onUnmounted(() => (uiStore.layersPanelActive = false));

const mapLayerMenuItems: MenuItemData<ScenarioMapLayerAction>[] = [
  { label: "Zoom to", action: "zoom" },
  { label: "Move up", action: "moveUp" },
  { label: "Move down", action: "moveDown" },
  { label: "Delete", action: "delete" },
];

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

const {
  scenarioLayersFeatures,
  scenarioLayersGroup,
  zoomToLayer,
  zoomToFeature,
  zoomToFeatures,
  panToFeature,
} = useFeatureLayerUtils(mapRef.value);
useScenarioLayerSync(scenarioLayersGroup.getLayers() as any);

const { selectedFeatureIds, selectedMapLayerIds, activeMapLayerId, activeFeatureId } =
  useSelectedItems();

const editedLayerId = ref<FeatureId | null>(null);

function calculateSelectedFeatureIds(newFeatureId: FeatureId): FeatureId[] {
  const lastSelectedId = [...selectedFeatureIds.value].pop();
  if (lastSelectedId === undefined) return [newFeatureId];
  const allOpenFeatures: FeatureId[] = [];
  for (const { features, layer } of scenarioLayersFeatures.value) {
    if (!(layer._isOpen === false)) {
      features.forEach((feature) => {
        allOpenFeatures.push(feature.id);
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
  feature: NScenarioFeature,
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
  feature: NScenarioFeature,
  layer: NScenarioLayer,
  event?: MouseEvent,
) {
  zoomToFeature(feature.id);
}

const bus = useEventBus(imageLayerAction);

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
  bus.emit({ action: "zoom", id: layer.id });
}

const mapLayersMenuItems: MenuItemData[] = [
  { label: "Add image layer", action: () => addNewMapLayer("ImageLayer") },
  { label: "Add TileJSON layer", action: () => addNewMapLayer("TileJSONLayer") },
  { label: "Add XYZ tile layer", action: () => addNewMapLayer("XYZLayer") },
];

function onMapLayerAction(layer: ScenarioMapLayer, action: ScenarioMapLayerAction) {
  if (action === "zoom") bus.emit({ action, id: layer.id });
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

function onLayerAction(
  layer: ScenarioLayer | NScenarioLayer,
  action: ScenarioLayerAction,
) {
  if (action === ScenarioLayerActions.SetActive) activeLayerId.value = layer.id;
  if (action === ScenarioLayerActions.Zoom) zoomToLayer(layer.id);
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
}

function onFeatureAction(
  featureOrFeaturesId: FeatureId | FeatureId[],
  action: ScenarioFeatureActions,
) {
  const isArray = Array.isArray(featureOrFeaturesId);

  if (isArray && (action === "zoom" || action === "pan")) {
    zoomToFeatures(featureOrFeaturesId);
    return;
  }
  const tmp = isArray ? featureOrFeaturesId : [featureOrFeaturesId];
  groupUpdate(
    () =>
      tmp.forEach((featureId) => {
        const { feature, layer } = geo.getFeatureById(featureId) || {};
        if (action === "zoom") zoomToFeature(featureId);
        if (action === "pan") panToFeature(featureId);

        if (!layer || !layer) return;

        if (action === "delete") {
          geo.deleteFeature(feature.id);
          selectedFeatureIds.value.delete(feature.id);
        }
        if (action === "moveUp" || action === "moveDown") {
          const direction = action === "moveUp" ? "up" : "down";
          const layer = geo.getLayerById(feature._pid);
          let toIndex = layer.features.indexOf(feature.id);

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
  feature: NScenarioFeature;
  destinationFeature: NScenarioFeature | NScenarioLayer;
  target: DropTarget;
}) {
  const { feature, destinationFeature, target } = data;
  geo.reorderFeature(feature.id, destinationFeature.id, target);
}

function addNewLayer() {
  const addedLayer = geo.addLayer({
    id: nanoid(),
    name: `New layer`,
    features: [],
    _isNew: false,
  });
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

function onLayerDrop(layer: NScenarioLayer, feature: NScenarioFeature) {
  onFeatureDrop({
    feature,
    destinationFeature: layer,
    target: "on",
  });
}

let dndCleanup: () => void = () => {};
onMounted(() => {
  dndCleanup = monitorForElements({
    canMonitor: ({ source }) => isScenarioFeatureDragItem(source.data),
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
      } else if (
        isScenarioFeatureLayerDragItem(destination.data) &&
        isScenarioFeatureDragItem(source.data)
      ) {
        onLayerDrop(destination.data.layer, source.data.feature);
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
      label="Map layers"
      class="mb-4"
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
      <ul class="-mt-6">
        <li
          v-for="layer in mapLayers"
          class="group flex items-center justify-between border-l pl-1 hover:bg-amber-50"
          :key="layer.id"
          @dblclick="onImageLayerDoubleClick(layer)"
          @click="onImageLayerClick(layer, $event)"
          :class="
            selectedMapLayerIds.has(layer.id)
              ? 'border-yellow-500 bg-yellow-100'
              : 'border-transparent'
          "
        >
          <button class="flex flex-auto items-center py-2.5 sm:py-2">
            <component :is="getMapLayerIcon(layer)" class="h-5 w-5 text-gray-400" />
            <span
              class="ml-2 text-left text-sm text-gray-700 group-hover:text-gray-900"
              :class="{
                'font-bold': activeMapLayerId === layer.id,
                'opacity-50': layer.isHidden,
              }"
            >
              {{ layer.name }}
            </span>
          </button>
          <div class="relative flex items-center">
            <span
              v-if="layer._isTemporary"
              class="badge"
              title="Temporary layer. Not saved"
              >TEMP</span
            >
            <button
              type="button"
              @click="toggleMapLayerVisibility(layer)"
              @keydown.stop
              class="ml-1 text-gray-500 opacity-0 hover:text-gray-700 group-focus-within:opacity-100 group-hover:opacity-100"
              title="Toggle layer visibility"
            >
              <IconEyeOff v-if="layer.isHidden" class="h-5 w-5" />
              <IconEye class="h-5 w-5" v-else />
            </button>
            <DotsMenu
              :items="mapLayerMenuItems"
              @action="onMapLayerAction(layer, $event)"
              class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
            />
          </div>
        </li>
      </ul>
    </ChevronPanel>
    <ScenarioFeatureLayer
      v-for="{ layer, features } in scenarioLayersFeatures"
      :key="layer.id"
      :features="features"
      :layer="layer"
      v-model:activeLayerId="activeLayerId"
      v-model:editedLayerId="editedLayerId"
      @feature-click="onFeatureClick"
      @feature-double-click="onFeatureDoubleClick"
      @feature-action="onFeatureAction"
      @layer-action="onLayerAction"
    />

    <footer class="my-8 text-right">
      <SplitButton :items="mapLayerButtonItems" />
    </footer>
  </div>
</template>
