<template>
  <div class="space-y-4 pb-4">
    <p class="text-sm text-gray-600">Unit specific options.</p>
    <div v-if="currentUnit" class="s">
      <header class="flex items-start">
        <div class="h-20 w-16 flex-shrink-0">
          <MilSymbol :sidc="currentUnit.sidc" :size="34" />
        </div>
        <div>
          <p class="pt-2 font-medium text-gray-700">{{ currentUnit.name }}</p>
          <p class="text-sm text-gray-500">{{ currentUnit.shortName }}</p>
        </div>
      </header>
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>
      <AccordionPanel label="Unit settings" default-open>
        <SettingsUnit :item-type="ChartItemTypes.Unit" />
      </AccordionPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSelectedChartElementStore } from "./chartSettingsStore";
import { computed } from "vue";
import MilSymbol from "../../components/MilSymbol.vue";
import PlainButton from "../../components/PlainButton.vue";
import { ChartItemTypes } from "./orbatchart";
import { useChartSettings } from "./composables";
import SettingsUnit from "./SettingsUnit.vue";
import AccordionPanel from "../../components/AccordionPanel.vue";

const currentUnitNode = useSelectedChartElementStore();
const { clearSpecificOptions } = useChartSettings(ChartItemTypes.Unit);

const currentUnit = computed(() => currentUnitNode.node?.unit);
</script>
