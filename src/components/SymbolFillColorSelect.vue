<script setup lang="ts">
import { type NullableSymbolItem } from "@/types/constants";
import { computed } from "vue";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { SYMBOL_FILL_COLORS } from "@/config/colors.ts";

interface Props {
  sid?: string;
  defaultFillColor?: string;
}

const props = withDefaults(defineProps<Props>(), { sid: "3" });
const emit = defineEmits(["update:modelValue"]);

const colorValue = defineModel<string | null>({ default: null });

const colorIconItems = computed((): NullableSymbolItem[] =>
  [{ code: null, text: "Default" }, ...SYMBOL_FILL_COLORS].map((item) => ({
    ...item,
    sidc: "100" + props.sid + 10 + "00" + "00" + "0000000000",
    symbolOptions: item.code
      ? { fillColor: item.code }
      : props.defaultFillColor
        ? { fillColor: props.defaultFillColor }
        : undefined,
  })),
);
</script>

<template>
  <SymbolCodeSelect label="Fill color" :items="colorIconItems" v-model="colorValue" />
</template>
