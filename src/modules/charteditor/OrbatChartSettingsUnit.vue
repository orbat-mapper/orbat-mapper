<template>
  <div class="space-y-4 pb-4">
    <p class="text-sm text-gray-600">Unit specific options.</p>
    <div v-if="currentUnit" class="s">
      <header class="flex items-start">
        <div class="flex-shrink-0 w-16 h-20">
          <MilSymbol :sidc="currentUnit.sidc" :size="34" />
        </div>
        <div>
          <p class="font-medium text-gray-700 pt-2">{{ currentUnit.name }}</p>
          <p class="text-sm text-gray-500">{{ currentUnit.shortName }}</p>
        </div>
      </header>
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>
      <AccordionPanel label="Unit settings" default-open>
        <SettingsUnit :item-type="ChartItemType.Unit" />
      </AccordionPanel>
    </div>
  </div>
</template>

<script lang="ts">
import InputGroup from "../../components/InputGroup.vue";
import { useSelectedChartElementStore } from "./chartSettingsStore";
import SimpleSelect from "../../components/SimpleSelect.vue";
import ToggleField from "../../components/ToggleField.vue";
import { computed, defineComponent } from "vue";
import MilSymbol from "../../components/MilSymbol.vue";
import PlainButton from "../../components/PlainButton.vue";
import { ChartItemType } from "./orbatchart";
import { useChartSettings } from "./composables";
import SettingsUnit from "./SettingsUnit.vue";
import AccordionPanel from "../../components/AccordionPanel.vue";

export default defineComponent({
  name: "OrbatChartSettingsUnit",
  components: {
    AccordionPanel,
    SettingsUnit,
    PlainButton,
    MilSymbol,
    ToggleField,
    SimpleSelect,
    InputGroup,
  },
  setup() {
    const currentUnitNode = useSelectedChartElementStore();
    const { clearSpecificOptions } = useChartSettings(ChartItemType.Unit);

    const currentUnit = computed(() => currentUnitNode.node?.unit);

    return {
      currentUnit,
      ChartItemType,

      clearSpecificOptions,
    };
  },
});
</script>
