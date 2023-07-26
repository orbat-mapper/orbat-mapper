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
  ChartUnit,
  UnitNodeInfo,
} from "./orbatchart";
import BaseToolbar from "@/components/BaseToolbar.vue";
import ToolbarButton from "@/components/ToolbarButton.vue";

interface Props {
  unit?: ChartUnit | null;
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

const visible = ref(true);

watchEffect(() => {
  if (!chartRootElement.value || !props.unit) return;
  let panScaleCopy: { pan: { x: number; y: number }; scale: number } | null | undefined;
  if (orbatChart) {
    panScaleCopy = orbatChart.getPanScale();
    orbatChart.cleanup();
  }
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
    props.specificOptions || {},
  );

  orbatChart.toSVG(chartRootElement.value, {
    width: props.width,
    height: props.height,
    elementId: props.chartId,
    enablePanZoom: props.enablePanZoom,
  });
  if (props.interactive) orbatChart.makeInteractive();
  if (panScaleCopy) {
    orbatChart.setPanScale(
      { x: panScaleCopy.pan.x, y: panScaleCopy.pan.y },
      panScaleCopy.scale,
    );
  }
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
    <div
      ref="chartRootElement"
      class="animate h-full w-full"
      :class="visible ? 'opacity-100' : 'opacity-0'"
    />
    <nav
      v-if="enablePanZoom && !hideToolbar"
      class="absolute bottom-4 left-4 print:hidden"
    >
      <BaseToolbar class="">
        <ToolbarButton start @click="orbatChart.zoomIn()">
          <MagnifyingGlassPlusIcon class="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton @click="orbatChart.zoomOut()">
          <MagnifyingGlassMinusIcon class="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton end @click="resetZoom()">
          <ArrowsPointingOutIcon class="h-5 w-5" />
        </ToolbarButton>
      </BaseToolbar>
    </nav>
  </div>
</template>

<style>
.select-rect {
  cursor: pointer;
}
</style>
