<template>
  <div class="relative bg-white dark:bg-gray-900">
    <MapContainer @ready="onMapReady" @drop="onDrop" @dragover.prevent />
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.z.exact="onItemZoom"
      @keyup.p="onItemPan"
    />
    <MeasurementToolbar v-if="mapRef" class="absolute left-3 bottom-4" :ol-map="mapRef" />
    <div v-if="mapRef" class="absolute left-3 bottom-16">
      <BaseToolbar class="shadow">
        <ToolbarButton start end @click="toggleModify">
          <CursorDefault v-if="modifyEnabled" class="h-5 w-5" aria-hidden="true" />
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
import { GlobalEvents } from "vue-global-events";
import { useActiveUnitStore } from "@/stores/dragStore";
import { createHistoryLayer } from "@/geo/layers";
import { Collection, Feature } from "ol";
import { clearStyleCache } from "@/geo/unitStyles";
import { Point } from "ol/geom";
import { useGeoStore } from "@/stores/geoStore";
import LayerGroup from "ol/layer/Group";
import { inputEventFilter } from "./helpers";
import { useUiStore } from "@/stores/uiStore";
import {
  createHistoryFeature,
  useDrop,
  useMoveInteraction,
  useSelectInteraction,
  useUnitLayer,
} from "@/composables/geomap2";
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
import {
  activeFeaturesKey,
  activeScenarioKey,
  activeUnitKey,
} from "@/components/injects";

const {
  geo,
  store: { state },
} = injectStrict(activeScenarioKey);

const activeUnitId = injectStrict(activeUnitKey);

const mapRef = shallowRef<OLMap>();
let selectedFeatures: Collection<Feature<Point>> = new Collection<Feature<Point>>();

const { unitLayer, drawUnits } = useUnitLayer();
const activeUnitStore = useActiveUnitStore();
const historyLayer = createHistoryLayer();

const geoStore = useGeoStore();
const uiStore = useUiStore();
const settingsStore = useSettingsStore();
const [measure, toggleMeasure] = useToggle(false);
const [modifyEnabled, toggleModify] = useToggle(false);

const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  geoStore.olMap = markRaw(olMap);

  const unitLayerGroup = new LayerGroup({
    layers: [unitLayer],
  });

  const { initializeFromStore: loadScenarioLayers } = useScenarioLayers(olMap);

  historyLayer.set("title", "History");
  olMap.addLayer(historyLayer);
  unitLayerGroup.set("title", "Units");
  olMap.addLayer(unitLayerGroup);

  const { selectInteraction } = useSelectInteraction(
    [unitLayer],
    selectedFeatures,
    historyLayer
  );
  olMap.addInteraction(selectInteraction);

  const { moveInteraction } = useMoveInteraction(olMap, unitLayer, modifyEnabled);
  useOlEvent(unitLayerGroup.on("change:visible", toggleModifyInteraction));
  olMap.addInteraction(moveInteraction);

  drawUnits();
  drawHistory();

  loadScenarioLayers();
  const extent = unitLayer.getSource()?.getExtent();
  if (extent && !unitLayer.getSource()?.isEmpty())
    olMap.getView().fit(extent, { padding: [10, 10, 10, 10] });

  function toggleModifyInteraction(event: ObjectEvent) {
    const isUnitLayerVisible = !event.oldValue;
    moveInteraction.setActive(isUnitLayerVisible && modifyEnabled.value);
  }

  const layerCollection = olMap.getLayers();
  useOlEvent(layerCollection.on(["add", "remove"], (event) => {}));
};

const drawHistory = () => {
  const historyLayerSource = historyLayer.getSource()!;
  historyLayerSource.clear();
  const unit = activeUnitStore.activeUnit;
  if (!unit) return;

  const historyFeature = createHistoryFeature(unit);
  historyLayerSource.addFeature(historyFeature);
};

const activeUnit = computed(
  () => (activeUnitId.value && state.getUnitById(activeUnitId.value)) || null
);

watch(geo.everyVisibleUnit, () => {
  drawUnits();
  drawHistory();
});

watch(settingsStore, () => {
  clearStyleCache();
  drawUnits();
});

const { onDrop } = useDrop(mapRef, unitLayer);

const onItemZoom = () => {
  geoStore.zoomToUnit(activeUnit.value);
};

const onItemPan = () => {
  geoStore.panToUnit(activeUnit.value);
};

onUnmounted(() => {
  geoStore.olMap = undefined;
});
</script>
