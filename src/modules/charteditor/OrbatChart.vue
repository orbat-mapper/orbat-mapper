<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from "vue";
import {
  ArrowsPointingOutIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/vue/20/solid";
import {
  OrbatChart,
  PartialOrbChartOptions,
  SpecificOptions,
  SymbolGenerator,
  Unit,
  UnitNodeInfo,
} from "./orbatchart";
import BaseToolbar from "@/components/BaseToolbar.vue";
import ToolbarButton from "@/components/ToolbarButton.vue";

interface Props {
  unit?: Unit | null;
  debug?: boolean;
  options?: PartialOrbChartOptions;
  specificOptions?: SpecificOptions;
  interactive?: boolean;
  highlightedLevels?: number[];
  width?: number;
  height?: number;
  symbolGenerator?: SymbolGenerator;
  chartId?: string;
  enablePanZoom?: boolean;
  hideToolbar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  debug: false,
  interactive: false,
  highlightedLevels: () => [],
  width: 600,
  height: 600,
  enablePanZoom: false,
  hideToolbar: false,
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
    enablePanZoom: props.enablePanZoom,
  });
  if (props.interactive) orbatChart.makeInteractive();
});

onBeforeUnmount(() => {
  orbatChart?.cleanup();
});

function resetZoom() {
  orbatChart.resetZoom();
}
</script>

<template>
  <div class="relative h-full w-full">
    <div ref="chartRootElement" class="h-full w-full" />
    <nav v-if="enablePanZoom && !hideToolbar" class="absolute bottom-4 left-4">
      <BaseToolbar class="">
        <ToolbarButton start
          ><MagnifyingGlassPlusIcon class="h-5 w-5" @click="orbatChart.zoomIn()"
        /></ToolbarButton>
        <ToolbarButton
          ><MagnifyingGlassMinusIcon class="h-5 w-5" @click="orbatChart.zoomOut()"
        /></ToolbarButton>
        <ToolbarButton end
          ><ArrowsPointingOutIcon class="h-5 w-5" @click="resetZoom()"
        /></ToolbarButton>
      </BaseToolbar>
    </nav>
  </div>
</template>

<style>
.select-rect {
  cursor: pointer;
}
</style>
