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
const TILE_BUFFER = EXTENT;
type LngLat = [number, number];
type CellRef = { id: string; centerLng: number; shift: number };

/** Max resolution that uses global enumeration instead of polygonToCells */
const GLOBAL_ENUM_MAX_RES = 4;

/** Shared mutable resolution — set by the composable before triggering reload */
let currentResolution = 2;
let boundaryCache = new Map<string, LngLat[]>();

/** Cached global cell list with pre-computed centers for fast per-tile filtering */
let globalCellCache: {
  res: number;
  cells: Array<{ id: string; lat: number; lng: number }>;
} | null = null;

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
  if (res !== currentResolution) {
    boundaryCache = new Map();
  }
  currentResolution = res;
  // Pre-build cache for resolutions that use global enumeration
  if (res <= GLOBAL_ENUM_MAX_RES) {
    getGlobalCells(res);
  }
}

function getCellBoundary(cell: string): LngLat[] {
  const cached = boundaryCache.get(cell);
  if (cached) return cached;

  const boundary = cellToBoundary(cell, true) as LngLat[];
  boundaryCache.set(cell, boundary);
  return boundary;
}

/** Latitude to mercator Y (in radians-based units) */
function latToMercatorY(lat: number): number {
  const latRad = (Math.max(Math.min(lat, 89.999), -89.999) * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + latRad / 2));
}

/** Convert tile coords to bounds (lng in degrees, lat in degrees + mercator Y) */
function tileBounds(z: number, x: number, y: number) {
  const mercN = Math.PI - (2 * Math.PI * y) / (1 << z);
  const mercS = Math.PI - (2 * Math.PI * (y + 1)) / (1 << z);
  return {
    west: (x / (1 << z)) * 360 - 180,
    east: ((x + 1) / (1 << z)) * 360 - 180,
    north: (Math.atan(Math.sinh(mercN)) * 180) / Math.PI,
    south: (Math.atan(Math.sinh(mercS)) * 180) / Math.PI,
    mercNorth: mercN,
    mercSouth: mercS,
  };
}

/** Project [lng, lat] to tile-local pixel coords using mercator projection */
function project(
  lng: number,
  lat: number,
  west: number,
  east: number,
  mercSouth: number,
  mercNorth: number,
): [number, number] {
  const x = ((lng - west) / (east - west)) * EXTENT;
  const mercY = latToMercatorY(lat);
  const y = ((mercNorth - mercY) / (mercNorth - mercSouth)) * EXTENT;
  return [
    Math.round(Math.min(EXTENT + TILE_BUFFER, Math.max(-TILE_BUFFER, x))),
    Math.round(Math.min(EXTENT + TILE_BUFFER, Math.max(-TILE_BUFFER, y))),
  ];
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

  // Pad the tile bounds to include cells that overlap tile edges.
  // Since we only render lines (no fill), duplicate cells across tiles
  // are fine — overlapping lines are visually identical.
  const lngPad = (bounds.east - bounds.west) * 0.5;
  const latPad = (bounds.north - bounds.south) * 0.5;
  const padWest = bounds.west - lngPad;
  const padEast = bounds.east + lngPad;
  const padSouth = Math.max(bounds.south - latPad, -90);
  const padNorth = Math.min(bounds.north + latPad, 90);

  /**
   * Return the longitude shift (-360, 0, or +360) that places `lng` within
   * [padWest, padEast), or null if the cell should not be rendered in this tile.
   * This lets a hex near the antimeridian be rendered in both tiles on either side.
   */
  function shiftForTile(lng: number): number | null {
    for (const shift of [0, 360, -360]) {
      const s = lng + shift;
      if (s >= padWest && s < padEast) return shift;
    }
    return null;
  }

  const cellsForTile: CellRef[] = [];

  if (currentResolution <= GLOBAL_ENUM_MAX_RES) {
    // Use cached global cell list with pre-computed centers for fast filtering.
    const global = getGlobalCells(currentResolution);
    for (const { id, lat, lng } of global) {
      if (lat < padSouth || lat >= padNorth) continue;
      const shift = shiftForTile(lng);
      if (shift !== null) cellsForTile.push({ id, centerLng: lng, shift });
    }
  } else {
    // At higher resolutions, use polygonToCells with padded bounds.
    // At high latitudes, increase longitude padding further since
    // mercator tiles are narrower.
    const midLat = (bounds.north + bounds.south) / 2;
    const latFactor = Math.min(2, 1 / Math.max(Math.cos((midLat * Math.PI) / 180), 0.1));
    const highLatPadWest =
      bounds.west - (bounds.east - bounds.west) * Math.max(0.5, latFactor);
    const highLatPadEast =
      bounds.east + (bounds.east - bounds.west) * Math.max(0.5, latFactor);

    // Clip polygon to ±180° and call polygonToCells for the primary range,
    // plus a second call for any portion that wraps across the antimeridian.
    const ranges: Array<[number, number]> = [];
    const clippedWest = Math.max(highLatPadWest, -180);
    const clippedEast = Math.min(highLatPadEast, 180);
    if (clippedWest < clippedEast) ranges.push([clippedWest, clippedEast]);
    if (highLatPadWest < -180) ranges.push([highLatPadWest + 360, 180]);
    if (highLatPadEast > 180) ranges.push([-180, highLatPadEast - 360]);

    const seen = new Set<string>();
    for (const [w, e] of ranges) {
      const polygon = [
        [w, padSouth],
        [e, padSouth],
        [e, padNorth],
        [w, padNorth],
        [w, padSouth],
      ];
      for (const id of polygonToCells([polygon], currentResolution, true)) {
        if (seen.has(id)) continue;
        seen.add(id);
        const [, lng] = cellToLatLng(id);
        const shift = shiftForTile(lng);
        if (shift !== null) cellsForTile.push({ id, centerLng: lng, shift });
      }
    }
  }

  const features: Array<{ geom: number[] }> = [];
  for (const { id: cell, centerLng, shift } of cellsForTile) {
    const shiftedCenter = centerLng + shift;
    const boundary = getCellBoundary(cell);
    const projected: LngLat[] = new Array(boundary.length + 1);

    // Normalize and project in one pass, then explicitly close the ring.
    for (let i = 0; i < boundary.length; i++) {
      const [lng, lat] = boundary[i];
      let normalizedLng = lng + shift;
      while (normalizedLng - shiftedCenter > 180) normalizedLng -= 360;
      while (normalizedLng - shiftedCenter < -180) normalizedLng += 360;
      projected[i] = project(
        normalizedLng,
        lat,
        bounds.west,
        bounds.east,
        bounds.mercSouth,
        bounds.mercNorth,
      );
    }
    projected[boundary.length] = projected[0];

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
