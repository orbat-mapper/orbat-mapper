// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useMapHover } from "@/composables/geoHover";

const mocks = vi.hoisted(() => ({
  useOlEvent: vi.fn((eventKey: unknown) => eventKey),
  unByKey: vi.fn(),
}));

vi.mock("@/composables/openlayersHelpers", () => ({
  useOlEvent: mocks.useOlEvent,
}));

vi.mock("ol/Observable", () => ({
  unByKey: mocks.unByKey,
}));

describe("useMapHover", () => {
  beforeEach(() => {
    mocks.useOlEvent.mockClear();
    mocks.unByKey.mockClear();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
  });

  it("sets title to hovered scenario feature name", () => {
    const targetElement = { style: { cursor: "" }, title: "" };
    let pointerMoveHandler: any;
    const olMap = {
      on: vi.fn((eventType: string, handler: unknown) => {
        if (eventType === "pointermove") pointerMoveHandler = handler;
        return "pointerMoveKey";
      }),
      getEventPixel: vi.fn(() => [10, 20]),
      getTargetElement: vi.fn(() => targetElement),
      forEachFeatureAtPixel: vi.fn((_pixel: number[], callback: any) =>
        callback(
          { get: (key: string) => (key === "name" ? "Bridge Alpha" : undefined) },
          { get: (key: string) => (key === "layerType" ? "SCENARIO_FEATURE" : undefined) },
        ),
      ),
    } as any;

    useMapHover(olMap, { enable: ref(true) });
    pointerMoveHandler({ originalEvent: {} });

    expect(targetElement.style.cursor).toBe("pointer");
    expect(targetElement.title).toBe("Bridge Alpha");
  });

  it("clears title when no scenario feature is hovered", () => {
    const targetElement = { style: { cursor: "" }, title: "Existing" };
    let pointerMoveHandler: any;
    const olMap = {
      on: vi.fn((eventType: string, handler: unknown) => {
        if (eventType === "pointermove") pointerMoveHandler = handler;
        return "pointerMoveKey";
      }),
      getEventPixel: vi.fn(() => [10, 20]),
      getTargetElement: vi.fn(() => targetElement),
      forEachFeatureAtPixel: vi.fn(() => undefined),
    } as any;

    useMapHover(olMap, { enable: ref(true) });
    pointerMoveHandler({ originalEvent: {} });

    expect(targetElement.style.cursor).toBe("");
    expect(targetElement.title).toBe("");
  });

  it("does not throw when map target element is unavailable", () => {
    let pointerMoveHandler: any;
    const olMap = {
      on: vi.fn((eventType: string, handler: unknown) => {
        if (eventType === "pointermove") pointerMoveHandler = handler;
        return "pointerMoveKey";
      }),
      getEventPixel: vi.fn(() => [10, 20]),
      getTargetElement: vi.fn(() => null),
      forEachFeatureAtPixel: vi.fn(() => undefined),
    } as any;

    useMapHover(olMap, { enable: ref(true) });

    expect(() => pointerMoveHandler({ originalEvent: {} })).not.toThrow();
  });
});
