import { createUnitFeatureAt, createUnitLayer } from "@/geo/layers";
import Fade from "ol-ext/featureanimation/Fade";
import { nextTick, Ref, unref, watch } from "vue";
import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import { useDragStore } from "@/stores/dragStore";
import { DragOperations } from "@/types/constants";
import { fromLonLat, toLonLat } from "ol/proj";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { Modify, Select } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import { Collection, Feature } from "ol";
import { MaybeRef, useEventBus } from "@vueuse/core";
import { mapUnitClick } from "@/components/eventKeys";
import { createSelectedUnitStyleFromFeature } from "@/geo/unitStyles";
import { click as clickCondition } from "ol/events/condition";
import { SelectEvent } from "ol/interaction/Select";
import { useOlEvent } from "./openlayersHelpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import { EntityId } from "@/types/base";
import { TScenario } from "@/scenariostore";
import { createHistoryFeature } from "@/geo/history";

export function useUnitLayer({ activeScenario }: { activeScenario?: TScenario } = {}) {
  const { geo } = activeScenario || injectStrict(activeScenarioKey);
  const unitLayer = createUnitLayer();
  const drawUnits = () => {
    unitLayer.getSource()?.clear();
    const units = geo.everyVisibleUnit.value.map((unit) => {
      return createUnitFeatureAt(unit._state!.location!, unit);
    });
    unitLayer.getSource()?.addFeatures(units);
  };

  const animateUnits = () => {
    unitLayer.getSource()?.clear();
    const units = geo.everyVisibleUnit.value.map((unit) => {
      return createUnitFeatureAt(unit._state!.location!, unit);
    });
    unitLayer.getSource()?.addFeatures(units);
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
  const { geo } = injectStrict(activeScenarioKey);

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

      geo.addUnitPosition(dragStore.draggedUnit.id, dropPosition);

      if (existingUnitFeature) {
        existingUnitFeature.setGeometry(new Point(fromLonLat(dropPosition)));
      } else {
        unitSource.addFeature(createUnitFeatureAt(dropPosition, dragStore.draggedUnit));
      }
    }
  };

  return { onDrop };
}

export function useMoveInteraction(
  mapRef: OLMap,
  unitLayer: VectorLayer<VectorSource<Point>>,
  enabled: Ref<boolean>
) {
  const {
    geo,
    store: { state },
  } = injectStrict(activeScenarioKey);
  const activeUnitId = injectStrict(activeUnitKey);
  const modifyInteraction = new Modify({
    hitDetection: unitLayer,
    source: unitLayer.getSource()!,
  });

  modifyInteraction.on(["modifystart", "modifyend"], (evt) => {
    mapRef.getTargetElement().style.cursor =
      evt.type === "modifystart" ? "grabbing" : "pointer";
    if (evt.type === "modifyend") {
      const unitFeature = (evt as ModifyEvent).features.pop() as Feature<Point>;
      if (unitFeature) {
        const movedUnitId = unitFeature.getId() as string;
        if (!movedUnitId) return;
        const newCoordinate = unitFeature.getGeometry()?.getCoordinates();
        if (newCoordinate) geo.addUnitPosition(movedUnitId, toLonLat(newCoordinate));
        if (activeUnitId.value === movedUnitId) {
          nextTick(() => (activeUnitId.value = movedUnitId));
        }
      }
    }
  });
  const overlaySource = modifyInteraction.getOverlay().getSource();
  overlaySource.on(["addfeature", "removefeature"], function (evt: ModifyEvent) {
    mapRef.getTargetElement().style.cursor = evt.type === "addfeature" ? "pointer" : "";
  });

  watch(enabled, (v) => modifyInteraction.setActive(v), { immediate: true });
  return { moveInteraction: modifyInteraction };
}

export function useSelectInteraction(
  layers: VectorLayer<any>[],
  selectedFeatures: Collection<Feature<Point>>,
  historyLayer: VectorLayer<any>
) {
  const bus = useEventBus(mapUnitClick);
  const activeUnitId = injectStrict(activeUnitKey);
  const {
    geo,
    store: { state },
  } = injectStrict(activeScenarioKey);

  const selectInteraction = new Select({
    layers,
    style: createSelectedUnitStyleFromFeature,
    condition: clickCondition,
    features: selectedFeatures,
  });
  useOlEvent(selectInteraction.on("select", onSelect));

  function onSelect(evt: SelectEvent) {
    const selectedUnitId = evt.selected.map((f) => f.getId())[0] as string;
    if (selectedUnitId) {
      const selectedUnit = state.getUnitById(selectedUnitId);
      bus.emit(selectedUnit);
      activeUnitId.value = selectedUnitId;

      selectUnit(selectedUnitId);
    } else {
      historyLayer.getSource().clear();
    }
  }

  function selectUnit(unitId: EntityId) {
    const historyLayerSource = historyLayer.getSource();
    historyLayerSource.clear(true);

    const existingFeature = layers[0].getSource().getFeatureById(unitId);
    selectedFeatures.clear();
    const unit = state.getUnitById(unitId);
    if (existingFeature) {
      const historyFeature = createHistoryFeature(unit);
      historyLayerSource.addFeature(historyFeature);
      selectedFeatures.push(existingFeature);
    }
  }

  watch(activeUnitId, (unitId) => {
    if (unitId) selectUnit(unitId);
    else selectedFeatures.clear();
  });
  watch(geo.everyVisibleUnit, () => {
    const activeUnit = activeUnitId.value;
    if (activeUnit) selectUnit(activeUnit);
  });

  return { selectInteraction };
}
