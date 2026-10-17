// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { Feature, FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";
import {
  distanceBetween,
  type ElevationSampler,
  type LngLat,
  type ViewshedRequest,
  type ViewshedResult,
} from "@/lib/terrain";
import { latticeSampler } from "@/lib/terrain/latticeSampler";
import {
  FakeImageData,
  fakeMap,
  flatResult,
  observerDrag,
  settle,
} from "@/testdata/viewshed";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useTerrainStore } from "@/stores/terrainStore";
import { SNAP_AREA, useViewshedStore } from "@/stores/viewshedStore";
import { attachViewshedLayers } from "./viewshedLayers";

const mocks = vi.hoisted(() => ({
  compute: vi.fn<(request: ViewshedRequest) => Promise<ViewshedResult>>(),
  sampler: null as unknown as ElevationSampler,
}));
vi.mock("@/geo/viewshedClient", () => ({
  viewshedClient: async () => ({ compute: mocks.compute }),
  stopViewshedWorker: () => {},
}));
vi.mock("@/geo/demTileProvider", () => ({ demSampler: async () => mocks.sampler }));
vi.mock("@/geo/pointDrag", async () => ({
  attachPointDrag: (await import("@/testdata/viewshed")).attachPointDragMock,
}));

const metres = distanceBetween;

/** A hill about 143 m east of [10, 50], rising to 500 m, 1 m for every 10 m nearer its top. */
const HILL: LngLat = [10.002, 50];
const hill = (position: LngLat) => 500 - metres(HILL, position) / 10;

const dragFeatures = (data: Map<string, unknown>) =>
  (data.get("orbat-viewshed-drag") as FeatureCollection).features;

/** Presses the observer at [10, 50], and moves the pointer `x` pixels east of it. */
function dragEast(x: number, modifiers: { altKey?: boolean; shiftKey?: boolean } = {}) {
  observerDrag.start(0);
  const move = (to: number) =>
    observerDrag.move([10 + to / 1e4, 50], { point: [to, 0], ...modifiers });
  move(x);
  return { move, end: () => observerDrag.end() };
}

const ringCentre = (data: Map<string, unknown>) => {
  const ring = (data.get("orbat-viewshed-range") as FeatureCollection<Polygon>)
    .features[0]!;
  const [west, , east] = ring.bbox ?? [
    Math.min(...ring.geometry.coordinates[0]!.map(([lng]) => lng!)),
    0,
    Math.max(...ring.geometry.coordinates[0]!.map(([lng]) => lng!)),
  ];
  return (west! + east!) / 2;
};

beforeEach(() => {
  mocks.sampler = latticeSampler(hill, 2);
  localStorage.clear();
  setActivePinia(createPinia());
  vi.stubGlobal("ImageData", FakeImageData);
  useTerrainStore().setConfigElevation({
    status: "ready",
    elevation: { source: { type: "raster-dem", url: "https://dem.example/tiles.json" } },
  });
  mocks.compute.mockReset();
  mocks.compute.mockImplementation(async (request) => flatResult(request));
});
/** Every map attached in a test, taken off after it. */
const attached: (() => void)[] = [];
const attach = (...args: Parameters<typeof attachViewshedLayers>) => {
  const detach = attachViewshedLayers(...args);
  attached.push(detach);
  return detach;
};

afterEach(() => {
  attached.splice(0).forEach((detach) => detach());
  vi.unstubAllGlobals();
});

describe("viewshed on the map", () => {
  it("hands the image source its pixels, with no image to encode or load", async () => {
    const { map, data } = fakeMap();
    const viewshed = useViewshedStore();
    attach(map, new Set());
    viewshed.place([10, 50]);
    await settle();
    const image = data.get("orbat-analysis-viewshed") as FakeImageData;
    expect(image).toBeInstanceOf(FakeImageData);
    expect(image.width).toBe(viewshed.result!.grid.width);
  });

  it("moves the dot with the observer, and the ring only with the viewshed that fills it", async () => {
    const { map, updates, data } = fakeMap();
    const viewshed = useViewshedStore();
    attach(map, new Set());
    viewshed.place([10, 50]);
    await settle();
    // A drag begins with a preview where the observer stands.
    observerDrag.start(0);
    await settle();
    let release!: () => void;
    mocks.compute.mockImplementationOnce(
      (request) =>
        new Promise((resolve) => {
          release = () => resolve(flatResult(request));
        }),
    );
    updates.length = 0;
    observerDrag.move([10.01, 50]);
    await settle();
    // The dot follows at once, and the ground under it is read beside it; the ring waits for the
    // image it bounds.
    expect(updates).toEqual(["orbat-viewshed-observer", "orbat-viewshed-drag"]);
    expect(
      (data.get("orbat-viewshed-observer") as FeatureCollection<Point>).features[0]!
        .geometry.coordinates,
    ).toEqual([10.01, 50]);
    expect(ringCentre(data)).toBeCloseTo(10, 6);
    release();
    await settle();
    // Together, in one go, so terrain repaints its tiles once for both.
    expect(updates.slice(2)).toEqual(["orbat-analysis-viewshed", "orbat-viewshed-range"]);
    expect(ringCentre(data)).toBeCloseTo(10.01, 6);
  });

  it("clears the outline while dragging and draws it again once let go", async () => {
    const { map, data } = fakeMap();
    const viewshed = useViewshedStore();
    attach(map, new Set());
    viewshed.place([10, 50]);
    await settle();
    const outline = () =>
      data.get("orbat-analysis-viewshed-outline") as FeatureCollection | MultiPolygon;
    expect(outline().type).toBe("MultiPolygon");
    observerDrag.start(0);
    observerDrag.move([10.01, 50]);
    await settle();
    expect(outline()).toEqual({ type: "FeatureCollection", features: [] });
    observerDrag.end();
    await settle();
    expect(outline().type).toBe("MultiPolygon");
  });

  it("draws the combined coverage as one image, or each viewshed as its own", async () => {
    const { map, data } = fakeMap();
    const viewshed = useViewshedStore();
    attach(map, new Set());
    viewshed.place([10, 50]);
    viewshed.place([10.05, 50]);
    await settle();
    const single = viewshed.result!.grid.width;
    expect((data.get("orbat-analysis-viewshed") as FakeImageData).width).toBeGreaterThan(
      single,
    );
    expect(map.getSource("orbat-analysis-viewshed-1")).toBeUndefined();
    viewshed.combine = false;
    await settle();
    expect((data.get("orbat-analysis-viewshed") as FakeImageData).width).toBe(single);
    expect(map.getSource("orbat-analysis-viewshed-1")).toBeDefined();
    expect(map.getLayer("orbat-analysis-viewshed-outline-1")).toBeDefined();
    viewshed.combine = true;
    await settle();
    expect(map.getSource("orbat-analysis-viewshed-1")).toBeUndefined();
    expect(map.getLayer("orbat-analysis-viewshed-outline-1")).toBeUndefined();
  });

  it("marks every observer, the current one apart, and rings each", async () => {
    const { map, data } = fakeMap();
    const viewshed = useViewshedStore();
    attach(map, new Set());
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    await settle();
    const dots = (data.get("orbat-viewshed-observer") as FeatureCollection<Point>)
      .features;
    expect(
      dots.map((dot) => [
        dot.geometry.coordinates,
        dot.properties!.current,
        dot.properties!.label,
      ]),
    ).toEqual([
      [[10, 50], false, "1"],
      [[11, 51], true, "2"],
    ]);
    expect((data.get("orbat-viewshed-range") as FeatureCollection).features).toHaveLength(
      2,
    );
  });

  it("labels the observers by number only once there are several, pins included", async () => {
    const { map, data } = fakeMap();
    const viewshed = useViewshedStore();
    attach(map, new Set());
    viewshed.pin = true;
    viewshed.place([10, 50]);
    await settle();
    const labels = () =>
      (data.get("orbat-viewshed-observer") as FeatureCollection).features.map(
        (dot) => dot.properties!.label,
      );
    const heads = () =>
      (data.get("orbat-viewshed-pin") as FeatureCollection).features
        .filter((part) => part.properties!.kind === "head")
        .map((head) => head.properties!.text);
    expect(labels()).toEqual([""]);
    expect(heads()).toEqual(["2 m"]);
    viewshed.place([11, 51]);
    await settle();
    expect(labels()).toEqual(["1", "2"]);
    expect(heads()).toEqual(["1 · 2 m", "2 · 2 m"]);
  });

  it("stands a pin for an eye above sea level as high over the ground as it is", async () => {
    const { map, data } = fakeMap();
    const viewshed = useViewshedStore();
    attach(map, new Set());
    viewshed.pin = true;
    viewshed.place([10, 50]);
    viewshed.observerAbove = "sea-level";
    viewshed.observerHeight = 600;
    await settle();
    // The flat ground is at 100 m.
    const parts = (data.get("orbat-viewshed-pin") as FeatureCollection).features;
    expect(
      parts.find((part) => part.properties!.kind === "stick")!.properties!.height,
    ).toBe(500);
    expect(parts.find((part) => part.properties!.kind === "head")!.properties!.text).toBe(
      "600 m ASL",
    );
  });

  it("draws the image again when it switches to dead ground and back", async () => {
    const { map, updates } = fakeMap();
    const viewshed = useViewshedStore();
    attach(map, new Set());
    viewshed.place([10, 50]);
    await settle();
    const drawn = () => updates.filter((id) => id === "orbat-analysis-viewshed").length;
    const before = drawn();
    viewshed.display = "dead";
    await settle();
    expect(drawn()).toBe(before + 1);
    viewshed.display = "visible";
    await settle();
    expect(drawn()).toBe(before + 2);
  });

  it("places an observer on a map click only while placing, which then selects nothing", () => {
    const { map, click, container } = fakeMap();
    const viewshed = useViewshedStore();
    const mapSelect = useMapSelectStore();
    attach(map, new Set());
    click([10, 50]);
    expect(viewshed.viewsheds).toHaveLength(0);
    viewshed.start();
    expect(mapSelect.selectionSuppressed).toBe(true);
    expect(container.classList.contains("map-picking")).toBe(true);
    click([10, 50]);
    click([11, 51]);
    expect(viewshed.viewsheds.map(({ observer }) => observer)).toEqual([
      [10, 50],
      [11, 51],
    ]);
    viewshed.stop();
    expect(mapSelect.selectionSuppressed).toBe(false);
    expect(container.classList.contains("map-picking")).toBe(false);
    click([12, 52]);
    expect(viewshed.viewsheds).toHaveLength(2);
  });

  it("stops listening to the map, and takes its layers off it, once detached", async () => {
    const { map, click, container, layers, sources } = fakeMap();
    const viewshed = useViewshedStore();
    const detach = attach(map, new Set());
    viewshed.start();
    detach();
    expect(container.classList.contains("map-picking")).toBe(false);
    click([10, 50]);
    expect(viewshed.viewsheds).toHaveLength(0);
    expect([...layers]).toEqual([]);
    expect([...sources.keys()]).toEqual([]);
  });

  it("puts the images above the basemap, under the scenario layers", async () => {
    const { map } = fakeMap();
    map.addLayer({ id: "basemap-water", type: "fill", source: "x" });
    map.addLayer({ id: "units", type: "symbol", source: "y" });
    const addLayer = vi.spyOn(map, "addLayer");
    const viewshed = useViewshedStore();
    attach(map, new Set(["basemap-water"]));
    viewshed.place([10, 50]);
    await settle();
    expect(addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "orbat-analysis-viewshed" }),
      "units",
    );
  });
});

describe("dragging an observer", () => {
  /** The layers on a map, with an observer at [10, 50] to drag. */
  async function withObserver() {
    const { map, data } = fakeMap();
    const viewshed = useViewshedStore();
    attach(map, new Set());
    viewshed.place([10, 50]);
    await settle();
    return { viewshed, data };
  }

  it("follows the pointer and reads the ground under it, until let go", async () => {
    const { viewshed, data } = await withObserver();
    const { end } = dragEast(15);
    expect(viewshed.observer).toEqual([10.0015, 50]);
    await settle();
    const [readout, ...rest] = dragFeatures(data);
    expect(readout!.properties!.text).toBe("Ground 496 m");
    expect(readout!.geometry).toEqual({ type: "Point", coordinates: [10.0015, 50] });
    // No search circle while it only follows the pointer.
    expect(rest).toEqual([]);
    end();
    await settle();
    expect(dragFeatures(data)).toEqual([]);
  });

  it("snaps to the highest ground near the pointer, and lets go where it snapped", async () => {
    const { viewshed } = await withObserver();
    viewshed.snap = "highest";
    const { end } = dragEast(15);
    // Let go before the search lands.
    end();
    await settle();
    expect(metres(viewshed.observer!, HILL)).toBeLessThan(10);
    expect(viewshed.draggingId).toBeNull();
    // The full-detail viewshed is computed where it snapped.
    const last = mocks.compute.mock.lastCall![0];
    expect(last.outline).toBeUndefined();
    expect(last.center).toEqual(viewshed.observer);
  });

  it("rings the ground searched, a few pixels round the pointer, and reads the height found", async () => {
    const { viewshed, data } = await withObserver();
    viewshed.snap = "highest";
    const { end } = dragEast(15);
    await settle();
    const features = dragFeatures(data);
    const readout = features.find((feature) => feature.geometry.type === "Point")!;
    expect(readout.properties!.text).toMatch(/^Ground (499|500) m$/);
    const ring = features.find((feature) => feature.geometry.type === "Polygon") as
      Feature<Polygon> | undefined;
    const rim = ring!.geometry.coordinates[0]!;
    // 24 pixels east and west, at about 7 m each.
    expect(metres([10.0015, 50], rim[0] as LngLat)).toBeGreaterThan(150);
    expect(metres([10.0015, 50], rim[0] as LngLat)).toBeLessThan(200);
    end();
  });

  it("snaps to the highest ground while Alt is held, and the lowest with Shift too", async () => {
    const { viewshed } = await withObserver();
    dragEast(15, { altKey: true }).end();
    await settle();
    expect(metres(viewshed.observer!, HILL)).toBeLessThan(10);
    // A hollow where the hill was, found with Shift too.
    mocks.sampler = latticeSampler((position) => -hill(position), 2);
    viewshed.select(viewshed.viewsheds[0]!.id);
    observerDrag.start(0);
    observerDrag.move([10, 50], { point: [0, 0] });
    observerDrag.end();
    await settle();
    dragEast(15, { altKey: true, shiftKey: true }).end();
    await settle();
    expect(metres(viewshed.observer!, HILL)).toBeLessThan(10);
  });

  it("searches as far round the pointer as the snap area set", async () => {
    const { viewshed, data } = await withObserver();
    viewshed.snap = "highest";
    viewshed.snapPixels = 48;
    const { end } = dragEast(15);
    await settle();
    const ring = dragFeatures(data).find(
      (feature) => feature.geometry.type === "Polygon",
    ) as Feature<Polygon> | undefined;
    // 48 pixels at about 7 m each.
    const reach = metres([10.0015, 50], ring!.geometry.coordinates[0]![0] as LngLat);
    expect(reach).toBeGreaterThan(320);
    expect(reach).toBeLessThan(370);
    end();
  });

  it("keeps the snap and its area across viewsheds, the area within its limits", () => {
    const viewshed = useViewshedStore();
    expect(viewshed.snap).toBe("off");
    expect(viewshed.snapPixels).toBe(24);
    viewshed.snap = "lowest";
    viewshed.snapPixels = 1000;
    expect(viewshed.snapPixels).toBe(SNAP_AREA.max);
    viewshed.snapPixels = 0;
    expect(viewshed.snapPixels).toBe(SNAP_AREA.min);
    viewshed.place([10, 50]);
    viewshed.close();
    expect(viewshed.snap).toBe("lowest");
    expect(viewshed.snapPixels).toBe(SNAP_AREA.min);
  });

  it("stays on the summit it snapped to while that is in reach, though another is nearer", async () => {
    // A second summit as high, about 107 m beyond the first.
    const beyond: LngLat = [10.0035, 50];
    mocks.sampler = latticeSampler(
      (position) => Math.max(hill(position), 500 - metres(beyond, position) / 10),
      2,
    );
    const { viewshed } = await withObserver();
    viewshed.snap = "highest";
    const { move, end } = dragEast(15);
    await settle();
    const snapped = viewshed.observer!;
    expect(metres(snapped, HILL)).toBeLessThan(5);
    // Nearer the second summit, about 36 m from it and 71 m from the first.
    move(30);
    await settle();
    expect(viewshed.observer).toEqual(snapped);
    // Out of the first's reach, on to the second.
    move(50);
    await settle();
    expect(metres(viewshed.observer!, beyond)).toBeLessThan(10);
    end();
  });

  it("follows the pointer, reading the ground, where no summit is in reach", async () => {
    // Ground rising steadily east: its highest within reach is only the rim.
    mocks.sampler = latticeSampler(([lng]) => 100 + (lng - 10) * 1e4, 2);
    const { viewshed, data } = await withObserver();
    viewshed.snap = "highest";
    const { end } = dragEast(15);
    await settle();
    expect(viewshed.observer![0]).toBeCloseTo(10.0015, 9);
    const features = dragFeatures(data);
    expect(features.find((f) => f.geometry.type === "Point")!.properties!.text).toBe(
      "Ground 115 m",
    );
    // Still searching as the pointer moves on.
    expect(features.some((f) => f.geometry.type === "Polygon")).toBe(true);
    end();
  });

  it("shows each search that lands after the last, though the pointer has moved on", async () => {
    // Tiles still loading: each search waits until let through.
    const gates: (() => void)[] = [];
    const held = latticeSampler(hill, 2);
    mocks.sampler = {
      ...held,
      pixelsAround: (...args) =>
        new Promise((resolve) => gates.push(() => resolve(held.pixelsAround(...args)))),
    };
    const { viewshed } = await withObserver();
    viewshed.snap = "highest";
    const { move, end } = dragEast(15);
    await settle();
    move(16);
    await settle();
    // The first search lands while the second still waits: it is shown.
    gates[0]!();
    await settle();
    expect(metres(viewshed.observer!, HILL)).toBeLessThan(5);
    // A search older than one already shown is dropped.
    move(300);
    await settle();
    gates[2]!();
    await settle();
    const shown = viewshed.observer;
    gates[1]!();
    await settle();
    expect(viewshed.observer).toEqual(shown);
    end();
    await settle();
  });
});
