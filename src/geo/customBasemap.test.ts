import { describe, expect, it } from "vitest";
import {
  customBasemapFromUrl,
  customBasemapSourceType,
  customBasemapTitle,
  customBasemapToLayerConfig,
  isCustomBasemapName,
} from "./customBasemap";

describe("customBasemapSourceType", () => {
  it("recognises a tile template by its placeholders", () => {
    expect(customBasemapSourceType("https://tiles.example.lan/{z}/{x}/{y}.png")).toBe(
      "raster",
    );
  });

  it("recognises a PMTiles archive by its extension", () => {
    expect(customBasemapSourceType("https://example.lan/denmark.pmtiles")).toBe(
      "pmtiles",
    );
  });

  it("ignores a query string when it reads the extension", () => {
    expect(customBasemapSourceType("https://example.lan/denmark.pmtiles?v=2")).toBe(
      "pmtiles",
    );
  });

  it("treats everything else as a style", () => {
    expect(customBasemapSourceType("https://tiles.example.lan/style.json")).toBe("style");
    expect(customBasemapSourceType("https://tiles.example.lan/styles/positron")).toBe(
      "style",
    );
  });
});

describe("customBasemapTitle", () => {
  it("uses the host and the last part of the path", () => {
    expect(customBasemapTitle("https://tiles.example.lan/styles/positron")).toBe(
      "tiles.example.lan/positron",
    );
  });

  it("uses the host alone when there is no path", () => {
    expect(customBasemapTitle("https://tiles.example.lan/")).toBe("tiles.example.lan");
  });

  it("keeps the port, because that is what distinguishes two servers on one machine", () => {
    expect(customBasemapTitle("http://192.168.1.10:8080/style.json")).toBe(
      "192.168.1.10:8080/style.json",
    );
  });
});

describe("customBasemapFromUrl", () => {
  it("refuses an empty address", () => {
    const result = customBasemapFromUrl("   ");
    expect(result).toEqual({ ok: false, message: "Type the address of a map server." });
  });

  it("refuses text that is not an address", () => {
    const result = customBasemapFromUrl("tiles.example.lan");
    expect(result.ok).toBe(false);
  });

  it("sends a file: address to the file picker instead", () => {
    const result = customBasemapFromUrl("file:///home/user/denmark.pmtiles");
    expect(result).toEqual({
      ok: false,
      message: "Use Open map file… for a file on your disk.",
    });
  });

  it("refuses a protocol that is not http or https", () => {
    const result = customBasemapFromUrl("ftp://example.lan/style.json");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("ftp:");
  });

  it("accepts a plain http address, because a tile server on a network is usually http", () => {
    const result = customBasemapFromUrl("http://192.168.1.10:8080/style.json");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.basemap).toEqual({
      name: "custom:http://192.168.1.10:8080/style.json",
      title: "192.168.1.10:8080/style.json",
      url: "http://192.168.1.10:8080/style.json",
      sourceType: "style",
    });
    expect(isCustomBasemapName(result.basemap.name)).toBe(true);
  });

  it("keeps a title the user typed", () => {
    const result = customBasemapFromUrl("https://example.lan/style.json", "  Ops room  ");
    expect(result.ok && result.basemap.title).toBe("Ops room");
  });

  it("falls back to the derived title when the typed one is blank", () => {
    const result = customBasemapFromUrl("https://example.lan/style.json", "   ");
    expect(result.ok && result.basemap.title).toBe("example.lan/style.json");
  });

  it("trims the address, so a pasted one with a trailing space still works", () => {
    const result = customBasemapFromUrl(" https://example.lan/style.json ");
    expect(result.ok && result.basemap.url).toBe("https://example.lan/style.json");
  });
});

describe("customBasemapToLayerConfig", () => {
  it("makes a style layer", () => {
    const config = customBasemapToLayerConfig({
      name: "custom:https://example.lan/style.json",
      title: "example.lan",
      url: "https://example.lan/style.json",
      sourceType: "style",
    });

    expect(config).toEqual({
      name: "custom:https://example.lan/style.json",
      title: "example.lan",
      custom: true,
      sourceType: "style",
      styleUrl: "https://example.lan/style.json",
    });
  });

  it("makes a raster layer whose one tile template is the address", () => {
    const config = customBasemapToLayerConfig({
      name: "custom:https://example.lan/{z}/{x}/{y}.png",
      title: "example.lan",
      url: "https://example.lan/{z}/{x}/{y}.png",
      sourceType: "raster",
    });

    expect(config).toMatchObject({
      sourceType: "raster",
      tiles: ["https://example.lan/{z}/{x}/{y}.png"],
      custom: true,
    });
  });

  it("makes a pmtiles layer with a url, so the header is read like any declared archive", () => {
    const config = customBasemapToLayerConfig({
      name: "custom:https://example.lan/denmark.pmtiles",
      title: "example.lan",
      url: "https://example.lan/denmark.pmtiles",
      sourceType: "pmtiles",
    });

    expect(config).toMatchObject({
      sourceType: "pmtiles",
      url: "https://example.lan/denmark.pmtiles",
      custom: true,
    });
  });
});
