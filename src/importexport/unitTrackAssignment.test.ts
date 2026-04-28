import { describe, expect, it } from "vitest";
import type { Feature, LineString, MultiLineString } from "geojson";
import {
  createUnitTrackStatesFromFeature,
  isAssignableTrackFeature,
} from "@/importexport/unitTrackAssignment";

describe("unitTrackAssignment", () => {
  it("detects assignable line features", () => {
    expect(
      isAssignableTrackFeature({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [10, 60],
            [11, 61],
          ],
        },
      }),
    ).toBe(true);
    expect(
      isAssignableTrackFeature({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      }),
    ).toBe(false);
    expect(
      isAssignableTrackFeature({
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [10, 60] },
      }),
    ).toBe(false);
  });

  it("creates one location state per timestamped LineString coordinate", () => {
    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {
        coordinateProperties: {
          times: ["2026-04-28T10:00:00Z", "2026-04-28T10:05:00Z"],
        },
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [11, 61],
        ],
      },
    };

    const result = createUnitTrackStatesFromFeature(feature, 123);

    expect(result).toEqual({
      skippedPoints: 0,
      states: [
        { t: Date.parse("2026-04-28T10:00:00Z"), location: [10, 60] },
        { t: Date.parse("2026-04-28T10:05:00Z"), location: [11, 61] },
      ],
    });
  });

  it("handles nested MultiLineString coordinate times", () => {
    const feature: Feature<MultiLineString> = {
      type: "Feature",
      properties: {
        coordinateProperties: {
          times: [
            ["2026-04-28T10:00:00Z", "2026-04-28T10:05:00Z"],
            ["2026-04-28T10:10:00Z"],
          ],
        },
      },
      geometry: {
        type: "MultiLineString",
        coordinates: [
          [
            [10, 60],
            [11, 61],
          ],
          [[12, 62]],
        ],
      },
    };

    const result = createUnitTrackStatesFromFeature(feature, 123);

    expect(result.states).toEqual([
      { t: Date.parse("2026-04-28T10:00:00Z"), location: [10, 60] },
      { t: Date.parse("2026-04-28T10:05:00Z"), location: [11, 61] },
      { t: Date.parse("2026-04-28T10:10:00Z"), location: [12, 62] },
    ]);
  });

  it("uses current time and route via points for untimestamped lines", () => {
    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [11, 61],
          [12, 62],
        ],
      },
    };

    const result = createUnitTrackStatesFromFeature(feature, 123);

    expect(result).toEqual({
      skippedPoints: 0,
      states: [{ t: 123, location: [12, 62], via: [[11, 61]] }],
    });
  });

  it("adds a current-time start state for untimestamped lines when requested", () => {
    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [11, 61],
          [12, 62],
        ],
      },
    };

    const result = createUnitTrackStatesFromFeature(feature, 123, {
      addStartPosition: true,
    });

    expect(result).toEqual({
      skippedPoints: 0,
      states: [
        { t: 123, location: [10, 60], interpolate: false },
        { t: 123, location: [12, 62], via: [[11, 61]], viaStartTime: 123 },
      ],
    });
  });

  it("calculates end time based on average speed when provided", () => {
    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [10, 61], // 1 degree of latitude is roughly 111 km
        ],
      },
    };

    const result = createUnitTrackStatesFromFeature(feature, 1000, {
      addStartPosition: true,
      averageSpeed: 10, // 10 m/s
    });

    expect(result.states).toHaveLength(2);
    expect(result.states[0].t).toBe(1000);
    // 111km at 10m/s is 11100s = 11,100,000 ms.
    expect(result.states[1].t).toBeGreaterThan(10000000);
    expect(result.states[1].location).toEqual([10, 61]);
  });

  it("skips malformed times without throwing", () => {
    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {
        coordinateProperties: {
          times: ["not-a-date", "2026-04-28T10:05:00Z"],
        },
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [11, 61],
          [12, 62],
        ],
      },
    };

    const result = createUnitTrackStatesFromFeature(feature, 123);

    expect(result).toEqual({
      skippedPoints: 2,
      states: [{ t: Date.parse("2026-04-28T10:05:00Z"), location: [11, 61] }],
    });
  });

  it("keeps timestamps aligned when intermediate route points have no time", () => {
    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {
        coordinateProperties: {
          times: ["2026-04-28T10:00:00Z", null, "2026-04-28T10:10:00Z"],
        },
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [11, 61],
          [12, 62],
        ],
      },
    };

    const result = createUnitTrackStatesFromFeature(feature, 123);

    expect(result).toEqual({
      skippedPoints: 1,
      states: [
        { t: Date.parse("2026-04-28T10:00:00Z"), location: [10, 60] },
        { t: Date.parse("2026-04-28T10:10:00Z"), location: [12, 62] },
      ],
    });
  });
});
