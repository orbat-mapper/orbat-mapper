import { describe, expect, it, vi } from "vitest";
import type { Map } from "maplibre-gl";
import { installTerrainRttFilter, sourceIsDraped } from "./terrainRttFilter";

function fixture() {
  const layers = [
    { id: "basemap", type: "fill", source: "tiles" },
    { id: "rings", type: "line", source: "rings" },
    { id: "units", type: "symbol", source: "units" },
    { id: "unit-dots", type: "circle", source: "units" },
  ];
  const handler = vi.fn();
  const map = {
    getLayersOrder: () => layers.map((layer) => layer.id),
    getLayer: (id: string) => layers.find((layer) => layer.id === id),
    _handleTerrainDataEvent: handler,
  };
  const fire = (event: object) =>
    (map._handleTerrainDataEvent as (e: object, id: string) => void).call(
      map,
      event,
      "dem",
    );
  return { map: map as unknown as Map, raw: map, handler, fire };
}

describe("sourceIsDraped", () => {
  it("is true only for sources with layers rendered into terrain textures", () => {
    const { map } = fixture();
    expect(sourceIsDraped(map, "tiles")).toBe(true);
    expect(sourceIsDraped(map, "rings")).toBe(true);
    expect(sourceIsDraped(map, "units")).toBe(false);
  });
});

describe("installTerrainRttFilter", () => {
  it("drops tile events from sources that only feed live layers", () => {
    const { map, handler, fire } = fixture();
    installTerrainRttFilter(map);
    fire({ dataType: "source", sourceId: "units", tile: {} });
    expect(handler).not.toHaveBeenCalled();
  });

  it("passes through draped, terrain, style and tileless events", () => {
    const { map, handler, fire } = fixture();
    installTerrainRttFilter(map);
    const events = [
      { dataType: "source", sourceId: "rings", tile: {} },
      { dataType: "source", sourceId: "dem", tile: {} },
      { dataType: "style" },
      { dataType: "source", sourceId: "units" },
    ];
    for (const event of events) fire(event);
    expect(handler.mock.calls.map(([event]) => event)).toEqual(events);
    expect(handler.mock.calls.every(([, id]) => id === "dem")).toBe(true);
  });

  it("restores the original handler on uninstall", () => {
    const { map, raw, handler } = fixture();
    const uninstall = installTerrainRttFilter(map);
    expect(raw._handleTerrainDataEvent).not.toBe(handler);
    uninstall();
    expect(raw._handleTerrainDataEvent).toBe(handler);
  });

  it("does nothing when MapLibre no longer has the private handler", () => {
    const map = { getLayersOrder: () => [] } as unknown as Map;
    expect(() => installTerrainRttFilter(map)()).not.toThrow();
  });
});
