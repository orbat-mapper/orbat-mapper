<script setup lang="ts">
import type { SelectedScenarioFeatures } from "@/stores/dragStore";
import { injectStrict } from "@/utils";
import { activeMapKey, activeScenarioKey } from "@/components/injects";
import { computed, ref, watch } from "vue";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";

interface Props {
  selectedIds: SelectedScenarioFeatures;
}
const props = defineProps<Props>();

const { geo } = injectStrict(activeScenarioKey);
const olMapRef = injectStrict(activeMapKey);
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
const isMultipleFeatures = computed(() => props.selectedIds.size > 1);
function onKey(e: KeyboardEvent) {
  (e.target as HTMLInputElement).blur();
}

function updateValue() {
  feature.value && updateFeature(feature.value?.id, { name: featureName.value });
}
</script>
<template>
  <section class="">
    <div v-if="feature" class="">
      <input
        type="text"
        v-model="featureName"
        @keyup.esc="onKey"
        @keyup.enter="onKey"
        @blur="updateValue()"
        class="-mx-3 rounded-md border-0 text-base font-semibold leading-6 text-gray-900 ring-0 ring-inset hover:ring-1 focus:ring-2 focus:ring-inset"
      />

      <p class="whitespace-pre-wrap">{{ feature.properties.description }}</p>
    </div>
  </section>
</template>
