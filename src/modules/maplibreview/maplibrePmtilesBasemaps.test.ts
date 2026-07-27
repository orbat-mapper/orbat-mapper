import { describe, expect, it } from "vitest";
import type { MlPmtilesLayerConfig } from "@/geo/maplibreLayerConfigTypes";
import {
  basemapFlavor,
  basemapSupportsFlavor,
  basemapSupportsOpacity,
  createPmtilesStyle,
  getSupportedMaplibreBasemaps,
} from "@/modules/maplibreview/maplibreBasemaps";

function pmtilesLayer(
  overrides: Partial<MlPmtilesLayerConfig> = {},
): MlPmtilesLayerConfig {
  return {
    sourceType: "pmtiles",
    name: "local",
    title: "local.pmtiles (local)",
    archive: {
      kind: "vector",
      minZoom: 0,
      maxZoom: 14,
      bounds: [-180, -85, 180, 85],
    },
    ...overrides,
  };
}

describe("createPmtilesStyle", () => {
  it("renders a vector archive with Protomaps layers and the committed sprite", () => {
    const style = createPmtilesStyle(pmtilesLayer())!;
    expect(style.sources.local).toMatchObject({
      type: "vector",
      tiles: ["pmtiles://archive:local/{z}/{x}/{y}"],
      minzoom: 0,
      maxzoom: 14,
    });
    expect(style.sprite).toBe("pmsprite://protomaps/light");
    expect(style.layers.length).toBeGreaterThan(10);
    const sources = new Set(
      style.layers.map((layer) => ("source" in layer ? layer.source : undefined)),
    );
    expect([...sources].filter(Boolean)).toEqual(["local"]);
  });

  it("renders a raster archive as a plain raster source with no sprite", () => {
    const style = createPmtilesStyle(
      pmtilesLayer({
        archive: { kind: "raster", minZoom: 1, maxZoom: 9, bounds: [0, 0, 1, 1] },
      }),
    )!;
    expect(style.sources.local).toMatchObject({
      type: "raster",
      tiles: ["pmtiles://archive:local/{z}/{x}/{y}"],
      tileSize: 256,
    });
    expect(style.layers).toHaveLength(1);
    expect(style.sprite).toBeUndefined();
  });

  it("applies the layer opacity to a raster archive", () => {
    const style = createPmtilesStyle(
      pmtilesLayer({
        opacity: 0.4,
        archive: { kind: "raster", minZoom: 0, maxZoom: 5, bounds: [0, 0, 1, 1] },
      }),
    )!;
    expect(style.layers[0]).toMatchObject({ paint: { "raster-opacity": 0.4 } });
  });

  it("generates a different style per flavour and points the sprite at it", () => {
    const light = createPmtilesStyle(pmtilesLayer({ flavor: "light" }))!;
    const dark = createPmtilesStyle(pmtilesLayer({ flavor: "dark" }))!;
    expect(light.sprite).toBe("pmsprite://protomaps/light");
    expect(dark.sprite).toBe("pmsprite://protomaps/dark");
    expect(JSON.stringify(dark.layers)).not.toEqual(JSON.stringify(light.layers));
  });

  it("defaults to the light flavour", () => {
    const style = createPmtilesStyle(pmtilesLayer({ flavor: undefined }))!;
    const light = createPmtilesStyle(pmtilesLayer({ flavor: "light" }))!;
    expect(style.sprite).toBe(light.sprite);
    expect(style.layers).toEqual(light.layers);
  });

  it("sets no glyphs key, so MapLibre rasterises labels locally", () => {
    const style = createPmtilesStyle(pmtilesLayer())!;
    expect("glyphs" in style).toBe(false);
    const raster = createPmtilesStyle(
      pmtilesLayer({
        archive: { kind: "raster", minZoom: 0, maxZoom: 5, bounds: [0, 0, 1, 1] },
      }),
    )!;
    expect("glyphs" in raster).toBe(false);
  });

  it("uses a glyphs URL only when the config opts in", () => {
    const style = createPmtilesStyle(
      pmtilesLayer({ glyphs: "https://glyphs.example.com/{fontstack}/{range}.pbf" }),
    )!;
    expect(style.glyphs).toBe("https://glyphs.example.com/{fontstack}/{range}.pbf");
  });

  it("passes the archive attribution through to the source", () => {
    const vector = createPmtilesStyle(
      pmtilesLayer({
        archive: {
          kind: "vector",
          minZoom: 0,
          maxZoom: 14,
          bounds: [-180, -85, 180, 85],
          attribution: "© Protomaps © OpenStreetMap",
        },
      }),
    )!;
    expect(vector.sources.local).toMatchObject({
      attribution: "© Protomaps © OpenStreetMap",
    });

    const raster = createPmtilesStyle(
      pmtilesLayer({
        archive: {
          kind: "raster",
          minZoom: 0,
          maxZoom: 5,
          bounds: [0, 0, 1, 1],
          attribution: "Local imagery",
        },
      }),
    )!;
    expect(raster.sources.local).toMatchObject({ attribution: "Local imagery" });
  });

  it("sets no attribution when the archive carries none", () => {
    const style = createPmtilesStyle(pmtilesLayer())!;
    expect((style.sources.local as { attribution?: string }).attribution).toBeUndefined();
  });

  it("returns null while the archive has not been opened", () => {
    expect(createPmtilesStyle(pmtilesLayer({ archive: undefined }))).toBeNull();
  });
});

describe("basemap capability helpers", () => {
  it("offers a flavour select only for a vector archive", () => {
    expect(basemapSupportsFlavor(pmtilesLayer())).toBe(true);
    expect(
      basemapSupportsFlavor(
        pmtilesLayer({
          archive: { kind: "raster", minZoom: 0, maxZoom: 5, bounds: [0, 0, 1, 1] },
        }),
      ),
    ).toBe(false);
    expect(basemapSupportsFlavor({ sourceType: "mapbundle", name: "bundle" })).toBe(
      false,
    );
    expect(basemapSupportsFlavor(undefined)).toBe(false);
  });

  it("reports the effective flavour", () => {
    expect(basemapFlavor(pmtilesLayer())).toBe("light");
    expect(basemapFlavor(pmtilesLayer({ flavor: "black" }))).toBe("black");
    expect(basemapFlavor({ sourceType: "mapbundle", name: "bundle" })).toBeUndefined();
  });

  it("offers opacity for raster archives and raster tile layers", () => {
    expect(
      basemapSupportsOpacity(
        pmtilesLayer({
          archive: { kind: "raster", minZoom: 0, maxZoom: 5, bounds: [0, 0, 1, 1] },
        }),
      ),
    ).toBe(true);
    expect(basemapSupportsOpacity(pmtilesLayer())).toBe(false);
    expect(
      basemapSupportsOpacity({
        sourceType: "raster",
        name: "osm",
        tiles: ["https://x/{z}/{x}/{y}"],
      }),
    ).toBe(true);
  });
});

describe("getSupportedMaplibreBasemaps with archives", () => {
  it("includes an opened archive and skips an unopened one", () => {
    const options = getSupportedMaplibreBasemaps([
      pmtilesLayer(),
      pmtilesLayer({ name: "pending", archive: undefined }),
    ]);
    expect(options.map((o) => o.id)).toEqual(["local", "None"]);
  });

  it("skips mapbundle layers until they are supported", () => {
    const options = getSupportedMaplibreBasemaps([
      { sourceType: "mapbundle", name: "bundle", title: "Bundle" },
    ]);
    expect(options.map((o) => o.id)).toEqual(["None"]);
  });
});

describe("the empty basemap", () => {
  it("sets no glyphs url, so a standalone install contacts no font server", () => {
    const options = getSupportedMaplibreBasemaps([]);
    const none = options[options.length - 1];
    expect(none.id).toBe("None");
    expect(none.style).not.toHaveProperty("glyphs");
  });
});
