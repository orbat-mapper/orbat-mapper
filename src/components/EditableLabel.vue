<script setup lang="ts">
import { useTextareaAutosize, useVModel } from "@vueuse/core";
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    textClass?: string;
  }>(),
  { textClass: "text-base font-semibold leading-6 text-gray-900 dark:text-gray-100" },
);

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

function onBlur(e: FocusEvent) {
  const target = e.target as HTMLInputElement;
  emit("update-value", target?.value ?? value.value);
  spellcheck.value = false;
}
</script>

<template>
  <textarea
    ref="textarea"
    type="text"
    v-model="input"
    @keyup.esc="onKey"
    @keydown.esc.stop
    @keydown.enter.prevent="onKey"
    @focus="onFocus()"
    @blur="onBlur"
    :spellcheck="spellcheck"
    class="ring-ring -mx-3 w-full resize-none rounded-md border-0 bg-transparent ring-0 ring-inset hover:ring-1 focus:ring-2 focus:ring-inset"
    :class="textClass"
  />
</template>
