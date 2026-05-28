import { describe, expect, it } from "vitest";
import {
  lngLatToMercator,
  mercatorBoundsFromLngLat,
  serializePamAuxXml,
  serializeWorldFile,
  WEB_MERCATOR_WKT,
  worldFileFromMercatorBounds,
} from "@/modules/maplibreview/imageExport/worldFile";

describe("lngLatToMercator", () => {
  it("maps the origin to (0, 0)", () => {
    const p = lngLatToMercator({ lng: 0, lat: 0 });
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(0, 6);
  });

  it("matches EPSG:3857 for a known reference point (Greenwich Observatory)", () => {
    // Reference values from epsg.io transform 4326 → 3857.
    const p = lngLatToMercator({ lng: -0.0014, lat: 51.4779 });
    expect(p.x).toBeCloseTo(-155.85, 1);
    expect(p.y).toBeCloseTo(6706268.07, 1);
  });

  it("clamps latitudes outside the mercator domain", () => {
    const north = lngLatToMercator({ lng: 0, lat: 90 });
    const south = lngLatToMercator({ lng: 0, lat: -90 });
    expect(Number.isFinite(north.y)).toBe(true);
    expect(Number.isFinite(south.y)).toBe(true);
    expect(north.y).toBeGreaterThan(0);
    expect(south.y).toBeLessThan(0);
  });
});

describe("mercatorBoundsFromLngLat", () => {
  it("converts a lng/lat envelope to a mercator bbox", () => {
    const b = mercatorBoundsFromLngLat({
      west: -10,
      south: 40,
      east: 10,
      north: 50,
    });
    expect(b.minX).toBeLessThan(b.maxX);
    expect(b.minY).toBeLessThan(b.maxY);
    expect(b.minX).toBeCloseTo(-1113194.91, 1);
    expect(b.maxX).toBeCloseTo(1113194.91, 1);
  });
});

describe("worldFileFromMercatorBounds", () => {
  const bounds = { minX: 0, minY: 0, maxX: 1000, maxY: 500 };

  it("derives positive pixel size in X and negative in Y", () => {
    const p = worldFileFromMercatorBounds(bounds, 100, 50);
    expect(p.pixelSizeX).toBe(10);
    expect(p.pixelSizeY).toBe(-10);
  });

  it("anchors UL to the centre of the upper-left pixel (half-pixel offset)", () => {
    const p = worldFileFromMercatorBounds(bounds, 100, 50);
    // UL pixel corner is (minX, maxY) = (0, 500); centre is half a pixel in.
    expect(p.upperLeftX).toBe(5);
    expect(p.upperLeftY).toBe(495);
  });

  it("keeps the rotation terms at zero for axis-aligned rasters", () => {
    const p = worldFileFromMercatorBounds(bounds, 100, 50);
    expect(p.rotationX).toBe(0);
    expect(p.rotationY).toBe(0);
  });

  it("rejects non-positive pixel dimensions", () => {
    expect(() => worldFileFromMercatorBounds(bounds, 0, 50)).toThrow();
    expect(() => worldFileFromMercatorBounds(bounds, 100, 0)).toThrow();
  });
});

describe("serializeWorldFile", () => {
  it("writes the six parameters in A/D/B/E/C/F order, one per line", () => {
    const text = serializeWorldFile({
      pixelSizeX: 10,
      rotationY: 0,
      rotationX: 0,
      pixelSizeY: -10,
      upperLeftX: 5,
      upperLeftY: 495,
    });
    expect(text.split("\n")).toEqual(["10", "0", "0", "-10", "5", "495"]);
  });

  it("preserves enough precision to round-trip a sub-millimetre pixel size", () => {
    const text = serializeWorldFile({
      pixelSizeX: 0.0000123456789,
      rotationY: 0,
      rotationX: 0,
      pixelSizeY: -0.0000123456789,
      upperLeftX: -155.85,
      upperLeftY: 6711386.92,
    });
    const [a] = text.split("\n");
    expect(Number(a)).toBeCloseTo(0.0000123456789, 12);
  });
});

describe("WEB_MERCATOR_WKT", () => {
  it("declares EPSG:3857 with metre units", () => {
    expect(WEB_MERCATOR_WKT).toContain('AUTHORITY["EPSG","3857"]');
    expect(WEB_MERCATOR_WKT).toContain('UNIT["metre",1');
    expect(WEB_MERCATOR_WKT).toContain("Pseudo-Mercator");
  });
});

describe("serializePamAuxXml", () => {
  it("wraps the WKT in a PAMDataset/SRS element with GDAL ≥ 3.0 axis mapping", () => {
    const xml = serializePamAuxXml(WEB_MERCATOR_WKT);
    expect(xml).toContain("<PAMDataset>");
    expect(xml).toContain("</PAMDataset>");
    expect(xml).toContain('<SRS dataAxisToSRSAxisMapping="1,2">');
    expect(xml).toContain(WEB_MERCATOR_WKT);
  });
});
