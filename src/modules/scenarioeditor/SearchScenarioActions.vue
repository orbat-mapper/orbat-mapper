<script setup lang="ts">
import { nextTick } from "vue";
import { useSearchActions } from "@/composables/searchActions";
import { TAB_LAYERS, TAB_ORBAT, UnitActions } from "@/types/constants";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";
import { injectStrict } from "@/utils";
import { activeMapKey, activeScenarioKey, activeUnitKey } from "@/components/injects";
import { useUiStore } from "@/stores/uiStore";
import { useSelectedFeatures, useSelectedUnits } from "@/stores/dragStore";
import { useUnitActions } from "@/composables/scenarioActions";

const mapRef = injectStrict(activeMapKey);
const activeUnitId = injectStrict(activeUnitKey);
const activeScenario = injectStrict(activeScenarioKey);
const l = useScenarioLayers(mapRef.value);

const { onUnitSelect, onFeatureSelect, onLayerSelect, onEventSelect } =
  useSearchActions();
const ui = useUiStore();
const { selectedFeatureIds } = useSelectedFeatures();
const { selectedUnitIds } = useSelectedUnits();
const { onUnitAction } = useUnitActions();

onUnitSelect(({ unitId }) => {
  ui.activeTabIndex = TAB_ORBAT;
  activeUnitId.value = unitId;
  selectedUnitIds.value.clear();
  selectedUnitIds.value.add(unitId);
  const unit = activeScenario.unitActions.getUnitById(unitId);
  const { parents } = activeScenario.unitActions.getUnitHierarchy(unitId);
  parents.forEach((p) => (p._isOpen = true));
  nextTick(() => {
    const el = document.getElementById(`o-${unitId}`);
    if (el) {
      el.scrollIntoView();
    }
    onUnitAction(unit, UnitActions.Zoom);
  });
});

onLayerSelect(({ layerId }) => {
  if (!mapRef.value) return;
  ui.activeTabIndex = TAB_LAYERS;
  nextTick(() => {
    const layer = l.getLayerById(layerId);
    if (layer) {
      layer._isOpen = true;
      nextTick(() => l.zoomToLayer(layerId));
    }
  });
});

onFeatureSelect(({ featureId }) => {
  ui.activeTabIndex = TAB_LAYERS;
  const { feature, layer } = activeScenario.geo.getFeatureById(featureId);
  nextTick(() => {
    if (layer) {
      layer._isOpen = true;
    }
    if (feature) {
      selectedUnitIds.value.clear();
      selectedFeatureIds.value.clear();
      selectedFeatureIds.value.add(featureId);

      nextTick(() => l.zoomToFeature(featureId));
    }
  });
});

onEventSelect((e) => {
  activeScenario.time.setCurrentTime(e.startTime);
});
</script>
<template></template>
