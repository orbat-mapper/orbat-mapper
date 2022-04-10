<script setup lang="ts">
import { ref } from "vue";
import { ScenarioLayer, ScenarioLayerInstance } from "../../types/scenarioGeoModels";
import { useFocusOnMount } from "../../components/helpers";
import InputGroup from "../../components/InputGroup.vue";
import InlineFormPanel from "../../components/InlineFormPanel.vue";
import PlainButton from "../../components/PlainButton.vue";
import PrimaryButton from "../../components/PrimaryButton.vue";

const props = defineProps<{
  layer: ScenarioLayerInstance;
}>();
const emit = defineEmits(["close", "update"]);
let form = ref<Partial<ScenarioLayer>>({ name: props.layer.name, _isNew: false });

const onFormSubmit = () => {
  emit("update", { ...form.value });
  emit("close");
};

const { focusId } = useFocusOnMount();
</script>

<template>
  <InlineFormPanel @close="$emit('close')" title="Edit layer">
    <form @submit.prevent="onFormSubmit" clasFeaturess="space-y-4">
      <InputGroup label="Layer name" v-model="form.name" :id="focusId" />

      <div class="flex justify-end space-x-2">
        <PlainButton @click="emit('close')">Cancel</PlainButton>
        <PrimaryButton type="submit">Update</PrimaryButton>
      </div>
    </form>
  </InlineFormPanel>
</template>
