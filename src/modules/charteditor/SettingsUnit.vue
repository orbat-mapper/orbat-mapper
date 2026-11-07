<script setup lang="ts">
import { computed } from "vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import ToggleField from "@/components/ToggleField.vue";
import { enum2Items } from "@/utils";
import { type ChartItemType, LABEL_FONT_OPTIONS, LabelPlacements } from "./orbatchart";
import FontStyleControl from "./FontStyleControl.vue";
import { useChartSettings } from "./composables";
import NumberInputGroup from "@/components/NumberInputGroup.vue";

interface Props {
  itemType: ChartItemType;
}
const props = defineProps<Props>();
const { setValue, clearValues, inheritedOptions, usedOptions, mergedOptions } =
  useChartSettings(props.itemType);

const labelFontInherited = computed(() => inheritedOptions(LABEL_FONT_OPTIONS));
const labelPlacementItems = enum2Items(LabelPlacements);
</script>

<template>
  <div class="space-y-6">
    <NumberInputGroup
      label="Symbol size"
      :model-value="mergedOptions.symbolSize"
      @update:model-value="setValue('symbolSize', $event)"
      :class="!usedOptions.has('symbolSize') && 'sepia-[50%]'"
    />

    <FontStyleControl
      label="Label font"
      :font-size="mergedOptions.fontSize"
      :font-weight="mergedOptions.fontWeight"
      :font-style="mergedOptions.fontStyle"
      :font-color="mergedOptions.fontColor"
      :inherited="labelFontInherited"
      reset-label="Use inherited font"
      @update="setValue"
      @reset="clearValues(Object.values(LABEL_FONT_OPTIONS))"
    />
    <NumberInputGroup
      label="Label offset"
      :model-value="mergedOptions.labelOffset"
      @update:model-value="setValue('labelOffset', $event)"
      :class="!usedOptions.has('labelOffset') && 'sepia-[50%]'"
    />
    <SimpleSelect
      label="Label placement"
      :model-value="mergedOptions.labelPlacement"
      @update:model-value="setValue('labelPlacement', $event)"
      :class="!usedOptions.has('labelPlacement') && 'sepia-[50%]'"
      :items="labelPlacementItems"
    />
    <ToggleField
      :model-value="mergedOptions.useShortName"
      @update:model-value="setValue('useShortName', $event)"
      :class="!usedOptions.has('useShortName') && 'sepia-[50%]'"
      >Use short unit names
    </ToggleField>
    <ToggleField
      :model-value="mergedOptions.hideLabel"
      @update:model-value="setValue('hideLabel', $event)"
      :class="!usedOptions.has('hideLabel') && 'sepia-[50%]'"
      >Hide label
    </ToggleField>
  </div>
</template>
