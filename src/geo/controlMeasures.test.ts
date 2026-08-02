import { describe, expect, it } from "vitest";
import { isProxy, isReactive, reactive } from "vue";
import ms from "milsymbol";
import {
  MONOCHROME_COLOR,
  PLANNED_STROKE_DASH,
  resolveControlMeasureColor,
  resolveControlMeasureStrokeDash,
  resolveControlMeasureStyle,
  controlMeasureExtentFeature,
  toControlMeasure,
} from "@/geo/controlMeasures";
import { SATURATED_COLOR_MODE } from "@/symbology/identityColors";
import { SID } from "@/symbology/values";
import type { TacticalGraphicLayerItem } from "@/types/scenarioLayerItems";

const saturated = ms.getColorMode(SATURATED_COLOR_MODE);

function item(patch: Partial<TacticalGraphicLayerItem> = {}): TacticalGraphicLayerItem {
  return {
    id: "cm1",
    kind: "tacticalGraphic",
    graphicKind: "phase-line",
    controlPoints: [
      [0, 0],
      [1, 1],
    ],
    ...patch,
  };
}

describe("resolveControlMeasureColor", () => {
  it("defaults to the identity colour", () => {
    expect(resolveControlMeasureColor(item({ standardIdentity: SID.Hostile }))).toBe(
      saturated.Hostile,
    );
  });

  it("defaults to #000000 when monochrome", () => {
    expect(
      resolveControlMeasureColor(
        item({ standardIdentity: SID.Hostile, colorMode: "monochrome" }),
      ),
    ).toBe(MONOCHROME_COLOR);
    expect(MONOCHROME_COLOR).toBe("#000000");
  });

  it("uses the identity colour when colorMode is explicitly identity", () => {
    expect(
      resolveControlMeasureColor(
        item({ standardIdentity: SID.Neutral, colorMode: "identity" }),
      ),
    ).toBe(saturated.Neutral);
  });

  it("lets an authored style.color win over both", () => {
    expect(
      resolveControlMeasureColor(
        item({
          standardIdentity: SID.Hostile,
          colorMode: "monochrome",
          style: { color: "#ff00ff" },
        }),
      ),
    ).toBe("#ff00ff");
  });

  it("resolves every standard identity, including Custom 1 and Custom 2", () => {
    const colorFor = (sid: string) =>
      resolveControlMeasureColor(item({ standardIdentity: sid as never }));
    expect(colorFor(SID.Pending)).toBe(saturated.Unknown);
    expect(colorFor(SID.Unknown)).toBe(saturated.Unknown);
    expect(colorFor(SID.AssumedFriend)).toBe(saturated.Friend);
    expect(colorFor(SID.Friend)).toBe(saturated.Friend);
    expect(colorFor(SID.Neutral)).toBe(saturated.Neutral);
    expect(colorFor(SID.Suspect)).toBe(saturated.Suspect);
    expect(colorFor(SID.Hostile)).toBe(saturated.Hostile);
    expect(colorFor(SID.Custom1)).toBe("rgb(170, 176, 116)");
    expect(colorFor(SID.Custom2)).toBe(saturated.Hostile);
  });

  it("falls back to Unknown when the item has no identity at all", () => {
    expect(resolveControlMeasureColor(item())).toBe(saturated.Unknown);
  });
});

describe("resolveControlMeasureStrokeDash", () => {
  it("is empty for a present measure", () => {
    expect(resolveControlMeasureStrokeDash(item())).toEqual([]);
    expect(resolveControlMeasureStrokeDash(item({ status: "present" }))).toEqual([]);
  });

  it("is [8, 6] for a planned measure", () => {
    expect(resolveControlMeasureStrokeDash(item({ status: "planned" }))).toEqual([8, 6]);
    expect([...PLANNED_STROKE_DASH]).toEqual([8, 6]);
  });

  it("lets an authored style.strokeDash win over both", () => {
    expect(
      resolveControlMeasureStrokeDash(
        item({ status: "planned", style: { strokeDash: [2, 2] } }),
      ),
    ).toEqual([2, 2]);
    expect(
      resolveControlMeasureStrokeDash(
        item({ status: "present", style: { strokeDash: [] } }),
      ),
    ).toEqual([]);
  });

  it("hands out a fresh array so a consumer cannot mutate the shared default", () => {
    const first = resolveControlMeasureStrokeDash(item({ status: "planned" }));
    first.push(99);
    expect(resolveControlMeasureStrokeDash(item({ status: "planned" }))).toEqual([8, 6]);
  });

  it("does not alias an authored array", () => {
    const style = { strokeDash: [3, 3] };
    const dash = resolveControlMeasureStrokeDash(item({ style }));
    expect(dash).not.toBe(style.strokeDash);
  });
});

describe("resolveControlMeasureStyle", () => {
  it("keeps the rest of the authored style untouched", () => {
    expect(
      resolveControlMeasureStyle(
        item({
          standardIdentity: SID.Friend,
          style: { strokeWidth: 4, fillPattern: "hatch", opacity: 0.5 },
        }),
      ),
    ).toEqual({
      strokeWidth: 4,
      fillPattern: "hatch",
      opacity: 0.5,
      color: saturated.Friend,
      strokeDash: [],
    });
  });
});

describe("toControlMeasure", () => {
  it("projects the flattened item onto the library shape", () => {
    const measure = toControlMeasure(
      item({
        id: "cm-42",
        graphicKind: "boundary",
        standardIdentity: SID.Friend,
        status: "planned",
        options: { echelon: "brigade" },
        textAmplifiers: { T: "1 BDE" },
        amplifierPlacements: { T: [1, 2] },
      }),
    );
    expect(measure).toEqual({
      id: "cm-42",
      kind: "boundary",
      controlPoints: [
        [0, 0],
        [1, 1],
      ],
      options: { echelon: "brigade" },
      textAmplifiers: { T: "1 BDE" },
      amplifierPlacements: { T: [1, 2] },
      style: { color: saturated.Friend, strokeDash: [8, 6] },
    });
  });

  it("omits absent optional members rather than setting them undefined", () => {
    const measure = toControlMeasure(item());
    expect(Object.keys(measure).sort()).toEqual(["controlPoints", "id", "kind", "style"]);
  });

  it("never writes the projections back onto the item", () => {
    const graphic = item({ standardIdentity: SID.Hostile, status: "planned" });
    toControlMeasure(graphic);
    expect(graphic.style).toBeUndefined();
  });

  it("prefers the projected _state over the stored fields", () => {
    const graphic = item({
      standardIdentity: SID.Friend,
      status: "present",
      _state: {
        t: 100,
        controlPoints: [
          [5, 5],
          [6, 6],
        ],
        status: "planned",
      },
    });
    const measure = toControlMeasure(graphic);
    expect(measure.controlPoints).toEqual([
      [5, 5],
      [6, 6],
    ]);
    expect(measure.style?.strokeDash).toEqual([8, 6]);
    expect(measure.style?.color).toBe(saturated.Friend);
  });

  it("memoises by item identity", () => {
    const graphic = item();
    expect(toControlMeasure(graphic)).toBe(toControlMeasure(graphic));
    expect(toControlMeasure(item())).not.toBe(toControlMeasure(graphic));
  });

  it("invalidates when a projection input is replaced in place", () => {
    // useImmerStore applies RFC 6902 patches onto the live state, so an edit mutates
    // the existing item object. Item identity alone would serve a stale measure here.
    const graphic = item({ standardIdentity: SID.Friend });
    const first = toControlMeasure(graphic);
    graphic.controlPoints = [
      [9, 9],
      [8, 8],
    ];
    const second = toControlMeasure(graphic);
    expect(second).not.toBe(first);
    expect(second.controlPoints).toEqual([
      [9, 9],
      [8, 8],
    ]);

    graphic.standardIdentity = SID.Hostile;
    expect(toControlMeasure(graphic).style?.color).toBe(saturated.Hostile);
  });

  it("hands the engine raw data, never a reactive proxy", () => {
    // ADR-0006: Vue reactivity must not reach anything the engine holds, because deep
    // reactivity breaks tactical-draw's object-identity render cache. The dev-only
    // guard inside render() is shallow and cannot see a proxy nested in a raw Graphic,
    // so the copy has to happen here.
    const graphic = reactive(
      item({
        options: { width: 3 },
        textAmplifiers: { T: "PL BLUE" },
        style: { strokeWidth: 2 },
      }),
    ) as TacticalGraphicLayerItem;
    const measure = toControlMeasure(graphic);

    expect(isReactive(graphic.controlPoints)).toBe(true);
    expect(isProxy(measure)).toBe(false);
    expect(isProxy(measure.controlPoints)).toBe(false);
    expect(isProxy(measure.controlPoints[0])).toBe(false);
    expect(isProxy(measure.style)).toBe(false);
    expect(isProxy(measure.options)).toBe(false);
    expect(isProxy(measure.textAmplifiers)).toBe(false);
    expect(measure.controlPoints).toEqual([
      [0, 0],
      [1, 1],
    ]);
    expect(measure.textAmplifiers).toEqual({ T: "PL BLUE" });
  });

  it("does not write back into the store when the measure is mutated", () => {
    const graphic = item();
    const measure = toControlMeasure(graphic);
    measure.controlPoints[0] = [42, 42];
    expect(graphic.controlPoints[0]).toEqual([0, 0]);
  });

  it("invalidates when _state is reprojected", () => {
    const graphic = item({ status: "present" });
    const first = toControlMeasure(graphic);
    graphic._state = { t: 200, status: "planned" };
    const second = toControlMeasure(graphic);
    expect(second).not.toBe(first);
    expect(second.style?.strokeDash).toEqual([8, 6]);
  });
});

describe("controlMeasureExtentFeature", () => {
  it("frames the control points as a MultiPoint", () => {
    expect(controlMeasureExtentFeature(item())).toEqual({
      type: "Feature",
      id: "cm1",
      properties: {},
      geometry: {
        type: "MultiPoint",
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
    });
  });

  it("follows the projected control points, not the stored ones", () => {
    const graphic = item();
    graphic._state = { t: 100, controlPoints: [[5, 6]] };
    expect(controlMeasureExtentFeature(graphic)?.geometry.coordinates).toEqual([[5, 6]]);
  });

  it("copies the coordinates out of reactive scenario state", () => {
    const graphic = item();
    const feature = controlMeasureExtentFeature(graphic)!;
    expect(feature.geometry.coordinates[0]).not.toBe(graphic.controlPoints[0]);
  });

  it("still frames a graphic whose kind cannot be rendered", () => {
    const graphic = item({ graphicKind: "not-a-real-kind" as never });
    expect(controlMeasureExtentFeature(graphic)?.geometry.coordinates).toHaveLength(2);
  });

  it("has nothing to frame when there are no control points", () => {
    expect(controlMeasureExtentFeature(item({ controlPoints: [] }))).toBeUndefined();
  });
});
