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

function destinationPoint(
  centerLatDeg: number,
  centerLonDeg: number,
  bearingDeg: number,
  distanceDeg: number,
): Position {
  const centerLat = centerLatDeg * RAD;
  const centerLon = centerLonDeg * RAD;
  const bearing = bearingDeg * RAD;
  const distance = distanceDeg * RAD;

  const lat = Math.asin(
    Math.sin(centerLat) * Math.cos(distance) +
      Math.cos(centerLat) * Math.sin(distance) * Math.cos(bearing),
  );
  const lon =
    centerLon +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance) * Math.cos(centerLat),
      Math.cos(distance) - Math.sin(centerLat) * Math.sin(lat),
    );

  return [normalizeLon(lon * DEG, centerLonDeg), clampLat(lat * DEG)];
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

function getPolarBoundaryLat(
  centerLatDeg: number,
  centerLonDeg: number,
  radiusDeg: number,
  lonDeg: number,
  poleLat: number,
): number {
  const capLat = poleLat > 0 ? WEB_MERCATOR_MAX_LAT : -WEB_MERCATOR_MAX_LAT;
  const oppositeLat = -capLat;
  const capDistance = getAngularDistanceDegrees(
    centerLatDeg,
    centerLonDeg,
    capLat,
    lonDeg,
  );
  const oppositeDistance = getAngularDistanceDegrees(
    centerLatDeg,
    centerLonDeg,
    oppositeLat,
    lonDeg,
  );

  if (capDistance > radiusDeg) return capLat;
  if (oppositeDistance <= radiusDeg) return oppositeLat;

  let insideLat = capLat;
  let outsideLat = oppositeLat;
  for (let index = 0; index < 32; index += 1) {
    const midLat = (insideLat + outsideLat) / 2;
    const midDistance = getAngularDistanceDegrees(
      centerLatDeg,
      centerLonDeg,
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
  centerLatDeg: number,
  centerLonDeg: number,
  radiusDeg: number,
  poleLat: number,
): Position[][][] {
  const capLat = poleLat > 0 ? WEB_MERCATOR_MAX_LAT : -WEB_MERCATOR_MAX_LAT;
  const boundary: Position[] = [];

  for (let lon = WORLD_MIN_LON; lon <= WORLD_MAX_LON; lon += 1) {
    boundary.push([
      lon,
      getPolarBoundaryLat(centerLatDeg, centerLonDeg, radiusDeg, lon, poleLat),
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

function getDarknessCoordinates(date: Date, solarAltitudeDeg: number): Position[][][] {
  const subsolar = getSubsolarPoint(date);
  const antisolarLat = -subsolar.lat;
  const antisolarLon = normalizeDegrees(subsolar.lon + 180);
  const radius = 90 + solarAltitudeDeg;
  const ring: Position[] = [];

  for (let bearing = 0; bearing < 360; bearing += 1) {
    ring.push(destinationPoint(antisolarLat, antisolarLon, bearing, radius));
  }
  const containedPoleLat = getContainedPoleLat(antisolarLat, antisolarLon, radius);
  if (containedPoleLat !== null) {
    return getPolarCapPolygons(antisolarLat, antisolarLon, radius, containedPoleLat);
  }

  const closedRing = closeRing(ring);
  let minLon = Infinity;
  let maxLon = -Infinity;
  for (const [lon] of closedRing) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  }
  const minWorld = Math.floor((minLon + 180) / 360);
  const maxWorld = Math.floor((maxLon + 180) / 360);
  const polygons: Position[][][] = [];

  for (let world = minWorld; world <= maxWorld; world += 1) {
    const minLon = world * 360 - 180;
    const maxLon = world * 360 + 180;
    const clipped = clipRingToLongitudeWindow(closedRing, minLon, maxLon);
    if (clipped.length < 4) continue;
    polygons.push([shiftRingLongitude(clipped, -world * 360)]);
  }
  return polygons;
}

export function getDayNightTerminatorGeoJson(
  time: number | string | Date,
): FeatureCollection<MultiPolygon> {
  const date = time instanceof Date ? time : new Date(time);

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
        coordinates: getDarknessCoordinates(date, band.altitude),
      },
    })),
  };
}
