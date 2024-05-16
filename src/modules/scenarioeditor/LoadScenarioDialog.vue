<template>
  <SimpleModal v-model="open" dialog-title="Load scenario">
    <section class="prose prose-sm mt-4">
      <p>You can load a scenario from a local file or from an external URL.</p>
    </section>

    <LoadScenarioPanel class="mt-4 h-40" @loaded="onLoaded" />
    <LoadScenarioUrlForm class="mt-4" @loaded="onLoaded" />
  </SimpleModal>
</template>

<script setup lang="ts">
import SimpleModal from "@/components/SimpleModal.vue";
import LoadScenarioPanel from "@/modules/scenarioeditor/LoadScenarioPanel.vue";
import { Scenario } from "@/types/scenarioModels";
import LoadScenarioUrlForm from "@/modules/scenarioeditor/LoadScenarioUrlForm.vue";
import { useBrowserScenarios } from "@/composables/browserScenarios";

const open = defineModel({ default: false });

const { loadScenario } = useBrowserScenarios();
function onLoaded(scenario: Scenario) {
  loadScenario(scenario);
  open.value = false;
}
</script>
