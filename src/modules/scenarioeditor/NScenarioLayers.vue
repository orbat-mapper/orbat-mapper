<script setup lang="ts">
import { onActivated, onDeactivated, onMounted, ref, shallowRef, watch } from "vue";
import BaseButton from "../../components/BaseButton.vue";
import OLMap from "ol/Map";
import MapEditToolbar from "@/components/MapEditToolbar.vue";
import VectorLayer from "ol/layer/Vector";
import { LayersPlus } from "mdue";
import { useGeoStore } from "@/stores/geoStore";

import {
  useScenarioFeatureSelect,
  useScenarioLayers,
  useScenarioLayerSync,
} from "./scenarioLayers2";
import {
  FeatureId,
  ScenarioFeature,
  ScenarioLayer,
  ScenarioLayerInstance,
} from "@/types/scenarioGeoModels";
import CreateEmtpyDashed from "../../components/CreateEmtpyDashed.vue";
import { injectStrict, nanoid } from "@/utils";
import { ScenarioFeatureActions, ScenarioLayerActions } from "@/types/constants";
import ScenarioLayersListLayer from "./ScenarioLayersListLayer.vue";
import { useToggle, useVModel } from "@vueuse/core";
import Feature from "ol/Feature";
import ScenarioLayersPanel from "./ScenarioLayersPanel.vue";
import { AnyVectorLayer } from "@/geo/types";
import { useScenarioLayersStore } from "@/stores/scenarioLayersStore";
import NProgress from "nprogress";
import { activeScenarioKey } from "@/components/injects";
import {
  NScenarioFeature,
  NScenarioLayer,
  ScenarioLayerUpdate,
} from "@/types/internalModels";
import { EntityId } from "@/types/base";

const props = defineProps<{
  modelValue: boolean;
  activeLayerId: FeatureId | null;
  activeFeatureId: FeatureId | null;
}>();
const emit = defineEmits(["update:modelValue"]);

const {
  geo,
  store: { onUndo, onRedo },
} = injectStrict(activeScenarioKey);

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
  updateFeatureGeometryFromOlFeature,
  getFeatureLayer,
  updateFeature,
  panToFeature,
  getOlFeatureById,
  addFeature,
} = useScenarioLayers(mapRef);

const { selectedIds, selectedFeatures, select } = useScenarioFeatureSelect(mapRef, {
  enable: isSelectActive,
});

onUndo(({ meta, patch }) => {
  console.log("Undo", meta, patch);
  if (!meta) return;
  const { label, value } = meta;
  if (label === "deleteLayer") {
    const layer = geo.getLayerById(value);
    addLayer(layer, true);
  } else if (label === "deleteFeature") {
    const { feature } = geo.getFeatureById(value);
    addFeature(feature, true);
  } else if (label === "addFeature") {
    deleteFeature(value, true);
  } else if (label === "updateFeatureGeometry") {
    deleteFeature(value, true);
    const { feature } = geo.getFeatureById(value);
    addFeature(feature, true);
  } else if (label === "updateLayer") {
    const layer = geo.getLayerById(value);
    updateLayer(value, layer, true);
  } else if (label === "moveLayer") {
    moveLayer(value, "down", true);
  }
});

onRedo(({ meta, patch }) => {
  console.log("Redo", meta, patch);
  if (!meta) return;
  const { label, value } = meta;
  if (label === "deleteLayer") {
    deleteLayer(value as FeatureId, true);
  } else if (label === "deleteFeature") {
    deleteFeature(value, true);
  } else if (label === "addFeature") {
    const { feature } = geo.getFeatureById(value);
    addFeature(feature, true);
  } else if (label === "updateFeatureGeometry") {
    deleteFeature(value, true);
    const { feature } = geo.getFeatureById(value);
    addFeature(feature, true);
  } else if (label === "updateLayer") {
    const layer = geo.getLayerById(value);
    updateLayer(value, layer, true);
  } else if (label === "moveLayer") {
    moveLayer(value, "down", true);
  }
});

useScenarioLayerSync(scenarioLayersGroup.getLayers() as any);
const activeLayer = ref<FeatureId | null>(null);
const olCurrentLayer = shallowRef<VectorLayer<any> | null>(null);
const activeFeature = ref<ScenarioFeature | null>(null);

function addNewLayer() {
  const addedLayer = addLayer({
    id: nanoid(),
    name: `New layer ${layers.value.length + 1}`,
    features: [],
    _isNew: false,
  });
  addedLayer._isNew = true;
  setActiveLayer(addedLayer);
}

function setActiveLayer(layer: NScenarioLayer | ScenarioLayer, toggle = true) {
  const layerId = layer.id;
  const l = getOlLayerById(layerId);
  if (!l) return;

  if (toggle && activeLayer.value === layerId) {
    olCurrentLayer.value = null;
    activeLayer.value = null;
  } else {
    olCurrentLayer.value = l;
    activeLayer.value = layerId;
  }
}

function onFeatureAction(
  feature: NScenarioFeature,
  action: ScenarioFeatureActions,
  scenarioLayer?: NScenarioLayer
) {
  if (action === ScenarioFeatureActions.Zoom) zoomToFeature(feature.id);
  if (action === ScenarioFeatureActions.Pan) panToFeature(feature.id);
  const layer = scenarioLayer || getFeatureLayer(feature);
  if (!layer) return;

  if (action === ScenarioFeatureActions.Delete) {
    if (feature === activeFeature.value) activeFeature.value = null;
    showLayerPanel.value = false;
    deleteFeature(feature.id);
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
  if (action === ScenarioLayerActions.Zoom) zoomToLayer(layer.id);
  if (action === ScenarioLayerActions.Delete) {
    if (activeLayer.value === layer.id) {
      activeLayer.value = null;
      olCurrentLayer.value = null;
    }
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

function onLayerUpdate(layer: ScenarioLayer, data: ScenarioLayerUpdate) {
  updateLayer(layer.id, data);
}

function onFeatureClick(
  feature: NScenarioFeature,
  layer: NScenarioLayer,
  shiftClick: boolean
) {
  activeFeature.value = activeFeature.value === feature ? null : feature;
  showLayerPanel.value = activeFeature.value === feature;
  const f = getOlFeatureById(feature.id);
  f && !shiftClick && selectedFeatures.clear();
  f && selectedFeatures.push(f);
}

function onFeatureModify(olFeatures: Feature[]) {
  olFeatures.forEach((f) => updateFeatureGeometryFromOlFeature(f));
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
    const { feature, layer } = geo.getFeatureById(id) || {};

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
    const layer = geo.getLayerById(id);
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
        :is-active="activeLayer === layer.id"
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
      :key="activeLayer"
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
