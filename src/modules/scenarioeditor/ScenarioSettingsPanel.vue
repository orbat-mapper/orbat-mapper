<script setup lang="ts">
import AccordionPanel from "@/components/AccordionPanel.vue";
import LinkButton from "@/components/LinkButton.vue";
import { useSelectedItems } from "@/stores/selectedStore";
import ScenarioInfoGroups from "@/modules/scenarioeditor/ScenarioInfoGroups.vue";
import ScenarioInfoPersonnel from "@/modules/scenarioeditor/ScenarioInfoPersonnel.vue";
import ScenarioInfoEquipment from "@/modules/scenarioeditor/ScenarioInfoEquipment.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";

const selectedItems = useSelectedItems();
const scenarioInfoPanelStore = useScenarioInfoPanelStore();

function showScenarioInfo() {
  selectedItems.clear();
  selectedItems.showScenarioInfo.value = true;
}
</script>

<template>
  <div>
    <header class="flex items-center justify-between">
      <p></p>
      <LinkButton @click="showScenarioInfo()"
        >View scenario description <span aria-hidden="true"> &rarr;</span></LinkButton
      >
    </header>
    <AccordionPanel
      label="Equipment categories"
      :key="scenarioInfoPanelStore.tabIndex + 20"
      :defaultOpen="scenarioInfoPanelStore.tabIndex === 1"
    >
      <ScenarioInfoEquipment />
    </AccordionPanel>
    <AccordionPanel
      label="Personnel categories"
      :key="scenarioInfoPanelStore.tabIndex + 40"
      :defaultOpen="scenarioInfoPanelStore.tabIndex === 2"
    >
      <ScenarioInfoPersonnel />
    </AccordionPanel>
    <AccordionPanel
      label="Sensor groups"
      :key="scenarioInfoPanelStore.tabIndex + 50"
      :defaultOpen="scenarioInfoPanelStore.tabIndex === 3"
    >
      <ScenarioInfoGroups />
    </AccordionPanel>
  </div>
</template>
