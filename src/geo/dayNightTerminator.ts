import type { FeatureCollection, MultiPolygon, Position } from "geojson";
import SunCalc from "suncalc";
import type { GeoJsonOverlayOptions } from "@/geo/contracts/mapAdapter";

export const DAY_NIGHT_TERMINATOR_OVERLAY_ID = "day-night-terminator";
export const DAY_NIGHT_TERMINATOR_TITLE = "Day/Night";
const TRANSPARENT_COLOR = "rgba(0, 0, 0, 0)";
const TWILIGHT_BANDS = [
  {
    title: "Civil twilight",
    altitude: 0,
    fillColor: "rgba(20, 35, 80, 0.16)",
    strokeColor: "rgba(120, 150, 210, 0.2)",
  },
  {
    title: "Nautical twilight",
    altitude: -6,
    fillColor: "rgba(10, 20, 65, 0.18)",
    strokeColor: "rgba(105, 130, 190, 0.24)",
  },
  {
    title: "Astronomical twilight",
    altitude: -12,
    fillColor: "rgba(5, 10, 45, 0.2)",
    strokeColor: "rgba(90, 110, 170, 0.28)",
  },
  {
    title: "Night",
    altitude: -18,
    fillColor: "rgba(0, 0, 25, 0.26)",
    strokeColor: "rgba(75, 90, 145, 0.32)",
  },
] as const;

export const DAY_NIGHT_TERMINATOR_OVERLAY_OPTIONS: GeoJsonOverlayOptions = {
  style: {
    fillColor: "rgba(0, 0, 50, 0.4)",
    fillColorProperty: "fillColor",
    strokeColor: TRANSPARENT_COLOR,
    strokeColorProperty: "strokeColor",
    strokeWidth: 1,
    strokeLineDash: [],
    circleRadius: 0,
    circleFillColor: TRANSPARENT_COLOR,
    circleStrokeColor: TRANSPARENT_COLOR,
  },
};

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const WORLD_MIN_LON = -180;
const WORLD_MAX_LON = 180;
const WORLD_MIN_LAT = -90;
const WORLD_MAX_LAT = 90;
const WEB_MERCATOR_MAX_LAT = 85.051129;
const BEARING_STEP_DEG = 4;
const BEARING_SAMPLES = 360 / BEARING_STEP_DEG;
const POLAR_LON_STEP_DEG = 4;

const SIN_BEARINGS = new Float64Array(BEARING_SAMPLES);
const COS_BEARINGS = new Float64Array(BEARING_SAMPLES);
for (let i = 0; i < BEARING_SAMPLES; i += 1) {
  const bearing = i * BEARING_STEP_DEG * RAD;
  SIN_BEARINGS[i] = Math.sin(bearing);
  COS_BEARINGS[i] = Math.cos(bearing);
}

function clampLat(lat: number): number {
  return Math.max(-WEB_MERCATOR_MAX_LAT, Math.min(WEB_MERCATOR_MAX_LAT, lat));
}

function normalizeDegrees(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

function normalizeLon(lon: number, centerLon = 0): number {
  return centerLon + normalizeDegrees(lon - centerLon);
}

function getSubsolarPoint(date: Date): { lat: number; lon: number } {
  // Solar declination: sun's altitude observed from the north pole.
  const declination = SunCalc.getPosition(date, 90, 0).altitude;

  // Subsolar longitude: project the sun's position seen from (0, 0) onto the
  // sphere using the spherical destination formula. SunCalc azimuth is
  // measured from south, clockwise; convert to bearing-from-north.
  const ref = SunCalc.getPosition(date, 0, 0);
  const bearing = ref.azimuth + Math.PI;
  const arc = Math.PI / 2 - ref.altitude;
  const subsolarLon = Math.atan2(Math.sin(bearing) * Math.sin(arc), Math.cos(arc));

  return { lat: declination * DEG, lon: normalizeDegrees(subsolarLon * DEG) };
}

function closeRing(ring: Position[]): Position[] {
  if (!ring.length) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring;
  return [...ring, first];
}

function clipRingToLongitudeWindow(
  ring: Position[],
  minLon: number,
  maxLon: number,
): Position[] {
  return closeRing(
    clipPositions(
      clipPositions(ring.slice(0, -1), (point) => point[0] >= minLon, minLon),
      (point) => point[0] <= maxLon,
      maxLon,
    ),
  );
}

function clipPositions(
  positions: Position[],
  isInside: (point: Position) => boolean,
  clipLon: number,
): Position[] {
  if (!positions.length) return [];
  const clipped: Position[] = [];

  for (let index = 0; index < positions.length; index += 1) {
    const current = positions[index];
    const previous = positions[(index + positions.length - 1) % positions.length];
    const currentInside = isInside(current);
    const previousInside = isInside(previous);

    if (currentInside !== previousInside) {
      clipped.push(interpolateAtLongitude(previous, current, clipLon));
    }
    if (currentInside) {
      clipped.push(current);
    }
  }

  return clipped;
}

function interpolateAtLongitude(from: Position, to: Position, lon: number): Position {
  // Clipping happens in lon/lat screen space for MapLibre fill stability; edge
  // intersections are linearized and are not exact solar-altitude samples.
  const ratio = (lon - from[0]) / (to[0] - from[0]);
  return [lon, from[1] + (to[1] - from[1]) * ratio];
}

function shiftRingLongitude(ring: Position[], offset: number): Position[] {
  return ring.map(([lon, lat]) => [lon + offset, clampLat(lat)]);
}

function getAngularDistanceDegrees(
  fromLatDeg: number,
  fromLonDeg: number,
  toLatDeg: number,
  toLonDeg: number,
): number {
  const fromLat = fromLatDeg * RAD;
  const toLat = toLatDeg * RAD;
  const deltaLon = (toLonDeg - fromLonDeg) * RAD;
  return (
    Math.acos(
      Math.sin(fromLat) * Math.sin(toLat) +
        Math.cos(fromLat) * Math.cos(toLat) * Math.cos(deltaLon),
    ) * DEG
  );
}

function getContainedPoleLat(
  centerLatDeg: number,
  centerLonDeg: number,
  radiusDeg: number,
): number | null {
  if (
    getAngularDistanceDegrees(centerLatDeg, centerLonDeg, WORLD_MAX_LAT, 0) <= radiusDeg
  ) {
    return WORLD_MAX_LAT;
  }
  if (
    getAngularDistanceDegrees(centerLatDeg, centerLonDeg, WORLD_MIN_LAT, 0) <= radiusDeg
  ) {
    return WORLD_MIN_LAT;
  }
  return null;
}

interface CenterTrig {
  centerLatDeg: number;
  centerLonDeg: number;
  sinCenterLat: number;
  cosCenterLat: number;
  centerLonRad: number;
}

function getPolarBoundaryLat(
  trig: CenterTrig,
  radiusDeg: number,
  lonDeg: number,
  poleLat: number,
): number {
  const capLat = poleLat > 0 ? WEB_MERCATOR_MAX_LAT : -WEB_MERCATOR_MAX_LAT;
  const oppositeLat = -capLat;
  const capDistance = getAngularDistanceDegrees(
    trig.centerLatDeg,
    trig.centerLonDeg,
    capLat,
    lonDeg,
  );
  const oppositeDistance = getAngularDistanceDegrees(
    trig.centerLatDeg,
    trig.centerLonDeg,
    oppositeLat,
    lonDeg,
  );

  if (capDistance > radiusDeg) return capLat;
  if (oppositeDistance <= radiusDeg) return oppositeLat;

  // Bisect at full 32-iter precision (~4e-8 deg) — boundary tests assert
  // solar altitude to 6 decimal places, so coarser bisection breaks them.
  let insideLat = capLat;
  let outsideLat = oppositeLat;
  for (let index = 0; index < 32; index += 1) {
    const midLat = (insideLat + outsideLat) / 2;
    const midDistance = getAngularDistanceDegrees(
      trig.centerLatDeg,
      trig.centerLonDeg,
      midLat,
      lonDeg,
    );
    if (midDistance <= radiusDeg) {
      insideLat = midLat;
    } else {
      outsideLat = midLat;
    }
  }

  return insideLat;
}

function getPolarCapPolygons(
  trig: CenterTrig,
  radiusDeg: number,
  poleLat: number,
): Position[][][] {
  const capLat = poleLat > 0 ? WEB_MERCATOR_MAX_LAT : -WEB_MERCATOR_MAX_LAT;
  const boundary: Position[] = [];

  for (let lon = WORLD_MIN_LON; lon <= WORLD_MAX_LON; lon += POLAR_LON_STEP_DEG) {
    boundary.push([lon, getPolarBoundaryLat(trig, radiusDeg, lon, poleLat)]);
  }
  if (boundary[boundary.length - 1][0] !== WORLD_MAX_LON) {
    boundary.push([
      WORLD_MAX_LON,
      getPolarBoundaryLat(trig, radiusDeg, WORLD_MAX_LON, poleLat),
    ]);
  }

  return [
    [
      closeRing([
        ...boundary,
        [WORLD_MAX_LON, capLat],
        [0, capLat],
        [WORLD_MIN_LON, capLat],
      ]),
    ],
  ];
}

function buildBandRing(trig: CenterTrig, radiusDeg: number): Position[] {
  // Spherical destination formula expanded so the per-vertex work is just two
  // multiplies + asin + atan2. Center trig and the bearing sin/cos table are
  // precomputed and shared across all bands.
  const radius = radiusDeg * RAD;
  const sinR = Math.sin(radius);
  const cosR = Math.cos(radius);
  const sinC = trig.sinCenterLat;
  const cosC = trig.cosCenterLat;
  const centerLonRad = trig.centerLonRad;
  const centerLonDeg = trig.centerLonDeg;
  const cosC_sinR = cosC * sinR;
  const ring: Position[] = new Array(BEARING_SAMPLES);

  for (let i = 0; i < BEARING_SAMPLES; i += 1) {
    const sinB = SIN_BEARINGS[i];
    const cosB = COS_BEARINGS[i];
    const sinLat = sinC * cosR + cosC_sinR * cosB;
    const lat = Math.asin(sinLat);
    const lon =
      centerLonRad + Math.atan2(sinB * sinR * cosC, cosR - sinC * sinLat);
    ring[i] = [normalizeLon(lon * DEG, centerLonDeg), clampLat(lat * DEG)];
  }
  return ring;
}

function getDarknessCoordinates(
  trig: CenterTrig,
  solarAltitudeDeg: number,
): Position[][][] {
  const radius = 90 + solarAltitudeDeg;
  const containedPoleLat = getContainedPoleLat(
    trig.centerLatDeg,
    trig.centerLonDeg,
    radius,
  );
  if (containedPoleLat !== null) {
    return getPolarCapPolygons(trig, radius, containedPoleLat);
  }

  const ring = buildBandRing(trig, radius);
  const closedRing = closeRing(ring);
  let minLon = Infinity;
  let maxLon = -Infinity;
  for (const [lon] of closedRing) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }
  const minWorld = Math.floor((minLon + 180) / 360);
  const maxWorld = Math.floor((maxLon + 180) / 360);
  const polygons: Position[][][] = [];

  for (let world = minWorld; world <= maxWorld; world += 1) {
    const windowMin = world * 360 - 180;
    const windowMax = world * 360 + 180;
    const clipped = clipRingToLongitudeWindow(closedRing, windowMin, windowMax);
    if (clipped.length < 4) continue;
    polygons.push([shiftRingLongitude(clipped, -world * 360)]);
  }
  return polygons;
}

export function getDayNightTerminatorGeoJson(
  time: number | string | Date,
): FeatureCollection<MultiPolygon> {
  const date = time instanceof Date ? time : new Date(time);
  const subsolar = getSubsolarPoint(date);
  const antisolarLat = -subsolar.lat;
  const antisolarLon = normalizeDegrees(subsolar.lon + 180);
  const centerLatRad = antisolarLat * RAD;
  const trig: CenterTrig = {
    centerLatDeg: antisolarLat,
    centerLonDeg: antisolarLon,
    sinCenterLat: Math.sin(centerLatRad),
    cosCenterLat: Math.cos(centerLatRad),
    centerLonRad: antisolarLon * RAD,
  };

  return {
    type: "FeatureCollection",
    features: TWILIGHT_BANDS.map((band) => ({
      type: "Feature",
      properties: {
        title: band.title,
        fillColor: band.fillColor,
        strokeColor: band.strokeColor,
        solarAltitude: band.altitude,
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: getDarknessCoordinates(trig, band.altitude),
      },
    })),
  };
}
