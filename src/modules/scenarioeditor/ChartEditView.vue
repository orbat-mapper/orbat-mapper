<template>
  <div class="relative flex min-h-0 flex-auto">
    <aside
      class="relative z-10 flex flex-col justify-between overflow-auto border-r-2 bg-gray-100 dark:bg-gray-900"
    >
      <OrbatPanel class="w-96 space-y-1" hide-filter>
        <template #header></template>
      </OrbatPanel>
    </aside>
    <main class="relative h-full flex-auto bg-gray-50">
      <SimpleBreadcrumbs class="absolute top-2 left-2" :items="breadcrumbItems" />
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
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import {
  useChartSettingsStore,
  useRootUnitStore,
  useSpecificChartOptionsStore,
} from "@/modules/charteditor/chartSettingsStore";
import { sizeToWidthHeight } from "@/modules/charteditor/orbatchart/sizes";
import OrbatChart from "@/modules/charteditor/OrbatChart.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import SimpleBreadcrumbs from "@/components/SimpleBreadcrumbs.vue";
import { BreadcrumbItem } from "@/components/types";

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

const width = computed(() => sizeToWidthHeight(options.paperSize).width);
const height = computed(() => sizeToWidthHeight(options.paperSize).height);
</script>
