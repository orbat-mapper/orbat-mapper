<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  watchEffect,
} from "vue";
import OrbatChart, {
  ChartOrientation,
  DEFAULT_OPTIONS,
  LevelLayout,
  Unit,
  UnitLevelDistance,
} from "./orbatchart";

export default defineComponent({
  name: "OrbatChart",
  props: {
    unit: { type: Object as PropType<Unit>, required: true },
    maxLevels: { type: Number, default: 3 },
    debug: { type: Boolean, default: false },
    symbolSize: { type: Number, default: 32 },
    connectorOffset: { type: Number, default: DEFAULT_OPTIONS.connectorOffset },
    orientation: {
      type: String as PropType<ChartOrientation>,
      default: DEFAULT_OPTIONS.orientation,
    },
    unitLevelDistance: {
      type: String as PropType<UnitLevelDistance>,
      default: DEFAULT_OPTIONS.unitLevelDistance,
    },
    lastLevelLayout: {
      type: String as PropType<LevelLayout>,
      default: LevelLayout.Horizontal,
    },
    levelPadding: { type: Number, default: DEFAULT_OPTIONS.levelPadding },
    treeOffset: { type: Number, default: DEFAULT_OPTIONS.treeOffset },
    stackedOffset: { type: Number, default: DEFAULT_OPTIONS.stackedOffset },
    lineWidth: { type: Number, default: DEFAULT_OPTIONS.lineWidth },
    specificOptions: { type: Object },
    interactive: { type: Boolean, default: false },
    highlightedLevels: { type: Array, default: () => [] },
  },

  setup(props, { emit }) {
    const chartRootElement = ref();
    const width = ref(600);
    const height = ref(600);
    let orbatChart: OrbatChart;

    onMounted(() => {
      width.value = chartRootElement.value?.clientWidth || 600;
      height.value = chartRootElement.value?.clientHeight || 600;
    });

    function onClick(unit: Unit) {
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
      if (!chartRootElement.value) return;
      if (orbatChart) orbatChart.cleanup();
      orbatChart = new OrbatChart(
        props.unit,
        {
          maxLevels: props.maxLevels,
          debug: props.debug,
          symbolSize: props.symbolSize,
          onClick: onClick,
          onLevelClick: onLevelClick,
          onLevelGroupClick: onLevelGroupClick,
          connectorOffset: props.connectorOffset,
          orientation: props.orientation,
          unitLevelDistance: props.unitLevelDistance,
          lastLevelLayout: props.lastLevelLayout,
          levelPadding: props.levelPadding,
          treeOffset: props.treeOffset,
          stackedOffset: props.stackedOffset,
          lineWidth: props.lineWidth,
        },
        props.specificOptions || {}
      );
      orbatChart.toSVG(
        { width: width.value, height: height.value },
        chartRootElement.value
      );
      if (props.interactive) orbatChart.makeInteractive();
    });

    onUnmounted(() => {
      orbatChart.cleanup();
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
</style>
