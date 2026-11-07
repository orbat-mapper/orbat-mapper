// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { isProxy } from "vue";
import {
  Visibility,
  type GridDetail,
  type ViewshedRequest,
  type ViewshedResult,
} from "@/lib/terrain";
import { FakeImageData, flatResult, settle } from "@/testdata/viewshed";
import { drawnCoverages } from "@/modules/maplibreview/viewshedLayers";
import { useTerrainStore } from "@/stores/terrainStore";
import {
  useViewshedStore,
  VIEWSHED_DETAILS,
  VIEWSHED_RADIUS,
} from "@/stores/viewshedStore";

const mocks = vi.hoisted(() => ({
  compute: vi.fn<(request: ViewshedRequest) => Promise<ViewshedResult>>(),
}));
vi.mock("@/geo/viewshedClient", () => ({
  viewshedClient: async () => ({ compute: mocks.compute }),
  stopViewshedWorker: () => {},
}));

vi.mock("@/geo/demTileProvider", async () => ({
  demSampler: async () =>
    (await import("@/lib/terrain/latticeSampler")).latticeSampler(() => 100, 2),
}));

const lastRequest = () => mocks.compute.mock.lastCall![0];

/** What the map draws: one coverage combined, or each on its own. */
const coverages = (viewshed: ReturnType<typeof useViewshedStore>) =>
  drawnCoverages(viewshed.shown, viewshed.combine).map(({ coverage }) => coverage);

/** Drags the observer at this index, by number, as the map does. */
function dragObserver(viewshed: ReturnType<typeof useViewshedStore>) {
  return {
    start: (index: number) => viewshed.startDrag(viewshed.viewsheds[index]!.id),
    move: (position: [number, number]) =>
      viewshed.dragTo(position, { altKey: false, shiftKey: false }, () => 0),
    end: () => viewshed.endDrag(),
  };
}

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

describe("viewshed store", () => {
  it("computes what an observer placed on the map can see", async () => {
    const viewshed = useViewshedStore();
    viewshed.start();
    viewshed.place([10, 50]);
    expect(viewshed.status).toBe("loading");
    await settle();
    expect(viewshed.status).toBe("ready");
    const { grid, mask } = viewshed.result!;
    expect(mask[((grid.height - 1) / 2) * grid.width + (grid.width - 1) / 2]).toBe(
      Visibility.Visible,
    );
    expect(viewshed.visibleShare).toBe(1);
  });

  it("computes again when a height changes", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    viewshed.observerHeight = 50;
    await settle();
    expect(lastRequest()).toMatchObject({ center: [10, 50], observerHeight: 50 });
  });

  it("previews on a coarser grid while the observer is dragged", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    const full = lastRequest().maxSize;
    dragObserver(viewshed).start(0);
    dragObserver(viewshed).move([10.01, 50]);
    await settle();
    expect(lastRequest().maxSize).toBeLessThan(full);
    dragObserver(viewshed).end();
    await settle();
    expect(lastRequest()).toMatchObject({ center: [10.01, 50], maxSize: full });
  });

  it("stands the eye on the ground and reaches along it until asked otherwise", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    expect(lastRequest()).toMatchObject({ observerAbove: "ground", slantRange: false });
    viewshed.observerAbove = "sea-level";
    viewshed.slantRange = true;
    await settle();
    expect(lastRequest()).toMatchObject({ observerAbove: "sea-level", slantRange: true });
  });

  it("holds the cell size of the full detail through a drag's previews", async () => {
    const viewshed = useViewshedStore();
    expect(viewshed.cellSize).toBeNull();
    viewshed.place([10, 50]);
    await settle();
    const full = viewshed.result!.grid.cellSize;
    expect(viewshed.cellSize).toBe(full);
    dragObserver(viewshed).start(0);
    dragObserver(viewshed).move([10.01, 50]);
    await settle();
    expect(viewshed.result!.grid.cellSize).toBeGreaterThan(full);
    expect(viewshed.cellSize).toBe(full);
    viewshed.close();
    await settle();
    expect(viewshed.cellSize).toBeNull();
  });

  it("computes again at the detail chosen", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    expect(viewshed.detail).toBe("standard");
    viewshed.detail = "fine";
    await settle();
    expect(lastRequest()).toMatchObject({ maxSize: VIEWSHED_DETAILS.fine.maxSize });
  });

  it("offers details from coarsest to finest, each with more cells than the last", () => {
    const levels: GridDetail[] = Object.values(VIEWSHED_DETAILS);
    levels.slice(1).forEach((level, i) => {
      expect(level.maxSize).toBeGreaterThan(levels[i]!.maxSize);
      expect(level.cellSize ?? 0).toBeLessThanOrEqual(levels[i]!.cellSize ?? 0);
    });
  });

  it("traces the outline only once the observer is let go", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    expect(lastRequest().outline).toBeUndefined();
    dragObserver(viewshed).start(0);
    dragObserver(viewshed).move([10.01, 50]);
    await settle();
    expect(lastRequest().outline).toBe(false);
    dragObserver(viewshed).end();
    await settle();
    expect(lastRequest().outline).toBeUndefined();
  });

  it("previews a drag at the coarsest detail, whatever the detail chosen", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    dragObserver(viewshed).start(0);
    await settle();
    const { cellSize, maxSize } = VIEWSHED_DETAILS.draft;
    expect(lastRequest()).toMatchObject({ cellSize, maxSize });
    viewshed.detail = "max";
    await settle();
    expect(lastRequest()).toMatchObject({ cellSize, maxSize });
  });

  it("keeps the radius within the limits the detail levels are sized for", () => {
    const viewshed = useViewshedStore();
    viewshed.radius = VIEWSHED_RADIUS.max * 10;
    expect(viewshed.radius).toBe(VIEWSHED_RADIUS.max);
    viewshed.radius = 0;
    expect(viewshed.radius).toBe(VIEWSHED_RADIUS.min);
  });

  it("computes only the newest observer once the one in flight is done", async () => {
    let release!: () => void;
    mocks.compute.mockImplementationOnce(
      (request) =>
        new Promise((resolve) => {
          release = () => resolve(flatResult(request));
        }),
    );
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    dragObserver(viewshed).start(0);
    dragObserver(viewshed).move([10.01, 50]);
    dragObserver(viewshed).move([10.02, 50]);
    dragObserver(viewshed).move([10.03, 50]);
    // The drag ends once the ground it reads under the pointer has landed.
    dragObserver(viewshed).end();
    await vi.waitFor(() => expect(viewshed.draggingId).toBeNull());
    release();
    await settle();
    expect(mocks.compute).toHaveBeenCalledTimes(2);
    expect(lastRequest().center).toEqual([10.03, 50]);
    expect(viewshed.result!.grid.center).toEqual([10.03, 50]);
    expect(viewshed.status).toBe("ready");
  });

  it("reports an error when the elevation data cannot be read", async () => {
    mocks.compute.mockRejectedValue(new Error("offline"));
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    expect(viewshed.status).toBe("error");
    expect(viewshed.result).toBeNull();
  });

  it("closes when the elevation data goes away", async () => {
    const viewshed = useViewshedStore();
    viewshed.start();
    viewshed.place([10, 50]);
    await settle();
    useTerrainStore().setConfigElevation({ status: "failed" });
    await settle();
    expect(viewshed.observer).toBeNull();
    expect(viewshed.placing).toBe(false);
    expect(viewshed.active).toBe(false);
  });

  it("forgets the observer on close, but stopping placing keeps it shown", async () => {
    const viewshed = useViewshedStore();
    viewshed.start();
    viewshed.place([10, 50]);
    await settle();
    viewshed.stop();
    expect(viewshed.placing).toBe(false);
    expect(viewshed.active).toBe(true);
    expect(viewshed.result).not.toBeNull();
    viewshed.close();
    expect(viewshed.observer).toBeNull();
    expect(viewshed.result).toBeNull();
    expect(viewshed.active).toBe(false);
  });

  it("is active while placing, before any observer is placed", () => {
    const viewshed = useViewshedStore();
    expect(viewshed.active).toBe(false);
    viewshed.start();
    expect(viewshed.active).toBe(true);
    viewshed.close();
    expect(viewshed.placing).toBe(false);
    expect(viewshed.active).toBe(false);
  });

  it("shows the observer as a dot until a pin is asked for, and keeps the choice", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    expect(viewshed.pin).toBe(false);
    viewshed.pin = true;
    viewshed.close();
    viewshed.place([10, 50]);
    expect(viewshed.pin).toBe(true);
  });

  it("shows what is visible until masking heights are asked for, without computing again", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    expect(viewshed.display).toBe("visible");
    viewshed.display = "masking";
    await settle();
    expect(mocks.compute).toHaveBeenCalledTimes(1);
    viewshed.close();
    expect(viewshed.display).toBe("masking");
  });

  it("highlights dead ground without computing again", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    viewshed.display = "dead";
    await settle();
    expect(mocks.compute).toHaveBeenCalledTimes(1);
  });

  it("drops a result that arrives after the viewshed was closed", async () => {
    let release!: () => void;
    mocks.compute.mockImplementationOnce(
      (request) =>
        new Promise((resolve) => {
          release = () => resolve(flatResult(request));
        }),
    );
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    viewshed.close();
    release();
    await settle();
    expect(viewshed.result).toBeNull();
  });
});

describe("several viewsheds", () => {
  const centres = () => mocks.compute.mock.calls.map(([request]) => request.center);

  it("adds an observer for each click while placing, and computes each", async () => {
    const viewshed = useViewshedStore();
    viewshed.start();
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    await settle();
    expect(viewshed.viewsheds).toHaveLength(2);
    expect(centres()).toEqual([
      [10, 50],
      [11, 51],
    ]);
    expect(viewshed.observer).toEqual([11, 51]);
    expect(viewshed.result!.grid.center).toEqual([11, 51]);
  });

  it("gives each its own settings, a new one starting from the current one's", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    viewshed.observerHeight = 10;
    viewshed.observerAbove = "sea-level";
    viewshed.slantRange = true;
    viewshed.place([11, 51]);
    expect(viewshed.observerHeight).toBe(10);
    expect(viewshed.observerAbove).toBe("sea-level");
    expect(viewshed.slantRange).toBe(true);
    viewshed.observerHeight = 20;
    viewshed.radius = 8000;
    await settle();
    mocks.compute.mockClear();
    const [first] = viewshed.viewsheds;
    viewshed.select(first!.id);
    expect(viewshed.observer).toEqual([10, 50]);
    expect(viewshed.observerHeight).toBe(10);
    expect(viewshed.radius).toBe(5000);
    viewshed.targetHeight = 5;
    await settle();
    // Only the one changed computes again.
    expect(centres()).toEqual([[10, 50]]);
  });

  it("opens the next viewshed with the settings of the last one closed", () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    viewshed.observerHeight = 7;
    viewshed.radius = 3000;
    viewshed.close();
    expect(viewshed.observerHeight).toBe(7);
    viewshed.place([11, 51]);
    expect(viewshed.observerHeight).toBe(7);
    expect(viewshed.radius).toBe(3000);
  });

  it("numbers each observer, reusing the lowest number free", () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    viewshed.place([12, 52]);
    const numbers = () => viewshed.viewsheds.map(({ number }) => number);
    expect(numbers()).toEqual([1, 2, 3]);
    viewshed.select(viewshed.viewsheds[1]!.id);
    viewshed.close();
    expect(numbers()).toEqual([1, 3]);
    viewshed.place([13, 53]);
    expect(numbers()).toEqual([1, 2, 3]);
    expect(viewshed.number).toBe(2);
    expect(viewshed.observer).toEqual([13, 53]);
  });

  it("steps through the observers by number, round from the last to the first", () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    viewshed.place([12, 52]);
    expect(viewshed.number).toBe(3);
    viewshed.step(1);
    expect(viewshed.number).toBe(1);
    viewshed.step(1);
    expect(viewshed.number).toBe(2);
    viewshed.step(-1);
    viewshed.step(-1);
    expect(viewshed.number).toBe(3);
  });

  it("asks with plain data, which a worker can clone", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    dragObserver(viewshed).start(0);
    dragObserver(viewshed).move([10.01, 50]);
    dragObserver(viewshed).end();
    await settle();
    expect(isProxy(lastRequest().center)).toBe(false);
    expect(() => structuredClone(lastRequest())).not.toThrow();
  });

  it("moves the observer pressed and makes it current, rather than adding one", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    dragObserver(viewshed).start(0);
    expect(viewshed.number).toBe(1);
    dragObserver(viewshed).move([10.5, 50]);
    dragObserver(viewshed).end();
    expect(viewshed.viewsheds.map(({ observer }) => observer)).toEqual([
      [10.5, 50],
      [11, 51],
    ]);
  });

  it("closes the current one, then the one before it is current; or closes all", async () => {
    const viewshed = useViewshedStore();
    viewshed.start();
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    viewshed.place([12, 52]);
    await settle();
    viewshed.close();
    expect(viewshed.viewsheds).toHaveLength(2);
    expect(viewshed.observer).toEqual([11, 51]);
    expect(viewshed.result!.grid.center).toEqual([11, 51]);
    expect(viewshed.placing).toBe(true);
    viewshed.closeAll();
    expect(viewshed.viewsheds).toHaveLength(0);
    expect(viewshed.observer).toBeNull();
    expect(viewshed.result).toBeNull();
    expect(viewshed.placing).toBe(false);
  });

  it("keeps each result for its own viewshed while others compute", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    viewshed.place([11, 51]);
    await settle();
    expect(viewshed.results.size).toBe(2);
    const [first] = viewshed.viewsheds;
    viewshed.select(first!.id);
    expect(viewshed.result!.grid.center).toEqual([10, 50]);
    expect(viewshed.status).toBe("ready");
  });

  it("combines the coverage by default, and can show each on its own", async () => {
    const viewshed = useViewshedStore();
    expect(viewshed.combine).toBe(true);
    viewshed.place([10, 50]);
    viewshed.place([10.05, 50]);
    await settle();
    expect(coverages(viewshed)).toHaveLength(1);
    const [combined] = coverages(viewshed);
    expect(combined!.grid.width).toBeGreaterThan(viewshed.result!.grid.width);
    viewshed.combine = false;
    expect(coverages(viewshed)).toHaveLength(2);
  });

  it("sets the detail of every viewshed by default", async () => {
    const viewshed = useViewshedStore();
    expect(viewshed.detailForAll).toBe(true);
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    await settle();
    mocks.compute.mockClear();
    viewshed.detail = "fine";
    await settle();
    const asked = mocks.compute.mock.calls.map(([request]) => request);
    expect(asked).toHaveLength(2);
    expect(asked.every(({ maxSize }) => maxSize === VIEWSHED_DETAILS.fine.maxSize)).toBe(
      true,
    );
  });

  it("sets only the current one's detail while not for all", async () => {
    const viewshed = useViewshedStore();
    viewshed.detailForAll = false;
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    await settle();
    mocks.compute.mockClear();
    viewshed.detail = "fine";
    await settle();
    expect(centres()).toEqual([[11, 51]]);
    const [first] = viewshed.viewsheds;
    viewshed.select(first!.id);
    expect(viewshed.detail).toBe("standard");
  });

  it("gives every viewshed the current one's detail when set for all again", async () => {
    const viewshed = useViewshedStore();
    viewshed.detailForAll = false;
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    viewshed.detail = "fine";
    await settle();
    mocks.compute.mockClear();
    viewshed.detailForAll = true;
    await settle();
    expect(centres()).toEqual([[10, 50]]);
    expect(lastRequest().maxSize).toBe(VIEWSHED_DETAILS.fine.maxSize);
  });

  it("combines on a coarser grid while one is a preview", async () => {
    const viewshed = useViewshedStore();
    viewshed.detail = "fine";
    viewshed.place([10, 50]);
    viewshed.place([10.1, 50]);
    dragObserver(viewshed).start(1);
    await settle();
    const [combined] = coverages(viewshed);
    expect(Math.max(combined!.grid.width, combined!.grid.height)).toBeLessThanOrEqual(
      801,
    );
    dragObserver(viewshed).end();
    await settle();
    const [settled] = coverages(viewshed);
    expect(settled!.grid.width).toBeGreaterThan(801);
  });

  it("closes every one when the elevation data goes away", async () => {
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    await settle();
    useTerrainStore().setConfigElevation({ status: "failed" });
    await settle();
    expect(viewshed.viewsheds).toHaveLength(0);
  });
});
