<script setup lang="ts">
import MaplibreMap from "@/modules/globeview/MaplibreMap.vue";
import { useScenario } from "@/scenariostore";
import type { Map as MlMap } from "maplibre-gl";
import { defineAsyncComponent, onMounted, ref, shallowRef, watch } from "vue";
import MlMapLogic from "@/modules/globeview/MlMapLogic.vue";
import { useIndexedDb } from "@/scenariostore/localdb.ts";
import { Button } from "@/components/ui/button";
import { GLOBE_ROUTE } from "@/router/names.ts";
const LoadScenarioDialog = defineAsyncComponent(
  () => import("../scenarioeditor/LoadScenarioDialog.vue"),
);

const props = defineProps<{ scenarioId: string }>();

const { scenario, isReady } = useScenario();
const showLoadScenarioDialog = ref(false);
const localReady = ref(false);
const mlMap = shallowRef<MlMap>();

function onMapReady(mapInstance: MlMap) {
  mlMap.value = mapInstance;
}

watch(
  () => props.scenarioId,
  async (newScenarioId) => {
    localReady.value = false;
    console.log("Loading scenario:", newScenarioId);
    showLoadScenarioDialog.value = false;
    if (isDemoScenario(newScenarioId)) {
      const demoId = newScenarioId.replace("demo-", "");
      await scenario.value.io.loadDemoScenario(demoId);
      localReady.value = true;
    } else {
      const { loadScenario } = await useIndexedDb();
      const idbscenario = await loadScenario(newScenarioId);
      if (idbscenario) {
        scenario.value.io.loadFromObject(idbscenario);
      } else {
        console.error("Scenario not found in indexeddb");
      }
      localReady.value = true;
    }
  },
  { immediate: true },
);

function isDemoScenario(scenarioId: string) {
  return scenarioId.startsWith("demo-");
}

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
    <header class="bg-background flex shrink-0 items-center gap-2">
      <h1 class="p-2 text-base font-bold">Globe View</h1>
      <Button @click="showLoadScenarioDialog = true" variant="outline"
        >Load scenario</Button
      >
    </header>
    <div class="relative flex-auto">
      <MaplibreMap @ready="onMapReady" class="bg-radial from-gray-800 to-gray-950" />
      <MlMapLogic
        v-if="isReady && mlMap && localReady"
        :mlMap
        :activeScenario="scenario"
        :key="scenarioId"
      />
    </div>
    <LoadScenarioDialog
      v-if="showLoadScenarioDialog"
      v-model="showLoadScenarioDialog"
      :routeName="GLOBE_ROUTE"
    />
  </div>
</template>
