<template>
  <SymbolCodeSelect label="Fill color" :items="colorIconItems" v-model="colorValue" />
</template>

<script setup lang="ts">
import { SymbolItem } from "@/types/constants";
import { computed } from "vue";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { useVModel } from "@vueuse/core";

interface Props {
  modelValue?: string;
  sid?: string;
  defaultFillColor?: string;
}

const props = withDefaults(defineProps<Props>(), { sid: "3", modelValue: "" });
const emit = defineEmits(["update:modelValue"]);

const colorValue = useVModel(props, "modelValue", emit);

const colors: Omit<SymbolItem, "sidc">[] = [
  { code: "", text: "Default" },
  { code: "#80e0ff", text: "Blue (standard)" },
  { code: "#ff8080", text: "Red (standard)" },
  { code: "#aaffaa", text: "Green (standard)" },
  { code: "#ffff80", text: "Yellow (standard)" },
  { code: "#ffa1ff", text: "Pink (civilian)" },
  { code: "#aab074", text: "Olive" },
  { code: "#5baa5b", text: "Infantry (Battle Order)" },
  { code: "#ffd00b", text: "Armor (Battle Order)" },
  { code: "#ff3333", text: "Artillery (Battle Order)" },
  { code: "#f7f7f7", text: "Combat Support (Battle Order)" },
  { code: "#d87600", text: "Service Support (Battle Order)" },
  { code: "#a2e3e8", text: "Aviation (Battle Order)" },
];

const colorIconItems = computed((): SymbolItem[] =>
  colors.map((item) => ({
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
