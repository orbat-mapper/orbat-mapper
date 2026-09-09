import { addProtocol, removeProtocol } from "maplibre-gl";
import { PbfWriter as Pbf } from "pbf";
import {
  isMgrsInterval,
  mgrsSquareIdentifier,
  mgrsZoneBounds,
  type MgrsZoneBounds,
} from "./mgrs";
import { projectToGrid, selectGridCrs, unprojectFromGrid } from "./projection";
import { isMajorGridIndex } from "./appearance";
import { projectedRectEnvelope, type ProjectedEnvelope } from "./clipping";
import {
  WEB_MERCATOR_MAX_LATITUDE,
  latitudeToMercatorY,
  mercatorYToLatitude,
} from "./geo";
import {
  isLocalGridCoordinateValid,
  localGridFrame,
  projectWithFrame,
  unprojectWithFrame,
} from "./local";
import type { GridCrs, LocalGridDefinition, MgrsGridDefinition } from "./types";

export const MGRS_TILE_PROTOCOL = "orbat-grid-mgrs";
export const MGRS_OVERVIEW_SOURCE_ID = "orbat-grid-mgrs-zone-overview-source";
export const MGRS_OVERVIEW_LAYER_ID = "orbat-grid-mgrs-zone-overview-layer";
export const MGRS_OVERVIEW_LABEL_SOURCE_ID = "orbat-grid-mgrs-zone-label-source";
export const MGRS_OVERVIEW_LABEL_LAYER_ID = "orbat-grid-mgrs-zone-label-layer";
export const MGRS_DETAIL_SOURCE_ID = "orbat-grid-mgrs-detail-source";
export const MGRS_DETAIL_MINOR_LAYER_ID = "orbat-grid-mgrs-detail-minor-layer";
export const MGRS_DETAIL_MAJOR_LAYER_ID = "orbat-grid-mgrs-detail-major-layer";
export const MGRS_DETAIL_LABEL_LAYER_ID = "orbat-grid-mgrs-square-label-layer";

export const MGRS_MINOR_TILE_LAYER = "mgrs-minor";
export const MGRS_MAJOR_TILE_LAYER = "mgrs-major";
export const MGRS_LABEL_TILE_LAYER = "mgrs-labels";

export const UTM_TILE_PROTOCOL = "orbat-grid-utm";
export const UTM_DETAIL_SOURCE_ID = "orbat-grid-utm-detail-source";
export const UTM_DETAIL_MINOR_LAYER_ID = "orbat-grid-utm-detail-minor-layer";
export const UTM_DETAIL_MAJOR_LAYER_ID = "orbat-grid-utm-detail-major-layer";
export const UTM_MINOR_TILE_LAYER = "utm-minor";
export const UTM_MAJOR_TILE_LAYER = "utm-major";

export const LOCAL_GRID_TILE_PROTOCOL = "orbat-grid-local";
export const LOCAL_GRID_DETAIL_SOURCE_ID = "orbat-grid-local-detail-source";
export const LOCAL_GRID_DETAIL_MINOR_LAYER_ID = "orbat-grid-local-detail-minor-layer";
export const LOCAL_GRID_DETAIL_MAJOR_LAYER_ID = "orbat-grid-local-detail-major-layer";
export const LOCAL_GRID_MINOR_TILE_LAYER = "local-grid-minor";
export const LOCAL_GRID_MAJOR_TILE_LAYER = "local-grid-major";

export const LATLONG_TILE_PROTOCOL = "orbat-grid-latlong";
export const LATLONG_DETAIL_SOURCE_ID = "orbat-grid-latlong-detail-source";
export const LATLONG_DETAIL_MINOR_LAYER_ID = "orbat-grid-latlong-detail-minor-layer";
export const LATLONG_DETAIL_MAJOR_LAYER_ID = "orbat-grid-latlong-detail-major-layer";
export const LATLONG_MINOR_TILE_LAYER = "latlong-minor";
export const LATLONG_MAJOR_TILE_LAYER = "latlong-major";

const EXTENT = 4096;
/** Equatorial metres per degree, used only to put angular spacing on the metric zoom scale. */
const METRES_PER_DEGREE = 111_320;
const MAX_LINES_PER_DIRECTION = 200;
const LINE_SEGMENTS = 24;
/** Built on first tile request so importing this module costs nothing at startup. */
let utmZonesCache: MgrsZoneBounds[] | null = null;
function utmZones() {
  utmZonesCache ??= mgrsZoneBounds().filter(
    ({ south, north }) => south >= -80 && north <= 84,
  );
  return utmZonesCache;
}

type TilePoint = readonly [number, number];
type LonLat = readonly [number, number];
type MvtFeature = { id: number; tags: number[]; type: 1 | 2; geometry: number[] };
type MvtLayer = {
  name: string;
  features: MvtFeature[];
  keys: string[];
  values: string[];
};

interface TileBounds {
  west: number;
  east: number;
  south: number;
  north: number;
  mercatorSouth: number;
  mercatorNorth: number;
}

function tileZoomForSpacing(spacing: number): number {
  return Math.max(0, Math.min(22, Math.round(14 - Math.log10(spacing / 100) * 3)));
}

/**
 * @param zoomSpacingMetres Metric basis for the retained-detail window, for modes
 * whose `spacing` is not in metres. Defaults to `spacing`.
 */
function tileSourceDefinition(
  protocol: string,
  spacing: number,
  params: Record<string, string>,
  zoomSpacingMetres = spacing,
) {
  const tileZoom = tileZoomForSpacing(zoomSpacingMetres);
  const query = new URLSearchParams({ spacing: String(spacing), ...params });
  return {
    type: "vector" as const,
    tiles: [`${protocol}://{z}/{x}/{y}?${query}`],
    minzoom: Math.max(0, tileZoom - 1),
    maxzoom: tileZoom,
  };
}

export function utmTileSourceDefinition(
  crs: Extract<GridCrs, { kind: "utm" }>,
  spacing: number,
) {
  return tileSourceDefinition(UTM_TILE_PROTOCOL, spacing, {
    zone: String(crs.zone),
    hemisphere: crs.hemisphere,
  });
}

export function localGridTileSourceDefinition(
  definition: LocalGridDefinition,
  spacing: number,
) {
  const [longitude, latitude] = definition.origin;
  return tileSourceDefinition(LOCAL_GRID_TILE_PROTOCOL, spacing, {
    longitude: String(longitude),
    latitude: String(latitude),
    bearing: String(definition.bearing),
  });
}

export function mgrsTileSourceDefinition(spacing: MgrsGridDefinition["interval"]) {
  return tileSourceDefinition(MGRS_TILE_PROTOCOL, spacing, {});
}

export function latLongTileSourceDefinition(spacing: number) {
  // The shared zoom heuristic is metric. Converting angular spacing at the
  // equator gives latitude/longitude tiles the same retained-detail lifetime
  // as the other grid modes without changing the degrees baked into the URL.
  return tileSourceDefinition(
    LATLONG_TILE_PROTOCOL,
    spacing,
    {},
    spacing * METRES_PER_DEGREE,
  );
}

function tileBounds(z: number, x: number, y: number): TileBounds {
  const scale = 2 ** z;
  const mercatorNorth = Math.PI - (2 * Math.PI * y) / scale;
  const mercatorSouth = Math.PI - (2 * Math.PI * (y + 1)) / scale;
  return {
    west: (x / scale) * 360 - 180,
    east: ((x + 1) / scale) * 360 - 180,
    north: mercatorYToLatitude(mercatorNorth),
    south: mercatorYToLatitude(mercatorSouth),
    mercatorNorth,
    mercatorSouth,
  };
}

function projectToTile(
  bounds: TileBounds,
  longitude: number,
  latitude: number,
): TilePoint {
  return [
    Math.round(((longitude - bounds.west) / (bounds.east - bounds.west)) * EXTENT),
    Math.round(
      ((bounds.mercatorNorth - latitudeToMercatorY(latitude)) /
        (bounds.mercatorNorth - bounds.mercatorSouth)) *
        EXTENT,
    ),
  ];
}

function zigzag(value: number) {
  return (value << 1) ^ (value >> 31);
}

function command(id: number, count: number) {
  return (id & 0x7) | (count << 3);
}

function encodeLine(points: readonly TilePoint[]) {
  const geometry: number[] = [
    command(1, 1),
    zigzag(points[0]![0]),
    zigzag(points[0]![1]),
  ];
  let currentX = points[0]![0];
  let currentY = points[0]![1];
  if (points.length > 1) geometry.push(command(2, points.length - 1));
  for (const [x, y] of points.slice(1)) {
    geometry.push(zigzag(x - currentX), zigzag(y - currentY));
    currentX = x;
    currentY = y;
  }
  return geometry;
}

function encodePoint([x, y]: TilePoint) {
  return [command(1, 1), zigzag(x), zigzag(y)];
}

function writeTile(layers: MvtLayer[], pbf: Pbf) {
  for (const layer of layers) pbf.writeMessage(3, writeLayer, layer);
}

function writeLayer(layer: MvtLayer, pbf: Pbf) {
  pbf.writeStringField(1, layer.name);
  for (const feature of layer.features) pbf.writeMessage(2, writeFeature, feature);
  for (const key of layer.keys) pbf.writeStringField(3, key);
  for (const value of layer.values) pbf.writeMessage(4, writeValue, value);
  pbf.writeVarintField(5, EXTENT);
  pbf.writeVarintField(15, 2);
}

function writeFeature(feature: MvtFeature, pbf: Pbf) {
  pbf.writeVarintField(1, feature.id);
  if (feature.tags.length) pbf.writePackedVarint(2, feature.tags);
  pbf.writeVarintField(3, feature.type);
  pbf.writePackedVarint(4, feature.geometry);
}

function writeValue(value: string, pbf: Pbf) {
  pbf.writeStringField(1, value);
}

/** Zone geometry is constant, so each zone's CRS is resolved once per session. */
const zoneCrsCache = new Map<string, GridCrs>();
function zoneCrs(zone: MgrsZoneBounds): GridCrs {
  let crs = zoneCrsCache.get(zone.designation);
  if (!crs) {
    crs = selectGridCrs([(zone.west + zone.east) / 2, (zone.south + zone.north) / 2]);
    zoneCrsCache.set(zone.designation, crs);
  }
  return crs;
}

function intersects(zone: MgrsZoneBounds, bounds: TileBounds) {
  return (
    zone.east > bounds.west &&
    zone.west < bounds.east &&
    zone.north > bounds.south &&
    zone.south < bounds.north
  );
}

function insideZone(zone: MgrsZoneBounds, longitude: number, latitude: number) {
  return (
    longitude >= zone.west - 1e-9 &&
    longitude <= zone.east + 1e-9 &&
    latitude >= zone.south - 1e-9 &&
    latitude <= zone.north + 1e-9
  );
}

function tileBytes(layers: MvtLayer[]): ArrayBuffer {
  const pbf = new Pbf();
  writeTile(layers, pbf);
  const bytes = pbf.finish();
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

/** Grid-space lattice walked to produce one tile's linework. */
interface Lattice {
  /** Grid space -> lon/lat, or null where the projection has no answer there. */
  unproject(x: number, y: number): LonLat | null;
  /** Optional validity envelope; samples outside it break the line. */
  isInside?(coordinate: LonLat): boolean;
}

const BISECT_STEPS = 14;

/** The one MVT line-feature shape every grid mode emits. */
function pushLine(collection: MvtFeature[], points: readonly TilePoint[]) {
  collection.push({
    id: collection.length + 1,
    tags: [],
    type: 2,
    geometry: encodeLine(points),
  });
}

function latticeIndexRange(envelope: ProjectedEnvelope, spacing: number) {
  if (!Number.isFinite(envelope.minX) || !Number.isFinite(spacing) || spacing <= 0)
    return null;
  const firstX = Math.floor(envelope.minX / spacing);
  const lastX = Math.ceil(envelope.maxX / spacing);
  const firstY = Math.floor(envelope.minY / spacing);
  const lastY = Math.ceil(envelope.maxY / spacing);
  if (
    lastX - firstX > MAX_LINES_PER_DIRECTION ||
    lastY - firstY > MAX_LINES_PER_DIRECTION
  )
    return null;
  return { firstX, lastX, firstY, lastY };
}

/**
 * Emit every lattice line crossing the tile, clipped to the lattice's validity
 * envelope. Shared by the walked grid modes; they differ only in the projection
 * pair, the validity test, and which index counts as a major line.
 */
function emitLatticeLines(
  bounds: TileBounds,
  envelope: ProjectedEnvelope,
  spacing: number,
  lattice: Lattice,
  isMajor: (index: number) => boolean,
  minor: MvtFeature[],
  major: MvtFeature[],
) {
  const range = latticeIndexRange(envelope, spacing);
  if (!range) return;
  const isInside = lattice.isInside;
  const resolve = (x: number, y: number) => {
    const coordinate = lattice.unproject(x, y);
    if (!coordinate) return null;
    if (isInside && !isInside(coordinate)) return null;
    return coordinate;
  };
  // Land on the validity boundary between an inside and an outside sample.
  const crossing = (inside: TilePoint, outside: TilePoint) => {
    let low = 0;
    let high = 1;
    let best: LonLat | null = null;
    for (let iteration = 0; iteration < BISECT_STEPS; iteration++) {
      const ratio = (low + high) / 2;
      const coordinate = resolve(
        inside[0] + (outside[0] - inside[0]) * ratio,
        inside[1] + (outside[1] - inside[1]) * ratio,
      );
      if (coordinate) {
        low = ratio;
        best = coordinate;
      } else high = ratio;
    }
    return best;
  };

  const walk = (
    xAt: (step: number) => number,
    yAt: (step: number) => number,
    index: number,
  ) => {
    const collection = isMajor(index) ? major : minor;
    let segment: TilePoint[] = [];
    const finish = () => {
      if (segment.length > 1) pushLine(collection, segment);
      segment = [];
    };
    let previous: { point: TilePoint; coordinate: LonLat | null } | null = null;
    for (let step = 0; step <= LINE_SEGMENTS; step++) {
      const point: TilePoint = [xAt(step), yAt(step)];
      const coordinate = resolve(point[0], point[1]);
      if (coordinate) {
        if (previous && !previous.coordinate) {
          const entry = crossing(point, previous.point);
          if (entry) segment.push(projectToTile(bounds, entry[0], entry[1]));
        }
        segment.push(projectToTile(bounds, coordinate[0], coordinate[1]));
      } else if (previous?.coordinate) {
        const exit = crossing(previous.point, point);
        if (exit) segment.push(projectToTile(bounds, exit[0], exit[1]));
        finish();
      }
      previous = { point, coordinate };
    }
    finish();
  };

  const spanY = (step: number) =>
    envelope.minY + ((envelope.maxY - envelope.minY) * step) / LINE_SEGMENTS;
  const spanX = (step: number) =>
    envelope.minX + ((envelope.maxX - envelope.minX) * step) / LINE_SEGMENTS;
  for (let index = range.firstX; index <= range.lastX; index++)
    walk(() => index * spacing, spanY, index);
  for (let index = range.firstY; index <= range.lastY; index++)
    walk(spanX, () => index * spacing, index);
}

function gridLattice(crs: GridCrs, isInside?: (coordinate: LonLat) => boolean): Lattice {
  return {
    unproject(x, y) {
      try {
        return unprojectFromGrid(crs, { easting: x, northing: y });
      } catch {
        // A Mercator tile can touch the numerical edge of the projection domain.
        return null;
      }
    },
    isInside,
  };
}

function gridEnvelope(
  rect: TileBounds | MgrsZoneBounds,
  bounds: TileBounds,
  crs: GridCrs,
) {
  return projectedRectEnvelope(
    {
      west: Math.max(rect.west, bounds.west),
      east: Math.min(rect.east, bounds.east),
      south: Math.max(rect.south, bounds.south),
      north: Math.min(rect.north, bounds.north),
    },
    (coordinate) => {
      try {
        const point = projectToGrid(crs, coordinate);
        return { x: point.easting, y: point.northing };
      } catch {
        return null;
      }
    },
  );
}

export function generateMgrsTile(
  z: number,
  x: number,
  y: number,
  spacing: MgrsGridDefinition["interval"],
): ArrayBuffer {
  const bounds = tileBounds(z, x, y);
  const minor: MvtFeature[] = [];
  const major: MvtFeature[] = [];
  const labels: MvtFeature[] = [];
  const labelValues: string[] = [];
  const valueIndexes = new Map<string, number>();
  const valueIndexFor = (value: string) => {
    let index = valueIndexes.get(value);
    if (index === undefined) {
      index = labelValues.length;
      valueIndexes.set(value, index);
      labelValues.push(value);
    }
    return index;
  };

  for (const zone of utmZones()) {
    if (!intersects(zone, bounds)) continue;
    const crs = zoneCrs(zone);
    if (crs.kind !== "utm") continue;
    const envelope = gridEnvelope(zone, bounds, crs);
    const inZone = (coordinate: LonLat) => insideZone(zone, coordinate[0], coordinate[1]);
    emitLatticeLines(
      bounds,
      envelope,
      spacing,
      gridLattice(crs, inZone),
      (index) => (index * spacing) % 100_000 === 0,
      minor,
      major,
    );

    const labelFirstX = Math.floor(envelope.minX / 100_000) * 100_000;
    const labelLastX = Math.ceil(envelope.maxX / 100_000) * 100_000;
    const labelFirstY = Math.floor(envelope.minY / 100_000) * 100_000;
    const labelLastY = Math.ceil(envelope.maxY / 100_000) * 100_000;
    for (let easting = labelFirstX; easting < labelLastX; easting += 100_000) {
      for (let northing = labelFirstY; northing < labelLastY; northing += 100_000) {
        const center = unprojectFromGrid(crs, {
          easting: easting + 50_000,
          northing: northing + 50_000,
        });
        if (!insideZone(zone, center[0], center[1])) continue;
        const southwest = unprojectFromGrid(crs, { easting, northing });
        if (
          southwest[0] < bounds.west ||
          southwest[0] >= bounds.east ||
          southwest[1] < bounds.south ||
          southwest[1] >= bounds.north
        )
          continue;
        const identifier = mgrsSquareIdentifier(center);
        if (!identifier) continue;
        labels.push({
          id: labels.length + 1,
          tags: [0, valueIndexFor(identifier), 1, valueIndexFor(zone.designation)],
          type: 1,
          geometry: encodePoint(projectToTile(bounds, southwest[0], southwest[1])),
        });
      }
    }
  }

  return tileBytes([
    { name: MGRS_MINOR_TILE_LAYER, features: minor, keys: [], values: [] },
    { name: MGRS_MAJOR_TILE_LAYER, features: major, keys: [], values: [] },
    {
      name: MGRS_LABEL_TILE_LAYER,
      features: labels,
      keys: ["identifier", "designation"],
      values: labelValues,
    },
  ]);
}

export function generateUtmTile(
  z: number,
  x: number,
  y: number,
  spacing: number,
  crs: Extract<GridCrs, { kind: "utm" }>,
): ArrayBuffer {
  const bounds = tileBounds(z, x, y);
  const minor: MvtFeature[] = [];
  const major: MvtFeature[] = [];
  emitLatticeLines(
    bounds,
    gridEnvelope(bounds, bounds, crs),
    spacing,
    gridLattice(crs),
    isMajorGridIndex,
    minor,
    major,
  );
  return tileBytes([
    { name: UTM_MINOR_TILE_LAYER, features: minor, keys: [], values: [] },
    { name: UTM_MAJOR_TILE_LAYER, features: major, keys: [], values: [] },
  ]);
}

export function generateLocalGridTile(
  z: number,
  x: number,
  y: number,
  spacing: number,
  definition: LocalGridDefinition,
): ArrayBuffer {
  const bounds = tileBounds(z, x, y);
  const frame = localGridFrame(definition);
  const minor: MvtFeature[] = [];
  const major: MvtFeature[] = [];
  const envelope = projectedRectEnvelope(bounds, (coordinate) =>
    projectWithFrame(frame, coordinate),
  );
  emitLatticeLines(
    bounds,
    envelope,
    spacing,
    {
      unproject: (x, y) => unprojectWithFrame(frame, { x, y }),
      isInside: (coordinate) => isLocalGridCoordinateValid(definition, coordinate),
    },
    isMajorGridIndex,
    minor,
    major,
  );
  return tileBytes([
    { name: LOCAL_GRID_MINOR_TILE_LAYER, features: minor, keys: [], values: [] },
    { name: LOCAL_GRID_MAJOR_TILE_LAYER, features: major, keys: [], values: [] },
  ]);
}

/**
 * Global angular linework is already aligned with Web Mercator tile axes, so
 * each line is two points rather than a walked lattice: meridians are vertical
 * in tile space and parallels horizontal. The index range and line cap still
 * come from the shared {@link latticeIndexRange}.
 */
export function generateLatLongTile(
  z: number,
  x: number,
  y: number,
  spacing: number,
): ArrayBuffer {
  const bounds = tileBounds(z, x, y);
  const minor: MvtFeature[] = [];
  const major: MvtFeature[] = [];
  const range = latticeIndexRange(
    { minX: bounds.west, maxX: bounds.east, minY: bounds.south, maxY: bounds.north },
    spacing,
  );
  if (range) {
    const lineTo = (index: number, points: readonly TilePoint[]) =>
      pushLine(isMajorGridIndex(index) ? major : minor, points);
    for (let index = range.firstX; index <= range.lastX; index++) {
      // Constant longitude: x is the same at both ends, y spans the whole tile.
      const [tileX] = projectToTile(bounds, index * spacing, bounds.north);
      lineTo(index, [
        [tileX, 0],
        [tileX, EXTENT],
      ]);
    }
    for (let index = range.firstY; index <= range.lastY; index++) {
      // Constant latitude: y is the same at both ends, x spans the whole tile.
      const [, tileY] = projectToTile(bounds, bounds.west, index * spacing);
      lineTo(index, [
        [0, tileY],
        [EXTENT, tileY],
      ]);
    }
  }
  return tileBytes([
    { name: LATLONG_MINOR_TILE_LAYER, features: minor, keys: [], values: [] },
    { name: LATLONG_MAJOR_TILE_LAYER, features: major, keys: [], values: [] },
  ]);
}

const TILE_URL = /^([a-z-]+):\/\/(\d+)\/(\d+)\/(\d+)\?(.*)$/;

/** Split a `<protocol>://z/x/y?query` tile URL; mode-specific validation follows. */
function parseTileUrl(protocol: string, url: string) {
  const match = url.match(TILE_URL);
  if (!match || match[1] !== protocol) return null;
  return {
    z: Number(match[2]),
    x: Number(match[3]),
    y: Number(match[4]),
    params: new URLSearchParams(match[5]),
  };
}

function positiveNumber(value: string | null) {
  const parsed = Number(value);
  return value !== null && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseTileRequest(url: string) {
  const request = parseTileUrl(MGRS_TILE_PROTOCOL, url);
  if (!request) return null;
  const spacing = Number(request.params.get("spacing"));
  if (!isMgrsInterval(spacing)) return null;
  return { ...request, spacing } as const;
}

function parseUtmTileRequest(url: string) {
  const request = parseTileUrl(UTM_TILE_PROTOCOL, url);
  if (!request) return null;
  const spacing = positiveNumber(request.params.get("spacing"));
  const zone = Number(request.params.get("zone"));
  const hemisphere = request.params.get("hemisphere");
  if (spacing === null || !Number.isInteger(zone) || zone < 1 || zone > 60) return null;
  if (hemisphere !== "north" && hemisphere !== "south") return null;
  return { ...request, spacing, crs: { kind: "utm", zone, hemisphere } as const };
}

function parseLocalGridTileRequest(url: string) {
  const request = parseTileUrl(LOCAL_GRID_TILE_PROTOCOL, url);
  if (!request) return null;
  const spacing = positiveNumber(request.params.get("spacing"));
  const longitude = Number(request.params.get("longitude"));
  const latitude = Number(request.params.get("latitude"));
  const bearing = Number(request.params.get("bearing"));
  if (
    spacing === null ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180 ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > WEB_MERCATOR_MAX_LATITUDE ||
    !Number.isFinite(bearing)
  )
    return null;
  return {
    ...request,
    spacing,
    definition: {
      origin: [longitude, latitude],
      interval: spacing,
      bearing,
    } as LocalGridDefinition,
  };
}

function parseLatLongTileRequest(url: string) {
  const request = parseTileUrl(LATLONG_TILE_PROTOCOL, url);
  if (!request) return null;
  const spacing = positiveNumber(request.params.get("spacing"));
  return spacing === null ? null : { ...request, spacing };
}

let consumers = 0;
let registered = false;

export function acquireGridTileProtocols() {
  if (consumers++ > 0) return;
  addProtocol(MGRS_TILE_PROTOCOL, async ({ url }) => {
    const request = parseTileRequest(url);
    if (!request) throw new Error(`Invalid MGRS tile URL: ${url}`);
    return { data: generateMgrsTile(request.z, request.x, request.y, request.spacing) };
  });
  addProtocol(UTM_TILE_PROTOCOL, async ({ url }) => {
    const request = parseUtmTileRequest(url);
    if (!request) throw new Error(`Invalid UTM tile URL: ${url}`);
    return {
      data: generateUtmTile(
        request.z,
        request.x,
        request.y,
        request.spacing,
        request.crs,
      ),
    };
  });
  addProtocol(LOCAL_GRID_TILE_PROTOCOL, async ({ url }) => {
    const request = parseLocalGridTileRequest(url);
    if (!request) throw new Error(`Invalid Local Grid tile URL: ${url}`);
    return {
      data: generateLocalGridTile(
        request.z,
        request.x,
        request.y,
        request.spacing,
        request.definition,
      ),
    };
  });
  addProtocol(LATLONG_TILE_PROTOCOL, async ({ url }) => {
    const request = parseLatLongTileRequest(url);
    if (!request) throw new Error(`Invalid latitude/longitude tile URL: ${url}`);
    return {
      data: generateLatLongTile(request.z, request.x, request.y, request.spacing),
    };
  });
  registered = true;
}

export function releaseGridTileProtocols() {
  consumers = Math.max(0, consumers - 1);
  if (consumers === 0 && registered) {
    removeProtocol(MGRS_TILE_PROTOCOL);
    removeProtocol(UTM_TILE_PROTOCOL);
    removeProtocol(LOCAL_GRID_TILE_PROTOCOL);
    removeProtocol(LATLONG_TILE_PROTOCOL);
    registered = false;
  }
}
