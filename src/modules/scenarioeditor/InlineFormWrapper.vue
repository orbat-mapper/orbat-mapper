<script setup lang="ts">
import { useWidthStore } from "@/stores/uiStore";
defineProps<{ detailsPanel?: boolean }>();

const w = useWidthStore();
</script>

<template>
  <div
    class="sticky left-0 p-4"
    :style="{ maxWidth: (detailsPanel ? w.detailsWidth : w.orbatPanelWidth) + 'px' }"
  >
    <slot />
  </div>
</template>
