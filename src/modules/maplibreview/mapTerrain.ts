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

const TERRAIN_SOURCE: RasterDEMSourceSpecification = {
  type: "raster-dem",
  url: "https://tiles.mapterhorn.com/tilejson.json",
  encoding: "terrarium",
  tileSize: 512,
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

function syncTerrainLayer(
  map: Map,
  enabled: boolean,
  exaggeration: number,
  source: RasterDEMSourceSpecification | null,
): void {
  if (!enabled || !source) {
    // Terrain releases the source before it can be removed.
    if (map.getTerrain()?.source === TERRAIN_SOURCE_ID) map.setTerrain(null);
    if (map.getSource(TERRAIN_SOURCE_ID)) map.removeSource(TERRAIN_SOURCE_ID);
    return;
  }
  if (!map.getSource(TERRAIN_SOURCE_ID)) map.addSource(TERRAIN_SOURCE_ID, source);
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
  if (!enabled || !source) {
    if (map.getLayer(HILLSHADE_LAYER_ID)) map.removeLayer(HILLSHADE_LAYER_ID);
    if (map.getSource(HILLSHADE_SOURCE_ID)) map.removeSource(HILLSHADE_SOURCE_ID);
    return;
  }
  if (!map.getSource(HILLSHADE_SOURCE_ID)) map.addSource(HILLSHADE_SOURCE_ID, source);
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
  enabled: boolean;
  exaggeration: number;
  hillshadeEnabled: boolean;
  hillshadeSettings: HillshadeSettings;
}

export const DEFAULT_TERRAIN_DISPLAY: Readonly<TerrainDisplay> = {
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
  const source = TERRAIN_SOURCE;
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
