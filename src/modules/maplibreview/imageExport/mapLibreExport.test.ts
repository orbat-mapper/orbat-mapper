import { describe, expect, it, vi } from "vitest";
import type { Map as MlMap } from "maplibre-gl";

const maplibreMock = vi.hoisted(() => {
  const instances: FakeMap[] = [];
  class FakeMap {
    options: Record<string, unknown>;
    setLayoutProperty = vi.fn();
    setPaintProperty = vi.fn();

    constructor(options: Record<string, unknown>) {
      this.options = options;
      instances.push(this);
    }

    on(event: string, callback: () => void) {
      if (event === "idle") queueMicrotask(callback);
      return this;
    }

    once(event: string, callback: () => void) {
      if (event === "load") queueMicrotask(callback);
      return this;
    }

    off() {
      return this;
    }

    remove() {}

    hasImage() {
      return false;
    }

    addImage() {}

    getCanvas() {
      const canvas = document.createElement("canvas");
      canvas.toBlob = (callback: BlobCallback) => callback(new Blob(["png"]));
      return canvas;
    }

    getStyle() {
      return this.options.style;
    }
  }

  return { FakeMap, instances };
});

vi.mock("maplibre-gl", () => ({
  default: { Map: maplibreMock.FakeMap },
}));

vi.mock("../symbolImageRegistry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../symbolImageRegistry")>();
  return {
    ...actual,
    getSymbolImageSource: vi.fn(),
  };
});

import {
  boundsFromViewportFrame,
  checkExportSize,
  getMapAttributionText,
  MAX_EXPORT_DIMENSION,
  pixelsFromPaperPreset,
  prepopulateSymbolImages,
  renderBoundsToBlob,
  renderViewportFrameToBlob,
} from "./mapLibreExport";
import {
  getSymbolImageSource,
  type MaplibreSymbolImageSource,
} from "../symbolImageRegistry";

function fakeImageData(): ImageData {
  return { width: 8, height: 8, data: new Uint8ClampedArray(8 * 8 * 4) } as ImageData;
}

describe("getMapAttributionText", () => {
  function fakeMap(
    sources: Record<string, unknown>,
    live: Record<string, { attribution?: string }> = {},
  ): MlMap {
    return {
      getStyle: () => ({ sources }),
      getSource: (id: string) => live[id],
    } as unknown as MlMap;
  }

  it("reads TileJSON-resolved attribution from the live source instance", () => {
    // The vector basemap spec carries no attribution; it resolves onto the
    // source instance — the case that previously rendered no credits.
    const map = fakeMap(
      { openmaptiles: { type: "vector", url: "https://example/tiles.json" } },
      { openmaptiles: { attribution: '<a href="#">OpenMapTiles</a>' } },
    );
    expect(getMapAttributionText(map)).toBe("OpenMapTiles");
  });

  it("falls back to inline spec attribution (raster basemaps)", () => {
    const map = fakeMap({
      sat: { type: "raster", attribution: "&copy; Imagery Co" },
    });
    expect(getMapAttributionText(map)).toBe("© Imagery Co");
  });

  it("de-duplicates and joins multiple sources", () => {
    const map = fakeMap(
      { a: { type: "vector" }, b: { type: "vector" }, c: { type: "vector" } },
      {
        a: { attribution: "OSM" },
        b: { attribution: "OSM" },
        c: { attribution: "Terrain" },
      },
    );
    expect(getMapAttributionText(map)).toBe("OSM · Terrain");
  });

  it("returns an empty string when nothing declares attribution", () => {
    const map = fakeMap({ a: { type: "vector" } });
    expect(getMapAttributionText(map)).toBe("");
  });
});

describe("pixelsFromPaperPreset", () => {
  it("computes A4 landscape at 300 DPI", () => {
    const px = pixelsFromPaperPreset("a4", 300, "landscape");
    // 297mm × 210mm at 300 DPI
    expect(px.width).toBe(Math.round((297 / 25.4) * 300));
    expect(px.height).toBe(Math.round((210 / 25.4) * 300));
  });

  it("computes Letter portrait at 150 DPI", () => {
    const px = pixelsFromPaperPreset("letter", 150, "portrait");
    expect(px.width).toBe(Math.round((215.9 / 25.4) * 150));
    expect(px.height).toBe(Math.round((279.4 / 25.4) * 150));
  });

  it("returns fixed dimensions for screen presets regardless of DPI", () => {
    expect(pixelsFromPaperPreset("uhd-4k", 72)).toEqual({ width: 3840, height: 2160 });
    expect(pixelsFromPaperPreset("slide-16-9", 600)).toEqual({
      width: 1920,
      height: 1080,
    });
  });
});

describe("checkExportSize", () => {
  it("accepts reasonable dimensions", () => {
    expect(checkExportSize(1920, 1080)).toBeNull();
  });

  it("rejects non-positive dimensions", () => {
    expect(checkExportSize(0, 100)).toMatch(/positive/);
    expect(checkExportSize(100, -1)).toMatch(/positive/);
  });

  it("rejects dimensions exceeding the per-side limit", () => {
    expect(checkExportSize(MAX_EXPORT_DIMENSION + 1, 100)).toMatch(/Maximum dimension/);
  });

  it("rejects total pixel counts above the cap", () => {
    expect(checkExportSize(10000, 10000)).toMatch(/too large/);
  });
});

describe("boundsFromViewportFrame", () => {
  it("converts a screen frame to southwest and northeast map bounds", () => {
    const map = {
      unproject: vi
        .fn()
        .mockReturnValueOnce({ lng: 10, lat: 60 })
        .mockReturnValueOnce({ lng: 22, lat: 58 })
        .mockReturnValueOnce({ lng: 20, lat: 50 })
        .mockReturnValueOnce({ lng: 8, lat: 52 }),
    } as unknown as MlMap;

    expect(
      boundsFromViewportFrame(map, { x: 100, y: 200, width: 300, height: 400 }),
    ).toEqual([
      [8, 50],
      [22, 60],
    ]);
    expect(map.unproject).toHaveBeenNthCalledWith(1, [100, 200]);
    expect(map.unproject).toHaveBeenNthCalledWith(2, [400, 200]);
    expect(map.unproject).toHaveBeenNthCalledWith(3, [400, 600]);
    expect(map.unproject).toHaveBeenNthCalledWith(4, [100, 600]);
  });
});

describe("renderViewportFrameToBlob", () => {
  it("renders the hidden map at frame size, not full viewport size", async () => {
    maplibreMock.instances.length = 0;
    const sourceMap = {
      getStyle: vi.fn(() => ({ version: 8, sources: {}, layers: [] })),
      getZoom: vi.fn(() => 7),
      getBearing: vi.fn(() => 0),
      getPitch: vi.fn(() => 0),
      unproject: vi.fn(() => ({ lng: 10, lat: 20 })),
      getCanvas: vi.fn(() => ({ clientWidth: 5000, clientHeight: 5000 })),
    } as unknown as MlMap;

    await expect(
      renderViewportFrameToBlob(
        sourceMap,
        { x: 100, y: 200, width: 1282, height: 1282 },
        { outputScale: 2 },
      ),
    ).resolves.toBeInstanceOf(Blob);

    expect(sourceMap.unproject).toHaveBeenCalledWith([741, 841]);
    expect(sourceMap.getCanvas).not.toHaveBeenCalled();
    expect(maplibreMock.instances).toHaveLength(1);
    const container = maplibreMock.instances[0].options.container as HTMLDivElement;
    expect(container.style.width).toBe("1282px");
    expect(container.style.height).toBe("1282px");
    expect(maplibreMock.instances[0].options.pixelRatio).toBe(2);
  });
});

describe("renderBoundsToBlob", () => {
  it("can render at layout size while regenerating symbols at a separate pixel ratio", async () => {
    maplibreMock.instances.length = 0;
    const sourceMap = {
      getStyle: vi.fn(() => ({
        version: 8,
        sources: {},
        layers: [
          {
            id: "unitLayer",
            type: "symbol",
            layout: { "text-size": 12 },
            paint: { "text-halo-width": 1.75, "text-halo-blur": 0.6 },
          },
        ],
      })),
      getBearing: vi.fn(() => 0),
      getPitch: vi.fn(() => 0),
      getImage: vi.fn(),
    } as unknown as MlMap;
    const source: MaplibreSymbolImageSource = {
      usedImageIds: () => ["sym-1"],
      renderImage: vi.fn(async (_id, pixelRatio) => ({
        data: fakeImageData(),
        pixelRatio,
      })),
    };
    vi.mocked(getSymbolImageSource).mockReturnValueOnce(source);

    await renderBoundsToBlob(sourceMap, {
      bounds: [
        [10, 50],
        [20, 60],
      ],
      width: 3840,
      height: 2160,
      outputScale: 1,
      symbolPixelRatio: 4,
      symbolDisplayScale: 4,
    });

    expect(maplibreMock.instances[0].options.pixelRatio).toBe(1);
    expect(source.renderImage).toHaveBeenCalledWith("sym-1", 4);
    expect(maplibreMock.instances[0].setLayoutProperty).toHaveBeenCalledWith(
      "unitLayer",
      "icon-size",
      4,
    );
    expect(maplibreMock.instances[0].setLayoutProperty).toHaveBeenCalledWith(
      "unitLayer",
      "text-size",
      48,
    );
  });
});

describe("prepopulateSymbolImages", () => {
  function createTargetMap() {
    const images = new Set<string>();
    return {
      images,
      map: {
        hasImage: (id: string) => images.has(id),
        addImage: vi.fn((id: string) => images.add(id)),
        getImage: vi.fn(() => undefined),
      } as unknown as MlMap,
    };
  }

  it("regenerates symbols at the export render scale instead of copying", async () => {
    const target = createTargetMap();
    const source: MaplibreSymbolImageSource = {
      usedImageIds: () => ["sym-1"],
      renderImage: vi.fn(async (_id, pixelRatio) => ({
        data: fakeImageData(),
        pixelRatio,
      })),
    };
    await prepopulateSymbolImages(target.map, source, 4);

    expect(source.renderImage).toHaveBeenCalledWith("sym-1", 4);
    expect(target.map.addImage).toHaveBeenCalledWith("sym-1", expect.any(Object), {
      pixelRatio: 4,
    });
  });

  it("reports symbol regeneration failures instead of copying blurry on-screen bitmaps", async () => {
    const target = createTargetMap();
    const source: MaplibreSymbolImageSource = {
      usedImageIds: () => ["sym-1"],
      renderImage: vi.fn(async () => null),
    };

    await expect(prepopulateSymbolImages(target.map, source, 4)).rejects.toThrow(
      /Could not render high-resolution map symbol/,
    );

    expect(target.map.addImage).not.toHaveBeenCalled();
  });

  it("skips ids the target map already has", async () => {
    const target = createTargetMap();
    target.images.add("sym-1");
    const source: MaplibreSymbolImageSource = {
      usedImageIds: () => ["sym-1"],
      renderImage: vi.fn(async () => ({ data: fakeImageData(), pixelRatio: 4 })),
    };
    await prepopulateSymbolImages(target.map, source, 4);

    expect(source.renderImage).not.toHaveBeenCalled();
    expect(target.map.addImage).not.toHaveBeenCalled();
  });
});
