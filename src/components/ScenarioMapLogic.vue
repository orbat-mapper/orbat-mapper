<script setup lang="ts">
import OLMap from "ol/Map";

import { computed, onUnmounted, shallowRef, watch } from "vue";
import Select from "ol/interaction/Select";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { ScenarioLayerController } from "@/geo/contracts/scenarioLayerController";
import { useUiStore } from "@/stores/uiStore";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import {
  useGeoStore,
  useMeasurementsStore,
  useUnitSettingsStore,
} from "@/stores/geoStore";
import { useSettingsStore, useSymbolSettingsStore } from "@/stores/settingsStore";
import { storeToRefs } from "pinia";
import {
  calculateZoomToResolution,
  useMapDrop,
  useMoveInteraction,
  useRotateInteraction,
  useUnitLayer,
  useUnitSelectInteraction,
} from "@/composables/geoUnitLayers";
import LayerGroup from "ol/layer/Group";
import { useScenarioFeatureSelect } from "@/modules/scenarioeditor/featureLayerUtils";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { provideMapHover } from "@/composables/geoHover";
import { saveMapAsPng, useOlEvent } from "@/composables/openlayersHelpers";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useShowLocationControl } from "@/composables/geoShowLocation";
import { useShowScaleLine } from "@/composables/geoScaleLine";
import { ObjectEvent } from "ol/Object";
import { clearUnitStyleCache } from "@/geo/unitStyles";
import { useRangeRingsLayer } from "@/composables/geoRangeRings";
import { useUnitHistory } from "@/composables/geoUnitHistory";
import { useDayNightLayer } from "@/composables/geoDayNight";
import { useScenarioEvents } from "@/modules/scenarioeditor/scenarioEvents";
import { useSearchActions } from "@/composables/searchActions";
import { useSelectedItems } from "@/stores/selectedStore";
import MapHoverFeatureTooltip from "@/components/MapHoverFeatureTooltip.vue";
import { useRecordingStore } from "@/stores/recordingStore";
import { useOlScenarioLayerController } from "@/geo/engines/openlayers/olScenarioLayerController";

const props = defineProps<{ olMap: OLMap }>();
const emit = defineEmits<{
  (
    e: "map-ready",
    value: {
      olMap: OLMap;
      featureSelectInteraction: Select;
      unitSelectInteraction: Select;
      scenarioLayerController: ScenarioLayerController;
    },
  ): void;
}>();

const {
  geo,
  store: { state, onUndoRedo },
} = injectStrict(activeScenarioKey);

const mapRef = shallowRef<OLMap>();

const uiStore = useUiStore();
const recordingStore = useRecordingStore();

const { selectedFeatureIds } = useSelectedItems();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const doNotFilterLayers = computed(() => uiStore.layersPanelActive);
const unitSettingsStore = useUnitSettingsStore();
const mapSettingsStore = useMapSettingsStore();
const geoStore = useGeoStore();
const settingsStore = useSettingsStore();
const symbolSettings = useSymbolSettingsStore();
const { moveUnitEnabled, rotateUnitEnabled } = storeToRefs(useUnitSettingsStore());
const { measurementUnit } = storeToRefs(useMeasurementsStore());
const { unitLayer, drawUnits, updateUnitPositions, labelLayer } = useUnitLayer();

const { onScenarioAction } = useSearchActions();

const { isDragging, formattedPosition } = useMapDrop(geoStore.mapAdapter!, unitLayer);

const olMap = props.olMap;
mapRef.value = olMap;

calculateZoomToResolution(olMap.getView());

const unitLayerGroup = new LayerGroup({
  layers: [labelLayer, unitLayer],
});

unitLayerGroup.set("title", "Units");

const { showHistory, editHistory, showWaypointTimestamps } =
  storeToRefs(unitSettingsStore);
const { unitSelectEnabled, featureSelectEnabled, hoverEnabled } =
  storeToRefs(useMapSelectStore());

const dayNightLayer = useDayNightLayer();
olMap.addLayer(dayNightLayer);
const scenarioLayerController = useOlScenarioLayerController(olMap);
const cleanupScenarioLayerBinding = scenarioLayerController.bindScenario(
  injectStrict(activeScenarioKey),
);
const { rangeLayer, drawRangeRings } = useRangeRingsLayer();
// Disable temporarily
const {} = useScenarioEvents(olMap);

olMap.addLayer(rangeLayer);
const { historyLayer, drawHistory, historyModify, waypointSelect, ctrlClickInteraction } =
  useUnitHistory(olMap, {
    showHistory,
    editHistory,
    showWaypointTimestamps,
  });

provideMapHover(mapRef, { enable: hoverEnabled });

olMap.addLayer(historyLayer);
olMap.addLayer(unitLayerGroup);

const {
  unitSelectInteraction,
  boxSelectInteraction,
  redraw: redrawSelectedUnits,
} = useUnitSelectInteraction([unitLayer], olMap, {
  enable: unitSelectEnabled,
});

// Order of select interactions is important. The interaction that is added last
// will be the one that receives the select event first and can stop the propagation.
olMap.addInteraction(unitSelectInteraction);
olMap.addInteraction(boxSelectInteraction);
olMap.addInteraction(waypointSelect);

olMap.addInteraction(historyModify);
olMap.addInteraction(ctrlClickInteraction);
const { selectInteraction: featureSelectInteraction } = useScenarioFeatureSelect(olMap, {
  enable: featureSelectEnabled,
});

const { moveInteraction: moveUnitInteraction } = useMoveInteraction(
  olMap,
  unitLayer,
  moveUnitEnabled,
);
const { rotateInteraction } = useRotateInteraction(olMap, unitLayer, rotateUnitEnabled);

useOlEvent(unitLayerGroup.on("change:visible", toggleUnitInteractions));
olMap.addInteraction(moveUnitInteraction);
olMap.addInteraction(rotateInteraction);

const { showLocation, coordinateFormat, showScaleLine } =
  storeToRefs(useMapSettingsStore());

useShowLocationControl(olMap, {
  coordinateFormat,
  enable: showLocation,
});

useShowScaleLine(olMap, {
  enabled: showScaleLine,
  measurementUnits: measurementUnit,
});

drawRangeRings();
drawUnits();
drawHistory();
//loadScenarioLayers();

// Set initial view: prioritize bounding box, then fall back to unit extent
if (state.boundingBox && state.boundingBox.length === 4) {
  const padding: [number, number, number, number] = [20, 20, 20, 20];

  geoStore.zoomToBbox(state.boundingBox as [number, number, number, number], {
    duration: 0,
    maxZoom: 16,
    padding,
  });
} else {
  const extent = unitLayer.getSource()?.getExtent();
  if (extent && !unitLayer.getSource()?.isEmpty())
    olMap.getView().fit(extent, { padding: [100, 100, 150, 100], maxZoom: 16 });
}

function toggleUnitInteractions(event: ObjectEvent) {
  const isUnitLayerVisible = !event.oldValue;
  moveUnitInteraction.setActive(
    isUnitLayerVisible && moveUnitEnabled.value && recordingStore.isRecordingLocation,
  );
  rotateInteraction.setActive(isUnitLayerVisible && rotateUnitEnabled.value);
}

emit("map-ready", {
  olMap,
  featureSelectInteraction,
  unitSelectInteraction,
  scenarioLayerController,
});

/** Incrementally update unit positions without recreating all features */
function updateUnitsOnMap() {
  updateUnitPositions();
  if (state.isMapStylesDirty) {
    unitLayer.changed();
    labelLayer.changed();
    state.isMapStylesDirty = false;
  }
  drawHistory();
  redrawSelectedUnits();
  drawRangeRings();
}

onUndoRedo(() => {
  // Undo/redo can restore style-affecting unit fields without changing geometry.
  // Force layer repaint so cached styles are recomputed for non-selected units.
  unitLayer.changed();
  labelLayer.changed();
});

watch(
  () => recordingStore.isRecordingLocation,
  (enabled) => {
    if (!enabled && moveUnitEnabled.value) {
      moveUnitEnabled.value = false;
    }
    const isUnitLayerVisible =
      typeof unitLayerGroup.getVisible === "function"
        ? unitLayerGroup.getVisible()
        : true;
    moveUnitInteraction.setActive(isUnitLayerVisible && moveUnitEnabled.value && enabled);
  },
  { immediate: true },
);

watch(
  [
    () => state.unitStateCounter,
    () => state.currentTime,
    () => geo.everyVisibleUnit.value.length,
  ],
  () => updateUnitsOnMap(),
);

watch(
  [settingsStore, symbolSettings, mapSettingsStore, () => state.settingsStateCounter],
  () => {
    clearUnitStyleCache();
    drawUnits();
  },
);

watch(
  () => state.rangeRingStateCounter,
  () => drawRangeRings(),
);

watch([doNotFilterLayers, () => state.featureStateCounter], () => {
  scenarioLayerController.refreshScenarioFeatureLayers({
    doClearCache: false,
    filterVisible: !doNotFilterLayers.value,
  });
  // trigger redraw of selected features
  if (selectedFeatureIds.value.size > 0) {
    const ids = Array.from(selectedFeatureIds.value);
    selectedFeatureIds.value.clear();
    for (const id of ids) {
      selectedFeatureIds.value.add(id);
    }
  }
});

onUnmounted(() => {
  cleanupScenarioLayerBinding();
  clearUnitStyleCache();
});

onScenarioAction(async (e) => {
  if (e.action === "exportToImage") {
    await saveMapAsPng(olMap);
  }
});
</script>

<template>
  <MapHoverFeatureTooltip :is-dragging="isDragging" />
  <div
    v-if="isDragging"
    class="pointer-events-none absolute inset-0 border-4 border-dashed border-blue-700"
  >
    <p
      class="text-foreground bg-background absolute bottom-1 left-2 rounded px-1 text-base tracking-tighter tabular-nums"
    >
      {{ formattedPosition }}
    </p>
  </div>
</template>
