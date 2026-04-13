import type { Map as MlMap } from "maplibre-gl";
import bboxPolygon from "@turf/bbox-polygon";
import { toBbox, type Bbox, type BoxDrawEngine } from "./boxDrawEngine";

const ML_BOX_SOURCE = "__boxDrawSource";
const ML_BOX_FILL = "__boxDrawFill";
const ML_BOX_LINE = "__boxDrawLine";

export function createMLBoxDrawEngine(mlMap: MlMap): BoxDrawEngine {
  let start: [number, number] | null = null;
  let clickHandler: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  let mouseMoveHandler: ((e: maplibregl.MapMouseEvent) => void) | null = null;

  function addPreviewLayers() {
    if (!mlMap.getSource(ML_BOX_SOURCE)) {
      mlMap.addSource(ML_BOX_SOURCE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!mlMap.getLayer(ML_BOX_FILL)) {
      mlMap.addLayer({
        id: ML_BOX_FILL,
        type: "fill",
        source: ML_BOX_SOURCE,
        paint: { "fill-color": "rgba(59, 130, 246, 0.15)" },
      });
    }
    if (!mlMap.getLayer(ML_BOX_LINE)) {
      mlMap.addLayer({
        id: ML_BOX_LINE,
        type: "line",
        source: ML_BOX_SOURCE,
        paint: {
          "line-color": "#3b82f6",
          "line-width": 2,
          "line-dasharray": [4, 4],
        },
      });
    }
  }

  function updatePreview(current: [number, number]) {
    if (!start) return;
    const source = mlMap.getSource(ML_BOX_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(bboxPolygon(toBbox(start, current)));
  }

  function removePreviewLayers() {
    if (mlMap.getLayer(ML_BOX_LINE)) mlMap.removeLayer(ML_BOX_LINE);
    if (mlMap.getLayer(ML_BOX_FILL)) mlMap.removeLayer(ML_BOX_FILL);
    if (mlMap.getSource(ML_BOX_SOURCE)) mlMap.removeSource(ML_BOX_SOURCE);
  }

  return {
    start(onEnd) {
      mlMap.getCanvas().style.cursor = "crosshair";

      mouseMoveHandler = (e: maplibregl.MapMouseEvent) => {
        mlMap.getCanvas().style.cursor = "crosshair";
        if (!start) return;
        updatePreview([e.lngLat.lng, e.lngLat.lat]);
      };

      mlMap.on("mousemove", mouseMoveHandler);

      clickHandler = (e: maplibregl.MapMouseEvent) => {
        if (!start) {
          start = [e.lngLat.lng, e.lngLat.lat];
          addPreviewLayers();
        } else {
          const end: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          const bbox = toBbox(start, end);
          onEnd(bbox);
        }
      };

      mlMap.on("click", clickHandler);
    },

    cleanUp() {
      if (clickHandler) mlMap.off("click", clickHandler);
      if (mouseMoveHandler) mlMap.off("mousemove", mouseMoveHandler);
      clickHandler = null;
      mouseMoveHandler = null;
      start = null;
      removePreviewLayers();
    },
  };
}
