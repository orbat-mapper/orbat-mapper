import OLMap from "ol/Map";
import type VectorLayer from "ol/layer/Vector";
import type VectorSource from "ol/source/Vector";
import { type MaybeRef, onUnmounted, ref, unref, watch } from "vue";
import Draw, { createBox, DrawEvent } from "ol/interaction/Draw";
import Translate from "ol/interaction/Translate";
import Snap from "ol/interaction/Snap";
import Select from "ol/interaction/Select";
import Layer from "ol/layer/Layer";
import Modify from "ol/interaction/Modify";
import { getSnappableFeatures, useOlEvent } from "./openlayersHelpers";
import {
  click as clickCondition,
  platformModifierKeyOnly,
  primaryAction,
} from "ol/events/condition";
import type Feature from "ol/Feature";
import Collection from "ol/Collection";
import Geometry from "ol/geom/Geometry";
import Polygon from "ol/geom/Polygon";

export type DrawType = "Point" | "LineString" | "Polygon" | "Circle" | "Rectangle";

export interface GeoEditingOptions {
  addMultiple?: MaybeRef<boolean>;
  emit?: (name: "add" | "modify", ...args: any[]) => void;
  select?: Select;
  addHandler?: (feature: Feature, layer: VectorLayer<any>) => void;
  modifyHandler?: (features: Feature[]) => void;
  snap?: MaybeRef<boolean>;
  translate?: MaybeRef<boolean>;
  freehand?: MaybeRef<boolean>;
}

export function useEditingInteraction(
  olMap: OLMap,
  vectorLayer: MaybeRef<VectorLayer>,
  options: GeoEditingOptions = {},
) {
  let snapInteraction: Snap | undefined | null;
  const featureCollection = new Collection<Feature<Geometry>>();

  const layerRef = ref(vectorLayer);
  const snapRef = ref(options.snap ?? true);
  const translateRef = ref(options.translate ?? false);
  const source = layerRef.value.getSource()!;
  const addMultiple = ref<MaybeRef<boolean>>(options.addMultiple ?? false);
  const freehandRef = ref(options.freehand ?? false);
  let currentDrawInteraction: Draw | null | undefined;

  let { lineDraw, polygonDraw, pointDraw, circleDraw, rectangleDraw } =
    initializeDrawInteractions(source, !!unref(freehandRef));

  const currentDrawType = ref<DrawType | null>(null);
  const isModifying = ref(false);
  const isDrawing = ref(false);

  const emit = options.emit;

  function addInteractions() {
    olMap.addInteraction(lineDraw);
    olMap.addInteraction(polygonDraw);
    olMap.addInteraction(pointDraw);
    olMap.addInteraction(circleDraw);
    olMap.addInteraction(rectangleDraw);

    useOlEvent(lineDraw.on("drawend", onDrawEnd));
    useOlEvent(polygonDraw.on("drawend", onDrawEnd));
    useOlEvent(pointDraw.on("drawend", onDrawEnd));
    useOlEvent(circleDraw.on("drawend", onDrawEnd));
    useOlEvent(
      rectangleDraw.on("drawend", (event) => {
        // Tag the box so the editor recognizes it as a rectangle and keeps it
        // axis-aligned. The geometry itself stays a plain Polygon.
        event.feature.set("shape", "rectangle");
        onDrawEnd(event);
      }),
    );
  }

  function removeInteractions() {
    olMap.removeInteraction(lineDraw);
    olMap.removeInteraction(polygonDraw);
    olMap.removeInteraction(pointDraw);
    olMap.removeInteraction(circleDraw);
    olMap.removeInteraction(rectangleDraw);
  }

  addInteractions();

  watch(freehandRef, () => {
    const active = currentDrawInteraction?.getActive();
    removeInteractions();
    ({ lineDraw, polygonDraw, pointDraw, circleDraw, rectangleDraw } =
      initializeDrawInteractions(source, !!unref(freehandRef)));
    addInteractions();
    if (active) {
      if (currentDrawType.value === "LineString") currentDrawInteraction = lineDraw;
      else if (currentDrawType.value === "Polygon") currentDrawInteraction = polygonDraw;
      else if (currentDrawType.value === "Point") currentDrawInteraction = pointDraw;
      else if (currentDrawType.value === "Circle") currentDrawInteraction = circleDraw;
      else if (currentDrawType.value === "Rectangle")
        currentDrawInteraction = rectangleDraw;
      currentDrawInteraction?.setActive(true);
    }
  });

  const select =
    options.select ??
    new Select({
      layers: [layerRef.value as Layer<any, any>],
      hitTolerance: 20,
      condition: clickCondition,
    });
  if (!options.select) {
    olMap.addInteraction(select);
    select.setActive(false);
  }
  const isRectangleFeature = (feature: Feature) => feature.get("shape") === "rectangle";

  // Snapshot of each rectangle's corners at the start of a modify gesture, used
  // to identify the dragged corner and rebuild an axis-aligned box on release.
  const rectangleOriginals = new Map<Feature, number[][]>();

  const modify = new Modify({
    features: select.getFeatures(),
    pixelTolerance: 20,
    // Don't let users insert vertices into a rectangle — that would turn it
    // into an arbitrary polygon. Scope this to the feature under the cursor so a
    // co-selected ordinary polygon can still gain vertices.
    insertVertexCondition: (event) => {
      const selected = select.getFeatures().getArray();
      if (!selected.some(isRectangleFeature)) return true;
      let overRectangle = false;
      olMap.forEachFeatureAtPixel(
        event.pixel,
        (feature) => {
          if (
            isRectangleFeature(feature as Feature) &&
            selected.includes(feature as Feature)
          ) {
            overRectangle = true;
            return true;
          }
          return false;
        },
        { layerFilter: (layer) => layer === layerRef.value, hitTolerance: 20 },
      );
      return !overRectangle;
    },
  });

  useOlEvent(
    modify.on("modifystart", (event) => {
      rectangleOriginals.clear();
      event.features.forEach((feature) => {
        const geometry = feature.getGeometry();
        if (isRectangleFeature(feature) && geometry instanceof Polygon) {
          rectangleOriginals.set(
            feature,
            geometry.getCoordinates()[0].map((coordinate) => [...coordinate]),
          );
        }
      });
    }),
  );

  useOlEvent(
    modify.on("modifyend", (event) => {
      event.features.forEach((feature) => {
        const original = rectangleOriginals.get(feature);
        const geometry = feature.getGeometry();
        if (!original || !(geometry instanceof Polygon)) return;
        const squared = squareRectangleRing(original, geometry.getCoordinates()[0]);
        if (squared) geometry.setCoordinates([squared]);
      });
      rectangleOriginals.clear();
      emit && emit("modify", event.features.getArray());
      options.modifyHandler && options.modifyHandler(event.features.getArray());
    }),
  );
  olMap.addInteraction(modify);
  modify.setActive(false);

  const translateInteraction = new Translate({
    condition: function (event) {
      if (translateRef.value) return true;
      return primaryAction(event) && platformModifierKeyOnly(event);
    },
    features: select.getFeatures(),
  });
  translateInteraction.setActive(true);
  useOlEvent(
    translateInteraction.on("translateend", (event) => {
      emit && emit("modify", event.features.getArray());
      options.modifyHandler && options.modifyHandler(event.features.getArray());
    }),
  );

  olMap.addInteraction(translateInteraction);

  watch(
    snapRef,
    (snap) => {
      if (snap) {
        if (snapInteraction) olMap.removeInteraction(snapInteraction);
        snapInteraction = new Snap({
          features: featureCollection,
        });
        olMap.addInteraction(snapInteraction);
      } else {
        if (snapInteraction) olMap.removeInteraction(snapInteraction);
      }
    },
    { immediate: true },
  );

  function onDrawEnd(e: DrawEvent) {
    if (!unref(addMultiple)) {
      // currentDrawInteraction?.setActive(false);
      // currentDrawType.value = null;
      cancel();
    }
    emit && emit("add", e.feature, layerRef.value);
    options.addHandler && options.addHandler(e.feature, layerRef.value as any);
  }

  function startDrawing(drawType: DrawType) {
    select.setActive(false);
    select.getFeatures().clear();
    isDrawing.value = true;
    stopModify();

    currentDrawInteraction?.setActive(false);
    currentDrawInteraction = null;

    if (drawType === "LineString") currentDrawInteraction = lineDraw;
    if (drawType === "Polygon") currentDrawInteraction = polygonDraw;
    if (drawType === "Point") currentDrawInteraction = pointDraw;
    if (drawType === "Circle") currentDrawInteraction = circleDraw;
    if (drawType === "Rectangle") currentDrawInteraction = rectangleDraw;

    currentDrawInteraction?.setActive(true);
    currentDrawType.value = drawType;
  }

  function stopModify() {
    modify.setActive(false);
    isModifying.value = false;
  }

  function startModify() {
    if (isModifying.value) {
      stopModify();
      return;
    }
    currentDrawInteraction?.setActive(false);
    currentDrawType.value = null;
    isDrawing.value = false;
    select.setActive(true);
    modify.setActive(true);
    isModifying.value = true;
  }

  function cancel() {
    select.setActive(true);
    stopModify();

    currentDrawInteraction?.setActive(false);
    currentDrawInteraction = null;
    currentDrawType.value = null;
    isDrawing.value = false;
  }

  onUnmounted(() => {
    snapInteraction && olMap.removeInteraction(snapInteraction);
    olMap.removeInteraction(pointDraw);
    olMap.removeInteraction(lineDraw);
    olMap.removeInteraction(polygonDraw);
    olMap.removeInteraction(circleDraw);
    olMap.removeInteraction(rectangleDraw);
    if (!options.select) olMap.removeInteraction(select);
    olMap.removeInteraction(modify);
    olMap.removeInteraction(translateInteraction);
  });

  watch(
    [isDrawing, isModifying],
    ([enabledDrawing, enabledModifying]) => {
      const enabled = enabledDrawing || enabledModifying;
      if (enabled && snapRef.value) {
        const features = getSnappableFeatures(olMap);
        featureCollection.clear();
        featureCollection.extend(features);
      } else {
        featureCollection.clear();
      }
    },
    { immediate: true },
  );

  return { startDrawing, currentDrawType, startModify, isModifying, cancel, isDrawing };
}

// Rebuilds an axis-aligned box ring after a single corner was dragged: the
// dragged corner (the one that moved furthest from the original) keeps its new
// position, the diagonally opposite corner stays anchored, and the other two
// follow. Coordinates are in the map projection, where a rectangle is
// axis-aligned. Returns null when the rings are not 4-corner boxes.
function squareRectangleRing(
  original: number[][],
  current: number[][],
): number[][] | null {
  if (original.length < 5 || current.length < 5) return null;
  const originalCorners = original.slice(0, 4);
  const currentCorners = current.slice(0, 4);

  let draggedIndex = 0;
  let maxDistanceSq = -1;
  for (let i = 0; i < 4; i++) {
    const dx = currentCorners[i][0] - originalCorners[i][0];
    const dy = currentCorners[i][1] - originalCorners[i][1];
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq > maxDistanceSq) {
      maxDistanceSq = distanceSq;
      draggedIndex = i;
    }
  }

  const [mx, my] = currentCorners[draggedIndex];
  const [ax, ay] = originalCorners[(draggedIndex + 2) % 4];
  return [
    [mx, my],
    [ax, my],
    [ax, ay],
    [mx, ay],
    [mx, my],
  ];
}

function initializeDrawInteractions(source: VectorSource<any>, freehand = false) {
  const lineDraw = new Draw({ type: "LineString", source, freehand });
  lineDraw.setActive(false);

  const polygonDraw = new Draw({ type: "Polygon", source, freehand });
  polygonDraw.setActive(false);

  const pointDraw = new Draw({ type: "Point", source });
  pointDraw.setActive(false);

  const circleDraw = new Draw({ type: "Circle", source });
  circleDraw.setActive(false);

  // A rectangle is a box-shaped Polygon: draw with type "Circle" plus the box
  // geometryFunction so two clicks define opposite corners.
  const rectangleDraw = new Draw({
    type: "Circle",
    source,
    geometryFunction: createBox(),
  });
  rectangleDraw.setActive(false);

  return { lineDraw, polygonDraw, pointDraw, circleDraw, rectangleDraw };
}
