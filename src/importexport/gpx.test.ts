import { describe, expect, it } from "vitest";
import { convertGpxToGeoJSON } from "@/importexport/gpx";

describe("convertGpxToGeoJSON", () => {
  it("converts GPX waypoints to point features", () => {
    const result = convertGpxToGeoJSON(`
      <gpx version="1.1" creator="orbat-mapper">
        <wpt lat="59.91" lon="10.75">
          <name>Oslo waypoint</name>
        </wpt>
      </gpx>
    `);

    expect(result.type).toBe("FeatureCollection");
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry?.type).toBe("Point");
    expect(result.features[0].geometry).toMatchObject({
      coordinates: [10.75, 59.91],
    });
    expect(result.features[0].properties).toMatchObject({
      name: "Oslo waypoint",
    });
  });

  it("converts GPX tracks to line features", () => {
    const result = convertGpxToGeoJSON(`
      <gpx version="1.1" creator="orbat-mapper">
        <trk>
          <name>Patrol route</name>
          <trkseg>
            <trkpt lat="59.91" lon="10.75" />
            <trkpt lat="59.92" lon="10.76" />
          </trkseg>
        </trk>
      </gpx>
    `);

    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry?.type).toBe("LineString");
    expect(result.features[0].properties).toMatchObject({
      name: "Patrol route",
    });
  });

  it("throws a clear error for invalid XML", () => {
    expect(() => convertGpxToGeoJSON("<gpx><wpt></gpx>")).toThrow(
      "Could not parse GPX XML",
    );
  });

  it("throws a clear error for empty GPX documents", () => {
    expect(() => convertGpxToGeoJSON('<gpx version="1.1" />')).toThrow(
      "GPX did not contain any importable features",
    );
  });
});
