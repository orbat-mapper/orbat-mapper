<script setup lang="ts">
import { computed } from "vue";
import ToggleField from "@/components/ToggleField.vue";
import {
  type ChartItemType,
  type FontKey,
  resolveToeFonts,
  TOE_FONT_OPTIONS,
  type ToeFontGroup,
} from "./orbatchart";
import { useChartSettings } from "./composables";
import FontStyleControl from "./FontStyleControl.vue";

interface Props {
  itemType: ChartItemType;
}
const props = defineProps<Props>();
const { setValue, clearValues, inheritedOptions, usedOptions, mergedOptions } =
  useChartSettings(props.itemType);

const GROUPS: { id: ToeFontGroup; label: string; resetLabel: string }[] = [
  { id: "personnel", label: "Personnel font", resetLabel: "Use unit label font" },
  { id: "equipment", label: "Equipment font", resetLabel: "Use personnel font" },
];

// Unset options are inherited, so show the fonts the lines are drawn with
const fonts = computed(() => resolveToeFonts(mergedOptions.value));
const inherited = computed(() => ({
  personnel: inheritedOptions(TOE_FONT_OPTIONS.personnel),
  equipment: inheritedOptions(TOE_FONT_OPTIONS.equipment),
}));

function setFont(group: ToeFontGroup, key: FontKey, value: unknown) {
  setValue(TOE_FONT_OPTIONS[group][key], value);
}
</script>

<template>
  <div class="space-y-6">
    <ToggleField
      :model-value="mergedOptions.showPersonnel"
      @update:model-value="setValue('showPersonnel', $event)"
      :class="!usedOptions.has('showPersonnel') && 'sepia-[50%]'"
      >Show personnel
    </ToggleField>
    <ToggleField
      :model-value="mergedOptions.showEquipment"
      @update:model-value="setValue('showEquipment', $event)"
      :class="!usedOptions.has('showEquipment') && 'sepia-[50%]'"
      >Show equipment
    </ToggleField>
    <FontStyleControl
      v-for="group in GROUPS"
      :key="group.id"
      :label="group.label"
      v-bind="fonts[group.id]"
      :inherited="inherited[group.id]"
      :reset-label="group.resetLabel"
      @update="(key, newValue) => setFont(group.id, key, newValue)"
      @reset="clearValues(Object.values(TOE_FONT_OPTIONS[group.id]))"
    />
  </div>
</template>
