import { describe, it, expect } from "vitest";
import SunCalc from "suncalc";
import { booleanPointInPolygon, point } from "@turf/turf";
import { getDayNightTerminatorGeoJson } from "./dayNightTerminator";

const DEG = 180 / Math.PI;
const EDGE_EPSILON = 1e-9;
const WEB_MERCATOR_MAX_LAT = 85.051129;

function getRings(
  feature: ReturnType<typeof getDayNightTerminatorGeoJson>["features"][number],
) {
  return feature.geometry.coordinates.map((polygon) => polygon[0]);
}

describe("getDayNightTerminatorGeoJson", () => {
  it("returns twilight and night MultiPolygon features with closed rings", () => {
    const fc = getDayNightTerminatorGeoJson("2024-03-20T12:00:00Z");
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features.map((feature) => feature.properties?.title)).toEqual([
      "Civil twilight",
      "Nautical twilight",
      "Astronomical twilight",
      "Night",
    ]);
    expect(fc.features.map((feature) => feature.properties?.solarAltitude)).toEqual([
      0, -6, -12, -18,
    ]);

    for (const feature of fc.features) {
      expect(feature.geometry.type).toBe("MultiPolygon");
      expect(feature.properties?.fillColor).toEqual(expect.any(String));
      expect(feature.properties?.strokeColor).toEqual(expect.any(String));
      for (const ring of getRings(feature)) {
        expect(ring.length).toBeGreaterThanOrEqual(4);
        expect(ring[0]).toEqual(ring[ring.length - 1]);
        for (const [lon, lat] of ring) {
          expect(lon).toBeGreaterThanOrEqual(-180);
          expect(lon).toBeLessThanOrEqual(180);
          expect(lat).toBeGreaterThanOrEqual(-90);
          expect(lat).toBeLessThanOrEqual(90);
        }
      }
    }
  });

  it("shrinks each deeper twilight region around the antisolar point", () => {
    const fc = getDayNightTerminatorGeoJson("2024-03-20T12:00:00Z");
    const latSpans = fc.features.map((feature) => {
      const lats = getRings(feature).flatMap((ring) => ring.map(([, lat]) => lat));
      return Math.max(...lats) - Math.min(...lats);
    });

    expect(latSpans[0]).toBeGreaterThan(latSpans[1]);
    expect(latSpans[1]).toBeGreaterThan(latSpans[2]);
    expect(latSpans[2]).toBeGreaterThan(latSpans[3]);
  });

  it("places each boundary on the matching SunCalc solar altitude", () => {
    const date = new Date("2024-06-21T12:00:00Z");
    const fc = getDayNightTerminatorGeoJson(date);

    for (const feature of fc.features) {
      const expectedAltitude = Number(feature.properties?.solarAltitude);
      for (const ring of getRings(feature)) {
        if (ring.length <= 5) continue;
        const boundaryPoints = ring.filter(
          ([lon], index) =>
            index % 30 === 0 && Math.abs(Math.abs(lon) - 180) > EDGE_EPSILON,
        );
        for (const [lon, lat] of boundaryPoints) {
          const altitude = SunCalc.getPosition(date, lat, lon).altitude * DEG;
          expect(altitude).toBeCloseTo(expectedAltitude, 6);
        }
      }
    }
  });

  it("splits antimeridian-crossing caps without long longitude jumps", () => {
    const fc = getDayNightTerminatorGeoJson("2024-06-21T12:00:00Z");

    for (const feature of fc.features) {
      for (const ring of getRings(feature)) {
        for (let index = 1; index < ring.length; index += 1) {
          expect(Math.abs(ring[index][0] - ring[index - 1][0])).toBeLessThanOrEqual(180);
        }
      }
    }
  });

  it("keeps polar caps covered when twilight regions contain a pole", () => {
    const june = getDayNightTerminatorGeoJson("2024-06-21T12:00:00Z");
    const december = getDayNightTerminatorGeoJson("2024-12-21T12:00:00Z");
    const juneNight = june.features.find(
      (feature) => feature.properties?.title === "Night",
    );
    const decemberNight = december.features.find(
      (feature) => feature.properties?.title === "Night",
    );

    expect(booleanPointInPolygon(point([0, -85]), juneNight!)).toBe(true);
    expect(booleanPointInPolygon(point([0, 85]), decemberNight!)).toBe(true);
  });

  it("keeps pole-containing regions inside the Web Mercator latitude limit", () => {
    const fc = getDayNightTerminatorGeoJson("2026-11-03T13:00:00Z");

    for (const feature of fc.features) {
      for (const ring of getRings(feature)) {
        for (const [, lat] of ring) {
          expect(Math.abs(lat)).toBeLessThanOrEqual(WEB_MERCATOR_MAX_LAT);
        }
      }
    }
  });

  it("moves the twilight regions between solstices", () => {
    const summer =
      getDayNightTerminatorGeoJson("2024-06-21T12:00:00Z").features[0].geometry
        .coordinates;
    const winter =
      getDayNightTerminatorGeoJson("2024-12-21T12:00:00Z").features[0].geometry
        .coordinates;
    expect(summer).not.toEqual(winter);
  });

  it("rotates with time of day", () => {
    const noon =
      getDayNightTerminatorGeoJson("2024-06-21T12:00:00Z").features[0].geometry
        .coordinates;
    const sixHoursLater =
      getDayNightTerminatorGeoJson("2024-06-21T18:00:00Z").features[0].geometry
        .coordinates;
    expect(noon).not.toEqual(sixHoursLater);
  });
});
