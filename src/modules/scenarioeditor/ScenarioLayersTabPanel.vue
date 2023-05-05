<script setup lang="ts">
import { injectStrict } from "@/utils";
import { activeMapKey } from "@/components/injects";
import {
  getGeometryIcon,
  useScenarioLayers,
  useScenarioLayerSync,
} from "@/modules/scenarioeditor/scenarioLayers2";
import ChevronPanel from "@/components/ChevronPanel.vue";
import { useSelectedFeatures } from "@/stores/dragStore";
import { computed, onUnmounted } from "vue";
import { NScenarioFeature, NScenarioLayer } from "@/types/internalModels";
import { ScenarioLayer } from "@/types/scenarioGeoModels";
import CloseButton from "@/components/CloseButton.vue";
import {
  IconClockOutline,
  IconEye,
  IconEyeOff,
  IconPencil,
} from "@iconify-prerendered/vue-mdi";
import DotsMenu from "@/components/DotsMenu.vue";
import { useUiStore } from "@/stores/uiStore";
import { MenuItemData } from "@/components/types";
import { ScenarioLayerAction, ScenarioLayerActions } from "@/types/constants";

const emit = defineEmits(["feature-click"]);

const mapRef = injectStrict(activeMapKey);
const uiStore = useUiStore();

uiStore.layersPanelActive = true;
onUnmounted(() => (uiStore.layersPanelActive = false));

const {
  scenarioLayers,
  scenarioLayersGroup,
  toggleLayerVisibility,
  moveLayer,
  deleteLayer,
  zoomToLayer,
} = useScenarioLayers(mapRef.value);
useScenarioLayerSync(scenarioLayersGroup.getLayers() as any);

const { selectedFeatureIds } = useSelectedFeatures();

const activeFeatureId = computed(() => {
  if (selectedFeatureIds.value.size === 1) {
    return selectedFeatureIds.value.values().next().value;
  }
  return null;
});

function onFeatureClick(
  feature: NScenarioFeature,
  layer: ScenarioLayer,
  event?: MouseEvent
) {
  const isMultiSelect = event?.ctrlKey || event?.shiftKey;

  const alreadySelected = selectedFeatureIds.value.has(feature.id);
  if (!isMultiSelect) {
    selectedFeatureIds.value.clear();
    selectedFeatureIds.value.add(feature.id);
  } else {
    if (alreadySelected && event?.ctrlKey) {
      selectedFeatureIds.value.delete(feature.id);
    } else {
      selectedFeatureIds.value.add(feature.id);
    }
  }
  emit("feature-click", feature, layer, event);
}

const layerMenuItems: MenuItemData<ScenarioLayerAction>[] = [
  { label: "Zoom to", action: ScenarioLayerActions.Zoom },
  //{ label: "Edit", action: ScenarioLayerActions.Rename },
  { label: "Move up", action: ScenarioLayerActions.MoveUp },
  { label: "Move down", action: ScenarioLayerActions.MoveDown },
  { label: "Delete", action: ScenarioLayerActions.Delete },
];

function onLayerAction(layer: ScenarioLayer, action: ScenarioLayerAction) {
  if (action === ScenarioLayerActions.Zoom) zoomToLayer(layer.id);
  if (action === ScenarioLayerActions.Delete) {
    /* if (activeLayer.value === layer.id) {
      activeLayer.value = null;
      olCurrentLayer.value = null;
    }*/
    deleteLayer(layer.id);
  }
  if (
    action === ScenarioLayerActions.MoveUp ||
    action === ScenarioLayerActions.MoveDown
  ) {
    const direction = action === ScenarioLayerActions.MoveUp ? "up" : "down";
    moveLayer(layer.id, direction);
  }
}
</script>

<template>
  <ChevronPanel
    v-for="layer in scenarioLayers"
    :key="layer.id"
    :label="layer.name"
    v-model:open="layer._isOpen"
  >
    <template #label
      ><span :class="layer.isHidden ? 'opacity-50' : ''">{{ layer.name }}</span></template
    >
    <template #right
      ><div class="flex items-center space-x-1">
        <button
          type="button"
          @click="toggleLayerVisibility(layer)"
          @keydown.stop
          class="hidden text-gray-500 hover:text-gray-700 group-focus-within:block group-hover:block"
        >
          <IconEyeOff v-if="layer.isHidden" class="h-5 w-5" />
          <IconEye class="h-5 w-5" v-else />
        </button>
        <IconClockOutline
          v-if="layer.visibleFromT || layer.visibleUntilT"
          class="h-5 w-5 text-gray-400"
        />
        <DotsMenu :items="layerMenuItems" @action="onLayerAction(layer, $event)" /></div
    ></template>
    <ul class="-mt-4">
      <li
        v-for="feature in layer.features"
        class="group flex h-10 items-center justify-between hover:bg-amber-50"
        :key="feature.id"
        :class="{ 'bg-yellow-100': selectedFeatureIds.has(feature.id) }"
      >
        <button @click="onFeatureClick(feature, layer, $event)" class="flex items-center">
          <component :is="getGeometryIcon(feature)" class="h-5 w-5 text-gray-400" />
          <span
            class="ml-2 text-left text-sm text-gray-700 group-hover:text-gray-900"
            :class="{
              'font-bold': activeFeatureId === feature.id,
              'opacity-50': layer.isHidden,
            }"
          >
            {{
              feature.properties.name || feature.properties.type || feature.geometry.type
            }}
          </span>
        </button>
        <div class="flex hidden text-sm group-focus-within:block group-hover:block">
          <CloseButton />
        </div>
      </li>
    </ul>
  </ChevronPanel>
</template>
