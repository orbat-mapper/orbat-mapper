<script setup lang="ts">
import MaplibreMap from "@/modules/globeview/MaplibreMap.vue";
import { useScenario } from "@/scenariostore";
import type { Map as MlMap } from "maplibre-gl";
import { onMounted, shallowRef, watch } from "vue";
import MlMapLogic from "@/modules/globeview/MlMapLogic.vue";
import { useIndexedDb } from "@/scenariostore/localdb.ts";

const { scenario, isReady } = useScenario();

const mlMap = shallowRef<MlMap>();

function onMapReady(mapInstance: MlMap) {
  mlMap.value = mapInstance;
}

onMounted(async () => {
  const { loadScenario } = await useIndexedDb();
  const idbscenario = await loadScenario("GcbfOoMplj");
  // await scenario.value.io.loadDemoScenario("falkland82");
  if (idbscenario) {
    scenario.value.io.loadFromObject(idbscenario);
  } else {
    await scenario.value.io.loadDemoScenario("falkland82");
    // console.error("Scenario not found in indexeddb");
  }
});

watch(isReady, (newVal) => {
  if (newVal) {
    console.log("Scenario is ready:", scenario.value);
  } else {
    console.log("Scenario is not ready yet");
  }
});
</script>
<template>
  <div class="flex h-full w-full flex-col">
    <header class="bg-background shrink-0">
      <h1 class="p-2 text-base font-bold">Globe View</h1>
    </header>
    <div class="relative flex-auto">
      <MaplibreMap @ready="onMapReady" class="bg-radial from-gray-800 to-gray-950" />
      <MlMapLogic v-if="isReady && mlMap" :mlMap :activeScenario="scenario" />
    </div>
  </div>
</template>
