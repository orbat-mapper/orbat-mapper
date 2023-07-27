<template>
  <div class="px-2">
    <EditableLabel
      v-model="scenarioName"
      @update-value="updateScenarioInfo({ name: $event })"
    />
    <ScenarioInfoDetails />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { type ScenarioInfo } from "@/types/scenarioModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import EditableLabel from "@/components/EditableLabel.vue";
import ScenarioInfoDetails from "@/modules/scenarioeditor/ScenarioInfoDetails.vue";

const { store } = injectStrict(activeScenarioKey);
const { state } = store;

const scenarioName = ref("");

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
