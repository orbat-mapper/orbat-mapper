<script setup lang="ts">
import { useVModel } from "@vueuse/core";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(["update:modelValue", "update-value"]);
const value = useVModel(props, "modelValue", emit);

function onKey(e: KeyboardEvent) {
  (e.target as HTMLInputElement).blur();
}
</script>

<template>
  <input
    type="text"
    v-model="value"
    @keyup.esc="onKey"
    @keyup.enter="onKey"
    @blur="emit('update-value', value)"
    class="-mx-3 rounded-md border-0 text-base font-semibold leading-6 text-gray-900 ring-0 ring-inset hover:ring-1 focus:ring-2 focus:ring-inset"
  />
</template>
