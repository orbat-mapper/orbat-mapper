import { describe, it, expect } from "vitest";
import {
  DAY_NIGHT_TERMINATOR_TITLE,
  getDayNightTerminatorGeoJson,
} from "./dayNightTerminator";

describe("getDayNightTerminatorGeoJson", () => {
  it("returns a FeatureCollection with one closed Polygon feature", () => {
    const fc = getDayNightTerminatorGeoJson("2024-03-20T12:00:00Z");
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features).toHaveLength(1);
    const feature = fc.features[0];
    expect(feature.geometry.type).toBe("Polygon");
    expect(feature.properties?.title).toBe(DAY_NIGHT_TERMINATOR_TITLE);
    const ring = feature.geometry.coordinates[0];
    expect(ring.length).toBeGreaterThan(4);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
    for (const [lon, lat] of ring) {
      expect(lon).toBeGreaterThanOrEqual(-180);
      expect(lon).toBeLessThanOrEqual(180);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
    }
  });

  it("encloses the south pole at the boreal summer solstice", () => {
    const ring =
      getDayNightTerminatorGeoJson("2024-06-21T12:00:00Z").features[0].geometry
        .coordinates[0];
    expect(ring.some(([, lat]) => lat === -90)).toBe(true);
    expect(ring.some(([, lat]) => lat === 90)).toBe(false);
  });

  it("encloses the north pole at the boreal winter solstice", () => {
    const ring =
      getDayNightTerminatorGeoJson("2024-12-21T12:00:00Z").features[0].geometry
        .coordinates[0];
    expect(ring.some(([, lat]) => lat === 90)).toBe(true);
    expect(ring.some(([, lat]) => lat === -90)).toBe(false);
  });

  it("rotates with time of day", () => {
    const noon =
      getDayNightTerminatorGeoJson("2024-06-21T12:00:00Z").features[0].geometry
        .coordinates[0];
    const sixHoursLater =
      getDayNightTerminatorGeoJson("2024-06-21T18:00:00Z").features[0].geometry
        .coordinates[0];
    expect(noon).not.toEqual(sixHoursLater);
  });
});
