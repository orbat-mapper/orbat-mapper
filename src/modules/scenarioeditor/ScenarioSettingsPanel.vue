<script setup lang="ts">
import AccordionPanel from "@/components/AccordionPanel.vue";
import LinkButton from "@/components/LinkButton.vue";
import { useSelectedItems } from "@/stores/selectedStore";
import ScenarioInfoGroups from "@/modules/scenarioeditor/ScenarioInfoGroups.vue";
import ScenarioInfoPersonnel from "@/modules/scenarioeditor/ScenarioInfoPersonnel.vue";
import ScenarioInfoEquipment from "@/modules/scenarioeditor/ScenarioInfoEquipment.vue";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";
import ScenarioInfoUnitStatuses from "@/modules/scenarioeditor/ScenarioInfoUnitStatuses.vue";
import ScenarioMapSettings from "@/modules/scenarioeditor/ScenarioMapSettings.vue";
import PanelHeading from "@/components/PanelHeading.vue";
import HeadingDescription from "@/components/HeadingDescription.vue";
import ScenarioInfoSupplies from "@/modules/scenarioeditor/ScenarioInfoSupplies.vue";
import ScenarioInfoSupplyClasses from "@/modules/scenarioeditor/ScenarioInfoSupplyClasses.vue";
import ScenarioInfoSupplyUnits from "@/modules/scenarioeditor/ScenarioInfoSupplyUnits.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import ScenarioSymbolColorSettings from "@/modules/scenarioeditor/ScenarioSymbolColorSettings.vue";
import ScenarioCustomSymbolSettings from "@/modules/scenarioeditor/ScenarioCustomSymbolSettings.vue";

const {
  store: { onUndoRedo, state },
} = injectStrict(activeScenarioKey);

onUndoRedo(() => {
  state.settingsStateCounter++;
});

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
    <PanelHeading>Scenario settings</PanelHeading>
    <HeadingDescription>
      Scenario settings are saved as part of the scenario.
    </HeadingDescription>
    <AccordionPanel
      label="Equipment categories"
      :key="scenarioInfoPanelStore.tabIndex + 20"
      :defaultOpen="scenarioInfoPanelStore.tabIndex === 1"
    >
      <ScenarioInfoEquipment class="relative" />
    </AccordionPanel>
    <AccordionPanel
      label="Personnel categories"
      :key="scenarioInfoPanelStore.tabIndex + 40"
      :defaultOpen="scenarioInfoPanelStore.tabIndex === 2"
    >
      <ScenarioInfoPersonnel class="relative" />
    </AccordionPanel>
    <AccordionPanel
      label="Supply categories"
      :key="scenarioInfoPanelStore.tabIndex + 50"
      :defaultOpen="scenarioInfoPanelStore.tabIndex === 3"
    >
      <ScenarioInfoSupplies class="relative" />
    </AccordionPanel>
    <AccordionPanel label="Supply classes">
      <ScenarioInfoSupplyClasses />
    </AccordionPanel>
    <AccordionPanel label="Supply unit of measure/issue">
      <ScenarioInfoSupplyUnits />
    </AccordionPanel>

    <AccordionPanel
      label="Sensor groups"
      :key="scenarioInfoPanelStore.tabIndex + 60"
      :defaultOpen="scenarioInfoPanelStore.tabIndex === 4"
    >
      <ScenarioInfoGroups />
    </AccordionPanel>
    <AccordionPanel label="Unit templates"> </AccordionPanel>
    <AccordionPanel label="Unit statuses">
      <ScenarioInfoUnitStatuses />
    </AccordionPanel>
    <AccordionPanel label="Map settings">
      <ScenarioMapSettings />
    </AccordionPanel>
    <AccordionPanel label="Symbol fill colors">
      <ScenarioSymbolColorSettings />
    </AccordionPanel>
    <AccordionPanel label="Custom unit symbols">
      <ScenarioCustomSymbolSettings />
    </AccordionPanel>
  </div>
</template>
