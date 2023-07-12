<script setup lang="ts">
import {
  ScenarioMapLayer,
  ScenarioTileJSONLayer,
  ScenarioXYZLayer,
} from "@/types/scenarioGeoModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed, ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { getChangedValues, nanoid, sanitizeHTML } from "@/utils";
import { useFocusOnMount } from "@/components/helpers";
import { ScenarioImageLayerUpdate } from "@/types/internalModels";
import TextAreaGroup from "@/components/TextAreaGroup.vue";

interface Props {
  layer: ScenarioMapLayer;
}
const props = defineProps<Props>();
const emit = defineEmits(["update", "action", "cancel"]);

const { focusId } = useFocusOnMount();

const formData = ref({
  description: props.layer.description,
  externalUrl: props.layer.externalUrl,
});

watch(
  () => props.layer,
  (v) => {
    formData.value = { externalUrl: v.externalUrl, description: v.description };
  },
  { immediate: true },
);

const status = computed(() => props.layer._status);

function updateData() {
  const diff = getChangedValues({ ...formData.value }, props.layer);
  emit("update", diff);
}
</script>

<template>
  <form @submit.prevent="updateData" class="p-1">
    <div class="space-y-4">
      <TextAreaGroup :id="focusId" label="Description" v-model="formData.description" />
      <InputGroup
        :id="focusId"
        label="External URL"
        type="text"
        class=""
        v-model="formData.externalUrl"
      />
    </div>
    <footer class="mt-4 flex justify-end space-x-2">
      <BaseButton small primary type="submit">Update</BaseButton>
      <BaseButton small type="button" @click="emit('cancel')">Cancel</BaseButton>
    </footer>
  </form>
</template>
