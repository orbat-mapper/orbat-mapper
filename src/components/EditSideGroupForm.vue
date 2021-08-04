<template>
  <InlineFormPanel @close="$emit('close')" title="Edit group info">
    <form @submit.prevent="onFormSubmit" class="space-y-4">
      <InputGroup label="Group name" v-model="form.name" :id="focusId" />

      <div class="flex justify-end space-x-2">
        <PlainButton @click="$emit('close')">Close</PlainButton>
        <PrimaryButton type="submit">Update</PrimaryButton>
      </div>
    </form>
  </InlineFormPanel>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";
import InputGroup from "./InputGroup.vue";
import PlainButton from "./PlainButton.vue";
import PrimaryButton from "./PrimaryButton.vue";
import { Side, SideGroup } from "../types/models";
import { useScenarioStore } from "../stores/scenarioStore";
import InlineFormPanel from "./InlineFormPanel.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import { standardIdentityValues } from "../symbology/values";
import { SymbolItem } from "../types/constants";
import { useFocusOnMount } from "./helpers";

export default defineComponent({
  name: "EditSideGroupForm",
  components: {
    InlineFormPanel,
    PrimaryButton,
    PlainButton,
    InputGroup,
  },
  props: { sideGroupId: { type: String } },
  emits: ["close"],
  setup(props) {
    let form = ref<Partial<SideGroup>>({ name: "Units" });
    const { getSideGroupById, updateSideGroup } = useScenarioStore();
    const sideGroup = computed(() =>
      props.sideGroupId ? getSideGroupById(props.sideGroupId) : undefined
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
      updateSideGroup({ id: props.sideGroupId, ...form.value });
    };

    const { focusId } = useFocusOnMount();

    return { form, onFormSubmit, focusId };
  },
});
</script>
