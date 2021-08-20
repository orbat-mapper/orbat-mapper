<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <SimpleModal v-model="open" dialog-title="Select symbol">
    <header class="mt-4 w-16 h-20">
      <MilSymbol :sidc="csidc" :size="34" />
    </header>
    <form class="space-y-4" @submit.prevent="onSubmit" v-if="isLoaded">
      <!--      <input type="text" :value="sidc" />-->
      <SymbolCodeSelect
        v-model="symbolSetValue"
        label="Symbol set"
        :items="symbolSets"
      />
      <SymbolCodeSelect
        v-model="statusValue"
        label="Status"
        :items="statusItems"
      />
      <SymbolCodeSelect
        v-model="hqtfdValue"
        label="Headquaters / Task force / Dummy"
        :items="hqtfdItems"
      />
      <SymbolCodeSelect
        v-model="emtValue"
        label="Echelon / Mobility / Towed array"
        :items="emtItems"
      />
      <SymbolCodeMultilineSelect
        v-model="iconValue"
        label="Main icon"
        :items="icons"
      />
      <SymbolCodeSelect
        v-model="mod1Value"
        label="Modifier 1"
        :items="mod1Items"
      />
      <SymbolCodeSelect
        v-model="mod2Value"
        label="Modifier 2"
        :items="mod2Items"
      />

      <div style="min-height: 14rem" class="py-4">
        <PrimaryButton type="submit">Update</PrimaryButton>
        {{ csidc }}
      </div>
    </form>
  </SimpleModal>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import MilSymbol from "./MilSymbol.vue";
import PrimaryButton from "./PrimaryButton.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import { useVModel } from "@vueuse/core";
import SimpleModal from "./SimpleModal.vue";
import SymbolCodeMultilineSelect from "./SymbolCodeMultilineSelect.vue";
import { useSymbolItems } from "../composables/symbolData";

export default defineComponent({
  name: "SymbolPickerModal",
  components: {
    SymbolCodeMultilineSelect,
    SimpleModal,
    SymbolCodeSelect,
    PrimaryButton,
    MilSymbol,
  },
  props: {
    isVisible: { type: Boolean, default: false },
    sidc: { type: String },
  },
  emits: ["update:isVisible", "update:sidc"],
  setup(props, { emit }) {
    const open = useVModel(props, "isVisible");
    console.log("mounted");

    const { csidc, ...symbolItems } = useSymbolItems(
      computed(() => props.sidc || "")
    );

    const onSubmit = () => {
      emit("update:sidc", csidc.value);
      open.value = false;
    };

    return {
      open,
      csidc,
      ...symbolItems,
      onSubmit,
    };
  },
});
</script>
