import { describe, expect, it } from "vitest";
import {
  createElevationSampler,
  elevationProfile,
  type DemImage,
  type DemTileProvider,
} from ".";

const TILE_SIZE = 4;

/**
 * A synthetic terrarium DEM whose height at global pixel (column, row) is
 * `column + 100 * row`. Bilinear interpolation reproduces an affine surface
 * exactly, so expected heights follow from the pixel position alone. Tiles are
 * raw RGBA bytes; the test decoder below wraps them without a canvas.
 */
function syntheticProvider(options: { maxZoom?: number; missing?: string[] } = {}) {
  const requests: string[] = [];
  const provider: DemTileProvider = {
    encoding: "terrarium",
    tileSize: TILE_SIZE,
    maxZoom: options.maxZoom ?? 1,
    async getTile(z, x, y) {
      const key = `${z}/${x}/${y}`;
      await Promise.resolve();
      requests.push(key);
      if (options.missing?.includes(key)) return null;
      const bytes = new Uint8Array(TILE_SIZE * TILE_SIZE * 4);
      for (let row = 0; row < TILE_SIZE; row++)
        for (let column = 0; column < TILE_SIZE; column++) {
          const height = x * TILE_SIZE + column + 100 * (y * TILE_SIZE + row) + 32768;
          const i = (row * TILE_SIZE + column) * 4;
          bytes.set([Math.floor(height / 256), height % 256, 0, 255], i);
        }
      return bytes.buffer;
    },
  };
  return { provider, requests };
}

const decodeImage = async (data: Blob | ArrayBuffer): Promise<DemImage> => ({
  data: new Uint8Array(data as ArrayBuffer),
  width: TILE_SIZE,
  height: TILE_SIZE,
});

/** The row of the pixel centre just above the equator at zoom 1 is 3, so the
 *  equator lies half a pixel below it. */
const EQUATOR = 100 * 3.5;

describe("createElevationSampler", () => {
  it("interpolates bilinearly between pixel centres, across tile edges", async () => {
    const { provider } = syntheticProvider();
    const sampler = createElevationSampler(provider, { decodeImage });
    // Zoom 1 is 8 px wide: longitude -90 is x = 2 px, and 0 is the tile edge at 4 px.
    expect(
      await sampler.sample([
        [-90, 0],
        [0, 0],
      ]),
    ).toEqual([1.5 + EQUATOR, 3.5 + EQUATOR]);
  });

  it("tells the ground size of the finest DEM pixel, which shrinks towards the poles", () => {
    const { provider } = syntheticProvider();
    const sampler = createElevationSampler(provider, { decodeImage });
    // Zoom 1 is 8 px around the equator.
    const equator = (2 * Math.PI * 6371008.8) / 8;
    expect(sampler.finestResolution(0)).toBeCloseTo(equator, 6);
    expect(sampler.finestResolution(60)).toBeCloseTo(equator / 2, 6);
  });

  it("fetches only the tiles the samples touch, once", async () => {
    const { provider, requests } = syntheticProvider();
    const sampler = createElevationSampler(provider, { decodeImage });
    await sampler.sample([[-135, 45]]);
    await sampler.sample([[-136, 46]]);
    expect(requests).toEqual(["1/0/0"]);
  });

  it("gives null where no zoom has a tile", async () => {
    const { provider } = syntheticProvider({ missing: ["1/1/1", "1/1/0", "0/0/0"] });
    const sampler = createElevationSampler(provider, { decodeImage });
    expect(
      await sampler.sample([
        [-90, 0],
        [0, 0],
        [90, 0],
      ]),
    ).toEqual([1.5 + EQUATOR, null, null]);
  });

  it("falls back to a coarser zoom where the finer tile is missing", async () => {
    const { provider } = syntheticProvider({ maxZoom: 3 });
    const getTile = provider.getTile;
    provider.getTile = (z, x, y) => (z > 1 ? Promise.resolve(null) : getTile(z, x, y));
    const sampler = createElevationSampler(provider, { decodeImage });
    expect(await sampler.sample([[-90, 0]])).toEqual([1.5 + EQUATOR]);
  });

  it("does not fail a new sample because an earlier one sharing its tiles was aborted", async () => {
    const { provider } = syntheticProvider();
    const sampler = createElevationSampler(provider, { decodeImage });
    const earlier = new AbortController();
    const first = sampler.sample([[-90, 0]], { signal: earlier.signal });
    earlier.abort();
    await expect(first).rejects.toThrow(/abort/i);
    expect(await sampler.sample([[-90, 0]])).toEqual([1.5 + EQUATOR]);
  });

  it("addresses pixels by the decoded tile width, not the declared tile size", async () => {
    const { provider } = syntheticProvider();
    const sampler = createElevationSampler(
      { ...provider, tileSize: 512 },
      { decodeImage },
    );
    expect(
      await sampler.sample([
        [-90, 0],
        [0, 0],
      ]),
    ).toEqual([1.5 + EQUATOR, 3.5 + EQUATOR]);
  });

  it("reads the coarsest zoom whose pixels are no larger than the resolution", async () => {
    const { provider, requests } = syntheticProvider({ maxZoom: 3 });
    const sampler = createElevationSampler(provider, { decodeImage });
    // Equatorial pixels are about 2500 km at zoom 2 and 5000 km at zoom 1.
    await sampler.sample([[-135, 45]], { resolution: 6_000_000 });
    await sampler.sample([[-135, 45]]);
    expect(new Set(requests.map((key) => key.split("/")[0]))).toEqual(
      new Set(["1", "3"]),
    );
  });
});

describe("elevationProfile", () => {
  it("samples ground elevation along the densified line", async () => {
    const { provider } = syntheticProvider({ maxZoom: 3 });
    const sampler = createElevationSampler(provider, { decodeImage });
    const line = {
      type: "LineString" as const,
      coordinates: [
        [-90, 0],
        [0, 0],
      ],
    };
    const profile = await elevationProfile(line, sampler, { spacing: 6_000_000 });
    expect(profile.coordinates.map(([lng]) => lng)).toEqual(
      [-90, -45, 0].map((v) => expect.closeTo(v)),
    );
    expect(profile.distances[2]).toBeCloseTo(90 * 111195.08, -1);
    expect(profile.elevations).toEqual(
      [1.5, 2.5, 3.5].map((x) => expect.closeTo(x + EQUATOR, 4)),
    );
  });
});
