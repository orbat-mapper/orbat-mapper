<template>
  <div class="flex">
    <div class="flex-auto">
      <InputGroup label="SIDC" v-model="sidcValue" />
    </div>

    <div class="flex-shrink-0 self-end">
      <PlainButton @click="showSymbolPicker = true" class="flex-shrink-0 h-10"
        >edit
      </PlainButton>
    </div>
    <SymbolPickerModal
      v-model:is-visible="showSymbolPicker"
      v-model:sidc="sidcValue"
    />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, ref } from "vue";
import { useVModel } from "@vueuse/core";
import InputGroup from "./InputGroup.vue";
import PlainButton from "./PlainButton.vue";

export default defineComponent({
  name: "SymbolPickerInput",
  components: {
    PlainButton,
    InputGroup,
    SymbolPickerModal: defineAsyncComponent(
      () => import("./SymbolPickerModal.vue")
    ),
  },
  props: { modelValue: { type: String, required: true } },
  emits: ["update:modelValue"],
  setup(props) {
    const sidcValue = useVModel(props, "modelValue");
    const showSymbolPicker = ref(false);
    return { sidcValue, showSymbolPicker };
  },
});
</script>
