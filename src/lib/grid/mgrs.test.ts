import { describe, expect, it } from "vitest";
import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";
import {
  DEFAULT_GRID_APPEARANCE,
  activeMgrsDefinitionAt,
  buildMgrsGridPortrayal,
  mgrsReferenceDigits,
  mgrsSquareLabelData,
  mgrsSquareIdentifier,
  mgrsVisibleSpacing,
  mgrsZoneBounds,
  mgrsZoneDesignation,
  mgrsZoneOverviewLabelData,
  mgrsZoneOverviewLineData,
  NATIVE_PORTRAYAL_PARTS,
  resolveMgrsPortrayalLevel,
  projectToGrid,
  resolveGridLabelCollisions,
  unprojectFromGrid,
  type GridCrs,
  type GridReferenceLabel,
} from "./index";
import { unwrapLongitude } from "./geo";

function projectedAdapter(
  center: [number, number],
  crs: GridCrs,
  resolution = 100,
): MapAdapter {
  const projectedCenter = projectToGrid(crs, center);
  return {
    getViewportSize: () => ({ width: 800, height: 600 }),
    getResolution: () => resolution,
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) => [
      ...unprojectFromGrid(crs, {
        easting: projectedCenter.easting + (x - 400) * resolution,
        northing: projectedCenter.northing - (y - 300) * resolution,
      }),
    ],
    getPixelFromCoordinate: (coordinate: number[]) => {
      const projected = projectToGrid(crs, coordinate as [number, number]);
      return [
        400 + (projected.easting - projectedCenter.easting) / resolution,
        300 - (projected.northing - projectedCenter.northing) / resolution,
      ];
    },
  } as MapAdapter;
}

function overviewAdapter(center: [number, number], pixelsPerDegree = 2): MapAdapter {
  return {
    getViewportSize: () => ({ width: 800, height: 600 }),
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) => [
      center[0] + (x - 400) / pixelsPerDegree,
      center[1] - (y - 300) / pixelsPerDegree,
    ],
    getPixelFromCoordinate: (coordinate: number[]) => [
      400 + (unwrapLongitude(center[0], coordinate[0]!) - center[0]) * pixelsPerDegree,
      300 - (coordinate[1]! - center[1]) * pixelsPerDegree,
    ],
  } as MapAdapter;
}

describe("MGRS references", () => {
  it.each([
    [[6, 60], "32V"],
    [[10, 76], "33X"],
    [[20, 85], "Z"],
    [[-135, -85], "A"],
  ] as const)("uses the canonical grid-zone designation at %j", (position, expected) => {
    expect(mgrsZoneDesignation(position)).toBe(expected);
    expect(mgrsSquareIdentifier(position)).toMatch(/^[A-Z]{2}$/);
  });

  it("formats edge references at military-map precision", () => {
    expect(mgrsReferenceDigits(543_210, 10_000)).toBe("4");
    expect(mgrsReferenceDigits(543_210, 1_000)).toBe("43");
    expect(mgrsReferenceDigits(543_210, 100)).toBe("432");
    expect(mgrsReferenceDigits(543_210, 100_000)).toBeNull();
  });

  it("adapts through exact ×10 subsets when each reference precision becomes readable", () => {
    expect(mgrsVisibleSpacing(100, 1)).toBe(100);
    expect(mgrsVisibleSpacing(100, 10)).toBe(1_000);
    expect(mgrsVisibleSpacing(1_000, 25)).toBe(1_000);
    expect(mgrsVisibleSpacing(1_000, 26)).toBe(10_000);
    expect(mgrsVisibleSpacing(1_000, 500)).toBe(10_000);
    expect(mgrsVisibleSpacing(1_000, 501)).toBe(100_000);
    expect(mgrsVisibleSpacing(100, 0)).toBe(100);
  });

  it("enumerates standard zones with Norway, Svalbard, and UPS exceptions", () => {
    const zones = mgrsZoneBounds();
    expect(zones.find(({ designation }) => designation === "32V")).toMatchObject({
      west: 3,
      east: 12,
      south: 56,
      north: 64,
    });
    expect(zones.find(({ designation }) => designation === "31X")).toMatchObject({
      west: 0,
      east: 9,
      south: 72,
      north: 84,
    });
    expect(zones.some(({ designation }) => designation === "32X")).toBe(false);
    expect(zones.filter(({ designation }) => /^[ABYZ]$/.test(designation))).toHaveLength(
      4,
    );
  });

  it("caches one static native-line source for the global overview", () => {
    const first = mgrsZoneOverviewLineData();
    expect(first.features.length).toBeGreaterThan(0);
    expect(mgrsZoneOverviewLineData()).toBe(first);
  });

  it("anchors cached native overview labels at each zone's southwest corner", () => {
    const first = mgrsZoneOverviewLabelData();
    const zone32V = first.features.find(
      ({ properties }) => properties?.designation === "32V",
    );
    expect(zone32V?.geometry.coordinates).toEqual([3, 56]);
    expect(mgrsZoneOverviewLabelData()).toBe(first);
  });

  it("caches native two-letter identifiers at their 100 km southwest corners", () => {
    const definition = activeMgrsDefinitionAt([6, 60], 1_000)!;
    const first = mgrsSquareLabelData(definition);
    expect(first.features.length).toBeGreaterThan(0);
    expect(first.features.length).toBeLessThan(100);
    expect(
      first.features.every(({ properties }) => /^[A-Z]{2}$/.test(properties?.identifier)),
    ).toBe(true);
    expect(
      first.features.every(({ properties }) => properties?.designation === "32V"),
    ).toBe(true);
    for (const feature of first.features) {
      const point = projectToGrid(
        definition.crs,
        feature.geometry.coordinates as [number, number],
      );
      expect(Math.round(point.easting) % 100_000).toBe(0);
      expect(Math.round(point.northing) % 100_000).toBe(0);
    }
    expect(mgrsSquareLabelData(definition)).toBe(first);
  });

  it("derives the active zone and CRS from the map center", () => {
    expect(activeMgrsDefinitionAt([6, 60], 1_000)).toEqual({
      crs: { kind: "utm", zone: 32, hemisphere: "north" },
      designation: "32V",
      interval: 1_000,
    });
  });

  it("keeps square identifiers ahead of colliding edge references", () => {
    const labels: GridReferenceLabel[] = [
      { id: "fine", text: "123", pixel: [10, 10], anchor: "left", priority: 10 },
      { id: "square", text: "AB", pixel: [10, 10], anchor: "square", priority: 10_000 },
    ];
    expect(resolveGridLabelCollisions(labels).map((label) => label.id)).toEqual([
      "square",
    ]);
  });
});

describe("MGRS portrayal", () => {
  it("builds matching geometry, edge references, and 100 km identifiers", () => {
    const crs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    const result = buildMgrsGridPortrayal(
      projectedAdapter([6, 60], crs, 200),
      { interval: 1_000 },
      DEFAULT_GRID_APPEARANCE,
    );

    expect(result?.level).toBe("detail");
    expect(result?.activeDefinition?.designation).toBe("32V");
    expect(result?.spacing).toBe(10_000);
    expect(result?.features.length).toBeGreaterThan(0);
    expect(result?.labels.some((label) => label.anchor === "bottom")).toBe(true);
    expect(result?.labels.some((label) => label.anchor === "left")).toBe(true);
    expect(result?.labels.some((label) => label.anchor === "square")).toBe(true);
  });

  it("renders every visible Norway-adjacent zone while keeping the center zone active", () => {
    const crs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    const result = buildMgrsGridPortrayal(
      projectedAdapter([11.9, 60], crs, 500),
      { interval: 10_000 },
      DEFAULT_GRID_APPEARANCE,
    );

    expect(result?.activeDefinition?.designation).toBe("32V");
    const visibleDesignations = new Set(
      result?.detailDefinitions.map(({ designation }) => designation),
    );
    expect(visibleDesignations).toContain("32V");
    expect(visibleDesignations).toContain("33V");
    for (const feature of result?.features ?? []) {
      for (const coordinate of feature.geometry.coordinates) {
        expect(visibleDesignations).toContain(
          mgrsZoneDesignation(coordinate as [number, number]) ?? "",
        );
      }
    }
  });

  it("automatically changes the detailed zone when the viewport center crosses a boundary", () => {
    const westCrs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    const eastCrs = { kind: "utm", zone: 33, hemisphere: "north" } as const;
    const west = buildMgrsGridPortrayal(
      projectedAdapter([11.9, 60], westCrs, 200),
      { interval: 1_000 },
      DEFAULT_GRID_APPEARANCE,
    );
    const east = buildMgrsGridPortrayal(
      projectedAdapter([12.1, 60], eastCrs, 200),
      { interval: 1_000 },
      DEFAULT_GRID_APPEARANCE,
    );
    expect(west?.activeDefinition?.designation).toBe("32V");
    expect(east?.activeDefinition?.designation).toBe("33V");
  });

  it.each([
    [[20, 85], "north", "Z"],
    [[-135, -85], "south", "A"],
  ] as const)("portrays UPS-backed MGRS at %j", (center, hemisphere, designation) => {
    const crs = { kind: "ups", hemisphere } as const;
    const result = buildMgrsGridPortrayal(
      projectedAdapter([center[0], center[1]], crs, 500),
      { interval: 10_000 },
      DEFAULT_GRID_APPEARANCE,
    );

    expect(result?.activeDefinition?.designation).toBe(designation);
    const visibleDesignations = new Set(
      result?.detailDefinitions.map((definition) => definition.designation),
    );
    expect(visibleDesignations).toContain(designation);
    expect(result?.features.length).toBeGreaterThan(0);
    expect(
      result?.labels.some(
        (label) =>
          label.anchor === "square" &&
          new RegExp(`^${designation} [A-Z]{2}$`).test(label.text),
      ),
    ).toBe(true);
    for (const feature of result?.features ?? []) {
      for (const coordinate of feature.geometry.coordinates) {
        expect(visibleDesignations).toContain(
          mgrsZoneDesignation(coordinate as [number, number]) ?? "",
        );
      }
    }
  });

  it("retains UPS linework while native MapLibre tiles own UTM detail", () => {
    const utmCrs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    const utm = buildMgrsGridPortrayal(
      projectedAdapter([6, 60], utmCrs, 200),
      { interval: 1_000 },
      DEFAULT_GRID_APPEARANCE,
      null,
      NATIVE_PORTRAYAL_PARTS,
    );
    const upsCrs = { kind: "ups", hemisphere: "north" } as const;
    const ups = buildMgrsGridPortrayal(
      projectedAdapter([20, 85], upsCrs, 500),
      { interval: 10_000 },
      DEFAULT_GRID_APPEARANCE,
      null,
      NATIVE_PORTRAYAL_PARTS,
    );

    expect(utm?.features).toEqual([]);
    expect(ups?.features.length).toBeGreaterThan(0);
  });

  it("shows the unsubdivided 100 km letter grid early with 8/12 px hysteresis", () => {
    const crs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
    expect(resolveMgrsPortrayalLevel(projectedAdapter([6, 60], crs, 11_000), crs)).toBe(
      "overview",
    );
    expect(resolveMgrsPortrayalLevel(projectedAdapter([6, 60], crs, 9_000), crs)).toBe(
      "detail",
    );
    expect(
      resolveMgrsPortrayalLevel(projectedAdapter([6, 60], crs, 8_500), crs, "overview"),
    ).toBe("overview");
    expect(
      resolveMgrsPortrayalLevel(projectedAdapter([6, 60], crs, 8_000), crs, "overview"),
    ).toBe("detail");
    expect(
      resolveMgrsPortrayalLevel(projectedAdapter([6, 60], crs, 12_000), crs, "detail"),
    ).toBe("detail");
    expect(
      resolveMgrsPortrayalLevel(projectedAdapter([6, 60], crs, 13_000), crs, "detail"),
    ).toBe("overview");
    expect(mgrsVisibleSpacing(1_000, 8_000)).toBe(100_000);
  });

  it("keeps the zone overview until a wide detail viewport can be projected", () => {
    const adapter = {
      getViewportSize: () => ({ width: 800, height: 600 }),
      getCoordinateFromPixel: ([x, y]: PixelCoordinate) => {
        if (x === 400 && y === 300) return [6, 60];
        if (x === 401 && y === 300) return [6.01, 60];
        return [-78, 24];
      },
      getPixelFromCoordinate: () => [400, 300] as PixelCoordinate,
    } as unknown as MapAdapter;

    expect(
      resolveMgrsPortrayalLevel(adapter, { kind: "utm", zone: 32, hemisphere: "north" }),
    ).toBe("detail");
    const result = buildMgrsGridPortrayal(
      adapter,
      { interval: 1_000 },
      DEFAULT_GRID_APPEARANCE,
    );
    expect(result?.level).toBe("overview");
    expect(result?.features.length).toBeGreaterThan(0);
  });

  it("portrays visible zone boundaries and lower-left designations at overview scale", () => {
    const result = buildMgrsGridPortrayal(
      overviewAdapter([12, 60], 10),
      { interval: 1_000 },
      DEFAULT_GRID_APPEARANCE,
    );
    expect(result?.level).toBe("overview");
    expect(result?.activeDefinition).toBeNull();
    expect(result?.features.length).toBeGreaterThan(0);
    expect(result?.labels.some(({ anchor }) => anchor === "zone")).toBe(true);
    expect(result?.labels.some(({ text }) => text === "32V" || text === "33V")).toBe(
      true,
    );
  });

  it("keeps overview segments local when the viewport crosses the antimeridian", () => {
    const result = buildMgrsGridPortrayal(
      overviewAdapter([179, 20], 10),
      { interval: 1_000 },
      DEFAULT_GRID_APPEARANCE,
    );
    expect(result?.level).toBe("overview");
    expect(result?.features.length).toBeGreaterThan(0);
    for (const feature of result?.features ?? []) {
      const [a, b] = feature.geometry.coordinates;
      expect(Math.abs(b![0]! - a![0]!)).toBeLessThanOrEqual(180);
    }
  });
});
