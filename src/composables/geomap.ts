import { createUnitFeatureAt, createUnitLayer } from "../geo/layers";
import { useScenarioStore } from "../stores/scenarioStore";
import Fade from "ol-ext/featureanimation/Fade";
import { nextTick, Ref, unref, watch } from "vue";
import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import { useActiveUnitStore, useDragStore } from "../stores/dragStore";
import { DragOperations } from "../types/constants";
import { fromLonLat, toLonLat } from "ol/proj";
import { LineString, Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { Modify, Select } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import { Collection, Feature } from "ol";
import { MaybeRef, useEventBus } from "@vueuse/core";
import { mapUnitClick } from "../components/eventKeys";
import { createSelectedUnitStyleFromFeature } from "../geo/styles";
import { click } from "ol/events/condition";
import { SelectEvent } from "ol/interaction/Select";
import { Unit } from "../types/scenarioModels";
import GeometryLayout from "ol/geom/GeometryLayout";
import { useOlEvent } from "./openlayersHelpers";

export function useUnitLayer() {
  const scenarioStore = useScenarioStore();
  const unitLayer = createUnitLayer();
  const drawUnits = () => {
    unitLayer.getSource().clear();
    const units = scenarioStore.everyVisibleUnits.map((unit) => {
      return createUnitFeatureAt(unit._state!.location!, unit);
    });
    unitLayer.getSource().addFeatures(units);
  };

  const animateUnits = () => {
    unitLayer.getSource().clear();
    const units = scenarioStore.everyVisibleUnits.map((unit) => {
      return createUnitFeatureAt(unit._state!.location!, unit);
    });
    unitLayer.getSource().addFeatures(units);
    units.forEach((f) =>
      //@ts-ignore
      unitLayer.animateFeature(f, new Fade({ duration: 1000 }))
    );
  };

  return { unitLayer, drawUnits, animateUnits };
}

export function useDrop(
  mapRef: MaybeRef<OLMap | null | undefined>,
  unitLayer: MaybeRef<VectorLayer<any>>
) {
  const dragStore = useDragStore();
  const scenarioStore = useScenarioStore();

  const onDrop = (ev: DragEvent) => {
    const olMap = unref(mapRef);

    ev.preventDefault();
    if (
      olMap &&
      ev.dataTransfer &&
      ev.dataTransfer.getData("text") === DragOperations.OrbatDrag &&
      dragStore.draggedUnit
    ) {
      const dropPosition = toLonLat(olMap.getEventCoordinate(ev));
      const unitSource = unref(unitLayer).getSource();
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

export function useModifyInteraction(
  mapRef: OLMap,
  unitLayer: VectorLayer<VectorSource<Point>>,
  enabled: Ref<boolean>
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

  watch(enabled, (v) => modifyInteraction.setActive(v), { immediate: true });
  return { modifyInteraction };
}

export function useSelectInteraction(
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
  useOlEvent(selectInteraction.on("select", onSelect));

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

export function createHistoryFeature(unit: Unit): Feature<LineString> {
  const state = [{ location: unit.location }, ...(unit.state || [])].filter(
    (s) => s?.location
  );
  // @ts-ignore
  const geometry = state.map((s) => [...s.location!, s.t]);
  const t = new LineString(geometry, GeometryLayout.XYM);
  t.transform("EPSG:4326", "EPSG:3857");
  return new Feature(t);
}
