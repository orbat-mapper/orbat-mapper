<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
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
import type { BreadcrumbItem, MenuItemData } from "@/components/types";
import OrbatChartSettings from "@/modules/charteditor/OrbatChartSettings.vue";
import type {
  OnBranchClickCallback,
  OnLevelClickCallback,
  RenderedUnitNode,
} from "@/modules/charteditor/orbatchart";
import { type ChartTab, ChartTabs } from "@/modules/charteditor/constants";
import ToggleField from "@/components/ToggleField.vue";
import ResizablePanel from "@/components/ResizablePanel.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import { promiseTimeout } from "@vueuse/core";
import { useSearchActions } from "@/composables/searchActions";
import { useSelectedItems } from "@/stores/selectedStore";
import { saveBlobToLocalFile } from "@/utils/files";

const rootUnitStore = useRootUnitStore();
const options = useChartSettingsStore();
const specificOptions = useSpecificChartOptionsStore();
const { activeUnitId } = useSelectedItems();
const {
  unitActions,
  store: { state },
  helpers: { getUnitById },
} = injectStrict(activeScenarioKey);
const activeUnit = computed(
  () =>
    (activeUnitId.value &&
      unitActions.expandUnitWithSymbolOptions(getUnitById(activeUnitId.value))) ||
    null,
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
    { name: sideGroup?.name ?? "Root", static: true },
    ...parents.map((e) => ({ name: e.name, static: true })),
    { name: activeUnit.value?.name!, static: true },
  ];
});

rootUnitStore.unit = null;
const ORBAT_TAB = 0;
const SETTINGS_TAB = 1;

const selectedTab = ref(ORBAT_TAB);
const selectedTabString = computed({
  get: () => selectedTab.value.toString(),
  set: (v) => (selectedTab.value = parseInt(v)),
});

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
    canvas.toBlob((blob) => blob && saveBlobToLocalFile(blob, "orbat-chart.png"));
    URL.revokeObjectURL(objectURL);
    svgElement?.setAttribute("width", savedWidth);
    svgElement?.setAttribute("height", savedHeight);
  };

  image.src = objectURL;
}

async function downloadElementAsSVG(elementId: string) {
  let svgElement = document.getElementById(elementId);
  if (!svgElement) return;
  await saveBlobToLocalFile(
    new Blob([new XMLSerializer().serializeToString(svgElement)], {
      type: "image/svg+xml",
    }),
    "orbat-chart.svg",
  );
}

const menuItems: MenuItemData<Function>[] = [
  { label: "Download as SVG", action: doSVGDownload },
  { label: "Download as PNG", action: doPNGDownload },
];
</script>

<template>
  <div class="relative flex min-h-0 flex-auto">
    <ResizablePanel
      v-model:width="panelWidth"
      class="relative z-10 flex h-full flex-col justify-between overflow-auto overflow-visible border-r-2 bg-gray-100 dark:bg-gray-900 print:hidden"
    >
      <Tabs v-model="selectedTabString" class="flex h-full flex-col">
        <TabsList
          class="flex w-full rounded-none border-b border-gray-200 bg-transparent p-0"
        >
          <TabsTrigger
            v-for="(tab, index) in ['ORBAT', 'Chart settings']"
            :key="tab"
            :value="index.toString()"
            class="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-center text-sm font-medium text-gray-500 shadow-none transition-none hover:border-gray-300 hover:text-gray-700 focus-visible:ring-0 data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none"
          >
            {{ tab }}
          </TabsTrigger>
        </TabsList>
        <div class="min-h-0 flex-auto overflow-auto">
          <TabsContent value="0" class="mt-0 h-full">
            <OrbatPanel class="space-y-1" hide-filter>
              <template #header></template>
            </OrbatPanel>
          </TabsContent>
          <TabsContent value="1" class="mt-0 h-full">
            <OrbatChartSettings chart-mode :tab="currentTab" />
          </TabsContent>
        </div>
      </Tabs>
    </ResizablePanel>
    <main class="relative h-full flex-auto bg-gray-50">
      <SimpleBreadcrumbs
        class="bg-opacity-80 absolute top-2 left-2 z-10 bg-gray-50 print:hidden"
        :items="breadcrumbItems"
      />
      <nav class="absolute top-2 right-4 z-10 rounded-full bg-white print:hidden">
        <DotsMenu :items="menuItems" />
      </nav>

      <ToggleField class="absolute right-2 bottom-2 z-10 print:hidden" v-model="debug"
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
