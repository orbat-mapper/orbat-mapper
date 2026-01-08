<script setup lang="ts">
import { useSelectedChartElementStore } from "./chartSettingsStore";
import { computed } from "vue";
import PlainButton from "../../components/PlainButton.vue";
import { ChartItemTypes } from "./orbatchart";
import { useChartSettings } from "./composables";
import SettingsUnit from "./SettingsUnit.vue";
import AccordionPanel from "../../components/AccordionPanel.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import SettingsToe from "@/modules/charteditor/SettingsToe.vue";

const currentUnitNode = useSelectedChartElementStore();
const { clearSpecificOptions } = useChartSettings(ChartItemTypes.Unit);

const currentUnit = computed(() => currentUnitNode.node?.unit);
</script>

<template>
  <div class="space-y-4 pb-4">
    <p class="text-muted-foreground text-sm">Unit specific options.</p>
    <div v-if="currentUnit" class="s">
      <header class="flex items-start">
        <div class="h-20 w-16 shrink-0">
          <MilitarySymbol
            :sidc="currentUnit.sidc"
            :size="34"
            :options="currentUnit.symbolOptions"
          />
        </div>
        <div>
          <p class="text-muted-foreground pt-2 font-medium">{{ currentUnit.name }}</p>
          <p class="text-muted-foreground text-sm">{{ currentUnit.shortName }}</p>
        </div>
      </header>
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>
      <AccordionPanel label="Unit settings" default-open>
        <SettingsUnit :item-type="ChartItemTypes.Unit" />
      </AccordionPanel>
      <AccordionPanel label="Equipment and personnel">
        <SettingsToe :item-type="ChartItemTypes.Unit" />
      </AccordionPanel>
    </div>
  </div>
</template>
