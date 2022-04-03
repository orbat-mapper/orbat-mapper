import OLMap from "ol/Map";
import { MaybeRef } from "@vueuse/core";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { onUnmounted, ref, unref } from "vue";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import Snap from "ol/interaction/Snap";
import Select from "ol/interaction/Select";
import Layer from "ol/layer/Layer";
import { Modify } from "ol/interaction";
import { useOlEvent } from "./openlayersHelpers";

export type DrawType = "Point" | "LineString" | "Polygon" | "Circle";

export interface GeoEditingOptions {
  addMultiple?: MaybeRef<boolean>;
  emit?: (name: "add" | "modify", ...args: any[]) => void;
}

export function useEditingInteraction(
  olMap: OLMap,
  vectorLayer: MaybeRef<VectorLayer<VectorSource<any>>>,
  options?: GeoEditingOptions
) {
  const layerRef = ref(vectorLayer);
  let currentDrawInteraction: Draw | null | undefined;
  const source = layerRef.value.getSource()!;
  const { lineDraw, polygonDraw, pointDraw, circleDraw } =
    initializeDrawInteractions(source);

  const currentDrawType = ref<DrawType | null>(null);
  const isModifying = ref(false);
  const emit = options?.emit;
  const addMultiple = ref<MaybeRef<boolean>>(options?.addMultiple || false);

  olMap.addInteraction(lineDraw);
  olMap.addInteraction(polygonDraw);
  olMap.addInteraction(pointDraw);
  olMap.addInteraction(circleDraw);

  const select = new Select({
    layers: [layerRef.value as Layer<any, any>],
    hitTolerance: 20,
  });
  olMap.addInteraction(select);
  select.setActive(false);
  const modify = new Modify({ features: select.getFeatures(), pixelTolerance: 20 });

  useOlEvent(modify.on("modifyend", (event) => emit && emit("modify", event.features)));
  olMap.addInteraction(modify);
  modify.setActive(false);

  const snap = new Snap({ source });
  olMap.addInteraction(snap);

  function startDrawing(drawType: DrawType) {
    select.setActive(false);
    stopModify();

    currentDrawInteraction?.setActive(false);
    currentDrawInteraction = null;

    if (drawType === "LineString") currentDrawInteraction = lineDraw;
    if (drawType === "Polygon") currentDrawInteraction = polygonDraw;
    if (drawType === "Point") currentDrawInteraction = pointDraw;
    if (drawType === "Circle") currentDrawInteraction = circleDraw;

    currentDrawInteraction?.setActive(true);
    currentDrawType.value = drawType;
    currentDrawInteraction?.once("drawend", (e: DrawEvent) => {
      if (!unref(addMultiple)) {
        currentDrawInteraction?.setActive(false);
        currentDrawType.value = null;
      }
      emit && emit("add", e.feature);
    });
  }

  function stopModify() {
    modify.setActive(false);
    isModifying.value = false;
    select.getFeatures().clear();
  }

  function startModify() {
    if (isModifying.value) {
      stopModify();
      return;
    }
    currentDrawInteraction?.setActive(false);
    currentDrawType.value = null;
    select.setActive(true);
    modify.setActive(true);
    isModifying.value = true;
  }

  function cancel() {
    select.setActive(false);
    stopModify();

    currentDrawInteraction?.setActive(false);
    currentDrawInteraction = null;
    currentDrawType.value = null;
  }

  onUnmounted(() => {
    olMap.removeInteraction(snap);
    olMap.removeInteraction(pointDraw);
    olMap.removeInteraction(lineDraw);
    olMap.removeInteraction(polygonDraw);
    olMap.removeInteraction(circleDraw);
    olMap.removeInteraction(select);
    olMap.removeInteraction(modify);
  });

  return { startDrawing, currentDrawType, startModify, isModifying, cancel };
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
