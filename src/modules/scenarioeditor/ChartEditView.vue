<template>
  <div class="relative flex min-h-0 flex-auto">
    <aside
      class="relative z-10 flex h-full w-96 flex-col justify-between overflow-auto border-r-2 bg-gray-100 dark:bg-gray-900"
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
                'w-1/2 border-b-2 py-4 px-1 text-center text-sm font-medium',
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
    </aside>
    <main class="relative h-full flex-auto bg-gray-50">
      <SimpleBreadcrumbs
        class="absolute top-2 left-2 z-10 bg-gray-50 bg-opacity-80"
        :items="breadcrumbItems"
      />

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
        interactive
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
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
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
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import SimpleBreadcrumbs from "@/components/SimpleBreadcrumbs.vue";
import { BreadcrumbItem } from "@/components/types";
import OrbatChartSettings from "@/modules/charteditor/OrbatChartSettings.vue";
import {
  OnBranchClickCallback,
  OnLevelClickCallback,
  RenderedUnitNode,
} from "@/modules/charteditor/orbatchart";
import { ChartTab, ChartTabs } from "@/modules/charteditor/constants";
import ToggleField from "@/components/ToggleField.vue";

const rootUnitStore = useRootUnitStore();
const options = useChartSettingsStore();
const specificOptions = useSpecificChartOptionsStore();
const activeUnitId = injectStrict(activeUnitKey);
const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);
const activeUnit = computed(
  () =>
    (activeUnitId.value &&
      unitActions.expandUnit(state.getUnitById(activeUnitId.value))) ||
    null
);

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

function changeTab(index: number) {
  selectedTab.value = index;
}

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
</script>
