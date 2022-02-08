<template>
  <div class="space-y-6">
    <NumberInputGroup
      label="Connector offset"
      :model-value="mergedOptions.connectorOffset"
      @update:model-value="setValue('connectorOffset', $event)"
      :class="!usedOptions.has('connectorOffset') && 'sepia-[50%]'"
    />

    <NumberInputGroup
      label="Line width"
      type="number"
      :model-value="mergedOptions.lineWidth"
      @update:model-value="setValue('lineWidth', $event)"
      :class="!usedOptions.has('lineWidth') && 'sepia-[50%]'"
    />
    <InputGroup
      label="Line color"
      type="color"
      :model-value="mergedOptions.lineColor"
      @update:model-value="setValue('lineColor', $event)"
      :class="!usedOptions.has('lineColor') && 'sepia-[50%]'"
    />
  </div>
</template>

<script lang="ts">
import InputGroup from "../../components/InputGroup.vue";
import SimpleSelect from "../../components/SimpleSelect.vue";
import ToggleField from "../../components/ToggleField.vue";
import { defineComponent, PropType } from "vue";
import PlainButton from "../../components/PlainButton.vue";
import { ChartItemType } from "./orbatchart";
import { useChartSettings } from "./composables";
import NumberInputGroup from "../../components/NumberInputGroup.vue";

export default defineComponent({
  name: "SettingConnectors",
  components: { NumberInputGroup, PlainButton, ToggleField, SimpleSelect, InputGroup },
  props: {
    itemType: { type: String as PropType<ChartItemType>, required: true },
  },
  setup(props) {
    const { setValue, usedOptions, mergedOptions } = useChartSettings(props.itemType);

    return {
      mergedOptions,
      setValue,
      usedOptions,
    };
  },
});
</script>
