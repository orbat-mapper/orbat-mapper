import { createUnitFeatureAt, createUnitLayer } from "@/geo/layers";
// import Fade from "ol-ext/featureanimation/Fade";
import {
  computed,
  type MaybeRef,
  onMounted,
  onUnmounted,
  ref,
  type Ref,
  unref,
  watch,
} from "vue";
import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import { Point } from "ol/geom";
import { DragBox, Modify, Select } from "ol/interaction";
import PointerInteraction from "ol/interaction/Pointer";
import { ModifyEvent } from "ol/interaction/Modify";
import { Feature } from "ol";
import type { MapBrowserEvent } from "ol";

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
const ROTATION_EPSILON = 1e-6;

function normalizeRotation(rotation: number): number {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function toHeadingFromNorthDegrees(center: Coordinate, point: Coordinate): number {
  const dx = point[0] - center[0];
  const dy = point[1] - center[1];
  const angleFromEast = (Math.atan2(dy, dx) * 180) / Math.PI;
  return normalizeRotation(90 - angleFromEast);
}

function shortestRotationDelta(nextAngle: number, prevAngle: number) {
  let delta = normalizeRotation(nextAngle - prevAngle);
  if (delta > 180) delta -= 360;
  return delta;
}

function setMapCursor(mapRef: OLMap, cursor: string) {
  const targetElement = mapRef.getTargetElement();
  if (!targetElement) return;
  targetElement.style.cursor = cursor;
}

function getFeatureRotationRadians(feature: FeatureLike, fallbackDegrees = 0): number {
  const temporaryRotation = feature.get("_symbolRotation");
  const symbolRotationDeg =
    typeof temporaryRotation === "number" ? temporaryRotation : fallbackDegrees;
  return (normalizeRotation(symbolRotationDeg) * Math.PI) / 180;
}

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
    font: '12px "Inter Variable"',
    // fill: new Fill({ color: "#aa3300" }),
    fill: new Fill({ color: "black" }),
    stroke: new Stroke({ color: "rgba(255,255,255,0.9)", width: 4 }),
    textBaseline: "top",
  }),
});

const selectedUnitLabelStyle = new Style({
  text: new Text({
    textAlign: "center",
    font: '12px "Inter Variable"',
    // fill: new Fill({ color: "#aa3300" }),
    fill: new Fill({ color: "black" }),
    stroke: new Stroke({ color: "rgb(232,230,7)", width: 3 }),
    textBaseline: "top",
  }),
});

export function useUnitLayer({ activeScenario }: { activeScenario?: TScenario } = {}) {
  const scenario = activeScenario || injectStrict(activeScenarioKey);
  const {
    store: { state, onUndoRedo },
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
      unitLabelStyle.getText()?.setFont(`${v}px "Inter Variable"`);
      selectedUnitLabelStyle.getText()?.setFont(`${v}px "Inter Variable"`);
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

    const temporaryRotation = feature.get("_symbolRotation");
    if (typeof temporaryRotation === "number") {
      const symbolOptions = getCombinedSymbolOptions(unit);
      const { style } = createUnitStyle(
        unit,
        symbolOptions,
        scenario,
        undefined,
        temporaryRotation,
      );
      return style;
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
    textStyle.setRotation(
      getFeatureRotationRadians(feature, unit._state?.symbolRotation ?? 0),
    );
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
  unitLayer: MaybeRef<VectorLayer>,
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
                if (unit) {
                  unitSource?.addFeature(createUnitFeatureAt(dropPosition, unit));
                }
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
  } = injectStrict(activeScenarioKey);
  const modifyInteraction = new Modify({
    hitDetection: unitLayer,
    source: unitLayer.getSource()!,
  });

  modifyInteraction.on(["modifystart", "modifyend"], (evt) => {
    setMapCursor(mapRef, evt.type === "modifystart" ? "grabbing" : "pointer");
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
    setMapCursor(mapRef, evt.type === "addfeature" ? "pointer" : "");
  });

  watch(enabled, (v) => modifyInteraction.setActive(v), { immediate: true });
  return { moveInteraction: modifyInteraction };
}

export function useRotateInteraction(
  mapRef: OLMap,
  unitLayer: VectorLayer,
  enabled: Ref<boolean>,
) {
  const {
    unitActions: { addUnitStateEntry, getUnitById, isUnitLocked },
    store: { state, groupUpdate },
  } = injectStrict(activeScenarioKey);
  const { selectedUnitIds } = useSelectedItems();

  let anchor: Coordinate | null = null;
  let startHeading = 0;
  let isRotating = false;
  const previewUnitIds = new Set<EntityId>();
  let targets: { id: EntityId; initialRotation: number; rotation: number }[] = [];

  function getUnitFeatureAtEvent(
    event: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>,
  ): Feature<Point> | undefined {
    return mapRef.forEachFeatureAtPixel(
      event.pixel,
      (feature, layer) => {
        if (layer !== unitLayer) return undefined;
        return feature as Feature<Point>;
      },
      { hitTolerance: 4 },
    );
  }

  function setPreviewRotation(unitId: EntityId, rotation: number) {
    const feature = unitLayer.getSource()?.getFeatureById(unitId);
    if (!feature) return;
    feature.set("_symbolRotation", rotation);
    previewUnitIds.add(unitId);
  }

  function clearPreviewRotation() {
    for (const unitId of previewUnitIds) {
      const feature = unitLayer.getSource()?.getFeatureById(unitId);
      feature?.unset("_symbolRotation");
    }
    previewUnitIds.clear();
  }

  function cancelRotation() {
    isRotating = false;
    anchor = null;
    targets = [];
    clearPreviewRotation();
    setMapCursor(mapRef, "");
  }

  const rotateInteraction = new PointerInteraction({
    handleDownEvent: (event) => {
      if (!enabled.value) return false;
      if ((event.originalEvent as PointerEvent).button !== 0) return false;
      const clickedFeature = getUnitFeatureAtEvent(event);
      const clickedUnitId = clickedFeature?.getId() as EntityId | undefined;
      if (!clickedUnitId) return false;

      const candidateIds = selectedUnitIds.value.has(clickedUnitId)
        ? [...selectedUnitIds.value]
        : [clickedUnitId];
      const selectedTargets = candidateIds
        .map((id) => getUnitById(id))
        .filter((u) => !!u && !isUnitLocked(u.id) && !!u._state?.location);
      if (!selectedTargets.length) return false;

      const anchorCoordinates = selectedTargets
        .map((u) => unitLayer.getSource()?.getFeatureById(u.id))
        .map((f) => (f as Feature<Point> | undefined)?.getGeometry()?.getCoordinates())
        .filter((c): c is Coordinate => !!c);
      if (!anchorCoordinates.length) return false;

      const anchorX =
        anchorCoordinates.reduce((sum, c) => sum + c[0], 0) / anchorCoordinates.length;
      const anchorY =
        anchorCoordinates.reduce((sum, c) => sum + c[1], 0) / anchorCoordinates.length;
      anchor = [anchorX, anchorY];

      startHeading = toHeadingFromNorthDegrees(anchor, event.coordinate);
      targets = selectedTargets.map((unit) => {
        const rotation = normalizeRotation(unit._state?.symbolRotation ?? 0);
        setPreviewRotation(unit.id, rotation);
        return { id: unit.id, initialRotation: rotation, rotation };
      });
      isRotating = true;
      setMapCursor(mapRef, "grabbing");
      return true;
    },
    handleDragEvent: (event) => {
      if (!isRotating || !anchor) return;
      const currentHeading = toHeadingFromNorthDegrees(anchor, event.coordinate);
      const delta = shortestRotationDelta(currentHeading, startHeading);
      targets.forEach((target) => {
        target.rotation = normalizeRotation(target.initialRotation + delta);
        setPreviewRotation(target.id, target.rotation);
      });
    },
    handleMoveEvent: (event) => {
      if (!enabled.value || isRotating) return;
      const hovered = getUnitFeatureAtEvent(event);
      setMapCursor(mapRef, hovered ? "grab" : "");
    },
    handleUpEvent: () => {
      if (!isRotating) return false;
      const changedTargets = targets.filter(
        (target) => Math.abs(target.rotation - target.initialRotation) > ROTATION_EPSILON,
      );
      if (changedTargets.length) {
        groupUpdate(() => {
          changedTargets.forEach((target) => {
            addUnitStateEntry(
              target.id,
              { t: state.currentTime, symbolRotation: target.rotation },
              true,
            );
          });
        });
      }
      cancelRotation();
      return false;
    },
    stopDown: (handled) => handled,
  });

  watch(
    enabled,
    (v) => {
      rotateInteraction.setActive(v);
      if (!v) cancelRotation();
    },
    { immediate: true },
  );

  onUnmounted(() => {
    cancelRotation();
  });

  return { rotateInteraction };
}

export function useUnitSelectInteraction(
  layers: VectorLayer[],
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
    style: selectedUnitStyleFunction,
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
    const temporaryRotation = feature.get("_symbolRotation");
    let unitStyle =
      typeof temporaryRotation === "number"
        ? undefined
        : selectedUnitStyleCache.get(unit._ikey ?? unitId);

    if (!unitStyle) {
      const symbolOptions = getCombinedSymbolOptions(unit);
      const { style } = createUnitStyle(
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
        typeof temporaryRotation === "number" ? temporaryRotation : undefined,
      )!;
      unitStyle = style;
      if (typeof temporaryRotation !== "number") {
        selectedUnitStyleCache.set(unit._ikey ?? unitId, unitStyle);
      }
    }

    if (!mapSettings.mapUnitLabelBelow) return unitStyle;

    const labelData =
      labelStyleCache.get(unitId) ??
      createUnitLabelData(unit, unitStyle, {
        wrapLabels: mapSettings.mapWrapUnitLabels,
        wrapWidth: mapSettings.mapWrapLabelWidth,
      });

    if (labelData) {
      const textStyle = selectedUnitLabelStyle.getText()!;
      textStyle.setText(labelData.text);
      textStyle.setOffsetY(labelData.yOffset);
      textStyle.setRotation(
        getFeatureRotationRadians(feature, unit._state?.symbolRotation ?? 0),
      );
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
