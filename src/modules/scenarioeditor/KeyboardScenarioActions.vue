<script setup lang="ts">
import { GlobalEvents } from "vue-global-events";
import { computed } from "vue";
import { useUiStore } from "@/stores/uiStore";
import { inputEventFilter } from "@/components/helpers";
import { injectStrict } from "@/utils";
import {
  activeScenarioEventKey,
  activeScenarioKey,
  activeUnitKey,
} from "@/components/injects";
import { useActiveUnitStore } from "@/stores/dragStore";
import { useScenarioFeatureActions, useUnitActions } from "@/composables/scenarioActions";
import { UnitActions } from "@/types/constants";
import { useGeoStore, useUnitSettingsStore } from "@/stores/geoStore";
import { useTabStore } from "@/stores/tabStore";
import { useSelectedFeatures, useSelectedUnits } from "@/stores/selectedStore";

const activeUnitId = injectStrict(activeUnitKey);
const activeScenarioEventId = injectStrict(activeScenarioEventKey);
const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);
const uiStore = useUiStore();
const activeUnitStore = useActiveUnitStore();
const { clear: clearSelectedUnits, selectedUnitIds } = useSelectedUnits();
const { clear: clearSelectedFeatures, selectedFeatureIds } = useSelectedFeatures();
const { onUnitAction } = useUnitActions();
const { onFeatureAction } = useScenarioFeatureActions();
const shortcutsEnabled = computed(() => !uiStore.modalOpen);
const tabStore = useTabStore();
const geo = useGeoStore();
const unitSettings = useUnitSettingsStore();

const selectedUnits = computed(() =>
  [...selectedUnitIds.value].map((id) => state.getUnitById(id))
);

const activeUnit = computed(
  () => (activeUnitId.value && state.getUnitById(activeUnitId.value)) || null
);

const createNewUnit = () => {
  activeUnitId.value && unitActions.createSubordinateUnit(activeUnitId.value);
};

const duplicateUnit = () => {
  activeUnitId.value && unitActions.cloneUnit(activeUnitId.value);
};

function handleEscape(e: KeyboardEvent) {
  if (uiStore.escEnabled) {
    clearSelectedUnits();
    activeUnitStore.clearActiveUnit();
    clearSelectedFeatures();
    activeScenarioEventId.value = null;
  }
}

function handleZoomShortcut(e: KeyboardEvent) {
  if (selectedFeatureIds.value.size) {
    const fIds = [...selectedFeatureIds.value];
    onFeatureAction(fIds.length > 1 ? fIds : fIds[0], "zoom");
  } else if (selectedUnitIds.value.size || activeUnit.value) {
    if (selectedUnitIds.value.size > 1) {
      const units = [...selectedUnitIds.value].map((id) => state.getUnitById(id));
      onUnitAction(units, UnitActions.Zoom);
    } else onUnitAction(activeUnit.value, UnitActions.Zoom);
  }
}

function handlePanShortcut(e: KeyboardEvent) {
  if (selectedFeatureIds.value.size) {
    const fIds = [...selectedFeatureIds.value];
    onFeatureAction(fIds.length > 1 ? fIds : fIds[0], "pan");
  } else if (selectedUnitIds.value.size || activeUnit.value) {
    if (selectedUnitIds.value.size > 1) {
      const units = [...selectedUnitIds.value].map((id) => state.getUnitById(id));
      onUnitAction(units, UnitActions.Pan);
    } else onUnitAction(activeUnit.value, UnitActions.Pan);
  }
}

function handleMoveShortcut(e: KeyboardEvent) {
  unitSettings.moveUnitEnabled = !unitSettings.moveUnitEnabled;
}

function handleDelete(e: KeyboardEvent) {
  onUnitAction(selectedUnits.value, UnitActions.Delete);
  onFeatureAction([...selectedFeatureIds.value], "delete");
}
</script>

<template>
  <GlobalEvents
    v-if="shortcutsEnabled"
    :filter="inputEventFilter"
    @keyup.c="createNewUnit"
    @keyup.d="duplicateUnit"
    @keydown.esc="handleEscape"
    @keyup.z.exact="handleZoomShortcut"
    @keyup.p="handlePanShortcut"
    @keyup.m="handleMoveShortcut"
    @keyup.delete="handleDelete"
  />
</template>
