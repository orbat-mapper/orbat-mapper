<script setup lang="ts">
import ScenarioEditor from "@/modules/scenarioeditor/NScenarioEditor.vue";
import { useScenario } from "@/scenariostore";
import { useRoute } from "vue-router";
import { watch } from "vue";

const { scenario, isLoading, isReady } = useScenario();
const route = useRoute();

if (route.query.load) {
  scenario.value.io.loadDemoScenario(route.query.load as string);
} else {
  if (!isReady.value) scenario.value.io.loadEmptyScenario();
}

watch(
  () => route.query.load,
  async (v) => {
    if (v) await scenario.value.io.loadDemoScenario(v as string);
  }
);
</script>
<template>
  <ScenarioEditor
    v-if="isReady"
    :key="scenario.store.state.id"
    :active-scenario="scenario"
  />
</template>
