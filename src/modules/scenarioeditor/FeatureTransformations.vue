<script setup lang="ts">
import {
  feature as turfFeature,
  featureCollection as turfFeatureCollection,
} from "@turf/helpers";
import { buffer as turfBuffer } from "@turf/buffer";
import { simplify as turfSimplify } from "@turf/simplify";
import { bezierSpline as turfBezier } from "@turf/bezier-spline";
import { polygonSmooth as turfPolygonSmooth } from "@turf/polygon-smooth";
import { bbox } from "@turf/bbox";
import { bboxPolygon } from "@turf/bbox-polygon";
import { convex } from "@turf/convex";
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { computed, onUnmounted, ref, watch, watchEffect } from "vue";
import { SelectItem } from "@/components/types";
import BaseButton from "@/components/BaseButton.vue";
import { injectStrict, nanoid } from "@/utils";
import { activeMapKey, activeScenarioKey } from "@/components/injects";
import { FeatureId } from "@/types/scenarioGeoModels";
import type { NScenarioFeature } from "@/types/internalModels";
import type { Feature, FeatureCollection, LineString, Polygon } from "geojson";
import { useDebounceFn } from "@vueuse/core";
import { geometryCollection, Units } from "@turf/helpers";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { drawGeoJsonLayer } from "@/composables/openlayersHelpers";
import {
  TransformationOperation,
  useTransformSettingsStore,
} from "@/stores/transformStore";
import { storeToRefs } from "pinia";
import InputCheckbox from "@/components/InputCheckbox.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { useSelectedItems } from "@/stores/selectedStore";

const props = defineProps<{}>();

const scn = injectStrict(activeScenarioKey);

const olMapRef = injectStrict(activeMapKey);

const { selectedFeatureIds } = useSelectedItems();
const selectedFeatures = computed(() => {
  return Array.from(selectedFeatureIds.value).map(
    (id) => scn.geo.getFeatureById(id)?.feature,
  );
});
const isMultiMode = computed(() => selectedFeatureIds.value.size > 1);

const transformationOptions: SelectItem[] = [
  { label: "Buffer", value: "buffer" },
  { label: "Bounding box", value: "boundingBox" },
  { label: "Convex hull", value: "convexHull" },
  { label: "Simplify", value: "simplify" },
  { label: "Smooth", value: "smooth" },
];

const unitItems: SelectItem<Units>[] = [
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
  },
});

olMapRef.value.addLayer(previewLayer);

const calculatePreview = useDebounceFn(
  (features: NScenarioFeature[], op: TransformationOperation) => {
    const geometry = doTransformation(features, op);
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

function doTransformation(
  features: NScenarioFeature[],
  { transform, options }: TransformationOperation,
): Feature | FeatureCollection | null | undefined {
  if (features.length === 0 || !features[0]) return;
  const geoJSONFeatureOrFeatureCollection = isMultiMode.value
    ? turfFeatureCollection(
        selectedFeatures.value.map((f) => turfFeature(f?._state?.geometry ?? f.geometry)),
      )
    : turfFeature(features[0]?._state?.geometry ?? features[0].geometry);
  if (transform === "buffer") {
    const { radius, steps = 64, units = "kilometers" } = options;
    return turfBuffer(geoJSONFeatureOrFeatureCollection as any, radius, { units, steps });
  }
  if (transform === "boundingBox") {
    return bboxPolygon(bbox(geoJSONFeatureOrFeatureCollection));
  }

  if (transform === "convexHull") {
    return convex(geoJSONFeatureOrFeatureCollection);
  }

  if (transform === "simplify") {
    const { tolerance = 0.5 } = options;
    return turfSimplify(geoJSONFeatureOrFeatureCollection, {
      tolerance,
      highQuality: true,
    });
  }

  if (transform === "smooth") {
    if (isLineString(geoJSONFeatureOrFeatureCollection)) {
      return turfBezier(geoJSONFeatureOrFeatureCollection, {});
    } else if (isPolygon(geoJSONFeatureOrFeatureCollection)) {
      return turfPolygonSmooth(geoJSONFeatureOrFeatureCollection, { iterations: 4 });
    }
  }
  return null;
}

function isLineString(
  feature: Feature | FeatureCollection,
): feature is Feature<LineString> {
  return feature.type === "Feature" && feature.geometry.type === "LineString";
}

function isPolygon(feature: Feature | FeatureCollection): feature is Feature<Polygon> {
  return feature.type === "Feature" && feature.geometry.type === "Polygon";
}

watch(
  [
    () => selectedFeatures.value[0]?.geometry,
    () => selectedFeatures.value[0]?._state?.geometry,
  ],
  () => {
    toggleRedraw.value = !toggleRedraw.value;
  },
  { deep: true },
);

watchEffect(() => {
  toggleRedraw.value;
  if (!selectedFeatures.value.length) return;
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
  } else {
    currentOp.value = null;
  }

  if (showPreview.value && currentOp.value) {
    calculatePreview(selectedFeatures.value, currentOp.value);
  } else {
    previewLayer.getSource()?.clear();
  }
});

function onSubmit() {
  if (!currentOp.value || selectedFeatures.value.length === 0) return;
  const activeFeature = selectedFeatures.value[0];
  let transformedFeature = doTransformation(selectedFeatures.value, currentOp.value);
  if (transformedFeature) {
    if (transformedFeature.type === "FeatureCollection") {
      transformedFeature = geometryCollection(
        transformedFeature.features.map((f) => f.geometry) as any,
      );
    }
    const layerId = activeFeature._pid;
    const scenarioFeature = createScenarioFeatureFromGeoJSON(
      transformedFeature,
      selectedFeatures.value[0]._pid,
    );
    const featureName = isMultiMode.value ? "FeatureCollection" : activeFeature.meta.name;
    scenarioFeature.meta.name = `${featureName} (${currentOp.value.transform})`;
    scn.geo.addFeature(scenarioFeature, layerId);
    previewLayer.getSource()?.clear();
  }
}

onUnmounted(() => {
  previewLayer.getSource()?.clear();
  olMapRef.value.removeLayer(previewLayer);
});
</script>
<template>
  <div v-if="selectedFeatureIds.size" class="pb-2">
    <form @submit.prevent="onSubmit" class="space-y-4">
      <SimpleSelect
        label="Transformation"
        :items="transformationOptions"
        v-model="transformation"
      />

      <div v-if="transformation === 'buffer'">
        <PanelSubHeading>Buffer options</PanelSubHeading>
        <div class="mt-2 grid grid-cols-1 gap-4">
          <div class="col-span-1">
            <NumberInputGroup label="Radius" v-model.number="bufferOptions.radius" />
          </div>
          <SimpleSelect label="Units" :items="unitItems" v-model="bufferOptions.units" />
          <NumberInputGroup
            label="Steps"
            v-model.number="bufferOptions.steps"
            type="number"
          />
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
        <BaseButton type="submit" primary small>Apply</BaseButton>
      </footer>
    </form>
  </div>
  <div v-else class="text-center text-sm text-gray-500">
    Please select a feature to transform
  </div>
</template>
