<script setup lang="ts">
import ScenarioEditor from "@/modules/scenarioeditor/ScenarioEditor.vue";
import { useScenario } from "@/scenariostore";
import { onBeforeRouteLeave } from "vue-router";
import { ref, watch } from "vue";
import { useSelectedItems } from "@/stores/selectedStore";
import { useIndexedDb } from "@/scenariostore/localdb";
import { useEventListener } from "@vueuse/core";
import ScenarioNotFoundPage from "@/modules/scenarioeditor/ScenarioNotFoundPage.vue";

const props = defineProps<{ scenarioId: string }>();

const { scenario, isReady } = useScenario();
const localReady = ref(false);
const scenarioNotFound = ref(false);

let currentDemo = "";
const selectedItems = useSelectedItems();

watch(
  () => props.scenarioId,
  async (newScenarioId) => {
    if (isDemoScenario(newScenarioId)) {
      const demoId = newScenarioId.replace("demo-", "");
      if (demoId !== currentDemo) {
        await scenario.value.io.loadDemoScenario(demoId);
        selectedItems.clear();
        selectedItems.showScenarioInfo.value = true;
      }
      localReady.value = true;
    } else {
      const { loadScenario } = await useIndexedDb();
      const idbscenario = await loadScenario(newScenarioId);
      if (idbscenario) {
        scenario.value.io.loadFromObject(idbscenario);
        selectedItems.clear();
        selectedItems.showScenarioInfo.value = true;
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

onBeforeRouteLeave(async (to, from) => {
  await saveScenarioIfNecessary({ saveDemo: true });
});

useEventListener(document, "visibilitychange", async () => {
  await saveScenarioIfNecessary();
});

useEventListener(window, "beforeunload", async () => {
  await saveScenarioIfNecessary();
});

async function saveScenarioIfNecessary({ saveDemo = false } = {}) {
  if (scenario.value?.store?.canUndo?.value) {
    if (isDemoScenario(props.scenarioId)) {
      if (!saveDemo) {
        return;
      }
      if (
        !window.confirm(
          "You have made changes to a demo scenario. Do you want to save a copy?",
        )
      ) {
        return;
      }
    }

    await scenario.value.io.saveToIndexedDb();
  }
}
</script>
<template>
  <ScenarioEditor
    v-if="localReady && isReady"
    :key="scenario.store.state.id"
    :active-scenario="scenario"
  />
  <ScenarioNotFoundPage v-else-if="scenarioNotFound" />
</template>
