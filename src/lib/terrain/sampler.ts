import { decodeDem, type DemEncoding } from "./dem";
import { EARTH_RADIUS, type LngLat } from "./line";
import { clampLatitude, latitudeAt, mercatorY, RAD } from "./mercator";

/** Where DEM tiles come from: a URL template, a PMTiles archive, or anything else
 *  that can produce an encoded image for a Web Mercator tile address. */
export interface DemTileProvider {
  /** The encoded image (PNG or WebP), or null where there is no tile. */
  getTile(z: number, x: number, y: number): Promise<Blob | ArrayBuffer | null>;
  encoding: DemEncoding;
  tileSize: number;
  minZoom?: number;
  maxZoom: number;
}

/** Decoded RGBA pixels, as `ImageData` holds them. */
export interface DemImage {
  data: ArrayLike<number>;
  width: number;
  height: number;
}

export interface ElevationSamplerOptions {
  /** Replaces the canvas decoder, e.g. where there is no `OffscreenCanvas`. */
  decodeImage?: (data: Blob | ArrayBuffer) => Promise<DemImage>;
}

export interface SampleOptions {
  /** The ground distance in metres one DEM pixel may span. The coarsest zoom
   *  that resolves it is read; without it, the provider's finest. */
  resolution?: number;
  signal?: AbortSignal;
}

export interface PixelsAroundOptions {
  /** The most pixels across the circle: a wider one is read at a coarser zoom. */
  maxAcross: number;
  signal?: AbortSignal;
}

/** A square block of DEM pixels and their heights, NaN where there is no
 *  data: rows of `width` pixels west to east, from north to south. */
export interface DemPixels {
  width: number;
  /** Each pixel's centre. */
  positions: LngLat[];
  heights: Float64Array;
  /** Ground metres a pixel spans at the centre of the circle. */
  resolution: number;
}

export interface ElevationSampler {
  /** Heights in metres, or null where the DEM has no data. */
  sample(
    positions: readonly LngLat[],
    options?: SampleOptions,
  ): Promise<(number | null)[]>;
  /** Heights in metres, NaN where the DEM has no data: `sample` without boxing
   *  every value, for the millions of cells of a grid. */
  heights(positions: readonly LngLat[], options?: SampleOptions): Promise<Float64Array>;
  /** Ground metres one pixel of the finest zoom spans at a latitude. */
  finestResolution(latitude: number): number;
  /** The square block of the DEM's own pixels around the circle `radius`
   *  metres about `center`, each at its own height rather than one
   *  interpolated between pixels: where a search should find the same summit
   *  wherever it is centred. At the finest zoom that spans the circle in
   *  `maxAcross` pixels, or a coarser one where that has no data. */
  pixelsAround(
    center: LngLat,
    radius: number,
    options: PixelsAroundOptions,
  ): Promise<DemPixels>;
}

interface DecodedTile {
  heights: Float32Array;
  width: number;
}

/** Works on the main thread and in a worker alike. */
async function decodeWithCanvas(data: Blob | ArrayBuffer): Promise<DemImage> {
  const bitmap = await createImageBitmap(data instanceof Blob ? data : new Blob([data]));
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("No 2D canvas to decode DEM tiles.");
    context.drawImage(bitmap, 0, 0);
    return context.getImageData(0, 0, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

const EQUATOR_LENGTH = 2 * Math.PI * EARTH_RADIUS;
/** Decoded tiles to keep, about 1 MiB each at 512 px. A profile touches a
 *  handful per zoom, so this still spans a few profiles and edits. */
const CACHE_SIZE = 16;

/** Ground metres one pixel spans at a zoom and latitude. */
function pixelSize(tileSize: number, zoom: number, latitude: number) {
  return (Math.cos(latitude * RAD) * EQUATOR_LENGTH) / (tileSize * 2 ** zoom);
}

function zoomFor(
  provider: DemTileProvider,
  tileSize: number,
  positions: readonly LngLat[],
  resolution?: number,
) {
  const { minZoom = 0, maxZoom } = provider;
  if (!resolution || resolution <= 0) return maxZoom;
  // Pixels shrink towards the poles; the mean latitude is close enough for a line.
  const lat = positions.reduce((sum, [, lat]) => sum + lat, 0) / positions.length;
  const zoom = Math.ceil(Math.log2(pixelSize(tileSize, 0, lat) / resolution));
  return Math.min(maxZoom, Math.max(minZoom, zoom));
}

/** Global pixel coordinates of a position at a zoom, in pixel-centre space. */
const pixelX = (lng: number, worldSize: number) => ((lng + 180) / 360) * worldSize - 0.5;
const pixelY = (lat: number, worldSize: number) =>
  (0.5 - mercatorY(clampLatitude(lat)) / (2 * Math.PI)) * worldSize - 0.5;
/** A global pixel column, wrapped round the antimeridian. */
const wrapColumn = (column: number, worldSize: number) =>
  ((column % worldSize) + worldSize) % worldSize;

/** Settles with `promise`, or rejects as soon as `signal` aborts. */
function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  signal.throwIfAborted();
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener("abort", onAbort));
  });
}

/** Samples elevation from a tile provider: fetches only the tiles the samples
 *  touch, keeps the most recent ones, and interpolates bilinearly. */
export function createElevationSampler(
  provider: DemTileProvider,
  { decodeImage = decodeWithCanvas }: ElevationSamplerOptions = {},
): ElevationSampler {
  // Promises, so concurrent samples share one request. Map order is recency.
  const cache = new Map<string, Promise<DecodedTile | null>>();
  /** The pixel width of decoded tiles. A source's declared tile size is how
   *  large MapLibre draws a tile, which need not be how many pixels it holds. */
  let tileWidth: number | undefined;
  const pixelWidth = () => tileWidth ?? provider.tileSize;

  /** Tiles are shared between samples, so no one caller's signal aborts them. */
  function tile(z: number, x: number, y: number) {
    const key = `${z}/${x}/${y}`;
    let entry = cache.get(key);
    if (entry) cache.delete(key);
    else
      entry = provider.getTile(z, x, y).then(async (data) => {
        if (!data) return null;
        const image = await decodeImage(data);
        tileWidth = image.width;
        return { heights: decodeDem(image.data, provider.encoding), width: image.width };
      });
    cache.set(key, entry);
    // A failed request is asked again next time.
    entry.catch(() => cache.get(key) === entry && cache.delete(key));
    while (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value!);
    return entry;
  }

  /** Reads the tile at `position` if no tile has told the width the rest
   *  share yet: pixels are addressed by it. */
  async function learnTileWidth(z: number, [lng, lat]: LngLat, signal?: AbortSignal) {
    if (tileWidth !== undefined) return;
    const tiles = 2 ** z;
    const x = Math.floor(pixelX(lng, tiles) + 0.5);
    const y = Math.floor(pixelY(lat, tiles) + 0.5);
    await abortable(
      tile(z, wrapColumn(x, tiles), Math.min(tiles - 1, Math.max(0, y))),
      signal,
    );
  }

  /** The tile a global pixel lies in at zoom `z`, as one number. */
  function tileKey(z: number, column: number, row: number) {
    const size = pixelWidth();
    return Math.floor(row / size) * 2 ** z + Math.floor(column / size);
  }

  /** Loads the tiles with these keys at zoom `z`, and returns a reader of
   *  whole pixels by global column and row: NaN where a tile has no data. */
  async function loadPixels(z: number, keys: ReadonlySet<number>, signal?: AbortSignal) {
    const tiles = 2 ** z;
    const size = pixelWidth();
    const loaded = new Map<number, DecodedTile | null>();
    await abortable(
      Promise.all(
        [...keys].map(async (key) =>
          loaded.set(key, await tile(z, key % tiles, Math.floor(key / tiles))),
        ),
      ),
      signal,
    );
    // Neighbouring pixels almost always share a tile.
    let cachedKey = -1;
    let cached: DecodedTile | null | undefined;
    return (column: number, row: number) => {
      const key = Math.floor(row / size) * tiles + Math.floor(column / size);
      if (key !== cachedKey) {
        cachedKey = key;
        cached = loaded.get(key);
      }
      if (!cached) return NaN;
      return cached.heights[(row % size) * cached.width + (column % size)] ?? NaN;
    };
  }

  /** Bilinear samples at one zoom; NaN where a touched tile has no data. */
  async function sampleAt(z: number, positions: readonly LngLat[], signal?: AbortSignal) {
    const tiles = 2 ** z;
    await learnTileWidth(z, positions[0]!, signal);
    const size = pixelWidth();
    const worldSize = tiles * size;

    // Flat arrays and numeric tile keys: a viewshed grid has millions of samples.
    const count = positions.length;
    const us = new Float64Array(count);
    const vs = new Float64Array(count);
    for (let i = 0; i < count; i++) {
      const [lng, lat] = positions[i]!;
      us[i] = pixelX(lng, worldSize);
      vs[i] = pixelY(lat, worldSize);
    }

    // The four pixels around sample i, and its place between them.
    let c0 = 0;
    let c1 = 0;
    let r0 = 0;
    let r1 = 0;
    let fx = 0;
    let fy = 0;
    const clampRow = (row: number) => Math.min(worldSize - 1, Math.max(0, row));
    function corners(i: number) {
      const column = Math.floor(us[i]!);
      const row = Math.floor(vs[i]!);
      fx = us[i]! - column;
      fy = vs[i]! - row;
      c0 = wrapColumn(column, worldSize);
      c1 = wrapColumn(column + 1, worldSize);
      r0 = clampRow(row);
      r1 = clampRow(row + 1);
    }
    const needed = new Set<number>();
    for (let i = 0; i < count; i++) {
      corners(i);
      needed.add(tileKey(z, c0, r0));
      needed.add(tileKey(z, c1, r0));
      needed.add(tileKey(z, c0, r1));
      needed.add(tileKey(z, c1, r1));
    }
    const height = await loadPixels(z, needed, signal);

    // Any corner without data leaves NaN.
    const heights = new Float64Array(count);
    for (let i = 0; i < count; i++) {
      corners(i);
      const h00 = height(c0, r0);
      const h10 = height(c1, r0);
      const h01 = height(c0, r1);
      const h11 = height(c1, r1);
      const top = h00 + (h10 - h00) * fx;
      const bottom = h01 + (h11 - h01) * fx;
      heights[i] = top + (bottom - top) * fy;
    }
    return heights;
  }

  async function pixelsAround(
    center: LngLat,
    radius: number,
    { maxAcross, signal }: PixelsAroundOptions,
  ): Promise<DemPixels> {
    const [lng0, lat0] = center;
    const minZoom = provider.minZoom ?? 0;
    /** The finest zoom that spans the circle in `maxAcross` pixels this wide. */
    const fitting = (size: number) =>
      Math.min(
        provider.maxZoom,
        Math.max(
          minZoom,
          Math.floor(Math.log2((pixelSize(size, 0, lat0) * maxAcross) / (2 * radius))),
        ),
      );
    await learnTileWidth(fitting(pixelWidth()), center, signal);
    const size = pixelWidth();
    for (let z = fitting(size); ; z--) {
      const worldSize = 2 ** z * size;
      const resolution = pixelSize(size, z, lat0);
      const span = Math.ceil(radius / resolution);
      const width = 2 * span + 1;
      const column0 = Math.round(pixelX(lng0, worldSize)) - span;
      const row0 = Math.round(pixelY(lat0, worldSize)) - span;
      // Rows beyond the poles of the map have no pixels.
      const onMap = (row: number) => row >= 0 && row < worldSize;
      const needed = new Set<number>();
      for (let row = row0; row < row0 + width; row++)
        if (onMap(row))
          for (let column = column0; column < column0 + width; column++)
            needed.add(tileKey(z, wrapColumn(column, worldSize), row));
      const height = await loadPixels(z, needed, signal);
      const positions: LngLat[] = [];
      const heights = new Float64Array(width * width);
      let found = false;
      for (let r = 0; r < width; r++) {
        const row = row0 + r;
        const lat = latitudeAt(2 * Math.PI * (0.5 - (row + 0.5) / worldSize));
        for (let c = 0; c < width; c++) {
          const column = column0 + c;
          positions.push([((column + 0.5) / worldSize) * 360 - 180, lat]);
          const value = onMap(row) ? height(wrapColumn(column, worldSize), row) : NaN;
          heights[r * width + c] = value;
          found ||= !Number.isNaN(value);
        }
      }
      // An archive may stop short of this zoom here; a coarser one may cover it.
      if (found || z <= minZoom) return { width, positions, heights, resolution };
    }
  }

  /** Where a tile is missing, a coarser one may still cover the place, as
   *  archives often stop at different zooms in different regions. */
  async function heights(
    positions: readonly LngLat[],
    { resolution, signal }: SampleOptions = {},
  ) {
    if (!positions.length) return new Float64Array(0);
    const minZoom = provider.minZoom ?? 0;
    let z = zoomFor(provider, pixelWidth(), positions, resolution);
    const result = await sampleAt(z, positions, signal);
    let missing: number[] = [];
    for (let i = 0; i < result.length; i++) if (Number.isNaN(result[i])) missing.push(i);
    while (missing.length && --z >= minZoom) {
      const coarser = await sampleAt(
        z,
        missing.map((i) => positions[i]!),
        signal,
      );
      missing = missing.filter((index, j) => {
        result[index] = coarser[j]!;
        return Number.isNaN(coarser[j]);
      });
    }
    return result;
  }

  async function sample(positions: readonly LngLat[], options?: SampleOptions) {
    return Array.from(await heights(positions, options), (height) =>
      Number.isNaN(height) ? null : height,
    );
  }

  function finestResolution(latitude: number) {
    return pixelSize(pixelWidth(), provider.maxZoom, latitude);
  }

  return { sample, heights, finestResolution, pixelsAround };
}
