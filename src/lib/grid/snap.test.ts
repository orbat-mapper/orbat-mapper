import { describe, expect, it } from "vitest";
import type {
  MapAdapter,
  PixelCoordinate,
  SnapCandidateRequest,
} from "@orbat-mapper/tactical-draw";
import {
  buildGridFeatures,
  createGridSnapProvider,
  gridSpacingForAdapter,
  lonLatToMercator,
  mercatorToLonLat,
  mgrsZoneDesignation,
  projectToGrid,
  projectToLocalGrid,
  unprojectFromGrid,
  type LocalGridDefinition,
} from "./index";

function adapter(
  intersectionPixel: [number, number],
  latitude = 0,
  longitude = 0,
  metresPerPixel = 2,
): MapAdapter {
  const [centerX, centerY] = lonLatToMercator([longitude, latitude]);
  return {
    getResolution: () => metresPerPixel,
    getViewportSize: () => ({ width: 900, height: 900 }),
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) =>
      mercatorToLonLat([
        centerX + (x - 450) * metresPerPixel,
        centerY + (450 - y) * metresPerPixel,
      ]),
    getPixelFromCoordinate: () => intersectionPixel,
  } as unknown as MapAdapter;
}

const gridCrs = { kind: "utm", zone: 31, hemisphere: "north" } as const;
const request = {
  coordinate: [...unprojectFromGrid(gridCrs, { easting: 500_104, northing: 108 })],
  pixel: [52, 54],
  interaction: "draw",
} satisfies SnapCandidateRequest;

function expectGrid(
  coordinate: SnapCandidateRequest["coordinate"],
  expected: [number, number],
) {
  const actual = projectToGrid(gridCrs, coordinate as [number, number]);
  expect(actual.easting).toBeCloseTo(expected[0], 6);
  expect(actual.northing).toBeCloseTo(expected[1], 6);
}

describe("grid snapping", () => {
  it("uses the same adaptive spacing as the rendered grid", () => {
    const mapAdapter = adapter([50, 50], 60);
    expect(gridSpacingForAdapter(mapAdapter, 100, gridCrs)).toBe(
      buildGridFeatures(mapAdapter, 100, gridCrs)!.spacing,
    );
  });

  it("prefers the nearest intersection within twelve pixels", () => {
    const provider = createGridSnapProvider({
      getAdapter: () => adapter([50, 50]),
      getConfiguredSpacing: () => 100,
      getGridCrs: () => gridCrs,
      isActive: () => true,
    });
    const result = provider(request);
    expect(result).toHaveLength(1);
    expect(result[0]!.kind).toBe("grid-intersection");
    expectGrid(result[0]!.coordinate, [500_100, 100]);
  });

  it("offers independent line projections outside intersection reach", () => {
    const provider = createGridSnapProvider({
      getAdapter: () => adapter([0, 0]),
      getConfiguredSpacing: () => 100,
      getGridCrs: () => gridCrs,
      isActive: () => true,
    });
    const result = provider(request);
    expect(result.map((candidate) => candidate.kind)).toEqual(["grid-line", "grid-line"]);
    expectGrid(result[0]!.coordinate, [500_100, 108]);
    expectGrid(result[1]!.coordinate, [500_104, 100]);
  });

  it("returns no candidates while the grid is inactive", () => {
    const provider = createGridSnapProvider({
      getAdapter: () => adapter([50, 50]),
      getConfiguredSpacing: () => 100,
      getGridCrs: () => gridCrs,
      isActive: () => false,
    });
    expect(provider(request)).toEqual([]);
  });

  it("returns the same locked-grid candidates after a north-south pan", () => {
    const crs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    const gridRequest = {
      ...request,
      coordinate: [10, 59.5],
    } satisfies SnapCandidateRequest;
    const candidates = [59, 60].map((latitude) => {
      const mapAdapter = adapter([0, 0], latitude, 10);
      expect(gridSpacingForAdapter(mapAdapter, 100, crs)).toBe(100);
      const provider = createGridSnapProvider({
        getAdapter: () => mapAdapter,
        getConfiguredSpacing: () => 100,
        getGridCrs: () => crs,
        isActive: () => true,
      });
      return provider(gridRequest).map((candidate) =>
        projectToGrid(crs, candidate.coordinate as [number, number]),
      );
    });

    expect(candidates[1]).toEqual(candidates[0]);
    expect(candidates[0]![0]!.easting / 100).toBeCloseTo(
      Math.round(candidates[0]![0]!.easting / 100),
      6,
    );
    expect(candidates[0]![1]!.northing / 100).toBeCloseTo(
      Math.round(candidates[0]![1]!.northing / 100),
      6,
    );
  });

  it("uses the active center-zone MGRS lattice and rejects candidates beyond it", () => {
    const crs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    const definition = { crs, designation: "32V", interval: 100 as const };
    const provider = createGridSnapProvider({
      getAdapter: () => adapter([0, 0], 60, 6),
      getConfiguredSpacing: () => 999,
      getGridCrs: () => gridCrs,
      getGridMode: () => "mgrs",
      getMgrsDefinition: () => definition,
      isActive: () => true,
    });

    const inside = provider({ ...request, coordinate: [6, 60] });
    expect(inside).toHaveLength(2);
    expect(
      inside.every(
        (candidate) =>
          mgrsZoneDesignation(candidate.coordinate as [number, number]) ===
          definition.designation,
      ),
    ).toBe(true);

    expect(provider({ ...request, coordinate: [12.5, 60] })).toEqual([]);
  });

  it("snaps to the same precision-aware MGRS spacing that is rendered", () => {
    const crs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    const definition = { crs, designation: "32V", interval: 1_000 as const };
    const provider = createGridSnapProvider({
      getAdapter: () => adapter([0, 0], 60, 6, 1_000),
      getConfiguredSpacing: () => 999,
      getGridCrs: () => gridCrs,
      getGridMode: () => "mgrs",
      getMgrsDefinition: () => definition,
      isActive: () => true,
    });

    const candidates = provider({ ...request, coordinate: [6, 60] });
    expect(candidates).toHaveLength(2);
    const projected = candidates.map((candidate) =>
      projectToGrid(crs, candidate.coordinate as [number, number]),
    );
    expect(projected[0]!.easting / 10_000).toBeCloseTo(
      Math.round(projected[0]!.easting / 10_000),
      6,
    );
    expect(projected[1]!.northing / 10_000).toBeCloseTo(
      Math.round(projected[1]!.northing / 10_000),
      6,
    );
  });

  it("offers no MGRS snapping targets while the global zone overview is active", () => {
    const provider = createGridSnapProvider({
      getAdapter: () => adapter([0, 0], 60, 6),
      getConfiguredSpacing: () => 100,
      getGridCrs: () => gridCrs,
      getGridMode: () => "mgrs",
      getMgrsDefinition: () => null,
      isActive: () => true,
    });

    expect(provider({ ...request, coordinate: [6, 60] })).toEqual([]);
  });

  it("uses the pinned Local lattice and exposes no snap target beyond 5% drift", () => {
    const local: LocalGridDefinition = { origin: [10, 60], interval: 100, bearing: 25 };
    const provider = createGridSnapProvider({
      getAdapter: () => adapter([0, 0], 60, 10),
      getConfiguredSpacing: () => 999,
      getGridCrs: () => gridCrs,
      getGridMode: () => "local",
      getLocalDefinition: () => local,
      isActive: () => true,
    });

    const inside = provider({ ...request, coordinate: [10.001, 60.001] });
    expect(inside).toHaveLength(2);
    for (const candidate of inside) {
      const point = projectToLocalGrid(local, candidate.coordinate as [number, number]);
      expect(
        Math.abs(point.x / 100 - Math.round(point.x / 100)) < 1e-6 ||
          Math.abs(point.y / 100 - Math.round(point.y / 100)) < 1e-6,
      ).toBe(true);
    }

    expect(provider({ ...request, coordinate: [10, 70] })).toEqual([]);
  });

  it("snaps Latitude/longitude with the same adaptive angular interval", () => {
    const mapAdapter = {
      getViewportSize: () => ({ width: 800, height: 600 }),
      getCoordinateFromPixel: ([x, y]: PixelCoordinate) => [x / 100, -y / 100],
      getPixelFromCoordinate: (coordinate: number[]) => [
        coordinate[0]! * 100,
        -coordinate[1]! * 100,
      ],
    } as unknown as MapAdapter;
    const provider = createGridSnapProvider({
      getAdapter: () => mapAdapter,
      getConfiguredSpacing: () => 999,
      getGridCrs: () => gridCrs,
      getGridMode: () => "latlong",
      getLatLongDefinition: () => ({ interval: 0.1 }),
      isActive: () => true,
    });
    const angularRequest = {
      ...request,
      coordinate: [10.23, 50.26],
      pixel: [1_000, -5_050],
    } satisfies SnapCandidateRequest;

    const candidates = provider(angularRequest);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      kind: "grid-intersection",
      coordinate: [10, 50.5],
    });
  });
});
