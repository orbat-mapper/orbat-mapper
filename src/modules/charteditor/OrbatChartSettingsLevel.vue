<template>
  <div class="pb-4">
    <p class="text-sm text-gray-600">Level specific options.</p>
    <div v-if="currentLevel !== null" class="s">
      <header class="flex items-start">{{ currentLevel }}</header>
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>
      <AccordionPanel label="Unit settings" default-open>
        <SettingsUnit :item-type="ChartItemTypes.Level" />
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

const selectedElement = useSelectedChartElementStore();
const currentLevel = computed(() => selectedElement.level);
const { clearSpecificOptions } = useChartSettings(ChartItemTypes.Level);
</script>
