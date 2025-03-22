<template>
  <div class="relative flex h-full w-screen overflow-hidden">
    <aside
      class="hidden bg-gray-50 lg:flex lg:w-[20rem] lg:flex-shrink-0 lg:border-r lg:border-gray-200 print:hidden"
    >
      <OrbatChartSettings v-model:tab="currentTab" class="print:hidden" />
    </aside>
    <SlideOver v-model="isMenuOpen" left title="Chart layout settings">
      <OrbatChartSettings v-if="isMenuOpen" v-model:tab="currentTab" />
    </SlideOver>
    <main class="relative min-w-0 flex-auto print:block">
      <OrbatChart
        :unit="rootUnitStore.unit"
        :debug="debug"
        :width="width"
        :height="height"
        :symbol-generator="symbolGenerator"
        @unitclick="onUnitClick"
        @levelclick="onLevelClick"
        @branchclick="onBranchClick"
        :interactive="isInteractive"
        :chart-id="chartId"
        :options="options.$state"
        :specific-options="specificOptions.$state"
        enable-pan-zoom
      />
      <div class="absolute left-4 top-4 flex items-center space-x-4 print:hidden">
        <button
          type="button"
          @click="isMenuOpen = true"
          class="border-r border-gray-200 p-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
        >
          <span class="sr-only">Open sidebar</span>
          <MenuAlt2Icon class="h-6 w-6" aria-hidden="true" />
        </button>
        <ToggleField v-model="debug">Debug mode</ToggleField>
        <ToggleField v-model="isInteractive">Interactive</ToggleField>
        <DotsMenu :items="menuItems" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, provide, ref } from "vue";
import OrbatChart from "./OrbatChart.vue";
import ToggleField from "@/components/ToggleField.vue";

import {
  LevelLayouts,
  OnBranchClickCallback,
  OnLevelClickCallback,
  RenderedUnitNode,
} from "./orbatchart";
import { ORBAT1 } from "./orbatchart/test/testorbats";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import { Bars3BottomLeftIcon as MenuAlt2Icon } from "@heroicons/vue/24/solid";
import { promiseTimeout } from "@vueuse/core";
import DotsMenu from "@/components/DotsMenu.vue";
import SlideOver from "@/components/SlideOver.vue";
import OrbatChartSettings from "./OrbatChartSettings.vue";
import {
  useChartSettingsStore,
  useRootUnitStore,
  useSelectedChartElementStore,
  useSpecificChartOptionsStore,
} from "./chartSettingsStore";
import { sizeToWidthHeight } from "./orbatchart/sizes";
import { TScenario } from "@/scenariostore";
import { activeScenarioKey } from "@/components/injects";
import { MenuItemData } from "@/components/types";
import { type ChartTab, ChartTabs } from "@/modules/charteditor/constants";
import { saveBlobToLocalFile } from "@/utils/files";

const props = defineProps<{ activeScenario: TScenario }>();
provide(activeScenarioKey, props.activeScenario);

const debug = ref(false);
const isInteractive = ref(true);

const chartId = "OrbatChart";
const isMenuOpen = ref(false);
const currentTab = ref<ChartTab>(ChartTabs.Chart);
const rootUnitStore = useRootUnitStore();
const options = useChartSettingsStore();
const specificOptions = useSpecificChartOptionsStore();
const currentChartElements = useSelectedChartElementStore();

rootUnitStore.unit =
  props.activeScenario.unitActions.getUnitByName("TG 317.1 LG") || ORBAT1;

const lastLevelLayout = LevelLayouts.TreeRight;
const width = computed(() => sizeToWidthHeight(options.paperSize).width);
const height = computed(() => sizeToWidthHeight(options.paperSize).height);

const onUnitClick = (unitNode: RenderedUnitNode) => {
  currentChartElements.selectUnit(unitNode);
  currentTab.value = ChartTabs.Unit;
};

const onLevelClick: OnLevelClickCallback = (levelNumber: number) => {
  currentChartElements.selectLevel(levelNumber);
  currentTab.value = ChartTabs.Level;
};

const onBranchClick: OnBranchClickCallback = (parentId, levelNumber) => {
  currentChartElements.selectBranch(parentId, levelNumber);
  currentTab.value = ChartTabs.Branch;
};

const doSVGDownload = async () => {
  const origValue = isInteractive.value;
  isInteractive.value = false;
  await nextTick();
  downloadElementAsSVG(chartId);
  await promiseTimeout(1000);
  isInteractive.value = origValue;
};

const doPNGDownload = async () => {
  const origValue = isInteractive.value;
  isInteractive.value = false;
  await nextTick();
  downloadSvgAsPng(chartId, width.value, height.value);
  await promiseTimeout(1000);
  isInteractive.value = origValue;
};

const menuItems: MenuItemData<Function>[] = [
  { label: "Download SVG", action: doSVGDownload },
  { label: "Download PNG", action: doPNGDownload },
];

function downloadSvgAsPng(elementId: string, width: number, height: number) {
  let svgElement = document.getElementById(elementId);
  if (!svgElement) return;
  // need this for Firefox (https://stackoverflow.com/questions/28690643/firefox-error-rendering-an-svg-image-to-html5-canvas-with-drawimage)
  const savedWidth = svgElement.getAttribute("width") || "";
  const savedHeight = svgElement.getAttribute("height") || "";
  const scaleFactor = 2;

  svgElement.setAttribute("width", `${width * scaleFactor}px`);
  svgElement.setAttribute("height", `${height * scaleFactor}px`);
  const svgBlob = new Blob([new XMLSerializer().serializeToString(svgElement)], {
    type: "image/svg+xml",
  });

  const canvas = document.createElement("canvas");
  canvas.width = width * scaleFactor;
  canvas.height = height * scaleFactor;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const objectURL = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = function () {
    ctx.drawImage(image, 0, 0);
    canvas.toBlob((blob) => blob && saveBlobToLocalFile(blob, "orbat-chart.png"));
    URL.revokeObjectURL(objectURL);
    svgElement?.setAttribute("width", savedWidth);
    svgElement?.setAttribute("height", savedHeight);
  };

  image.src = objectURL;
}

function downloadElementAsSVG(elementId: string) {
  let svgElement = document.getElementById(elementId);
  if (!svgElement) return;
  saveBlobToLocalFile(
    new Blob([new XMLSerializer().serializeToString(svgElement)], {
      type: "image/svg+xml",
    }),
    "orbat-chart.svg",
  );
}
</script>
