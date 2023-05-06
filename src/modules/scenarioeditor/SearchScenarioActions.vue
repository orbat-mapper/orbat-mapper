<script setup lang="ts">
import { nextTick, onMounted } from "vue";
import { useSearchActions } from "@/composables/search";
import { TAB_LAYERS, TAB_ORBAT } from "@/types/constants";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";
import { injectStrict } from "@/utils";
import { activeMapKey, activeScenarioKey, activeUnitKey } from "@/components/injects";
import { useUiStore } from "@/stores/uiStore";
import { useSelectedFeatures, useSelectedUnits } from "@/stores/dragStore";

const mapRef = injectStrict(activeMapKey);
const activeUnitId = injectStrict(activeUnitKey);
const activeScenario = injectStrict(activeScenarioKey);
const l = useScenarioLayers(mapRef.value);

const { onUnitSelect, onFeatureSelect, onLayerSelect } = useSearchActions();
const ui = useUiStore();
const { selectedFeatureIds } = useSelectedFeatures();
const { selectedUnitIds } = useSelectedUnits();

onUnitSelect(({ unitId }) => {
  ui.activeTabIndex = TAB_ORBAT;
  activeUnitId.value = unitId;
  selectedUnitIds.value.clear();
  selectedUnitIds.value.add(unitId);
  const { parents } = activeScenario.unitActions.getUnitHierarchy(unitId);
  parents.forEach((p) => (p._isOpen = true));
  nextTick(() => {
    const el = document.getElementById(`o-${unitId}`);
    if (el) {
      el.scrollIntoView();
    }
  });
});

onLayerSelect(({ layerId }) => {
  if (!mapRef.value) return;
  ui.activeTabIndex = TAB_LAYERS;
  nextTick(() => {
    const layer = l.getLayerById(layerId);
    if (layer) {
      layer._isOpen = true;
      l.zoomToLayer(layerId);
    }
  });
});

onFeatureSelect(({ featureId }) => {
  ui.activeTabIndex = TAB_LAYERS;
});
</script>
<template></template>
