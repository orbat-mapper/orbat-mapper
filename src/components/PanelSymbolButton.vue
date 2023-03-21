<template>
  <button
    type="button"
    class="rounded hover:drop-shadow hover:sepia disabled:opacity-50 disabled:hover:sepia-0"
    :class="[active ? 'invert' : '']"
  >
    <slot><MilitarySymbol :sidc="sidc" :size="size" /></slot>
  </button>
</template>
<script setup lang="ts">
import MilitarySymbol from "@/components/MilitarySymbol.vue";

const props = withDefaults(
  defineProps<{ sidc: string; active?: boolean; size?: number }>(),
  {
    active: false,
    size: 24,
  }
);
</script>
