<script setup lang="ts">
import { GlobalEvents } from "vue-global-events";
import { computed } from "vue";
import { useUiStore } from "@/stores/uiStore";
import { inputEventFilter } from "@/components/helpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useActiveUnitStore } from "@/stores/dragStore";
import { useScenarioFeatureActions, useUnitActions } from "@/composables/scenarioActions";
import { UnitActions } from "@/types/constants";
import { useGeoStore, useUnitSettingsStore } from "@/stores/geoStore";
import { useTabStore } from "@/stores/tabStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useSelectedWaypoints } from "@/stores/selectedWaypoints";
import { usePlaybackStore } from "@/stores/playbackStore";

const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);
const uiStore = useUiStore();
const activeUnitStore = useActiveUnitStore();
const {
  clear: clearSelected,
  selectedUnitIds,
  selectedFeatureIds,
  activeUnitId,
  activeScenarioEventId,
} = useSelectedItems();
const { onUnitAction } = useUnitActions();
const { onFeatureAction } = useScenarioFeatureActions();
const shortcutsEnabled = computed(() => !uiStore.modalOpen);
const unitSettings = useUnitSettingsStore();
const playback = usePlaybackStore();
const { selectedWaypointIds } = useSelectedWaypoints();

const selectedUnits = computed(() =>
  [...selectedUnitIds.value].map((id) => state.getUnitById(id)),
);

const activeUnit = computed(
  () => (activeUnitId.value && state.getUnitById(activeUnitId.value)) || null,
);

const createNewUnit = () => {
  activeUnitId.value && unitActions.createSubordinateUnit(activeUnitId.value);
};

const duplicateUnit = () => {
  activeUnitId.value && unitActions.cloneUnit(activeUnitId.value);
};

function handleEscape(e: KeyboardEvent) {
  if (uiStore.escEnabled) {
    clearSelected();
    activeUnitStore.clearActiveUnit();
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
  if (selectedWaypointIds.value.size) {
    const wIds = [...selectedWaypointIds.value];
    onUnitAction(selectedUnits.value, UnitActions.DeleteWaypoints, wIds);
    return;
  }
  onUnitAction(selectedUnits.value, UnitActions.ClearStateOrDelete);
  onFeatureAction([...selectedFeatureIds.value], "delete");
}

function handlePlaybackShortcut(e: KeyboardEvent) {
  playback.togglePlayback();
}

function handleSpecialKeys(e: KeyboardEvent) {
  if (e.key === "<") {
    playback.decreaseSpeed();
  } else if (e.key === ">") {
    playback.increaseSpeed();
  }
}
</script>

<template>
  <GlobalEvents
    v-if="shortcutsEnabled"
    :filter="inputEventFilter"
    @keydown.c.exact="createNewUnit"
    @keydown.d.exact="duplicateUnit"
    @keydown.esc="handleEscape"
    @keydown.z.exact="handleZoomShortcut"
    @keydown.p.exact="handlePanShortcut"
    @keydown.alt.p.exact="handlePlaybackShortcut"
    @keydown.k.exact="handlePlaybackShortcut"
    @keydown.m.exact="handleMoveShortcut"
    @keydown.delete.exact="handleDelete"
    @keydown="handleSpecialKeys"
  />
</template>
