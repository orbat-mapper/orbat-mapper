<script setup lang="ts">
import { geometryCollection, type Units } from "@turf/helpers";
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import { computed, onUnmounted, ref, watch, watchEffect } from "vue";
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
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { useSelectedItems } from "@/stores/selectedStore";
import {
  doScenarioFeatureTransformation,
  doUnitTransformation,
  type TransformationOperation,
} from "@/geo/transformations.ts";
import NewSelect from "@/components/NewSelect.vue";

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

const transformationOptions = computed(() => {
  return [
    { label: "Buffer", value: "buffer" },
    { label: "Bounding box", value: "boundingBox" },
    { label: "Convex hull", value: "convexHull" },
    { label: "Center (absolute)", value: "center" },
    { label: "Center of mass", value: "centerOfMass" },
    { label: "Simplify", value: "simplify", disabled: props.unitMode },
    { label: "Smooth", value: "smooth", disabled: props.unitMode },
  ];
});

const unitItems: NewSelectItem<Units>[] = [
  { label: "Kilometers", value: "kilometers" },
  { label: "Meters", value: "meters" },
  { label: "Miles", value: "miles" },
  { label: "Feet", value: "feet" },
  { label: "Nautical miles", value: "nauticalmiles" },
];

const { showPreview, transformation, bufferOptions, simplifyOptions } = storeToRefs(
  useTransformSettingsStore(),
);

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

watchEffect(() => {
  toggleRedraw.value;
  if (!selectedItems.value.length) return;
  if (transformation.value === "buffer") {
    const { radius, units, steps } = bufferOptions.value;
    currentOp.value = {
      transform: "buffer",
      options: { radius, units, steps },
    };
  } else if (transformation.value === "boundingBox") {
    currentOp.value = { transform: "boundingBox", options: {} };
  } else if (transformation.value === "convexHull") {
    currentOp.value = { transform: "convexHull", options: {} };
  } else if (transformation.value === "simplify") {
    const { tolerance } = simplifyOptions.value;
    currentOp.value = { transform: "simplify", options: { tolerance } };
  } else if (transformation.value === "smooth") {
    currentOp.value = { transform: "smooth", options: {} };
  } else if (transformation.value === "center") {
    currentOp.value = { transform: "center", options: {} };
  } else if (transformation.value === "centerOfMass") {
    currentOp.value = { transform: "centerOfMass", options: {} };
  } else {
    currentOp.value = null;
  }

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
    <form @submit.prevent="onSubmit" class="space-y-4">
      <NewSelect
        label="Transformation"
        :items="transformationOptions"
        v-model="transformation"
      />

      <div v-if="transformation === 'buffer'">
        <PanelSubHeading>Buffer options</PanelSubHeading>
        <div class="mt-2 grid grid-cols-2 gap-4">
          <div class="col-span-1">
            <NumberInputGroup label="Radius" v-model.number="bufferOptions.radius" />
          </div>
          <NewSelect label="Units" :items="unitItems" v-model="bufferOptions.units" />
          <NumberInputGroup label="Steps" v-model.number="bufferOptions.steps" />
        </div>
      </div>
      <div v-else-if="transformation === 'simplify'">
        <PanelSubHeading>Simplify</PanelSubHeading>
        <div class="grid grid-cols-1 gap-4">
          <InputGroupTemplate label="Tolerance"
            ><input
              type="range"
              v-model.number="simplifyOptions.tolerance"
              min="0"
              max=".15"
              step="0.00001"
              class="w-full"
          /></InputGroupTemplate>
        </div>
      </div>
      <footer class="flex items-center justify-between">
        <InputCheckbox v-model="showPreview" label="Show preview" />
        <BaseButton type="submit" primary small>Create feature</BaseButton>
      </footer>
    </form>
  </div>
  <div v-else class="text-center text-sm text-gray-500">
    Please select a feature to transform
  </div>
</template>
