import { describe, expect, it } from "vitest";
import { buildTacticalGraphicRenderPlan } from "@/modules/maplibreview/tacticalGraphicRenderPlan";
import {
  MONOCHROME_COLOR,
  PLANNED_STROKE_DASH,
  toControlMeasure,
} from "@/geo/controlMeasures";
import { identityColor } from "@/symbology/identityColors";
import type { ControlMeasure } from "@orbat-mapper/control-measures";
import type {
  FullScenarioLayerItemsLayer,
  NScenarioLayerItem,
  TacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";

function graphic(
  id: string,
  patch: Partial<TacticalGraphicLayerItem> = {},
): NScenarioLayerItem {
  return {
    id,
    kind: "tacticalGraphic",
    graphicKind: "phase-line",
    controlPoints: [
      [0, 0],
      [1, 1],
    ],
    _pid: "layer-1",
    ...patch,
  } as NScenarioLayerItem;
}

function geometry(id: string, patch: Record<string, unknown> = {}): NScenarioLayerItem {
  return {
    id,
    kind: "geometry",
    type: "Feature",
    geometry: { type: "Point", coordinates: [0, 0] },
    properties: {},
    style: {},
    meta: {},
    _pid: "layer-1",
    ...patch,
  } as unknown as NScenarioLayerItem;
}

function layer(
  id: string,
  items: NScenarioLayerItem[],
  patch: Partial<FullScenarioLayerItemsLayer> = {},
): FullScenarioLayerItemsLayer {
  return { id, name: id, items, ...patch } as FullScenarioLayerItemsLayer;
}

const visible = { filterVisible: true } as const;

/**
 * The first `Graphic` of the plan for a single-layer stack.
 *
 * `Graphic` is `ControlMeasure | PointSymbol`; the plan only ever emits the former in
 * M1, and narrowing here keeps the union out of every assertion below.
 */
function onlyMeasure(item: NScenarioLayerItem): ControlMeasure {
  const plan = buildTacticalGraphicRenderPlan([layer("layer-1", [item])], visible);
  return plan.graphics[0] as ControlMeasure;
}

describe("buildTacticalGraphicRenderPlan", () => {
  it("projects tactical graphics and ignores every other item kind", () => {
    const plan = buildTacticalGraphicRenderPlan(
      [layer("layer-1", [geometry("g1"), graphic("cm1"), geometry("g2")])],
      visible,
    );
    expect(plan.graphics.map((g) => g.id)).toEqual(["cm1"]);
    expect(plan.graphics[0]).toMatchObject({ kind: "phase-line" });
    expect(plan.unsupportedIds).toEqual([]);
    expect(plan.duplicateIds).toEqual([]);
  });

  it("returns the memoised ControlMeasure objects untouched", () => {
    const item = graphic("cm1");
    const layers = [layer("layer-1", [item])];
    const first = buildTacticalGraphicRenderPlan(layers, visible);
    const second = buildTacticalGraphicRenderPlan(layers, visible);
    // Identity is the contract: tactical-draw caches rendered output on the
    // Graphic object, so a per-render copy would defeat the cache every time.
    expect(second.graphics[0]).toBe(first.graphics[0]);
    expect(first.graphics[0]).toBe(toControlMeasure(item as TacticalGraphicLayerItem));
  });

  it("orders the batch bottom-first across the layer stack", () => {
    // Index 0 of the stack is the topmost layer; tactical-draw renders the array
    // bottom-to-top, so the topmost layer's graphics must come last.
    const plan = buildTacticalGraphicRenderPlan(
      [
        layer("top", [graphic("top-a"), graphic("top-b")]),
        layer("bottom", [graphic("bottom-a")]),
      ],
      visible,
    );
    expect(plan.graphics.map((g) => g.id)).toEqual(["bottom-a", "top-a", "top-b"]);
  });

  it("keeps specialized empty layers harmless while preserving stack order", () => {
    const plan = buildTacticalGraphicRenderPlan(
      [
        layer("top", [graphic("top")], { specialization: "controlMeasure" }),
        layer("prepared", [], { specialization: "controlMeasure" }),
        layer("bottom", [graphic("bottom")], {
          specialization: "controlMeasure",
        }),
      ],
      visible,
    );

    expect(plan.graphics.map((graphic) => graphic.id)).toEqual(["bottom", "top"]);
  });

  it("filters out an unsupported graphicKind and reports it", () => {
    const plan = buildTacticalGraphicRenderPlan(
      [
        layer("layer-1", [
          graphic("cm1"),
          graphic("cm2", { graphicKind: "kind-from-the-future" as never }),
        ]),
      ],
      visible,
    );
    expect(plan.graphics.map((g) => g.id)).toEqual(["cm1"]);
    expect(plan.unsupportedIds).toEqual(["cm2"]);
  });

  it("dedupes ids, keeping the first in render order", () => {
    const plan = buildTacticalGraphicRenderPlan(
      [
        layer("top", [graphic("dupe", { graphicKind: "phase-line" })]),
        layer("bottom", [graphic("dupe", { graphicKind: "boundary" })]),
      ],
      visible,
    );
    // `render()` throws synchronously on a duplicate id, blanking the whole stack.
    expect(plan.graphics).toHaveLength(1);
    expect(plan.graphics[0]).toMatchObject({ id: "dupe", kind: "boundary" });
    expect(plan.duplicateIds).toEqual(["dupe"]);
  });

  it("always drops a manually hidden item and a hidden layer", () => {
    const plan = buildTacticalGraphicRenderPlan(
      [
        layer("layer-1", [graphic("cm1", { isHidden: true }), graphic("cm2")]),
        layer("layer-2", [graphic("cm3")], { isHidden: true }),
      ],
      { filterVisible: false },
    );
    expect(plan.graphics.map((g) => g.id)).toEqual(["cm2"]);
  });

  it("honours time-window hiding only when filterVisible is set", () => {
    const layers = [
      layer("layer-1", [graphic("cm1", { _hidden: true }), graphic("cm2")], {
        _hidden: false,
      }),
      layer("layer-2", [graphic("cm3")], { _hidden: true }),
    ];
    expect(
      buildTacticalGraphicRenderPlan(layers, { filterVisible: true }).graphics.map(
        (g) => g.id,
      ),
    ).toEqual(["cm2"]);
    // With the Layers panel open, time-hidden items stay visible for editing.
    expect(
      buildTacticalGraphicRenderPlan(layers, { filterVisible: false }).graphics.map(
        (g) => g.id,
      ),
    ).toEqual(["cm3", "cm1", "cm2"]);
  });

  it("is empty for a stack with no tactical graphics", () => {
    const plan = buildTacticalGraphicRenderPlan(
      [layer("layer-1", [geometry("g1")])],
      visible,
    );
    expect(plan).toEqual({ graphics: [], unsupportedIds: [], duplicateIds: [] });
  });
});

/**
 * The host projections are the reason `toControlMeasure` exists, and the plan is the
 * only thing that ever calls it in production. These assert that what the library is
 * actually handed carries the resolved colour and dash — not merely that the resolver
 * returns them in isolation, which `controlMeasures.test.ts` already covers.
 */
describe("buildTacticalGraphicRenderPlan host projections", () => {
  const styleOf = (item: NScenarioLayerItem) => onlyMeasure(item).style;

  it("resolves an identity colour onto the Graphic handed to the library", () => {
    // Asserted against `identityColor` rather than a literal RGB: the milsymbol
    // colour tier is a decision that lives there, not a fact about the render plan.
    expect(styleOf(graphic("cm1", { standardIdentity: "6" }))?.color).toBe(
      identityColor("6"),
    );
    expect(styleOf(graphic("cm2", { standardIdentity: "3" }))?.color).toBe(
      identityColor("3"),
    );
    expect(identityColor("6")).not.toBe(identityColor("3"));
  });

  it("resolves monochrome to a fixed black", () => {
    expect(
      styleOf(graphic("cm1", { standardIdentity: "3", colorMode: "monochrome" }))?.color,
    ).toBe(MONOCHROME_COLOR);
  });

  it("lets an authored colour and dash beat both projections", () => {
    const style = styleOf(
      graphic("cm1", {
        standardIdentity: "3",
        colorMode: "monochrome",
        status: "planned",
        style: { color: "#ff00ff", strokeDash: [1, 2] },
      }),
    );
    expect(style?.color).toBe("#ff00ff");
    expect(style?.strokeDash).toEqual([1, 2]);
  });

  it("dashes a planned graphic and explicitly undashes a present one", () => {
    expect(styleOf(graphic("cm1", { status: "planned" }))?.strokeDash).toEqual([
      ...PLANNED_STROKE_DASH,
    ]);
    // Empty rather than absent, so the projection always overrides the library's
    // own per-kind default instead of falling through to it.
    expect(styleOf(graphic("cm2", { status: "present" }))?.strokeDash).toEqual([]);
    expect(styleOf(graphic("cm3"))?.strokeDash).toEqual([]);
  });
});

describe("buildTacticalGraphicRenderPlan time projection", () => {
  it("hands the library the state-projected control points, not the stored ones", () => {
    // `_state` is what the kind-agnostic base pass writes at the current scenario
    // time; the render plan must read through it or a recorded graphic freezes.
    const item = graphic("cm1", {
      _state: {
        t: 1,
        controlPoints: [
          [5, 5],
          [6, 6],
        ],
      },
    });
    expect(onlyMeasure(item).controlPoints).toEqual([
      [5, 5],
      [6, 6],
    ]);
  });

  it("projects a state patch over the host projections too", () => {
    const item = graphic("cm1", {
      standardIdentity: "3",
      status: "present",
      _state: { t: 1, standardIdentity: "6", status: "planned" },
    });
    const style = onlyMeasure(item).style;
    expect(style?.color).toBe(identityColor("6"));
    expect(style?.strokeDash).toEqual([...PLANNED_STROKE_DASH]);
  });

  it("rebuilds the Graphic when the projection moves to a new time", () => {
    const item = graphic("cm1") as NScenarioLayerItem & TacticalGraphicLayerItem;
    const layers = [layer("layer-1", [item])];
    const before = buildTacticalGraphicRenderPlan(layers, visible)
      .graphics[0] as ControlMeasure;

    item._state = { t: 1, controlPoints: [[9, 9]] };
    const after = buildTacticalGraphicRenderPlan(layers, visible)
      .graphics[0] as ControlMeasure;

    // Identity must change here: the memoisation is keyed on the item object, which
    // the immer store mutates in place, so a stale Graphic would render the old shape.
    expect(after).not.toBe(before);
    expect(after.controlPoints).toEqual([[9, 9]]);
  });
});
