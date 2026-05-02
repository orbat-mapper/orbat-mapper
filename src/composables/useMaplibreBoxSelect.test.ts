// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMaplibreBoxSelect } from "@/composables/useMaplibreBoxSelect";

function createMouseEvent(
  type: string,
  options: Partial<MouseEventInit> & { clientX: number; clientY: number },
) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    ctrlKey: true,
    ...options,
  });
}

function createMockMap() {
  const canvas = document.createElement("canvas");
  const container = document.createElement("div");
  container.appendChild(canvas);
  canvas.style.cursor = "";
  vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 200,
    bottom: 200,
    width: 200,
    height: 200,
    toJSON: () => ({}),
  });

  const sources = new Map<string, { setData: ReturnType<typeof vi.fn> }>();
  const layers = new Set<string>();
  const map = {
    getCanvasContainer: vi.fn(() => container),
    getCanvas: vi.fn(() => canvas),
    getSource: vi.fn((id: string) => sources.get(id)),
    addSource: vi.fn((id: string) => {
      sources.set(id, { setData: vi.fn() });
    }),
    removeSource: vi.fn((id: string) => sources.delete(id)),
    getLayer: vi.fn((id: string) => layers.has(id)),
    addLayer: vi.fn((layer: { id: string }) => {
      layers.add(layer.id);
    }),
    removeLayer: vi.fn((id: string) => layers.delete(id)),
    unproject: vi.fn(([lng, lat]: [number, number]) => ({ lng, lat })),
    queryRenderedFeatures: vi.fn(() => [
      { properties: { id: "unit-1" } },
      { properties: { id: "unit-2" } },
      { properties: { id: "unit-1" } },
    ]),
  };

  return { map: map as any, canvas, container };
}

describe("useMaplibreBoxSelect", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("does not consume a ctrl/cmd click without drag movement", () => {
    const mockMap = createMockMap();
    const onBoxStart = vi.fn();
    const onBoxEnd = vi.fn();
    const suspend = vi.fn(() => "suspended");
    const restore = vi.fn();

    useMaplibreBoxSelect(mockMap.map, {
      getUnitLayerIds: () => ["unitLayer"],
      onBoxStart,
      onBoxEnd,
      isEnabled: () => true,
      suspend,
      restore,
    });

    const down = createMouseEvent("mousedown", { clientX: 10, clientY: 10 });
    const up = createMouseEvent("mouseup", { clientX: 10, clientY: 10 });

    mockMap.container.dispatchEvent(down);
    window.dispatchEvent(up);

    expect(down.defaultPrevented).toBe(false);
    expect(up.defaultPrevented).toBe(false);
    expect(onBoxStart).not.toHaveBeenCalled();
    expect(onBoxEnd).not.toHaveBeenCalled();
    expect(suspend).not.toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
    expect(mockMap.map.queryRenderedFeatures).not.toHaveBeenCalled();
  });

  it("does not consume ctrl/cmd movement below the drag threshold", () => {
    const mockMap = createMockMap();
    const onBoxStart = vi.fn();
    const onBoxEnd = vi.fn();
    const suspend = vi.fn(() => "suspended");
    const restore = vi.fn();

    useMaplibreBoxSelect(mockMap.map, {
      getUnitLayerIds: () => ["unitLayer"],
      onBoxStart,
      onBoxEnd,
      isEnabled: () => true,
      suspend,
      restore,
    });

    const down = createMouseEvent("mousedown", { clientX: 10, clientY: 10 });
    const move = createMouseEvent("mousemove", { clientX: 11, clientY: 11 });
    const up = createMouseEvent("mouseup", { clientX: 11, clientY: 11 });

    mockMap.container.dispatchEvent(down);
    window.dispatchEvent(move);
    window.dispatchEvent(up);

    expect(down.defaultPrevented).toBe(false);
    expect(move.defaultPrevented).toBe(false);
    expect(up.defaultPrevented).toBe(false);
    expect(onBoxStart).not.toHaveBeenCalled();
    expect(onBoxEnd).not.toHaveBeenCalled();
    expect(suspend).not.toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
    expect(mockMap.map.queryRenderedFeatures).not.toHaveBeenCalled();
  });

  it("starts box selection after ctrl/cmd drag movement crosses the threshold", () => {
    const mockMap = createMockMap();
    const onBoxStart = vi.fn();
    const onBoxEnd = vi.fn();
    const suspend = vi.fn(() => "suspended");
    const restore = vi.fn();

    useMaplibreBoxSelect(mockMap.map, {
      getUnitLayerIds: () => ["unitLayer"],
      onBoxStart,
      onBoxEnd,
      isEnabled: () => true,
      suspend,
      restore,
    });

    const down = createMouseEvent("mousedown", { clientX: 10, clientY: 10 });
    const move = createMouseEvent("mousemove", { clientX: 20, clientY: 20 });
    const up = createMouseEvent("mouseup", { clientX: 30, clientY: 30 });

    mockMap.container.dispatchEvent(down);
    window.dispatchEvent(move);
    window.dispatchEvent(up);

    expect(down.defaultPrevented).toBe(false);
    expect(move.defaultPrevented).toBe(true);
    expect(up.defaultPrevented).toBe(true);
    expect(onBoxStart).toHaveBeenCalledTimes(1);
    expect(suspend).toHaveBeenCalledTimes(1);
    expect(mockMap.map.queryRenderedFeatures).toHaveBeenCalledWith(
      [
        [10, 10],
        [30, 30],
      ],
      { layers: ["unitLayer"] },
    );
    expect(onBoxEnd).toHaveBeenCalledWith(["unit-1", "unit-2"]);
    expect(restore).toHaveBeenCalledWith("suspended");
  });

  it("removes pending window listeners during cleanup", () => {
    const mockMap = createMockMap();
    const onBoxStart = vi.fn();
    const onBoxEnd = vi.fn();
    const suspend = vi.fn(() => "suspended");
    const restore = vi.fn();

    const boxSelect = useMaplibreBoxSelect(mockMap.map, {
      getUnitLayerIds: () => ["unitLayer"],
      onBoxStart,
      onBoxEnd,
      isEnabled: () => true,
      suspend,
      restore,
    });

    const down = createMouseEvent("mousedown", { clientX: 10, clientY: 10 });
    const move = createMouseEvent("mousemove", { clientX: 20, clientY: 20 });
    const up = createMouseEvent("mouseup", { clientX: 30, clientY: 30 });

    mockMap.container.dispatchEvent(down);
    boxSelect.cleanup();
    window.dispatchEvent(move);
    window.dispatchEvent(up);

    expect(move.defaultPrevented).toBe(false);
    expect(up.defaultPrevented).toBe(false);
    expect(onBoxStart).not.toHaveBeenCalled();
    expect(onBoxEnd).not.toHaveBeenCalled();
    expect(suspend).not.toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
  });
});
