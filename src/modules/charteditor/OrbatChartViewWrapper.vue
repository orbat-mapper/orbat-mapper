<script setup lang="ts">
import { useScenario } from "@/scenariostore";
import { useRoute } from "vue-router";
import OrbatChartView from "@/modules/charteditor/OrbatChartView.vue";

const { scenario, isReady } = useScenario();
const route = useRoute();

scenario.value.io.loadDemoScenario("falkland82");
</script>
<template>
  <OrbatChartView
    v-if="isReady"
    :key="scenario.store.state.id"
    :active-scenario="scenario"
  />
</template>
