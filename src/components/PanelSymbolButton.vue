<template>
  <button
    type="button"
    class="rounded hover:drop-shadow-sm hover:sepia disabled:opacity-50 disabled:hover:sepia-0"
    :class="[active ? 'invert' : '']"
  >
    <MilitarySymbol
      :sidc="sidc"
      :size="size"
      :options="{ ...symbolOptions, square: true }"
    />
    <slot />
  </button>
</template>
<script setup lang="ts">
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { type UnitSymbolOptions } from "@/types/scenarioModels";

interface Props {
  sidc: string;
  active?: boolean;
  size?: number;
  symbolOptions?: UnitSymbolOptions;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  size: 24,
});
</script>
