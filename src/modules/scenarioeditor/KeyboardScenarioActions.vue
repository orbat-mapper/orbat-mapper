<script setup lang="ts">
import { GlobalEvents } from "vue-global-events";
import { computed } from "vue";
import { useUiStore } from "@/stores/uiStore";
import { inputEventFilter } from "@/components/helpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import {
  useActiveUnitStore,
  useSelectedFeatures,
  useSelectedUnits,
} from "@/stores/dragStore";
import { useUnitActions } from "@/composables/scenarioActions";
import { UnitActions } from "@/types/constants";

const activeUnitId = injectStrict(activeUnitKey);
const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);
const uiStore = useUiStore();
const activeUnitStore = useActiveUnitStore();
const { clear: clearSelectedUnits, selectedUnitIds } = useSelectedUnits();
const { clear: clearSelectedFeatures, selectedFeatureIds } = useSelectedFeatures();
const { onUnitAction } = useUnitActions();
const shortcutsEnabled = computed(() => !uiStore.modalOpen);

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
  }
}

function handleZoomShortcut(e: KeyboardEvent) {
  if (selectedUnitIds.value.size) {
    onUnitAction(activeUnit.value, UnitActions.Zoom);
  }
}

function handlePanShortcut(e: KeyboardEvent) {
  if (selectedUnitIds.value.size) {
    onUnitAction(activeUnit.value, UnitActions.Pan);
  }
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
  />
</template>
