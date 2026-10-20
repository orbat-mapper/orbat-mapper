<script setup lang="ts">
import { computed, inject } from "vue";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import { activeScenarioKey } from "@/components/injects.ts";
import { getCustomSymbolId } from "@/symbology/helpers.ts";

type Props = {
  sidc: string;
  options?: Record<string, any>;
  modifiers?: Record<string, any>;
  size?: number;
};

const props = withDefaults(defineProps<Props>(), { size: 15 });
const { store } = inject(activeScenarioKey, undefined) || {};
const customSidc = computed(() => {
  const symbolId = getCustomSymbolId(props.sidc);
  if (symbolId) {
    const mapping = props.options?.customSymbolMap ?? store?.state.customSymbolMap ?? {};
    return mapping[symbolId];
  }
  return null;
});
</script>

<template>
  <img
    v-if="customSidc"
    :src="customSidc.src"
    :alt="customSidc.name"
    draggable="false"
    class="object-contain"
  />
  <NewMilitarySymbol v-else :sidc :options :modifiers :size />
</template>
