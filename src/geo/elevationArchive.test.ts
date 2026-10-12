import { describe, expect, it } from "vitest";
import { TileType, type Header } from "pmtiles";
import { UnsupportedArchiveError } from "@/geo/basemapArchive";
import {
  CONFIG_ELEVATION_ARCHIVE_KEY,
  describeElevationArchive,
  ELEVATION_ARCHIVE_KEY,
  elevationSourceSpec,
} from "@/geo/elevationArchive";
import { archiveSourceUrl } from "@/geo/pmtilesProtocol";

function header(tileType: TileType): Header {
  return { tileType, minZoom: 0, maxZoom: 12 } as Header;
}

describe("describeElevationArchive", () => {
  it.each([TileType.Png, TileType.Webp])("accepts tile type %i", (tileType) => {
    expect(describeElevationArchive(header(tileType), {})).toEqual({
      encoding: "terrarium",
      attribution: undefined,
    });
  });

  it.each([TileType.Mvt, TileType.Jpeg, TileType.Avif])(
    "refuses tile type %i as elevation data",
    (tileType) => {
      expect(() => describeElevationArchive(header(tileType), {}, "x.pmtiles")).toThrow(
        UnsupportedArchiveError,
      );
    },
  );

  it("reads the encoding and attribution from the archive metadata", () => {
    const info = describeElevationArchive(header(TileType.Png), {
      encoding: "mapbox",
      attribution: "© Somebody",
    });
    expect(info).toEqual({ encoding: "mapbox", attribution: "© Somebody" });
  });

  it("ignores an unknown encoding", () => {
    expect(
      describeElevationArchive(header(TileType.Webp), { encoding: "lerc" }).encoding,
    ).toBe("terrarium");
  });
});

describe("elevationSourceSpec", () => {
  it("serves the archive under the elevation key with the encoding the app sets", () => {
    expect(
      elevationSourceSpec({ encoding: "terrarium", attribution: "© Mapterhorn" }, 256),
    ).toEqual({
      type: "raster-dem",
      url: archiveSourceUrl(ELEVATION_ARCHIVE_KEY),
      encoding: "terrarium",
      tileSize: 256,
      attribution: "© Mapterhorn",
    });
  });

  it("serves the configured archive under its own key", () => {
    expect(
      elevationSourceSpec({ encoding: "terrarium" }, 512, CONFIG_ELEVATION_ARCHIVE_KEY)
        .url,
    ).toBe(archiveSourceUrl(CONFIG_ELEVATION_ARCHIVE_KEY));
    expect(CONFIG_ELEVATION_ARCHIVE_KEY).not.toBe(ELEVATION_ARCHIVE_KEY);
  });

  it("uses no attribution when the archive carries none", () => {
    expect(elevationSourceSpec({ encoding: "terrarium" })).not.toHaveProperty(
      "attribution",
    );
  });
});
