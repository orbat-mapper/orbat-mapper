<script setup lang="ts">
import { useScenario } from "@/scenariostore";
import { useRoute } from "vue-router";
import { watch } from "vue";
import StoryModeView from "@/modules/storymode/StoryModeView.vue";

const { scenario, isLoading, isReady } = useScenario();
const route = useRoute();

if (route.query.load) {
  scenario.value.io.loadDemoScenario(route.query.load as string);
} else {
  if (!isReady.value) scenario.value.io.loadDemoScenario("falkland82");
}

watch(
  () => route.query.load,
  async (v) => {
    if (v) await scenario.value.io.loadDemoScenario(v as string);
  }
);
</script>
<template>
  <StoryModeView
    v-if="isReady"
    :key="scenario.store.state.id"
    :active-scenario="scenario"
  />
</template>
