// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createUnitPathGeoJson, INITIAL_TIME } from "@/geo/history";

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

describe("createUnitPathGeoJson leg geometry", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("includes via points in the leg coordinates", () => {
    const { legs } = createUnitPathGeoJson(createUnit());

    expect(legs).toHaveLength(1);
    expect(legs[0].geometry.coordinates).toEqual([
      [10, 60],
      [10.5, 60.5],
      [11, 61],
      [12, 62],
    ]);
  });

  it("maps every leg coordinate back to the point it was drawn from", () => {
    // Path editing rewrites the dragged coordinate for a live preview, so each
    // vertex has to identify its state entry and, for via points, its index.
    const { legs } = createUnitPathGeoJson(createUnit());

    expect(legs[0].properties?.vertices).toEqual([
      { stateIndex: -1, isInitial: true },
      { stateIndex: 0, viaIndex: 0 },
      { stateIndex: 0, isInitial: false },
      { stateIndex: 1, isInitial: false },
    ]);
  });

  it("marks the initial waypoint", () => {
    const { waypoints } = createUnitPathGeoJson(createUnit());

    expect(waypoints[0].properties?.isInitial).toBe(true);
    expect(waypoints[0].properties?.t).toBe(INITIAL_TIME);
    expect(waypoints.slice(1).map((w) => w.properties?.stateIndex)).toEqual([0, 1]);
  });
});
