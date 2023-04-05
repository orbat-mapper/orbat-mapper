<template>
  <button
    type="button"
    :aria-pressed="enabled"
    @click="toggle()"
    :title="title"
    :aria-label="title"
    class="rounded-md p-2 text-sm disabled:opacity-50"
    :class="enabled ? 'bg-army2 text-white' : 'text-gray-700 hover:bg-gray-200'"
  >
    <slot />
  </button>
</template>
<script lang="ts" setup>
import { useToggle, useVModel } from "@vueuse/core";

const props = defineProps<{ modelValue: boolean; title?: string }>();
const emit = defineEmits(["update:modelValue"]);

const enabled = useVModel(props, "modelValue", emit);
const toggle = useToggle(enabled);
</script>
