<template>
  <InlineFormPanel @close="$emit('close')" title="Edit group info">
    <form @submit.prevent="onFormSubmit" class="space-y-4">
      <InputGroup label="Group name" v-model="form.name" :id="focusId" />

      <div class="flex justify-end space-x-2">
        <PrimaryButton type="submit">Save</PrimaryButton>
        <PlainButton @click="$emit('close')">Cancel</PlainButton>
      </div>
    </form>
  </InlineFormPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import InputGroup from "./InputGroup.vue";
import PlainButton from "./PlainButton.vue";
import PrimaryButton from "./PrimaryButton.vue";
import InlineFormPanel from "./InlineFormPanel.vue";
import { useFocusOnMount } from "./helpers";
import type { EntityId } from "@/types/base";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { NSideGroup } from "@/types/internalModels";

const { store, unitActions } = injectStrict(activeScenarioKey);
const props = defineProps<{ sideGroupId: EntityId }>();
const emit = defineEmits(["close"]);

let form = ref<Partial<NSideGroup>>({ name: "Units" });
const sideGroup = computed(() =>
  props.sideGroupId ? store?.state.sideGroupMap[props.sideGroupId] : undefined
);
watch(
  () => props.sideGroupId,
  (sideGroupId) => {
    if (sideGroupId && sideGroup.value) {
      const { name } = sideGroup.value;
      form.value = { name };
    }
  },
  { immediate: true }
);

const onFormSubmit = () => {
  unitActions.updateSideGroup(props.sideGroupId, { ...form.value });
  emit("close");
};

const { focusId } = useFocusOnMount();
</script>
