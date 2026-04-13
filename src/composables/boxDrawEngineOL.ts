import OLMap from "ol/Map";
import Draw, { createBox } from "ol/interaction/Draw";
import { transformExtent } from "ol/proj";
import type { Bbox, BoxDrawEngine } from "./boxDrawEngine";

export function createOLBoxDrawEngine(olMap: OLMap): BoxDrawEngine {
  let drawInteraction: Draw | null = null;

  return {
    start(onEnd) {
      drawInteraction = new Draw({
        type: "Circle",
        geometryFunction: createBox(),
      });

      drawInteraction.on("drawend", (e) => {
        const geometry = e.feature.getGeometry();
        if (!geometry) return;
        const extent = geometry.getExtent();
        const bbox = transformExtent(extent, "EPSG:3857", "EPSG:4326");
        onEnd(bbox as Bbox);
      });

      olMap.addInteraction(drawInteraction);
    },

    cleanUp() {
      if (drawInteraction) {
        olMap.removeInteraction(drawInteraction);
        drawInteraction = null;
      }
    },
  };
}
