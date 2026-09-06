import { describe, expect, it } from "vitest";
import {
  CONTROL_MEASURE_METADATA,
  CONTROL_MEASURE_IDS,
  resolveSizePair,
} from "@orbat-mapper/control-measures";
import { MapLibreAdapter } from "@orbat-mapper/tactical-draw-adapter-maplibre";
import { editControlMeasureSizes } from "@/modules/scenarioeditor/controlMeasureSizeOptions";
import {
  resetControlMeasureSizesForResolution,
  sizePairParameter,
} from "@/modules/scenarioeditor/controlMeasureStyleOptions";

const pointTasks = ["destroy", "defeat", "neutralize", "suppress"] as const;

describe("control measure size editing", () => {
  it.each(pointTasks)(
    "resolves %s defaults and authored meters without pre-merging pixels",
    (graphicKind) => {
      const target = { id: "one", graphicKind };
      expect(editControlMeasureSizes([target], "size", "m", 2.5)).toEqual([
        { id: "one", options: { sizeMeters: 200 } },
      ]);
      expect(
        editControlMeasureSizes(
          [{ ...target, options: { sizeMeters: 125 } }],
          "size",
          "px",
          2.5,
        ),
      ).toEqual([{ id: "one", options: { sizePixels: 50 } }]);
    },
  );

  it("uses the declared meter default for older bare-key pairs", () => {
    const resolved = resolveSizePair({ kind: "boundary", dimension: "echelon" });
    expect(resolved).toMatchObject({ status: "resolved", unit: "m", value: 750 });
    expect(
      editControlMeasureSizes([{ id: 1, graphicKind: "boundary" }], "echelon", "px", 25),
    ).toEqual([{ id: 1, options: { echelonSizePixels: 30 } }]);
    const target = {
      id: 2,
      graphicKind: "flot" as const,
      options: { radiusPixels: 20, radius: 900, custom: "kept" },
    };
    expect(editControlMeasureSizes([target], "radius", "m", 10)).toEqual([
      { id: 2, options: { radius: 200, custom: "kept" } },
    ]);
    expect(target.options.radiusPixels).toBe(20);
  });

  it("normalizes same-unit edits without resolution and clears the inactive key", () => {
    expect(
      editControlMeasureSizes(
        [
          {
            id: 1,
            graphicKind: "destroy",
            options: { sizePixels: 40, sizeMeters: 800, crossAngle: 60 },
          },
        ],
        "size",
        "px",
      ),
    ).toEqual([{ id: 1, options: { sizePixels: 40, crossAngle: 60 } }]);
  });

  it("converts mixed batches independently and retains each options record", () => {
    const targets = [
      {
        id: 1,
        graphicKind: "destroy" as const,
        options: { sizePixels: 33.3, sizeMeters: 900, crossAngle: 60 },
      },
      {
        id: 2,
        graphicKind: "defeat" as const,
        options: { sizeMeters: 777, crossAngle: 80 },
      },
    ];
    const result = editControlMeasureSizes(targets, "size", "m", 2.5);
    expect(result).toEqual([
      { id: 1, options: { sizeMeters: 83.25, crossAngle: 60 } },
      { id: 2, options: { sizeMeters: 777, crossAngle: 80 } },
    ]);
    expect(editControlMeasureSizes(targets, "size", "px", undefined, 50)).toEqual([
      { id: 1, options: { sizePixels: 50, crossAngle: 60 } },
      { id: 2, options: { sizePixels: 50, crossAngle: 80 } },
    ]);
  });

  it.each([undefined, 0, -1, NaN, Infinity])(
    "does not partially convert a batch with resolution %s",
    (resolution) => {
      const targets = [
        { id: 1, graphicKind: "destroy" as const, options: { sizeMeters: 100 } },
        { id: 2, graphicKind: "defeat" as const, options: { sizePixels: 80 } },
      ];
      expect(editControlMeasureSizes(targets, "size", "m", resolution)).toBeNull();
      expect(targets[1]!.options).toEqual({ sizePixels: 80 });
    },
  );

  it("refuses unknown dimensions and invalid authored values", () => {
    expect(
      editControlMeasureSizes(
        [{ id: 1, graphicKind: "destroy", options: { sizePixels: NaN } }],
        "size",
        "m",
        10,
      ),
    ).toBeNull();
    expect(
      editControlMeasureSizes([{ id: 1, graphicKind: "destroy" }], "radius", "m", 10),
    ).toBeNull();
  });

  it("uses Web Mercator construction meters at high latitude, without rounding or clamping", () => {
    const map = { getZoom: () => 12, getCenter: () => ({ lat: 60, lng: 10 }) };
    const resolution = MapLibreAdapter.prototype.getResolution.call({
      map,
    } as unknown as MapLibreAdapter);
    const result = editControlMeasureSizes(
      [{ id: 1, graphicKind: "destroy", options: { sizePixels: 80 } }],
      "size",
      "m",
      resolution,
    )!;
    expect(result[0]!.options.sizeMeters).toBeCloseTo(
      (80 * 40075016.68557849) / 2 ** 21,
      6,
    );
    const roundTrip = editControlMeasureSizes(
      [{ id: 1, graphicKind: "destroy", options: result[0]!.options }],
      "size",
      "px",
      resolution,
    )!;
    expect(roundTrip[0]!.options.sizePixels).toBeCloseTo(80, 10);
  });

  it("keeps label slider bounds while using metadata defaults and reset keys", () => {
    const pair = CONTROL_MEASURE_METADATA["phase-line"].sizePairs![0]!;
    expect(sizePairParameter("phase-line", pair, "px")).toMatchObject({
      min: 8,
      max: 48,
      step: 1,
    });
    expect(sizePairParameter("phase-line", pair, "m")).toMatchObject({
      min: 50,
      max: 20000,
      step: 50,
    });
    expect(
      resetControlMeasureSizesForResolution(
        "phase-line",
        { labelSizePixels: 20, custom: true },
        10,
      ),
    ).toEqual({ labelSize: 140, custom: true });
    expect(
      resetControlMeasureSizesForResolution("boundary", { echelonSize: 500 }, 10),
    ).toEqual({ echelonSize: 160 });
    expect(
      resetControlMeasureSizesForResolution(
        "destroy",
        { sizePixels: 30, rotation: 45 },
        10,
      ),
    ).toEqual({ sizeMeters: 800, rotation: 45 });
    expect(resetControlMeasureSizesForResolution("destroy", {}, Infinity)).toBeNull();
  });

  it("can normalize every catalog dimension without inferring option names", () => {
    for (const kind of CONTROL_MEASURE_IDS) {
      for (const pair of CONTROL_MEASURE_METADATA[kind].sizePairs ?? []) {
        const result = editControlMeasureSizes(
          [
            {
              id: kind,
              graphicKind: kind,
              options: { [pair.pixels]: 20, [pair.meters]: 100, custom: true },
            },
          ],
          pair.id,
          "m",
          2,
        )!;
        expect(result, `${kind}/${pair.id}`).toEqual([
          { id: kind, options: { [pair.meters]: 40, custom: true } },
        ]);
      }
    }
  });
});
