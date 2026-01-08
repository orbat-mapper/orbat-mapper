<script setup lang="ts">
import { useSelectedChartElementStore } from "./chartSettingsStore";
import { computed } from "vue";
import PlainButton from "../../components/PlainButton.vue";
import { ChartItemTypes } from "./orbatchart";
import { useChartSettings } from "./composables";
import SettingsUnit from "./SettingsUnit.vue";
import AccordionPanel from "../../components/AccordionPanel.vue";
import SettingConnectors from "./SettingsConnectors.vue";

const selectedElement = useSelectedChartElementStore();
const { clearSpecificOptions } = useChartSettings(ChartItemTypes.Branch);
const currentBranch = computed(() => selectedElement.branch?.parent || null);
</script>

<template>
  <div class="pb-4">
    <p class="text-muted-foreground text-sm">Branch specific options.</p>
    <div v-if="currentBranch !== null" class="mt-4">
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>
      <AccordionPanel label="Unit settings" default-open>
        <SettingsUnit :item-type="ChartItemTypes.Branch" />
      </AccordionPanel>
      <AccordionPanel label="Connectors">
        <SettingConnectors :item-type="ChartItemTypes.Branch" />
      </AccordionPanel>
    </div>
  </div>
</template>
