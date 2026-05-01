import type { FeatureCollection, Polygon, Position } from "geojson";
import SunCalc from "suncalc";
import type { GeoJsonOverlayOptions } from "@/geo/contracts/mapAdapter";

export const DAY_NIGHT_TERMINATOR_OVERLAY_ID = "day-night-terminator";
export const DAY_NIGHT_TERMINATOR_TITLE = "Day/Night";
const TRANSPARENT_COLOR = "rgba(0, 0, 0, 0)";
export const DAY_NIGHT_TERMINATOR_OVERLAY_OPTIONS: GeoJsonOverlayOptions = {
  style: {
    fillColor: "rgba(0, 0, 50, 0.4)",
    strokeColor: TRANSPARENT_COLOR,
    strokeWidth: 0,
    circleRadius: 0,
    circleFillColor: TRANSPARENT_COLOR,
    circleStrokeColor: TRANSPARENT_COLOR,
  },
};

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function clampLat(lat: number): number {
  return Math.max(-90, Math.min(90, lat));
}

function getNightRing(date: Date): Position[] {
  // Solar declination: sun's altitude observed from the north pole.
  const declination = SunCalc.getPosition(date, 90, 0).altitude;

  // Subsolar longitude: project the sun's position seen from (0, 0) onto the
  // sphere using the spherical destination formula. SunCalc azimuth is
  // measured from south, clockwise; convert to bearing-from-north.
  const ref = SunCalc.getPosition(date, 0, 0);
  const bearing = ref.azimuth + Math.PI;
  const arc = Math.PI / 2 - ref.altitude;
  const subsolarLon = Math.atan2(Math.sin(bearing) * Math.sin(arc), Math.cos(arc));
  const tanDeclination = Math.tan(declination);

  const ring: Position[] = [];
  for (let lonDeg = -180; lonDeg <= 180; lonDeg += 1) {
    const hourAngle = lonDeg * RAD - subsolarLon;
    const latRad = Math.atan(-Math.cos(hourAngle) / tanDeclination);
    ring.push([lonDeg, clampLat(latRad * DEG)]);
  }

  // Close the ring at whichever pole is in darkness. δ > 0 → south pole;
  // δ < 0 → north pole. Two corner points only — extra samples at the pole
  // collapse to a single point on the globe but render as visible horizontal
  // edges in Mercator.
  const darkPoleLat = declination > 0 ? -90 : 90;
  ring.push([180, darkPoleLat]);
  ring.push([-180, darkPoleLat]);
  ring.push([ring[0][0], ring[0][1]]);

  return ring;
}

export function getDayNightTerminatorGeoJson(
  time: number | string | Date,
): FeatureCollection<Polygon> {
  const date = time instanceof Date ? time : new Date(time);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          title: DAY_NIGHT_TERMINATOR_TITLE,
        },
        geometry: {
          type: "Polygon",
          coordinates: [getNightRing(date)],
        },
      },
    ],
  };
}
