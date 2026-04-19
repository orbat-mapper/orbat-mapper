import { describe, expect, it } from "vitest";
import { getRoutingPreviewDisplayDestination } from "@/geo/routing/previewCoordinates";

describe("getRoutingPreviewDisplayDestination", () => {
  it("prefers the rendered path endpoint when preview geometry is available", () => {
    expect(
      getRoutingPreviewDisplayDestination(
        {
          path: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [179, 0],
                [181, 0],
              ],
            },
            properties: {},
          },
          start: [179, 0],
          end: [-179, 0],
          totalLengthMeters: 1000,
          waypoints: [
            [179, 0],
            [181, 0],
          ],
        },
        [-179, 0],
      ),
    ).toEqual([181, 0]);
  });

  it("falls back to the logical destination when there is no preview path yet", () => {
    expect(getRoutingPreviewDisplayDestination(null, [10, 20])).toEqual([10, 20]);
  });
});
