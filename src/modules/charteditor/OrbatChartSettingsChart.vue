<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600">Settings that affect the whole chart.</p>
    <InputGroup label="Levels" type="number" v-model="options.maxLevels"></InputGroup>
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
    <InputGroup label="Level padding" type="number" v-model="options.levelPadding" />
    <InputGroup label="Line width" type="number" v-model="options.lineWidth" />
    <InputGroup label="Line color" type="color" v-model="options.lineColor" />
    <InputGroup label="Tree offset" type="number" v-model="options.treeOffset" />
    <InputGroup label="Stacked offset" type="number" v-model="options.stackedOffset" />
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
import { defineComponent } from "vue";
import MilSymbol from "../../components/MilSymbol.vue";

export default defineComponent({
  name: "OrbatChartSettingsChart",
  components: {
    MilSymbol,
    TabItem,
    TabView,
    ToggleField,
    SimpleSelect,
    InputGroup,
  },
  props: {},
  setup(props, { emit }) {
    const options = useChartSettingsStore();
    const levelItems = enum2Items(LevelLayout);
    const spacingItems = enum2Items(UnitLevelDistance);
    const fontWeightItems = enum2Items(FontWeight);
    const fontStyleItems = enum2Items(FontStyle);

    return {
      options,
      levelItems,
      spacingItems,
      fontWeightItems,
      fontStyleItems,
    };
  },
});
</script>
