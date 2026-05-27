import { toRaw } from "vue";
import type { Map as MlMap } from "maplibre-gl";

/**
 * Bridges the live map's programmatic symbol generation (unit/custom symbols,
 * which live inside the map component) to the image export, which runs in a
 * separate module. Keyed by map instance via a WeakMap so nothing leaks and the
 * export stays decoupled from the Vue component tree.
 *
 * Symbols are raster bitmaps baked once at the on-screen sprite pixel ratio. To
 * keep them crisp in a supersampled export, the export re-rasterizes them at the
 * export's render scale instead of upscaling the baked bitmap.
 */
export interface MaplibreSymbolImageSource {
  /** Ids of all programmatic symbol images currently in use on the map. */
  usedImageIds(): Iterable<string>;
  /**
   * Re-rasterize the symbol with the given id at the supplied pixel ratio.
   * Resolves to null if the id is unknown or rendering fails.
   */
  renderImage(
    id: string,
    pixelRatio: number,
  ): Promise<{ data: ImageData; pixelRatio: number } | null>;
}

const registry = new WeakMap<MlMap, MaplibreSymbolImageSource>();

// The map is often handed around as a Vue prop, which wraps it in a reactive
// proxy. Key off the raw instance so register and lookup agree no matter which
// side holds a proxy.
function key(map: MlMap): MlMap {
  return toRaw(map);
}

export function registerSymbolImageSource(map: MlMap, source: MaplibreSymbolImageSource) {
  registry.set(key(map), source);
}

export function unregisterSymbolImageSource(map: MlMap) {
  registry.delete(key(map));
}

export function getSymbolImageSource(map: MlMap): MaplibreSymbolImageSource | undefined {
  return registry.get(key(map));
}
