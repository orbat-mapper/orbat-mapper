// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type LineString from "ol/geom/LineString";
import { INITIAL_TIME, VIA_TIME } from "@/geo/history";
import { createUnitPathFeatures } from "@/geo/engines/openlayers/unitHistoryOl";

function createUnit() {
  return {
    id: "unit-1",
    name: "Unit 1",
    location: [10, 60],
    state: [
      { id: "state-1", t: 1000, location: [11, 61], via: [[10.5, 60.5]] },
      { id: "state-2", t: 2000, location: [12, 62] },
    ],
  } as any;
}

describe("createUnitPathFeatures leg geometry", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("carries the waypoint time as the M ordinate", () => {
    // Path editing reads the time back off the dragged vertex to find the state
    // entry to update, so the M ordinate has to survive both the antimeridian
    // unwind and the projection transform.
    const { legFeatures } = createUnitPathFeatures(createUnit(), { isEditMode: true });

    expect(legFeatures).toHaveLength(1);
    const coordinates = (legFeatures[0].getGeometry() as LineString).getCoordinates();
    expect(coordinates.map((c) => c[2])).toEqual([INITIAL_TIME, VIA_TIME, 1000, 2000]);
  });
});
