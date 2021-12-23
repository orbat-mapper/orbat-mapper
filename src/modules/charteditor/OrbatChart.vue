<script lang="ts">
import { defineComponent, onBeforeUnmount, PropType, ref, watchEffect } from "vue";
import {
  OrbatChart,
  PartialOrbChartOptions,
  SpecificOptions,
  SymbolGenerator,
  Unit,
  UnitNodeInfo,
} from "./orbatchart";

export default defineComponent({
  name: "OrbatChart",
  props: {
    unit: { type: Object as PropType<Unit> },
    debug: { type: Boolean, default: false },
    options: { type: Object as PropType<PartialOrbChartOptions> },
    specificOptions: { type: Object as PropType<SpecificOptions> },
    interactive: { type: Boolean, default: false },
    highlightedLevels: { type: Array, default: () => [] },
    width: { type: Number, default: 600 },
    height: { type: Number, default: 600 },
    symbolGenerator: { type: Function as PropType<SymbolGenerator> },
    chartId: { type: String },
  },
  emits: ["unitclick", "levelclick", "levelgroupclick"],

  setup(props, { emit }) {
    const chartRootElement = ref();
    let orbatChart: OrbatChart;

    // onMounted(() => {
    //   width.value = chartRootElement.value?.clientWidth || 600;
    //   height.value =chartRootElement.value?.clientHeight || 600;
    // });

    function onClick(unit: UnitNodeInfo) {
      emit("unitclick", unit);
    }

    function onLevelClick(levelNumber: number) {
      emit("levelclick", levelNumber);
    }

    function onLevelGroupClick(parentId: string | number) {
      emit("levelgroupclick", parentId);
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
          onLevelGroupClick,
        },
        props.specificOptions || {}
      );

      orbatChart.toSVG(
        { width: props.width, height: props.height },
        chartRootElement.value,
        props.chartId
      );
      if (props.interactive) orbatChart.makeInteractive();
    });

    onBeforeUnmount(() => {
      orbatChart?.cleanup();
    });

    return { chartRootElement };
  },
});
</script>

<template>
  <div ref="chartRootElement" class="orbat-chart"></div>
</template>

<style>
.orbat-chart {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}

.select-rect {
  cursor: pointer;
}
</style>
