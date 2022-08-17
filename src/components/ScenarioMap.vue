<template>
  <div class="relative bg-white dark:bg-gray-900">
    <MapContainer @ready="onMapReady" @drop="onDrop" @dragover.prevent />
    <MeasurementToolbar
      v-if="mapRef"
      class="absolute left-3 bottom-10"
      :ol-map="mapRef"
    />
    <div v-if="mapRef" class="absolute bottom-[5.2rem] left-3">
      <BaseToolbar class="shadow">
        <ToolbarButton start end @click="toggleMoveUnit()">
          <CursorDefault v-if="moveUnitEnabled" class="h-5 w-5" aria-hidden="true" />
          <CursorMove v-else class="h-5 w-5" aria-hidden="true" />
        </ToolbarButton>
      </BaseToolbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onUnmounted, shallowRef, watch } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { clearStyleCache } from "@/geo/unitStyles";
import { useGeoStore, useUnitSettingsStore } from "@/stores/geoStore";
import LayerGroup from "ol/layer/Group";

import {
  useDrop,
  useMoveInteraction,
  useUnitLayer,
  useUnitSelectInteraction,
} from "@/composables/geomap";
import { useSettingsStore } from "@/stores/settingsStore";
import { useToggle } from "@vueuse/core";
import { ObjectEvent } from "ol/Object";
import { CursorDefault, CursorMove } from "mdue";
import MeasurementToolbar from "./MeasurementToolbar.vue";
import BaseToolbar from "./BaseToolbar.vue";
import ToolbarButton from "./ToolbarButton.vue";
import { useOlEvent } from "@/composables/openlayersHelpers";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useUnitHistory } from "@/composables/geoUnitHistory";
import { storeToRefs } from "pinia";
import { TAB_LAYERS } from "@/types/constants";
import { useTabStore } from "@/stores/uiStore";
import { useShowLocationControl } from "@/composables/geoShowLocation";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

const {
  geo,
  store: { state },
  unitActions,
} = injectStrict(activeScenarioKey);

const uiTabs = useTabStore();
const doNotFilterLayers = computed(() => uiTabs.activeScenarioTab === TAB_LAYERS);
const mapRef = shallowRef<OLMap>();

const { unitLayer, drawUnits } = useUnitLayer();
const unitSettingsStore = useUnitSettingsStore();

const geoStore = useGeoStore();
const settingsStore = useSettingsStore();
const [measure, toggleMeasure] = useToggle(false);
const [moveUnitEnabled, toggleMoveUnit] = useToggle(false);

const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  geoStore.olMap = markRaw(olMap);

  const unitLayerGroup = new LayerGroup({
    layers: [unitLayer],
  });

  const { showHistory, editHistory } = storeToRefs(unitSettingsStore);

  const { initializeFromStore: loadScenarioLayers } = useScenarioLayers(olMap);
  const { historyLayer, drawHistory, historyModify } = useUnitHistory({
    showHistory,
    editHistory,
  });

  historyLayer.set("title", "History");
  olMap.addLayer(historyLayer);
  unitLayerGroup.set("title", "Units");
  olMap.addLayer(unitLayerGroup);

  watch([() => state.currentTime, doNotFilterLayers], (v) => {
    loadScenarioLayers(false, !doNotFilterLayers.value);
  });

  olMap.addInteraction(historyModify);

  const { unitSelectInteraction } = useUnitSelectInteraction([unitLayer]);
  olMap.addInteraction(unitSelectInteraction);

  const { moveInteraction: moveUnitInteraction } = useMoveInteraction(
    olMap,
    unitLayer,
    moveUnitEnabled
  );
  useOlEvent(unitLayerGroup.on("change:visible", toggleMoveUnitInteraction));
  olMap.addInteraction(moveUnitInteraction);

  const { showLocation, coordinateFormat } = storeToRefs(useMapSettingsStore());
  const lc = useShowLocationControl(olMap, {
    coordinateFormat,
    enable: showLocation,
  });

  drawUnits();
  drawHistory();

  loadScenarioLayers();
  const extent = unitLayer.getSource()?.getExtent();
  if (extent && !unitLayer.getSource()?.isEmpty())
    olMap.getView().fit(extent, { padding: [10, 10, 10, 10] });

  function toggleMoveUnitInteraction(event: ObjectEvent) {
    const isUnitLayerVisible = !event.oldValue;
    moveUnitInteraction.setActive(isUnitLayerVisible && moveUnitEnabled.value);
  }

  const layerCollection = olMap.getLayers();
  useOlEvent(layerCollection.on(["add", "remove"], (event) => {}));

  watch(geo.everyVisibleUnit, () => {
    drawUnits();
    drawHistory();
  });
};

watch(settingsStore, () => {
  clearStyleCache();
  drawUnits();
});

const { onDrop } = useDrop(mapRef, unitLayer);

onUnmounted(() => {
  geoStore.olMap = undefined;
});
</script>

<style>
.jest {
  font-variant-numeric: tabular-nums;
}
</style>
