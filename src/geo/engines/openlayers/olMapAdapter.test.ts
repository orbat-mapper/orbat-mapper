// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { OlMapAdapter } from "@/geo/engines/openlayers/olMapAdapter";

function createMockView(overrides: Record<string, any> = {}) {
  return {
    getProjection: vi.fn(() => "EPSG:3857"),
    getCenter: vi.fn(() => [0, 0]),
    getZoom: vi.fn(() => 5),
    getRotation: vi.fn(() => 0),
    getMinZoom: vi.fn(() => 0),
    getMaxZoom: vi.fn(() => 28),
    setMinZoom: vi.fn(),
    setMaxZoom: vi.fn(),
    ...overrides,
  };
}

function createMockMap(viewOverrides: Record<string, any> = {}) {
  const view = createMockView(viewOverrides);

  const olMap = {
    getView: vi.fn(() => view),
    setView: vi.fn(),
    updateSize: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    getSize: vi.fn(() => [800, 600]),
    getEventCoordinate: vi.fn(() => [0, 0]),
    getTargetElement: vi.fn(() => document.createElement("div")),
  };

  return { olMap, view };
}

describe("OlMapAdapter", () => {
  describe("setViewConstraints", () => {
    it("sets min and max zoom on the view", () => {
      const { olMap, view } = createMockMap();
      const adapter = new OlMapAdapter(olMap as any);

      adapter.setViewConstraints({ minZoom: 3, maxZoom: 18 });

      expect(view.setMinZoom).toHaveBeenCalledWith(3);
      expect(view.setMaxZoom).toHaveBeenCalledWith(18);
    });

    it("creates a new view when extent is set", () => {
      const { olMap } = createMockMap();
      const adapter = new OlMapAdapter(olMap as any);
      const extent: [number, number, number, number] = [-10, -20, 30, 40];

      adapter.setViewConstraints({ extent });

      expect(olMap.setView).toHaveBeenCalledTimes(1);
    });

    it("creates a new view without extent when clearing", () => {
      const { olMap } = createMockMap();
      const adapter = new OlMapAdapter(olMap as any);

      adapter.setViewConstraints({ extent: null });

      expect(olMap.setView).toHaveBeenCalledTimes(1);
    });

    it("returns current constraints via getter", () => {
      const { olMap } = createMockMap();
      const adapter = new OlMapAdapter(olMap as any);

      adapter.setViewConstraints({ minZoom: 3, maxZoom: 18 });

      expect(adapter.getViewConstraints()).toEqual({ minZoom: 3, maxZoom: 18 });
    });

    it("merges constraints across multiple calls", () => {
      const { olMap } = createMockMap();
      const adapter = new OlMapAdapter(olMap as any);

      adapter.setViewConstraints({ minZoom: 3 });
      adapter.setViewConstraints({ maxZoom: 18 });

      expect(adapter.getViewConstraints()).toEqual({ minZoom: 3, maxZoom: 18 });
    });

    it("does not replace the view when extent is not provided", () => {
      const { olMap } = createMockMap();
      const adapter = new OlMapAdapter(olMap as any);

      adapter.setViewConstraints({ minZoom: 5 });

      expect(olMap.setView).not.toHaveBeenCalled();
    });
  });
});
