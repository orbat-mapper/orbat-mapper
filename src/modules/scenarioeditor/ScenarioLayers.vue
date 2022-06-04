<script setup lang="ts">
import { onActivated, onDeactivated, onMounted, ref, shallowRef, watch } from "vue";
import BaseButton from "../../components/BaseButton.vue";
import OLMap from "ol/Map";
import { useGeoStore } from "../../stores/geoStore";
import MapEditToolbar from "../../components/MapEditToolbar.vue";
import VectorLayer from "ol/layer/Vector";
import { LayersPlus } from "mdue";

import {
  useScenarioFeatureSelect,
  useScenarioLayers,
  useScenarioLayerSync,
} from "../../composables/scenarioLayers";
import {
  FeatureId,
  ScenarioFeature,
  ScenarioLayer,
  ScenarioLayerInstance,
} from "../../types/scenarioGeoModels";
import CreateEmtpyDashed from "../../components/CreateEmtpyDashed.vue";
import { nanoid } from "../../utils";
import { ScenarioFeatureActions, ScenarioLayerActions } from "../../types/constants";
import ScenarioLayersListLayer from "./ScenarioLayersListLayer.vue";
import { useToggle, useVModel } from "@vueuse/core";
import Feature from "ol/Feature";
import ScenarioLayersPanel from "./ScenarioLayersPanel.vue";
import { AnyVectorLayer } from "../../geo/types";
import { useScenarioLayersStore } from "../../stores/scenarioLayersStore";
import NProgress from "nprogress";

const props = defineProps<{
  modelValue: boolean;
  activeLayerId: FeatureId | null;
  activeFeatureId: FeatureId | null;
}>();
const emit = defineEmits(["update:modelValue"]);

const showLayerPanel = useVModel(props, "modelValue", emit);

const toggleLayerPanel = useToggle(showLayerPanel);

const isActive = ref(true);
const mapRef = useGeoStore().olMap! as OLMap;
const isSelectActive = ref(true);

const {
  scenarioLayersGroup,
  scenarioLayers: layers,
  getOlLayerById,
  addLayer,
  zoomToFeature,
  deleteFeature,
  updateLayer,
  toggleLayerVisibility,
  zoomToLayer,
  deleteLayer,
  addOlFeature,
  moveFeature,
  moveLayer,
  updateFeatureFromOlFeature,
  getFeatureLayer,
  updateFeature,
  panToFeature,
  getOlFeatureById,
} = useScenarioLayers(mapRef);

const { selectedIds, selectedFeatures, select } = useScenarioFeatureSelect(mapRef, {
  enable: isSelectActive,
});

const layerStore = useScenarioLayersStore();

useScenarioLayerSync(scenarioLayersGroup.getLayers() as any);
const activeLayer = ref<ScenarioLayerInstance | null>(null);
const olCurrentLayer = shallowRef<VectorLayer<any> | null>(null);
const activeFeature = ref<ScenarioFeature | null>(null);

function addNewLayer() {
  const addedLayer = addLayer({
    id: nanoid(),
    name: `New layer ${layers.value.length + 1}`,
    features: [],
    _isNew: true,
  });
  setActiveLayer(addedLayer);
}

function setActiveLayer(layer: ScenarioLayer, toggle = true) {
  const l = getOlLayerById(layer.id);
  if (!l) return;

  if (toggle && activeLayer.value?.id === layer.id) {
    olCurrentLayer.value = null;
    activeLayer.value = null;
  } else {
    olCurrentLayer.value = l;
    activeLayer.value = layer;
  }
}

function onFeatureAction(
  feature: ScenarioFeature,
  action: ScenarioFeatureActions,
  scenarioLayer?: ScenarioLayer
) {
  if (action === ScenarioFeatureActions.Zoom) zoomToFeature(feature);
  if (action === ScenarioFeatureActions.Pan) panToFeature(feature);
  const layer = scenarioLayer || getFeatureLayer(feature);
  if (!layer) return;

  if (action === ScenarioFeatureActions.Delete) {
    if (feature === activeFeature.value) activeFeature.value = null;
    showLayerPanel.value = false;
    deleteFeature(feature, layer);
  }
  if (
    action === ScenarioFeatureActions.MoveUp ||
    action === ScenarioFeatureActions.MoveDown
  ) {
    const direction = action === ScenarioFeatureActions.MoveUp ? "up" : "down";
    moveFeature(feature, direction);
  }
}

function onLayerAction(layer: ScenarioLayer, action: ScenarioLayerActions) {
  if (action === ScenarioLayerActions.Zoom) zoomToLayer(layer);
  if (action === ScenarioLayerActions.Delete) {
    if (activeLayer.value?.id === layer.id) {
      activeLayer.value = null;
      olCurrentLayer.value = null;
    }
    deleteLayer(layer);
  }
  if (
    action === ScenarioLayerActions.MoveUp ||
    action === ScenarioLayerActions.MoveDown
  ) {
    const direction = action === ScenarioLayerActions.MoveUp ? "up" : "down";
    moveLayer(layer, direction);
  }
}

function onLayerUpdate(layer: ScenarioLayer, data: Partial<ScenarioLayer>) {
  updateLayer(layer, data);
}

function onFeatureClick(
  feature: ScenarioFeature,
  layer: ScenarioLayer,
  shiftClick: boolean
) {
  activeFeature.value = activeFeature.value === feature ? null : feature;
  showLayerPanel.value = activeFeature.value === feature;
  const f = getOlFeatureById(feature.id);
  f && !shiftClick && selectedFeatures.clear();
  f && selectedFeatures.push(f);
}

function onFeatureModify(olFeatures: Feature[]) {
  olFeatures.forEach((f) => updateFeatureFromOlFeature(f));
}

function onFeatureAdd(olFeature: Feature, olLayer: AnyVectorLayer) {
  const scenarioFeature = addOlFeature(olFeature, olLayer);
  activeFeature.value = scenarioFeature;
}

onActivated(() => (isActive.value = true));
onDeactivated(() => (isActive.value = false));

watch(isActive, (active) => {
  if (showLayerPanel.value && !active) {
    showLayerPanel.value = false;
    activeFeature.value = null;
  }
  isSelectActive.value = active;
});

watch(
  () => props.activeFeatureId,
  (id) => {
    if (!id) return;
    const { feature, layer } = layerStore.getFeatureById(id) || {};
    if (layer) layer._isOpen = true;
    activeFeature.value = null;
    feature && layer && onFeatureClick(feature, layer, false);
  },
  { immediate: true }
);

watch(
  () => props.activeLayerId,
  (id) => {
    if (!id) return;
    const layer = layerStore.getLayerById(id);
    if (!layer) return;
    setActiveLayer(layer, false);
    layer._isOpen = true;
  },
  { immediate: true }
);

onMounted(() => {
  NProgress.done();
  if (layers.value.length) setActiveLayer(layers.value[0]);
});
</script>

<template>
  <div class="px-6">
    <div v-if="layers.length === 0">
      <CreateEmtpyDashed
        v-if="layers.length === 0"
        @click="addNewLayer()"
        :icon="LayersPlus"
      >
        Add a new scenario layer
      </CreateEmtpyDashed>
    </div>
    <div v-else>
      <ScenarioLayersListLayer
        v-for="layer in layers"
        :key="layer.id"
        :layer="layer"
        :is-active="activeLayer === layer"
        @set-active="setActiveLayer"
        @feature-action="onFeatureAction"
        @update-layer="onLayerUpdate"
        @toggle-layer="toggleLayerVisibility"
        @layer-action="onLayerAction"
        @feature-click="onFeatureClick"
        :active-feature="activeFeature"
        :selectedIds="selectedIds"
      />
      <p class="my-5 text-right">
        <BaseButton @click="addNewLayer" secondary> Add new layer</BaseButton>
      </p>
    </div>
  </div>

  <Teleport to="[data-teleport-map]">
    <MapEditToolbar
      v-if="isActive && activeLayer && olCurrentLayer"
      :key="activeLayer.id"
      :ol-map="mapRef"
      :layer="olCurrentLayer"
      class="absolute left-3 top-[150px]"
      @add="onFeatureAdd"
      @modify="onFeatureModify"
      add-multiple
      :select="select"
    />
  </Teleport>
  <Teleport to="[data-teleport-layer]" v-if="activeFeature">
    <ScenarioLayersPanel
      :feature="activeFeature"
      @close="toggleLayerPanel()"
      @feature-action="onFeatureAction"
      @feature-meta-update="updateFeature"
    />
  </Teleport>
</template>
