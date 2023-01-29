<script setup lang="ts">
import { computed, ref, watch } from "vue";
import InputGroup from "./InputGroup.vue";
import InlineFormPanel from "./InlineFormPanel.vue";
import { useFocusOnMount } from "./helpers";
import BaseButton from "./BaseButton.vue";
import { activeScenarioKey } from "@/components/injects";
import type { SideUpdate } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import StandardIdentitySelect from "@/components/StandardIdentitySelect.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";

const props = defineProps<{ sideId: string }>();
const emit = defineEmits(["close"]);
const { store, unitActions } = injectStrict(activeScenarioKey);

let form = ref<Partial<SideUpdate>>({ name: "New side", standardIdentity: "3" });

const side = computed(() => store?.state.sideMap[props.sideId]);
watch(
  () => props.sideId,
  (sideId) => {
    if (sideId && side.value) {
      const { name, standardIdentity } = side.value;
      form.value = { name, standardIdentity };
    }
  },
  { immediate: true }
);

const onFormSubmit = () => {
  unitActions.updateSide(props.sideId, { ...form.value });
  emit("close");
};

const { focusId } = useFocusOnMount();
</script>

<template>
  <InlineFormPanel @close="$emit('close')" title="Edit side info">
    <form @submit.prevent="onFormSubmit" class="space-y-4">
      <InputGroup label="Side name" v-model="form.name" :id="focusId" />
      <StandardIdentitySelect v-model="form.standardIdentity" compact />
      <div class="flex justify-end space-x-2">
        <BaseButton small primary type="submit">Save</BaseButton>
        <BaseButton @click="$emit('close')">Cancel</BaseButton>
      </div>
    </form>
  </InlineFormPanel>
</template>
