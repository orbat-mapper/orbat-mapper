<template>
  <button
    type="button"
    class="rounded p-2 text-sm disabled:opacity-50"
    :class="active ? 'bg-army2 text-white' : 'text-gray-700 hover:bg-gray-200'"
  >
    <slot />
  </button>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{ active?: boolean }>(), { active: false });
</script>
