import { describe, expect, it, vi } from "vitest";
import { getTopHitLayerType } from "@/modules/scenarioeditor/featureLayerUtils";

describe("getTopHitLayerType", () => {
  it("returns the layer type for the first hit only", () => {
    const callbackSpy = vi.fn(
      (
        _pixel: number[],
        callback: (feature: unknown, layer: { get: (key: string) => string }) => boolean,
      ) => {
        callback({}, { get: () => "UNITS" });
      },
    );

    const olMap = {
      forEachFeatureAtPixel: callbackSpy,
    } as any;

    expect(getTopHitLayerType(olMap, [10, 20], 20)).toBe("UNITS");
    expect(callbackSpy).toHaveBeenCalledWith([10, 20], expect.any(Function), {
      hitTolerance: 20,
    });
  });

  it("returns undefined when nothing is hit", () => {
    const olMap = {
      forEachFeatureAtPixel: vi.fn(),
    } as any;

    expect(getTopHitLayerType(olMap, [10, 20], 20)).toBeUndefined();
  });
});
