import { createUnitFeatureAt, createUnitLayer } from "@/geo/layers";
import Fade from "ol-ext/featureanimation/Fade";
import { nextTick, ref, Ref, unref, watch } from "vue";
import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import { useDragStore, useSelectedUnits } from "@/stores/dragStore";
import { DragOperations } from "@/types/constants";
import { fromLonLat, toLonLat } from "ol/proj";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { Modify, Select } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import { Feature } from "ol";
import { MaybeRef } from "@vueuse/core";
import { createSelectedUnitStyleFromFeature } from "@/geo/unitStyles";
import { altKeyOnly, click as clickCondition } from "ol/events/condition";
import { SelectEvent } from "ol/interaction/Select";
import { useOlEvent } from "./openlayersHelpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import { EntityId } from "@/types/base";
import { TScenario } from "@/scenariostore";

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

export function useUnitSelectInteraction(
  layers: VectorLayer<any>[],
  options: Partial<{
    enable: MaybeRef<boolean>;
  }> = {}
) {
  let isInternal = false;
  const enableRef = ref(options.enable ?? true);

  const { selectedUnitIds: selectedIds } = useSelectedUnits();
  const { geo } = injectStrict(activeScenarioKey);

  const unitSelectInteraction = new Select({
    layers,
    style: createSelectedUnitStyleFromFeature,
    condition: clickCondition,
    removeCondition: altKeyOnly,
  });
  const selectedFeatures = unitSelectInteraction.getFeatures();

  watch(
    enableRef,
    (enabled) => {
      unitSelectInteraction.setActive(enabled);
      if (!enabled) unitSelectInteraction.getFeatures().clear();
    },
    { immediate: true }
  );

  useOlEvent(
    unitSelectInteraction.on("select", (event: SelectEvent) => {
      isInternal = true;
      event.selected.forEach((f) => selectedIds.value.add(f.getId() as string));
      event.deselected.forEach((f) => selectedIds.value.delete(f.getId() as string));
    })
  );

  /*function selectUnit(unitId: EntityId) {
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
  }*/

  watch(
    () => [...selectedIds.value],
    (v) => redrawSelectedLayer(v),
    { immediate: true }
  );

  watch(geo.everyVisibleUnit, () => {
    isInternal = false;
    redrawSelectedLayer([...selectedIds.value]);
  });

  function redrawSelectedLayer(v: EntityId[]) {
    if (!isInternal) {
      selectedFeatures.clear();
      v.forEach((fid) => {
        const feature = layers[0].getSource().getFeatureById(fid);
        if (feature) selectedFeatures.push(feature);
      });
    }
    isInternal = false;
  }

  return { unitSelectInteraction, isEnabled: enableRef };
}
