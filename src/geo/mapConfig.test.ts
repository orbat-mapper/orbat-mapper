import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ElevationConfigError,
  parseElevationConfig,
  rasterDemElevationSource,
  readMapConfigFile,
  resolveElevationConfig,
} from "@/geo/mapConfig";

const elevationArchive = vi.hoisted(() => ({ openConfigElevationArchive: vi.fn() }));

vi.mock("@/geo/elevationArchive", () => elevationArchive);

const BASEMAP = {
  name: "local",
  sourceType: "raster",
  tiles: ["/{z}/{x}/{y}.png"],
} as const;

beforeEach(() => {
  elevationArchive.openConfigElevationArchive.mockReset();
});

describe("readMapConfigFile", () => {
  it("reads a plain array as basemaps", () => {
    expect(readMapConfigFile([BASEMAP])).toEqual({ basemaps: [BASEMAP] });
  });

  it("reads basemaps and elevation from the object form", () => {
    const elevation = { sourceType: "pmtiles", url: "/dem.pmtiles" };
    expect(readMapConfigFile({ basemaps: [BASEMAP], elevation })).toEqual({
      basemaps: [BASEMAP],
      elevation,
    });
  });

  it("allows elevation without basemaps", () => {
    const elevation = { sourceType: "pmtiles", url: "/dem.pmtiles" };
    expect(readMapConfigFile({ elevation })).toEqual({ basemaps: [], elevation });
  });

  it("reads nothing from a file that is neither form", () => {
    expect(readMapConfigFile(null)).toEqual({ basemaps: [] });
    expect(readMapConfigFile("x")).toEqual({ basemaps: [] });
    expect(readMapConfigFile({ basemaps: "x" })).toEqual({ basemaps: [] });
  });
});

describe("parseElevationConfig", () => {
  it.each([
    ["not an object", "dem.pmtiles", /must be an object/],
    [
      "an unknown sourceType",
      { sourceType: "raster", url: "/x" },
      /Unknown elevation sourceType/,
    ],
    ["an archive without url", { sourceType: "pmtiles" }, /needs the "url"/],
    ["DEM tiles without url or tiles", { sourceType: "raster-dem" }, /either "url"/],
    [
      "DEM tiles with both url and tiles",
      { sourceType: "raster-dem", url: "/tiles.json", tiles: ["/{z}/{x}/{y}.png"] },
      /not both/,
    ],
    [
      "an unknown encoding",
      { sourceType: "pmtiles", url: "/dem.pmtiles", encoding: "custom" },
      /Unknown elevation encoding/,
    ],
  ])("refuses %s", (_, entry, message) => {
    expect(() => parseElevationConfig(entry)).toThrow(ElevationConfigError);
    expect(() => parseElevationConfig(entry)).toThrow(message);
  });
});

describe("rasterDemElevationSource", () => {
  it("builds a raster-dem source from tile templates", () => {
    expect(
      rasterDemElevationSource({
        sourceType: "raster-dem",
        tiles: ["/dem/{z}/{x}/{y}.png"],
        encoding: "mapbox",
        tileSize: 256,
        minZoom: 0,
        maxZoom: 12,
        bounds: [2, 57, 33, 72],
        attribution: "Kartverket",
      }),
    ).toEqual({
      type: "raster-dem",
      tiles: ["/dem/{z}/{x}/{y}.png"],
      encoding: "mapbox",
      tileSize: 256,
      minzoom: 0,
      maxzoom: 12,
      bounds: [2, 57, 33, 72],
      attribution: "Kartverket",
    });
  });

  it("uses a TileJSON address and Terrarium by default", () => {
    expect(
      rasterDemElevationSource({ sourceType: "raster-dem", url: "/dem/tiles.json" }),
    ).toEqual({ type: "raster-dem", url: "/dem/tiles.json", encoding: "terrarium" });
  });
});

describe("resolveElevationConfig", () => {
  it("opens a declared archive with what the config says about it", async () => {
    const source = { type: "raster-dem", url: "pmtiles://archive:elevation:config" };
    elevationArchive.openConfigElevationArchive.mockResolvedValue(source);

    await expect(
      resolveElevationConfig({
        sourceType: "pmtiles",
        url: "/dem.pmtiles",
        title: "Local terrain",
        encoding: "mapbox",
      }),
    ).resolves.toEqual({ title: "Local terrain", source });
    expect(elevationArchive.openConfigElevationArchive).toHaveBeenCalledWith(
      "/dem.pmtiles",
      { encoding: "mapbox", attribution: undefined },
    );
  });

  it("rejects when the archive cannot be read", async () => {
    elevationArchive.openConfigElevationArchive.mockRejectedValue(new Error("404"));
    await expect(
      resolveElevationConfig({ sourceType: "pmtiles", url: "/missing.pmtiles" }),
    ).rejects.toThrow("404");
  });

  it("needs no request for DEM tiles", async () => {
    await expect(
      resolveElevationConfig({ sourceType: "raster-dem", tiles: ["/{z}/{x}/{y}.png"] }),
    ).resolves.toEqual({
      source: { type: "raster-dem", tiles: ["/{z}/{x}/{y}.png"], encoding: "terrarium" },
    });
    expect(elevationArchive.openConfigElevationArchive).not.toHaveBeenCalled();
  });
});
