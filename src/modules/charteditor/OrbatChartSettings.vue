<template>
  <div class="w-full flex flex-col">
    <h3 class="hidden lg:block text-gray-900 font-medium px-4 lg:p-4">
      Chart layout settings
    </h3>
    <TabView
      v-model:current-tab="currentTab"
      extra-class="px-4 -mx-4 lg:mx-0"
      tab-class="mx-2 lg:mx-4"
      class="flex-auto min-h-0"
    >
      <TabItem label="Chart" class="mx-4">
        <OrbatChartSettingsChart />
      </TabItem>
      <TabItem label="Level" class="mx-4">
        <OrbatChartSettingsLevel />
      </TabItem>
      <TabItem label="Branch" class="mx-4">
        <OrbatChartSettingsBranch />
      </TabItem>
      <TabItem label="Unit" class="mx-4">
        <OrbatChartSettingsUnit />
      </TabItem>
    </TabView>
  </div>
</template>

<script lang="ts">
import TabView from "../../components/TabView.vue";
import TabItem from "../../components/TabItem.vue";
import { defineComponent, PropType } from "vue";
import { useVModel } from "@vueuse/core";
import OrbatChartSettingsUnit from "./OrbatChartSettingsUnit.vue";
import OrbatChartSettingsLevel from "./OrbatChartSettingsLevel.vue";
import OrbatChartSettingsChart from "./OrbatChartSettingsChart.vue";
import OrbatChartSettingsBranch from "./OrbatChartSettingsBranch.vue";

export const enum ChartTabs {
  Chart = 0,
  Level,
  Branch,
  Unit,
}

export default defineComponent({
  name: "OrbatChartSettings",
  components: {
    OrbatChartSettingsChart,
    OrbatChartSettingsLevel,
    OrbatChartSettingsBranch,
    OrbatChartSettingsUnit,

    TabItem,
    TabView,
  },
  props: {
    tab: { type: Number as PropType<ChartTabs>, default: ChartTabs.Chart },
  },
  setup(props, { emit }) {
    const currentTab = useVModel(props, "tab", emit);
    return {
      currentTab,
    };
  },
});
</script>
