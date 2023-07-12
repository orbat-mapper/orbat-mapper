<script setup lang="ts">
import ScenarioEditor from "@/modules/scenarioeditor/ScenarioEditor.vue";
import { useScenario } from "@/scenariostore";
import { useRoute, useRouter } from "vue-router";
import { watch } from "vue";

const { scenario, isLoading, isReady } = useScenario();
const route = useRoute();
const router = useRouter();
let demoLoaded = false;
let currentDemo = "";

if (route.query.load) {
  if (currentDemo !== route.query.load) {
    scenario.value.io.loadDemoScenario(route.query.load as string);
  }
  demoLoaded = true;
  currentDemo = route.query.load as string;
} else {
  if (!isReady.value) scenario.value.io.loadEmptyScenario();
}

watch(
  () => route.query.load,
  async (v) => {
    if (v) {
      if (currentDemo !== route.query.load) {
        await scenario.value.io.loadDemoScenario(v as string);
      }

      demoLoaded = true;
      currentDemo = route.query.load as string;
    }
  },
);

watch(scenario, (v) => {
  if (!demoLoaded && route.query.load) {
    router.replace({ query: {} });
  } else {
    demoLoaded = false;
  }
});
</script>
<template>
  <ScenarioEditor
    v-if="isReady"
    :key="scenario.store.state.id"
    :active-scenario="scenario"
  />
</template>
