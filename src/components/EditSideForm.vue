<script setup lang="ts">
import { computed, ref, watch } from "vue";
import InputGroup from "./InputGroup.vue";
import InlineFormPanel from "./InlineFormPanel.vue";
import { useFocusOnMount } from "./helpers";
import { activeScenarioKey } from "@/components/injects";
import type { SideUpdate } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import StandardIdentitySelect from "@/components/StandardIdentitySelect.vue";
import { Button } from "@/components/ui/button";

const props = defineProps<{ sideId: string }>();
const emit = defineEmits(["close"]);
const { store, unitActions } = injectStrict(activeScenarioKey);

interface Form {
  name: string;
  standardIdentity: string;
  symbolOptions: {
    fillColor?: string;
  };
}
const form = ref<Form>({ name: "New side", standardIdentity: "3", symbolOptions: {} });

const side = computed(() => store?.state.sideMap[props.sideId]);
watch(
  () => props.sideId,
  (sideId) => {
    if (sideId && side.value) {
      const { name, standardIdentity, symbolOptions = {} } = side.value;
      form.value = { name, standardIdentity, symbolOptions: { ...symbolOptions } };
    }
  },
  { immediate: true },
);

const onFormSubmit = () => {
  unitActions.updateSide(props.sideId, { ...form.value } as SideUpdate);
  emit("close");
};

const { focusId } = useFocusOnMount();
</script>

<template>
  <InlineFormPanel @close="$emit('close')" title="Edit side info">
    <form @submit.prevent="onFormSubmit" class="space-y-4">
      <InputGroup label="Side name" v-model="form.name" :id="focusId" />
      <StandardIdentitySelect
        v-model="form.standardIdentity"
        v-model:fill-color="form.symbolOptions.fillColor"
        compact
      />
      <div class="flex justify-end space-x-2">
        <Button size="sm" type="submit">Save</Button>
        <Button variant="outline" size="sm" @click="$emit('close')">Cancel</Button>
      </div>
    </form>
  </InlineFormPanel>
</template>
