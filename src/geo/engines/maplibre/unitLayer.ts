import type { Map as MlMap } from "maplibre-gl";

export const UNIT_LAYER_ID = "unitLayer";
export const UNIT_LAYER_PREFIX = `${UNIT_LAYER_ID}-`;
export const SCENARIO_FEATURE_LAYER_PREFIX = "scenario-feature";

export function isUnitLayerId(layerId: string | undefined | null) {
  return layerId === UNIT_LAYER_ID || (layerId?.startsWith(UNIT_LAYER_PREFIX) ?? false);
}

export function isScenarioFeatureMlLayerId(layerId: string | undefined | null) {
  return typeof layerId === "string" && layerId.startsWith(SCENARIO_FEATURE_LAYER_PREFIX);
}

// Returns the id of the first MapLibre layer that should sit above KML
// reference layers, i.e. any scenario-feature or unit layer in the style.
export function findFirstOverlayLayerId(mlMap: MlMap): string | undefined {
  try {
    const styleLayers = mlMap.getStyle?.()?.layers;
    if (!Array.isArray(styleLayers)) return undefined;
    for (const layer of styleLayers) {
      const id = (layer as { id?: unknown }).id;
      if (typeof id !== "string") continue;
      if (isUnitLayerId(id) || isScenarioFeatureMlLayerId(id)) return id;
    }
  } catch {
    // MapLibre may throw if the style is still loading.
  }
  return undefined;
}
