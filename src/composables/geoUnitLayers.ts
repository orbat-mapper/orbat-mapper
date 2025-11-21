import { createUnitFeatureAt, createUnitLayer } from "@/geo/layers";
// import Fade from "ol-ext/featureanimation/Fade";
import { computed, onMounted, onUnmounted, ref, type Ref, unref, watch } from "vue";
import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import { Point } from "ol/geom";
import { DragBox, Modify, Select } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import { Feature } from "ol";
import { type MaybeRef } from "@vueuse/core";
import {
  clearUnitStyleCache,
  createUnitLabelData,
  createUnitStyle,
  labelStyleCache,
  selectedUnitStyleCache,
  unitStyleCache,
} from "@/geo/unitStyles";
import {
  altKeyOnly,
  click as clickCondition,
  platformModifierKeyOnly,
} from "ol/events/condition";
import { SelectEvent } from "ol/interaction/Select";
import { useOlEvent } from "./openlayersHelpers";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { EntityId } from "@/types/base";
import type { TScenario } from "@/scenariostore";
import { useSelectedItems } from "@/stores/selectedStore";
import type { FeatureLike } from "ol/Feature";
import BaseEvent from "ol/events/Event";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { isScenarioFeatureDragItem, isUnitDragItem } from "@/types/draggables";
import type { Coordinate } from "ol/coordinate";
import type { Position } from "geojson";
import { getCoordinateFormatFunction } from "@/utils/geoConvert";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { coordEach } from "@turf/meta";
import { centroid } from "@turf/centroid";

import { klona } from "klona";
import View from "ol/View";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { LayerTypes } from "@/modules/scenarioeditor/featureLayerUtils.ts";

let zoomResolutions: number[] = [];

export function calculateZoomToResolution(view: View) {
  zoomResolutions = [];
  for (let i = 0; i <= 24; i++) {
    zoomResolutions.push(view.getResolutionForZoom(i));
  }
}

calculateZoomToResolution(new View());

const unitLabelStyle = new Style({
  text: new Text({
    textAlign: "center",
    font: '12px "InterVariable"',
    // fill: new Fill({ color: "#aa3300" }),
    fill: new Fill({ color: "black" }),
    stroke: new Stroke({ color: "rgba(255,255,255,0.9)", width: 4 }),
    textBaseline: "top",
  }),
});

const selectedUnitLabelStyle = new Style({
  text: new Text({
    textAlign: "center",
    font: '12px "InterVariable"',
    // fill: new Fill({ color: "#aa3300" }),
    fill: new Fill({ color: "black" }),
    stroke: new Stroke({ color: "rgb(232,230,7)", width: 3 }),
    textBaseline: "top",
  }),
});

export function useUnitLayer({ activeScenario }: { activeScenario?: TScenario } = {}) {
  const scenario = activeScenario || injectStrict(activeScenarioKey);
  const {
    store: { state, onUndoRedo, groupUpdate },
    geo,
    unitActions: { getCombinedSymbolOptions },
    helpers: { getUnitById },
  } = scenario;
  const mapSettings = useMapSettingsStore();

  const unitLayer = createUnitLayer();
  unitLayer.setStyle(unitStyleFunction);

  const labelLayer = new VectorLayer({
    declutter: true,
    source: unitLayer.getSource()!,
    updateWhileInteracting: true,
    updateWhileAnimating: true,
    properties: {
      id: nanoid(),
      title: "Unit labels",
      layerType: LayerTypes.labels,
    },
    style: mapSettings.mapUnitLabelBelow ? labelStyleFunction : undefined,
    visible: mapSettings.mapUnitLabelBelow,
  });

  watch(
    () => mapSettings.mapUnitLabelBelow,
    (v) => {
      labelLayer.setVisible(v);
      labelLayer.setStyle(v ? labelStyleFunction : undefined);
    },
  );

  watch(
    () => mapSettings.mapLabelSize,
    (v) => {
      unitLabelStyle.getText()?.setFont(`${v}px "InterVariable"`);
      selectedUnitLabelStyle.getText()?.setFont(`${v}px "InterVariable"`);
    },
    { immediate: true },
  );

  function unitStyleFunction(feature: FeatureLike, resolution: number) {
    const unitId = feature?.getId() as string;

    const unit = getUnitById(unitId);
    if (!unit) return;
    const { limitVisibility, minZoom = 0, maxZoom = 24 } = unit.style ?? {};

    if (
      limitVisibility &&
      (resolution > zoomResolutions[minZoom ?? 0] ||
        resolution < zoomResolutions[maxZoom ?? 24])
    ) {
      return;
    }

    let unitStyle = unitStyleCache.get(unit._ikey ?? unitId);
    if (!unitStyle) {
      const symbolOptions = getCombinedSymbolOptions(unit);
      const { style, cacheKey } = createUnitStyle(unit, symbolOptions, scenario);
      unitStyle = style;
      unit._ikey = cacheKey;
      unitStyleCache.set(unit._ikey ?? unitId, unitStyle);
    }

    return unitStyle;
  }

  function labelStyleFunction(feature: FeatureLike, resolution: number) {
    const unitId = feature?.getId() as string;

    const unit = getUnitById(unitId);
    const { limitVisibility, minZoom = 0, maxZoom = 24 } = unit.style ?? {};

    if (
      limitVisibility &&
      (resolution > zoomResolutions[minZoom ?? 0] ||
        resolution < zoomResolutions[maxZoom ?? 24])
    ) {
      return;
    }

    let labelData = labelStyleCache.get(unitId);
    if (!unit) return;
    if (!labelData) {
      const unitStyle = unitStyleCache.get(unit._ikey ?? unitId);
      labelData = createUnitLabelData(unit, unitStyle, {
        wrapLabels: mapSettings.mapWrapUnitLabels,
        wrapWidth: mapSettings.mapWrapLabelWidth,
      });

      if (unitStyle) {
        labelStyleCache.set(unitId, labelData);
      }
    }

    const textStyle = unitLabelStyle.getText()!;
    textStyle.setText(labelData.text);
    textStyle.setOffsetY(labelData.yOffset);
    return unitLabelStyle;
  }

  onUndoRedo(() => {
    clearUnitStyleCache();
    state.unitStateCounter++;
  });

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
    // units.forEach((f) =>
    //   //@ts-ignore
    //   unitLayer.animateFeature(f, new Fade({ duration: 1000 }))
    // );
  };
  return { unitLayer, labelLayer, drawUnits, animateUnits };
}

export function useMapDrop(
  mapRef: MaybeRef<OLMap | null | undefined>,
  unitLayer: MaybeRef<VectorLayer<any>>,
) {
  const {
    geo,
    store: { groupUpdate },
    helpers: { getUnitById },
  } = injectStrict(activeScenarioKey);
  const mStore = useMapSettingsStore();
  const { selectedUnitIds } = useSelectedItems();
  let dndCleanup = () => {};
  const isDragging = ref(false);
  const dropPosition = ref<Position>([0, 0]);

  const formattedPosition = computed(() =>
    isDragging.value
      ? getCoordinateFormatFunction(mStore.coordinateFormat)(dropPosition.value)
      : "",
  );

  onMounted(() => {
    const olMap = unref(mapRef)!;
    dndCleanup = dropTargetForElements({
      element: olMap.getTargetElement(),
      canDrop: ({ source }) =>
        isUnitDragItem(source.data) || isScenarioFeatureDragItem(source.data),
      getData: ({ input }) => {
        return { position: toLonLat(olMap.getEventCoordinate(input as MouseEvent)) };
      },
      onDragEnter: () => {
        isDragging.value = true;
      },
      onDragLeave: () => {
        isDragging.value = false;
      },
      onDrag: ({ self }) => {
        dropPosition.value = self.data.position as Coordinate;
      },
      onDrop: ({ source, self }) => {
        const dragData = source.data;
        isDragging.value = false;

        const dropPosition = self.data.position as Coordinate;
        if (isUnitDragItem(dragData)) {
          groupUpdate(() => {
            const selUnits = new Set([...selectedUnitIds.value, dragData.unit.id]);
            for (const unitId of selUnits) {
              const unitSource = unref(unitLayer).getSource();
              const existingUnitFeature = unitSource?.getFeatureById(unitId);

              geo.addUnitPosition(unitId, dropPosition);

              if (existingUnitFeature) {
                existingUnitFeature.setGeometry(new Point(fromLonLat(dropPosition)));
              } else {
                const unit = getUnitById(unitId);
                unit && unitSource?.addFeature(createUnitFeatureAt(dropPosition, unit));
              }
            }
          });
        } else if (isScenarioFeatureDragItem(dragData)) {
          const geometryCenter = centroid(dragData.feature).geometry.coordinates;
          const to = dropPosition;
          const diff = [to[0] - geometryCenter[0], to[1] - geometryCenter[1]];
          const geometryCopy = klona(dragData.feature.geometry);
          coordEach(geometryCopy, (coord) => {
            coord[0] += diff[0];
            coord[1] += diff[1];
          });

          geo.updateFeature(dragData.feature.id, { geometry: geometryCopy });
        }
      },
    });
  });

  onUnmounted(() => dndCleanup());

  return { isDragging, dropPosition, formattedPosition };
}

export function useMoveInteraction(
  mapRef: OLMap,
  unitLayer: VectorLayer,
  enabled: Ref<boolean>,
) {
  const {
    geo,
    unitActions: { isUnitLocked },
    store: { state },
  } = injectStrict(activeScenarioKey);
  const modifyInteraction = new Modify({
    hitDetection: unitLayer,
    source: unitLayer.getSource()!,
  });

  modifyInteraction.on(["modifystart", "modifyend"], (evt) => {
    mapRef.getTargetElement().style.cursor =
      evt.type === "modifystart" ? "grabbing" : "pointer";
    if (evt.type === "modifystart") {
      (evt as ModifyEvent).features.forEach((f) => {
        const unitId = f.getId() as string;
        if (isUnitLocked(unitId)) {
          f.set("_geometry", f.getGeometry()?.clone(), true);
        }
      });
    }
    if (evt.type === "modifyend") {
      const unitFeature = (evt as ModifyEvent).features.pop() as Feature<Point>;
      if (unitFeature) {
        const movedUnitId = unitFeature.getId() as string;
        if (!movedUnitId) return;

        const oldGeometry = unitFeature.get("_geometry");
        if (oldGeometry) {
          unitFeature.setGeometry(oldGeometry);
          unitFeature.set("_geometry", undefined, true);
          return;
        }
        const newCoordinate = unitFeature.getGeometry()?.getCoordinates();
        if (newCoordinate) geo.addUnitPosition(movedUnitId, toLonLat(newCoordinate));
      }
    }
  });
  const overlaySource = modifyInteraction.getOverlay().getSource();
  overlaySource?.on(["addfeature", "removefeature"], function (evt: Event | BaseEvent) {
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
  const mapSettings = useMapSettingsStore();
  let isInternal = false;
  const enableRef = ref(options.enable ?? true);
  const enableBoxSelectRef = ref(options.enableBoxSelect ?? true);

  const { selectedUnitIds: selectedIds, clear: clearSelectedItems } = useSelectedItems();
  const activeScenario = injectStrict(activeScenarioKey);
  const {
    geo,
    unitActions: { getCombinedSymbolOptions },
    helpers: { getUnitById },
  } = activeScenario;

  const unitSelectInteraction = new Select({
    layers,
    style: selectedUnitStyleFunction as any,
    condition: clickCondition,
    removeCondition: altKeyOnly,
  });

  function selectedUnitStyleFunction(feature: FeatureLike, resolution: number) {
    const unitId = feature?.getId() as string;

    const unit = getUnitById(unitId);
    if (!unit) return;
    const { limitVisibility, minZoom = 0, maxZoom = 24 } = unit.style ?? {};

    if (
      limitVisibility &&
      (resolution > zoomResolutions[minZoom ?? 0] ||
        resolution < zoomResolutions[maxZoom ?? 24])
    ) {
      return;
    }
    let unitStyle = selectedUnitStyleCache.get(unit._ikey ?? unitId);

    if (!unitStyle) {
      const symbolOptions = getCombinedSymbolOptions(unit);
      const { style, cacheKey } = createUnitStyle(
        unit,
        {
          ...symbolOptions,
          infoOutlineColor: "yellow",
          infoOutlineWidth: 8,
          outlineColor: "yellow",
          outlineWidth: 21,
        },
        activeScenario,
        "yellow",
      )!;
      unitStyle = style;
      selectedUnitStyleCache.set(unit._ikey ?? unitId, unitStyle);
    }

    if (!mapSettings.mapUnitLabelBelow) return unitStyle;

    let labelData =
      labelStyleCache.get(unitId) ??
      createUnitLabelData(unit, unitStyle, {
        wrapLabels: mapSettings.mapWrapUnitLabels,
        wrapWidth: mapSettings.mapWrapLabelWidth,
      });

    if (labelData) {
      const textStyle = selectedUnitLabelStyle.getText()!;
      textStyle.setText(labelData.text);
      textStyle.setOffsetY(labelData.yOffset);
      return [unitStyle, selectedUnitLabelStyle];
    }

    return unitStyle;
  }

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
            ?.getFeaturesInExtent(extent)
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
        const feature = layers[0]?.getSource()?.getFeatureById(fid);
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
