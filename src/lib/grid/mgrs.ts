import type { Feature, FeatureCollection, LineString, Point, Position } from "geojson";
import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";
import GeographicLibMgrs from "geographiclib-mgrs";
import { gridLineFeature, type GridAppearance } from "./appearance";
import {
  gridResolutionForAdapter,
  gridViewportCenter,
  viewportSamplePixels,
} from "./projected";
import { clipSampledLine, gridLineSampleCount, projectedRectEnvelope } from "./clipping";
import {
  projectToGrid,
  selectGridCrs,
  unprojectFromGrid,
  type GridPoint,
} from "./projection";
import type { GridCrs, MgrsGridDefinition } from "./types";
import {
  gridEdgeIntersection,
  resolveGridLabelCollisions,
  type GridReferenceLabel,
} from "./labels";
import { clampMercatorLatitude, unwrapLongitude, wrapLongitude } from "./geo";

export type MgrsPortrayalLevel = "overview" | "detail";

export interface ActiveMgrsGridDefinition extends MgrsGridDefinition {
  crs: GridCrs;
  /** UTM grid-zone designation (for example 32V) or UPS zone (A, B, Y, Z). */
  designation: string;
}

export interface MgrsGridPortrayal {
  features: Feature<LineString>[];
  labels: GridReferenceLabel[];
  spacing: number;
  level: MgrsPortrayalLevel;
  activeDefinition: ActiveMgrsGridDefinition | null;
  /** Every visible GZD contributing a detailed lattice; activeDefinition still owns snapping. */
  detailDefinitions: ActiveMgrsGridDefinition[];
}

/**
 * Which portrayal parts the caller draws itself. The editor lets MapLibre retain
 * the static overview and square labels natively; the canvas export draws all of them.
 */
export interface MgrsPortrayalParts {
  overviewFeatures: boolean;
  overviewLabels: boolean;
  /** Detailed linework can be retained by MapLibre tiles while UPS stays on the canvas path. */
  detailFeatures: boolean | "ups";
  detailSquareLabels: boolean;
}

export const ALL_PORTRAYAL_PARTS: MgrsPortrayalParts = {
  overviewFeatures: true,
  overviewLabels: true,
  detailFeatures: true,
  detailSquareLabels: true,
};

export const NATIVE_PORTRAYAL_PARTS: MgrsPortrayalParts = {
  overviewFeatures: false,
  overviewLabels: false,
  detailFeatures: "ups",
  detailSquareLabels: false,
};

/** The MGRS reference precisions the app offers, in metres. */
export const MGRS_INTERVALS = [100, 1_000, 10_000, 100_000] as const;
const MAX_GRID_LINES = 500;
const MGRS_ZONE_CELL_METERS = 100_000;
const DETAIL_ENTER_PX = 12;
const DETAIL_EXIT_PX = 8;
const DETAIL_INITIAL_PX = 10;
const LATITUDE_BANDS = "CDEFGHJKLMNPQRSTUVWX";
const MGRS_MIN_CELL_PIXELS: Record<MgrsGridDefinition["interval"], number> = {
  100: 28,
  1_000: 40,
  10_000: 20,
  100_000: 18,
};

export interface MgrsZoneBounds {
  designation: string;
  west: number;
  east: number;
  south: number;
  north: number;
}

export function isMgrsInterval(value: number): value is MgrsGridDefinition["interval"] {
  return MGRS_INTERVALS.some((interval) => interval === value);
}

/** The whitespace-free MGRS reference for a position at `precision` digits per
 *  ordinate (0 = the bare 100 km square), or null where MGRS is undefined. The
 *  one place this app converts WGS84 to MGRS. */
export function mgrsReference(
  position: readonly [number, number],
  precision: number,
): string | null {
  try {
    return GeographicLibMgrs.forward([position[0], position[1]], precision).replace(
      /\s/g,
      "",
    );
  } catch {
    return null;
  }
}

/** One forward conversion yields both halves of a 100 km MGRS reference. */
function mgrsForward(
  position: readonly [number, number],
): { designation: string; identifier: string } | null {
  const reference = mgrsReference(position, 0);
  if (!reference) return null;
  return { designation: reference.slice(0, -2), identifier: reference.slice(-2) };
}

export function mgrsZoneDesignation(position: readonly [number, number]): string | null {
  return mgrsForward(position)?.designation ?? null;
}

export function mgrsSquareIdentifier(position: readonly [number, number]): string | null {
  return mgrsForward(position)?.identifier ?? null;
}

export function mgrsReferenceDigits(value: number, spacing: number): string | null {
  const precision =
    spacing === 10_000 ? 1 : spacing === 1_000 ? 2 : spacing === 100 ? 3 : 0;
  if (!precision) return null;
  const withinSquare = ((Math.round(value) % 100_000) + 100_000) % 100_000;
  return String(Math.floor(withinSquare / spacing)).padStart(precision, "0");
}

export function mgrsVisibleSpacing(
  configuredMeters: MgrsGridDefinition["interval"],
  resolution: number,
): MgrsGridDefinition["interval"] {
  if (!Number.isFinite(resolution) || resolution <= 0) return configuredMeters;
  let spacing: MgrsGridDefinition["interval"] = configuredMeters;
  while (spacing < 100_000) {
    if (spacing / resolution >= MGRS_MIN_CELL_PIXELS[spacing]) break;
    spacing = (spacing * 10) as MgrsGridDefinition["interval"];
  }
  return spacing;
}

export function activeMgrsDefinitionAt(
  position: readonly [number, number],
  interval: MgrsGridDefinition["interval"],
): ActiveMgrsGridDefinition | null {
  const designation = mgrsZoneDesignation(position);
  if (!designation) return null;
  return { crs: selectGridCrs(position), designation, interval };
}

/** Resolve the zoom-adaptive level early enough to establish the two-letter 100 km grid first. */
export function resolveMgrsPortrayalLevel(
  adapter: MapAdapter,
  crs: GridCrs,
  previous: MgrsPortrayalLevel | null = null,
): MgrsPortrayalLevel {
  const resolution = gridResolutionForAdapter(adapter, crs);
  const cellPixels = resolution ? MGRS_ZONE_CELL_METERS / resolution : 0;
  if (previous === "overview")
    return cellPixels >= DETAIL_ENTER_PX ? "detail" : "overview";
  if (previous === "detail") return cellPixels < DETAIL_EXIT_PX ? "overview" : "detail";
  return cellPixels >= DETAIL_INITIAL_PX ? "detail" : "overview";
}

function longitudeZonesForBand(band: string) {
  const zones = Array.from({ length: 60 }, (_, index) => ({
    zone: index + 1,
    west: -180 + index * 6,
    east: -174 + index * 6,
  }));
  if (band === "V") {
    return zones.map((entry) =>
      entry.zone === 31
        ? { ...entry, east: 3 }
        : entry.zone === 32
          ? { ...entry, west: 3, east: 12 }
          : entry,
    );
  }
  if (band === "X") {
    return zones
      .filter((entry) => ![32, 34, 36].includes(entry.zone))
      .map((entry) => {
        if (entry.zone === 31) return { ...entry, east: 9 };
        if (entry.zone === 33) return { ...entry, west: 9, east: 21 };
        if (entry.zone === 35) return { ...entry, west: 21, east: 33 };
        if (entry.zone === 37) return { ...entry, west: 33, east: 42 };
        return entry;
      });
  }
  return zones;
}

/** Canonical WGS 84 MGRS grid-zone designators, including UTM exceptions and UPS. */
let cachedZoneBounds: MgrsZoneBounds[] | null = null;

export function mgrsZoneBounds(): MgrsZoneBounds[] {
  if (cachedZoneBounds) return cachedZoneBounds;
  const utm = [...LATITUDE_BANDS].flatMap((band, bandIndex) => {
    const south = -80 + bandIndex * 8;
    const north = band === "X" ? 84 : south + 8;
    return longitudeZonesForBand(band).map(({ zone, west, east }) => ({
      designation: `${zone}${band}`,
      west,
      east,
      south,
      north,
    }));
  });
  cachedZoneBounds = [
    ...utm,
    { designation: "A", west: -180, east: 0, south: -90, north: -80 },
    { designation: "B", west: 0, east: 180, south: -90, north: -80 },
    { designation: "Y", west: -180, east: 0, south: 84, north: 90 },
    { designation: "Z", west: 0, east: 180, south: 84, north: 90 },
  ];
  return cachedZoneBounds;
}

/** The four Mercator-safe edges of a GZD box, shared by the native and canvas portrayals. */
function zoneEdgeSegments(
  zone: Pick<MgrsZoneBounds, "west" | "east" | "south" | "north">,
) {
  const south = clampMercatorLatitude(zone.south);
  const north = clampMercatorLatitude(zone.north);
  return [
    [
      [zone.west, south],
      [zone.east, south],
    ],
    [
      [zone.east, south],
      [zone.east, north],
    ],
    [
      [zone.east, north],
      [zone.west, north],
    ],
    [
      [zone.west, north],
      [zone.west, south],
    ],
  ] as [Position, Position][];
}

/** Collect zone edges once, keyed so a shared boundary is emitted by only one neighbour. */
function collectZoneEdges<T>(
  zones: Iterable<Pick<MgrsZoneBounds, "west" | "east" | "south" | "north">>,
  makeFeature: (key: string, coordinates: Position[]) => T,
): T[] {
  const collected: T[] = [];
  const keys = new Set<string>();
  for (const zone of zones) {
    for (const [a, b] of zoneEdgeSegments(zone)) {
      const ordered =
        a[0]! < b[0]! || (a[0] === b[0] && a[1]! <= b[1]!) ? [a, b] : [b, a];
      const key = ordered.flat().join(":");
      if (keys.has(key)) continue;
      keys.add(key);
      collected.push(makeFeature(key, ordered));
    }
  }
  return collected;
}

let cachedOverviewLines: FeatureCollection<LineString> | null = null;

/** Static global GZD boundaries for MapLibre to retain, cull, and render natively. */
export function mgrsZoneOverviewLineData(): FeatureCollection<LineString> {
  if (cachedOverviewLines) return cachedOverviewLines;
  cachedOverviewLines = {
    type: "FeatureCollection",
    features: collectZoneEdges<Feature<LineString>>(
      mgrsZoneBounds(),
      (key, coordinates) => ({
        type: "Feature",
        id: `mgrs-zone-${key}`,
        properties: {},
        geometry: { type: "LineString", coordinates },
      }),
    ),
  };
  return cachedOverviewLines;
}

let cachedOverviewLabels: FeatureCollection<Point> | null = null;

/** Static southwest-corner anchors for MapLibre's native overview symbol layer. */
export function mgrsZoneOverviewLabelData(): FeatureCollection<Point> {
  if (cachedOverviewLabels) return cachedOverviewLabels;
  cachedOverviewLabels = {
    type: "FeatureCollection",
    features: mgrsZoneBounds().map((zone) => ({
      type: "Feature",
      id: `mgrs-zone-label-${zone.designation}`,
      properties: { designation: zone.designation },
      geometry: {
        type: "Point",
        coordinates: [zone.west, clampMercatorLatitude(zone.south)],
      },
    })),
  };
  return cachedOverviewLabels;
}

export function isCoordinateInMgrsZone(
  definition: ActiveMgrsGridDefinition,
  coordinate: readonly [number, number],
) {
  return mgrsZoneDesignation(coordinate) === definition.designation;
}

function projectionLimits(crs: GridCrs) {
  return crs.kind === "utm"
    ? { minX: 100_000, maxX: 900_000, minY: 0, maxY: 10_000_000 }
    : { minX: 800_000, maxX: 3_200_000, minY: 800_000, maxY: 3_200_000 };
}

function mgrsDefinitionKey(definition: ActiveMgrsGridDefinition) {
  return `${definition.designation}:${definition.crs.kind}:${
    definition.crs.kind === "utm"
      ? `${definition.crs.zone}:${definition.crs.hemisphere}`
      : definition.crs.hemisphere
  }`;
}

const projectedZoneEnvelopeCache = new Map<
  string,
  { minX: number; maxX: number; minY: number; maxY: number }
>();

/** Tight projected bounds keep multi-zone detail work proportional to each GZD, not a hemisphere. */
function projectedZoneEnvelope(definition: ActiveMgrsGridDefinition) {
  const key = mgrsDefinitionKey(definition);
  const cached = projectedZoneEnvelopeCache.get(key);
  if (cached) return cached;
  const zone = mgrsZoneBounds().find(
    ({ designation }) => designation === definition.designation,
  );
  if (!zone) return projectionLimits(definition.crs);
  const bounds = projectedRectEnvelope(
    {
      west: zone.west,
      east: zone.east,
      south: clampMercatorLatitude(zone.south),
      north: clampMercatorLatitude(zone.north),
    },
    (coordinate) => {
      try {
        const point = projectToGrid(definition.crs, coordinate);
        return { x: point.easting, y: point.northing };
      } catch {
        return null;
      }
    },
    16,
  );
  const limits = projectionLimits(definition.crs);
  if (!Number.isFinite(bounds.minX)) return limits;
  const envelope = {
    minX: Math.max(limits.minX, bounds.minX),
    maxX: Math.min(limits.maxX, bounds.maxX),
    minY: Math.max(limits.minY, bounds.minY),
    maxY: Math.min(limits.maxY, bounds.maxY),
  };
  projectedZoneEnvelopeCache.set(key, envelope);
  return envelope;
}

const squareLabelDataCache = new Map<string, FeatureCollection<Point>>();

/** One cached native-symbol source containing every valid 100 km identifier in a GZD. */
export function mgrsSquareLabelData(
  definition: ActiveMgrsGridDefinition,
): FeatureCollection<Point> {
  const key = mgrsDefinitionKey(definition);
  const cached = squareLabelDataCache.get(key);
  if (cached) return cached;
  const zoneEnvelope = projectedZoneEnvelope(definition);
  const limits = projectionLimits(definition.crs);
  const minX = Math.max(limits.minX, Math.floor(zoneEnvelope.minX / 100_000) * 100_000);
  const maxX = Math.min(limits.maxX, Math.ceil(zoneEnvelope.maxX / 100_000) * 100_000);
  const minY = Math.max(limits.minY, Math.floor(zoneEnvelope.minY / 100_000) * 100_000);
  const maxY = Math.min(limits.maxY, Math.ceil(zoneEnvelope.maxY / 100_000) * 100_000);
  const features: Feature<Point>[] = [];
  for (let x = minX; x < maxX; x += 100_000) {
    for (let y = minY; y < maxY; y += 100_000) {
      try {
        const center = unprojectFromGrid(definition.crs, {
          easting: x + 50_000,
          northing: y + 50_000,
        });
        const reference = mgrsForward(center);
        if (!reference || reference.designation !== definition.designation) continue;
        const southwest = unprojectFromGrid(definition.crs, { easting: x, northing: y });
        features.push({
          type: "Feature",
          id: `mgrs-square-${definition.designation}-${x}-${y}`,
          // `center` drives the inward label nudge and `easting`/`northing` the
          // viewport window, both in the canvas portrayal.
          properties: {
            designation: reference.designation,
            identifier: reference.identifier,
            center: [...center],
            easting: x,
            northing: y,
          },
          geometry: { type: "Point", coordinates: [...southwest] },
        });
      } catch {
        // Projection limit corners can be outside the legal MGRS domain.
      }
    }
  }
  const data: FeatureCollection<Point> = { type: "FeatureCollection", features };
  squareLabelDataCache.set(key, data);
  return data;
}

function interpolate(a: GridPoint, b: GridPoint, ratio: number): GridPoint {
  return {
    easting: a.easting + (b.easting - a.easting) * ratio,
    northing: a.northing + (b.northing - a.northing) * ratio,
  };
}

function clippedGridLine(
  definition: ActiveMgrsGridDefinition,
  start: GridPoint,
  end: GridPoint,
  spacing: number,
): Position[][] {
  const length = Math.hypot(end.easting - start.easting, end.northing - start.northing);
  return clipSampledLine(start, end, gridLineSampleCount(length, spacing), {
    lerp: interpolate,
    toCoordinate: (point) => {
      const coordinate = unprojectFromGrid(definition.crs, point);
      return [coordinate[0], coordinate[1]];
    },
    isValid: (coordinate) =>
      isCoordinateInMgrsZone(definition, coordinate as [number, number]),
  });
}

function buildDetailedMgrsGridPortrayal(
  adapter: MapAdapter,
  definition: ActiveMgrsGridDefinition,
  appearance: GridAppearance,
  includeFeatures = true,
  includeSquareLabels = true,
  renderedSpacing?: number,
): MgrsGridPortrayal | null {
  const fromPixel = adapter.getCoordinateFromPixel;
  if (!fromPixel) return null;
  const { width, height } = adapter.getViewportSize();
  if (width <= 0 || height <= 0) return null;
  const samplePixels = viewportSamplePixels(width, height);
  const viewportSamples = samplePixels
    .map((pixel) => fromPixel.call(adapter, pixel))
    .filter((coordinate): coordinate is Position => Boolean(coordinate));
  if (!viewportSamples.length) return null;

  let projected: GridPoint[];
  try {
    projected = viewportSamples.map((coordinate) =>
      projectToGrid(definition.crs, coordinate as [number, number]),
    );
  } catch {
    return null;
  }
  const limits = projectedZoneEnvelope(definition);
  const minX = Math.max(
    limits.minX,
    Math.min(...projected.map((point) => point.easting)),
  );
  const maxX = Math.min(
    limits.maxX,
    Math.max(...projected.map((point) => point.easting)),
  );
  const minY = Math.max(
    limits.minY,
    Math.min(...projected.map((point) => point.northing)),
  );
  const maxY = Math.min(
    limits.maxY,
    Math.max(...projected.map((point) => point.northing)),
  );
  const resolution = gridResolutionForAdapter(adapter, definition.crs);
  if (!resolution || minX > maxX || minY > maxY) {
    return {
      features: [],
      labels: [],
      spacing: definition.interval,
      level: "detail",
      activeDefinition: definition,
      detailDefinitions: [definition],
    };
  }
  const spacing = renderedSpacing ?? mgrsVisibleSpacing(definition.interval, resolution);
  const firstX = Math.floor(minX / spacing);
  const lastX = Math.ceil(maxX / spacing);
  const firstY = Math.floor(minY / spacing);
  const lastY = Math.ceil(maxY / spacing);
  if (lastX - firstX + lastY - firstY > MAX_GRID_LINES) return null;

  const features: Feature<LineString>[] = [];
  const labelCandidates: GridReferenceLabel[] = [];
  for (let index = firstX; index <= lastX; index++) {
    const easting = index * spacing;
    const digits = mgrsReferenceDigits(easting, spacing);
    // Clipping is the expensive part; skip it when neither linework nor an
    // edge label needs the geometry (native portrayal draws lines from tiles).
    if (!includeFeatures && !digits) continue;
    const segments = clippedGridLine(
      definition,
      { easting, northing: minY },
      { easting, northing: maxY },
      spacing,
    );
    if (includeFeatures) {
      segments.forEach((coordinates, segmentIndex) =>
        features.push(
          gridLineFeature(
            `mgrs-${definition.designation}-x-${index}-${segmentIndex}`,
            coordinates,
            easting % 100_000 === 0,
            appearance,
          ),
        ),
      );
    }
    if (digits) {
      const pixel = segments
        .map((segment) => gridEdgeIntersection(segment, adapter, "bottom", width, height))
        .find((value): value is PixelCoordinate => Boolean(value));
      if (pixel) {
        labelCandidates.push({
          id: `mgrs-${definition.designation}-label-x-${index}`,
          text: digits,
          pixel,
          anchor: "bottom",
          priority: spacing,
        });
      }
    }
  }
  for (let index = firstY; index <= lastY; index++) {
    const northing = index * spacing;
    const digits = mgrsReferenceDigits(northing, spacing);
    if (!includeFeatures && !digits) continue;
    const segments = clippedGridLine(
      definition,
      { easting: minX, northing },
      { easting: maxX, northing },
      spacing,
    );
    if (includeFeatures) {
      segments.forEach((coordinates, segmentIndex) =>
        features.push(
          gridLineFeature(
            `mgrs-${definition.designation}-y-${index}-${segmentIndex}`,
            coordinates,
            northing % 100_000 === 0,
            appearance,
          ),
        ),
      );
    }
    if (digits) {
      const pixel = segments
        .map((segment) => gridEdgeIntersection(segment, adapter, "left", width, height))
        .find((value): value is PixelCoordinate => Boolean(value));
      if (pixel) {
        labelCandidates.push({
          id: `mgrs-${definition.designation}-label-y-${index}`,
          text: digits,
          pixel,
          anchor: "left",
          priority: spacing,
        });
      }
    }
  }

  if (includeSquareLabels) {
    // The cached per-zone squares are a superset of the viewport; only the
    // screen-space placement below depends on the camera.
    for (const square of mgrsSquareLabelData(definition).features) {
      const { designation, identifier, center, easting, northing } =
        square.properties as {
          designation: string;
          identifier: string;
          center: [number, number];
          easting: number;
          northing: number;
        };
      if (easting + 100_000 < minX || easting > maxX) continue;
      if (northing + 100_000 < minY || northing > maxY) continue;
      let cornerPixel: PixelCoordinate | null;
      let centerPixel: PixelCoordinate | null;
      try {
        cornerPixel = adapter.getPixelFromCoordinate([...square.geometry.coordinates]);
        centerPixel = adapter.getPixelFromCoordinate(center);
      } catch {
        continue;
      }
      if (!cornerPixel || !centerPixel) continue;
      const length =
        Math.hypot(centerPixel[0] - cornerPixel[0], centerPixel[1] - cornerPixel[1]) || 1;
      const pixel: PixelCoordinate = [
        cornerPixel[0] + ((centerPixel[0] - cornerPixel[0]) / length) * 7,
        cornerPixel[1] + ((centerPixel[1] - cornerPixel[1]) / length) * 7,
      ];
      if (pixel[0] < 0 || pixel[0] > width || pixel[1] < 0 || pixel[1] > height) continue;
      labelCandidates.push({
        id: `mgrs-${definition.designation}-${String(square.id)}`,
        text: `${designation} ${identifier}`,
        pixel,
        anchor: "square",
        priority: 1_000_000_000,
      });
    }
  }

  return {
    features,
    labels: resolveGridLabelCollisions(labelCandidates),
    spacing,
    level: "detail",
    activeDefinition: definition,
    detailDefinitions: [definition],
  };
}

interface VisibleMgrsZone extends MgrsZoneBounds {
  copy: number;
}

function viewportEnvelope(adapter: MapAdapter) {
  const fromPixel = adapter.getCoordinateFromPixel;
  if (!fromPixel) return null;
  const { width, height } = adapter.getViewportSize();
  if (width <= 0 || height <= 0) return null;
  const center = gridViewportCenter(adapter);
  if (!center) return null;
  const coordinates = viewportSamplePixels(width, height)
    .map((pixel) => fromPixel.call(adapter, pixel))
    .filter((coordinate): coordinate is Position => Boolean(coordinate));
  if (!coordinates.length) return null;
  const longitudes = coordinates.map((coordinate) =>
    unwrapLongitude(center[0], coordinate[0]!),
  );
  let west = Math.min(...longitudes);
  let east = Math.max(...longitudes);
  if (east - west > 360) {
    west = center[0] - 180;
    east = center[0] + 180;
  }
  return {
    width,
    height,
    center,
    west,
    east,
    south: clampMercatorLatitude(Math.min(...coordinates.map((c) => c[1]!))),
    north: clampMercatorLatitude(Math.max(...coordinates.map((c) => c[1]!))),
  };
}

function visibleMgrsZones(
  envelope: NonNullable<ReturnType<typeof viewportEnvelope>>,
): VisibleMgrsZone[] {
  const visible: VisibleMgrsZone[] = [];
  for (const zone of mgrsZoneBounds()) {
    if (zone.north <= envelope.south || zone.south >= envelope.north) continue;
    const midpoint = (zone.west + zone.east) / 2;
    const nearestCopy = Math.round((envelope.center[0] - midpoint) / 360);
    for (let copy = nearestCopy - 1; copy <= nearestCopy + 1; copy++) {
      const west = zone.west + copy * 360;
      const east = zone.east + copy * 360;
      if (east <= envelope.west || west >= envelope.east) continue;
      visible.push({ ...zone, west, east, copy });
    }
  }
  return visible;
}

function detailDefinitionsForViewport(
  adapter: MapAdapter,
  activeDefinition: ActiveMgrsGridDefinition,
): ActiveMgrsGridDefinition[] {
  const envelope = viewportEnvelope(adapter);
  if (!envelope) return [activeDefinition];
  const definitions = new Map<string, ActiveMgrsGridDefinition>([
    [activeDefinition.designation, activeDefinition],
  ]);
  for (const zone of visibleMgrsZones(envelope)) {
    if (definitions.has(zone.designation)) continue;
    const longitude = wrapLongitude((zone.west + zone.east) / 2);
    const latitude =
      (clampMercatorLatitude(zone.south) + clampMercatorLatitude(zone.north)) / 2;
    definitions.set(zone.designation, {
      crs: selectGridCrs([longitude, latitude]),
      designation: zone.designation,
      interval: activeDefinition.interval,
    });
  }
  return [...definitions.values()];
}

function clipPolygonEdge(
  polygon: PixelCoordinate[],
  inside: (point: PixelCoordinate) => boolean,
  intersect: (a: PixelCoordinate, b: PixelCoordinate) => PixelCoordinate,
) {
  const output: PixelCoordinate[] = [];
  for (let index = 0; index < polygon.length; index++) {
    const current = polygon[index]!;
    const previous = polygon[(index + polygon.length - 1) % polygon.length]!;
    const currentInside = inside(current);
    const previousInside = inside(previous);
    if (currentInside !== previousInside) output.push(intersect(previous, current));
    if (currentInside) output.push(current);
  }
  return output;
}

function clipScreenPolygon(
  polygon: PixelCoordinate[],
  width: number,
  height: number,
): PixelCoordinate[] {
  const atX =
    (x: number) =>
    (a: PixelCoordinate, b: PixelCoordinate): PixelCoordinate => {
      const ratio = b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0]);
      return [x, a[1] + (b[1] - a[1]) * ratio];
    };
  const atY =
    (y: number) =>
    (a: PixelCoordinate, b: PixelCoordinate): PixelCoordinate => {
      const ratio = b[1] === a[1] ? 0 : (y - a[1]) / (b[1] - a[1]);
      return [a[0] + (b[0] - a[0]) * ratio, y];
    };
  let clipped = clipPolygonEdge(polygon, ([x]) => x >= 0, atX(0));
  clipped = clipPolygonEdge(clipped, ([x]) => x <= width, atX(width));
  clipped = clipPolygonEdge(clipped, ([, y]) => y >= 0, atY(0));
  return clipPolygonEdge(clipped, ([, y]) => y <= height, atY(height));
}

function zoneLabelPixel(
  adapter: MapAdapter,
  zone: VisibleMgrsZone,
  width: number,
  height: number,
): PixelCoordinate | null {
  let polygon: PixelCoordinate[];
  try {
    const edges = zoneEdgeSegments(zone);
    polygon = [edges[0]![0], edges[0]![1], edges[2]![0], edges[2]![1]]
      .map((coordinate) => adapter.getPixelFromCoordinate(coordinate))
      .filter((pixel): pixel is PixelCoordinate => Boolean(pixel));
  } catch {
    return null;
  }
  if (polygon.length !== 4) return null;
  const clipped = clipScreenPolygon(polygon, width, height);
  if (!clipped.length) return null;
  const minX = Math.min(...clipped.map(([x]) => x));
  const maxX = Math.max(...clipped.map(([x]) => x));
  const minY = Math.min(...clipped.map(([, y]) => y));
  const maxY = Math.max(...clipped.map(([, y]) => y));
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  return [...clipped].sort(
    (a, b) =>
      (a[0] - minX) / spanX +
        (maxY - a[1]) / spanY -
        ((b[0] - minX) / spanX + (maxY - b[1]) / spanY) ||
      a[0] - b[0] ||
      b[1] - a[1],
  )[0]!;
}

function buildMgrsZoneOverview(
  adapter: MapAdapter,
  appearance: GridAppearance,
  parts: MgrsPortrayalParts,
): MgrsGridPortrayal | null {
  const envelope = viewportEnvelope(adapter);
  if (!envelope) return null;
  const zones = visibleMgrsZones(envelope);
  const features = parts.overviewFeatures
    ? collectZoneEdges(zones, (key, coordinates) =>
        gridLineFeature(`mgrs-zone-${key}`, coordinates, true, appearance),
      )
    : [];
  const labels: GridReferenceLabel[] = [];
  for (const zone of zones) {
    const pixel = parts.overviewLabels
      ? zoneLabelPixel(adapter, zone, envelope.width, envelope.height)
      : null;
    if (pixel) {
      labels.push({
        id: `mgrs-zone-label-${zone.designation}-${zone.copy}`,
        text: zone.designation,
        pixel,
        anchor: "zone",
        priority: 1_000_000,
      });
    }
  }
  return {
    features,
    labels: resolveGridLabelCollisions(labels),
    spacing: MGRS_ZONE_CELL_METERS,
    level: "overview",
    activeDefinition: null,
    detailDefinitions: [],
  };
}

export function buildMgrsGridPortrayal(
  adapter: MapAdapter,
  definition: MgrsGridDefinition,
  appearance: GridAppearance,
  previousLevel: MgrsPortrayalLevel | null = null,
  parts: MgrsPortrayalParts = ALL_PORTRAYAL_PARTS,
): MgrsGridPortrayal | null {
  const center = gridViewportCenter(adapter);
  if (!center) return null;
  const activeDefinition = activeMgrsDefinitionAt(center, definition.interval);
  if (!activeDefinition) return buildMgrsZoneOverview(adapter, appearance, parts);
  const level = resolveMgrsPortrayalLevel(adapter, activeDefinition.crs, previousLevel);
  if (level === "detail") {
    const includeDetailFeatures = (candidate: ActiveMgrsGridDefinition) =>
      parts.detailFeatures === true ||
      (parts.detailFeatures === "ups" && candidate.crs.kind === "ups");
    // A still-wide viewport can contain coordinates that GeographicLib refuses
    // to force into the center zone. Keep the retained overview visible until
    // the detailed builder has a complete portrayal instead of creating a
    // blank transition band between the two modes.
    const activeDetail = buildDetailedMgrsGridPortrayal(
      adapter,
      activeDefinition,
      appearance,
      includeDetailFeatures(activeDefinition),
      parts.detailSquareLabels,
    );
    if (activeDetail) {
      const details = detailDefinitionsForViewport(adapter, activeDefinition)
        .filter(({ designation }) => designation !== activeDefinition.designation)
        .map((definition) =>
          buildDetailedMgrsGridPortrayal(
            adapter,
            definition,
            appearance,
            includeDetailFeatures(definition),
            parts.detailSquareLabels,
            activeDetail.spacing,
          ),
        )
        .filter((detail): detail is MgrsGridPortrayal => detail !== null);
      const portrayals = [activeDetail, ...details];
      return {
        features: portrayals.flatMap(({ features }) => features),
        labels: resolveGridLabelCollisions(portrayals.flatMap(({ labels }) => labels)),
        spacing: activeDetail.spacing,
        level: "detail",
        activeDefinition,
        detailDefinitions: portrayals.flatMap(
          ({ detailDefinitions }) => detailDefinitions,
        ),
      };
    }
  }
  return buildMgrsZoneOverview(adapter, appearance, parts);
}
