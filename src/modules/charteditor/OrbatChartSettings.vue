<template>
  <div class="space-y-4">
    <h3 class="text-gray-900 font-medium">Chart layout settings</h3>
    <InputGroup label="Levels" type="number" v-model="options.maxLevels"></InputGroup>
    <InputGroup label="Symbol size" type="number" v-model="options.symbolSize" />
    <InputGroup label="Font size" type="number" v-model="options.fontSize" />
    <InputGroup
      label="Connector offset"
      type="number"
      v-model="options.connectorOffset"
    />
    <InputGroup label="Level padding" type="number" v-model="options.levelPadding" />
    <InputGroup label="Line width" type="number" v-model="options.lineWidth" />
    <InputGroup label="Tree offset" type="number" v-model="options.treeOffset" />
    <InputGroup label="Stacked offset" type="number" v-model="options.stackedOffset" />
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
import { useChartSettingsStore } from "./chartSettingsStore";
import SimpleSelect from "../../components/SimpleSelect.vue";
import { LevelLayout, UnitLevelDistance } from "./orbatchart";
import ToggleField from "../../components/ToggleField.vue";
import { enum2Items } from "../../utils";

export default {
  name: "OrbatChartSettings",
  components: { ToggleField, SimpleSelect, InputGroup },
  setup() {
    const options = useChartSettingsStore();
    const levelItems = enum2Items(LevelLayout);
    const spacingItems = enum2Items(UnitLevelDistance);

    return { options, levelItems, spacingItems };
  },
};
</script>
