<template>
  <div class="pb-4">
    <p class="text-sm text-gray-600">Branch specific options.</p>
    <div v-if="currentLevelGroup !== null" class="mt-4">
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>
      <AccordionPanel label="Unit settings" default-open>
        <SettingsUnit :item-type="ChartItemType.LevelGroup" />
      </AccordionPanel>
      <AccordionPanel label="Connectors">
        <SettingConnectors :item-type="ChartItemType.LevelGroup" />
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
import SettingConnectors from "./SettingsConnectors.vue";

export default defineComponent({
  name: "OrbatChartSettingsLevelGroup",
  components: {
    SettingConnectors,
    AccordionPanel,
    SettingsUnit,
    PlainButton,
    MilSymbol,
    ToggleField,
    SimpleSelect,
    InputGroup,
  },
  setup() {
    const selectedElement = useSelectedChartElementStore();
    const { clearSpecificOptions } = useChartSettings(ChartItemType.LevelGroup);
    const currentLevelGroup = computed(() => selectedElement.levelGroup?.parent || null);

    return {
      currentLevelGroup,
      clearSpecificOptions,
      ChartItemType,
    };
  },
});
</script>
