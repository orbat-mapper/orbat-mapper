<script setup lang="ts">
import { ref, watch } from "vue";
import { type ScenarioInfo } from "@/types/scenarioModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import EditableLabel from "@/components/EditableLabel.vue";
import ScenarioInfoDetails from "@/modules/scenarioeditor/ScenarioInfoDetails.vue";
import TabWrapper from "@/components/TabWrapper.vue";
import { TabPanel } from "@headlessui/vue";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";

const { store } = injectStrict(activeScenarioKey);
const { state } = store;

const scenarioName = ref("");

const panelStore = useScenarioInfoPanelStore();

watch(
  () => state.info.name,
  (v) => (scenarioName.value = v),
  { immediate: true },
);

function updateScenarioInfo(data: Partial<ScenarioInfo>) {
  store.update((s) => {
    Object.assign(s.info, { ...data });
  });
}
</script>

<template>
  <div class="">
    <header class="pr-4">
      <EditableLabel
        v-model="scenarioName"
        @update-value="updateScenarioInfo({ name: $event })"
      />
    </header>
    <TabWrapper :tab-list="['Details']" v-model="panelStore.tabIndex">
      <TabPanel><ScenarioInfoDetails class="pt-4" /></TabPanel>
    </TabWrapper>
  </div>
</template>
