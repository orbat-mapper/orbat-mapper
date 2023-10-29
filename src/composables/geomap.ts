import { createUnitFeatureAt, createUnitLayer } from "@/geo/layers";
// import Fade from "ol-ext/featureanimation/Fade";
import { ref, Ref, unref, watch } from "vue";
import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import { useDragStore } from "@/stores/dragStore";
import { DragOperations } from "@/types/constants";
import { fromLonLat, toLonLat } from "ol/proj";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { DragBox, Modify, Select } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import { Feature } from "ol";
import { MaybeRef } from "@vueuse/core";
import { createSelectedUnitStyleFromFeature } from "@/geo/unitStyles";
import {
  altKeyOnly,
  click as clickCondition,
  platformModifierKeyOnly,
} from "ol/events/condition";
import { SelectEvent } from "ol/interaction/Select";
import { useOlEvent } from "./openlayersHelpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { EntityId } from "@/types/base";
import { TScenario } from "@/scenariostore";
import { NUnit } from "@/types/internalModels";
import { useSelectedItems } from "@/stores/selectedStore";

export function useUnitLayer({ activeScenario }: { activeScenario?: TScenario } = {}) {
  const {
    geo,
    unitActions: { getCombinedSymbolOptions },
  } = activeScenario || injectStrict(activeScenarioKey);
  const unitLayer = createUnitLayer();
  const drawUnits = () => {
    unitLayer.getSource()?.clear();
    const units = geo.everyVisibleUnit.value.map((unit) => {
      return createUnitFeatureAt(
        unit._state!.location!,
        unit,
        getCombinedSymbolOptions(unit),
      );
    });
    unitLayer.getSource()?.addFeatures(units);
  };

  const animateUnits = () => {
    unitLayer.getSource()?.clear();
    const units = geo.everyVisibleUnit.value.map((unit) => {
      return createUnitFeatureAt(
        unit._state!.location!,
        unit,
        getCombinedSymbolOptions(unit),
      );
    });
    unitLayer.getSource()?.addFeatures(units);
    // units.forEach((f) =>
    //   //@ts-ignore
    //   unitLayer.animateFeature(f, new Fade({ duration: 1000 }))
    // );
  };
  return { unitLayer, drawUnits, animateUnits };
}

export function useDrop(
  mapRef: MaybeRef<OLMap | null | undefined>,
  unitLayer: MaybeRef<VectorLayer<any>>,
) {
  const dragStore = useDragStore();
  const {
    geo,
    unitActions: { getCombinedSymbolOptions },
  } = injectStrict(activeScenarioKey);

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
        unitSource.addFeature(
          createUnitFeatureAt(
            dropPosition,
            dragStore.draggedUnit,
            getCombinedSymbolOptions(dragStore.draggedUnit as unknown as NUnit),
          ),
        );
      }
    }
  };

  return { onDrop };
}

export function useMoveInteraction(
  mapRef: OLMap,
  unitLayer: VectorLayer<VectorSource<Point>>,
  enabled: Ref<boolean>,
) {
  const {
    geo,
    store: { state },
  } = injectStrict(activeScenarioKey);
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
  olMap: OLMap,
  options: Partial<{
    enable: MaybeRef<boolean>;
    enableBoxSelect: MaybeRef<boolean>;
  }> = {},
) {
  let isInternal = false;
  const enableRef = ref(options.enable ?? true);
  const enableBoxSelectRef = ref(options.enableBoxSelect ?? true);

  const {
    selectedUnitIds: selectedIds,
    clear: clearSelectedItems,
    activeUnitId,
  } = useSelectedItems();
  const { geo } = injectStrict(activeScenarioKey);

  const unitSelectInteraction = new Select({
    layers,
    style: createSelectedUnitStyleFromFeature,
    condition: clickCondition,
    removeCondition: altKeyOnly,
  });

  const boxSelectInteraction = new DragBox({ condition: platformModifierKeyOnly });

  const selectedUnitFeatures = unitSelectInteraction.getFeatures();

  watch(
    enableRef,
    (enabled) => {
      unitSelectInteraction.setActive(enabled);
      if (!enabled) selectedUnitFeatures.clear();
    },
    { immediate: true },
  );

  watch(
    enableBoxSelectRef,
    (enabled) => {
      boxSelectInteraction.setActive(enabled);
      selectedUnitFeatures.clear();
    },
    { immediate: true },
  );

  useOlEvent(
    unitSelectInteraction.on("select", (event: SelectEvent) => {
      isInternal = true;
      if (selectedIds.value.size && !event.mapBrowserEvent.originalEvent.shiftKey) {
        clearSelectedItems();
      }
      if (
        selectedUnitFeatures.getLength() === 0 &&
        !event.mapBrowserEvent.originalEvent.shiftKey
      ) {
        clearSelectedItems();
        return;
      }
      event.selected.forEach((f) => selectedIds.value.add(f.getId() as string));
      event.deselected.forEach((f) => selectedIds.value.delete(f.getId() as string));
    }),
  );

  useOlEvent(
    boxSelectInteraction.on("boxend", function () {
      // from https://openlayers.org/en/latest/examples/box-selection.html
      const extent = boxSelectInteraction.getGeometry().getExtent();
      const boxFeatures = layers
        .map((layer) =>
          layer
            .getSource()
            .getFeaturesInExtent(extent)
            .filter((feature: Feature) =>
              feature.getGeometry()!.intersectsExtent(extent),
            ),
        )
        .flat();

      // features that intersect the box geometry are added to the
      // collection of selected features

      // if the view is not obliquely rotated the box geometry and
      // its extent are equalivalent so intersecting features can
      // be added directly to the collection
      const rotation = olMap.getView().getRotation();
      const oblique = rotation % (Math.PI / 2) !== 0;

      // when the view is obliquely rotated the box extent will
      // exceed its geometry so both the box and the candidate
      // feature geometries are rotated around a common anchor
      // to confirm that, with the box geometry aligned with its
      // extent, the geometries intersect
      if (oblique) {
        const anchor = [0, 0];
        const geometry = boxSelectInteraction.getGeometry().clone();
        geometry.rotate(-rotation, anchor);
        const extent = geometry.getExtent();
        boxFeatures.forEach(function (feature) {
          const geometry = feature.getGeometry().clone();
          geometry.rotate(-rotation, anchor);
          if (geometry.intersectsExtent(extent)) {
            selectedIds.value.add(feature.getId() as string);
            // selectedFeatures.push(feature);
          }
        });
      } else {
        boxFeatures.forEach((f) => selectedIds.value.add(f.getId() as string));
      }
    }),
  );

  useOlEvent(
    boxSelectInteraction.on("boxstart", function () {
      clearSelectedItems();
    }),
  );

  watch(
    () => [...selectedIds.value],
    (v) => redrawSelectedLayer(v),
    { immediate: true },
  );

  watch(geo.everyVisibleUnit, () => {
    isInternal = false;
    redrawSelectedLayer([...selectedIds.value]);
  });

  function redrawSelectedLayer(v: EntityId[]) {
    if (!isInternal) {
      selectedUnitFeatures.clear();
      v.forEach((fid) => {
        const feature = layers[0].getSource().getFeatureById(fid);
        if (feature) selectedUnitFeatures.push(feature);
      });
    }
    isInternal = false;
  }

  function redraw() {
    redrawSelectedLayer([...selectedIds.value]);
  }

  return { unitSelectInteraction, isEnabled: enableRef, boxSelectInteraction, redraw };
}
