<template>
  <main class="w-screen h-screen relative">
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
    />
    <div class="absolute left-4 top-4 flex items-center space-x-4">
      <ToggleField v-model="debug">Debug mode</ToggleField>
      <ToggleField v-model="isInteractive">Interactive</ToggleField>
      <button
        @click="showSearch = true"
        class="text-gray-500 hover:text-gray-900"
      >
        <span class="sr-only">Search units</span>
        <SearchIcon class="h-5 w-5" />
      </button>
      <DotsMenu :items="menuItems" />
    </div>
    <SearchModal v-model="showSearch" @select-unit="onUnitSelect" />
  </main>
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
import { SearchIcon } from "@heroicons/vue/solid";
import { Unit } from "../../types/models";
import { whenever } from "@vueuse/core";
import DotsMenu, { MenuItemData } from "../../components/DotsMenu.vue";
import FileSaver from "file-saver";

export default defineComponent({
  name: "OrbatChartView",
  components: {
    SearchModal: defineAsyncComponent(
      () => import("../../components/SearchModal.vue")
    ),
    ToggleField,
    OrbatChart,
    SearchIcon,
    DotsMenu,
  },
  setup() {
    const debug = ref(false);
    const isInteractive = ref(false);
    const showSearch = ref(false);
    const rootUnit = ref<Unit>();
    const scenarioStore = useScenarioStore();
    const scenarioIO = useScenarioIO();
    const chartId = "OrbatChart";

    scenarioIO.loadDemoScenario("falkland82");
    whenever(
      () => scenarioStore.isLoaded,
      () => {
        rootUnit.value =
          scenarioStore.getUnitByName("3 Mech Inf Bde") || ORBAT1;
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
      downloadSvgAsSvg(chartId);
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
    };
  },
});

function downloadSvgAsSvg(elementId: string) {
  let svgElement = document.getElementById(elementId);
  if (!svgElement) return;
  // need this for Firefox (https://stackoverflow.com/questions/28690643/firefox-error-rendering-an-svg-image-to-html5-canvas-with-drawimage)
  const savedWidth = svgElement.getAttribute("width") || "";
  const savedHeight = svgElement.getAttribute("height") || "";

  svgElement.setAttribute("width", "1000px");
  svgElement.setAttribute("height", "1000px");
  const svgBlob = new Blob(
    [new XMLSerializer().serializeToString(svgElement)],
    {
      type: "image/svg+xml",
    }
  );

  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const objectURL = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = function () {
    ctx.clearRect(0, 0, 1000, 1000);
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
