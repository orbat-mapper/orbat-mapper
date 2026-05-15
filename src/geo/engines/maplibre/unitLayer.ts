import type { Map as MlMap } from "maplibre-gl";

export const UNIT_LAYER_ID = "unitLayer";
export const UNIT_LAYER_PREFIX = `${UNIT_LAYER_ID}-`;

export function isUnitLayerId(layerId: string | undefined | null) {
  return layerId === UNIT_LAYER_ID || (layerId?.startsWith(UNIT_LAYER_PREFIX) ?? false);
}

export function findFirstUnitLayerId(mlMap: MlMap): string | undefined {
  try {
    const styleLayers = mlMap.getStyle?.()?.layers;
    if (!Array.isArray(styleLayers)) return undefined;
    for (const layer of styleLayers) {
      const id = (layer as { id?: unknown }).id;
      if (typeof id === "string" && isUnitLayerId(id)) return id;
    }
  } catch {
    // MapLibre may throw if the style is still loading.
  }
  return undefined;
}
