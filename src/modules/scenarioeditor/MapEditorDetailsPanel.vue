<template>
  <aside
    class="pointer-events-auto relative mt-4 h-96 max-h-full w-96 overflow-auto rounded-md bg-white p-4 shadow"
  >
    <CloseButton @click="emit('close')" class="absolute right-4 top-4" />
    <slot />
  </aside>
</template>
<script setup lang="ts">
import CloseButton from "@/components/CloseButton.vue";
const emit = defineEmits(["close"]);
</script>
