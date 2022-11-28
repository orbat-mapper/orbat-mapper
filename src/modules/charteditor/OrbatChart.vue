<script setup lang="ts">
import { onBeforeUnmount, PropType, ref, watchEffect } from "vue";
import {
  OrbatChart,
  PartialOrbChartOptions,
  SpecificOptions,
  SymbolGenerator,
  Unit,
  UnitNodeInfo,
} from "./orbatchart";

const props = defineProps({
  unit: { type: Object as PropType<Unit | null | undefined> },
  debug: { type: Boolean, default: false },
  options: { type: Object as PropType<PartialOrbChartOptions> },
  specificOptions: { type: Object as PropType<SpecificOptions> },
  interactive: { type: Boolean, default: false },
  highlightedLevels: { type: Array, default: () => [] },
  width: { type: Number, default: 600 },
  height: { type: Number, default: 600 },
  symbolGenerator: { type: Function as PropType<SymbolGenerator> },
  chartId: { type: String },
});

const emit = defineEmits(["unitclick", "levelclick", "branchclick"]);

const chartRootElement = ref();
let orbatChart: OrbatChart;

function onClick(unit: UnitNodeInfo) {
  emit("unitclick", unit);
}

function onLevelClick(levelNumber: number) {
  emit("levelclick", levelNumber);
}

function onBranchClick(parentId: string | number, levelNumber: number) {
  emit("branchclick", parentId, levelNumber);
}

function handleLevelHighlight(value: number[]) {
  orbatChart.highlightLevels([...value]);
}

watchEffect(() => {
  if (!chartRootElement.value || !props.unit) return;
  if (orbatChart) orbatChart.cleanup();
  orbatChart = new OrbatChart(
    props.unit,
    {
      ...props.options,
      symbolGenerator: props.symbolGenerator,
      debug: props.debug,
      onClick,
      onLevelClick,
      onBranchClick,
    },
    props.specificOptions || {}
  );

  orbatChart.toSVG(chartRootElement.value, {
    width: props.width,
    height: props.height,
    elementId: props.chartId,
  });
  if (props.interactive) orbatChart.makeInteractive();
});

onBeforeUnmount(() => {
  orbatChart?.cleanup();
});
</script>

<template>
  <div ref="chartRootElement" class="h-full w-full" />
</template>

<style>
.select-rect {
  cursor: pointer;
}
</style>
