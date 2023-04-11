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
import { useVModel } from "@vueuse/core";
import LoadScenarioUrlForm from "@/modules/scenarioeditor/LoadScenarioUrlForm.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "loaded"]);
const open = useVModel(props, "modelValue", emit);

function onLoaded(scenario: Scenario) {
  emit("loaded", scenario);
  open.value = false;
}
</script>
