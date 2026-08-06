<script setup lang="ts">
import { GlobalEvents } from "vue-global-events";
import { computed, inject } from "vue";
import { useUiStore } from "@/stores/uiStore";
import { inputEventFilter } from "@/components/helpers";
import { injectStrict } from "@/utils";
import {
  activeScenarioKey,
  routeDetailsPanelKey,
  scenarioKeyboardOwnerKey,
  searchActionsKey,
} from "@/components/injects";
import { useActiveUnitStore } from "@/stores/dragStore";
import { useScenarioFeatureActions, useUnitActions } from "@/composables/scenarioActions";
import { UnitActions } from "@/types/constants";
import type { FeatureId } from "@/types/scenarioGeoModels";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useSelectedWaypoints } from "@/stores/selectedWaypoints";
import { usePlaybackStore } from "@/stores/playbackStore";
import { useRecordingStore } from "@/stores/recordingStore";

const activeScenario = injectStrict(activeScenarioKey);
const {
  unitActions,
  store: { state },
  helpers: { getUnitById },
} = activeScenario;
const { onUnitSelectHook } = injectStrict(searchActionsKey);
const routeDetailsPanel = inject(routeDetailsPanelKey, null);
// The armed-tool owner gets first refusal on Escape and Enter, the same shape the route
// details panel already uses. Three separate non-propagation-stopping Escape listeners
// collapsed onto it (ADR-0006); unarmed, it returns false and nothing changes.
const scenarioKeyboardOwner = inject(scenarioKeyboardOwnerKey, null);
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
const shortcutsEnabled = computed(() => !uiStore.modalOpen);
const unitSettings = useUnitSettingsStore();
const playback = usePlaybackStore();
const recordingStore = useRecordingStore();
const { selectedWaypointIds } = useSelectedWaypoints();
// Resolve map-dependent utils (zoom/pan) lazily so that engine-agnostic actions
// like delete work regardless of the active map engine (OpenLayers or MapLibre).
const featureActions = useScenarioFeatureActions({ activeScenario });

const selectedUnits = computed(() =>
  [...selectedUnitIds.value].map((id) => getUnitById(id)),
);

const activeUnit = computed(
  () => (activeUnitId.value && getUnitById(activeUnitId.value)) || null,
);

function onFeatureAction(
  featureOrFeaturesId: FeatureId | FeatureId[],
  action: "zoom" | "pan" | "delete" | string,
) {
  featureActions.onFeatureAction(featureOrFeaturesId, action);
}

const createNewUnit = () => {
  activeUnitId.value && unitActions.createSubordinateUnit(activeUnitId.value);
};

const duplicateUnit = () => {
  activeUnitId.value && unitActions.cloneUnit(activeUnitId.value);
};

// The owner's first refusal for the *plain* tools only. A control-measure session is
// already gone by the time this runs: `useScenarioDraw` takes Escape in the capture
// phase on `window`, because this handler is skipped on three conditions
// (`shortcutsEnabled`, `escEnabled`, a Reka target) in which tactical-draw's own window
// listener would otherwise abort an open edit and discard its work.
function handleEscape(e: KeyboardEvent) {
  if (uiStore.escEnabled) {
    if (isRekaComponent(e)) return;
    if (scenarioKeyboardOwner?.value?.handleEscape(e)) return;
    if (routeDetailsPanel?.handleEscape()) return;
    clearSelected();
    activeUnitStore.clearActiveUnit();
    activeScenarioEventId.value = null;
  }
}

function handleEnter(e: KeyboardEvent) {
  scenarioKeyboardOwner?.value?.handleEnter(e);
}

function isRekaComponent(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  if (!target) return false;
  return (
    isTargetReka(target) || (target.parentElement && isTargetReka(target.parentElement))
  );
}

function isTargetReka(target: HTMLElement) {
  return (
    (target?.id && (target.id.includes("dropdown") || target.id.includes("popover"))) ||
    ["dropdown", "context-menu", "popover", "select"].some((type) =>
      target.dataset?.slot?.includes(type),
    )
  );
}

function handleZoomShortcut(e: KeyboardEvent) {
  if (selectedFeatureIds.value.size) {
    const fIds = [...selectedFeatureIds.value];
    onFeatureAction(fIds.length > 1 ? fIds : fIds[0], "zoom");
  } else if (selectedUnitIds.value.size || activeUnit.value) {
    if (selectedUnitIds.value.size > 1) {
      const units = [...selectedUnitIds.value].map((id) => getUnitById(id));
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
      const units = [...selectedUnitIds.value].map((id) => getUnitById(id));
      onUnitAction(units, UnitActions.Pan);
    } else onUnitAction(activeUnit.value, UnitActions.Pan);
  }
}

function handleMoveShortcut(e: KeyboardEvent) {
  if (!recordingStore.isRecordingLocation) return;
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

function handleLocate(e: KeyboardEvent) {
  if (activeUnit.value) {
    onUnitSelectHook.trigger({ unitId: activeUnit.value.id, options: { noZoom: true } });
  }
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
    @keydown.enter.exact="handleEnter"
    @keydown.z.exact="handleZoomShortcut"
    @keydown.p.exact="handlePanShortcut"
    @keydown.alt.p.exact="handlePlaybackShortcut"
    @keydown.k.exact="handlePlaybackShortcut"
    @keydown.m.exact="handleMoveShortcut"
    @keydown.delete.exact="handleDelete"
    @keydown.l.exact="handleLocate"
    @keydown="handleSpecialKeys"
  />
</template>
