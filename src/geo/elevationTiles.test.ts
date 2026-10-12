import { afterEach, describe, expect, it, vi } from "vitest";
import {
  elevationTilesSource,
  isTileTemplate,
  openElevationTiles,
} from "@/geo/elevationTiles";

const TEMPLATE = "https://dem.example.lan/{z}/{x}/{y}.png";
const TILEJSON = "https://dem.example.lan/tiles.json";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(response: () => Promise<unknown>) {
  const fetchSpy = vi.fn(response);
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

describe("elevationTilesSource", () => {
  it("uses a tile template as tiles", () => {
    expect(isTileTemplate(TEMPLATE)).toBe(true);
    expect(
      elevationTilesSource({ url: TEMPLATE, encoding: "terrarium", tileSize: 256 }),
    ).toEqual({
      type: "raster-dem",
      tiles: [TEMPLATE],
      encoding: "terrarium",
      tileSize: 256,
    });
  });

  it("uses any other address as a TileJSON document", () => {
    expect(isTileTemplate(TILEJSON)).toBe(false);
    expect(elevationTilesSource({ url: TILEJSON, encoding: "mapbox" })).toEqual({
      type: "raster-dem",
      url: TILEJSON,
      encoding: "mapbox",
    });
  });
});

describe("openElevationTiles", () => {
  it("reads the tile size from the tile that covers the world", async () => {
    const fetchSpy = stubFetch(async () => ({ ok: true, blob: async () => new Blob() }));
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({ width: 256, close: () => {} })),
    );

    await expect(openElevationTiles(TEMPLATE, "terrarium")).resolves.toEqual({
      url: TEMPLATE,
      encoding: "terrarium",
      tileSize: 256,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://dem.example.lan/0/0/0.png",
      expect.anything(),
    );
  });

  it("uses the default size when the server has no tile at zoom 0", async () => {
    stubFetch(async () => ({ ok: false, status: 404 }));
    await expect(openElevationTiles(TEMPLATE, "terrarium")).resolves.toMatchObject({
      tileSize: 512,
    });
  });

  it("refuses a tile server that does not answer", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(openElevationTiles(TEMPLATE, "terrarium")).rejects.toThrow(
      "Could not reach dem.example.lan",
    );
  });

  it("accepts a TileJSON document", async () => {
    stubFetch(async () => ({ ok: true, json: async () => ({ tiles: [TEMPLATE] }) }));
    await expect(openElevationTiles(TILEJSON, "mapbox")).resolves.toEqual({
      url: TILEJSON,
      encoding: "mapbox",
    });
  });

  it("refuses an address that gives no TileJSON document", async () => {
    stubFetch(async () => ({ ok: true, json: async () => ({ version: 8, layers: [] }) }));
    await expect(openElevationTiles(TILEJSON, "terrarium")).rejects.toThrow(
      "is not a TileJSON document",
    );

    stubFetch(async () => ({ ok: false, status: 404 }));
    await expect(openElevationTiles(TILEJSON, "terrarium")).rejects.toThrow(
      "Could not read a TileJSON document",
    );
  });
});
