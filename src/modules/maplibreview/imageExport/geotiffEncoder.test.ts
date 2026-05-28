import { describe, expect, it, vi } from "vitest";

// The jsdom + fflate realm collision (see mapLibreExport.test.ts) makes the
// real zlibSync mis-identify our Uint8Array inputs. Replace it with an
// identity function: the strip then ends up holding the raw RGBA, which lets
// the tests below verify the TIFF structure end-to-end without inflating.
vi.mock("fflate", () => ({
  zlibSync: (data: Uint8Array) => data,
}));

import { encodeGeoTiff } from "@/modules/maplibreview/imageExport/geotiffEncoder";

const TAG = {
  ImageWidth: 256,
  ImageLength: 257,
  Compression: 259,
  PhotometricInterpretation: 262,
  StripOffsets: 273,
  SamplesPerPixel: 277,
  StripByteCounts: 279,
  ModelPixelScale: 33550,
  ModelTiepoint: 33922,
  GeoKeyDirectory: 34735,
  GeoAsciiParams: 34737,
};

type IFDEntry = {
  tag: number;
  type: number;
  count: number;
  valueOffset: number;
};

function readIFD(buf: Uint8Array): { entries: IFDEntry[]; dv: DataView } {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  expect(dv.getUint16(0, true)).toBe(0x4949); // "II" little-endian
  expect(dv.getUint16(2, true)).toBe(42);
  const ifdOffset = dv.getUint32(4, true);
  const count = dv.getUint16(ifdOffset, true);
  const entries: IFDEntry[] = [];
  for (let i = 0; i < count; i++) {
    const base = ifdOffset + 2 + i * 12;
    entries.push({
      tag: dv.getUint16(base, true),
      type: dv.getUint16(base + 2, true),
      count: dv.getUint32(base + 4, true),
      valueOffset: dv.getUint32(base + 8, true),
    });
  }
  return { entries, dv };
}

function getEntry(entries: IFDEntry[], tag: number): IFDEntry {
  const e = entries.find((x) => x.tag === tag);
  if (!e) throw new Error(`Tag ${tag} not found`);
  return e;
}

function readDoubles(dv: DataView, offset: number, count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(dv.getFloat64(offset + i * 8, true));
  return out;
}

function readShorts(dv: DataView, offset: number, count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(dv.getUint16(offset + i * 2, true));
  return out;
}

describe("encodeGeoTiff", () => {
  const width = 4;
  const height = 2;
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < rgba.length; i++) rgba[i] = i & 0xff;
  const bounds = { minX: 0, minY: 0, maxX: 1000, maxY: 500 };

  it("writes a valid little-endian TIFF header followed by one IFD", () => {
    const buf = encodeGeoTiff({ width, height, rgba, bounds, epsgCode: 3857 });
    const { entries, dv } = readIFD(buf);

    expect(entries.length).toBeGreaterThan(0);
    // IFD entries must be in ascending tag order.
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].tag).toBeGreaterThan(entries[i - 1].tag);
    }
    // After the last entry, the next-IFD pointer is zero (single IFD).
    const ifdOffset = dv.getUint32(4, true);
    const nextIfdAt = ifdOffset + 2 + entries.length * 12;
    expect(dv.getUint32(nextIfdAt, true)).toBe(0);
  });

  it("records the input dimensions in the baseline tags", () => {
    const buf = encodeGeoTiff({ width, height, rgba, bounds, epsgCode: 3857 });
    const { entries } = readIFD(buf);
    expect(getEntry(entries, TAG.ImageWidth).valueOffset).toBe(width);
    expect(getEntry(entries, TAG.ImageLength).valueOffset).toBe(height);
    expect(getEntry(entries, TAG.SamplesPerPixel).valueOffset).toBe(4);
    expect(getEntry(entries, TAG.PhotometricInterpretation).valueOffset).toBe(2);
    expect(getEntry(entries, TAG.Compression).valueOffset).toBe(8); // Adobe Deflate
  });

  it("places the strip at the recorded offset with the recorded byte count", () => {
    const buf = encodeGeoTiff({ width, height, rgba, bounds, epsgCode: 3857 });
    const { entries } = readIFD(buf);
    const offset = getEntry(entries, TAG.StripOffsets).valueOffset;
    const length = getEntry(entries, TAG.StripByteCounts).valueOffset;
    expect(offset).toBeGreaterThan(0);
    expect(length).toBe(rgba.length); // identity-mocked zlib

    const strip = buf.slice(offset, offset + length);
    expect(strip).toEqual(rgba);
  });

  it("derives ModelPixelScale and ModelTiepoint from the bounds", () => {
    const buf = encodeGeoTiff({ width, height, rgba, bounds, epsgCode: 3857 });
    const { entries, dv } = readIFD(buf);

    const scale = getEntry(entries, TAG.ModelPixelScale);
    const scaleVals = readDoubles(dv, scale.valueOffset, scale.count);
    // (maxX-minX)/width=250, (maxY-minY)/height=250, Sz=0.
    expect(scaleVals).toEqual([250, 250, 0]);

    const tie = getEntry(entries, TAG.ModelTiepoint);
    const tieVals = readDoubles(dv, tie.valueOffset, tie.count);
    // Raster origin (0,0,0) anchored to upper-left of the mercator bbox.
    expect(tieVals).toEqual([0, 0, 0, bounds.minX, bounds.maxY, 0]);
  });

  it("declares the projected CRS via ProjectedCSTypeGeoKey", () => {
    const buf = encodeGeoTiff({ width, height, rgba, bounds, epsgCode: 3857 });
    const { entries, dv } = readIFD(buf);

    const dir = getEntry(entries, TAG.GeoKeyDirectory);
    const keys = readShorts(dv, dir.valueOffset, dir.count);
    // Header is the first 4 SHORTs: version, revision, minor, key count.
    expect(keys[0]).toBe(1);
    expect(keys[3]).toBe(4);

    // Look up the ProjectedCSType key (3072) and read its inline value.
    for (let i = 4; i < keys.length; i += 4) {
      if (keys[i] === 3072) {
        expect(keys[i + 1]).toBe(0); // inline
        expect(keys[i + 2]).toBe(1);
        expect(keys[i + 3]).toBe(3857);
        return;
      }
    }
    throw new Error("ProjectedCSTypeGeoKey not found in GeoKeyDirectory");
  });

  it("writes a citation string into GeoAsciiParams terminated by '|\\0'", () => {
    const buf = encodeGeoTiff({
      width,
      height,
      rgba,
      bounds,
      epsgCode: 3857,
      citation: "Test CRS",
    });
    const { entries } = readIFD(buf);
    const ascii = getEntry(entries, TAG.GeoAsciiParams);
    const text = new TextDecoder().decode(
      buf.slice(ascii.valueOffset, ascii.valueOffset + ascii.count),
    );
    expect(text).toBe("Test CRS|\0");
  });

  it("aligns out-of-line tag data on word boundaries", () => {
    const buf = encodeGeoTiff({ width, height, rgba, bounds, epsgCode: 3857 });
    const { entries } = readIFD(buf);
    for (const e of entries) {
      // Any entry whose value exceeds 4 bytes is stored at an offset, which
      // the TIFF spec requires to be on a word (even) boundary.
      const size =
        e.count *
        ({ 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 12: 8 } as Record<number, number>)[e.type];
      if (size > 4) expect(e.valueOffset % 2).toBe(0);
    }
  });

  it("rejects an RGBA buffer whose length does not match width × height × 4", () => {
    expect(() =>
      encodeGeoTiff({
        width: 4,
        height: 2,
        rgba: new Uint8Array(10),
        bounds,
        epsgCode: 3857,
      }),
    ).toThrow();
  });
});
