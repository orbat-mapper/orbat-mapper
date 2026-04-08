// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { MapLibreMapAdapter } from "@/geo/mapLibreMapAdapter";

function createMockMap() {
  const listeners = new Map<string, (event: any) => void>();

  const mlMap = {
    on: vi.fn((event: string, handler: (event: any) => void) => {
      listeners.set(event, handler);
    }),
    off: vi.fn(),
    once: vi.fn(),
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
    getBounds: vi.fn(() => ({
      getWest: () => 0,
      getSouth: () => 0,
      getEast: () => 1,
      getNorth: () => 1,
    })),
    getZoom: vi.fn(() => 5),
    getCenter: vi.fn(() => ({ lng: 10, lat: 20 })),
    getBearing: vi.fn(() => 0),
    resize: vi.fn(),
    getContainer: vi.fn(() => document.createElement("div")),
    getCanvas: vi.fn(() => document.createElement("canvas")),
    unproject: vi.fn(() => ({ lng: 10, lat: 20 })),
  };

  return { mlMap, listeners };
}

describe("MapLibreMapAdapter", () => {
  it("stops propagation on the underlying DOM event", () => {
    const { mlMap, listeners } = createMockMap();
    const adapter = new MapLibreMapAdapter(mlMap as any);
    const handler = vi.fn();

    adapter.on("click", handler);

    const mapPreventDefault = vi.fn();
    const originalEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    const stopPropagationSpy = vi.spyOn(originalEvent, "stopPropagation");

    listeners.get("click")?.({
      lngLat: { lng: 1, lat: 2 },
      point: { x: 3, y: 4 },
      preventDefault: mapPreventDefault,
      originalEvent,
    });

    const forwardedEvent = handler.mock.calls[0][0];
    forwardedEvent.stopPropagation();

    expect(mapPreventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    expect(originalEvent.defaultPrevented).toBe(true);
  });
});
