import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Map as MlMap } from "maplibre-gl";
import type { Graphic, PickEvent } from "@orbat-mapper/tactical-draw";
import { createTacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";

const { facades, adapters } = vi.hoisted(() => ({
  facades: [] as Array<{
    render: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    emitPick: (event: PickEvent) => void;
    unsubscribePick: ReturnType<typeof vi.fn>;
  }>,
  adapters: [] as Array<{ destroy: ReturnType<typeof vi.fn> }>,
}));

// The real engine calls `map.addSource`/`map.addLayer` from its constructor, so the
// façade is faked here — this file is about the surface's own lifecycle logic.
vi.mock("@orbat-mapper/tactical-draw", () => ({
  TacticalDraw: class FakeTacticalDraw {
    constructor() {
      let handler: ((event: PickEvent) => void) | null = null;
      const unsubscribePick = vi.fn(() => {
        handler = null;
      });
      const entry = {
        render: vi.fn(),
        destroy: vi.fn(),
        emitPick: (event: PickEvent) => handler?.(event),
        unsubscribePick,
      };
      facades.push(entry);
      Object.assign(this, {
        render: entry.render,
        destroy: entry.destroy,
        onGraphicPick: (h: (event: PickEvent) => void) => {
          handler = h;
          return unsubscribePick;
        },
      });
    }
  },
}));

vi.mock("@orbat-mapper/tactical-draw-adapter-maplibre", () => ({
  MapLibreAdapter: class FakeMapLibreAdapter {
    constructor() {
      const entry = { destroy: vi.fn() };
      adapters.push(entry);
      Object.assign(this, { destroy: entry.destroy });
    }
  },
}));

function createFakeMap(styleLoaded = true) {
  const listeners = new Map<string, Set<() => void>>();
  const map = {
    on: vi.fn((event: string, handler: () => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
    }),
    off: vi.fn((event: string, handler: () => void) => {
      listeners.get(event)?.delete(handler);
    }),
    isStyleLoaded: vi.fn(() => styleLoaded),
  };
  return {
    map: map as unknown as MlMap,
    emitStyleLoad: () => {
      for (const handler of listeners.get("style.load") ?? []) handler();
    },
    styleLoadListenerCount: () => listeners.get("style.load")?.size ?? 0,
  };
}

const graphic = { id: "g1", kind: "boundary", controlPoints: [] } as unknown as Graphic;

describe("createTacticalDrawSurface", () => {
  beforeEach(() => {
    facades.length = 0;
    adapters.length = 0;
  });

  it("attaches immediately when the style is already loaded", () => {
    const { map } = createFakeMap(true);
    const surface = createTacticalDrawSurface(map);

    expect(facades).toHaveLength(1);
    expect(surface.tacticalDraw).not.toBeNull();
  });

  it("defers attaching until style.load when the style is not ready", () => {
    const { map, emitStyleLoad } = createFakeMap(false);
    const surface = createTacticalDrawSurface(map);

    expect(facades).toHaveLength(0);
    expect(surface.tacticalDraw).toBeNull();

    emitStyleLoad();

    expect(facades).toHaveLength(1);
    expect(surface.tacticalDraw).not.toBeNull();
  });

  it("buffers the last render and replays it after a basemap swap", () => {
    const { map, emitStyleLoad } = createFakeMap(true);
    const surface = createTacticalDrawSurface(map);

    surface.render([graphic]);
    expect(facades[0].render).toHaveBeenCalledWith([graphic]);

    // A basemap swap discards every custom layer, then re-fires style.load.
    emitStyleLoad();

    expect(facades).toHaveLength(2);
    expect(facades[0].destroy).toHaveBeenCalledTimes(1);
    expect(facades[1].render).toHaveBeenCalledWith([graphic]);
  });

  it("keeps host pick subscriptions across a re-attach", () => {
    const { map, emitStyleLoad } = createFakeMap(true);
    const surface = createTacticalDrawSurface(map);
    const handler = vi.fn();
    surface.onGraphicPick(handler);

    const pick = { id: "g1" } as PickEvent;
    facades[0].emitPick(pick);
    expect(handler).toHaveBeenCalledTimes(1);

    emitStyleLoad();
    facades[1].emitPick(pick);

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("stops delivering picks after the host unsubscribes", () => {
    const { map } = createFakeMap(true);
    const surface = createTacticalDrawSurface(map);
    const handler = vi.fn();
    const unsubscribe = surface.onGraphicPick(handler);

    unsubscribe();
    facades[0].emitPick({ id: "g1" } as PickEvent);

    expect(handler).not.toHaveBeenCalled();
  });

  it("destroys the facade before the adapter and stops re-attaching", () => {
    const { map, emitStyleLoad, styleLoadListenerCount } = createFakeMap(true);
    const surface = createTacticalDrawSurface(map);
    const order: string[] = [];
    facades[0].destroy.mockImplementation(() => order.push("facade"));
    adapters[0].destroy.mockImplementation(() => order.push("adapter"));

    surface.destroy();

    expect(order).toEqual(["facade", "adapter"]);
    expect(styleLoadListenerCount()).toBe(0);

    // Even a stray style.load must not resurrect the surface.
    emitStyleLoad();
    expect(facades).toHaveLength(1);
    expect(surface.tacticalDraw).toBeNull();
  });

  it("is idempotent on repeated destroy", () => {
    const { map } = createFakeMap(true);
    const surface = createTacticalDrawSurface(map);

    surface.destroy();
    surface.destroy();

    expect(facades[0].destroy).toHaveBeenCalledTimes(1);
    expect(adapters[0].destroy).toHaveBeenCalledTimes(1);
  });

  it("survives a facade that throws while its style is being torn down", () => {
    const { map, emitStyleLoad } = createFakeMap(true);
    const surface = createTacticalDrawSurface(map);
    facades[0].destroy.mockImplementation(() => {
      throw new Error("style already gone");
    });

    expect(() => emitStyleLoad()).not.toThrow();
    expect(facades).toHaveLength(2);
    expect(surface.tacticalDraw).not.toBeNull();
  });
});
