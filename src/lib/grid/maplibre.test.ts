import { describe, expect, it } from "vitest";
import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import {
  generateLocalGridTile,
  generateMgrsTile,
  generateUtmTile,
  LOCAL_GRID_MAJOR_TILE_LAYER,
  LOCAL_GRID_MINOR_TILE_LAYER,
  localGridTileSourceDefinition,
  MGRS_LABEL_TILE_LAYER,
  MGRS_MAJOR_TILE_LAYER,
  MGRS_MINOR_TILE_LAYER,
  mgrsTileSourceDefinition,
  UTM_MAJOR_TILE_LAYER,
  UTM_MINOR_TILE_LAYER,
  utmTileSourceDefinition,
  projectToGrid,
  type LocalGridDefinition,
} from "./index";

function tileAt(longitude: number, latitude: number, zoom: number) {
  const scale = 2 ** zoom;
  const x = Math.floor(((longitude + 180) / 360) * scale);
  const radians = (latitude * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * scale);
  return { x, y };
}

function decode(buffer: ArrayBuffer) {
  return new VectorTile(new PbfReader(buffer));
}

describe("MGRS vector-tile protocol", () => {
  it("encodes tile-local UTM linework", () => {
    const { x, y } = tileAt(6, 60, 8);
    const tile = decode(generateMgrsTile(8, x, y, 10_000));

    expect(tile.layers[MGRS_MINOR_TILE_LAYER]?.length).toBeGreaterThan(0);
    expect(tile.layers[MGRS_MAJOR_TILE_LAYER]).toBeDefined();
  });

  it("leaves the polar cap empty for the retained UPS renderer", () => {
    const tile = decode(generateMgrsTile(6, 32, 0, 100_000));

    expect(tile.layers[MGRS_MINOR_TILE_LAYER]?.length ?? 0).toBe(0);
    expect(tile.layers[MGRS_MAJOR_TILE_LAYER]?.length ?? 0).toBe(0);
    expect(tile.layers[MGRS_LABEL_TILE_LAYER]?.length ?? 0).toBe(0);
  });

  it("anchors square labels at their southwest 100 km corner", () => {
    const zoom = 5;
    const { x, y } = tileAt(6, 60, zoom);
    const labels = decode(generateMgrsTile(zoom, x, y, 100_000)).layers[
      MGRS_LABEL_TILE_LAYER
    ];

    expect(labels?.length).toBeGreaterThan(0);
    for (let index = 0; index < labels!.length; index++) {
      const feature = labels!.feature(index).toGeoJSON(x, y, zoom);
      expect(feature.geometry.type).toBe("Point");
      if (feature.geometry.type !== "Point") continue;
      const coordinate = feature.geometry.coordinates as [number, number];
      const properties = feature.properties as Record<string, unknown>;
      expect(properties.identifier).toMatch(/^[A-Z]{2}$/);
      const designation = String(properties.designation);
      expect(`${designation} ${String(properties.identifier)}`).toMatch(
        /^\d{1,2}[C-X] [A-Z]{2}$/,
      );
      const band = designation.at(-1)!;
      const projected = projectToGrid(
        {
          kind: "utm",
          zone: Number(designation.slice(0, -1)),
          hemisphere: band >= "N" ? "north" : "south",
        },
        coordinate,
      );
      const eastingRemainder = Math.abs(projected.easting % 100_000);
      const northingRemainder = Math.abs(projected.northing % 100_000);
      expect(Math.min(eastingRemainder, 100_000 - eastingRemainder)).toBeLessThan(500);
      expect(Math.min(northingRemainder, 100_000 - northingRemainder)).toBeLessThan(500);
    }
  });

  it("uses stable tile zooms and includes spacing in the cache key", () => {
    expect(mgrsTileSourceDefinition(100_000)).toMatchObject({
      tiles: ["orbat-grid-mgrs://{z}/{x}/{y}?spacing=100000"],
      minzoom: 4,
      maxzoom: 5,
    });
    expect(mgrsTileSourceDefinition(100)).toMatchObject({
      tiles: ["orbat-grid-mgrs://{z}/{x}/{y}?spacing=100"],
      minzoom: 13,
      maxzoom: 14,
    });
  });
});

describe("UTM vector-tile protocol", () => {
  const crs = { kind: "utm", zone: 32, hemisphere: "north" } as const;

  it("encodes fixed-CRS minor and five-cell major linework", () => {
    const zoom = 11;
    const { x, y } = tileAt(6, 60, zoom);
    const tile = decode(generateUtmTile(zoom, x, y, 1_000, crs));

    expect(tile.layers[UTM_MINOR_TILE_LAYER]?.length).toBeGreaterThan(0);
    expect(tile.layers[UTM_MAJOR_TILE_LAYER]?.length).toBeGreaterThan(0);
  });

  it("includes spacing and the locked CRS in the cache key", () => {
    expect(utmTileSourceDefinition(crs, 5_000)).toMatchObject({
      tiles: ["orbat-grid-utm://{z}/{x}/{y}?spacing=5000&zone=32&hemisphere=north"],
      minzoom: 8,
      maxzoom: 9,
    });
  });
});

describe("Local Grid vector-tile protocol", () => {
  const definition: LocalGridDefinition = {
    origin: [10, 60],
    interval: 100,
    bearing: 30,
  };

  it("encodes rotated minor and five-cell major linework", () => {
    const zoom = 14;
    const { x, y } = tileAt(10, 60, zoom);
    const tile = decode(generateLocalGridTile(zoom, x, y, 100, definition));

    expect(tile.layers[LOCAL_GRID_MINOR_TILE_LAYER]?.length).toBeGreaterThan(0);
    expect(tile.layers[LOCAL_GRID_MAJOR_TILE_LAYER]?.length).toBeGreaterThan(0);
  });

  it("clips tiles outside the Local Grid validity band", () => {
    const zoom = 14;
    const { x, y } = tileAt(10, 40, zoom);
    const tile = decode(generateLocalGridTile(zoom, x, y, 100, definition));

    expect(tile.layers[LOCAL_GRID_MINOR_TILE_LAYER]?.length ?? 0).toBe(0);
    expect(tile.layers[LOCAL_GRID_MAJOR_TILE_LAYER]?.length ?? 0).toBe(0);
  });

  it("includes origin, bearing, and spacing in the cache key", () => {
    expect(localGridTileSourceDefinition(definition, 500)).toMatchObject({
      tiles: [
        "orbat-grid-local://{z}/{x}/{y}?spacing=500&longitude=10&latitude=60&bearing=30",
      ],
      minzoom: 11,
      maxzoom: 12,
    });
  });
});
