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
        <ToolbarButton start end @click="toggleMoveUnit()">
          <CursorDefault v-if="moveUnitEnabled" class="h-5 w-5" aria-hidden="true" />
          <CursorMove v-else class="h-5 w-5" aria-hidden="true" />
        </ToolbarButton>
      </BaseToolbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, markRaw, onUnmounted, ref, shallowRef, watch } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { GlobalEvents } from "vue-global-events";
import { createHistoryLayer } from "@/geo/layers";
import { Feature } from "ol";
import { clearStyleCache } from "@/geo/unitStyles";
import { LineString } from "ol/geom";
import { useGeoStore } from "@/stores/geoStore";
import LayerGroup from "ol/layer/Group";
import { inputEventFilter } from "./helpers";
import { useUiStore } from "@/stores/uiStore";
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
import {
  activeScenarioKey,
  activeUnitKey,
  currentScenarioTabKey,
} from "@/components/injects";
import { createHistoryFeature, VIA_TIME } from "@/geo/history";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import GeometryLayout from "ol/geom/GeometryLayout";
import { EntityId, HistoryAction } from "@/types/base";
import { Coordinate } from "ol/coordinate";
import { toLonLat } from "ol/proj";

const {
  geo,
  store: { state, onUndoRedo },
  unitActions,
} = injectStrict(activeScenarioKey);

const currentScenarioTab = inject(currentScenarioTabKey, ref(0));

const doNotFilterLayers = computed(() => currentScenarioTab.value === 2);

const activeUnitId = injectStrict(activeUnitKey);

const mapRef = shallowRef<OLMap>();

const { unitLayer, drawUnits } = useUnitLayer();
const historyLayer = createHistoryLayer();

const geoStore = useGeoStore();
const uiStore = useUiStore();
const settingsStore = useSettingsStore();
const [measure, toggleMeasure] = useToggle(false);
const [moveUnitEnabled, toggleMoveUnit] = useToggle(false);

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

  // test

  watch([() => state.currentTime, doNotFilterLayers], (v) => {
    loadScenarioLayers(false, !doNotFilterLayers.value);
  });

  onUndoRedo(({ meta }) => {
    if (meta?.value === activeUnitId.value) drawHistory();
  });

  const historyModify = new Modify({ source: historyLayer.getSource()! });
  let preGeometry: LineString | undefined;
  historyModify.on(["modifystart", "modifyend"], (evt) => {
    const f = (evt as ModifyEvent).features.item(0) as Feature<LineString>;
    if (evt.type === "modifystart") {
      preGeometry = f.getGeometry()?.clone();
    } else if (evt.type === "modifyend") {
      const postGeometry = f.getGeometry();
      let action: HistoryAction;
      const preLength = preGeometry?.getCoordinates().length || 0;
      const postLength = postGeometry?.getCoordinates().length || 0;
      const preCoords = preGeometry?.getCoordinates() || [];
      const postCoords = postGeometry?.getCoordinates() || [];
      let elementIndex = -1;
      let isVia = false;
      if (preLength === postLength) {
        action = "modify";

        postCoords.every((v, i, a) => {
          const b = preCoords[i];
          const isEq = v[0] === b[0] && v[1] === b[1] && v[2] === b[2];
          if (!isEq) {
            elementIndex = i;
            if (v[2] === VIA_TIME) isVia = true;
          }
          return isEq;
        });
      } else if (preLength < postLength) {
        action = "add";
        elementIndex = postCoords.findIndex((e) => e[2] === 0);
        isVia = true;
      } else {
        action = "remove";
        preCoords.every((v, i, a) => {
          const b = postCoords[i];
          const isEq = b && v[0] === b[0] && v[1] === b[1] && v[2] === b[2];
          if (!isEq) {
            elementIndex = i;
            if (v[2] === VIA_TIME) isVia = true;
          }
          return isEq;
        });
      }
      // console.log(`aAction: ${action}, index: ${elementIndex}, isVia: ${isVia}`);

      handleHistoryFeatureChange(
        f.get("unitId"),
        action,
        elementIndex,
        isVia,
        postCoords,
        preCoords
      );

      const updatedGeometry = postGeometry
        ?.getCoordinates()
        .map((e) => [e[0], e[1], e[2] === 0 ? VIA_TIME : e[2]]);
      if (updatedGeometry)
        f.getGeometry()?.setCoordinates(updatedGeometry, GeometryLayout.XYM);
    }
  });

  olMap.addInteraction(historyModify);

  const { unitSelectInteraction } = useUnitSelectInteraction([unitLayer], historyLayer);
  olMap.addInteraction(unitSelectInteraction);

  const { moveInteraction: moveUnitInteraction } = useMoveInteraction(
    olMap,
    unitLayer,
    moveUnitEnabled
  );
  useOlEvent(unitLayerGroup.on("change:visible", toggleModifyInteraction));
  olMap.addInteraction(moveUnitInteraction);

  drawUnits();
  drawHistory();

  loadScenarioLayers();
  const extent = unitLayer.getSource()?.getExtent();
  if (extent && !unitLayer.getSource()?.isEmpty())
    olMap.getView().fit(extent, { padding: [10, 10, 10, 10] });

  function toggleModifyInteraction(event: ObjectEvent) {
    const isUnitLayerVisible = !event.oldValue;
    moveUnitInteraction.setActive(isUnitLayerVisible && moveUnitEnabled.value);
  }

  const layerCollection = olMap.getLayers();
  useOlEvent(layerCollection.on(["add", "remove"], (event) => {}));
};

function handleHistoryFeatureChange(
  unitId: EntityId,
  action: HistoryAction,
  elementIndex: number,
  isVia: boolean,
  postCoordinates: Coordinate[],
  preCoordinates: Coordinate[]
) {
  const unit = unitActions.getUnitById(unitId);
  const changedCoords = postCoordinates[elementIndex];
  const llChangedCoords = toLonLat([changedCoords[0], changedCoords[1]]);
  if (!unit) return;
  if (isVia) {
    let stateElementIndex = -1;
    let viaElementIndex = -1;
    if (action === "remove") {
      const a = [...preCoordinates.entries()].filter(
        ([i, c]) => !(c[2] === VIA_TIME || c[2] === 0)
      );
      stateElementIndex = a.findIndex(([i]) => {
        return i > elementIndex;
      });
    } else {
      const a = [...postCoordinates.entries()].filter(
        ([i, c]) => !(c[2] === VIA_TIME || c[2] === 0)
      );
      stateElementIndex = a.findIndex(([i], idx) => {
        return i > elementIndex;
      });
      viaElementIndex = elementIndex - a[stateElementIndex - 1][0] - 1;
    }
    unitActions.updateUnitStateVia(
      unitId,
      action,
      stateElementIndex,
      viaElementIndex,
      llChangedCoords
    );
  } else {
    if (action === "remove") {
      unitActions.deleteUnitStateEntry(unitId, elementIndex);
    } else if (action === "modify") {
      geo.addUnitPosition(unitId, llChangedCoords, changedCoords[2]);
    }
  }
}

const drawHistory = () => {
  const historyLayerSource = historyLayer.getSource()!;
  historyLayerSource.clear();
  const unit = activeUnit.value;
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
