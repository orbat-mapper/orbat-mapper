<template>
  <div class="w-screen h-screen relative flex overflow-hidden">
    <aside class="hidden w-64 lg:flex lg:flex-shrink-0 bg-gray-50 print:hidden p-6">
      <OrbatChartSettings />
    </aside>
    <SlideOver v-model="isMenuOpen">
      <OrbatChartSettings v-if="isMenuOpen" />
    </SlideOver>
    <main class="relative min-w-0 flex-auto">
      <OrbatChart
        v-if="isReady"
        :unit="rootUnit"
        :debug="debug"
        :last-level-layout="lastLevelLayout"
        :width="width"
        :height="height"
        :symbol-generator="symbolGenerator"
        @unitclick="onUnitClick"
        :interactive="isInteractive"
        :chart-id="chartId"
        v-bind="options.$state"
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
        <button @click="showSearch = true" class="text-gray-500 hover:text-gray-900">
          <span class="sr-only">Search units</span>
          <SearchIcon class="h-5 w-5" />
        </button>
        <DotsMenu :items="menuItems" />
      </div>
      <SearchModal v-model="showSearch" @select-unit="onUnitSelect" />
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, defineComponent, ref } from "vue";
import OrbatChart from "./OrbatChart.vue";
import ToggleField from "../../components/ToggleField.vue";
import { useScenarioStore } from "../../stores/scenarioStore";
import { useScenarioIO } from "../../stores/scenarioIO";
import { LevelLayout, UnitNodeInfo } from "./orbatchart";
import { ORBAT1 } from "./orbatchart/test/testorbats";
import { symbolGenerator } from "../../symbology/milsymbwrapper";
import { SearchIcon, MenuAlt2Icon } from "@heroicons/vue/solid";
import { Unit } from "../../types/models";
import { whenever } from "@vueuse/core";
import DotsMenu, { MenuItemData } from "../../components/DotsMenu.vue";
import FileSaver from "file-saver";
import SlideOver from "../../components/SlideOver.vue";
import OrbatChartSettings from "./OrbatChartSettings.vue";
import { useChartSettingsStore } from "./chartSettingsStore";

export default defineComponent({
  name: "OrbatChartView",
  components: {
    OrbatChartSettings,
    SlideOver,
    SearchModal: defineAsyncComponent(() => import("../../components/SearchModal.vue")),
    ToggleField,
    OrbatChart,
    SearchIcon,
    DotsMenu,
    MenuAlt2Icon,
  },
  setup() {
    const debug = ref(false);
    const isInteractive = ref(false);
    const showSearch = ref(false);
    const rootUnit = ref<Unit>();
    const scenarioStore = useScenarioStore();
    const scenarioIO = useScenarioIO();
    const chartId = "OrbatChart";
    const isMenuOpen = ref(false);
    const options = useChartSettingsStore();

    scenarioIO.loadDemoScenario("falkland82");
    whenever(
      () => scenarioStore.isLoaded,
      () => {
        rootUnit.value = scenarioStore.getUnitByName("3 Mech Inf Bde") || ORBAT1;
      },
      { immediate: true }
    );

    const lastLevelLayout = LevelLayout.TreeRight;
    const width = ref(1920 / 2);
    const height = ref(1080);
    const isReady = computed(() => scenarioStore.isLoaded);

    const onUnitClick = (unit: UnitNodeInfo) => {
      console.log("Clicked on unit", unit.unit.name);
    };

    const onUnitSelect = (unitId: string) => {
      const unit = scenarioStore.getUnitById(unitId);
      if (unit) rootUnit.value = unit;
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

    return {
      rootUnit,
      debug,
      lastLevelLayout,
      width,
      height,
      isReady,
      symbolGenerator,
      onUnitClick,
      isInteractive,
      showSearch,
      onUnitSelect,
      menuItems,
      chartId,
      isMenuOpen,
      options,
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
