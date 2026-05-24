<script setup lang="ts">
import { computed } from "vue";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { useSelectedItems } from "@/stores/selectedStore";
import ScenarioFeatureDetails from "@/modules/scenarioeditor/ScenarioFeatureDetails.vue";
import ScenarioAnnotationDetails from "@/modules/scenarioeditor/ScenarioAnnotationDetails.vue";
import UnitDetails from "@/modules/scenarioeditor/UnitDetails.vue";
import ScenarioEventDetails from "@/modules/scenarioeditor/ScenarioEventDetails.vue";
import ScenarioMapLayerDetails from "@/modules/scenarioeditor/ScenarioMapLayerDetails.vue";
import ScenarioInfoPanel from "@/modules/scenarioeditor/ScenarioInfoPanel.vue";
import ReferenceFeatureDetails from "@/modules/scenarioeditor/ReferenceFeatureDetails.vue";
import MapEditorRouteContent from "@/modules/scenarioeditor/MapEditorRouteContent.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { routeDetailsPanelKey } from "@/components/injects";

const props = defineProps<{
  contentClass?: string;
}>();

const {
  selectedFeatureIds,
  selectedUnitIds,
  activeUnitId,
  activeScenarioEventId,
  activeMapLayerId,
  activeReferenceFeature,
  activeDetailsPanel,
} = useSelectedItems();
const toolbarStore = useMainToolbarStore();
const routeDetailsPanel = injectStrict(routeDetailsPanelKey);
const showRouteContent = computed(() => toolbarStore.currentToolbar === "route");
const activeScenario = injectStrict(activeScenarioKey);
const selectedFeatureKind = computed(() => {
  const firstSelectedId = selectedFeatureIds.value.values().next().value;
  if (!firstSelectedId) return undefined;
  return activeScenario.geo.getLayerItemById(firstSelectedId).layerItem?.kind;
});
</script>

<template>
  <MapEditorRouteContent
    v-if="showRouteContent"
    :active-unit-name="routeDetailsPanel.activeRoutingUnitName.value"
    :class="props.contentClass"
    @add-leg="routeDetailsPanel.addRouteLeg()"
    @clear-current-leg="routeDetailsPanel.clearCurrentLeg()"
    @finish="routeDetailsPanel.finishRoute()"
    @end-drawing="routeDetailsPanel.endRouting()"
  />
  <ScenarioAnnotationDetails
    v-else-if="activeDetailsPanel === 'feature' && selectedFeatureKind === 'annotation'"
    :selected-ids="selectedFeatureIds"
    :class="props.contentClass"
  />
  <ScenarioFeatureDetails
    v-else-if="activeDetailsPanel === 'feature'"
    :selected-ids="selectedFeatureIds"
    :class="props.contentClass"
  />
  <UnitDetails
    v-else-if="activeDetailsPanel === 'unit'"
    :unit-id="activeUnitId || [...selectedUnitIds][0]"
    :class="props.contentClass"
  />
  <ScenarioEventDetails
    v-else-if="activeDetailsPanel === 'event'"
    :event-id="activeScenarioEventId!"
    :class="props.contentClass"
  />
  <ReferenceFeatureDetails
    v-else-if="activeDetailsPanel === 'referenceFeature'"
    :feature="activeReferenceFeature!"
    :class="props.contentClass"
  />
  <ScenarioMapLayerDetails
    v-else-if="activeDetailsPanel === 'mapLayer'"
    :layer-id="activeMapLayerId!"
    :class="props.contentClass"
  />
  <ScenarioInfoPanel
    v-else-if="activeDetailsPanel === 'scenario'"
    :class="props.contentClass"
  />
  <div v-else :class="[props.contentClass, 'text-muted-foreground text-sm']">
    <p>Select a unit, feature, layer, or event to see details.</p>
  </div>
</template>
