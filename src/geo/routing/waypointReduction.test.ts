import { polygon } from "@turf/helpers";
import { describe, expect, it } from "vitest";
import { reduceObstacleSafeWaypoints } from "@/geo/routing/waypointReduction";

describe("reduceObstacleSafeWaypoints", () => {
  it("drops intermediate points when the direct segment stays clear of obstacles", () => {
    const reduced = reduceObstacleSafeWaypoints(
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      {
        type: "FeatureCollection",
        features: [],
      },
    );

    expect(reduced).toEqual([
      [0, 0],
      [2, 0],
    ]);
  });

  it("keeps intermediate points when skipping them would cross an obstacle", () => {
    const reduced = reduceObstacleSafeWaypoints(
      [
        [0, 0],
        [0, 2],
        [2, 2],
        [2, 0],
      ],
      {
        type: "FeatureCollection",
        features: [
          polygon([
            [
              [0.75, 0.75],
              [1.25, 0.75],
              [1.25, 1.25],
              [0.75, 1.25],
              [0.75, 0.75],
            ],
          ]),
        ],
      },
    );

    expect(reduced).toEqual([
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 0],
    ]);
  });

  it("keeps intermediate points when the great-circle shortcut crosses an obstacle", () => {
    const reduced = reduceObstacleSafeWaypoints(
      [
        [0, 60],
        [45, 70],
        [90, 60],
      ],
      {
        type: "FeatureCollection",
        features: [
          polygon([
            [
              [43, 66.5],
              [47, 66.5],
              [47, 68.5],
              [43, 68.5],
              [43, 66.5],
            ],
          ]),
        ],
      },
    );

    expect(reduced).toEqual([
      [0, 60],
      [45, 70],
      [90, 60],
    ]);
  });
});
