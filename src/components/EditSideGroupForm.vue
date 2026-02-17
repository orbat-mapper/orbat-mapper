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
import SymbolFillColorSelect from "@/components/SymbolFillColorSelect.vue";
import { type UnitSymbolOptions } from "@/types/scenarioModels";

const {
  store,
  unitActions,
  helpers: { getSideById },
} = injectStrict(activeScenarioKey);
const props = defineProps<{ sideGroupId: EntityId }>();
const emit = defineEmits(["close"]);

interface Form {
  name: string;
  symbolOptions: UnitSymbolOptions;
}
const form = ref<Form>({ name: "Units", symbolOptions: {} });
const sideGroup = computed(() =>
  props.sideGroupId ? store?.state.sideGroupMap[props.sideGroupId] : undefined,
);

const side = computed(() => getSideById(sideGroup.value?._pid!));
watch(
  () => props.sideGroupId,
  (sideGroupId) => {
    if (sideGroupId && sideGroup.value) {
      const { name, symbolOptions = {} } = sideGroup.value;
      form.value = { name, symbolOptions: { ...symbolOptions } };
    }
  },
  { immediate: true },
);

const onFormSubmit = () => {
  unitActions.updateSideGroup(props.sideGroupId, { ...form.value });
  emit("close");
};

const { focusId } = useFocusOnMount();
</script>

<template>
  <InlineFormPanel @close="$emit('close')" title="Edit group info">
    <form @submit.prevent="onFormSubmit" class="space-y-4">
      <InputGroup label="Group name" v-model="form.name" :id="focusId" />
      <SymbolFillColorSelect
        v-model="form.symbolOptions.fillColor"
        :default-fill-color="side?.symbolOptions?.fillColor"
        :sid="side?.standardIdentity"
      />

      <div class="flex justify-end space-x-2">
        <PrimaryButton type="submit">Save</PrimaryButton>
        <PlainButton @click="$emit('close')">Cancel</PlainButton>
      </div>
    </form>
  </InlineFormPanel>
</template>
