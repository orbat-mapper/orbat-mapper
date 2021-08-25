<template>
  <InlineFormPanel @close="$emit('close')" title="Edit side info">
    <form @submit.prevent="onFormSubmit" class="space-y-4">
      <InputGroup label="Side name" v-model="form.name" :id="focusId" />
      <SymbolCodeSelect
        label="Standard identity"
        v-model="form.standardIdentity"
        :items="sidItems"
      />

      <div class="flex justify-end space-x-2">
        <PlainButton @click="$emit('close')">Cancel</PlainButton>
        <PrimaryButton type="submit">Update</PrimaryButton>
      </div>
    </form>
  </InlineFormPanel>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import InputGroup from "./InputGroup.vue";
import PlainButton from "./PlainButton.vue";
import PrimaryButton from "./PrimaryButton.vue";
import { Side } from "../types/models";
import { useScenarioStore } from "../stores/scenarioStore";
import InlineFormPanel from "./InlineFormPanel.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import { standardIdentityValues } from "../symbology/values";
import { SymbolItem } from "../types/constants";
import { useFocusOnMount } from "./helpers";

export default defineComponent({
  name: "EditSideForm",
  components: {
    SymbolCodeSelect,
    InlineFormPanel,
    PrimaryButton,
    PlainButton,
    InputGroup,
  },
  props: { sideId: { type: String } },
  emits: ["close"],
  setup(props, { emit }) {
    let form = ref<Partial<Side>>({ name: "New side", standardIdentity: "3" });
    const { getSideById, updateSide } = useScenarioStore();
    const side = computed(() =>
      props.sideId ? getSideById(props.sideId) : undefined
    );
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
      updateSide({ id: props.sideId, ...form.value });
      emit("close");
    };
    const sidItems = standardIdentityValues.map(
      ({ code, text }): SymbolItem => {
        return {
          code,
          text,
          sidc: "100" + code + 10 + "00" + "00" + "0000000000",
        };
      }
    );

    const { focusId } = useFocusOnMount();

    return { form, onFormSubmit, sidItems, focusId };
  },
});
</script>
