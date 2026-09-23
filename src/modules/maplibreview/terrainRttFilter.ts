import type { Map } from "maplibre-gl";

/** Layer types MapLibre renders into the textures it drapes over terrain. */
const DRAPED_LAYER_TYPES = new Set([
  "background",
  "fill",
  "line",
  "raster",
  "hillshade",
  "color-relief",
]);

type TerrainDataEvent = { dataType?: string; sourceId?: string; tile?: unknown };
type TerrainDataHandler = (event: TerrainDataEvent, terrainSourceId: string) => void;
// The handler is private in MapLibre's typings, so it cannot be intersected with Map.
type TerrainHandlerHost = { _handleTerrainDataEvent?: TerrainDataHandler };

export function sourceIsDraped(map: Map, sourceId: string): boolean {
  return map.getLayersOrder().some((id) => {
    const layer = map.getLayer(id);
    return layer?.source === sourceId && DRAPED_LAYER_TYPES.has(layer.type);
  });
}

/**
 * Work around MapLibre (6.10) discarding the terrain's cached draped textures
 * whenever any source loads a tile, even a source that only feeds symbol or circle
 * layers, which are drawn live on top of the terrain. Playback updates the unit
 * source every tick, so without this every frame re-renders the whole draped stack.
 *
 * Patches a private method on this map instance only; returns an uninstall function.
 * If MapLibre renames the method, this silently does nothing.
 */
export function installTerrainRttFilter(map: Map): () => void {
  const target = map as unknown as TerrainHandlerHost;
  const original = target._handleTerrainDataEvent;
  if (typeof original !== "function") return () => {};
  const filtered: TerrainDataHandler = function (this: Map, event, terrainSourceId) {
    if (
      event.dataType === "source" &&
      event.tile &&
      event.sourceId &&
      event.sourceId !== terrainSourceId &&
      !sourceIsDraped(this, event.sourceId)
    ) {
      return;
    }
    return original.call(this, event, terrainSourceId);
  };
  target._handleTerrainDataEvent = filtered;
  return () => {
    if (target._handleTerrainDataEvent === filtered) {
      target._handleTerrainDataEvent = original;
    }
  };
}
