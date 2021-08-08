<template>
  <div>
    <MapContainer @ready="onMapReady" @drop="onDrop" @dragover.prevent />
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.z="onItemZoom"
      @keyup.p="onItemPan"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  markRaw,
  nextTick,
  Ref,
  toRaw,
  watch,
} from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { GlobalEvents } from "vue-global-events";
import { fromLonLat, toLonLat } from "ol/proj";
import { useActiveUnitStore, useDragStore } from "../stores/dragStore";
import { DragOperations } from "../types/constants";
import {
  createHistoryLayer,
  createUnitFeatureAt,
  createUnitLayer,
} from "../geo/layers";
import VectorLayer from "ol/layer/Vector";
import { Collection, Feature, MapBrowserEvent } from "ol";
import { Modify, Select } from "ol/interaction";
import { createSelectedUnitStyleFromFeature } from "../geo/styles";
import { SelectEvent } from "ol/interaction/Select";
import { click } from "ol/events/condition";
import { Point, LineString } from "ol/geom";
import { useScenarioStore } from "../stores/scenarioStore";
import { Unit } from "../types/models";
import { useGeoStore } from "../stores/geoStore";
import LayerGroup from "ol/layer/Group";
import { ModifyEvent } from "ol/interaction/Modify";

import { Feature as GFeature } from "geojson";
import { GeoJSON } from "ol/format";
import GeometryLayout from "ol/geom/GeometryLayout";
import VectorSource from "ol/source/Vector";
import { inputEventFilter } from "./helpers";
import { useUiStore } from "../stores/uiStore";
import { useUnitLayer } from "../composables/geomap";

export default defineComponent({
  name: "ScenarioMap",
  components: { MapContainer, GlobalEvents },
  setup() {
    let mapRef: OLMap;
    let selectedFeatures: Collection<Feature<Point>> = new Collection<
      Feature<Point>
    >();
    const { unitLayer, drawUnits } = useUnitLayer();
    const activeUnitStore = useActiveUnitStore();
    const historyLayer = createHistoryLayer();

    const scenarioStore = useScenarioStore();
    const geoStore = useGeoStore();
    const uiStore = useUiStore();
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
      mapRef.addInteraction(modifyInteraction);

      geoStore.layers = markRaw(olMap.getLayers());
      drawUnits();
      drawHistory();
      const extent = unitLayer.getSource().getExtent();
      if (extent && !unitLayer.getSource().isEmpty())
        mapRef.getView().fit(extent, { padding: [10, 10, 10, 10] });
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
      const existingUnitFeature = unitSource.getFeatureById(
        dragStore.draggedUnit.id
      );

      scenarioStore.addUnitPosition(dragStore.draggedUnit, dropPosition);

      if (existingUnitFeature) {
        existingUnitFeature.setGeometry(new Point(fromLonLat(dropPosition)));
      } else {
        unitSource.addFeature(
          createUnitFeatureAt(dropPosition, dragStore.draggedUnit)
        );
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
      activeUnitStore.activeUnit =
        scenarioStore.getUnitById(selectedUnitId) || null;
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
  const state = (unit.state || []).filter((s) => s.coordinates);
  const geometry = state.map((s) => [...s.coordinates!, s.t]);
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

  modifyInteraction.on(["modifystart", "modifyend"], (evt: ModifyEvent) => {
    mapRef.getTargetElement().style.cursor =
      evt.type === "modifystart" ? "grabbing" : "pointer";
    if (evt.type === "modifyend") {
      const unitFeature = evt.features.pop() as Feature<Point>;
      if (unitFeature) {
        const movedUnit = scenarioStore.getUnitById(unitFeature.getId() ?? "");
        if (!movedUnit) return;
        const newCoordinate = unitFeature.getGeometry()?.getCoordinates();
        if (newCoordinate)
          scenarioStore.addUnitPosition(movedUnit, toLonLat(newCoordinate));
        if (
          activeUnitStore.activeUnit &&
          activeUnitStore.activeUnit === movedUnit
        ) {
          activeUnitStore.clearActiveUnit();
          nextTick(() => activeUnitStore.setActiveUnit(movedUnit));
        }
      }
    }
  });
  const overlaySource = modifyInteraction.getOverlay().getSource();
  overlaySource.on(
    ["addfeature", "removefeature"],
    function (evt: ModifyEvent) {
      mapRef.getTargetElement().style.cursor =
        evt.type === "addfeature" ? "pointer" : "";
    }
  );
  return { modifyInteraction };
}
</script>
