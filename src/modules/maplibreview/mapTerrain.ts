import type { Map, RasterDEMSourceSpecification } from "maplibre-gl";
import {
  DEFAULT_HILLSHADE_SETTINGS,
  hillshadePaint,
  type HillshadeSettings,
} from "./hillshadeSettings";
export const TERRAIN_EXAGGERATION_DEFAULT = 1;
export const TERRAIN_EXAGGERATION_MIN = 1;
export const TERRAIN_EXAGGERATION_MAX = 5;
export const TERRAIN_EXAGGERATION_STEP = 0.25;

/** Online elevation data, the default source of a build that may use the internet. */
export const MAPTERHORN_ELEVATION_SOURCE: Readonly<RasterDEMSourceSpecification> = {
  type: "raster-dem",
  url: "https://tiles.mapterhorn.com/tilejson.json",
  encoding: "terrarium",
  tileSize: 512,
  // Mapterhorn is global only to z12; deeper tiles 404 outside high-resolution regions, which
  // MapLibre renders as flat ground with cliffs at the tile edges. Capping at z12 avoids that
  // but loses the extra detail where it exists.
  // maxzoom: 12,
  attribution: '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>',
};

export const TERRAIN_SOURCE_ID = "orbat-terrain";
export const HILLSHADE_SOURCE_ID = "orbat-hillshade-dem";
export const HILLSHADE_LAYER_ID = "orbat-hillshade";

/** Keep shading above raster overlays and below scenario vectors and controls. */
export function syncHillshadeOrder(map: Map, beforeId?: string): void {
  if (!map.getLayer(HILLSHADE_LAYER_ID)) return;
  const ids = map.getLayersOrder();
  const boundary = beforeId ? ids.indexOf(beforeId) : ids.length;
  if (boundary > 0 && ids[boundary - 1] !== HILLSHADE_LAYER_ID) {
    map.moveLayer(HILLSHADE_LAYER_ID, beforeId);
  }
}

/** Read natural elevation in metres, regardless of the display exaggeration. */
export function terrainElevationMeters(
  map: Map,
  position: readonly [number, number],
): number | null {
  const terrain = map.getTerrain();
  if (!terrain || !map.getSource(terrain.source) || !map.isSourceLoaded(terrain.source))
    return null;
  const exaggeration = terrain.exaggeration ?? 1;
  if (!Number.isFinite(exaggeration) || exaggeration <= 0) return null;
  const elevation = map.queryTerrainElevation([position[0], position[1]]);
  return elevation !== null && Number.isFinite(elevation)
    ? elevation / exaggeration
    : null;
}

/**
 * The source spec each map's DEM sources were added from. A source is replaced, not updated, when
 * the elevation source changes, because MapLibre cannot change a source's url or encoding in place.
 */
const appliedSources = new WeakMap<Map, Record<string, RasterDEMSourceSpecification>>();

function sourceIsCurrent(
  map: Map,
  id: string,
  source: RasterDEMSourceSpecification,
): boolean {
  return !!map.getSource(id) && appliedSources.get(map)?.[id] === source;
}

function addDemSource(map: Map, id: string, source: RasterDEMSourceSpecification) {
  map.addSource(id, source);
  appliedSources.set(map, { ...appliedSources.get(map), [id]: source });
}

function syncTerrainLayer(
  map: Map,
  enabled: boolean,
  exaggeration: number,
  source: RasterDEMSourceSpecification | null,
): void {
  if (!enabled || !source || !sourceIsCurrent(map, TERRAIN_SOURCE_ID, source)) {
    // Terrain releases the source before it can be removed.
    if (map.getTerrain()?.source === TERRAIN_SOURCE_ID) map.setTerrain(null);
    if (map.getSource(TERRAIN_SOURCE_ID)) map.removeSource(TERRAIN_SOURCE_ID);
    if (!enabled || !source) return;
    addDemSource(map, TERRAIN_SOURCE_ID, source);
  }
  const terrain = map.getTerrain();
  if (terrain?.source !== TERRAIN_SOURCE_ID || terrain.exaggeration !== exaggeration) {
    map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration });
  }
}

function syncHillshadeLayer(
  map: Map,
  enabled: boolean,
  source: RasterDEMSourceSpecification | null,
  settings: HillshadeSettings,
  beforeId?: string,
): void {
  if (!enabled || !source || !sourceIsCurrent(map, HILLSHADE_SOURCE_ID, source)) {
    if (map.getLayer(HILLSHADE_LAYER_ID)) map.removeLayer(HILLSHADE_LAYER_ID);
    if (map.getSource(HILLSHADE_SOURCE_ID)) map.removeSource(HILLSHADE_SOURCE_ID);
    if (!enabled || !source) return;
    addDemSource(map, HILLSHADE_SOURCE_ID, source);
  }
  const paint = hillshadePaint(settings);
  if (!map.getLayer(HILLSHADE_LAYER_ID)) {
    map.addLayer(
      {
        id: HILLSHADE_LAYER_ID,
        type: "hillshade",
        source: HILLSHADE_SOURCE_ID,
        paint,
      },
      beforeId,
    );
  } else {
    for (const property of Object.keys(paint) as (keyof typeof paint)[]) {
      const value = paint[property];
      if (map.getPaintProperty(HILLSHADE_LAYER_ID, property) !== value)
        map.setPaintProperty(HILLSHADE_LAYER_ID, property, value);
    }
  }
}

/** Everything the map's elevation rendering is derived from, as one value: the
 *  two toggles are independent, so the next knob extends this instead of the
 *  call signature. */
export interface TerrainDisplay {
  /** Where elevation tiles come from. Null when the build has none and no archive is open. */
  source: Readonly<RasterDEMSourceSpecification> | null;
  enabled: boolean;
  exaggeration: number;
  hillshadeEnabled: boolean;
  hillshadeSettings: HillshadeSettings;
}

export const DEFAULT_TERRAIN_DISPLAY: Readonly<TerrainDisplay> = {
  source: MAPTERHORN_ELEVATION_SOURCE,
  enabled: false,
  exaggeration: TERRAIN_EXAGGERATION_DEFAULT,
  hillshadeEnabled: false,
  hillshadeSettings: DEFAULT_HILLSHADE_SETTINGS,
};

/** Restore app-owned terrain after a basemap replaces the style. */
export function syncMapTerrain(
  map: Map,
  display: TerrainDisplay,
  beforeId?: string,
): void {
  const source = display.source as RasterDEMSourceSpecification | null;
  // Separate sources are required: terrain and hillshade use different DEM tile scales.
  syncTerrainLayer(map, display.enabled, display.exaggeration, source);
  syncHillshadeLayer(
    map,
    display.hillshadeEnabled,
    source,
    display.hillshadeSettings,
    beforeId,
  );
}
