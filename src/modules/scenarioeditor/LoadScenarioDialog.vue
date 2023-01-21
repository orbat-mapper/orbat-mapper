<template>
  <SimpleModal v-model="open" dialog-title="Load scenario">
    <LoadScenarioPanel class="mt-4 h-40" @loaded="onLoaded" />
  </SimpleModal>
</template>

<script setup lang="ts">
import SimpleModal from "@/components/SimpleModal.vue";
import LoadScenarioPanel from "@/modules/scenarioeditor/LoadScenarioPanel.vue";
import { Scenario } from "@/types/scenarioModels";
import { useVModel } from "@vueuse/core";

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
