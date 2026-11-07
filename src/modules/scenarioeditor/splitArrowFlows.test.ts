import { describe, expect, it } from "vitest";
import { getControlMeasureMetadata } from "@orbat-mapper/control-measures";
import {
  applySplitFlowCommand,
  AUTO_LABEL_POSITION,
  RESET_HEAD_SIZE,
  sameHeadSizeEverywhere,
  splitArrowFlows,
  splitFlowActions,
  splitFlowParams,
  splitFlowValues,
  patchSplitFlowOptions,
  summarizeSplitFlows,
} from "@/modules/scenarioeditor/splitArrowFlows";

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
const bypassPoints = splitPoints.slice(0, 4);
const bypassOptions = {
  flows: [
    { count: 3 },
    { count: 1, splitFrom: { flow: 0, vertex: 0 }, mergeInto: { flow: 0, vertex: 2 } },
  ],
};

// A trunk of two points that continues into a flow split from its tip.
const continuedOptions = {
  flows: [{ count: 2 }, { count: 2, splitFrom: { flow: 0, vertex: 1 } }],
};

const keys = (params: { key: string }[]) => params.map((param) => param.key);

describe("splitArrowFlows", () => {
  it("reads an arrow without flows as one trunk over every point", () => {
    expect(splitArrowFlows(splitPoints, {})).toEqual([{ count: 5 }]);
  });

  it("reads flows that don't match the points as one trunk, as the engine draws them", () => {
    expect(splitArrowFlows(splitPoints, { flows: [{ count: 2 }] })).toEqual([
      { count: 5 },
    ]);
  });

  it("keeps flows whose counts cover the points", () => {
    expect(splitArrowFlows(splitPoints, splitOptions)).toEqual(splitOptions.flows);
  });
});

describe("summarizeSplitFlows", () => {
  it("names the trunk and numbers the flows after it", () => {
    expect(
      summarizeSplitFlows(splitPoints, splitOptions).map((flow) => flow.label),
    ).toEqual(["Trunk", "Flow 1"]);
  });

  it("gives a free tip a head, but not a merging flow", () => {
    expect(
      summarizeSplitFlows(bypassPoints, bypassOptions).map((flow) => flow.hasHead),
    ).toEqual([true, false]);
  });

  it("gives no head to a flow that continues into another from its tip", () => {
    expect(
      summarizeSplitFlows(splitPoints.slice(0, 4), continuedOptions).map(
        (flow) => flow.hasHead,
      ),
    ).toEqual([false, true]);
  });

  it("says whether a flow has a head size of its own", () => {
    const options = {
      flows: [{ count: 3 }, { ...splitOptions.flows[1]!, arrowheadScale: 2 }],
    };
    expect(
      summarizeSplitFlows(splitPoints, options).map((flow) => flow.ownHeadSize),
    ).toEqual([false, true]);
  });
});

describe("splitFlowParams", () => {
  const [trunk, flow] = summarizeSplitFlows(splitPoints, splitOptions);

  it("labels a flow with its own designation, but the trunk with Field T", () => {
    expect(keys(splitFlowParams(flow!))).toContain("designation");
    expect(keys(splitFlowParams(trunk!))).not.toContain("designation");
  });

  it("offers the label's placement and the head's style and size", () => {
    expect(keys(splitFlowParams(flow!))).toEqual([
      "designation",
      "labelVerticalAlignment",
      "labelPosition",
      "arrowheadStyle",
      "arrowheadScale",
      "arrowheadWidthRatio",
    ]);
  });

  it("offers no head fields on a flow without a head", () => {
    const [, merging] = summarizeSplitFlows(bypassPoints, bypassOptions);
    expect(keys(splitFlowParams(merging!))).toEqual([
      "designation",
      "labelVerticalAlignment",
      "labelPosition",
    ]);
  });

  it("shares the graphic's ranges and choices, and shows every field at once", () => {
    const graphic = getControlMeasureMetadata("split-arrow").params!;
    const params = splitFlowParams(flow!);
    const width = params.find((param) => param.key === "arrowheadWidthRatio")!;
    const { min, max } = graphic.find((param) => param.key === "arrowheadWidthRatio") as {
      min: number;
      max: number;
    };
    expect(width).toMatchObject({ min, max });
    expect(params.every((param) => param.presentationTier === undefined)).toBe(true);
  });
});

describe("splitFlowValues", () => {
  it("fills unset values with what the engine draws", () => {
    expect(splitFlowValues({ count: 2 }, {})).toEqual({
      designation: "",
      labelVerticalAlignment: "above",
      labelPosition: 0.5,
      arrowheadStyle: "triangle",
      arrowheadScale: 1,
      arrowheadWidthRatio: 0.75,
    });
  });

  it("falls back to the graphic's own style, alignment and width", () => {
    expect(
      splitFlowValues(
        { count: 2 },
        { arrowheadStyle: "tee", labelVerticalAlignment: "on", arrowheadWidthRatio: 1.5 },
      ),
    ).toMatchObject({
      arrowheadStyle: "tee",
      labelVerticalAlignment: "on",
      arrowheadWidthRatio: 1.5,
    });
  });

  it("shows the flow's own values over the graphic's", () => {
    expect(
      splitFlowValues(
        {
          count: 2,
          designation: "1/A",
          arrowheadStyle: "barbed",
          arrowheadScale: 2,
          labelPosition: 0.25,
          labelVerticalAlignment: "below",
        },
        { arrowheadStyle: "tee", labelVerticalAlignment: "on" },
      ),
    ).toMatchObject({
      designation: "1/A",
      arrowheadStyle: "barbed",
      arrowheadScale: 2,
      labelPosition: 0.25,
      labelVerticalAlignment: "below",
    });
  });
});

describe("patchSplitFlowOptions", () => {
  it("patches only the given flow", () => {
    expect(
      patchSplitFlowOptions(splitPoints, splitOptions, 1, { arrowheadScale: 2 }),
    ).toEqual({
      flows: [
        { count: 3 },
        { count: 2, splitFrom: { flow: 0, vertex: 1 }, arrowheadScale: 2 },
      ],
    });
  });

  it("drops a field patched to undefined, so the flow follows the graphic again", () => {
    const options = { flows: [{ count: 3, arrowheadScale: 2, arrowheadWidthRatio: 1 }] };
    expect(
      patchSplitFlowOptions(splitPoints.slice(0, 3), options, 0, RESET_HEAD_SIZE),
    ).toEqual({
      flows: [{ count: 3 }],
    });
  });

  it("clears an emptied designation", () => {
    const options = {
      flows: [{ count: 3 }, { ...splitOptions.flows[1]!, designation: "A" }],
    };
    expect(patchSplitFlowOptions(splitPoints, options, 1, { designation: "" })).toEqual(
      splitOptions,
    );
  });

  it("returns a label to automatic placement", () => {
    const options = { flows: [{ count: 3, labelPosition: 0.2 }, splitOptions.flows[1]!] };
    expect(patchSplitFlowOptions(splitPoints, options, 0, AUTO_LABEL_POSITION)).toEqual(
      splitOptions,
    );
  });

  it("stores flows for an arrow drawn without them", () => {
    expect(
      patchSplitFlowOptions(splitPoints, {}, 0, { labelVerticalAlignment: "on" }),
    ).toEqual({
      flows: [{ count: 5, labelVerticalAlignment: "on" }],
    });
  });
});

describe("sameHeadSizeEverywhere", () => {
  it("returns every flow's head to the graphic's size", () => {
    const options = {
      flows: [
        { count: 3, arrowheadScale: 2 },
        { ...splitOptions.flows[1]!, arrowheadWidthRatio: 1.2 },
      ],
    };
    expect(sameHeadSizeEverywhere(options)).toEqual(splitOptions);
  });
});

describe("splitFlowActions", () => {
  it("offers no Remove for the trunk", () => {
    expect(splitFlowActions(splitPoints, splitOptions, 0).remove).toBe(false);
    expect(splitFlowActions(splitPoints, splitOptions, 1).remove).toBe(true);
  });

  it("offers Detach only on a flow that merges", () => {
    expect(splitFlowActions(splitPoints, splitOptions, 1).detach).toBe(false);
    expect(splitFlowActions(bypassPoints, bypassOptions, 1).detach).toBe(true);
  });
});

describe("applySplitFlowCommand", () => {
  it("removes a flow with its points", () => {
    expect(applySplitFlowCommand(splitPoints, splitOptions, 1, "remove")).toEqual({
      controlPoints: splitPoints.slice(0, 3),
      options: { flows: [{ count: 3 }] },
    });
  });

  it("is null for an edit the engine refuses", () => {
    expect(applySplitFlowCommand(splitPoints, splitOptions, 0, "remove")).toBeNull();
  });
});
