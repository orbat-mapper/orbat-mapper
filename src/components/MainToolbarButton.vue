<template>
  <button
    type="button"
    class="rounded-md p-2 text-sm disabled:opacity-50"
    :class="
      active
        ? 'bg-army2 text-white'
        : 'text-slate-600 hover:bg-gray-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
    "
  >
    <slot />
  </button>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{ active?: boolean }>(), { active: false });
</script>
