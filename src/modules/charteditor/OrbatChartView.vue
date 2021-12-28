<template>
  <div class="w-screen h-screen relative flex overflow-hidden">
    <aside class="hidden lg:w-[20rem] lg:flex lg:flex-shrink-0 bg-gray-50 print:hidden">
      <OrbatChartSettings v-model:tab="currentTab" class="print:hidden" />
    </aside>
    <SlideOver v-model="isMenuOpen" left title="Chart layout settings">
      <OrbatChartSettings v-if="isMenuOpen" v-model:tab="currentTab" />
    </SlideOver>
    <main class="relative min-w-0 flex-auto print:block">
      <OrbatChart
        v-if="isReady"
        :unit="rootUnitStore.unit"
        :debug="debug"
        :width="width"
        :height="height"
        :symbol-generator="symbolGenerator"
        @unitclick="onUnitClick"
        @levelclick="onLevelClick"
        @levelgroupclick="onLevelGroupClick"
        :interactive="isInteractive"
        :chart-id="chartId"
        :options="tOptions"
        :specific-options="tSpecificOptions"
        class=""
      />
      <div class="absolute left-4 top-4 flex items-center space-x-4 print:hidden">
        <button
          type="button"
          @click="isMenuOpen = true"
          class="p-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
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

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import OrbatChart from "./OrbatChart.vue";
import ToggleField from "../../components/ToggleField.vue";
import { useScenarioStore } from "../../stores/scenarioStore";
import { useScenarioIO } from "../../stores/scenarioIO";
import {
  LevelLayout,
  OnLevelClickCallback,
  OnLevelGroupClickCallback,
  RenderedUnitNode,
} from "./orbatchart";
import { ORBAT1 } from "./orbatchart/test/testorbats";
import { symbolGenerator } from "../../symbology/milsymbwrapper";
import { MenuAlt2Icon, SearchIcon } from "@heroicons/vue/solid";
import { throttledWatch, whenever } from "@vueuse/core";
import DotsMenu, { MenuItemData } from "../../components/DotsMenu.vue";
import FileSaver from "file-saver";
import SlideOver from "../../components/SlideOver.vue";
import OrbatChartSettings, { ChartTabs } from "./OrbatChartSettings.vue";
import {
  useChartSettingsStore,
  useRootUnitStore,
  useSelectedChartElementStore,
  useSpecificChartOptionsStore,
} from "./chartSettingsStore";

export default defineComponent({
  name: "OrbatChartView",
  components: {
    OrbatChartSettings,
    SlideOver,
    ToggleField,
    OrbatChart,
    SearchIcon,
    DotsMenu,
    MenuAlt2Icon,
  },
  setup() {
    const debug = ref(false);
    const isInteractive = ref(false);

    const scenarioStore = useScenarioStore();
    const scenarioIO = useScenarioIO();
    const chartId = "OrbatChart";
    const isMenuOpen = ref(false);
    const currentTab = ref<ChartTabs>(ChartTabs.Chart);
    const rootUnitStore = useRootUnitStore();
    const options = useChartSettingsStore();
    const specificOptions = useSpecificChartOptionsStore();
    const currentChartElements = useSelectedChartElementStore();
    scenarioIO.loadDemoScenario("falkland82");

    whenever(
      () => scenarioStore.isLoaded,
      () => {
        rootUnitStore.unit = scenarioStore.getUnitByName("TG 317.1 LG") || ORBAT1;
      },
      { immediate: true }
    );
    const lastLevelLayout = LevelLayout.TreeRight;
    const width = ref(1920);
    const height = ref(1080);

    const isReady = computed(() => scenarioStore.isLoaded);
    const onUnitClick = (unitNode: RenderedUnitNode) => {
      currentChartElements.selectUnit(unitNode);
      currentTab.value = ChartTabs.Unit;
    };

    const onLevelClick: OnLevelClickCallback = (levelNumber: number) => {
      currentChartElements.selectLevel(levelNumber);
      currentTab.value = ChartTabs.Level;
    };

    const onLevelGroupClick: OnLevelGroupClickCallback = (parentId, levelNumber) => {
      currentChartElements.selectLevelGroup(parentId, levelNumber);
      currentTab.value = ChartTabs.LevelGroup;
    };

    const doSVGDownload = () => {
      downloadElementAsSVG(chartId);
    };
    const doPNGDownload = () => {
      downloadSvgAsPng(chartId, width.value, height.value);
    };

    const menuItems: MenuItemData<Function>[] = [
      { label: "Download SVG", action: doSVGDownload },
      { label: "Download PNG", action: doPNGDownload },
    ];

    const tOptions = ref({ ...options.$state });
    const tSpecificOptions = ref({ ...specificOptions.$state });

    throttledWatch(
      [options, tSpecificOptions],
      () => {
        tOptions.value = { ...options.$state };
        tSpecificOptions.value = { ...specificOptions.$state };
      },
      { throttle: 100 }
    );

    return {
      rootUnitStore,
      debug,
      lastLevelLayout,
      width,
      height,
      isReady,
      symbolGenerator,
      onUnitClick,
      isInteractive,
      onLevelClick,
      onLevelGroupClick,
      menuItems,
      chartId,
      isMenuOpen,
      options,
      tOptions,
      currentTab,
      specificOptions,
      tSpecificOptions,
    };
  },
});

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
    canvas.toBlob((blob) => blob && FileSaver(blob, "orbat-chart.png"));
    URL.revokeObjectURL(objectURL);
    svgElement?.setAttribute("width", savedWidth);
    svgElement?.setAttribute("height", savedHeight);
  };

  image.src = objectURL;
}

function downloadElementAsSVG(elementId: string) {
  let svgElement = document.getElementById(elementId);
  if (!svgElement) return;
  FileSaver.saveAs(
    new Blob([new XMLSerializer().serializeToString(svgElement)], {
      type: "image/svg+xml",
    }),
    "orbat-chart.svg"
  );
}
</script>
