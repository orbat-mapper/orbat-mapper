<script setup lang="ts">
import type { SelectedScenarioFeatures } from "@/stores/dragStore";
import { injectStrict } from "@/utils";
import {
  activeFeatureSelectInteractionKey,
  activeMapKey,
  activeScenarioKey,
} from "@/components/injects";
import { computed, ref, watch } from "vue";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";
import { ScenarioFeatureProperties } from "@/types/scenarioGeoModels";
import { useDebounceFn } from "@vueuse/core";
import ScenarioFeatureMarkerSettings from "@/modules/scenarioeditor/ScenarioFeatureMarkerSettings.vue";
import ScenarioFeatureStrokeSettings from "@/modules/scenarioeditor/ScenarioFeatureStrokeSettings.vue";
import ScenarioFeatureFillSettings from "@/modules/scenarioeditor/ScenarioFeatureFillSettings.vue";
import EditableLabel from "@/components/EditableLabel.vue";

interface Props {
  selectedIds: SelectedScenarioFeatures;
}

const props = defineProps<Props>();

const {
  geo,
  store: { groupUpdate },
} = injectStrict(activeScenarioKey);
const olMapRef = injectStrict(activeMapKey);
const featureSelectInteractionRef = injectStrict(activeFeatureSelectInteractionKey);
const { updateFeature } = useScenarioLayers(olMapRef.value);

const feature = computed(() => {
  if (props.selectedIds.size === 1) {
    return geo.getFeatureById(props.selectedIds.values().next().value).feature;
  }
  return null;
});

const featureName = ref("DD");

watch(
  () => feature.value?.properties.name,
  (v) => {
    featureName.value = v ?? "";
  },
  { immediate: true }
);

const geometryType = computed(() => feature.value?.properties.type);
const hasStroke = computed(() => geometryType.value !== "Point");
const hasFill = computed(
  () => !["Point", "LineString"].includes(geometryType.value || "")
);

const isMultipleFeatures = computed(() => props.selectedIds.size > 1);

function updateValue(value: string) {
  feature.value && updateFeature(feature.value?.id, { name: value });
}

const debouncedResetMap = useDebounceFn(
  () => featureSelectInteractionRef.value.setMap(olMapRef.value),
  3000
);

function doUpdateFeature(data: Partial<ScenarioFeatureProperties>) {
  const featureOrFeatures = isMultipleFeatures.value
    ? [...props.selectedIds.values()]
    : feature.value?.id;
  featureSelectInteractionRef.value.setMap(null);
  if (Array.isArray(featureOrFeatures)) {
    groupUpdate(() => featureOrFeatures.forEach((f) => updateFeature(f, data)), {
      label: "batchLayer",
      value: "nil",
    });
  } else {
    featureOrFeatures && updateFeature(featureOrFeatures, data);
  }
  debouncedResetMap();
}
</script>
<template>
  <div>
    <header class="">
      <div v-if="feature" class="">
        <EditableLabel v-model="featureName" @update-value="updateValue" />
        <p class="whitespace-pre-wrap">{{ feature.properties.description }}</p>
      </div>
    </header>
    <ScenarioFeatureMarkerSettings
      v-if="feature && geometryType === 'Point'"
      :feature="feature"
      @update="doUpdateFeature"
    />
    <ScenarioFeatureStrokeSettings
      v-if="feature && hasStroke"
      :feature="feature"
      @update="doUpdateFeature"
    />
    <ScenarioFeatureFillSettings
      v-if="feature && hasFill"
      :feature="feature"
      @update="doUpdateFeature"
    />
  </div>
</template>
