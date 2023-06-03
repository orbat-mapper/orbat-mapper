<template>
  <div class="relative flex min-h-0 flex-auto">
    <ResizablePanel
      v-model:width="panelWidth"
      class="relative z-10 flex h-full flex-col justify-between overflow-auto overflow-visible border-r-2 bg-gray-100 dark:bg-gray-900"
    >
      <TabGroup :selected-index="selectedTab" @change="changeTab">
        <TabList class="-mb-px flex border-b border-gray-200">
          <Tab
            as="template"
            v-for="tab in ['ORBAT', 'Chart settings']"
            :key="tab"
            v-slot="{ selected }"
          >
            <button
              :class="[
                selected
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'w-1/2 border-b-2 px-1 py-4 text-center text-sm font-medium',
              ]"
            >
              {{ tab }}
            </button>
          </Tab>
        </TabList>
        <TabPanels class="min-h-0 flex-auto overflow-auto">
          <TabPanel :unmount="false">
            <OrbatPanel class="space-y-1" hide-filter>
              <template #header></template>
            </OrbatPanel>
          </TabPanel>
          <TabPanel :unmount="false">
            <OrbatChartSettings chart-mode :tab="currentTab" />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </ResizablePanel>
    <main class="relative h-full flex-auto bg-gray-50">
      <SimpleBreadcrumbs
        class="absolute left-2 top-2 z-10 bg-gray-50 bg-opacity-80"
        :items="breadcrumbItems"
      />
      <nav class="absolute right-4 top-2 z-10 rounded-full bg-white">
        <DotsMenu :items="menuItems" />
      </nav>

      <ToggleField class="absolute bottom-2 right-2 z-10" v-model="debug"
        >Debug mode</ToggleField
      >
      <p v-if="!activeUnit" class="p-8 text-center">Select a root unit in the sidebar</p>
      <OrbatChart
        :unit="activeUnit"
        :width="width"
        :height="height"
        :symbol-generator="symbolGenerator"
        chart-id="chartId"
        :options="options.$state"
        :specific-options="specificOptions.$state"
        enable-pan-zoom
        :interactive="isInteractive"
        @unitclick="onUnitClick"
        @levelclick="onLevelClick"
        @branchclick="onBranchClick"
        :debug="debug"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import {
  useChartSettingsStore,
  useRootUnitStore,
  useSelectedChartElementStore,
  useSpecificChartOptionsStore,
} from "@/modules/charteditor/chartSettingsStore";
import { sizeToWidthHeight } from "@/modules/charteditor/orbatchart/sizes";
import OrbatChart from "@/modules/charteditor/OrbatChart.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import SimpleBreadcrumbs from "@/components/SimpleBreadcrumbs.vue";
import { BreadcrumbItem, MenuItemData } from "@/components/types";
import OrbatChartSettings from "@/modules/charteditor/OrbatChartSettings.vue";
import {
  OnBranchClickCallback,
  OnLevelClickCallback,
  RenderedUnitNode,
} from "@/modules/charteditor/orbatchart";
import { ChartTab, ChartTabs } from "@/modules/charteditor/constants";
import ToggleField from "@/components/ToggleField.vue";
import ResizablePanel from "@/components/ResizablePanel.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import { promiseTimeout } from "@vueuse/core";
import FileSaver from "file-saver";
import { useSearchActions } from "@/composables/searchActions";
import { useSelectedItems } from "@/stores/selectedStore";

const rootUnitStore = useRootUnitStore();
const options = useChartSettingsStore();
const specificOptions = useSpecificChartOptionsStore();
const { activeUnitId } = useSelectedItems();
const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);
const activeUnit = computed(
  () =>
    (activeUnitId.value &&
      unitActions.expandUnitWithSymbolOptions(state.getUnitById(activeUnitId.value))) ||
    null
);

const { onUnitSelect } = useSearchActions();

onUnitSelect(({ unitId }) => {
  activeUnitId.value = unitId;
});

const breadcrumbItems = computed((): BreadcrumbItem[] => {
  if (!activeUnitId.value) return [];
  const { side, sideGroup, parents } = unitActions.getUnitHierarchy(activeUnitId.value);
  return [
    { name: side.name, static: true },
    { name: sideGroup.name, static: true },
    ...parents.map((e) => ({ name: e.name, static: true })),
    { name: activeUnit.value?.name!, static: true },
  ];
});

rootUnitStore.unit = null;
const ORBAT_TAB = 0;
const SETTINGS_TAB = 1;

const selectedTab = ref(ORBAT_TAB);
const isInteractive = ref(true);

function changeTab(index: number) {
  selectedTab.value = index;
}

const panelWidth = ref();
const debug = ref(false);
const currentTab = ref<ChartTab>(ChartTabs.Chart);
const currentChartElements = useSelectedChartElementStore();

const width = computed(() => sizeToWidthHeight(options.paperSize).width);
const height = computed(() => sizeToWidthHeight(options.paperSize).height);

const onUnitClick = (unitNode: RenderedUnitNode) => {
  currentChartElements.selectUnit(unitNode);
  changeTab(SETTINGS_TAB);
  nextTick(() => (currentTab.value = ChartTabs.Unit));
};

const onLevelClick: OnLevelClickCallback = (levelNumber: number) => {
  currentChartElements.selectLevel(levelNumber);
  changeTab(SETTINGS_TAB);
  currentTab.value = ChartTabs.Level;
};

const onBranchClick: OnBranchClickCallback = (parentId, levelNumber) => {
  currentChartElements.selectBranch(parentId, levelNumber);
  changeTab(SETTINGS_TAB);
  currentTab.value = ChartTabs.Branch;
};

const doSVGDownload = async () => {
  const origValue = isInteractive.value;
  isInteractive.value = false;
  await nextTick();
  downloadElementAsSVG("chartId");
  await promiseTimeout(1000);
  isInteractive.value = origValue;
};

const doPNGDownload = async () => {
  const origValue = isInteractive.value;
  isInteractive.value = false;
  await nextTick();
  downloadSvgAsPng("chartId", width.value, height.value);
  await promiseTimeout(1000);
  isInteractive.value = origValue;
};

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

const menuItems: MenuItemData<Function>[] = [
  { label: "Download as SVG", action: doSVGDownload },
  { label: "Download as PNG", action: doPNGDownload },
];
</script>
