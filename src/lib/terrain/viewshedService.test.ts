import { describe, expect, it, vi } from "vitest";
import {
  connectViewshedService,
  serveViewsheds,
  Visibility,
  type DemImage,
  type DemTileProvider,
  type MessagePortLike,
} from ".";

const TILE_SIZE = 4;

/** Flat terrarium tiles at `height` metres; raw RGBA, decoded without a canvas. */
function flatProvider(height = 100, maxZoom = 20) {
  const getTile = vi.fn<DemTileProvider["getTile"]>(async () => {
    const value = height + 32768;
    const bytes = new Uint8Array(TILE_SIZE * TILE_SIZE * 4);
    for (let i = 0; i < bytes.length; i += 4)
      bytes.set([Math.floor(value / 256), value % 256, 0, 255], i);
    return bytes.buffer;
  });
  const provider: DemTileProvider = {
    encoding: "terrarium",
    tileSize: TILE_SIZE,
    maxZoom,
    getTile,
  };
  return { provider, getTile };
}

const decodeImage = async (data: Blob | ArrayBuffer): Promise<DemImage> => ({
  data: new Uint8Array(data as ArrayBuffer),
  width: TILE_SIZE,
  height: TILE_SIZE,
});

/** Two ends of an in-memory channel. Messages are structured-cloned and arrive
 *  in a later task, as they would between threads. */
function channel(): [MessagePortLike, MessagePortLike] {
  const listeners: [
    ((event: MessageEvent) => void)[],
    ((event: MessageEvent) => void)[],
  ] = [[], []];
  const end = (self: 0 | 1): MessagePortLike => ({
    postMessage(message) {
      const copy = structuredClone(message);
      setTimeout(() => {
        for (const listener of listeners[1 - self]!)
          listener({ data: copy } as MessageEvent);
      });
    },
    addEventListener(type: string, listener: (event: MessageEvent) => void) {
      if (type === "message") listeners[self].push(listener);
    },
  });
  return [end(0), end(1)];
}

function connect(provider: DemTileProvider) {
  const [main, worker] = channel();
  serveViewsheds(worker, { decodeImage });
  return connectViewshedService(main, provider);
}

const request = {
  center: [10, 50] as [number, number],
  radius: 1000,
  cellSize: 100,
  maxSize: 401,
  observerHeight: 2,
  targetHeight: 2,
};

describe("viewshed service", () => {
  it("computes a viewshed off the main thread, reading tiles through the client", async () => {
    const { provider, getTile } = flatProvider();
    const client = connect(provider);
    const { grid, mask, outline } = await client.compute(request);
    expect(grid).toMatchObject({ width: 21, height: 21, radius: 1000 });
    // Flat ground: one disc of visible cells, without holes.
    expect(outline!.coordinates).toHaveLength(1);
    expect(outline!.coordinates[0]).toHaveLength(1);
    expect(mask[10 * 21 + 10]).toBe(Visibility.Visible);
    expect(mask[0]).toBe(Visibility.NoData);
    expect(getTile).toHaveBeenCalled();
  });

  it("reuses the sampled ground when only the heights change", async () => {
    const { provider, getTile } = flatProvider();
    const client = connect(provider);
    const first = await client.compute(request);
    const calls = getTile.mock.calls.length;
    const { mask, sweep } = await client.compute({ ...request, observerHeight: 50 });
    expect(sweep).not.toBe(first.sweep);
    expect(getTile).toHaveBeenCalledTimes(calls);
    expect(mask[10 * 21 + 10]).toBe(Visibility.Visible);
  });

  it("returns how high a target must rise to be seen at every cell", async () => {
    const client = connect(flatProvider().provider);
    const { masking } = await client.compute(request);
    expect(masking).toHaveLength(21 * 21);
    expect(masking[10 * 21 + 10]).toBe(0);
    expect(masking[0]).toBeNaN();
  });

  it("sees a new target height from the same masking heights", async () => {
    const client = connect(flatProvider().provider);
    const first = await client.compute(request);
    const second = await client.compute({ ...request, targetHeight: 0 });
    expect(second.sweep).toBe(first.sweep);
    expect(second.masking).toEqual(first.masking);
    expect(second.mask[10 * 21 + 10]).toBe(Visibility.Visible);
  });

  it("clips the masking heights to a range fan, keeping the fan across target heights", async () => {
    const client = connect(flatProvider().provider);
    const first = await client.compute(request);
    const fan = { left: 45, right: 135, minRange: 0, maxRange: 1000 };
    const clipped = await client.compute({ ...request, fan });
    // A new map to draw, from the same sweep.
    expect(clipped.sweep).not.toBe(first.sweep);
    expect(clipped.masking[10 * 21 + 17]).toBe(0);
    expect(clipped.masking[10 * 21 + 3]).toBeNaN();
    expect(clipped.mask[10 * 21 + 3]).toBe(Visibility.NoData);
    expect(clipped.visibleShare).toBe(1);
    const again = await client.compute({ ...request, fan, targetHeight: 0 });
    expect(again.sweep).toBe(clipped.sweep);
  });

  it("skips tracing the outline when it is not asked for", async () => {
    const client = connect(flatProvider().provider);
    const { outline, mask } = await client.compute({ ...request, outline: false });
    expect(outline).toBeNull();
    expect(mask[10 * 21 + 10]).toBe(Visibility.Visible);
    expect((await client.compute(request)).outline).not.toBeNull();
  });

  it("answers concurrent requests each with its own result", async () => {
    const client = connect(flatProvider().provider);
    const [small, large] = await Promise.all([
      client.compute({ ...request, cellSize: 1, maxSize: 11 }),
      client.compute({ ...request, cellSize: 1, maxSize: 31 }),
    ]);
    expect(small.grid.width).toBe(11);
    expect(large.grid.width).toBe(31);
  });

  it("makes cells no finer than the elevation data", async () => {
    // Zoom 12 of 4 px tiles: a pixel spans about 1572 m at 50° N.
    const client = connect(flatProvider(100, 12).provider);
    const { grid } = await client.compute({ ...request, radius: 20_000, cellSize: 1 });
    expect(grid.width).toBe(25);
  });

  it("rejects when the tiles cannot be read", async () => {
    const { provider, getTile } = flatProvider();
    getTile.mockRejectedValue(new Error("offline"));
    await expect(connect(provider).compute(request)).rejects.toThrow("offline");
  });
});
