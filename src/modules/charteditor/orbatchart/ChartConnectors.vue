<template>
  <g class="o-connectors">
    <path
      v-for="(link, index) in links"
      :key="index"
      :d="link.d"
      class="o-line"
      :stroke="link.options?.lineColor || options.lineColor || 'currentColor'"
      :stroke-width="(link.options?.lineWidth || options.lineWidth) + 'pt'"
      fill="none"
    />
  </g>
</template>

<script setup lang="ts">
import type { OrbChartOptions, RenderedLink } from "./types";

defineProps<{
  links: RenderedLink[];
  options: Partial<OrbChartOptions>;
}>();
</script>
