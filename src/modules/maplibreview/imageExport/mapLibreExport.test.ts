import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
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
      canvas.toBlob = (callback: BlobCallback) => {
        const blob = new Blob(["png"]);
        // jsdom's Blob lacks arrayBuffer in some versions; stub it so the
        // export pipeline (which converts the rendered blob into bytes for the
        // zip) can run in the test environment.
        if (typeof blob.arrayBuffer !== "function") {
          (blob as unknown as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer =
            async () =>
              new TextEncoder().encode("png").buffer as ArrayBuffer;
        }
        callback(blob);
      };
      return canvas;
    }

    getStyle() {
      return this.options.style;
    }

    getBounds() {
      return {
        getWest: () => -10,
        getSouth: () => 40,
        getEast: () => 10,
        getNorth: () => 50,
      };
    }

    getBearing() {
      return 0;
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

vi.mock("@/utils/files", () => ({
  saveBlobToLocalFile: vi.fn(),
}));

// fflate is faked here because jsdom 27 puts Uint8Array on a different realm
// than fflate's module-level reference; that breaks fflate's internal
// `instanceof Uint8Array` checks, so its real zipSync silently produces an
// unreadable zip when run under vitest+jsdom. The stub captures the input map
// so the tests can assert what we tried to bundle without depending on
// fflate's runtime behavior here. (Production runs in a single realm and is
// unaffected.)
vi.mock("fflate", () => ({
  zipSync: vi.fn(
    (_files: Record<string, Uint8Array>) =>
      // 22-byte empty-archive end-of-central-directory record. Just enough for
      // downstream code to wrap it in a Blob without choking.
      new Uint8Array([
        0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      ]),
  ),
  strToU8: (s: string) => new TextEncoder().encode(s),
  // Identity for the same realm-collision reason as zipSync; the GeoTIFF
  // tests below just verify structure, not the compressed strip's contents.
  zlibSync: (data: Uint8Array) => data,
}));
import { zipSync } from "fflate";
import {
  boundsFromViewportFrame,
  buildGeoreferencedZipBytes,
  checkExportSize,
  exportViewportFrame,
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
import { saveBlobToLocalFile } from "@/utils/files";
import {
  mercatorBoundsFromLngLat,
  serializeWorldFile,
  WEB_MERCATOR_WKT,
  worldFileFromMercatorBounds,
} from "./worldFile";

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

describe("buildGeoreferencedZipBytes", () => {
  // fflate's `Zippable` allows nested folder maps; in this codepath every
  // value is a flat byte array, so this narrow cast keeps the test readable.
  type ZipFileMap = Record<string, Uint8Array>;

  function decode(u8: Uint8Array): string {
    return new TextDecoder().decode(u8);
  }

  it("bundles png, pgw and PAM aux.xml entries keyed by the given base name", () => {
    const png = new Uint8Array([137, 80, 78, 71]); // PNG magic bytes; content is opaque to the bundler.
    vi.mocked(zipSync).mockClear();

    buildGeoreferencedZipBytes(
      png,
      { west: -10, south: 40, east: 10, north: 50 },
      300,
      150,
      "scenario",
    );

    expect(zipSync).toHaveBeenCalledTimes(1);
    const [filesArg, options] = vi.mocked(zipSync).mock.calls[0];
    const files = filesArg as ZipFileMap;
    expect(Object.keys(files).sort()).toEqual([
      "scenario.pgw",
      "scenario.png",
      "scenario.png.aux.xml",
    ]);
    expect(files["scenario.png"]).toBe(png);
    // PAM sidecar must wrap the WKT in <PAMDataset><SRS>…</SRS></PAMDataset>
    // with the GDAL ≥ 3.0 axis-mapping attribute, otherwise QGIS/GDAL won't
    // pick up the CRS from a raster.
    const auxXml = decode(files["scenario.png.aux.xml"]);
    expect(auxXml).toContain("<PAMDataset>");
    expect(auxXml).toContain('dataAxisToSRSAxisMapping="1,2"');
    expect(auxXml).toContain(WEB_MERCATOR_WKT);
    // Store-only: PNG is already compressed and the sidecars are tiny.
    expect(options).toMatchObject({ level: 0 });
  });

  it("embeds a world file derived from the supplied bounds and pixel size", () => {
    vi.mocked(zipSync).mockClear();

    buildGeoreferencedZipBytes(
      new Uint8Array(0),
      { west: -10, south: 40, east: 10, north: 50 },
      300,
      150,
      "scenario",
    );

    const expectedWorldFile = serializeWorldFile(
      worldFileFromMercatorBounds(
        mercatorBoundsFromLngLat({ west: -10, south: 40, east: 10, north: 50 }),
        300,
        150,
      ),
    );
    const [filesArg] = vi.mocked(zipSync).mock.calls[0];
    expect(decode((filesArg as ZipFileMap)["scenario.pgw"])).toBe(expectedWorldFile);
  });
});

describe("exportViewportFrame (georeferenced)", () => {
  function sourceMapForFrame() {
    return {
      getStyle: vi.fn(() => ({ version: 8, sources: {}, layers: [] })),
      getZoom: vi.fn(() => 7),
      getBearing: vi.fn(() => 0),
      getPitch: vi.fn(() => 0),
      unproject: vi.fn(() => ({ lng: 10, lat: 20 })),
    } as unknown as MlMap;
  }

  it("saves the bundle under a .zip filename derived from the user's name", async () => {
    maplibreMock.instances.length = 0;
    vi.mocked(saveBlobToLocalFile).mockClear();

    await exportViewportFrame(
      sourceMapForFrame(),
      { x: 0, y: 0, width: 600, height: 400 },
      { outputFormat: "world-file-zip", fileName: "scenario" },
    );

    expect(saveBlobToLocalFile).toHaveBeenCalledTimes(1);
    const [savedBlob, savedName] = vi.mocked(saveBlobToLocalFile).mock.calls[0];
    expect(savedName).toBe("scenario.zip");
    expect(savedBlob).toBeInstanceOf(Blob);
    expect((savedBlob as Blob).type).toBe("application/zip");
  });

  it("strips a .png suffix from the user-supplied name before adding .zip", async () => {
    maplibreMock.instances.length = 0;
    vi.mocked(saveBlobToLocalFile).mockClear();

    await exportViewportFrame(
      sourceMapForFrame(),
      { x: 0, y: 0, width: 600, height: 400 },
      { outputFormat: "world-file-zip", fileName: "scenario.png" },
    );

    const [, savedName] = vi.mocked(saveBlobToLocalFile).mock.calls[0];
    expect(savedName).toBe("scenario.zip");
  });

  it("forces north-up rendering (bearing/pitch zero) when georeferenced", async () => {
    maplibreMock.instances.length = 0;
    const sourceMap = {
      getStyle: vi.fn(() => ({ version: 8, sources: {}, layers: [] })),
      getZoom: vi.fn(() => 7),
      getBearing: vi.fn(() => 45),
      getPitch: vi.fn(() => 30),
      unproject: vi.fn(() => ({ lng: 10, lat: 20 })),
    } as unknown as MlMap;

    await exportViewportFrame(
      sourceMap,
      { x: 0, y: 0, width: 600, height: 400 },
      { outputFormat: "world-file-zip", resetRotation: false, fileName: "scenario" },
    );

    expect(maplibreMock.instances[0].options.bearing).toBe(0);
    expect(maplibreMock.instances[0].options.pitch).toBe(0);
  });
});

describe("exportViewportFrame (geotiff)", () => {
  // The GeoTIFF path copies the rendered canvas into an offscreen 2D canvas to
  // read RGBA bytes. jsdom doesn't ship a 2D context, so stub the relevant
  // methods just for these tests.
  let canvasGetContextSpy: ReturnType<typeof vi.spyOn> | null = null;
  beforeAll(() => {
    const proto = HTMLCanvasElement.prototype;
    const original = proto.getContext;
    canvasGetContextSpy = vi
      .spyOn(proto, "getContext")
      .mockImplementation(function (this: HTMLCanvasElement, type: string, ...rest) {
        if (type === "2d") {
          return {
            drawImage: () => {},
            getImageData: (_x: number, _y: number, w: number, h: number) => ({
              width: w,
              height: h,
              data: new Uint8ClampedArray(w * h * 4),
              colorSpace: "srgb" as const,
            }),
          } as unknown as CanvasRenderingContext2D;
        }
        return original.call(this, type, ...rest);
      });
  });
  afterAll(() => canvasGetContextSpy?.mockRestore());

  function sourceMapForFrame() {
    return {
      getStyle: vi.fn(() => ({ version: 8, sources: {}, layers: [] })),
      getZoom: vi.fn(() => 7),
      getBearing: vi.fn(() => 0),
      getPitch: vi.fn(() => 0),
      unproject: vi.fn(() => ({ lng: 10, lat: 20 })),
    } as unknown as MlMap;
  }

  async function bytesOf(blob: Blob): Promise<Uint8Array> {
    if (typeof blob.arrayBuffer === "function") {
      return new Uint8Array(await blob.arrayBuffer());
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
  }

  it("saves a .tif with image/tiff mime type", async () => {
    maplibreMock.instances.length = 0;
    vi.mocked(saveBlobToLocalFile).mockClear();

    await exportViewportFrame(
      sourceMapForFrame(),
      { x: 0, y: 0, width: 600, height: 400 },
      { outputFormat: "geotiff", fileName: "scenario" },
    );

    expect(saveBlobToLocalFile).toHaveBeenCalledTimes(1);
    const [savedBlob, savedName] = vi.mocked(saveBlobToLocalFile).mock.calls[0];
    expect(savedName).toBe("scenario.tif");
    expect(savedBlob).toBeInstanceOf(Blob);
    expect((savedBlob as Blob).type).toBe("image/tiff");
  });

  it("emits a little-endian TIFF whose first IFD sits at offset 8", async () => {
    maplibreMock.instances.length = 0;
    vi.mocked(saveBlobToLocalFile).mockClear();

    await exportViewportFrame(
      sourceMapForFrame(),
      { x: 0, y: 0, width: 600, height: 400 },
      { outputFormat: "geotiff", fileName: "scenario" },
    );

    const [savedBlob] = vi.mocked(saveBlobToLocalFile).mock.calls[0];
    const bytes = await bytesOf(savedBlob as Blob);
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(dv.getUint16(0, true)).toBe(0x4949); // "II" little-endian
    expect(dv.getUint16(2, true)).toBe(42); // TIFF magic
    expect(dv.getUint32(4, true)).toBe(8); // first IFD immediately follows the header
  });

  it("forces north-up rendering when GeoTIFF is selected", async () => {
    maplibreMock.instances.length = 0;
    const sourceMap = {
      getStyle: vi.fn(() => ({ version: 8, sources: {}, layers: [] })),
      getZoom: vi.fn(() => 7),
      getBearing: vi.fn(() => 45),
      getPitch: vi.fn(() => 30),
      unproject: vi.fn(() => ({ lng: 10, lat: 20 })),
    } as unknown as MlMap;

    await exportViewportFrame(
      sourceMap,
      { x: 0, y: 0, width: 600, height: 400 },
      { outputFormat: "geotiff", resetRotation: false, fileName: "scenario" },
    );

    expect(maplibreMock.instances[0].options.bearing).toBe(0);
    expect(maplibreMock.instances[0].options.pitch).toBe(0);
  });
});
