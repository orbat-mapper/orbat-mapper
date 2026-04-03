<script setup lang="ts">
import { type NullableSymbolItem } from "@/types/constants";
import { computed, inject } from "vue";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { SYMBOL_FILL_COLORS, type SymbolFillColor } from "@/config/colors.ts";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects.ts";

interface Props {
  sid?: string;
  defaultFillColor?: string;
}

const props = withDefaults(defineProps<Props>(), { sid: "3" });
const emit = defineEmits(["update:modelValue"]);
const colorValue = defineModel<string | null>({ default: null });

const scn = inject(activeScenarioKey, undefined);

const colorIconItems = computed((): NullableSymbolItem[] => {
  const items: { code: string | null; text: string }[] = [
    { code: null, text: "Default" },
    ...SYMBOL_FILL_COLORS,
    ...Object.values(scn?.store.state.symbolFillColorMap ?? {}),
  ];
  if (colorValue.value && !items.some((i) => i.code === colorValue.value)) {
    items.push({ code: colorValue.value, text: `Custom (${colorValue.value})` });
  }
  return items.map((item) => ({
    ...item,
    sidc: "100" + props.sid + 10 + "00" + "00" + "0000000000",
    symbolOptions: item.code
      ? { fillColor: item.code }
      : props.defaultFillColor
        ? { fillColor: props.defaultFillColor }
        : undefined,
  }));
});
</script>

<template>
  <SymbolCodeSelect label="Fill color" :items="colorIconItems" v-model="colorValue" />
</template>
