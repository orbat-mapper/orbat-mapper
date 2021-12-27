<template>
  <div class="w-full">
    <h3 class="hidden lg:block text-gray-900 font-medium px-4 lg:p-4">
      Chart layout settings
    </h3>
    <TabView
      v-model:current-tab="currentTab"
      extra-class="px-4 -mx-4 lg:mx-0"
      tab-class="mx-2 lg:mx-4"
      class="min-h-0"
    >
      <TabItem label="Chart" class="mx-4">
        <div class="space-y-4">
          <p class="text-sm text-gray-600">Settings that affect the whole chart.</p>
          <InputGroup
            label="Levels"
            type="number"
            v-model="options.maxLevels"
          ></InputGroup>
          <InputGroup label="Symbol size" type="number" v-model="options.symbolSize" />
          <InputGroup label="Font size" type="number" v-model="options.fontSize" />
          <SimpleSelect
            label="Font weight"
            v-model="options.fontWeight"
            :items="fontWeightItems"
          />
          <SimpleSelect
            label="Font style"
            v-model="options.fontStyle"
            :items="fontStyleItems"
          />
          <InputGroup
            label="Connector offset"
            type="number"
            v-model="options.connectorOffset"
          />
          <InputGroup
            label="Level padding"
            type="number"
            v-model="options.levelPadding"
          />
          <InputGroup label="Line width" type="number" v-model="options.lineWidth" />
          <InputGroup label="Line color" type="color" v-model="options.lineColor" />
          <InputGroup label="Tree offset" type="number" v-model="options.treeOffset" />
          <InputGroup
            label="Stacked offset"
            type="number"
            v-model="options.stackedOffset"
          />
          <InputGroup label="Label offset" type="number" v-model="options.labelOffset" />
          <ToggleField v-model="options.useShortName">Use short unit names</ToggleField>
          <SimpleSelect
            label="Last level layout"
            v-model="options.lastLevelLayout"
            :items="levelItems"
          />
          <SimpleSelect
            label="Unit spacing"
            v-model="options.unitLevelDistance"
            :items="spacingItems"
          />
        </div>
      </TabItem>
      <TabItem label="Level" class="mx-4">
        <OrbatChartSettingsLevel />
      </TabItem>
      <TabItem label="Branch" class="mx-4">
        <OrbatChartSettingsLevelGroup />
      </TabItem>
      <TabItem label="Unit" class="mx-4">
        <OrbatChartSettingsUnit />
      </TabItem>
    </TabView>
  </div>
</template>

<script lang="ts">
import InputGroup from "../../components/InputGroup.vue";
import {
  useChartSettingsStore,
  useSelectedChartElementStore,
} from "./chartSettingsStore";
import SimpleSelect from "../../components/SimpleSelect.vue";
import { FontStyle, FontWeight, LevelLayout, UnitLevelDistance } from "./orbatchart";
import ToggleField from "../../components/ToggleField.vue";
import { enum2Items } from "../../utils";
import TabView from "../../components/TabView.vue";
import TabItem from "../../components/TabItem.vue";
import { computed, defineComponent, PropType, ref } from "vue";
import { useVModel } from "@vueuse/core";
import MilSymbol from "../../components/MilSymbol.vue";
import OrbatChartSettingsUnit from "./OrbatChartSettingsUnit.vue";
import OrbatChartSettingsLevel from "./OrbatChartSettingsLevel.vue";
import OrbatChartSettingsLevelGroup from "./OrbatChartSettingsLevelGroup.vue";

export const enum ChartTabs {
  Chart = 0,
  Level,
  LevelGroup,
  Unit,
}

export default defineComponent({
  name: "OrbatChartSettings",
  components: {
    OrbatChartSettingsLevelGroup,
    OrbatChartSettingsLevel,
    OrbatChartSettingsUnit,
    MilSymbol,
    TabItem,
    TabView,
    ToggleField,
    SimpleSelect,
    InputGroup,
  },
  props: {
    tab: { type: Number as PropType<ChartTabs>, default: ChartTabs.Chart },
  },
  setup(props, { emit }) {
    const options = useChartSettingsStore();
    const selectedElement = useSelectedChartElementStore();
    const levelItems = enum2Items(LevelLayout);
    const spacingItems = enum2Items(UnitLevelDistance);
    const fontWeightItems = enum2Items(FontWeight);
    const fontStyleItems = enum2Items(FontStyle);
    const currentTab = useVModel(props, "tab", emit);
    const currentUnit = computed(() => selectedElement.node?.unit);
    return {
      options,
      levelItems,
      spacingItems,
      currentTab,
      currentUnit,
      fontWeightItems,
      fontStyleItems,
    };
  },
});
</script>
