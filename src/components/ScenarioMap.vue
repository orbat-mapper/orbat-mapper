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
import { computed, defineComponent, markRaw, onUnmounted, shallowRef, watch } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { GlobalEvents } from "vue-global-events";
import { useActiveUnitStore } from "../stores/dragStore";
import { createHistoryLayer } from "../geo/layers";
import VectorLayer from "ol/layer/Vector";
import { Collection, Feature } from "ol";
import { Select } from "ol/interaction";
import { clearStyleCache, createSelectedUnitStyleFromFeature } from "../geo/styles";
import { SelectEvent } from "ol/interaction/Select";
import { click } from "ol/events/condition";
import { LineString, Point } from "ol/geom";
import { useScenarioStore } from "../stores/scenarioStore";
import { Unit } from "../types/scenarioModels";
import { useGeoStore } from "../stores/geoStore";
import LayerGroup from "ol/layer/Group";
import GeometryLayout from "ol/geom/GeometryLayout";
import { inputEventFilter } from "./helpers";
import { useUiStore } from "../stores/uiStore";
import { useDrop, useModifyInteraction, useUnitLayer } from "../composables/geomap";
import { useSettingsStore } from "../stores/settingsStore";
import { useEventBus, useToggle } from "@vueuse/core";
import { mapUnitClick } from "./eventKeys";
import { ObjectEvent } from "ol/Object";
import IconButton from "./IconButton.vue";
import { CursorDefault, CursorMove, Ruler as RulerMeasure, TapeMeasure } from "mdue";
import MeasurementToolbar from "./MeasurementToolbar.vue";
import BaseToolbar from "./BaseToolbar.vue";
import ToolbarButton from "./ToolbarButton.vue";

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
      const unitLayerGroup = new LayerGroup({
        layers: [unitLayer],
      });

      historyLayer.set("title", "History");
      olMap.addLayer(historyLayer);
      unitLayerGroup.set("title", "Units");
      olMap.addLayer(unitLayerGroup);

      // olMap.on("click", (evt: MapBrowserEvent) => {
      //   const feature = evt.map.forEachFeatureAtPixel(
      //     evt.pixel,
      //     (feature) => feature
      //   );
      //   if (feature) {
      //     console.log(feature!.getGeometry()!.getClosestPoint(evt.pixel));
      //   }
      // });

      geoStore.olMap = markRaw(olMap);

      const { selectInteraction } = useSelectInteraction(
        [unitLayer],
        selectedFeatures,
        historyLayer
      );
      olMap.addInteraction(selectInteraction);

      const { modifyInteraction } = useModifyInteraction(olMap, unitLayer, modifyEnabled);
      unitLayerGroup.on("change:visible", toggleModifyInteraction);
      olMap.addInteraction(modifyInteraction);

      geoStore.layers = markRaw(olMap.getLayers());
      drawUnits();
      drawHistory();
      const extent = unitLayer.getSource().getExtent();
      if (extent && !unitLayer.getSource().isEmpty())
        olMap.getView().fit(extent, { padding: [10, 10, 10, 10] });

      function toggleModifyInteraction(event: ObjectEvent) {
        const isUnitLayerVisible = !event.oldValue;
        modifyInteraction.setActive(isUnitLayerVisible && modifyEnabled.value);
      }
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

    const { onDrop } = useDrop(
      //@ts-ignore
      mapRef,
      computed(() => unitLayer)
    );

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

function useSelectInteraction(
  layers: VectorLayer<any>[],
  selectedFeatures: Collection<Feature<Point>>,
  historyLayer: VectorLayer<any>
) {
  const bus = useEventBus(mapUnitClick);
  const activeUnitStore = useActiveUnitStore();
  const scenarioStore = useScenarioStore();
  const selectInteraction = new Select({
    layers,
    style: createSelectedUnitStyleFromFeature,
    condition: click,
    features: selectedFeatures,
  });
  selectInteraction.on("select", onSelect);

  function onSelect(evt: SelectEvent) {
    const selectedUnitId = evt.selected.map((f) => f.getId())[0];
    if (selectedUnitId) {
      const selectedUnit = scenarioStore.getUnitById(selectedUnitId);
      bus.emit(selectedUnit);
      activeUnitStore.activeUnit = selectedUnit || null;
      selectUnit(selectedUnit);
    } else {
      historyLayer.getSource().clear();
    }
  }

  function selectUnit(unit: Unit | null | undefined) {
    const historyLayerSource = historyLayer.getSource();
    historyLayerSource.clear(true);
    if (!unit) {
      return;
    }
    const existingFeature = layers[0].getSource().getFeatureById(unit.id);
    selectedFeatures.clear();
    if (existingFeature) {
      const historyFeature = createHistoryFeature(unit);
      historyLayerSource.addFeature(historyFeature);
      selectedFeatures.push(existingFeature);
    }
  }

  watch(
    () => activeUnitStore.activeUnit,
    (unit: Unit | null) => {
      if (unit) selectUnit(unit);
      else selectedFeatures.clear();
    }
  );
  watch(
    () => scenarioStore.visibleUnits,
    () => {
      const activeUnit = activeUnitStore.activeUnit;
      if (activeUnit) selectUnit(activeUnit);
    }
  );

  return { selectInteraction };
}

function createHistoryFeature(unit: Unit): Feature<LineString> {
  const state = [{ location: unit.location }, ...(unit.state || [])].filter(
    (s) => s?.location
  );
  // @ts-ignore
  const geometry = state.map((s) => [...s.location!, s.t]);
  const t = new LineString(geometry, GeometryLayout.XYM);
  t.transform("EPSG:4326", "EPSG:3857");
  return new Feature(t);
}
</script>
