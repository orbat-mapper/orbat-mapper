<script setup lang="ts">
import { ref } from "vue";
import { ScenarioLayerInstance } from "@/types/scenarioGeoModels";
import { useFocusOnMount } from "@/components/helpers";
import InputGroup from "../../components/InputGroup.vue";
import InlineFormPanel from "../../components/InlineFormPanel.vue";
import BaseButton from "../../components/BaseButton.vue";
import { NScenarioLayer } from "@/types/internalModels";

const props = defineProps<{
  layer: ScenarioLayerInstance;
}>();
const emit = defineEmits(["close", "update"]);
let form = ref<Partial<NScenarioLayer>>({ name: props.layer.name, _isNew: false });

const onFormSubmit = () => {
  emit("update", { ...form.value });
  emit("close");
};

const { focusId } = useFocusOnMount();
</script>

<template>
  <InlineFormPanel @close="$emit('close')" title="Edit layer">
    <form @submit.prevent="onFormSubmit" class="space-y-4">
      <InputGroup
        label="Layer name"
        v-model="form.name"
        :id="focusId"
        @keyup.esc="emit('close')"
      />

      <div class="my-4 flex items-center justify-end space-x-2">
        <BaseButton primary small type="submit">Save</BaseButton>
        <BaseButton small @click="emit('close')">Cancel</BaseButton>
      </div>
    </form>
  </InlineFormPanel>
</template>
