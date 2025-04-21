<script setup lang="ts">
import { geometryCollection, type Units } from "@turf/helpers";
import { computed, onUnmounted, ref, watch } from "vue";
import type { NewSelectItem } from "@/components/types";
import BaseButton from "@/components/BaseButton.vue";
import { injectStrict, nanoid } from "@/utils";
import { activeLayerKey, activeMapKey, activeScenarioKey } from "@/components/injects";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { NScenarioFeature, NUnit } from "@/types/internalModels";
import type { Feature } from "geojson";
import { useDebounceFn } from "@vueuse/core";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { drawGeoJsonLayer } from "@/composables/openlayersHelpers";
import { useTransformSettingsStore } from "@/stores/transformStore";
import { storeToRefs } from "pinia";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { useSelectedItems } from "@/stores/selectedStore";
import {
  doScenarioFeatureTransformation,
  doUnitTransformation,
  type TransformationOperation,
  type TransformationType,
} from "@/geo/transformations.ts";
import TransformForm from "@/modules/scenarioeditor/TransformForm.vue";

const props = withDefaults(defineProps<{ unitMode?: boolean }>(), { unitMode: false });

const isUnitMode = props.unitMode;

const scn = injectStrict(activeScenarioKey);
const activeLayerId = injectStrict(activeLayerKey);

const olMapRef = injectStrict(activeMapKey);

const { selectedFeatureIds, selectedUnitIds } = useSelectedItems();

const selectedItems = computed(() => {
  if (props.unitMode) {
    return Array.from(selectedUnitIds.value).map((id) => scn.helpers.getUnitById(id));
  } else {
    return Array.from(selectedFeatureIds.value).map(
      (id) => scn.geo.getFeatureById(id)?.feature,
    );
  }
});
const isMultiMode = computed(() => selectedFeatureIds.value.size > 1);

const { showPreview } = storeToRefs(useTransformSettingsStore());

const currentOp = ref<TransformationOperation | null>(null);
const toggleRedraw = ref(true);

const previewLayer = new VectorLayer({
  source: new VectorSource({}),
  style: {
    "stroke-color": "red",
    "stroke-width": 3,
    "stroke-line-dash": [10, 10],
    "fill-color": "rgba(188,35,65,0.2)",
    "circle-radius": 5,
    "circle-fill-color": "red",
    "circle-stroke-color": "red",
  },
});

olMapRef.value.addLayer(previewLayer);

const calculatePreview = useDebounceFn(
  (features: NScenarioFeature[] | NUnit[], op: TransformationOperation) => {
    const geometry = isUnitMode
      ? doUnitTransformation(features as NUnit[], op)
      : doScenarioFeatureTransformation(features as NScenarioFeature[], op);

    drawGeoJsonLayer(previewLayer, geometry);
  },
  500,
);

function createScenarioFeatureFromGeoJSON(
  feature: Feature,
  layerId: FeatureId,
): NScenarioFeature {
  return {
    type: "Feature",
    id: nanoid(),
    properties: feature.properties,
    geometry: feature.geometry,
    meta: { type: feature.geometry.type, name: "New Feature" },
    style: {},
    _pid: layerId,
  };
}

if (!props.unitMode) {
  watch(
    [
      () => (selectedItems.value[0] as NScenarioFeature)?.geometry,
      () => (selectedItems.value[0] as NScenarioFeature)?._state?.geometry,
    ],
    () => {
      toggleRedraw.value = !toggleRedraw.value;
    },
    { deep: true },
  );
}

watch([currentOp, toggleRedraw, showPreview], () => {
  if (showPreview.value && currentOp.value) {
    calculatePreview(selectedItems.value, currentOp.value);
  } else {
    previewLayer.getSource()?.clear();
  }
});

function onSubmit() {
  if (!currentOp.value || selectedItems.value.length === 0) return;
  const activeFeature = selectedItems.value[0];
  let transformedFeature = isUnitMode
    ? doUnitTransformation(selectedItems.value as NUnit[], currentOp.value)
    : doScenarioFeatureTransformation(
        selectedItems.value as NScenarioFeature[],
        currentOp.value,
      );
  if (transformedFeature) {
    if (transformedFeature.type === "FeatureCollection") {
      transformedFeature = geometryCollection(
        transformedFeature.features.map((f) => f.geometry) as any,
      );
    }
    const layerId = activeLayerId.value;
    const scenarioFeature = createScenarioFeatureFromGeoJSON(transformedFeature, -1);
    const activeFeatureName = isUnitMode
      ? (activeFeature as NUnit).name
      : (activeFeature as NScenarioFeature).meta.name;
    const featureName = isMultiMode.value ? "FeatureCollection" : activeFeatureName;
    scenarioFeature.meta.name = `${featureName} (${currentOp.value.transform})`;
    scn.geo.addFeature(scenarioFeature, layerId!);
    previewLayer.getSource()?.clear();
  }
}

onUnmounted(() => {
  previewLayer.getSource()?.clear();
  olMapRef.value.removeLayer(previewLayer);
});
</script>
<template>
  <div v-if="selectedItems.length" class="pb-2">
    <TransformForm v-model="currentOp" :unitMode />

    <footer class="mt-4 flex items-center justify-between">
      <InputCheckbox v-model="showPreview" label="Show preview" />
      <BaseButton type="button" primary small @click="onSubmit"
        >Create feature</BaseButton
      >
    </footer>
  </div>
  <div v-else class="text-center text-sm text-gray-500">
    Please select a feature to transform
  </div>
</template>
