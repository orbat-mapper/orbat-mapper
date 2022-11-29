<template>
  <div class="pb-4">
    <p class="text-sm text-gray-600">Branch specific options.</p>
    <div v-if="currentBranch !== null" class="mt-4">
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>
      <AccordionPanel label="Unit settings" default-open>
        <SettingsUnit :item-type="ChartItemType.Branch" />
      </AccordionPanel>
      <AccordionPanel label="Connectors">
        <SettingConnectors :item-type="ChartItemType.Branch" />
      </AccordionPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSelectedChartElementStore } from "./chartSettingsStore";
import { computed } from "vue";
import PlainButton from "../../components/PlainButton.vue";
import { ChartItemType } from "./orbatchart";
import { useChartSettings } from "./composables";
import SettingsUnit from "./SettingsUnit.vue";
import AccordionPanel from "../../components/AccordionPanel.vue";
import SettingConnectors from "./SettingsConnectors.vue";

const selectedElement = useSelectedChartElementStore();
const { clearSpecificOptions } = useChartSettings(ChartItemType.Branch);
const currentBranch = computed(() => selectedElement.branch?.parent || null);
</script>
