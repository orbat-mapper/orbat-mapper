<template>
  <div class="relative">
    <MapContainer @ready="onMapReady" @drop="onDrop" @dragover.prevent />
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.z="onItemZoom"
      @keyup.p="onItemPan"
    />
    <IconButton
      class="absolute bottom-2 left-1"
      :class="measure && 'text-red-900'"
      @click="toggleMeasure()"
    >
      <RulerMeasure />
    </IconButton>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, markRaw, nextTick, Ref, watch } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { GlobalEvents } from "vue-global-events";
import { fromLonLat, toLonLat } from "ol/proj";
import { useActiveUnitStore, useDragStore } from "../stores/dragStore";
import { DragOperations } from "../types/constants";
import { createHistoryLayer, createUnitFeatureAt } from "../geo/layers";
import VectorLayer from "ol/layer/Vector";
import { Collection, Feature } from "ol";
import { Modify, Select } from "ol/interaction";
import { clearStyleCache, createSelectedUnitStyleFromFeature } from "../geo/styles";
import { SelectEvent } from "ol/interaction/Select";
import { click } from "ol/events/condition";
import { LineString, Point } from "ol/geom";
import { useScenarioStore } from "../stores/scenarioStore";
import { Unit } from "../types/models";
import { useGeoStore } from "../stores/geoStore";
import LayerGroup from "ol/layer/Group";
import { ModifyEvent } from "ol/interaction/Modify";
import GeometryLayout from "ol/geom/GeometryLayout";
import VectorSource from "ol/source/Vector";
import { inputEventFilter } from "./helpers";
import { useUiStore } from "../stores/uiStore";
import { useUnitLayer } from "../composables/geomap";
import { useSettingsStore } from "../stores/settingsStore";
import { useEventBus, useToggle } from "@vueuse/core";
import { mapUnitClick } from "./eventKeys";
import { ObjectEvent } from "ol/Object";
import { useMeasurementInteraction } from "../composables/geoMeasurement";
import IconButton from "./IconButton.vue";
import { TapeMeasure, Ruler as RulerMeasure } from "mdue";

export default defineComponent({
  name: "ScenarioMap",
  components: { IconButton, MapContainer, GlobalEvents, TapeMeasure, RulerMeasure },
  setup() {
    let mapRef: OLMap;
    let selectedFeatures: Collection<Feature<Point>> = new Collection<Feature<Point>>();
    const { unitLayer, drawUnits } = useUnitLayer();
    const activeUnitStore = useActiveUnitStore();
    const historyLayer = createHistoryLayer();

    const scenarioStore = useScenarioStore();
    const geoStore = useGeoStore();
    const uiStore = useUiStore();
    const settingsStore = useSettingsStore();
    const [measure, toggleMeasure] = useToggle(false);
    const onMapReady = (olMap: OLMap) => {
      mapRef = olMap;
      const unitLayerGroup = new LayerGroup({
        layers: [unitLayer],
      });

      historyLayer.set("title", "History");
      mapRef.addLayer(historyLayer);
      unitLayerGroup.set("title", "Units");
      mapRef.addLayer(unitLayerGroup);

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
      mapRef.addInteraction(selectInteraction);

      const { modifyInteraction } = useModifyInteraction(olMap, unitLayer);
      unitLayerGroup.on("change:visible", toggleModifyInteraction);
      mapRef.addInteraction(modifyInteraction);

      geoStore.layers = markRaw(olMap.getLayers());
      drawUnits();
      drawHistory();
      const extent = unitLayer.getSource().getExtent();
      if (extent && !unitLayer.getSource().isEmpty())
        mapRef.getView().fit(extent, { padding: [10, 10, 10, 10] });

      function toggleModifyInteraction(event: ObjectEvent) {
        const isUnitLayerVisible = !event.oldValue;
        modifyInteraction.setActive(isUnitLayerVisible);
      }

      const { clear } = useMeasurementInteraction(olMap, "LineString", {
        enable: measure,
      });
      watch(measure, (v) => {
        clear();
      });
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

    // watch(
    //   () => scenarioStore.currentTime,
    //   () => {
    //     drawUnits();
    //     drawHistory();
    //   }
    // );

    const { onDrop } = useDrop(
      computed(() => mapRef),
      computed(() => unitLayer)
    );

    const onItemZoom = () => {
      geoStore.zoomToUnit(activeUnitStore.activeUnit);
    };

    const onItemPan = () => {
      geoStore.panToUnit(activeUnitStore.activeUnit);
    };

    return {
      onMapReady,
      onDrop,
      inputEventFilter,
      onItemZoom,
      onItemPan,
      uiStore,
      measure,
      toggleMeasure,
    };
  },
});

function useDrop(mapRef: Ref<OLMap>, unitLayer: Ref<VectorLayer<any>>) {
  const dragStore = useDragStore();
  const scenarioStore = useScenarioStore();

  const onDrop = (ev: DragEvent) => {
    ev.preventDefault();
    if (
      ev.dataTransfer &&
      ev.dataTransfer.getData("text") === DragOperations.OrbatDrag &&
      dragStore.draggedUnit
    ) {
      const dropPosition = toLonLat(mapRef.value.getEventCoordinate(ev));
      const unitSource = unitLayer.value.getSource();
      const existingUnitFeature = unitSource.getFeatureById(dragStore.draggedUnit.id);

      scenarioStore.addUnitPosition(dragStore.draggedUnit, dropPosition);

      if (existingUnitFeature) {
        existingUnitFeature.setGeometry(new Point(fromLonLat(dropPosition)));
      } else {
        unitSource.addFeature(createUnitFeatureAt(dropPosition, dragStore.draggedUnit));
      }
    }
  };

  return { onDrop };
}

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
    }
  }

  function selectUnit(unit: Unit) {
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

function useModifyInteraction(
  mapRef: OLMap,
  unitLayer: VectorLayer<VectorSource<Point>>
) {
  const scenarioStore = useScenarioStore();
  const activeUnitStore = useActiveUnitStore();
  const modifyInteraction = new Modify({
    hitDetection: unitLayer,
    source: unitLayer.getSource(),
  });

  modifyInteraction.on(["modifystart", "modifyend"], (evt) => {
    mapRef.getTargetElement().style.cursor =
      evt.type === "modifystart" ? "grabbing" : "pointer";
    if (evt.type === "modifyend") {
      const unitFeature = (evt as ModifyEvent).features.pop() as Feature<Point>;
      if (unitFeature) {
        const movedUnit = scenarioStore.getUnitById(unitFeature.getId() ?? "");
        if (!movedUnit) return;
        const newCoordinate = unitFeature.getGeometry()?.getCoordinates();
        if (newCoordinate)
          scenarioStore.addUnitPosition(movedUnit, toLonLat(newCoordinate));
        if (activeUnitStore.activeUnit && activeUnitStore.activeUnit === movedUnit) {
          activeUnitStore.clearActiveUnit();
          nextTick(() => activeUnitStore.setActiveUnit(movedUnit));
        }
      }
    }
  });
  const overlaySource = modifyInteraction.getOverlay().getSource();
  overlaySource.on(["addfeature", "removefeature"], function (evt: ModifyEvent) {
    mapRef.getTargetElement().style.cursor = evt.type === "addfeature" ? "pointer" : "";
  });
  return { modifyInteraction };
}
</script>
