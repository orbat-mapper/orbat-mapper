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
  </div>
</template>

<script setup lang="ts">
import ToggleField from "@/components/ToggleField.vue";
import { ChartItemType } from "./orbatchart";
import { useChartSettings } from "./composables";

interface Props {
  itemType: ChartItemType;
}
const props = defineProps<Props>();
const { setValue, usedOptions, mergedOptions } = useChartSettings(props.itemType);
console.log(usedOptions);
</script>
