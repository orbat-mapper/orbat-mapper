import OLMap from "ol/Map";
import { MaybeRef } from "@vueuse/core";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { onUnmounted, ref } from "vue";
import Draw from "ol/interaction/Draw";
import Snap from "ol/interaction/Snap";
import Select from "ol/interaction/Select";
import Layer from "ol/layer/Layer";
import { Modify } from "ol/interaction";

export type DrawType = "Point" | "LineString" | "Polygon";

export function useEditingInteraction(
  olMap: OLMap,
  vectorLayer: MaybeRef<VectorLayer<VectorSource<any>>>
) {
  const layerRef = ref(vectorLayer);
  let currentDrawInteraction: Draw | null | undefined;
  const source = layerRef.value.getSource()!;
  const { lineDraw, polygonDraw, pointDraw } = initializeDrawInteractions(source);

  const currentDrawType = ref<DrawType | null>(null);
  const isModifying = ref(false);

  olMap.addInteraction(lineDraw);
  olMap.addInteraction(polygonDraw);
  olMap.addInteraction(pointDraw);

  const select = new Select({
    layers: [layerRef.value as Layer<any, any>],
    hitTolerance: 20,
  });
  olMap.addInteraction(select);
  select.setActive(false);

  const modify = new Modify({ features: select.getFeatures(), pixelTolerance: 20 });
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

    currentDrawInteraction?.setActive(true);
    currentDrawType.value = drawType;
    currentDrawInteraction?.once("drawend", () => {
      currentDrawInteraction?.setActive(false);
      currentDrawType.value = null;
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

  onUnmounted(() => {
    olMap.removeInteraction(snap);
    olMap.removeInteraction(lineDraw);
    olMap.removeInteraction(polygonDraw);
    olMap.removeInteraction(select);
    olMap.removeInteraction(modify);
  });

  return { startDrawing, currentDrawType, startModify, isModifying };
}

function initializeDrawInteractions(source: VectorSource<any>) {
  const lineDraw = new Draw({ type: "LineString", source });
  lineDraw.setActive(false);

  const polygonDraw = new Draw({ type: "Polygon", source });
  polygonDraw.setActive(false);

  const pointDraw = new Draw({ type: "Point", source });
  pointDraw.setActive(false);
  return { lineDraw, polygonDraw, pointDraw };
}
