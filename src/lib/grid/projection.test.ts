import { describe, expect, it } from "vitest";
import { projectToGrid, selectGridCrs, unprojectFromGrid } from "./index";

describe("automatic grid projection", () => {
  it.each([
    {
      position: [-74.006, 40.7128] as const,
      expected: { kind: "utm", zone: 18, hemisphere: "north" },
    },
    {
      position: [3, 60] as const,
      expected: { kind: "utm", zone: 32, hemisphere: "north" },
    },
    {
      position: [9, 78] as const,
      expected: { kind: "utm", zone: 33, hemisphere: "north" },
    },
    { position: [20, 85] as const, expected: { kind: "ups", hemisphere: "north" } },
    { position: [-135, -85] as const, expected: { kind: "ups", hemisphere: "south" } },
  ])("selects the standard grid CRS at $position", ({ position, expected }) => {
    expect(selectGridCrs(position)).toEqual(expected);
  });

  it("projects and reverses an authoritative UTM coordinate", () => {
    const crs = { kind: "utm", zone: 18, hemisphere: "north" } as const;
    const projected = projectToGrid(crs, [-74.006, 40.7128]);

    expect(projected.easting).toBeCloseTo(583_959.4, 1);
    expect(projected.northing).toBeCloseTo(4_507_351, 0);
    const reversed = unprojectFromGrid(crs, projected);
    expect(reversed[0]).toBeCloseTo(-74.006, 8);
    expect(reversed[1]).toBeCloseTo(40.7128, 8);
  });

  it("keeps using a locked UTM zone after crossing its standard boundary", () => {
    const lockedCrs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    const acrossWesternBoundary = [2.9, 60] as const;

    expect(selectGridCrs(acrossWesternBoundary)).toEqual({
      kind: "utm",
      zone: 31,
      hemisphere: "north",
    });
    const projected = projectToGrid(lockedCrs, acrossWesternBoundary);
    const reversed = unprojectFromGrid(lockedCrs, projected);
    expect(reversed[0]).toBeCloseTo(acrossWesternBoundary[0], 8);
    expect(reversed[1]).toBeCloseTo(acrossWesternBoundary[1], 8);
  });

  it("projects and reverses an authoritative UPS coordinate", () => {
    const crs = { kind: "ups", hemisphere: "north" } as const;
    const projected = projectToGrid(crs, [20, 85]);

    expect(projected.easting).toBeCloseTo(2_189_977.616612, 6);
    expect(projected.northing).toBeCloseTo(1_478_040.788157, 6);
    const reversed = unprojectFromGrid(crs, projected);
    expect(reversed[0]).toBeCloseTo(20, 8);
    expect(reversed[1]).toBeCloseTo(85, 8);
  });

  it("round-trips a southern UPS coordinate", () => {
    const crs = { kind: "ups", hemisphere: "south" } as const;
    const projected = projectToGrid(crs, [-135, -85]);
    const reversed = unprojectFromGrid(crs, projected);
    expect(reversed[0]).toBeCloseTo(-135, 8);
    expect(reversed[1]).toBeCloseTo(-85, 8);
  });
});
