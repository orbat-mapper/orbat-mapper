import OLMap from "ol/Map";
import { type MaybeRef } from "@vueuse/core";
import type VectorLayer from "ol/layer/Vector";
import type VectorSource from "ol/source/Vector";
import { onUnmounted, ref, unref, watch } from "vue";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import Translate from "ol/interaction/Translate";
import Snap from "ol/interaction/Snap";
import Select from "ol/interaction/Select";
import Layer from "ol/layer/Layer";
import { Modify } from "ol/interaction";
import { getSnappableFeatures, useOlEvent } from "./openlayersHelpers";
import {
  click as clickCondition,
  platformModifierKeyOnly,
  primaryAction,
} from "ol/events/condition";
import type Feature from "ol/Feature";
import { Collection } from "ol";
import { Geometry } from "ol/geom";

export type DrawType = "Point" | "LineString" | "Polygon" | "Circle";

export interface GeoEditingOptions {
  addMultiple?: MaybeRef<boolean>;
  emit?: (name: "add" | "modify", ...args: any[]) => void;
  select?: Select;
  addHandler?: (feature: Feature, layer: VectorLayer<any>) => void;
  modifyHandler?: (features: Feature[]) => void;
  snap?: MaybeRef<boolean>;
  translate?: MaybeRef<boolean>;
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
  let currentDrawInteraction: Draw | null | undefined;
  const source = layerRef.value.getSource()!;
  const { lineDraw, polygonDraw, pointDraw, circleDraw } =
    initializeDrawInteractions(source);

  const currentDrawType = ref<DrawType | null>(null);
  const isModifying = ref(false);
  const isDrawing = ref(false);

  const emit = options.emit;
  const addMultiple = ref<MaybeRef<boolean>>(options.addMultiple ?? false);

  olMap.addInteraction(lineDraw);
  olMap.addInteraction(polygonDraw);
  olMap.addInteraction(pointDraw);
  olMap.addInteraction(circleDraw);

  useOlEvent(lineDraw.on("drawend", onDrawEnd));
  useOlEvent(polygonDraw.on("drawend", onDrawEnd));
  useOlEvent(pointDraw.on("drawend", onDrawEnd));
  useOlEvent(circleDraw.on("drawend", onDrawEnd));

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
  const modify = new Modify({ features: select.getFeatures(), pixelTolerance: 20 });

  useOlEvent(
    modify.on("modifyend", (event) => {
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

function initializeDrawInteractions(source: VectorSource<any>) {
  const lineDraw = new Draw({ type: "LineString", source });
  lineDraw.setActive(false);

  const polygonDraw = new Draw({ type: "Polygon", source });
  polygonDraw.setActive(false);

  const pointDraw = new Draw({ type: "Point", source });
  pointDraw.setActive(false);

  const circleDraw = new Draw({ type: "Circle", source });
  circleDraw.setActive(false);

  return { lineDraw, polygonDraw, pointDraw, circleDraw };
}
