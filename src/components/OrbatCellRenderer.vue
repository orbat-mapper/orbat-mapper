<script setup lang="ts">
import MilitarySymbol from "@/components/MilitarySymbol.vue";

const props = defineProps<{
  value: string;
  sidc: string;
  expanded: boolean;
  level: number;
  symbolOptions: Record<string, any>;
}>();
</script>

<template>
  <span class="flex items-center gap-2" :style="{ paddingLeft: level * 1.5 + 'rem' }"
    ><MilitarySymbol :sidc="sidc" :size="20" :options="symbolOptions" /> {{ value }}</span
  >
</template>
