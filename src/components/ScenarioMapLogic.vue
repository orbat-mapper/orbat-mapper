<script setup lang="ts">
import OLMap from "ol/Map";
import { computed, onUnmounted, shallowRef, watch } from "vue";
import Select from "ol/interaction/Select";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useUiStore } from "@/stores/uiStore";
import {
  useGeoStore,
  useMeasurementsStore,
  useUnitSettingsStore,
} from "@/stores/geoStore";
import { useSettingsStore, useSymbolSettingsStore } from "@/stores/settingsStore";
import { storeToRefs } from "pinia";
import {
  useDrop,
  useMoveInteraction,
  useUnitLayer,
  useUnitSelectInteraction,
} from "@/composables/geoUnitLayers";
import LayerGroup from "ol/layer/Group";
import { useScenarioMapLayers } from "@/modules/scenarioeditor/scenarioMapLayers";
import {
  useScenarioFeatureSelect,
  useScenarioLayers,
} from "@/modules/scenarioeditor/scenarioLayers2";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useGeoLayersUndoRedo } from "@/composables/geoUndoRedo";
import { useMapHover } from "@/composables/geoHover";
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

const props = defineProps<{ olMap: OLMap }>();
const emit = defineEmits<{
  (
    e: "map-ready",
    value: {
      olMap: OLMap;
      featureSelectInteraction: Select;
      unitSelectInteraction: Select;
    },
  ): void;
}>();

const {
  geo,
  store: { state },
} = injectStrict(activeScenarioKey);

const mapRef = shallowRef<OLMap>();

const uiStore = useUiStore();
const doNotFilterLayers = computed(() => uiStore.layersPanelActive);
const unitSettingsStore = useUnitSettingsStore();
const geoStore = useGeoStore();
const settingsStore = useSettingsStore();
const symbolSettings = useSymbolSettingsStore();
const { moveUnitEnabled } = storeToRefs(useUnitSettingsStore());
const { measurementUnit } = storeToRefs(useMeasurementsStore());
const { unitLayer, drawUnits } = useUnitLayer();

const { onScenarioAction } = useSearchActions();

const { onDrop } = useDrop(mapRef, unitLayer);

const olMap = props.olMap;
mapRef.value = olMap;
geoStore.olMap = olMap;

const unitLayerGroup = new LayerGroup({
  layers: [unitLayer],
});

unitLayerGroup.set("title", "Units");

const { showHistory, editHistory, showWaypointTimestamps } =
  storeToRefs(unitSettingsStore);
const { unitSelectEnabled, featureSelectEnabled, hoverEnabled } =
  storeToRefs(useMapSelectStore());

const dayNightLayer = useDayNightLayer();
olMap.addLayer(dayNightLayer);
const { initializeFromStore: loadMapLayers } = useScenarioMapLayers(olMap);
const { rangeLayer, drawRangeRings } = useRangeRingsLayer();
// Disable temporarily
const {} = useScenarioEvents(olMap);

olMap.addLayer(rangeLayer);
const { initializeFromStore: loadScenarioLayers } = useScenarioLayers(olMap);
useGeoLayersUndoRedo(olMap);
const { historyLayer, drawHistory, historyModify, waypointSelect, ctrlClickInteraction } =
  useUnitHistory(olMap, {
    showHistory,
    editHistory,
    showWaypointTimestamps,
  });

useMapHover(olMap, { enable: hoverEnabled });

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

useOlEvent(unitLayerGroup.on("change:visible", toggleMoveUnitInteraction));
olMap.addInteraction(moveUnitInteraction);

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

loadMapLayers();
loadScenarioLayers();

const extent = unitLayer.getSource()?.getExtent();
if (extent && !unitLayer.getSource()?.isEmpty())
  olMap.getView().fit(extent, { padding: [100, 100, 150, 100], maxZoom: 16 });

function toggleMoveUnitInteraction(event: ObjectEvent) {
  const isUnitLayerVisible = !event.oldValue;
  moveUnitInteraction.setActive(isUnitLayerVisible && moveUnitEnabled.value);
}

emit("map-ready", { olMap, featureSelectInteraction, unitSelectInteraction });

watch(
  geo.everyVisibleUnit,
  () => {
    drawUnits();
    drawHistory();
    redrawSelectedUnits();
    drawRangeRings();
  },
  { deep: true },
);

watch([settingsStore, symbolSettings], () => {
  clearUnitStyleCache();
  drawUnits();
});

watch([() => state.currentTime, doNotFilterLayers], () => {
  loadScenarioLayers(false, !doNotFilterLayers.value);
});

onUnmounted(() => {
  geoStore.olMap = undefined;
  clearUnitStyleCache();
});

function handleDrop(e: DragEvent) {
  onDrop(e);
}

onScenarioAction(async (e) => {
  if (e.action === "exportToImage") {
    await saveMapAsPng(olMap);
  }
});

defineExpose({ handleDrop });
</script>

<template></template>
