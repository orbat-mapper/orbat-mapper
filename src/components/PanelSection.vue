<template>
  <div
    class="last-of-type:border-b-none relative flex flex-col border-b border-gray-300 pb-2"
  >
    <h3
      v-if="label"
      class="font-xs flex items-center px-2 pb-1 pt-2 font-light text-gray-900"
    >
      {{ label }}
    </h3>
    <div class="px-2"><slot /></div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ label?: string }>();
</script>
