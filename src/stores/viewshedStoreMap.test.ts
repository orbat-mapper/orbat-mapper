// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";
import type { ViewshedRequest, ViewshedResult } from "@/lib/terrain";
import {
  FakeImageData,
  fakeMap,
  flatResult,
  observerDrag,
  settle,
} from "@/testdata/viewshed";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useTerrainStore } from "@/stores/terrainStore";
import { useViewshedStore } from "@/stores/viewshedStore";

const mocks = vi.hoisted(() => ({
  compute: vi.fn<(request: ViewshedRequest) => Promise<ViewshedResult>>(),
}));
vi.mock("@/geo/viewshedClient", () => ({
  viewshedClient: async () => ({ compute: mocks.compute }),
}));
vi.mock("@/geo/pointDrag", async () => ({
  attachPointDrag: (await import("@/testdata/viewshed")).attachPointDragMock,
}));

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
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("viewshed on the map", () => {
  it("hands the image source its pixels, with no image to encode or load", async () => {
    const { map, data } = fakeMap();
    const viewshed = useViewshedStore();
    viewshed.attachMap(map, []);
    viewshed.place([10, 50]);
    await settle();
    const image = data.get("orbat-analysis-viewshed") as FakeImageData;
    expect(image).toBeInstanceOf(FakeImageData);
    expect(image.width).toBe(viewshed.result!.grid.width);
  });

  it("moves the dot with the observer, and the ring only with the viewshed that fills it", async () => {
    const { map, updates, data } = fakeMap();
    const viewshed = useViewshedStore();
    viewshed.attachMap(map, []);
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
    // The dot follows at once; the ring waits for the image it bounds.
    expect(updates).toEqual(["orbat-viewshed-observer"]);
    expect(
      (data.get("orbat-viewshed-observer") as FeatureCollection<Point>).features[0]!
        .geometry.coordinates,
    ).toEqual([10.01, 50]);
    expect(ringCentre(data)).toBeCloseTo(10, 6);
    release();
    await settle();
    // Together, in one go, so terrain repaints its tiles once for both.
    expect(updates.slice(1)).toEqual(["orbat-analysis-viewshed", "orbat-viewshed-range"]);
    expect(ringCentre(data)).toBeCloseTo(10.01, 6);
  });

  it("clears the outline while dragging and draws it again once let go", async () => {
    const { map, data } = fakeMap();
    const viewshed = useViewshedStore();
    viewshed.attachMap(map, []);
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
    viewshed.attachMap(map, []);
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
    viewshed.attachMap(map, []);
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
    viewshed.attachMap(map, []);
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

  it("draws the image again when it switches to dead ground and back", async () => {
    const { map, updates } = fakeMap();
    const viewshed = useViewshedStore();
    viewshed.attachMap(map, []);
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
    viewshed.attachMap(map, []);
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

  it("stops listening to the map once detached", () => {
    const { map, click, container } = fakeMap();
    const viewshed = useViewshedStore();
    viewshed.attachMap(map, []);
    viewshed.start();
    viewshed.detach();
    expect(container.classList.contains("map-picking")).toBe(false);
    click([10, 50]);
    expect(viewshed.viewsheds).toHaveLength(0);
  });

  it("puts the images above the basemap, under the scenario layers", async () => {
    const { map } = fakeMap();
    map.addLayer({ id: "basemap-water", type: "fill", source: "x" });
    map.addLayer({ id: "units", type: "symbol", source: "y" });
    const addLayer = vi.spyOn(map, "addLayer");
    const viewshed = useViewshedStore();
    viewshed.attachMap(map, ["basemap-water"]);
    viewshed.place([10, 50]);
    await settle();
    expect(addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "orbat-analysis-viewshed" }),
      "units",
    );
  });
});
