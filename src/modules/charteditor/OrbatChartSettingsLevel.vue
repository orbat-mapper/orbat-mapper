<template>
  <div class="pb-4">
    <p class="text-sm text-gray-600">Level specific options.</p>
    <div v-if="currentLevel !== null" class="s">
      <header class="flex items-start">{{ currentLevel }}</header>
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>
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
        <!--      <NumberInputGroup label="Tree offset" v-model="options.treeOffset" />-->
        <!--      <NumberInputGroup label="Stacked offset" v-model="options.stackedOffset" />-->
        <!--      <SimpleSelect-->
        <!--        label="Last level layout"-->
        <!--        v-model="options.lastLevelLayout"-->
        <!--        :items="levelItems"-->
        <!--      />-->
        <!--      <SimpleSelect-->
        <!--        label="Unit spacing"-->
        <!--        v-model="options.unitLevelDistance"-->
        <!--        :items="spacingItems"-->
        <!--      />-->
      </AccordionPanel>
      <AccordionPanel label="Connectors">
        <SettingConnectors :item-type="ChartItemTypes.Level" />
      </AccordionPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSelectedChartElementStore } from "./chartSettingsStore";
import { computed } from "vue";
import PlainButton from "../../components/PlainButton.vue";
import { ChartItemTypes } from "./orbatchart";
import SettingsUnit from "./SettingsUnit.vue";
import { useChartSettings } from "./composables";
import AccordionPanel from "../../components/AccordionPanel.vue";
import SettingConnectors from "./SettingsConnectors.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";

const selectedElement = useSelectedChartElementStore();
const currentLevel = computed(() => selectedElement.level);
const { clearSpecificOptions, usedOptions, mergedOptions, setValue } = useChartSettings(
  ChartItemTypes.Level
);
</script>
