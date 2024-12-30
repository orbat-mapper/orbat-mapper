<script setup lang="ts">
import { useWidthStore } from "@/stores/uiStore";

const w = useWidthStore();
</script>

<template>
  <div class="sticky left-0 p-4" :style="{ maxWidth: w.orbatPanelWidth + 'px' }">
    <slot />
  </div>
</template>

<style scoped></style>
