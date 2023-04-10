<script setup lang="ts">
import type { SelectedScenarioFeatures } from "@/stores/dragStore";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed } from "vue";

interface Props {
  selectedIds: SelectedScenarioFeatures;
}
const props = defineProps<Props>();

const { geo } = injectStrict(activeScenarioKey);
const feature = computed(() => {
  if (props.selectedIds.size === 1) {
    return geo.getFeatureById(props.selectedIds.values().next().value).feature;
  }
  return null;
});

const geometryType = computed(() => feature.value?.properties.type);
const isMultipleFeatures = computed(() => props.selectedIds.size > 1);
</script>
<template>
  <section>
    <div v-if="feature" class="prose prose-sm">
      <h3>{{ feature.properties.name }}</h3>
      <p class="whitespace-pre-wrap">{{ feature.properties.description }}</p>
    </div>
  </section>
</template>
