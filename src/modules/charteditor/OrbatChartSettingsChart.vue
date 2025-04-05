<template>
  <div>
    <p class="text-sm text-gray-600">Settings that affect the whole chart.</p>
    <template v-if="!chartMode">
      <InputGroupTemplate label="Root unit" v-if="rootUnitStore.unit" class="my-4">
        <div class="flex items-start">
          <div class="mt-2 w-16 shrink-0">
            <MilSymbol
              :sidc="rootUnitStore.unit.sidc"
              :size="30"
              :modifiers="rootUnitStore.unit.symbolOptions"
            />
          </div>
          <div class="min-w-0 flex-auto">
            <p class="truncate pt-2 text-sm font-medium text-gray-700">
              {{ rootUnitStore.unit.name }}
            </p>
            <p class="truncate text-sm text-gray-500">
              {{ rootUnitStore.unit.shortName }}
            </p>
          </div>
          <div class="mt-4 flex-none">
            <IconButton @click="showSearch = true">
              <SearchIcon class="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </InputGroupTemplate>

      <CreateEmtpyDashed
        v-else
        @click="showSearch = true"
        :icon="$options.components?.SearchIcon"
        >Select root unit
      </CreateEmtpyDashed>
    </template>
    <NumberInputGroup label="Levels" type="number" v-model="options.maxLevels" />
    <div class="mt-4 w-full border-t border-gray-200" />
    <AccordionPanel label="Page settings">
      <SimpleSelect
        v-model="options.paperSize"
        label="Page size"
        :items="canvasSizeItems"
      />
    </AccordionPanel>
    <AccordionPanel label="Layout and spacing">
      <NumberInputGroup label="Level padding" v-model="options.levelPadding" />
      <NumberInputGroup label="Tree offset" v-model="options.treeOffset" />
      <NumberInputGroup label="Stacked offset" v-model="options.stackedOffset" />
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
    </AccordionPanel>

    <AccordionPanel label="Unit settings">
      <NumberInputGroup label="Symbol size" v-model="options.symbolSize" />
      <NumberInputGroup label="Font size" v-model="options.fontSize" />
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
      <NumberInputGroup label="Label offset" v-model="options.labelOffset" />
      <SimpleSelect
        label="Label placement"
        v-model="options.labelPlacement"
        :items="labelPlacementItems"
      />
      <InputGroup label="Font color" type="color" v-model="options.fontColor" />
      <ToggleField v-model="options.useShortName">Use short unit names</ToggleField>
      <ToggleField v-model="options.hideLabel">Hide label</ToggleField>
    </AccordionPanel>
    <AccordionPanel label="Connectors">
      <NumberInputGroup label="Connector offset" v-model="options.connectorOffset" />
      <InputGroup label="Line width" type="number" v-model="options.lineWidth" />
      <InputGroup label="Line color" type="color" v-model="options.lineColor" />
    </AccordionPanel>
    <AccordionPanel label="Equipment and personnel">
      <SettingsToe item-type="chart" />
    </AccordionPanel>

    <SearchModal v-model="showSearch" @select-unit="onUnitSelect" />
  </div>
</template>

<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { useChartSettingsStore, useRootUnitStore } from "./chartSettingsStore";
import SimpleSelect from "@/components/SimpleSelect.vue";
import {
  FontStyles,
  FontWeights,
  LabelPlacements,
  LevelLayouts,
  UnitLevelDistances,
} from "./orbatchart";
import ToggleField from "@/components/ToggleField.vue";
import { enum2Items, injectStrict } from "@/utils";
import { defineAsyncComponent, ref } from "vue";
import MilSymbol from "@/components/MilSymbol.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import IconButton from "@/components/IconButton.vue";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/vue/24/solid";
import CreateEmtpyDashed from "@/components/CreateEmtpyDashed.vue";
import { canvasSizeItems } from "./orbatchart/sizes";
import AccordionPanel from "@/components/AccordionPanel.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { activeScenarioKey } from "@/components/injects";
import SettingsToe from "@/modules/charteditor/SettingsToe.vue";

const props = defineProps({ chartMode: { type: Boolean, default: false } });

const SearchModal = defineAsyncComponent(() => import("@/components/SearchModal.vue"));

const {
  unitActions: { expandUnitWithSymbolOptions, getUnitById },
} = injectStrict(activeScenarioKey);

const options = useChartSettingsStore();
const levelItems = enum2Items(LevelLayouts);
const spacingItems = enum2Items(UnitLevelDistances);
const fontWeightItems = enum2Items(FontWeights);
const fontStyleItems = enum2Items(FontStyles);
const labelPlacementItems = enum2Items(LabelPlacements);
const rootUnitStore = useRootUnitStore();
const showSearch = ref(false);

const onUnitSelect = (unitId: string) => {
  const unit = expandUnitWithSymbolOptions(getUnitById(unitId));
  if (unit) rootUnitStore.unit = unit;
};
</script>
