import type { MultiPolygon } from "geojson";
import {
  gridAround,
  gridSizeFor,
  sampleGrid,
  type DemGrid,
  type GridDetail,
} from "./grid";
import type { LngLat } from "./line";
import {
  createElevationSampler,
  type DemTileProvider,
  type ElevationSampler,
  type ElevationSamplerOptions,
} from "./sampler";
import { maskToPolygons } from "./outline";
import {
  clipToFan,
  maskingHeights,
  visibleAt,
  visibleShare,
  type RangeFan,
} from "./viewshed";

/**
 * Viewsheds off the main thread. The worker owns a sampler, so tile decoding,
 * grid sampling and the sweep all run there; it asks the main thread only for
 * the encoded bytes of each tile, so the provider itself (a URL template, a
 * PMTiles archive) never has to move into the worker.
 *
 * `serveViewsheds` runs in the worker and `connectViewshedService` on the main
 * thread; both take anything with `postMessage` and `addEventListener`, so a
 * `Worker`, the worker's own global scope, or a `MessagePort` all serve.
 */
export interface MessagePortLike {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  addEventListener(type: "message", listener: (event: MessageEvent) => void): void;
  /** A worker that fails fails every request in flight. */
  addEventListener(type: "error", listener: (event: Event) => void): void;
}

/** The grid is as fine as `cellSize` asks within `maxSize` cells a side, but no
 *  finer than the elevation data at the centre. */
export interface ViewshedRequest extends GridDetail {
  center: LngLat;
  /** Metres from the centre. */
  radius: number;
  observerHeight: number;
  targetHeight: number;
  refraction?: number;
  /** Only the ground within this fan; terrain outside it still masks. */
  fan?: RangeFan;
  /** Whether to trace the visible area's outline; false skips it, e.g. for a
   *  preview while dragging. Traced by default. */
  outline?: boolean;
}

export interface ViewshedResult {
  grid: DemGrid;
  /** One `Visibility` per cell, in grid order. */
  mask: Uint8Array;
  /** Metres above the ground a target must rise to be seen, per cell in grid
   *  order; NaN where there is no data. See `maskingHeights`. */
  masking: Float32Array;
  /** Which masking map this is: the same for every target height from one
   *  observer and fan, so a caller can tell the map has not changed. */
  sweep: number;
  /** The visible area's outline, or null when it was not asked for. */
  outline: MultiPolygon | null;
  /** The share of the ground with data that can be seen, or null if none has data. */
  visibleShare: number | null;
}

export interface ViewshedClient {
  compute(request: ViewshedRequest): Promise<ViewshedResult>;
}

type ProviderInfo = Pick<
  DemTileProvider,
  "encoding" | "tileSize" | "minZoom" | "maxZoom"
>;

type ToWorker =
  | { type: "provider"; provider: ProviderInfo }
  | { type: "compute"; id: number; request: ViewshedRequest }
  | { type: "tile"; id: number; data?: Blob | ArrayBuffer | null; error?: string };

type FromWorker =
  | { type: "tile"; id: number; z: number; x: number; y: number }
  | { type: "result"; id: number; result: ViewshedResult }
  | { type: "error"; id: number; message: string };

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** The worker's side: answers `compute` requests from one client. */
export function serveViewsheds(
  port: MessagePortLike,
  options: ElevationSamplerOptions = {},
): void {
  const post = (message: FromWorker, transfer?: Transferable[]) =>
    port.postMessage(message, transfer);
  const tiles = new Map<
    number,
    { resolve: (data: Blob | ArrayBuffer | null) => void; reject: (error: Error) => void }
  >();
  let nextTile = 0;
  let sampler: ElevationSampler | null = null;
  /** The last sampled ground, shared by every request at the same place. */
  let ground: { key: string; grid: DemGrid; heights: Promise<Float32Array> } | null =
    null;
  /** The last sweep, shared by every fan and target height from the same observer. */
  let sweep: { key: string; masking: Promise<Float32Array> } | null = null;
  /** The last sweep cut to its fan, shared by every target height. */
  let clipped: { key: string; id: number; masking: Promise<Float32Array> } | null = null;
  let maps = 0;

  function readTile(z: number, x: number, y: number) {
    return new Promise<Blob | ArrayBuffer | null>((resolve, reject) => {
      const id = nextTile++;
      tiles.set(id, { resolve, reject });
      post({ type: "tile", id, z, x, y });
    });
  }

  async function compute(id: number, request: ViewshedRequest) {
    const {
      center,
      radius,
      cellSize,
      maxSize,
      observerHeight,
      targetHeight,
      refraction,
      fan,
      outline = true,
    } = request;
    let key: string | undefined;
    let sweepKey: string | undefined;
    let clipKey: string | undefined;
    try {
      if (!sampler) throw new Error("The viewshed service has no tile provider.");
      const finest = sampler.finestResolution(center[1]);
      const size = gridSizeFor(radius, { cellSize, maxSize, finest });
      key = JSON.stringify([center, radius, size]);
      if (ground?.key !== key) {
        const grid = gridAround(center, radius, size);
        ground = { key, grid, heights: sampleGrid(sampler, grid) };
      }
      const { grid, heights } = ground;
      sweepKey = JSON.stringify([key, observerHeight, refraction]);
      if (sweep?.key !== sweepKey)
        sweep = {
          key: sweepKey,
          masking: heights.then((ground) =>
            maskingHeights(grid, ground, { observerHeight, refraction }),
          ),
        };
      clipKey = JSON.stringify([sweepKey, fan ?? null]);
      if (clipped?.key !== clipKey) {
        const whole = sweep.masking;
        clipped = {
          key: clipKey,
          id: maps++,
          masking: fan ? whole.then((masking) => clipToFan(grid, masking, fan)) : whole,
        };
      }
      const { id: sweepId, masking } = clipped;
      const mask = visibleAt(await masking, targetHeight);
      const result: ViewshedResult = {
        grid,
        mask,
        // Cloned, not moved: the sweep stays here for the next target height.
        masking: await masking,
        sweep: sweepId,
        outline: outline ? maskToPolygons(grid, mask) : null,
        visibleShare: visibleShare(mask),
      };
      post({ type: "result", id, result }, [mask.buffer]);
    } catch (error) {
      if (ground?.key === key) ground = null;
      if (sweep?.key === sweepKey) sweep = null;
      if (clipped?.key === clipKey) clipped = null;
      post({ type: "error", id, message: messageOf(error) });
    }
  }

  port.addEventListener("message", ({ data }: MessageEvent<ToWorker>) => {
    if (data.type === "provider") {
      sampler = createElevationSampler({ ...data.provider, getTile: readTile }, options);
      ground = null;
      sweep = null;
      clipped = null;
    } else if (data.type === "tile") {
      const pending = tiles.get(data.id);
      tiles.delete(data.id);
      if (data.error !== undefined) pending?.reject(new Error(data.error));
      else pending?.resolve(data.data ?? null);
    } else {
      void compute(data.id, data.request);
    }
  });
}

/** The main thread's side: sends requests, and reads tiles for the worker. */
export function connectViewshedService(
  port: MessagePortLike,
  provider: DemTileProvider,
): ViewshedClient {
  const post = (message: ToWorker, transfer?: Transferable[]) =>
    port.postMessage(message, transfer);
  const pending = new Map<
    number,
    { resolve: (result: ViewshedResult) => void; reject: (error: Error) => void }
  >();
  let nextId = 0;
  const { encoding, tileSize, minZoom, maxZoom } = provider;
  post({ type: "provider", provider: { encoding, tileSize, minZoom, maxZoom } });

  port.addEventListener("message", ({ data }: MessageEvent<FromWorker>) => {
    if (data.type === "tile") {
      provider.getTile(data.z, data.x, data.y).then(
        // Providers return a fresh buffer per call, so it can move, not copy.
        (tile) =>
          post(
            { type: "tile", id: data.id, data: tile },
            tile instanceof ArrayBuffer ? [tile] : [],
          ),
        (error: unknown) => post({ type: "tile", id: data.id, error: messageOf(error) }),
      );
      return;
    }
    const request = pending.get(data.id);
    pending.delete(data.id);
    if (data.type === "result") request?.resolve(data.result);
    else request?.reject(new Error(data.message));
  });
  port.addEventListener("error", () => {
    for (const request of pending.values())
      request.reject(new Error("The viewshed worker failed."));
    pending.clear();
  });

  return {
    compute(request) {
      return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        post({ type: "compute", id, request });
      });
    },
  };
}
