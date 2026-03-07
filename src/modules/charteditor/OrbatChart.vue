<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect, computed } from "vue";
import {
  ArrowsPointingOutIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/vue/20/solid";
import { OrbatChart } from "./orbatchart";
import type {
  PartialOrbChartOptions,
  SpecificOptions,
  SymbolGenerator,
  ChartUnit,
  UnitNodeInfo,
} from "./orbatchart/types";
import BaseToolbar from "@/components/BaseToolbar.vue";
import ToolbarButton from "@/components/ToolbarButton.vue";
import ChartLevel from "./orbatchart/ChartLevel.vue";
import ChartConnectors from "./orbatchart/ChartConnectors.vue";
import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";

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

const svgRef = ref<SVGElement>();
let pz: PanzoomObject | null = null;

function onClick(unit: UnitNodeInfo) {
  emit("unitclick", unit);
}

function onLevelClick(levelNumber: number) {
  emit("levelclick", levelNumber);
}

function onBranchClick(parentId: string | number, levelNumber: number) {
  emit("branchclick", parentId, levelNumber);
}

const layoutData = computed(() => {
  if (!props.unit) return null;
  const chartEngine = new OrbatChart(
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
  return chartEngine.calculateLayout(props.width, props.height);
});

watchEffect(() => {
  if (svgRef.value && props.enablePanZoom) {
    if (!pz) {
      pz = Panzoom(svgRef.value, {
        maxScale: 10,
        pinchAndPan: true,
        animate: true,
        duration: 200,
      });
    }
  } else {
    if (pz) {
      pz.destroy();
      pz = null;
    }
  }
});

function handleWheel(event: WheelEvent) {
  if (pz && props.enablePanZoom) {
    event.preventDefault();
    // Use magnitude-aware zoom for smoother touchpad experience
    const scale = pz.getScale();
    const delta = event.deltaY;
    // Smoother scaling: 0.001 sensitivity is usually good for touchpads
    const factor = 1 - delta * 0.001;
    pz.zoomToPoint(scale * factor, event, { animate: false });
  }
}

onBeforeUnmount(() => {
  if (pz) pz.destroy();
});

function resetZoom() {
  if (pz) pz.reset();
}

function zoomIn() {
  if (pz) pz.zoomIn();
}

function zoomOut() {
  if (pz) pz.zoomOut();
}
</script>

<template>
  <div class="relative h-full w-full" @wheel="handleWheel">
    <svg
      v-if="props.unit"
      ref="svgRef"
      class="orbat-chart transform-origin-top-left h-full w-full"
      :viewBox="`0 0 ${width} ${height}`"
      :id="chartId"
    >
      <component :is="'style'">
        .o-line { stroke-linecap: round; } .o-label { text-anchor: middle;
        dominant-baseline: hanging; } .o-label-right { text-anchor: start;
        dominant-baseline: middle; } .o-unit:hover { fill: #770303; cursor: pointer;
        font-weight: bold; } .highlight { stroke: none; stroke-dasharray: 5, 5; fill:
        white; fill-opacity: 0; } .highlight:hover { stroke: gray; stroke-width: 2pt;
        fill: #ccc; fill-opacity: 0.1; } .debug-rect { stroke-width: 2px; stroke: #999;
        stroke-dasharray: 4, 4; fill: #999; fill-opacity: 0.05; }
      </component>

      <g class="o-wrapper">
        <template v-if="layoutData">
          <ChartConnectors
            :links="layoutData.links"
            :options="layoutData.levels[0]?.options || options"
          />
          <ChartLevel
            v-for="(level, index) in layoutData.levels"
            :key="index"
            :level="level"
            @unitclick="onClick"
            @branchclick="onBranchClick"
            @levelclick="onLevelClick"
          />
        </template>
      </g>
    </svg>

    <nav
      v-if="enablePanZoom && !hideToolbar"
      class="absolute bottom-4 left-4 print:hidden"
    >
      <BaseToolbar class="">
        <ToolbarButton start @click="zoomIn()">
          <MagnifyingGlassPlusIcon class="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton @click="zoomOut()">
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
.transform-origin-top-left {
  transform-origin: 0 0;
}
</style>
