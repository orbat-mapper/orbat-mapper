<script setup lang="ts">
import OLMap from "ol/Map";
import { computed, onUnmounted, shallowRef, watch } from "vue";
import Select from "ol/interaction/Select";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useUiStore, useWidthStore } from "@/stores/uiStore";
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
import { useScenarioMapLayers } from "@/modules/scenarioeditor/scenarioMapLayers";
import { useScenarioFeatureSelect } from "@/modules/scenarioeditor/featureLayerUtils";
import { useMapSelectStore } from "@/stores/mapSelectStore";
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
import { useScenarioFeatureLayers } from "@/modules/scenarioeditor/scenarioFeatureLayers";
import { useSelectedItems } from "@/stores/selectedStore";

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
const widthStore = useWidthStore();
const { orbatPanelWidth, detailsWidth } = storeToRefs(widthStore);
const { showLeftPanel } = storeToRefs(uiStore);

const {
  selectedFeatureIds,
  selectedUnitIds,
  activeScenarioEventId,
  activeMapLayerId,
  showScenarioInfo,
} = useSelectedItems();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const showDetailsPanel = computed(() => {
  return Boolean(
    selectedFeatureIds.value.size ||
    selectedUnitIds.value.size ||
    activeScenarioEventId.value ||
    activeMapLayerId.value ||
    showScenarioInfo.value,
  );
});
const doNotFilterLayers = computed(() => uiStore.layersPanelActive);
const unitSettingsStore = useUnitSettingsStore();
const mapSettingsStore = useMapSettingsStore();
const geoStore = useGeoStore();
const settingsStore = useSettingsStore();
const symbolSettings = useSymbolSettingsStore();
const { moveUnitEnabled, rotateUnitEnabled } = storeToRefs(useUnitSettingsStore());
const { measurementUnit } = storeToRefs(useMeasurementsStore());
const { unitLayer, drawUnits, labelLayer } = useUnitLayer();

const { onScenarioAction } = useSearchActions();

const { isDragging, formattedPosition } = useMapDrop(mapRef, unitLayer);

const olMap = props.olMap;
mapRef.value = olMap;
geoStore.olMap = olMap;

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
const { initializeFromStore: loadMapLayers } = useScenarioMapLayers(olMap);
const { initializeFeatureLayersFromStore } = useScenarioFeatureLayers(olMap);
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

loadMapLayers();
initializeFeatureLayersFromStore();
//loadScenarioLayers();

// Set initial view: prioritize bounding box, then fall back to unit extent
if (state.boundingBox && state.boundingBox.length === 4) {
  const leftPadding = !isMobile.value && showLeftPanel.value ? orbatPanelWidth.value : 0;
  const rightPadding = !isMobile.value && showDetailsPanel.value ? detailsWidth.value : 0;
  const padding = [20, rightPadding + 20, 20, leftPadding + 20];

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
  moveUnitInteraction.setActive(isUnitLayerVisible && moveUnitEnabled.value);
  rotateInteraction.setActive(isUnitLayerVisible && rotateUnitEnabled.value);
}

emit("map-ready", { olMap, featureSelectInteraction, unitSelectInteraction });

function redrawUnits() {
  drawUnits();
  drawHistory();
  redrawSelectedUnits();
  drawRangeRings();
}

watch(geo.everyVisibleUnit, () => redrawUnits(), { deep: true });

watch([settingsStore, symbolSettings, mapSettingsStore], () => {
  clearUnitStyleCache();
  drawUnits();
});

watch(
  [() => state.currentTime, doNotFilterLayers, () => state.featureStateCounter],
  () => {
    initializeFeatureLayersFromStore({
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
  },
);

onUnmounted(() => {
  geoStore.olMap = undefined;
  clearUnitStyleCache();
});

onScenarioAction(async (e) => {
  if (e.action === "exportToImage") {
    await saveMapAsPng(olMap);
  }
});
</script>

<template>
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
