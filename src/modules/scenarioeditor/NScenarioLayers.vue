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
  ScenarioFeatureProperties,
  ScenarioLayer,
} from "@/types/scenarioGeoModels";
import CreateEmtpyDashed from "../../components/CreateEmtpyDashed.vue";
import { injectStrict, nanoid } from "@/utils";
import { ScenarioFeatureActions, ScenarioLayerActions } from "@/types/constants";
import ScenarioLayersListLayer from "./ScenarioLayersListLayer.vue";
import { useDebounceFn, useToggle, useVModel } from "@vueuse/core";
import Feature from "ol/Feature";
import ScenarioLayersPanel from "./ScenarioLayersPanel.vue";
import { AnyVectorLayer } from "@/geo/types";
import NProgress from "nprogress";
import { activeScenarioKey } from "@/components/injects";
import {
  NScenarioFeature,
  NScenarioLayer,
  ScenarioLayerUpdate,
} from "@/types/internalModels";

const props = defineProps<{
  modelValue: boolean;
  activeLayerId: FeatureId | null;
  activeFeatureId: FeatureId | null;
}>();
const emit = defineEmits(["update:modelValue"]);

const {
  geo,
  store: { onUndoRedo },
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
  updateFeature,
  panToFeature,
  getOlFeatureById,
  addFeature,
  zoomToFeatures,
} = useScenarioLayers(mapRef);

const { selectedIds, selectInteraction } = useScenarioFeatureSelect(mapRef, {
  enable: isSelectActive,
});

onUndoRedo(({ meta, patch, action }) => {
  console.log(action, meta, patch);
  if (!meta) return;
  const { label, value } = meta;
  if (label === "deleteLayer") {
    if (action === "undo") {
      const layer = geo.getLayerById(value);
      addLayer(layer, true);
    } else deleteLayer(value as FeatureId, true);
  } else if (label === "deleteFeature") {
    if (action === "undo") {
      const { feature } = geo.getFeatureById(value);
      addFeature(feature, true);
    } else {
      deleteFeature(value, true);
    }
  } else if (label === "addFeature") {
    if (action === "undo") {
      deleteFeature(value, true);
    } else {
      const { feature } = geo.getFeatureById(value);
      addFeature(feature, true);
    }
  } else if (label === "updateFeatureGeometry") {
    deleteFeature(value, true);
    const { feature } = geo.getFeatureById(value);
    addFeature(feature, true);
  } else if (label === "updateLayer") {
    const layer = geo.getLayerById(value);
    updateLayer(value, layer, true);
  } else if (label === "moveLayer") {
    moveLayer(value, "down", true);
  } else if (label === "updateFeature") {
    updateFeature(value, {}, true);
  } else if (label === "moveFeature") {
    const { feature } = geo.getFeatureById(value);
    moveFeature(feature, "down", true);
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
  featureOrFeaturesId: FeatureId | FeatureId[],
  action: ScenarioFeatureActions
) {
  const isArray = Array.isArray(featureOrFeaturesId);

  if (
    isArray &&
    (action === ScenarioFeatureActions.Zoom || action === ScenarioFeatureActions.Pan)
  ) {
    zoomToFeatures(featureOrFeaturesId);
    return;
  }
  (isArray ? featureOrFeaturesId : [featureOrFeaturesId]).forEach((featureId) => {
    const { feature, layer } = geo.getFeatureById(featureId) || {};
    if (action === ScenarioFeatureActions.Zoom) zoomToFeature(featureId);
    if (action === ScenarioFeatureActions.Pan) panToFeature(featureId);

    if (!layer || !layer) return;

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
  });
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

  const alreadySelected = selectedIds.value.has(feature.id);
  if (!shiftClick) selectedIds.value.clear();
  if (alreadySelected) {
    selectedIds.value.delete(feature.id);
  } else {
    selectedIds.value.add(feature.id);
  }
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

watch(selectedIds.value, (v) => {
  if (v.size === 1) {
    activeFeature.value = [...v.values()].map((i) => geo.getFeatureById(i).feature)[0];
    showLayerPanel.value = true;
  }
});

onMounted(() => {
  NProgress.done();
  if (layers.value.length) setActiveLayer(layers.value[0]);
});

const debouncedResetMap = useDebounceFn(() => selectInteraction.setMap(mapRef), 3000);

function doUpdateFeature(
  featureOrFeatures: FeatureId | FeatureId[],
  data: Partial<ScenarioFeatureProperties>
) {
  selectInteraction.setMap(null);
  if (Array.isArray(featureOrFeatures)) {
    featureOrFeatures.forEach((f) => updateFeature(f, data));
  } else {
    updateFeature(featureOrFeatures, data);
  }
  debouncedResetMap();
}
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
      :select="selectInteraction"
    />
  </Teleport>
  <Teleport to="[data-teleport-layer]" v-if="activeFeature">
    <ScenarioLayersPanel
      :feature="activeFeature"
      :selectedIds="selectedIds"
      @close="toggleLayerPanel()"
      @feature-action="onFeatureAction"
      @feature-meta-update="doUpdateFeature"
      @feature-style-update="doUpdateFeature"
    />
  </Teleport>
</template>
