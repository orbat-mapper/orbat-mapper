<script setup lang="ts">
import MaplibreMap from "@/modules/globeview/MaplibreMap.vue";
import { useScenario } from "@/scenariostore";
import type { Map as MlMap } from "maplibre-gl";
import { defineAsyncComponent, ref, shallowRef, watch } from "vue";
import MlMapLogic from "@/modules/globeview/MlMapLogic.vue";
import { useIndexedDb } from "@/scenariostore/localdb.ts";
import { Button } from "@/components/ui/button";
import { GLOBE_ROUTE } from "@/router/names.ts";
import { ArrowLeftIcon, MoonStarIcon, SunIcon } from "lucide-vue-next";
import { UseDark } from "@vueuse/components";
import ToggleField from "@/components/ToggleField.vue";
import FpsDisplay from "@/components/FpsDisplay.vue";

const LoadScenarioDialog = defineAsyncComponent(
  () => import("../scenarioeditor/LoadScenarioDialog.vue"),
);

const props = defineProps<{ scenarioId: string }>();
const { scenario, isReady } = useScenario();
const showDebug = ref(false);
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
  <div class="bg-background flex h-full w-full flex-col">
    <header class="bg-muted flex items-center justify-between border-b px-4 py-2">
      <div class="flex items-center gap-4">
        <router-link to="/" class="text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon class="size-5" />
        </router-link>
        <h1 class="text-lg font-semibold">Globe View</h1>
        <span
          class="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
          >Experimental</span
        >
        <Button @click="showLoadScenarioDialog = true" variant="outline"
          >Load Scenario</Button
        >
      </div>
      <div class="flex items-center gap-4">
        <FpsDisplay v-if="showDebug" />
        <div id="globetoolbar"></div>
        <ToggleField v-model="showDebug">Debug</ToggleField>

        <UseDark v-slot="{ isDark, toggleDark }">
          <Button
            variant="ghost"
            size="icon"
            @click="toggleDark()"
            title="Toggle dark mode"
          >
            <SunIcon v-if="isDark" /><MoonStarIcon v-else />
          </Button>
        </UseDark>
      </div>
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
