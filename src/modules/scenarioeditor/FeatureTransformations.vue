<script setup lang="ts">
import { feature as turfFeature } from "@turf/helpers";
import { buffer as turfBuffer } from "@turf/buffer";
import { simplify as turfSimplify } from "@turf/simplify";
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { onUnmounted, ref, watch, watchEffect } from "vue";
import { SelectItem } from "@/components/types";
import InputGroup from "@/components/InputGroup.vue";
import BaseButton from "@/components/BaseButton.vue";
import { injectStrict, nanoid } from "@/utils";
import { activeMapKey, activeScenarioKey } from "@/components/injects";
import { FeatureId } from "@/types/scenarioGeoModels";
import type { NScenarioFeature } from "@/types/internalModels";
import type { Feature } from "geojson";
import { useDebounceFn } from "@vueuse/core";
import { bbox, bboxPolygon, convex, Units } from "@turf/turf";
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

const props = defineProps<{ feature?: NScenarioFeature }>();

const scn = injectStrict(activeScenarioKey);

const olMapRef = injectStrict(activeMapKey);

const transformationOptions: SelectItem[] = [
  { label: "Buffer", value: "buffer" },
  { label: "Bounding box", value: "boundingBox" },
  { label: "Convex hull", value: "convexHull" },
  { label: "Simplify", value: "simplify" },
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
    "stroke-line-dash": [10, 10],
    "fill-color": "rgba(188,35,65,0.2)",
  },
});

olMapRef.value.addLayer(previewLayer);

const calculatePreview = useDebounceFn(
  (feature: NScenarioFeature, op: TransformationOperation) => {
    const geometry = doTransformation(feature, op);
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
  feature: NScenarioFeature,
  { transform, options }: TransformationOperation,
): Feature | null | undefined {
  const geoJSONFeature = turfFeature(feature.geometry);
  if (transform === "buffer") {
    const { radius, steps = 64, units = "kilometers" } = options;
    return turfBuffer(geoJSONFeature, radius, { units, steps });
  }
  if (transform === "boundingBox") {
    return bboxPolygon(bbox(geoJSONFeature));
  }

  if (transform === "convexHull") {
    return convex(geoJSONFeature);
  }

  if (transform === "simplify") {
    const { tolerance = 0.5 } = options;
    return turfSimplify(geoJSONFeature, { tolerance, highQuality: true });
  }
  return null;
}

watch(
  () => props.feature?.geometry,
  () => {
    toggleRedraw.value = !toggleRedraw.value;
  },
  { deep: true },
);

watchEffect(() => {
  toggleRedraw.value;
  if (!props.feature) return;
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
  } else {
    currentOp.value = null;
  }

  if (showPreview.value && currentOp.value) {
    calculatePreview(props.feature, currentOp.value);
  } else {
    previewLayer.getSource()?.clear();
  }
});

function onSubmit() {
  if (!currentOp.value || !props.feature) return;
  const t = doTransformation(props.feature, currentOp.value);
  if (t) {
    const scenarioFeature = createScenarioFeatureFromGeoJSON(t, props.feature._pid);
    scenarioFeature.meta.name = `${props.feature.meta.name} (${currentOp.value.transform})`;
    scn.geo.addFeature(scenarioFeature, props.feature._pid);
    previewLayer.getSource()?.clear();
  }
}

onUnmounted(() => {
  previewLayer.getSource()?.clear();
  olMapRef.value.removeLayer(previewLayer);
});
</script>
<template>
  <div v-if="feature" class="pb-2">
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
