import type { Map as MlMap } from "maplibre-gl";
import type { MapProjection } from "@/stores/mapSettingsStore";

export function applyProjection(
  map: Pick<MlMap, "setProjection">,
  projection: MapProjection,
) {
  map.setProjection({ type: projection });
}
