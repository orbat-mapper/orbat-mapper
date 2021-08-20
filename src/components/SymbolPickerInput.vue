<template>
  <div class="flex">
    <div class="flex-auto">
      <InputGroup label="SIDC" v-model="sidcValue" />
    </div>

    <div class="flex-shrink-0 self-end">
      <PlainButton @click="openModal" class="flex-shrink-0 h-10"
        >edit
      </PlainButton>
    </div>
    <SymbolPickerModal
      v-if="showSymbolPicker"
      v-model:is-visible="showSymbolPickerDelayed"
      v-model:sidc="sidcValue"
    />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, ref } from "vue";
import { useVModel } from "@vueuse/core";
import InputGroup from "./InputGroup.vue";
import PlainButton from "./PlainButton.vue";
import { biSyncDelayedRef } from "../composables/utils";
import NProgress from "nprogress";

export default defineComponent({
  name: "SymbolPickerInput",
  components: {
    PlainButton,
    InputGroup,
    SymbolPickerModal: defineAsyncComponent(
      () => import("./SymbolPickerModal.vue")
    ),
  },
  props: { modelValue: { type: String } },
  emits: ["update:modelValue"],
  setup(props) {
    const sidcValue = useVModel(props, "modelValue");
    const showSymbolPicker = ref(false);
    const showSymbolPickerDelayed = ref(false);

    biSyncDelayedRef(showSymbolPicker, showSymbolPickerDelayed);

    const openModal = async () => {
      NProgress.start();
      showSymbolPicker.value = true;
    };
    return { sidcValue, showSymbolPicker, openModal, showSymbolPickerDelayed };
  },
});
</script>
