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
        geometry: { type: "LineString", coordinates: [] },
      }),
    ).toBe(true);
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
