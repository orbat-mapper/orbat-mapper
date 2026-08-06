import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Map as MlMap } from "maplibre-gl";
import type { Graphic, PickEvent } from "@orbat-mapper/tactical-draw";
import { reactive } from "vue";
import {
  __resetTacticalDrawReactivityWarning,
  createTacticalDrawSurface,
} from "@/geo/engines/maplibre/tacticalDrawSurface";

const { facades, adapters } = vi.hoisted(() => ({
  facades: [] as Array<{
    render: ReturnType<typeof vi.fn>;
    setHighlightedGraphics: ReturnType<typeof vi.fn>;
    ownsInteractionAt: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    emitPick: (event: PickEvent) => void;
    unsubscribePick: ReturnType<typeof vi.fn>;
    options: { generateId?: () => string } | undefined;
  }>,
  adapters: [] as Array<{
    destroy: ReturnType<typeof vi.fn>;
    options: { viewChangeMode?: "continuous" | "settle" } | undefined;
  }>,
}));

// The real engine calls `map.addSource`/`map.addLayer` from its constructor, so the
// façade is faked here — this file is about the surface's own lifecycle logic.
vi.mock("@orbat-mapper/tactical-draw", () => ({
  TacticalDraw: class FakeTacticalDraw {
    constructor(_adapter: unknown, options?: { generateId?: () => string }) {
      let handler: ((event: PickEvent) => void) | null = null;
      const unsubscribePick = vi.fn(() => {
        handler = null;
      });
      const entry = {
        render: vi.fn(),
        setHighlightedGraphics: vi.fn(),
        ownsInteractionAt: vi.fn(() => null),
        destroy: vi.fn(),
        emitPick: (event: PickEvent) => handler?.(event),
        unsubscribePick,
        options,
      };
      facades.push(entry);
      Object.assign(this, {
        render: entry.render,
        setHighlightedGraphics: entry.setHighlightedGraphics,
        ownsInteractionAt: entry.ownsInteractionAt,
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
    constructor(_map: unknown, options?: { viewChangeMode?: "continuous" | "settle" }) {
      const entry = { destroy: vi.fn(), options };
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

  // The adapter's default is "continuous", which re-renders the whole stack on every
  // frame of a pure pan. Nothing fails if this regresses — the map just gets slow —
  // so it is asserted rather than left to a comment. See ADR-0006.
  it("constructs the adapter in settle view-change mode", () => {
    const { map } = createFakeMap(true);
    createTacticalDrawSurface(map);

    expect(adapters[0].options?.viewChangeMode).toBe("settle");
  });

  // Without this the library falls back to a monotonic `td-${n}` slug, which would
  // not equal the scenario layer-item id and would restart on every re-attach.
  it("injects nanoid as the façade's id generator, on every attach", () => {
    const { map, emitStyleLoad } = createFakeMap(true);
    createTacticalDrawSurface(map);
    emitStyleLoad();

    expect(facades).toHaveLength(2);
    const ids = facades.map((facade) => facade.options?.generateId?.());
    expect(ids.every((id) => typeof id === "string" && id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
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

  describe("the dev-only reactivity guard", () => {
    beforeEach(() => {
      __resetTacticalDrawReactivityWarning();
    });

    it("warns once when the batch or a graphic is reactive, and still renders", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { map } = createFakeMap(true);
      const surface = createTacticalDrawSurface(map);

      surface.render(reactive([{ ...graphic }]) as unknown as Graphic[]);
      surface.render([reactive({ ...graphic }) as unknown as Graphic]);

      // Once per session: a broken render loop would otherwise flood the console.
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain("reactive graphics");
      // The guard warns, it does not refuse — a defeated cache is slow, not wrong.
      expect(facades[0].render).toHaveBeenCalledTimes(2);
      warn.mockRestore();
    });

    it("stays silent for a raw batch of plain graphics", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { map } = createFakeMap(true);
      const surface = createTacticalDrawSurface(map);

      // A Graphic whose *fields* point into reactive state is the normal case:
      // the identity cache keys on the Graphic, not on its members.
      surface.render([{ ...graphic, controlPoints: reactive([[0, 0]]) } as Graphic]);

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe("selection", () => {
    it("delegates ownsInteractionAt, and answers null while detached", () => {
      const { map, emitStyleLoad } = createFakeMap(false);
      const surface = createTacticalDrawSurface(map);

      // No facade yet: a host click handler must still get a usable answer rather
      // than throwing, so the plain-feature query proceeds.
      expect(surface.ownsInteractionAt([10, 20])).toBeNull();
      expect(facades).toHaveLength(0);

      emitStyleLoad();
      const hit = { layer: "graphics", feature: {}, measureId: "cm-1" };
      facades[0].ownsInteractionAt.mockReturnValue(hit);

      const originalEvent = { type: "click" };
      expect(surface.ownsInteractionAt([10, 20], { originalEvent })).toBe(hit);
      expect(facades[0].ownsInteractionAt).toHaveBeenCalledWith([10, 20], {
        originalEvent,
      });
    });

    it("replays the highlight set after a style.load re-attach, and after the batch", () => {
      const { map, emitStyleLoad } = createFakeMap(true);
      const surface = createTacticalDrawSurface(map);

      surface.render([graphic]);
      surface.setHighlightedGraphics(["g1"]);
      expect(facades[0].setHighlightedGraphics).toHaveBeenCalledWith(["g1"]);

      emitStyleLoad();

      // A basemap swap wipes the highlight layer along with everything else.
      expect(facades[1].setHighlightedGraphics).toHaveBeenCalledWith(["g1"]);
      // Order matters: the library skips ids that are not currently rendered.
      expect(facades[1].render.mock.invocationCallOrder[0]).toBeLessThan(
        facades[1].setHighlightedGraphics.mock.invocationCallOrder[0],
      );
    });

    it("does not replay a cleared highlight set", () => {
      const { map, emitStyleLoad } = createFakeMap(true);
      const surface = createTacticalDrawSurface(map);

      surface.render([graphic]);
      surface.setHighlightedGraphics(["g1"]);
      surface.setHighlightedGraphics([]);
      emitStyleLoad();

      expect(facades[1].setHighlightedGraphics).not.toHaveBeenCalled();
    });
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
