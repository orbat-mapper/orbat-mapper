<template>
  <div class="pb-4">
    <p class="text-sm text-gray-600">Level specific options.</p>
    <div v-if="currentLevel !== null" class="space-y-6">
      <header class="flex items-start">{{ currentLevel }}</header>
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>
      <AccordionPanel label="Unit settings" default-open>
        <SettingsUnit :item-type="ChartItemType.Level" />
      </AccordionPanel>
    </div>
  </div>
</template>

<script lang="ts">
import { useSelectedChartElementStore } from "./chartSettingsStore";
import { computed, defineComponent } from "vue";
import PlainButton from "../../components/PlainButton.vue";
import { ChartItemType } from "./orbatchart";
import SettingsUnit from "./SettingsUnit.vue";
import { useChartSettings } from "./composables";
import AccordionPanel from "../../components/AccordionPanel.vue";

export default defineComponent({
  name: "OrbatChartSettingsLevel",
  components: {
    AccordionPanel,
    SettingsUnit,
    PlainButton,
  },
  setup() {
    const selectedElement = useSelectedChartElementStore();
    const currentLevel = computed(() => selectedElement.level);
    const { clearSpecificOptions } = useChartSettings(ChartItemType.Level);

    return {
      currentLevel,
      ChartItemType,
      clearSpecificOptions,
    };
  },
});
</script>
