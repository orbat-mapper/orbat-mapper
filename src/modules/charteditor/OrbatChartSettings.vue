<script setup lang="ts">
import { computed } from "vue";
import ScrollTabs from "@/components/ScrollTabs.vue";
import TabsContent from "@/components/ui/tabs/TabsContent.vue";
import OrbatChartSettingsUnit from "./OrbatChartSettingsUnit.vue";
import OrbatChartSettingsLevel from "./OrbatChartSettingsLevel.vue";
import OrbatChartSettingsChart from "./OrbatChartSettingsChart.vue";
import OrbatChartSettingsBranch from "./OrbatChartSettingsBranch.vue";
import { type ChartTab, ChartTabs } from "@/modules/charteditor/constants";

interface Props {
  tab?: ChartTab;
  chartMode?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  chartMode: false,
});

const currentTab = defineModel<ChartTab>("tab");

const tabItems = [
  { label: "Chart", value: ChartTabs.Chart.toString() },
  { label: "Level", value: ChartTabs.Level.toString() },
  { label: "Branch", value: ChartTabs.Branch.toString() },
  { label: "Unitss", value: ChartTabs.Unit.toString() },
];
</script>

<template>
  <div class="flex w-full flex-col">
    <h3 v-if="!chartMode" class="text-foreground hidden px-4 font-medium lg:block lg:p-4">
      Chart layout settings
    </h3>
    <ScrollTabs
      v-model="currentTab"
      :items="tabItems"
      :unmount-on-hide="false"
      class="min-h-0 flex-auto"
    >
      <TabsContent :value="ChartTabs.Chart" class="mt-6 px-4">
        <OrbatChartSettingsChart
          v-if="currentTab === ChartTabs.Chart"
          :chart-mode="chartMode"
        />
      </TabsContent>
      <TabsContent :value="ChartTabs.Level" class="mt-6 px-4">
        <OrbatChartSettingsLevel />
      </TabsContent>
      <TabsContent :value="ChartTabs.Branch" class="mt-6 px-4">
        <OrbatChartSettingsBranch />
      </TabsContent>
      <TabsContent :value="ChartTabs.Unit" class="mt-6 px-4">
        <OrbatChartSettingsUnit />
      </TabsContent>
    </ScrollTabs>
  </div>
</template>
