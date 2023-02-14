<template>
  <div class="relative bg-white dark:bg-gray-900">
    <MapContainer
      @ready="onMapReady"
      @drop="onDrop"
      @dragover.prevent
      @contextmenu="onContextMenu"
    />
    <MeasurementToolbar
      v-if="mapRef"
      class="absolute left-3 bottom-10"
      :ol-map="mapRef"
    />
    <div v-if="mapRef" class="absolute bottom-[5.2rem] left-3">
      <BaseToolbar class="shadow"> </BaseToolbar>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, h, markRaw, onUnmounted, ref, shallowRef, watch } from "vue";
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
import { IconCogOutline } from "@iconify-prerendered/vue-mdi";
import MeasurementToolbar from "./MeasurementToolbar.vue";
import BaseToolbar from "./BaseToolbar.vue";
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
import ContextMenu, { type MenuOptions } from "@imengyu/vue3-context-menu";
import { toLonLat } from "ol/proj";

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
const { moveUnitEnabled } = storeToRefs(useUnitSettingsStore());

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

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  const dropPosition = toLonLat(mapRef.value!.getEventCoordinate(e));
  const settings = useMapSettingsStore();
  const menu = ref<MenuOptions>({
    items: [
      {
        label: "Map settings",
        icon: h(IconCogOutline, { class: "text-gray-500" }),
        children: [
          {
            label: "Show cursor location",
            checked: computed(() => settings.showLocation) as unknown as boolean,
            clickClose: false,
            onClick: () => {
              settings.showLocation = !settings.showLocation;
            },
          },
          {
            label: "Format",
            disabled: true,
          },
          {
            label: "Decimal degrees",
            checked: computed(
              () => settings.coordinateFormat === "DecimalDegrees"
            ) as unknown as boolean,
            clickClose: false,
            onClick: () => {
              settings.coordinateFormat = "DecimalDegrees";
            },
          },
          {
            label: "Degree Minutes Seconds",
            checked: computed(
              () => settings.coordinateFormat === "DegreeMinuteSeconds"
            ) as unknown as boolean,
            clickClose: false,
            onClick: () => {
              settings.coordinateFormat = "DegreeMinuteSeconds";
            },
          },
          {
            label: "MGRS",
            checked: computed(
              () => settings.coordinateFormat === "MGRS"
            ) as unknown as boolean,
            clickClose: false,
            onClick: () => {
              settings.coordinateFormat = "MGRS";
            },
          },
        ],
      },
    ],
    zIndex: 3,
    minWidth: 230,
    x: e.x,
    y: e.y,
  });
  ContextMenu.showContextMenu(menu.value);
}
</script>
