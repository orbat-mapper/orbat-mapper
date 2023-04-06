<template>
  <div class="relative bg-white dark:bg-gray-900">
    <MapContainer
      @ready="onMapReady"
      @drop="onDrop"
      @dragover.prevent
      @contextmenu="onContextMenu"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, shallowRef, watch } from "vue";
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
import { useSettingsStore, useSymbolSettingsStore } from "@/stores/settingsStore";
import { ObjectEvent } from "ol/Object";
import { useOlEvent } from "@/composables/openlayersHelpers";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useUnitHistory } from "@/composables/geoUnitHistory";
import { storeToRefs } from "pinia";
import { TAB_LAYERS } from "@/types/constants";
import { useShowLocationControl } from "@/composables/geoShowLocation";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useTabStore } from "@/stores/tabStore";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useMapContextMenu } from "@/composables/mapContextMenu";
import { useMapHover } from "@/composables/geoHover";

interface Props {}

// const props = defineProps<Props>();
const emit = defineEmits<{ (e: "map-ready", value: OLMap): void }>();

const {
  geo,
  store: { state },
  unitActions,
} = injectStrict(activeScenarioKey);

const mapRef = shallowRef<OLMap>();

const uiTabs = useTabStore();
const doNotFilterLayers = computed(() => uiTabs.activeScenarioTab === TAB_LAYERS);
const unitSettingsStore = useUnitSettingsStore();
const geoStore = useGeoStore();
const settingsStore = useSettingsStore();
const symbolSettings = useSymbolSettingsStore();
const { moveUnitEnabled } = storeToRefs(useUnitSettingsStore());

const { unitLayer, drawUnits } = useUnitLayer();
const { onDrop } = useDrop(mapRef, unitLayer);
const { onContextMenu } = useMapContextMenu(mapRef);

const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  geoStore.olMap = olMap;

  const unitLayerGroup = new LayerGroup({
    layers: [unitLayer],
  });

  unitLayerGroup.set("title", "Units");

  const { showHistory, editHistory } = storeToRefs(unitSettingsStore);

  const { initializeFromStore: loadScenarioLayers } = useScenarioLayers(olMap);
  const { historyLayer, drawHistory, historyModify } = useUnitHistory({
    showHistory,
    editHistory,
  });
  const { enable } = useMapHover(olMap);

  olMap.addLayer(historyLayer);
  olMap.addLayer(unitLayerGroup);

  watch([() => state.currentTime, doNotFilterLayers], (v) => {
    loadScenarioLayers(false, !doNotFilterLayers.value);
  });

  olMap.addInteraction(historyModify);
  const { unitSelectEnabled } = storeToRefs(useMapSelectStore());
  const { unitSelectInteraction, boxSelectInteraction } = useUnitSelectInteraction(
    [unitLayer],
    olMap,
    {
      enable: unitSelectEnabled,
    }
  );
  olMap.addInteraction(unitSelectInteraction);
  olMap.addInteraction(boxSelectInteraction);

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

  watch(geo.everyVisibleUnit, () => {
    drawUnits();
    drawHistory();
  });

  emit("map-ready", olMap);
};

watch([settingsStore, symbolSettings], () => {
  clearStyleCache();
  drawUnits();
});

onUnmounted(() => {
  geoStore.olMap = undefined;
});
</script>
