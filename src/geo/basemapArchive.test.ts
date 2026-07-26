import { afterEach, describe, expect, it } from "vitest";
import { TileType, type Header } from "pmtiles";
import {
  UnsupportedArchiveError,
  archiveKeyFromFileName,
  basemapArchiveKind,
  describePmtilesArchive,
  openBasemapArchiveFile,
} from "@/geo/basemapArchive";
import {
  getArchive,
  registerFileArchive,
  resetPmtilesProtocol,
} from "@/geo/pmtilesProtocol";

function header(tileType: TileType): Header {
  return {
    specVersion: 3,
    rootDirectoryOffset: 0,
    rootDirectoryLength: 0,
    jsonMetadataOffset: 0,
    jsonMetadataLength: 0,
    leafDirectoryOffset: 0,
    tileDataOffset: 0,
    numAddressedTiles: 0,
    numTileEntries: 0,
    numTileContents: 0,
    clustered: true,
    internalCompression: 1,
    tileCompression: 1,
    tileType,
    minZoom: 2,
    maxZoom: 12,
    minLon: -10,
    minLat: -20,
    maxLon: 30,
    maxLat: 40,
    centerZoom: 5,
    centerLon: 0,
    centerLat: 0,
  } as Header;
}

describe("describePmtilesArchive", () => {
  it("calls an MVT archive vector", () => {
    expect(describePmtilesArchive(header(TileType.Mvt), {}).kind).toBe("vector");
  });

  it.each([TileType.Png, TileType.Jpeg, TileType.Webp, TileType.Avif])(
    "calls tile type %i raster",
    (tileType) => {
      expect(describePmtilesArchive(header(tileType), {}).kind).toBe("raster");
    },
  );

  it("decides raster or vector from the header, not from the file name", () => {
    const asVector = describePmtilesArchive(header(TileType.Mvt), {}, "imagery.pmtiles");
    const asRaster = describePmtilesArchive(header(TileType.Png), {}, "vector.pmtiles");
    expect(asVector.kind).toBe("vector");
    expect(asRaster.kind).toBe("raster");
  });

  it("rejects a tile type it cannot render", () => {
    expect(() =>
      describePmtilesArchive(header(TileType.Unknown), {}, "odd.pmtiles"),
    ).toThrow(UnsupportedArchiveError);
  });

  it("passes the archive's own attribution through", () => {
    const info = describePmtilesArchive(header(TileType.Mvt), {
      attribution: "© OpenStreetMap contributors",
    });
    expect(info.attribution).toBe("© OpenStreetMap contributors");
  });

  it("invents no attribution when the archive carries none", () => {
    expect(describePmtilesArchive(header(TileType.Mvt), {}).attribution).toBeUndefined();
    expect(
      describePmtilesArchive(header(TileType.Mvt), undefined).attribution,
    ).toBeUndefined();
    expect(
      describePmtilesArchive(header(TileType.Mvt), { attribution: "" }).attribution,
    ).toBeUndefined();
  });

  it("takes zooms and bounds from the header", () => {
    const info = describePmtilesArchive(header(TileType.Png), {}, "world.pmtiles");
    expect(info).toMatchObject({
      minZoom: 2,
      maxZoom: 12,
      bounds: [-10, -20, 30, 40],
      fileName: "world.pmtiles",
    });
  });
});

describe("basemapArchiveKind", () => {
  it("recognises archive extensions case-insensitively", () => {
    expect(basemapArchiveKind("world.PMTiles")).toBe("pmtiles");
    expect(basemapArchiveKind("world.mapbundle")).toBe("mapbundle");
  });

  it("returns null for anything else", () => {
    expect(basemapArchiveKind("scenario.json")).toBeNull();
    expect(basemapArchiveKind("pmtiles")).toBeNull();
  });
});

describe("archiveKeyFromFileName", () => {
  it("strips the extension and awkward characters", () => {
    expect(archiveKeyFromFileName("Oslo area.pmtiles")).toBe("Oslo_area");
    expect(archiveKeyFromFileName("bundle.mapbundle")).toBe("bundle");
  });

  it("falls back to a usable name", () => {
    expect(archiveKeyFromFileName("!!.pmtiles")).toBe("basemap");
  });
});

describe("openBasemapArchiveFile", () => {
  afterEach(() => {
    resetPmtilesProtocol();
  });

  it("keeps the archive already registered under the same key when the new file is unreadable", async () => {
    const good = registerFileArchive("basemap", new File(["good"], "basemap.pmtiles"));
    const corrupt = new File(["not a pmtiles archive"], "basemap.pmtiles");

    await expect(openBasemapArchiveFile(corrupt)).rejects.toBeInstanceOf(
      UnsupportedArchiveError,
    );

    expect(getArchive("basemap")).toBe(good);
  });

  it("rejects a mapbundle until the protocol is available", async () => {
    await expect(
      openBasemapArchiveFile(new File(["x"], "world.mapbundle")),
    ).rejects.toBeInstanceOf(UnsupportedArchiveError);
  });
});
