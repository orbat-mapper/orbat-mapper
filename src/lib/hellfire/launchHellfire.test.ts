import type { Map as MlMap, MapGeoJSONFeature } from "maplibre-gl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { launchHellfire } from "./index";

/** A 2D context that takes every call and draws nothing; jsdom has no canvas. */
function fakeContext(): CanvasRenderingContext2D {
  const noop = () => fake;
  const fake: CanvasRenderingContext2D = new Proxy({} as CanvasRenderingContext2D, {
    get: (target, key) =>
      key in target ? target[key as keyof CanvasRenderingContext2D] : noop,
    set: (target, key, value) => Reflect.set(target, key, value),
  });
  return fake;
}

type FakeFeature = {
  layer: string;
  id?: string | number;
  properties?: Record<string, unknown>;
  at: [number, number];
  type?: "Point" | "LineString";
};

/** A flat map, 10 pixels per degree, whose rendered features are `features`. */
function fakeMap(features: FakeFeature[], layers = ["basemap", "units", "labels"]) {
  const container = document.createElement("div");
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  document.body.appendChild(container);
  const animate = vi.fn();
  container.animate = animate;
  const project = ([lng, lat]: [number, number]) => ({ x: lng * 10, y: -lat * 10 });
  const queryRenderedFeatures = vi.fn(
    (_box: unknown, { layers: queried }: { layers: string[] }) =>
      features
        .filter((f) => queried.includes(f.layer))
        .map(
          (f) =>
            ({
              id: f.id,
              properties: f.properties ?? {},
              geometry: { type: f.type ?? "Point", coordinates: f.at },
            }) as unknown as MapGeoJSONFeature,
        ),
  );
  const map = {
    getCanvas: () => canvas,
    getCanvasContainer: () => container,
    project,
    getVerticalFieldOfView: () => 36.87,
    getLayersOrder: () => layers,
    queryRenderedFeatures,
  } as unknown as MlMap;
  return { map, container, animate, queryRenderedFeatures };
}

const TARGET = { lng: 50, lat: -30 };

/** Runs the strike's animation frames to the end. */
function playOut() {
  vi.advanceTimersByTime(6000);
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "performance", "Date"] });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () => fakeContext() as never,
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("launchHellfire", () => {
  it("draws on an overlay in the canvas container and removes it when done", () => {
    const { map, container } = fakeMap([]);
    launchHellfire(map, TARGET);
    expect(container.querySelectorAll("canvas")).toHaveLength(2);
    playOut();
    expect(container.querySelectorAll("canvas")).toHaveLength(1);
  });

  it("reports the target features in reach once, after impact", () => {
    const { map } = fakeMap([
      { layer: "units", properties: { id: "near" }, at: [52, -31] },
      { layer: "units", properties: { id: "near" }, at: [52, -31] },
      { layer: "units", id: 7, at: [49, -30] },
      { layer: "units", properties: { id: "far" }, at: [80, -30] },
      { layer: "units", properties: { id: "line" }, at: [50, -30], type: "LineString" },
    ]);
    const onHit = vi.fn();
    launchHellfire(map, TARGET, { targets: { layers: (id) => id === "units" }, onHit });

    vi.advanceTimersByTime(1500);
    expect(onHit).not.toHaveBeenCalled();
    playOut();
    expect(onHit).toHaveBeenCalledOnce();
    expect(onHit.mock.calls[0][0].sort()).toEqual(["7", "near"]);
  });

  it("only queries the layers the targets name", () => {
    const { map, queryRenderedFeatures } = fakeMap([]);
    launchHellfire(map, TARGET, { targets: { layers: (id) => id !== "basemap" } });
    playOut();
    expect(queryRenderedFeatures).toHaveBeenCalledOnce();
    expect(queryRenderedFeatures.mock.calls[0][1]).toEqual({
      layers: ["units", "labels"],
    });
  });

  it("takes the id from the targets' id function", () => {
    const { map } = fakeMap([
      { layer: "units", properties: { id: "x", unitId: "u1" }, at: [50, -30] },
      { layer: "units", properties: { id: "y" }, at: [51, -30] },
    ]);
    const onHit = vi.fn();
    launchHellfire(map, TARGET, {
      targets: { layers: () => true, id: (f) => f.properties.unitId as string },
      onHit,
    });
    playOut();
    expect(onHit).toHaveBeenCalledWith(["u1"]);
  });

  it("hits nothing without targets", () => {
    const { map, queryRenderedFeatures } = fakeMap([
      { layer: "units", properties: { id: "near" }, at: [50, -30] },
    ]);
    const onHit = vi.fn();
    launchHellfire(map, TARGET, { onHit });
    playOut();
    expect(queryRenderedFeatures).not.toHaveBeenCalled();
    expect(onHit).not.toHaveBeenCalled();
  });

  it("shakes the map on impact unless told not to", () => {
    const shaken = fakeMap([]);
    launchHellfire(shaken.map, TARGET);
    vi.advanceTimersByTime(1500);
    expect(shaken.animate).not.toHaveBeenCalled();
    playOut();
    expect(shaken.animate).toHaveBeenCalledOnce();

    const still = fakeMap([]);
    launchHellfire(still.map, TARGET, { shake: false });
    playOut();
    expect(still.animate).not.toHaveBeenCalled();
  });

  it("stops when the map is removed mid-flight", () => {
    const { map, container } = fakeMap([
      { layer: "units", properties: { id: "near" }, at: [50, -30] },
    ]);
    const onHit = vi.fn();
    launchHellfire(map, TARGET, { targets: { layers: () => true }, onHit });
    vi.advanceTimersByTime(500);
    container.innerHTML = "";
    playOut();
    expect(onHit).not.toHaveBeenCalled();
  });
});

describe("the hellfire folder", () => {
  it("imports nothing outside itself but MapLibre and GeoJSON types, so it can be copied", () => {
    const sources = import.meta.glob<string>(["./*.ts", "!./*.test.ts"], {
      query: "?raw",
      import: "default",
      eager: true,
    });
    expect(Object.keys(sources)).toContain("./launchHellfire.ts");
    for (const [file, source] of Object.entries(sources)) {
      const imports = [
        ...source.matchAll(/^import\s+(type\s+)?[^;]*?from\s+"([^"]+)"/gm),
      ];
      for (const [, typeOnly, from] of imports) {
        const allowed =
          from.startsWith("./") ||
          (!!typeOnly && ["maplibre-gl", "geojson"].includes(from));
        expect(allowed, `${file} imports "${from}"`).toBe(true);
      }
    }
  });
});
