<template>
  <div class="relative">
    <MapContainer @ready="onMapReady" @drop="onDrop" @dragover.prevent />
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.z="onItemZoom"
      @keyup.p="onItemPan"
    />
    <MeasurementToolbar v-if="mapRef" class="absolute left-3 bottom-4" :ol-map="mapRef" />
    <div v-if="mapRef" class="absolute left-3 bottom-16">
      <BaseToolbar>
        <ToolbarButton start end @click="toggleModify">
          <CursorDefault v-if="modifyEnabled" class="h-5 w-5" aria-hidden="true" />
          <CursorMove v-else class="h-5 w-5" aria-hidden="true" />
        </ToolbarButton>
      </BaseToolbar>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, onUnmounted, shallowRef, watch } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { GlobalEvents } from "vue-global-events";
import { useActiveUnitStore } from "../stores/dragStore";
import { createHistoryLayer } from "../geo/layers";
import { Collection, Feature } from "ol";
import { clearStyleCache } from "../geo/styles";
import { Point } from "ol/geom";
import { useScenarioStore } from "../stores/scenarioStore";
import { useGeoStore } from "../stores/geoStore";
import LayerGroup from "ol/layer/Group";
import { inputEventFilter } from "./helpers";
import { useUiStore } from "../stores/uiStore";
import {
  createHistoryFeature,
  useDrop,
  useModifyInteraction,
  useSelectInteraction,
  useUnitLayer,
} from "../composables/geomap";
import { useSettingsStore } from "../stores/settingsStore";
import { useToggle } from "@vueuse/core";
import { ObjectEvent } from "ol/Object";
import IconButton from "./IconButton.vue";
import { CursorDefault, CursorMove, Ruler as RulerMeasure, TapeMeasure } from "mdue";
import MeasurementToolbar from "./MeasurementToolbar.vue";
import BaseToolbar from "./BaseToolbar.vue";
import ToolbarButton from "./ToolbarButton.vue";
import { useOlEvent } from "../composables/openlayersHelpers";
import { useScenarioLayers } from "../composables/scenarioLayers";

export default defineComponent({
  name: "ScenarioMap",
  components: {
    ToolbarButton,
    BaseToolbar,
    MeasurementToolbar,
    IconButton,
    MapContainer,
    GlobalEvents,
    TapeMeasure,
    RulerMeasure,
    CursorMove,
    CursorDefault,
  },
  setup() {
    const mapRef = shallowRef<OLMap>();
    let selectedFeatures: Collection<Feature<Point>> = new Collection<Feature<Point>>();
    const { unitLayer, drawUnits } = useUnitLayer();
    const activeUnitStore = useActiveUnitStore();
    const historyLayer = createHistoryLayer();

    const scenarioStore = useScenarioStore();
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

      const { modifyInteraction } = useModifyInteraction(olMap, unitLayer, modifyEnabled);
      useOlEvent(unitLayerGroup.on("change:visible", toggleModifyInteraction));
      olMap.addInteraction(modifyInteraction);

      drawUnits();
      drawHistory();

      const { initializeFromStore: loadScenarioLayers } = useScenarioLayers(olMap);
      loadScenarioLayers();
      const extent = unitLayer.getSource().getExtent();
      if (extent && !unitLayer.getSource().isEmpty())
        olMap.getView().fit(extent, { padding: [10, 10, 10, 10] });

      function toggleModifyInteraction(event: ObjectEvent) {
        const isUnitLayerVisible = !event.oldValue;
        modifyInteraction.setActive(isUnitLayerVisible && modifyEnabled.value);
      }

      const layerCollection = olMap.getLayers();
      useOlEvent(layerCollection.on(["add", "remove"], (event) => {}));
    };

    const drawHistory = () => {
      const historyLayerSource = historyLayer.getSource();
      historyLayerSource.clear();
      const unit = activeUnitStore.activeUnit;
      if (!unit) return;

      const historyFeature = createHistoryFeature(unit);
      historyLayerSource.addFeature(historyFeature);
    };

    watch(
      () => scenarioStore.visibleUnits,
      () => {
        drawUnits();
        drawHistory();
      }
    );

    watch(settingsStore, () => {
      clearStyleCache();
      drawUnits();
    });

    const { onDrop } = useDrop(mapRef, unitLayer);

    const onItemZoom = () => {
      geoStore.zoomToUnit(activeUnitStore.activeUnit);
    };

    const onItemPan = () => {
      geoStore.panToUnit(activeUnitStore.activeUnit);
    };

    onUnmounted(() => {
      geoStore.olMap = undefined;
    });

    return {
      onMapReady,
      onDrop,
      inputEventFilter,
      onItemZoom,
      onItemPan,
      uiStore,
      measure,
      toggleMeasure,
      mapRef,
      modifyEnabled,
      toggleModify,
    };
  },
});
</script>
