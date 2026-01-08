<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-vue-next";
import { geometryCollection } from "@turf/helpers";
import { computed, onUnmounted, ref, watch } from "vue";
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
} from "@/geo/transformations.ts";
import TransformForm from "@/modules/scenarioeditor/TransformForm.vue";
import { Button } from "@/components/ui/button";
import ScenarioFeatureSelect from "@/components/ScenarioFeatureSelect.vue";
import { Label } from "@/components/ui/label";
import { useTimeFormatStore } from "@/stores/timeFormatStore.ts";
import { geometry } from "@turf/turf";

const props = withDefaults(defineProps<{ unitMode?: boolean }>(), { unitMode: false });

const isUnitMode = props.unitMode;

const scn = injectStrict(activeScenarioKey);
const activeLayerId = injectStrict(activeLayerKey);

const olMapRef = injectStrict(activeMapKey);
const fmt = useTimeFormatStore();

const formattedTime = computed(() =>
  fmt.scenarioFormatter.format(+scn.time.scenarioTime.value),
);

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

const { showPreview, transformations, updateActiveFeature, updateAtTime } = storeToRefs(
  useTransformSettingsStore(),
);

const toggleRedraw = ref(true);
const addActiveLayer = ref(activeLayerId.value!);

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

function onSubmit(updateMode = false) {
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
  if (!transformedFeature) return;
  if (transformedFeature.type === "FeatureCollection") {
    transformedFeature = geometryCollection(
      transformedFeature.features.map((f) => f.geometry) as any,
    );
  }
  const scenarioFeature = createScenarioFeatureFromGeoJSON(transformedFeature, -1);

  if (updateMode && updateActiveFeature.value) {
    if (updateAtTime.value) {
      scn.geo.addFeatureStateGeometry(
        updateActiveFeature.value,
        scenarioFeature.geometry,
      );
    } else {
      scn.geo.updateFeature(updateActiveFeature.value, {
        geometry: scenarioFeature.geometry,
      });
    }
  } else {
    const layerId = addActiveLayer.value;

    const activeFeatureName = isUnitMode
      ? (activeFeature as NUnit).name
      : (activeFeature as NScenarioFeature).meta.name;
    const featureName = isMultiMode.value ? "FeatureCollection" : activeFeatureName;
    scenarioFeature.meta.name = `${featureName} (${filteredTrans[0].transform})`;
    scn.geo.addFeature(scenarioFeature, layerId!);
  }
  previewLayer.getSource()?.clear();
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
    <div class="mt-4 flex w-full items-center justify-between">
      <Button type="button" variant="outline" size="sm" @click="addTransformation()"
        ><PlusIcon />Add</Button
      >
      <div>
        <InputCheckbox v-model="showPreview" label="Show preview" class="" />
      </div>
    </div>
    <Tabs defaultValue="add" class="border-border mt-4 border-t pt-4">
      <TabsList class="w-full">
        <TabsTrigger value="add">New feature</TabsTrigger>
        <TabsTrigger value="update">Update existing</TabsTrigger>
      </TabsList>
      <TabsContent value="add">
        <Label class="mt-2 pb-1.5">Select layer</Label>
        <ScenarioFeatureSelect v-model="addActiveLayer" layer-mode class="" />
        <div class="mt-4 flex items-center justify-end">
          <BaseButton type="button" primary small @click="onSubmit(false)"
            >Create feature
          </BaseButton>
        </div>
      </TabsContent>
      <TabsContent value="update">
        <Label class="mt-2 pb-1.5">Select feature</Label>
        <ScenarioFeatureSelect v-model="updateActiveFeature" />
        <div class="mt-4">
          <InputCheckbox
            v-model="updateAtTime"
            :label="`Update geometry at ${formattedTime}`"
            description=""
          />
        </div>
        <div class="mt-4 flex items-center justify-end">
          <BaseButton
            type="button"
            primary
            small
            @click="onSubmit(true)"
            :disabled="!updateActiveFeature"
            >Update feature
          </BaseButton>
        </div>
      </TabsContent>
    </Tabs>
  </div>
  <div v-else class="text-muted-foreground text-center text-sm">
    Please select a feature to transform
  </div>
</template>
