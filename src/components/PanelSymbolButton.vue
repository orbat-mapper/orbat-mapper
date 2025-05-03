<script setup lang="ts">
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import { type UnitSymbolOptions } from "@/types/scenarioModels";
import { Button } from "@/components/ui/button";

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
<template>
  <Button type="button" variant="ghost" size="icon" :class="[active ? 'invert' : '']">
    <NewMilitarySymbol
      :sidc="sidc"
      :size="size"
      class="size-9"
      :options="{ ...symbolOptions, square: true }"
    />
    <slot />
  </Button>
</template>
