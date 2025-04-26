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
  createDefaultTransformationOperation,
  doScenarioFeatureTransformation,
  doUnitTransformations,
  type TransformationOperation,
  type TransformationType,
} from "@/geo/transformations.ts";
import TransformForm from "@/modules/scenarioeditor/TransformForm.vue";
import { Button } from "@/components/ui/button";

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

const transformations = ref<TransformationOperation[]>([
  createDefaultTransformationOperation(),
]);
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
  (features: NScenarioFeature[] | NUnit[], ops: TransformationOperation[]) => {
    const geometry = isUnitMode
      ? doUnitTransformations(features as NUnit[], ops)
      : doScenarioFeatureTransformation(features as NScenarioFeature[], ops);

    drawGeoJsonLayer(previewLayer, geometry);
  },
  200,
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

watch(
  [
    transformations,
    toggleRedraw,
    showPreview,
    () => scn.store.state.unitStateCounter,
    () => scn.store.state.currentTime,
  ],
  () => {
    if (showPreview.value && transformations.value) {
      calculatePreview(
        selectedItems.value,
        transformations.value.filter((v) => !!v),
      );
    } else {
      previewLayer.getSource()?.clear();
    }
  },
  { deep: true },
);

function onSubmit() {
  if (selectedItems.value.length === 0) return;
  const activeFeature = selectedItems.value[0];
  const filteredTrans = transformations.value.filter((v) => !!v);
  if (filteredTrans.length === 0) return;
  let transformedFeature = isUnitMode
    ? doUnitTransformations(selectedItems.value as NUnit[], filteredTrans)
    : doScenarioFeatureTransformation(
        selectedItems.value as NScenarioFeature[],
        filteredTrans,
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
    scenarioFeature.meta.name = `${featureName} (${filteredTrans[0].transform})`;
    scn.geo.addFeature(scenarioFeature, layerId!);
    previewLayer.getSource()?.clear();
  }
}

onUnmounted(() => {
  previewLayer.getSource()?.clear();
  olMapRef.value.removeLayer(previewLayer);
});

function addTransformation() {
  transformations.value.push(createDefaultTransformationOperation());
}

function deleteTransformation(index: number) {
  transformations.value.splice(index, 1);
}
</script>
<template>
  <div v-if="selectedItems.length" class="pb-2">
    <div class="grid grid-cols-1 gap-1">
      <TransformForm
        v-for="(op, i) in transformations"
        :key="op.id"
        v-model="transformations[i]"
        :unitMode
        @delete="deleteTransformation(i)"
      />
    </div>

    <Button
      type="button"
      variant="outline"
      size="sm"
      class="mt-4"
      @click="addTransformation()"
      >Add</Button
    >

    <footer class="border-border mt-4 flex items-center justify-between border-t pt-4">
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
