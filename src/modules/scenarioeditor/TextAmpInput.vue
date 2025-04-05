<template>
  <input
    v-model="model"
    type="text"
    :disabled="disabled"
    :class="
      disabled
        ? 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6'
        : 'block w-full rounded-md border-0 bg-transparent py-1.5 text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-white/5'
    "
  />
</template>
<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean;
}>();

const model = defineModel();
</script>
