/**
 * Minimal hand-rolled TIFF/GeoTIFF encoder for the image-export pipeline.
 *
 * Writes a little-endian, single-IFD TIFF holding 8-bit RGBA in one
 * DEFLATE-compressed strip plus the GeoTIFF tags needed to anchor the raster
 * in a projected CRS (EPSG code referenced via the GeoKey directory).
 *
 * The scope is deliberately narrow: one image, RGBA, axis-aligned, one CRS
 * family (Projected, e.g. EPSG:3857). That avoids pulling in geotiff.js (~50KB
 * gzipped + an experimental writer) and lets us emit exactly the tag set we
 * want for QGIS / ArcGIS / GDAL round-trips.
 *
 * Format references:
 * - TIFF 6.0 spec — overall container, IFD layout, baseline tags.
 * - GeoTIFF 1.0 / OGC 19-008r4 — ModelPixelScale, ModelTiepoint, GeoKeys.
 */

import { zlibSync } from "fflate";
import type { MercatorBounds } from "@/modules/maplibreview/imageExport/worldFile";

const TIFF_HEADER_SIZE = 8;
const IFD_ENTRY_SIZE = 12;

/** TIFF field types. Values match the on-disk tag-type codes. */
const T = {
  BYTE: 1,
  ASCII: 2,
  SHORT: 3,
  LONG: 4,
  RATIONAL: 5,
  DOUBLE: 12,
} as const;

type FieldType = (typeof T)[keyof typeof T];

const TYPE_SIZE: Record<FieldType, number> = {
  [T.BYTE]: 1,
  [T.ASCII]: 1,
  [T.SHORT]: 2,
  [T.LONG]: 4,
  [T.RATIONAL]: 8,
  [T.DOUBLE]: 8,
};

/** Baseline + GeoTIFF tag IDs used by this encoder. */
const TAG = {
  ImageWidth: 256,
  ImageLength: 257,
  BitsPerSample: 258,
  Compression: 259,
  PhotometricInterpretation: 262,
  StripOffsets: 273,
  SamplesPerPixel: 277,
  RowsPerStrip: 278,
  StripByteCounts: 279,
  XResolution: 282,
  YResolution: 283,
  PlanarConfiguration: 284,
  ResolutionUnit: 296,
  ExtraSamples: 338,
  ModelPixelScale: 33550,
  ModelTiepoint: 33922,
  GeoKeyDirectory: 34735,
  GeoAsciiParams: 34737,
} as const;

/** GeoKey IDs (see GeoTIFF spec section 6.2). */
const KEY = {
  GTModelType: 1024,
  GTRasterType: 1025,
  GTCitation: 1026,
  ProjectedCSType: 3072,
} as const;

interface IFDEntry {
  tag: number;
  type: FieldType;
  count: number;
  /** Already serialised value bytes; length must equal count × TYPE_SIZE[type]. */
  bytes: Uint8Array;
}

const textEncoder = new TextEncoder();

function packShorts(values: readonly number[]): Uint8Array {
  const buf = new Uint8Array(values.length * 2);
  const dv = new DataView(buf.buffer);
  for (let i = 0; i < values.length; i++) dv.setUint16(i * 2, values[i], true);
  return buf;
}

function packLongs(values: readonly number[]): Uint8Array {
  const buf = new Uint8Array(values.length * 4);
  const dv = new DataView(buf.buffer);
  for (let i = 0; i < values.length; i++) dv.setUint32(i * 4, values[i], true);
  return buf;
}

function packDoubles(values: readonly number[]): Uint8Array {
  const buf = new Uint8Array(values.length * 8);
  const dv = new DataView(buf.buffer);
  for (let i = 0; i < values.length; i++) dv.setFloat64(i * 8, values[i], true);
  return buf;
}

function packRational(numerator: number, denominator: number): Uint8Array {
  const buf = new Uint8Array(8);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, numerator, true);
  dv.setUint32(4, denominator, true);
  return buf;
}

/** Null-terminated TIFF ASCII value (the trailing `\0` is part of the count). */
function packAscii(text: string): Uint8Array {
  return textEncoder.encode(text + "\0");
}

export interface EncodeGeoTiffOptions {
  width: number;
  height: number;
  /** Tightly packed 8-bit RGBA, length must be width × height × 4. */
  rgba: Uint8Array;
  /** Raster extent in the target CRS, used to derive the affine. */
  bounds: MercatorBounds;
  /**
   * EPSG code of a projected CRS. Written as ProjectedCSTypeGeoKey so GIS
   * tools can resolve the full CRS without GeoDoubleParams gymnastics.
   */
  epsgCode: number;
  /**
   * Short human-readable name written as GTCitationGeoKey (free-form). Helps
   * GIS tools display a friendly CRS label.
   */
  citation?: string;
}

/**
 * Build a GeoTIFF byte buffer from an RGBA raster and a CRS-anchored bounds.
 *
 * Layout:
 *   header (8) → IFD → out-of-line tag data (word-aligned) → strip data
 *
 * The IFD's entries are emitted in ascending tag order (TIFF requirement).
 * Values that don't fit in the 4-byte value/offset field are written
 * out-of-line in the order they appear in the IFD.
 */
export function encodeGeoTiff(opts: EncodeGeoTiffOptions): Uint8Array {
  const { width, height, rgba, bounds, epsgCode } = opts;
  const citation = opts.citation ?? `EPSG:${epsgCode}`;

  if (width < 1 || height < 1) {
    throw new Error("GeoTIFF requires positive image dimensions.");
  }
  if (rgba.length !== width * height * 4) {
    throw new Error(`RGBA length ${rgba.length} does not match ${width}×${height}×4.`);
  }

  // Affine: north-up axis-aligned, origin at the upper-left pixel's *corner*
  // (RasterPixelIsArea — see GTRasterTypeGeoKey below).
  const pixelSizeX = (bounds.maxX - bounds.minX) / width;
  const pixelSizeY = (bounds.maxY - bounds.minY) / height;
  const modelPixelScale = [pixelSizeX, pixelSizeY, 0];
  const modelTiepoint = [0, 0, 0, bounds.minX, bounds.maxY, 0];

  // GeoAsciiParams holds pipe-terminated strings; the count for an ASCII
  // GeoKey is the byte length *including* the pipe terminator.
  const citationWithPipe = citation + "|";
  const citationByteLength = textEncoder.encode(citationWithPipe).length;
  const geoAsciiBytes = packAscii(citationWithPipe);

  // GeoKey directory: 4-SHORT header + 4 SHORTs per key.
  // For inline (location=0) keys, "value" is the actual GeoKey value.
  // For ASCII keys, "location" is the tag id that holds the strings (34737)
  // and "value" is the offset (in bytes) into that tag's data.
  const geoKeys = [
    1,
    1,
    1,
    4, // KeyDirectoryVersion=1, KeyRevision=1, MinorRevision=1, NumberOfKeys=4
    KEY.GTModelType,
    0,
    1,
    1, // 1 = ModelTypeProjected
    KEY.GTRasterType,
    0,
    1,
    1, // 1 = RasterPixelIsArea
    KEY.GTCitation,
    TAG.GeoAsciiParams,
    citationByteLength,
    0,
    KEY.ProjectedCSType,
    0,
    1,
    epsgCode,
  ];

  // Compress the strip up-front so we know its byte count for the IFD.
  // Adobe Deflate (TIFF Compression code 8) expects a zlib stream (the RFC
  // 1950 wrapper around RFC 1951 DEFLATE), which is what fflate's zlibSync
  // emits.
  const stripData = zlibSync(rgba);

  // Build IFD entries in ascending tag order. StripOffsets is filled in once
  // we know where the strip actually lands (after the IFD + out-of-line data).
  const stripOffsetsEntry: IFDEntry = {
    tag: TAG.StripOffsets,
    type: T.LONG,
    count: 1,
    bytes: packLongs([0]),
  };

  const entries: IFDEntry[] = [
    { tag: TAG.ImageWidth, type: T.LONG, count: 1, bytes: packLongs([width]) },
    { tag: TAG.ImageLength, type: T.LONG, count: 1, bytes: packLongs([height]) },
    {
      tag: TAG.BitsPerSample,
      type: T.SHORT,
      count: 4,
      bytes: packShorts([8, 8, 8, 8]),
    },
    { tag: TAG.Compression, type: T.SHORT, count: 1, bytes: packShorts([8]) },
    {
      tag: TAG.PhotometricInterpretation,
      type: T.SHORT,
      count: 1,
      bytes: packShorts([2]),
    },
    stripOffsetsEntry,
    { tag: TAG.SamplesPerPixel, type: T.SHORT, count: 1, bytes: packShorts([4]) },
    { tag: TAG.RowsPerStrip, type: T.LONG, count: 1, bytes: packLongs([height]) },
    {
      tag: TAG.StripByteCounts,
      type: T.LONG,
      count: 1,
      bytes: packLongs([stripData.length]),
    },
    { tag: TAG.XResolution, type: T.RATIONAL, count: 1, bytes: packRational(72, 1) },
    { tag: TAG.YResolution, type: T.RATIONAL, count: 1, bytes: packRational(72, 1) },
    {
      tag: TAG.PlanarConfiguration,
      type: T.SHORT,
      count: 1,
      bytes: packShorts([1]),
    },
    { tag: TAG.ResolutionUnit, type: T.SHORT, count: 1, bytes: packShorts([2]) },
    // 2 = unassociated (straight) alpha — what HTML canvas getImageData emits.
    { tag: TAG.ExtraSamples, type: T.SHORT, count: 1, bytes: packShorts([2]) },
    {
      tag: TAG.ModelPixelScale,
      type: T.DOUBLE,
      count: 3,
      bytes: packDoubles(modelPixelScale),
    },
    {
      tag: TAG.ModelTiepoint,
      type: T.DOUBLE,
      count: 6,
      bytes: packDoubles(modelTiepoint),
    },
    {
      tag: TAG.GeoKeyDirectory,
      type: T.SHORT,
      count: geoKeys.length,
      bytes: packShorts(geoKeys),
    },
    {
      tag: TAG.GeoAsciiParams,
      type: T.ASCII,
      count: geoAsciiBytes.length,
      bytes: geoAsciiBytes,
    },
  ];

  // Layout. The TIFF spec requires out-of-line values to start on a word
  // boundary (even offset); pad whenever the cursor lands on an odd byte.
  const ifdStart = TIFF_HEADER_SIZE;
  const ifdSize = 2 + entries.length * IFD_ENTRY_SIZE + 4;
  let cursor = ifdStart + ifdSize;

  const outOfLineOffsets = new Map<IFDEntry, number>();
  for (const e of entries) {
    if (e.bytes.length <= 4) continue;
    if (cursor % 2 !== 0) cursor++;
    outOfLineOffsets.set(e, cursor);
    cursor += e.bytes.length;
  }
  if (cursor % 2 !== 0) cursor++;
  const stripOffset = cursor;
  stripOffsetsEntry.bytes = packLongs([stripOffset]);

  const totalSize = stripOffset + stripData.length;
  const buf = new Uint8Array(totalSize);
  const dv = new DataView(buf.buffer);

  // Header: little-endian ("II"), magic 42, offset to first IFD.
  buf[0] = 0x49;
  buf[1] = 0x49;
  dv.setUint16(2, 42, true);
  dv.setUint32(4, ifdStart, true);

  // IFD: entry count, entries, next-IFD pointer (0 = none).
  dv.setUint16(ifdStart, entries.length, true);
  let entryCursor = ifdStart + 2;
  for (const e of entries) {
    dv.setUint16(entryCursor, e.tag, true);
    dv.setUint16(entryCursor + 2, e.type, true);
    dv.setUint32(entryCursor + 4, e.count, true);
    if (e.bytes.length <= 4) {
      // Inline: bytes occupy the leftmost portion of the 4-byte value field.
      buf.set(e.bytes, entryCursor + 8);
    } else {
      dv.setUint32(entryCursor + 8, outOfLineOffsets.get(e)!, true);
    }
    entryCursor += IFD_ENTRY_SIZE;
  }
  dv.setUint32(entryCursor, 0, true);

  // Out-of-line payloads, in IFD order.
  for (const e of entries) {
    if (e.bytes.length <= 4) continue;
    buf.set(e.bytes, outOfLineOffsets.get(e)!);
  }

  // Strip data.
  buf.set(stripData, stripOffset);

  return buf;
}
