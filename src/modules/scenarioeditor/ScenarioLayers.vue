<script setup lang="ts">
import { onActivated, onDeactivated, ref, shallowRef } from "vue";
import BaseButton from "../../components/BaseButton.vue";
import OLMap from "ol/Map";
import { useGeoStore } from "../../stores/geoStore";
import MapEditToolbar from "../../components/MapEditToolbar.vue";
import VectorLayer from "ol/layer/Vector";
import { LayersPlus } from "mdue";

import {
  useScenarioLayers,
  useScenarioLayerSync,
} from "../../composables/scenarioLayers";
import {
  ScenarioFeature,
  ScenarioLayer,
  ScenarioLayerInstance,
} from "../../types/scenarioGeoModels";
import Feature from "ol/Feature";
import { Collection } from "ol";
import CreateEmtpyDashed from "../../components/CreateEmtpyDashed.vue";
import { nanoid } from "nanoid";
import { ScenarioFeatureActions } from "../../types/constants";
import ScenarioLayersListLayer from "./ScenarioLayersListLayer.vue";

const isActive = ref(true);
const mapRef = useGeoStore().olMap! as OLMap;

const {
  scenarioLayersGroup,
  scenarioLayers: layers,
  getOlLayerById,
  addLayer,
  zoomToFeature,
  deleteFeature,
  updateLayer,
  toggleLayerVisibility,
} = useScenarioLayers(mapRef);

useScenarioLayerSync(scenarioLayersGroup.getLayers() as any);
const activeLayer = ref<ScenarioLayerInstance | null>(null);
const olCurrentLayer = shallowRef<VectorLayer<any> | null>(null);

function addNewLayer() {
  addLayer({
    id: nanoid(),
    name: `New layer ${layers.value.length + 1}`,
    features: [],
    _isNew: true,
  });
}

function setActiveLayer(layer: ScenarioLayer) {
  const l = getOlLayerById(layer.id);
  if (!l) return;

  if (activeLayer.value?.id === layer.id) {
    olCurrentLayer.value = null;
    activeLayer.value = null;
  } else {
    olCurrentLayer.value = l;
    activeLayer.value = layer;
  }
}

function onFeatureAdded(feature: Feature) {
  console.log("Added", feature);
}

function onModify(features: Collection<Feature>) {
  console.log("DOne modify", features.item(0).getId());
}

function onFeatureAction(
  feature: ScenarioFeature,
  action: ScenarioFeatureActions,
  layer: ScenarioLayer
) {
  if (action === ScenarioFeatureActions.Zoom) zoomToFeature(feature);
  if (action === ScenarioFeatureActions.Delete) deleteFeature(feature, layer);
}

function onLayerUpdate(layer: ScenarioLayer, data: Partial<ScenarioLayer>) {
  updateLayer(layer, data);
}

onActivated(() => (isActive.value = true));
onDeactivated(() => (isActive.value = false));
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
      />

      <p class="my-5 text-right">
        <BaseButton @click="addNewLayer" secondary> Add new layer</BaseButton>
      </p>
    </div>
  </div>
  <Teleport :to="mapRef.getTargetElement()">
    <MapEditToolbar
      v-if="isActive && activeLayer && olCurrentLayer"
      :key="activeLayer.id"
      :ol-map="mapRef"
      :layer="olCurrentLayer"
      class="absolute left-3 top-[150px]"
      @modify="onModify"
      add-multiple
    />
  </Teleport>
</template>
