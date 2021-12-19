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
    <SimpleSelect
      label="Last level layout"
      v-model="options.lastLevelLayout"
      :items="levelItems"
    />
  </div>
</template>

<script>
import InputGroup from "../../components/InputGroup.vue";
import { useChartSettingsStore } from "./chartSettingsStore";
import SimpleSelect from "../../components/SimpleSelect.vue";
import { LevelLayout } from "./orbatchart";

export default {
  name: "OrbatChartSettings",
  components: { SimpleSelect, InputGroup },
  setup() {
    const options = useChartSettingsStore();
    const levelItems = Object.entries(LevelLayout).map(([label, value]) => ({
      label,
      value,
    }));

    return { options, levelItems };
  },
};
</script>
