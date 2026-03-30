<script setup lang="ts">
import { useSelectedItems } from "@/stores/selectedStore";
import ScenarioFeatureDetails from "@/modules/scenarioeditor/ScenarioFeatureDetails.vue";
import UnitDetails from "@/modules/scenarioeditor/UnitDetails.vue";
import ScenarioEventDetails from "@/modules/scenarioeditor/ScenarioEventDetails.vue";
import ScenarioMapLayerDetails from "@/modules/scenarioeditor/ScenarioMapLayerDetails.vue";
import ScenarioInfoPanel from "@/modules/scenarioeditor/ScenarioInfoPanel.vue";

const {
  selectedFeatureIds,
  selectedUnitIds,
  activeUnitId,
  activeScenarioEventId,
  activeMapLayerId,
  activeDetailsPanel,
} = useSelectedItems();
</script>

<template>
  <ScenarioFeatureDetails
    v-if="activeDetailsPanel === 'feature'"
    :selected-ids="selectedFeatureIds"
  />
  <UnitDetails
    v-else-if="activeDetailsPanel === 'unit'"
    :unit-id="activeUnitId || [...selectedUnitIds][0]"
  />
  <ScenarioEventDetails
    v-else-if="activeDetailsPanel === 'event'"
    :event-id="activeScenarioEventId!"
  />
  <ScenarioMapLayerDetails
    v-else-if="activeDetailsPanel === 'mapLayer'"
    :layer-id="activeMapLayerId!"
  />
  <ScenarioInfoPanel v-else-if="activeDetailsPanel === 'scenario'" />
  <div v-else class="text-muted-foreground text-sm">
    <p>Select a unit, feature, or event to see details.</p>
  </div>
</template>
