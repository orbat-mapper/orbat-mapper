<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <SimpleModal v-model="open" dialog-title="Shortcuts">
    <div class="mt-4">
      <ul class="text-sm text-gray-900 w-64">
        <li class="flex justify-between">
          <p>Show search</p>
          <kbd class="font-mono">s</kbd>
        </li>
        <li class="flex justify-between">
          <p>Show help</p>
          <kbd class="font-mono">?</kbd>
        </li>
        <li class="flex justify-between">
          <p>Create unit</p>
          <kbd class="font-mono">c</kbd>
        </li>
        <li class="flex justify-between">
          <p>Edit current unit</p>
          <kbd class="font-mono">e</kbd>
        </li>
        <li class="flex justify-between">
          <p>Duplicate</p>
          <kbd class="font-mono">d</kbd>
        </li>
      </ul>
    </div>
  </SimpleModal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";

import SimpleModal from "./SimpleModal.vue";
import { useVModel } from "@vueuse/core";

export default defineComponent({
  name: "ShortcutsModal",
  components: {
    SimpleModal,
  },
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const open = useVModel(props, "modelValue");

    return {
      open,
    };
  },
});
</script>
