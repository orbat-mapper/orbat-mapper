<template>
  <div class="space-y-6">
    <InputGroup
      label="Symbol size"
      type="number"
      :model-value="mergedOptions.symbolSize"
      @update:model-value="setValue('symbolSize', $event)"
      :class="!usedOptions.has('symbolSize') && 'sepia-[50%]'"
    />

    <InputGroup
      label="Font size"
      type="number"
      :model-value="mergedOptions.fontSize"
      @update:model-value="setValue('fontSize', $event)"
      :class="!usedOptions.has('fontSize') && 'sepia-[50%]'"
    />

    <SimpleSelect
      label="Font weight"
      :model-value="mergedOptions.fontWeight"
      @update:model-value="setValue('fontWeight', $event)"
      :extra-class="!usedOptions.has('fontWeight') && 'sepia-[50%]'"
      :items="fontWeightItems"
    />
    <SimpleSelect
      label="Font style"
      :model-value="mergedOptions.fontStyle"
      @update:model-value="setValue('fontStyle', $event)"
      :extra-class="!usedOptions.has('fontStyle') && 'sepia-[50%]'"
      :items="fontStyleItems"
    />
    <InputGroup
      label="Label offset"
      type="number"
      :model-value="mergedOptions.labelOffset"
      @update:model-value="setValue('labelOffset', $event)"
      :class="!usedOptions.has('labelOffset') && 'sepia-[50%]'"
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

<script lang="ts">
import InputGroup from "../../components/InputGroup.vue";
import SimpleSelect from "../../components/SimpleSelect.vue";
import ToggleField from "../../components/ToggleField.vue";
import { defineComponent, PropType } from "vue";
import PlainButton from "../../components/PlainButton.vue";
import { enum2Items } from "../../utils";
import { ChartItemType, FontStyle, FontWeight } from "./orbatchart";
import { useChartSettings } from "./composables";

export default defineComponent({
  name: "SettingsUnit",
  components: { PlainButton, ToggleField, SimpleSelect, InputGroup },
  props: {
    itemType: { type: String as PropType<ChartItemType>, required: true },
  },
  setup(props) {
    const { setValue, usedOptions, mergedOptions } = useChartSettings(props.itemType);

    const fontWeightItems = enum2Items(FontWeight);
    const fontStyleItems = enum2Items(FontStyle);

    return {
      mergedOptions,
      setValue,
      usedOptions,
      fontWeightItems,
      fontStyleItems,
    };
  },
});
</script>
