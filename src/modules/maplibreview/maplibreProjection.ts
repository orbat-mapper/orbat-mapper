import type { Map as MlMap } from "maplibre-gl";

export function applyGlobeProjection(map: Pick<MlMap, "setProjection">) {
  map.setProjection({ type: "globe" });
}
