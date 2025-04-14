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

<script setup lang="ts">
import { type ChartItemType } from "./orbatchart";
import { useChartSettings } from "./composables";
import InputGroup from "@/components/InputGroup.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";

const props = defineProps<{ itemType: ChartItemType }>();

const { setValue, usedOptions, mergedOptions } = useChartSettings(props.itemType);
</script>
