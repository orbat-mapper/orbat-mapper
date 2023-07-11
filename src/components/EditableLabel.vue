<script setup lang="ts">
import { useTextareaAutosize, useVModel } from "@vueuse/core";
import { ref } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(["update:modelValue", "update-value"]);

const value = useVModel(props, "modelValue", emit);
const { textarea, input } = useTextareaAutosize({ input: value });

const spellcheck = ref(false);

function onKey(e: KeyboardEvent) {
  (e.target as HTMLInputElement).blur();
}

function onFocus() {
  spellcheck.value = true;
}

function onBlur() {
  emit("update-value", value.value);
  spellcheck.value = false;
}
</script>

<template>
  <textarea
    ref="textarea"
    type="text"
    v-model="input"
    @keyup.esc="onKey"
    @keydown.enter.prevent="onKey"
    @focus="onFocus()"
    @blur="onBlur()"
    :spellcheck="spellcheck"
    class="-mx-3 w-full resize-none rounded-md border-0 text-base font-semibold leading-6 text-gray-900 ring-0 ring-inset hover:ring-1 focus:ring-2 focus:ring-inset"
  />
</template>
