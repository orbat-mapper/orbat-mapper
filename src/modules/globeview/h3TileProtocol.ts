/**
 * Custom MapLibre protocol that generates H3 hex grid MVT tiles on the fly.
 *
 * Each tile covers a small geographic area, so polygonToCells is fast and
 * bounded. MapLibre handles viewport culling, caching, and zoom management.
 */
import { addProtocol, removeProtocol } from "maplibre-gl";
import {
  polygonToCells,
  cellToBoundary,
  cellToLatLng,
  getRes0Cells,
  cellToChildren,
} from "h3-js";
import Pbf from "pbf";

export const H3_PROTOCOL = "h3tile";
const EXTENT = 4096;

/** Max resolution that uses global enumeration instead of polygonToCells */
const GLOBAL_ENUM_MAX_RES = 4;

/** Shared mutable resolution — set by the composable before triggering reload */
let currentResolution = 2;

/** Cached global cell list with pre-computed centers for fast per-tile filtering */
let globalCellCache: { res: number; cells: Array<{ id: string; lat: number; lng: number }> } | null = null;

function getGlobalCells(res: number): Array<{ id: string; lat: number; lng: number }> {
  if (globalCellCache && globalCellCache.res === res) return globalCellCache.cells;
  let allCells = getRes0Cells();
  if (res >= 1) {
    allCells = allCells.flatMap((c) => cellToChildren(c, res));
  }
  const cells = allCells.map((id) => {
    const [lat, lng] = cellToLatLng(id);
    return { id, lat, lng };
  });
  globalCellCache = { res, cells };
  return cells;
}

export function setH3Resolution(res: number) {
  currentResolution = res;
  // Pre-build cache for resolutions that use global enumeration
  if (res <= GLOBAL_ENUM_MAX_RES) {
    getGlobalCells(res);
  }
}

/** Convert tile coords to lng/lat bounds */
function tileBounds(z: number, x: number, y: number) {
  const n = Math.PI - (2 * Math.PI * y) / (1 << z);
  const n2 = Math.PI - (2 * Math.PI * (y + 1)) / (1 << z);
  return {
    west: (x / (1 << z)) * 360 - 180,
    east: ((x + 1) / (1 << z)) * 360 - 180,
    north: (Math.atan(Math.sinh(n)) * 180) / Math.PI,
    south: (Math.atan(Math.sinh(n2)) * 180) / Math.PI,
  };
}

/** Project [lng, lat] to tile-local pixel coords (0..EXTENT) */
function project(
  lng: number,
  lat: number,
  west: number,
  south: number,
  east: number,
  north: number,
): [number, number] {
  const x = ((lng - west) / (east - west)) * EXTENT;
  const y = ((north - lat) / (north - south)) * EXTENT;
  return [Math.round(x), Math.round(y)];
}

/** Zigzag encode a signed int to unsigned (MVT parameter encoding) */
function zigzag(n: number): number {
  return (n << 1) ^ (n >> 31);
}

/** MVT command integer */
function command(id: number, count: number): number {
  return (id & 0x7) | (count << 3);
}

/**
 * Build MVT geometry array (repeated uint32) for a polygon with one ring.
 * Coordinates are delta-encoded and zigzag-encoded per MVT spec.
 */
function encodePolygonGeometry(ring: Array<[number, number]>): number[] {
  const geom: number[] = [];
  let cx = 0;
  let cy = 0;

  // MoveTo first point
  geom.push(command(1, 1)); // MoveTo, count=1
  const dx0 = ring[0][0] - cx;
  const dy0 = ring[0][1] - cy;
  geom.push(zigzag(dx0), zigzag(dy0));
  cx = ring[0][0];
  cy = ring[0][1];

  // LineTo remaining points (skip last point — ClosePath handles it)
  const lineToCount = ring.length - 2;
  if (lineToCount > 0) {
    geom.push(command(2, lineToCount)); // LineTo
    for (let i = 1; i < ring.length - 1; i++) {
      const dx = ring[i][0] - cx;
      const dy = ring[i][1] - cy;
      geom.push(zigzag(dx), zigzag(dy));
      cx = ring[i][0];
      cy = ring[i][1];
    }
  }

  // ClosePath
  geom.push(command(7, 1));

  return geom;
}

/**
 * Encode polygon features into an MVT tile buffer (single layer).
 */
function encodeMvtTile(
  layerName: string,
  features: Array<{ geom: number[] }>,
): ArrayBuffer {
  const pbf = new Pbf();
  pbf.writeMessage(3, writeLayer, { name: layerName, features });
  return pbf.finish().buffer as ArrayBuffer;
}

function writeLayer(
  layer: { name: string; features: Array<{ geom: number[] }> },
  pbf: Pbf,
) {
  pbf.writeStringField(1, layer.name); // name
  pbf.writeVarintField(5, EXTENT); // extent
  pbf.writeVarintField(15, 2); // version

  for (let i = 0; i < layer.features.length; i++) {
    pbf.writeMessage(2, writeFeature, {
      id: i,
      geom: layer.features[i].geom,
    });
  }
}

function writeFeature(feature: { id: number; geom: number[] }, pbf: Pbf) {
  pbf.writeVarintField(1, feature.id); // id
  pbf.writeVarintField(3, 3); // type = POLYGON
  pbf.writePackedVarint(4, feature.geom); // geometry
}

function generateTile(z: number, x: number, y: number): ArrayBuffer {
  const bounds = tileBounds(z, x, y);
  const tilesPerSide = 1 << z;

  // For ownership check: extend to ±90° at polar tile edges so cells
  // beyond the mercator limit (~85.05°) are claimed by edge tiles.
  const ownSouth = y === tilesPerSide - 1 ? -90 : bounds.south;
  const ownNorth = y === 0 ? 90 : bounds.north;

  let cells: string[];
  if (currentResolution <= GLOBAL_ENUM_MAX_RES) {
    // At low resolutions, cells are larger than tiles. polygonToCells fails
    // because no cell center falls within the small tile polygon.
    // Use cached global cell list with pre-computed centers for fast filtering.
    const global = getGlobalCells(currentResolution);
    cells = global
      .filter(
        ({ lat, lng }) =>
          lng >= bounds.west && lng < bounds.east && lat >= ownSouth && lat < ownNorth,
      )
      .map((c) => c.id);
  } else {
    // At higher resolutions, use polygonToCells with padding to find cells
    // that overlap this tile, then filter by center ownership.
    // Use larger padding at high latitudes where mercator tiles are narrow.
    const midLat = (bounds.north + bounds.south) / 2;
    const latFactor = 1 / Math.max(Math.cos((midLat * Math.PI) / 180), 0.1);
    const lngPad = (bounds.east - bounds.west) * Math.max(0.5, latFactor);
    const latPad = (bounds.north - bounds.south) * 0.5;
    const padded = {
      west: bounds.west - lngPad,
      east: bounds.east + lngPad,
      south: Math.max(bounds.south - latPad, -90),
      north: Math.min(bounds.north + latPad, 90),
    };

    const polygon = [
      [padded.west, padded.south],
      [padded.east, padded.south],
      [padded.east, padded.north],
      [padded.west, padded.north],
      [padded.west, padded.south],
    ];

    cells = polygonToCells([polygon], currentResolution, true).filter((c) => {
      const [lat, lng] = cellToLatLng(c);
      return (
        lng >= bounds.west && lng < bounds.east && lat >= ownSouth && lat < ownNorth
      );
    });
  }

  const features: Array<{ geom: number[] }> = [];
  for (const cell of cells) {
    const [centerLat, centerLng] = cellToLatLng(cell);
    const boundary = cellToBoundary(cell, true); // [lng, lat] order
    boundary.push(boundary[0]); // close ring

    // Normalize longitudes relative to cell center to handle antimeridian.
    // Without this, vertices jump from ~179° to ~-179° causing streaks.
    const normalized = boundary.map(([lng, lat]) => {
      let nLng = lng;
      while (nLng - centerLng > 180) nLng -= 360;
      while (nLng - centerLng < -180) nLng += 360;
      return [nLng, lat] as [number, number];
    });

    // Project to tile pixel coordinates
    const projected: Array<[number, number]> = normalized.map(([lng, lat]) =>
      project(lng, lat, bounds.west, bounds.south, bounds.east, bounds.north),
    );

    features.push({ geom: encodePolygonGeometry(projected) });
  }

  return encodeMvtTile("h3", features);
}

export function registerH3Protocol() {
  addProtocol(H3_PROTOCOL, async (params) => {
    const url = params.url.replace(`${H3_PROTOCOL}://`, "");
    const [zStr, xStr, yStr] = url.split("/");
    const z = parseInt(zStr, 10);
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);

    const data = generateTile(z, x, y);
    return { data };
  });
}

export function unregisterH3Protocol() {
  removeProtocol(H3_PROTOCOL);
}
