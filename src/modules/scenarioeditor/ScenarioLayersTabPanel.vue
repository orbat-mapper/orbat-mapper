<script setup lang="ts">
import { injectStrict, nanoid } from "@/utils";
import { activeLayerKey, activeMapKey, activeScenarioKey } from "@/components/injects";
import {
  featureMenuItems,
  getGeometryIcon,
  useScenarioLayers,
  useScenarioLayerSync,
} from "@/modules/scenarioeditor/scenarioLayers2";
import ChevronPanel from "@/components/ChevronPanel.vue";
import { nextTick, onUnmounted, ref } from "vue";
import { NScenarioFeature, NScenarioLayer } from "@/types/internalModels";
import { FeatureId, ScenarioImageLayer, ScenarioLayer } from "@/types/scenarioGeoModels";
import {
  IconClockOutline,
  IconEye,
  IconEyeOff,
  IconImage as ImageIcon,
  IconStar,
  IconStarOutline,
} from "@iconify-prerendered/vue-mdi";
import DotsMenu from "@/components/DotsMenu.vue";
import { useUiStore } from "@/stores/uiStore";
import { MenuItemData } from "@/components/types";
import {
  ScenarioFeatureActions,
  ScenarioImageLayerAction,
  ScenarioLayerAction,
  ScenarioLayerActions,
} from "@/types/constants";
import BaseButton from "@/components/BaseButton.vue";
import { PlusIcon } from "@heroicons/vue/24/solid";
import EditLayerInlineForm from "@/modules/scenarioeditor/EditLayerInlineForm.vue";
import { useSelectedItems } from "@/stores/selectedStore";
import { useEventBus } from "@vueuse/core";
import { imageLayerAction } from "@/components/eventKeys";

const emit = defineEmits(["feature-click"]);

const mapRef = injectStrict(activeMapKey);
const activeLayerId = injectStrict(activeLayerKey);
const uiStore = useUiStore();
const {
  geo,
  store: { groupUpdate, state },
} = injectStrict(activeScenarioKey);

const { imageLayers } = geo;
uiStore.layersPanelActive = true;
onUnmounted(() => (uiStore.layersPanelActive = false));

const imageLayerMenuItems: MenuItemData<ScenarioImageLayerAction>[] = [
  { label: "Zoom to", action: "zoom" },
  // { label: "Delete", action: "delete" },
];

const {
  scenarioLayersFeatures,
  scenarioLayersGroup,
  toggleLayerVisibility,
  moveLayer,
  deleteLayer,
  zoomToLayer,
  zoomToFeature,
  zoomToFeatures,
  deleteFeature,
  panToFeature,
  moveFeature,
  addLayer,
  updateLayer,
} = useScenarioLayers(mapRef.value);
useScenarioLayerSync(scenarioLayersGroup.getLayers() as any);

const { selectedFeatureIds, selectedImageLayerIds, activeImageLayerId, activeFeatureId } =
  useSelectedItems();

const editedLayerId = ref<FeatureId | null>(null);

function onFeatureClick(
  feature: NScenarioFeature,
  layer: NScenarioLayer,
  event?: MouseEvent
) {
  const isMultiSelect = event?.ctrlKey || event?.shiftKey;

  const alreadySelected = selectedFeatureIds.value.has(feature.id);
  if (!isMultiSelect) {
    selectedFeatureIds.value.clear();
    selectedImageLayerIds.value.clear();
    nextTick(() => selectedFeatureIds.value.add(feature.id));
  } else {
    if (alreadySelected && event?.ctrlKey) {
      selectedFeatureIds.value.delete(feature.id);
    } else {
      selectedFeatureIds.value.add(feature.id);
    }
  }
  emit("feature-click", feature, layer, event);
}

function onFeatureDoubleClick(
  feature: NScenarioFeature,
  layer: NScenarioLayer,
  event?: MouseEvent
) {
  zoomToFeature(feature.id);
}

const bus = useEventBus(imageLayerAction);

function onImageLayerClick(layer: ScenarioImageLayer, event?: MouseEvent) {
  if (event?.ctrlKey || event?.shiftKey) {
    if (selectedImageLayerIds.value.has(layer.id)) {
      selectedImageLayerIds.value.delete(layer.id);
    } else {
      selectedImageLayerIds.value.add(layer.id);
    }
  } else {
    selectedImageLayerIds.value.clear();
    selectedImageLayerIds.value.add(layer.id);
  }
}
function onImageLayerDoubleClick(layer: ScenarioImageLayer) {
  bus.emit({ action: "zoom", id: layer.id });
}

const layerMenuItems: MenuItemData<ScenarioLayerAction>[] = [
  { label: "Zoom to", action: ScenarioLayerActions.Zoom },
  { label: "Set as active", action: ScenarioLayerActions.SetActive },
  { label: "Edit", action: ScenarioLayerActions.Edit },
  { label: "Move up", action: ScenarioLayerActions.MoveUp },
  { label: "Move down", action: ScenarioLayerActions.MoveDown },
  { label: "Delete", action: ScenarioLayerActions.Delete },
];

function onImageLayerAction(layer: ScenarioImageLayer, action: ScenarioImageLayerAction) {
  if (action === "zoom") bus.emit({ action, id: layer.id });
}

function onLayerAction(
  layer: ScenarioLayer | NScenarioLayer,
  action: ScenarioLayerAction
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

function onFeatureAction(
  featureOrFeaturesId: FeatureId | FeatureId[],
  action: ScenarioFeatureActions
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
          deleteFeature(feature.id);
        }
        if (action === "moveUp" || action === "moveDown") {
          const direction = action === "moveUp" ? "up" : "down";
          moveFeature(feature, direction);
        }
      }),
    { label: "batchLayer", value: "dummy" }
  );
}

function addNewLayer() {
  const addedLayer = addLayer({
    id: nanoid(),
    name: `New layer`,
    features: [],
    _isNew: false,
  });
  activeLayerId.value = addedLayer.id;
  editedLayerId.value = addedLayer.id;
}

function addImageLayer() {
  geo.addImageLayer({
    id: nanoid(),
    name: "Test",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Achin,_Plan_de_la_ville_de_Paris_repr%C3%A9sentant_les_nouvelles_voitures_publiques,_1828.jpg",
    attributions: [
      "<a href='http://www.geoportail.gouv.fr/actualite/181/telechargez-les-cartes-et-photographies-aeriennes-historiques'>Photo historique &copy; IGN</a>",
    ],
  });
}

function toggleImageLayerVisibility(layer: ScenarioImageLayer) {
  geo.updateImageLayer(layer.id, { isHidden: !layer.isHidden });
}
</script>

<template>
  <div>
    <ChevronPanel label="Image layers" class="mb-4" open>
      <ul class="-mt-6">
        <li
          v-for="layer in imageLayers"
          class="group flex items-center justify-between border-l pl-1 hover:bg-amber-50"
          :key="layer.id"
          @dblclick="onImageLayerDoubleClick(layer)"
          @click="onImageLayerClick(layer, $event)"
          :class="
            selectedImageLayerIds.has(layer.id)
              ? 'border-yellow-500 bg-yellow-100'
              : 'border-transparent'
          "
        >
          <button class="flex flex-auto items-center py-2.5 sm:py-2">
            <ImageIcon class="h-5 w-5 text-gray-400" />
            <span
              class="ml-2 text-left text-sm text-gray-700 group-hover:text-gray-900"
              :class="{
                'font-bold': activeImageLayerId === layer.id,
                'opacity-50': layer.isHidden,
              }"
            >
              {{ layer.name }}
            </span>
          </button>
          <div class="relative flex items-center">
            <button
              type="button"
              @click="toggleImageLayerVisibility(layer)"
              @keydown.stop
              class="ml-1 text-gray-500 opacity-0 hover:text-gray-700 group-focus-within:opacity-100 group-hover:opacity-100"
              title="Toggle layer visibility"
            >
              <IconEyeOff v-if="layer.isHidden" class="h-5 w-5" />
              <IconEye class="h-5 w-5" v-else />
            </button>
            <DotsMenu
              :items="imageLayerMenuItems"
              @action="onImageLayerAction(layer, $event)"
              class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
            />
          </div>
        </li>
      </ul>
    </ChevronPanel>
    <ChevronPanel
      v-for="{ layer, features } in scenarioLayersFeatures"
      :key="layer.id"
      :label="layer.name"
      v-model:open="layer._isOpen"
    >
      <template #label
        ><span
          @dblclick="activeLayerId = layer.id"
          :class="[
            layer.isHidden ? 'opacity-50' : '',
            layer.id === activeLayerId ? 'text-red-900' : '',
          ]"
          >{{ layer.name }}</span
        ></template
      >
      <template #right>
        <div class="flex items-center">
          <button
            type="button"
            @click="activeLayerId = layer.id"
            @keydown.stop
            class="text-gray-500 opacity-0 hover:text-gray-700 group-focus-within:opacity-100 group-hover:opacity-100"
            title="Set as active layer"
          >
            <IconStar v-if="activeLayerId === layer.id" class="h-5 w-5" />
            <IconStarOutline class="h-5 w-5" v-else />
          </button>
          <button
            type="button"
            @click="toggleLayerVisibility(layer)"
            @keydown.stop
            class="ml-1 text-gray-500 opacity-0 hover:text-gray-700 group-focus-within:opacity-100 group-hover:opacity-100"
            title="Toggle layer visibility"
          >
            <IconEyeOff v-if="layer.isHidden" class="h-5 w-5" />
            <IconEye class="h-5 w-5" v-else />
          </button>

          <IconClockOutline
            v-if="layer.visibleFromT || layer.visibleUntilT"
            class="h-5 w-5 text-gray-400"
          />
          <DotsMenu
            class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
            :items="layerMenuItems"
            @action="onLayerAction(layer, $event)"
          />
        </div>
      </template>
      <EditLayerInlineForm
        v-if="editedLayerId === layer.id"
        :layer="layer"
        class="-ml-5 -mt-6 border"
        @close="editedLayerId = null"
        @update="updateLayer(layer.id, $event)"
      />
      <ul class="-mt-6">
        <li
          v-for="feature in features"
          class="group flex items-center justify-between border-l pl-1 hover:bg-amber-50"
          :key="feature.id"
          :class="
            selectedFeatureIds.has(feature.id)
              ? 'border-yellow-500 bg-yellow-100'
              : 'border-transparent'
          "
        >
          <button
            @click="onFeatureClick(feature, layer, $event)"
            @dblclick="onFeatureDoubleClick(feature, layer, $event)"
            class="flex flex-auto items-center py-2.5 sm:py-2"
          >
            <component :is="getGeometryIcon(feature)" class="h-5 w-5 text-gray-400" />
            <span
              class="ml-2 text-left text-sm text-gray-700 group-hover:text-gray-900"
              :class="{
                'font-bold': activeFeatureId === feature.id,
                'opacity-50': layer.isHidden,
              }"
            >
              {{
                feature.properties.name ||
                feature.properties.type ||
                feature.geometry.type
              }}
            </span>
          </button>
          <div class="relative flex items-center">
            <IconClockOutline
              v-if="feature.properties.visibleFromT || feature.properties.visibleUntilT"
              class="h-5 w-5 text-gray-400"
            />
            <DotsMenu
              :items="featureMenuItems"
              @action="onFeatureAction(feature.id, $event)"
              class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
            />
          </div>
        </li>
      </ul>
    </ChevronPanel>
    <p class="my-8 text-right">
      <BaseButton @click="addNewLayer()" small secondary>
        <PlusIcon class="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
        Add layer
      </BaseButton>
      <BaseButton @click="addImageLayer()" small secondary class="ml-2">
        <PlusIcon class="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
        Add image layer
      </BaseButton>
    </p>
  </div>
</template>
