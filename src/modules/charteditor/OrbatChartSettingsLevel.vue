<template>
  <div class="pb-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600">Level specific options.</p>
      <PlainButton :disabled="usedOptions.size === 0" @click="clearSpecificOptions()"
        >Clear settings</PlainButton
      >
    </div>
    <div class="mt-4">
      <SimpleSelect label="Level" :items="levelItems" v-model="test"></SimpleSelect>
      <AccordionPanel label="Unit settings" default-open>
        <SettingsUnit :item-type="ChartItemTypes.Level" />
      </AccordionPanel>
      <AccordionPanel label="Layout and spacing">
        <NumberInputGroup
          label="Level padding"
          :model-value="mergedOptions.levelPadding"
          @update:model-value="setValue('levelPadding', $event)"
          :class="!usedOptions.has('levelPadding') && 'sepia-[50%]'"
        />
      </AccordionPanel>
      <AccordionPanel label="Connectors">
        <SettingConnectors :item-type="ChartItemTypes.Level" />
      </AccordionPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useSelectedChartElementStore,
  useSpecificChartOptionsStore,
} from "./chartSettingsStore";
import { computed } from "vue";
import PlainButton from "@/components/PlainButton.vue";
import { ChartItemTypes } from "./orbatchart";
import SettingsUnit from "./SettingsUnit.vue";
import { useChartSettings } from "./composables";
import AccordionPanel from "@/components/AccordionPanel.vue";
import SettingConnectors from "./SettingsConnectors.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { type SelectItem } from "@/components/types";

const selectedElement = useSelectedChartElementStore();
const specificStore = useSpecificChartOptionsStore();
const { clearSpecificOptions, usedOptions, mergedOptions, setValue } = useChartSettings(
  ChartItemTypes.Level
);

const test = computed({
  get() {
    return selectedElement.level ?? 0;
  },
  set(v: number) {
    selectedElement.selectLevel(v);
  },
});

const levelItems = computed((): SelectItem[] => {
  return [...Array(mergedOptions.value.maxLevels)].map((_, i) => {
    const hasOpts = Object.keys(specificStore.level[i] || {}).length > 0;

    return {
      label: hasOpts ? `Level ${i} *` : `Level ${i}`,
      value: i,
    };
  });
});

if (selectedElement.level === null) test.value = 0;
</script>
