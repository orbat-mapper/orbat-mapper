<script setup lang="ts">
import { computed } from "vue";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects.ts";
import { CUSTOM_SYMBOL_PREFIX, CUSTOM_SYMBOL_SLICE } from "@/config/constants.ts";

type Props = {
  sidc: string;
  options?: Record<string, any>;
  modifiers?: Record<string, any>;
  size?: number;
};

const props = withDefaults(defineProps<Props>(), { size: 15 });
const { store } = injectStrict(activeScenarioKey);
const customSidc = computed(() => {
  if (props.sidc?.startsWith(CUSTOM_SYMBOL_PREFIX)) {
    const symbolId = props.sidc.slice(CUSTOM_SYMBOL_SLICE);
    const mapping = props.options?.customSymbolMap ?? store.state.customSymbolMap ?? {};
    return mapping[symbolId];
  }
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
