<script setup lang="ts">
import { useScenario } from "@/scenariostore";
import { onBeforeRouteLeave } from "vue-router";
import { provide, ref, watch } from "vue";
import { useSelectedItems } from "@/stores/selectedStore";
import { useIndexedDb } from "@/scenariostore/localdb";
import ScenarioNotFoundPage from "@/modules/scenarioeditor/ScenarioNotFoundPage.vue";
import ScenarioReadOnlyView from "@/modules/scenarioeditor/ScenarioReadOnlyView.vue";
import { activeScenarioKey, readonlyKey } from "@/components/injects";

const props = defineProps<{ scenarioId: string }>();

const { scenario, isReady } = useScenario();
const localReady = ref(false);
const scenarioNotFound = ref(false);

const selectedItems = useSelectedItems();

// Provide readonly key
provide(readonlyKey, ref(true));
provide(activeScenarioKey, scenario.value);

watch(
  () => props.scenarioId,
  async (newScenarioId) => {
    if (isDemoScenario(newScenarioId)) {
      // Read-only view likely won't support demo scenarios in the same way, or maybe it should?
      // For now focusing on IndexedDB/loaded scenarios
      const demoId = newScenarioId.replace("demo-", "");
      await scenario.value.io.loadDemoScenario(demoId);
      selectedItems.clear();
      localReady.value = true;
    } else {
      const { loadScenario } = await useIndexedDb();
      const idbscenario = await loadScenario(newScenarioId);
      if (idbscenario) {
        scenario.value.io.loadFromObject(idbscenario);
        selectedItems.clear();
      } else {
        scenarioNotFound.value = true;
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
</script>
<template>
  <ScenarioReadOnlyView
    v-if="localReady && isReady"
    :key="scenario.store.state.id"
    :active-scenario="scenario"
  />
  <ScenarioNotFoundPage v-else-if="scenarioNotFound" />
</template>
