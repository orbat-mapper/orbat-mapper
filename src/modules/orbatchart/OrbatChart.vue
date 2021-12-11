<script lang="ts">
import { defineComponent, h, onMounted, onUnmounted, PropType, ref } from "vue";
import OrbatChart, {
  ChartOrientation,
  Unit,
  UnitLevelDistance,
} from "../../orbatchart";
import { DEFAULT_OPTIONS } from "../../orbatchart";
import { LevelLayout } from "../../orbatchart";

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

  data: () => ({
    resizeTimeout: null,
    width: 600,
    height: 600,
    isMounted: false,
  }),

  setup(props, { emit }) {
    const chartRootElement = ref();

    let orbatChart = new OrbatChart(
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

    onMounted(() => {
      orbatChart.toSVG({}, chartRootElement.value);
      if (props.interactive) orbatChart.makeInteractive();
    });

    onUnmounted(() => {
      orbatChart.cleanup();
    });

    return { chartRootElement };
  },

  mounted() {
    this.isMounted = true;
    this.width = this.$el.clientWidth;
    this.height = this.$el.clientHeight;
  },

  // watch: {
  //   highlightedLevels(value) {
  //     this.handleLevelHighlight(value);
  //   },
  // },
});
</script>

<template>
  <div ref="chartRootElement" class="orbat-chart"></div>
</template>

<style>
.orbat-chart {
  width: 100%;
  height: 80%;
  padding: 0;
  margin: 0;
}
</style>
