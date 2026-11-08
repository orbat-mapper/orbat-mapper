import { describe, expect, it } from "vitest";
import {
  DEFAULT_FLOW_WIDTH_RATIO,
  getControlMeasureMetadata,
} from "@orbat-mapper/control-measures";
import {
  applyFlowCommand,
  CLEAR_FLOW_POINT_WIDTHS,
  flowActions,
  flowArrowFlows,
  sharedFlowParams,
  sharedFlowValues,
  flowValues,
  patchFlowOptions,
  summarizeFlows,
} from "@/modules/scenarioeditor/flowArrowFlows";

// A trunk of three points and a flow of two split from the trunk's middle point.
const splitPoints = [
  [0, 0],
  [1, 0],
  [2, 0],
  [1, 1],
  [2, 2],
];
const splitOptions = {
  flows: [{ count: 3 }, { count: 2, splitFrom: { flow: 0, vertex: 1 } }],
};

// A trunk and a one-point bypass that splits off and merges back in.
const bypassPoints = [
  [0, 0],
  [1, 0],
  [2, 0],
  [1, 1],
];
const bypassOptions = {
  flows: [
    { count: 3 },
    { count: 1, splitFrom: { flow: 0, vertex: 0 }, mergeInto: { flow: 0, vertex: 2 } },
  ],
};

// A flow of its own: no split, so it starts at its own rear.
const ownRearOptions = { flows: [{ count: 3 }, { count: 2 }] };

describe("flowArrowFlows", () => {
  it("reads an arrow without flows as one trunk over every point", () => {
    expect(flowArrowFlows(splitPoints, {})).toEqual([{ count: 5 }]);
  });

  it("reads flows that don't match the points as one trunk, as the engine draws them", () => {
    expect(flowArrowFlows(splitPoints, { flows: [{ count: 2 }] })).toEqual([
      { count: 5 },
    ]);
  });

  it("keeps flows whose counts cover the points", () => {
    expect(flowArrowFlows(splitPoints, splitOptions)).toEqual(splitOptions.flows);
  });
});

describe("summarizeFlows", () => {
  it("names the trunk and numbers the flows after it", () => {
    expect(summarizeFlows(splitPoints, splitOptions).map((flow) => flow.label)).toEqual([
      "Trunk",
      "Flow 1",
    ]);
  });

  it("says which flows have a rear of their own, besides the trunk", () => {
    expect(summarizeFlows(splitPoints, splitOptions).map((flow) => flow.ownRear)).toEqual(
      [false, false],
    );
    expect(
      summarizeFlows(splitPoints, ownRearOptions).map((flow) => flow.ownRear),
    ).toEqual([false, true]);
  });

  it("says whether a flow has point widths to clear", () => {
    const options = {
      flows: [
        { count: 3, vertexLeftWidthRatios: [null, 0.1, null] },
        splitOptions.flows[1]!,
      ],
    };
    expect(
      summarizeFlows(splitPoints, options).map((flow) => flow.hasPointWidths),
    ).toEqual([true, false]);
  });
});

describe("flowActions", () => {
  it("offers only the edits the engine would accept", () => {
    expect(flowActions(splitPoints, splitOptions, 0)).toEqual({
      reverse: true,
      detach: false,
      remove: false,
    });
    expect(flowActions(splitPoints, splitOptions, 1)).toEqual({
      reverse: true,
      detach: false,
      remove: true,
    });
    expect(flowActions(bypassPoints, bypassOptions, 1)).toMatchObject({
      detach: true,
      remove: true,
    });
  });
});

describe("sharedFlowParams", () => {
  const keys = (points: number[][], options: object, index: number) =>
    sharedFlowParams([summarizeFlows(points, options)[index]!]).map((param) => param.key);

  it("offers the arrowhead and width of a flow that ends in its own head", () => {
    expect(keys(splitPoints, splitOptions, 1)).toEqual([
      "arrowheadStyle",
      "widthRatio",
      "arrowheadWidthRatio",
      "arrowheadLengthRatio",
    ]);
  });

  it("drops the arrowhead fields from a flow that merges into another", () => {
    expect(keys(bypassPoints, bypassOptions, 1)).toEqual(["widthRatio"]);
  });

  it("adds a rear width for a flow with its own rear", () => {
    expect(keys(splitPoints, ownRearOptions, 1)).toContain("rearWidthRatio");
  });

  it("takes the graphic-wide params' ranges from the engine", () => {
    const graphic = getControlMeasureMetadata("flow-arrow").params!;
    const range = (key: string) => {
      const param = graphic.find((p) => p.key === key);
      return param?.type === "number" ? [param.min, param.max, param.step] : undefined;
    };
    const params = sharedFlowParams([summarizeFlows(splitPoints, ownRearOptions)[1]!]);
    const own = (key: string) => {
      const param = params.find((p) => p.key === key);
      return param?.type === "number" ? [param.min, param.max, param.step] : undefined;
    };
    expect(own("arrowheadWidthRatio")).toEqual(range("arrowheadWidthRatio"));
    expect(own("arrowheadLengthRatio")).toEqual(range("arrowheadLengthRatio"));
    expect(own("rearWidthRatio")).toEqual(range("rearWidthRatio"));
    expect(own("widthRatio")).toEqual(range("rearWidthRatio"));
    // Per-flow fields sit in the flow section, never in the Advanced fold.
    expect(params.every((p) => p.presentationTier === undefined)).toBe(true);
  });

  it("lists every arrowhead style the engine draws", () => {
    const style = sharedFlowParams([summarizeFlows(splitPoints, splitOptions)[0]!])[0]!;
    expect(style).toMatchObject({ key: "arrowheadStyle", type: "enum" });
    expect(
      style.type === "enum" && style.options.map((option) => option.value),
    ).toContain("main-attack");
  });
});

describe("flowValues", () => {
  it("fills unset fields with what the engine draws", () => {
    expect(flowValues({ count: 2 }, {})).toEqual({
      arrowheadStyle: "triangle",
      widthRatio: DEFAULT_FLOW_WIDTH_RATIO,
      rearWidthRatio: DEFAULT_FLOW_WIDTH_RATIO,
      arrowheadWidthRatio: 2.6,
      arrowheadLengthRatio: 2,
    });
  });

  it("falls back to the graphic's arrowhead proportions, and a rear to the flow's width", () => {
    expect(
      flowValues(
        { count: 2, widthRatio: 0.2 },
        { arrowheadWidthRatio: 3, arrowheadLengthRatio: 1 },
      ),
    ).toMatchObject({
      rearWidthRatio: 0.2,
      arrowheadWidthRatio: 3,
      arrowheadLengthRatio: 1,
    });
  });

  it("shows a flow's own values over the defaults", () => {
    expect(
      flowValues({ count: 2, arrowheadStyle: "tee", rearWidthRatio: 0.05 }, {}),
    ).toMatchObject({ arrowheadStyle: "tee", rearWidthRatio: 0.05 });
  });
});

describe("patchFlowOptions", () => {
  it("patches one flow and leaves the others", () => {
    expect(
      patchFlowOptions(splitPoints, splitOptions, [1], { arrowheadStyle: "tee" }),
    ).toEqual({
      flows: [
        { count: 3 },
        { count: 2, splitFrom: { flow: 0, vertex: 1 }, arrowheadStyle: "tee" },
      ],
    });
  });

  it("writes the trunk out when the arrow had no flows yet", () => {
    expect(patchFlowOptions(splitPoints, {}, [0], { widthRatio: 0.2 })).toEqual({
      flows: [{ count: 5, widthRatio: 0.2 }],
    });
  });

  it("clears a flow's point widths", () => {
    const options = {
      flows: [
        {
          count: 3,
          vertexLeftWidthRatios: [null, 0.1, null],
          vertexRightWidthRatios: [0.2],
        },
        splitOptions.flows[1]!,
      ],
    };
    expect(patchFlowOptions(splitPoints, options, [0], CLEAR_FLOW_POINT_WIDTHS)).toEqual(
      splitOptions,
    );
  });

  it("drops a key patched to undefined", () => {
    const options = { flows: [{ count: 5, widthRatio: 0.2 }] };
    expect(
      patchFlowOptions(splitPoints, options, [0], { widthRatio: undefined }),
    ).toEqual({
      flows: [{ count: 5 }],
    });
  });
});

describe("applyFlowCommand", () => {
  it("reverses a flow through the engine", () => {
    expect(applyFlowCommand(splitPoints, splitOptions, 1, "reverse")).toEqual({
      controlPoints: [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 2],
        [1, 1],
      ],
      options: { flows: [{ count: 3 }, { count: 2, mergeInto: { flow: 0, vertex: 1 } }] },
    });
  });

  it("removes a flow and keeps the rest of the options", () => {
    const edit = applyFlowCommand(
      splitPoints,
      { ...splitOptions, smooth: false },
      1,
      "remove",
    );
    expect(edit?.controlPoints).toHaveLength(3);
    expect(edit?.options).toMatchObject({ smooth: false, flows: [{ count: 3 }] });
  });

  it("gives a merged flow its tip back", () => {
    const edit = applyFlowCommand(bypassPoints, bypassOptions, 1, "detach");
    expect(edit?.controlPoints).toHaveLength(5);
    expect(edit?.options.flows?.[1]).not.toHaveProperty("mergeInto");
  });

  it("is null for an edit the engine refuses", () => {
    expect(applyFlowCommand(splitPoints, splitOptions, 0, "remove")).toBeNull();
    expect(applyFlowCommand(splitPoints, splitOptions, 1, "detach")).toBeNull();
  });
});

describe("several selected flows", () => {
  // Trunk, a flow with its own rear, and a flow that merges into the trunk.
  const points = [
    [0, 0],
    [1, 0],
    [2, 0],
    [5, 5],
    [6, 6],
    [1, 1],
  ];
  const options = {
    flows: [
      { count: 3, widthRatio: 0.2 },
      { count: 2, widthRatio: 0.2, arrowheadStyle: "tee" as const },
      { count: 1, splitFrom: { flow: 0, vertex: 0 }, mergeInto: { flow: 0, vertex: 2 } },
    ],
  };
  const [trunk, ownRear, merging] = summarizeFlows(points, options);
  const keys = (summaries: NonNullable<typeof trunk>[]) =>
    sharedFlowParams(summaries).map((param) => param.key);

  it("drops the arrowhead fields when any selected flow merges", () => {
    expect(keys([trunk!, merging!])).toEqual(["widthRatio"]);
  });

  it("offers a rear width only when every selected flow has its own rear", () => {
    expect(keys([ownRear!])).toContain("rearWidthRatio");
    expect(keys([trunk!, ownRear!])).not.toContain("rearWidthRatio");
  });

  it("shows the first flow's values and lists the fields that differ", () => {
    const { values, mixed } = sharedFlowValues([ownRear!, trunk!], options);
    expect(values.arrowheadStyle).toBe("tee");
    expect(mixed).toContain("arrowheadStyle");
    expect(mixed).not.toContain("widthRatio");
  });

  it("compares what the engine draws, so an unset field matches its default", () => {
    const same = {
      flows: [
        { count: 3, arrowheadStyle: "triangle" as const },
        { count: 2 },
        { count: 1 },
      ],
    };
    const [a, b] = summarizeFlows(points, same);
    expect(sharedFlowValues([a!, b!], same).mixed).toEqual([]);
  });

  it("applies a patch to every listed flow and leaves the others alone", () => {
    const { flows } = patchFlowOptions(points, options, [0, 2], { widthRatio: 0.4 });
    expect(flows!.map((flow) => flow.widthRatio)).toEqual([0.4, 0.2, 0.4]);
  });
});
