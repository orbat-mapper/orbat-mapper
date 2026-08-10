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
import { useSearchActions } from "@/composables/searchActions";
import { useSelectedItems } from "@/stores/selectedStore";
import OrbatChartExportDialog from "@/modules/charteditor/OrbatChartExportDialog.vue";
import filenamify from "filenamify/browser";

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
      unitActions.expandUnitWithSymbolOptions(getUnitById(activeUnitId.value), {
        useCurrentState: true,
      })) ||
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
    { name: activeUnit.value?.name ?? "", static: true },
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

function changeTab(index: number) {
  selectedTab.value = index;
}

const panelWidth = ref();
const debug = ref(false);
const currentTab = ref<ChartTab>(ChartTabs.Chart);
const currentChartElements = useSelectedChartElementStore();

const chartSize = computed(() => sizeToWidthHeight(options.paperSize));
const width = computed(() => chartSize.value.width);
const height = computed(() => chartSize.value.height);
const chartId = "orbat-chart";
const showExportDialog = ref(false);
const exportFileName = computed(() => {
  const name = activeUnit.value?.shortName || activeUnit.value?.name || "orbat-chart";
  const date = new Date().toLocaleDateString("sv-SE");
  return filenamify(`${name}-orbat-${date}`);
});

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

const menuItems = computed<MenuItemData<() => void>[]>(() => [
  {
    label: "Export chart…",
    action: () => (showExportDialog.value = true),
    disabled: !activeUnit.value,
  },
]);
</script>

<template>
  <div class="relative flex min-h-0 flex-auto">
    <ResizablePanel
      v-model:width="panelWidth"
      class="bg-muted dark:bg-background relative z-10 flex h-full flex-col justify-between overflow-auto overflow-visible border-r-2 dark:border-gray-800 print:hidden"
    >
      <Tabs v-model="selectedTabString" class="flex h-full flex-col">
        <TabsList
          class="flex w-full rounded-none border-b border-gray-200 bg-transparent p-0 dark:border-gray-800"
        >
          <TabsTrigger
            v-for="(tab, index) in ['ORBAT', 'Chart settings']"
            :key="tab"
            :value="index.toString()"
            class="text-muted-foreground hover:text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary flex-1 rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-center text-sm font-medium shadow-none transition-none hover:border-gray-300 focus-visible:ring-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:hover:border-gray-700"
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
    <main
      class="bg-muted/50 dark:bg-background/50 text-foreground relative h-full flex-auto"
    >
      <SimpleBreadcrumbs
        class="bg-opacity-80 bg-background absolute top-2 left-2 z-10 print:hidden"
        :items="breadcrumbItems"
      />
      <nav class="bg-background absolute top-2 right-4 z-10 rounded-full print:hidden">
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
        :chart-id="chartId"
        :options="options.$state"
        :specific-options="specificOptions.$state"
        enable-pan-zoom
        interactive
        @unitclick="onUnitClick"
        @levelclick="onLevelClick"
        @branchclick="onBranchClick"
        :debug="debug"
      />
      <OrbatChartExportDialog
        v-if="activeUnit"
        v-model="showExportDialog"
        :chart-id="chartId"
        :paper-size="options.paperSize"
        :default-file-name="exportFileName"
        :chart-title="`${activeUnit.name} ORBAT chart`"
        :description="`Exported from ${state.info.name || 'ORBAT Mapper'}`"
      />
    </main>
  </div>
</template>
