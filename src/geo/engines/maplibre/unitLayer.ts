import type { Map as MlMap } from "maplibre-gl";
import type { NUnit } from "@/types/internalModels";
import { hashObject } from "@/utils";

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

export const ALWAYS_VISIBLE_UNIT_GROUP_ID = "always";

/** Units that share a zoom range. Their map layers get the same minzoom and maxzoom. */
export type UnitVisibilityGroup = {
  id: string;
  minzoom?: number;
  maxzoom?: number;
};

export function getUnitVisibilityGroup(unit: NUnit): UnitVisibilityGroup {
  const style = unit.style ?? {};
  if (!style.limitVisibility) {
    return { id: ALWAYS_VISIBLE_UNIT_GROUP_ID };
  }

  return getZoomVisibilityGroup(style.minZoom ?? 0, style.maxZoom ?? 24);
}

export function getZoomVisibilityGroup(
  minzoom: number,
  maxzoom: number,
): UnitVisibilityGroup {
  return {
    id: hashObject({ type: "unit-visibility", minZoom: minzoom, maxZoom: maxzoom }),
    minzoom,
    maxzoom,
  };
}
