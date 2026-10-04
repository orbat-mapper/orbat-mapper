import type { Map } from "maplibre-gl";

type ScreenToMercator = (point: { x: number; y: number }, terrain?: unknown) => unknown;
type TransformLike = { screenPointToMercatorCoordinate?: ScreenToMercator };
// `_camera` and the transform's terrain-aware lookup are private in MapLibre's typings.
type CameraHost = { _camera?: { transform?: TransformLike }; transform?: TransformLike };

/**
 * Work around MapLibre (6.10) repeating the same terrain ray casts for every source a
 * `queryRenderedFeatures` call touches: each source's `tilesIn()` projects the query
 * geometry through the terrain on its own. Hover queries span ~10 sources, which took
 * a mouse move from ~1 ms to ~25-40 ms with terrain on.
 *
 * For the duration of one query the camera and terrain cannot change, so ray casts are
 * cached by screen point and the cache is dropped when the query returns. Patches this
 * map instance only; returns an uninstall function.
 */
export function installTerrainQueryCache(map: Map): () => void {
  const original = map.queryRenderedFeatures;
  if (typeof original !== "function") return () => {};
  const hasOwn = Object.prototype.hasOwnProperty.call(map, "queryRenderedFeatures");
  const cached = function (this: Map, ...args: Parameters<Map["queryRenderedFeatures"]>) {
    const restore = cacheRayCasts(this as unknown as CameraHost);
    try {
      return original.apply(this, args);
    } finally {
      restore();
    }
  } as Map["queryRenderedFeatures"];
  map.queryRenderedFeatures = cached;
  return () => {
    if (map.queryRenderedFeatures !== cached) return;
    if (hasOwn) map.queryRenderedFeatures = original;
    else delete (map as Partial<Map>).queryRenderedFeatures;
  };
}

function cacheRayCasts(host: CameraHost): () => void {
  const transforms = new Set([host._camera?.transform, host.transform]);
  const restores: (() => void)[] = [];
  for (const transform of transforms) {
    const lookup = transform?.screenPointToMercatorCoordinate;
    if (!transform || typeof lookup !== "function") continue;
    const hadOwn = Object.prototype.hasOwnProperty.call(
      transform,
      "screenPointToMercatorCoordinate",
    );
    const cache = new globalThis.Map<string, unknown>();
    transform.screenPointToMercatorCoordinate = function (
      this: TransformLike,
      point,
      terrain,
    ) {
      if (!terrain) return lookup.call(this, point, terrain);
      const key = `${point.x},${point.y}`;
      if (!cache.has(key)) cache.set(key, lookup.call(this, point, terrain));
      return cache.get(key);
    };
    restores.push(() => {
      if (hadOwn) transform.screenPointToMercatorCoordinate = lookup;
      else delete transform.screenPointToMercatorCoordinate;
    });
  }
  return () => restores.forEach((restore) => restore());
}
