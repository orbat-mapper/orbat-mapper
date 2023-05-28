<script setup lang="ts">
import { useTextareaAutosize, useVModel } from "@vueuse/core";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(["update:modelValue", "update-value"]);

const value = useVModel(props, "modelValue", emit);
const { textarea, input } = useTextareaAutosize({ input: value });

function onKey(e: KeyboardEvent) {
  (e.target as HTMLInputElement).blur();
}
</script>

<template>
  <textarea
    ref="textarea"
    type="text"
    v-model="input"
    @keyup.esc="onKey"
    @keydown.enter.prevent="onKey"
    @blur="emit('update-value', value)"
    class="-mx-3 w-full resize-none rounded-md border-0 text-base font-semibold leading-6 text-gray-900 ring-0 ring-inset hover:ring-1 focus:ring-2 focus:ring-inset"
  />
</template>
