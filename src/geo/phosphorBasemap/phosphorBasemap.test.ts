import { describe, expect, it } from "vitest";
import type { LayerSpecification } from "maplibre-gl";
import { phosphorBasemap, phosphorSpriteFile } from "@/geo/phosphorBasemap";

function find(layers: LayerSpecification[], id: string) {
  const layer = layers.find((l) => l.id === id);
  if (!layer) throw new Error(`no layer ${id}`);
  return layer as LayerSpecification & { paint?: Record<string, unknown> };
}

/** Width, height and RGBA rows of a PNG made by our encoder (stored deflate blocks). */
function decodePng(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  // IDAT data starts after signature (8) + IHDR chunk (25) + IDAT length/type (8) + zlib (2).
  let at = 8 + 25 + 8 + 2;
  const raw: number[] = [];
  for (;;) {
    const final = bytes[at]! & 1;
    const len = view.getUint16(at + 1, true);
    raw.push(...bytes.subarray(at + 5, at + 5 + len));
    at += 5 + len;
    if (final) break;
  }
  const rows = Array.from({ length: height }, (_, y) =>
    raw.slice(y * (width * 4 + 1) + 1, (y + 1) * (width * 4 + 1)),
  );
  return { width, height, rows };
}

describe("phosphorBasemap", () => {
  it("defaults to the green look", () => {
    const { layers, sprite } = phosphorBasemap("src");
    expect(sprite).toBe("phosphorsprite://3dff5a/6/1/3/1");
    expect(find(layers, "phosphor-coastline").paint).toMatchObject({
      "line-color": "#3dff5a",
    });
    expect(find(layers, "phosphor-sea-dots").paint).toMatchObject({
      "fill-pattern": "phosphor-dots",
      "fill-opacity": 0.35,
    });
  });

  it("takes a preset and colour overrides", () => {
    const { layers, sprite } = phosphorBasemap("src", {
      palette: "amber",
      colors: { background: "#100800", line: "#fa0" },
    });
    expect(sprite).toBe("phosphorsprite://ffaa00/6/1/3/1");
    expect(find(layers, "phosphor-background").paint).toEqual({
      "background-color": "#100800",
    });
    expect(find(layers, "phosphor-rivers").paint).toMatchObject({
      "line-color": "#c27c00",
    });
  });

  it("puts the pattern shape in the sprite URL and drops patterns turned off", () => {
    const custom = phosphorBasemap("src", {
      dots: { spacing: 8, size: 2, opacity: 0.5 },
      scanlines: false,
    });
    expect(custom.sprite).toBe("phosphorsprite://3dff5a/8/2/3/1");
    expect(find(custom.layers, "phosphor-sea-dots").paint).toMatchObject({
      "fill-opacity": 0.5,
    });
    expect(custom.layers.some((l) => l.id === "phosphor-scanlines")).toBe(false);
  });

  it("swaps the glow for a crisp outline", () => {
    const { layers } = phosphorBasemap("src", { glow: false });
    expect(layers.some((l) => l.id === "phosphor-coastline-glow")).toBe(false);
    expect(find(layers, "phosphor-town-labels").paint).toEqual({
      "text-color": "#c8ffd0",
      "text-halo-color": "#000000",
      "text-halo-width": 1.5,
    });
  });

  it("prefixes ids and qualifies patterns for a sprite array", () => {
    const { layers } = phosphorBasemap("src", { idPrefix: "bg", spriteId: "bg" });
    expect(layers.every((l) => l.id.startsWith("bg-"))).toBe(true);
    expect(find(layers, "bg-scanlines").paint).toMatchObject({
      "background-pattern": "bg:phosphor-scanlines",
    });
  });

  it("uses the given fonts", () => {
    const { layers } = phosphorBasemap("src", { fonts: ["IBM Plex Mono"] });
    const town = find(layers, "phosphor-town-labels") as {
      layout?: Record<string, unknown>;
    };
    expect(town.layout?.["text-font"]).toEqual(["Phosphor Mono Bold", "IBM Plex Mono"]);
  });

  it("rejects a pattern colour that is not hex", () => {
    expect(() => phosphorBasemap("src", { colors: { line: "rgb(0,255,0)" } })).toThrow(
      /hex/,
    );
  });
});

describe("phosphorSpriteFile", () => {
  it.each([
    ["phosphorsprite://3dff5a/6/1/3/1", 1],
    ["phosphorsprite://3dff5a/6/1/3/1@2x", 2],
  ])("index of %s fits its sheet", (base, ratio) => {
    const index = phosphorSpriteFile(`${base}.json`).data as Record<
      string,
      { x: number; y: number; width: number; height: number; pixelRatio: number }
    >;
    expect(Object.keys(index).sort()).toEqual(["phosphor-dots", "phosphor-scanlines"]);
    const { width, height } = decodePng(
      phosphorSpriteFile(`${base}.png`).data as ArrayBuffer,
    );
    const entries = Object.values(index);
    expect(Math.max(...entries.map((e) => e.x + e.width))).toBe(width);
    expect(Math.max(...entries.map((e) => e.y + e.height))).toBe(height);
    expect(entries.every((e) => e.pixelRatio === ratio)).toBe(true);
  });

  it("draws the dot and scanline in the colour", () => {
    const { width, height, rows } = decodePng(
      phosphorSpriteFile("phosphorsprite://ffb000/6/1/3/1.png").data as ArrayBuffer,
    );
    expect([width, height]).toEqual([9, 6]);
    const px = (x: number, y: number) => rows[y]!.slice(x * 4, x * 4 + 4);
    const amber = [0xff, 0xb0, 0x00, 0xff];
    expect(px(0, 0)).toEqual(amber); // the dot
    expect(px(1, 0)).toEqual([0, 0, 0, 0]);
    expect([6, 7, 8].map((x) => px(x, 0))).toEqual([amber, amber, amber]); // the scanline
    expect(px(6, 1)).toEqual([0, 0, 0, 0]);
  });

  it("rejects other URLs", () => {
    expect(() => phosphorSpriteFile("pmsprite://protomaps/light.json")).toThrow();
  });
});
