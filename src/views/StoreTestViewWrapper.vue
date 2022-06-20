<script setup lang="ts">
import StoreTestView from "./StoreTestView.vue";
import { useScenario } from "@/scenariostore";

const { scenario, isLoading, isReady } = useScenario();
scenario.value.io.loadDemoScenario("falkland82");
</script>
<template>
  <StoreTestView
    v-if="isReady"
    :key="scenario.store.state.id"
    :active-scenario="scenario"
  />
  <p v-if="isLoading" class="fixed right-1 top-1 border p-2">is loading</p>
</template>
