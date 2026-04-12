<script setup lang="ts">
import { useGeoStore } from "@/stores/geoStore";
import { useScenarioMapSearchActions } from "@/modules/scenarioeditor/useScenarioMapSearchActions";

const geoStore = useGeoStore();

useScenarioMapSearchActions({
  zoomToUnit: (unit) => geoStore.zoomToUnit(unit),
  showLeftPanelOnLayerSelect: true,
  showLeftPanelOnImageLayerSelect: true,
  showLeftPanelOnAddLayer: true,
});
</script>

<template></template>
