import { describe, expect, it } from "vitest";
import type { MapAdapter, PixelCoordinate } from "@orbat-mapper/tactical-draw";
import { unwrapLongitude } from "./geo";
import {
  DEFAULT_GRID_APPEARANCE,
  projectToGrid,
  projectToLocalGrid,
  resolveImageExportGridPortrayal,
  unprojectFromGrid,
  unprojectFromLocalGrid,
  type GridCrs,
  type GridSettings,
  type ImageExportGridRequest,
  type LocalGridDefinition,
} from "./index";

function projectedAdapter(
  center: [number, number],
  crs: GridCrs,
  resolution = 200,
): MapAdapter {
  const projectedCenter = projectToGrid(crs, center);
  return {
    getViewportSize: () => ({ width: 800, height: 600 }),
    getResolution: () => resolution,
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) =>
      unprojectFromGrid(crs, {
        easting: projectedCenter.easting + (x - 400) * resolution,
        northing: projectedCenter.northing - (y - 300) * resolution,
      }),
    getPixelFromCoordinate: (coordinate: number[]) => {
      const projected = projectToGrid(crs, coordinate as [number, number]);
      return [
        400 + (projected.easting - projectedCenter.easting) / resolution,
        300 - (projected.northing - projectedCenter.northing) / resolution,
      ];
    },
  } as unknown as MapAdapter;
}

function localAdapter(definition: LocalGridDefinition, resolution = 20): MapAdapter {
  const center = projectToLocalGrid(definition, definition.origin as [number, number]);
  return {
    getViewportSize: () => ({ width: 800, height: 600 }),
    getResolution: () => resolution,
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) =>
      unprojectFromLocalGrid(definition, {
        x: center.x + (x - 400) * resolution,
        y: center.y - (y - 300) * resolution,
      }),
    getPixelFromCoordinate: (coordinate: number[]) => {
      const point = projectToLocalGrid(definition, coordinate as [number, number]);
      return [
        400 + (point.x - center.x) / resolution,
        300 - (point.y - center.y) / resolution,
      ];
    },
  } as unknown as MapAdapter;
}

function angularAdapter(
  center: [number, number] = [179, 20],
  pixelsPerDegree = 20,
): MapAdapter {
  return {
    getViewportSize: () => ({ width: 800, height: 600 }),
    getResolution: () => 1,
    getCoordinateFromPixel: ([x, y]: PixelCoordinate) => [
      center[0] + (x - 400) / pixelsPerDegree,
      center[1] - (y - 300) / pixelsPerDegree,
    ],
    getPixelFromCoordinate: (coordinate: number[]) => [
      400 + (unwrapLongitude(center[0], coordinate[0]!) - center[0]) * pixelsPerDegree,
      300 - (coordinate[1]! - center[1]) * pixelsPerDegree,
    ],
  } as unknown as MapAdapter;
}

function request(settings: GridSettings): ImageExportGridRequest {
  return { settings, appearance: DEFAULT_GRID_APPEARANCE };
}

const utmCrs = { kind: "utm", zone: 32, hemisphere: "north" } as const;
const base: GridSettings = {
  visible: true,
  mode: "utm",
  utm: { crs: utmCrs, interval: 1_000 },
};

describe("PNG grid portrayal", () => {
  it("exports the locked UTM lattice without labels", () => {
    const result = resolveImageExportGridPortrayal(
      projectedAdapter([10, 60], utmCrs),
      request(base),
      false,
    );
    expect(result?.features.length).toBeGreaterThan(0);
    expect(result?.labels).toEqual([]);
    expect(result?.status).toBe("ok");
  });

  it.each([
    [[6, 60], utmCrs, "32V"],
    [[20, 85], { kind: "ups", hemisphere: "north" } as const, "Z"],
  ] as const)(
    "exports MGRS geometry and military-map references at %j",
    (center, crs, designation) => {
      const result = resolveImageExportGridPortrayal(
        projectedAdapter([...center], crs, 200),
        request({
          ...base,
          mode: "mgrs",
          mgrs: { interval: 1_000 },
        }),
        false,
      );
      expect(result?.features.length).toBeGreaterThan(0);
      expect(result?.labels.length).toBeGreaterThan(0);
      expect(result?.labels.some((label) => label.anchor === "square")).toBe(true);
      expect(result?.labels.some((label) => label.text === designation)).toBe(false);
    },
  );

  it("exports detailed lattices from both sides of a visible MGRS zone boundary", () => {
    const result = resolveImageExportGridPortrayal(
      projectedAdapter([11.9, 60], utmCrs, 500),
      request({
        ...base,
        mode: "mgrs",
        mgrs: { interval: 1_000 },
      }),
      false,
    );
    const ids = (result?.features ?? []).map(({ id }) => String(id));
    expect(ids.some((id) => id.startsWith("mgrs-32V-"))).toBe(true);
    expect(ids.some((id) => id.startsWith("mgrs-33V-"))).toBe(true);
  });

  it("exports the pinned Local Grid and preserves its accuracy clipping status", () => {
    const local = {
      origin: [10, 60],
      interval: 100,
      bearing: 35,
    } satisfies LocalGridDefinition;
    const result = resolveImageExportGridPortrayal(
      localAdapter(local, 5_000),
      request({ ...base, mode: "local", local }),
      false,
    );
    expect(result?.features.length).toBeGreaterThan(0);
    expect(result?.status).toBe("local-clipped");
  });

  it("exports labelled latitude/longitude geometry without antimeridian crossings", () => {
    const result = resolveImageExportGridPortrayal(
      angularAdapter(),
      request({ ...base, mode: "latlong", latlong: { interval: 1 } }),
      false,
    );
    expect(result?.features.length).toBeGreaterThan(0);
    expect(result?.labels.length).toBeGreaterThan(0);
    for (const feature of result?.features ?? []) {
      for (let index = 1; index < feature.geometry.coordinates.length; index++) {
        expect(
          Math.abs(
            feature.geometry.coordinates[index]![0]! -
              feature.geometry.coordinates[index - 1]![0]!,
          ),
        ).toBeLessThanOrEqual(180);
      }
    }
  });

  it("uses the same latitude/longitude portrayal on the globe", () => {
    const result = resolveImageExportGridPortrayal(
      angularAdapter([0, 20]),
      request({ ...base, mode: "latlong", latlong: { interval: 5 } }),
      true,
    );
    expect(result?.features.length).toBeGreaterThan(0);
    expect(result?.labels.length).toBeGreaterThan(0);
    expect(result?.status).toBe("ok");
  });

  it("exports the global MGRS zone overview when the metric lattice is too dense", () => {
    const result = resolveImageExportGridPortrayal(
      angularAdapter([11.9, 60], 2),
      request({
        ...base,
        mode: "mgrs",
        mgrs: { interval: 10_000 },
      }),
      false,
    );
    expect(result?.features.length).toBeGreaterThan(0);
    expect(result?.labels.some(({ anchor }) => anchor === "zone")).toBe(true);
    expect(result?.status).toBe("ok");
  });

  it("omits all modes when Include Grid is off", () => {
    for (const mode of ["utm", "mgrs", "local", "latlong"] as const) {
      expect(
        resolveImageExportGridPortrayal(angularAdapter(), undefined, mode === "latlong"),
      ).toBeNull();
    }
  });

  it("exports a projected grid on the globe", () => {
    const result = resolveImageExportGridPortrayal(
      projectedAdapter([10, 60], utmCrs),
      request(base),
      true,
    );
    expect(result?.features.length).toBeGreaterThan(0);
    expect(result?.status).toBe("ok");
  });

  it("turns invalid definitions into an omission instead of an export failure", () => {
    const invalid = request({ ...base, utm: { ...base.utm, interval: Number.NaN } });
    expect(
      resolveImageExportGridPortrayal(angularAdapter(), invalid, false)?.features,
    ).toEqual([]);
  });
});
