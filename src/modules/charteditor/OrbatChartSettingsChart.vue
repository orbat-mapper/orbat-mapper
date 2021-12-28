<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600">Settings that affect the whole chart.</p>
    <InputGroupTemplate label="Root unit" v-if="rootUnitStore.unit">
      <div class="flex items-start">
        <div class="flex-shrink-0 w-16 mt-2">
          <MilSymbol :sidc="rootUnitStore.unit.sidc" :size="30" />
        </div>
        <div class="flex-auto min-w-0">
          <p class="font-medium text-gray-700 pt-2 text-sm truncate">
            {{ rootUnitStore.unit.name }}
          </p>
          <p class="text-sm text-gray-500 text-sm truncate">
            {{ rootUnitStore.unit.shortName }}
          </p>
        </div>
        <div class="flex-none mt-4">
          <IconButton @click="showSearch = true">
            <SearchIcon class="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </InputGroupTemplate>
    <CreateEmtpyDashed
      v-else
      @click="showSearch = true"
      :icon="$options.components.SearchIcon"
      >Select root unit</CreateEmtpyDashed
    >
    <InputGroup label="Levels" type="number" v-model="options.maxLevels" />
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
    <SearchModal v-model="showSearch" @select-unit="onUnitSelect" />
  </div>
</template>

<script lang="ts">
import InputGroup from "../../components/InputGroup.vue";
import {
  useChartSettingsStore,
  useRootUnitStore,
  useSelectedChartElementStore,
} from "./chartSettingsStore";
import SimpleSelect from "../../components/SimpleSelect.vue";
import { FontStyle, FontWeight, LevelLayout, UnitLevelDistance } from "./orbatchart";
import ToggleField from "../../components/ToggleField.vue";
import { enum2Items } from "../../utils";
import TabView from "../../components/TabView.vue";
import TabItem from "../../components/TabItem.vue";
import { defineAsyncComponent, defineComponent, ref } from "vue";
import MilSymbol from "../../components/MilSymbol.vue";
import InputGroupTemplate from "../../components/InputGroupTemplate.vue";
import IconButton from "../../components/IconButton.vue";
import { SearchIcon } from "@heroicons/vue/solid";
import { useScenarioStore } from "../../stores/scenarioStore";
import CreateEmtpyDashed from "../../components/CreateEmtpyDashed.vue";

export default defineComponent({
  name: "OrbatChartSettingsChart",
  components: {
    CreateEmtpyDashed,
    IconButton,
    InputGroupTemplate,
    MilSymbol,
    TabItem,
    TabView,
    ToggleField,
    SimpleSelect,
    InputGroup,
    SearchIcon,
    SearchModal: defineAsyncComponent(() => import("../../components/SearchModal.vue")),
  },
  props: {},
  setup(props, { emit }) {
    const options = useChartSettingsStore();
    const levelItems = enum2Items(LevelLayout);
    const spacingItems = enum2Items(UnitLevelDistance);
    const fontWeightItems = enum2Items(FontWeight);
    const fontStyleItems = enum2Items(FontStyle);
    const rootUnitStore = useRootUnitStore();
    const scenarioStore = useScenarioStore();
    const showSearch = ref(false);

    const onUnitSelect = (unitId: string) => {
      const unit = scenarioStore.getUnitById(unitId);
      if (unit) rootUnitStore.unit = unit;
    };

    return {
      options,
      levelItems,
      spacingItems,
      fontWeightItems,
      fontStyleItems,
      rootUnitStore,
      showSearch,
      onUnitSelect,
    };
  },
});
</script>
