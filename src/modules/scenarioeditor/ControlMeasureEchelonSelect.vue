<script setup lang="ts">
import { computed } from "vue";
import {
  CONTROL_MEASURE_METADATA,
  getDefaultOptions,
} from "@orbat-mapper/control-measures";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { SID, UNIT_SYMBOLSET_VALUE } from "@/symbology/values";
import type { SymbolItem } from "@/types/constants";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";

const ECHELON_CODE_BY_VALUE: Record<string, string> = {
  none: "00",
  team: "11",
  squad: "12",
  section: "13",
  platoon: "14",
  company: "15",
  battalion: "16",
  regiment: "17",
  brigade: "18",
  division: "21",
  corps: "22",
  army: "23",
  "army-group": "24",
  region: "25",
  command: "26",
};

const props = defineProps<{
  graphicKind?: ControlMeasureId;
  options?: TacticalGraphicOptions;
}>();

const emit = defineEmits<{
  update: [options: TacticalGraphicOptions];
}>();

const echelonParam = computed(() =>
  props.graphicKind === undefined
    ? undefined
    : CONTROL_MEASURE_METADATA[props.graphicKind]?.params?.find(
        (param) => param.key === "echelon" && param.type === "enum",
      ),
);
const echelonOptions = computed(() =>
  echelonParam.value?.type === "enum" ? echelonParam.value.options : [],
);

function echelonSidc(code: string): string {
  return `100${SID.Friend}${UNIT_SYMBOLSET_VALUE}00${code}0000000000`;
}

const echelonItems = computed<SymbolItem[]>(() => {
  const items = new Map<string, SymbolItem>();
  items.set("none", {
    code: "none",
    text: "None",
    sidc: echelonSidc("00"),
  });
  for (const option of echelonOptions.value) {
    const value = String(option.value);
    items.set(value, {
      code: value,
      text: option.label,
      sidc: echelonSidc(ECHELON_CODE_BY_VALUE[value] ?? "00"),
    });
  }
  return [...items.values()];
});

const defaultEchelon = computed(() => {
  if (!props.graphicKind) return "none";
  const defaults = getDefaultOptions(props.graphicKind) as Record<string, unknown>;
  return String(defaults.echelon ?? "none");
});

const selectedEchelon = computed({
  get: () => String(props.options?.echelon ?? defaultEchelon.value),
  set: (value: string | null) => {
    if (value) emit("update", { ...props.options, echelon: value });
  },
});
</script>

<template>
  <SymbolCodeSelect
    v-if="echelonOptions.length"
    v-model="selectedEchelon"
    class="col-span-2 w-full"
    label="Echelon"
    :items="echelonItems"
  />
</template>
