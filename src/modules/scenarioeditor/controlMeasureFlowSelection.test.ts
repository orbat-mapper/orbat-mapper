import { describe, expect, it } from "vitest";
import {
  flowSelectionHeading,
  mixedKeys,
  nextFlowSelection,
  selectedSummaries,
} from "@/modules/scenarioeditor/controlMeasureFlows";

describe("nextFlowSelection", () => {
  const two = { primary: 2, parts: [0, 2] };

  it("selects a flow alone on a plain click", () => {
    expect(nextFlowSelection(two, 1, false)).toEqual({ primary: 1, parts: [1] });
  });

  it("adds a flow on an extending click and makes it the primary", () => {
    expect(nextFlowSelection(two, 1, true)).toEqual({ primary: 1, parts: [0, 2, 1] });
  });

  it("takes a flow out, promoting the most recently added when it was the primary", () => {
    expect(nextFlowSelection(two, 0, true)).toEqual({ primary: 2, parts: [2] });
    expect(nextFlowSelection({ primary: 2, parts: [1, 0, 2] }, 2, true)).toEqual({
      primary: 0,
      parts: [1, 0],
    });
  });

  it("keeps the last selected flow", () => {
    const one = { primary: 1, parts: [1] };
    expect(nextFlowSelection(one, 1, true)).toEqual(one);
  });
});

describe("selectedSummaries", () => {
  const summaries = [{ index: 0 }, { index: 1 }, { index: 2 }];

  it("puts the primary first", () => {
    expect(selectedSummaries(summaries, summaries[2]!, [0, 2])).toEqual([
      { index: 2 },
      { index: 0 },
    ]);
  });

  it("reads absent or empty parts as the primary alone", () => {
    expect(selectedSummaries(summaries, summaries[1]!, undefined)).toEqual([
      { index: 1 },
    ]);
    expect(selectedSummaries(summaries, summaries[1]!, [])).toEqual([{ index: 1 }]);
  });

  it("skips a part the arrow no longer has", () => {
    expect(selectedSummaries(summaries, summaries[0]!, [0, 7])).toEqual([{ index: 0 }]);
  });
});

describe("flowSelectionHeading", () => {
  it("names one flow, counts several, and says when they are all of them", () => {
    const a = { label: "Trunk" };
    const b = { label: "Flow 1" };
    expect(flowSelectionHeading([b], 3)).toBe("Flow 1");
    expect(flowSelectionHeading([a, b], 3)).toBe("2 flows");
    expect(flowSelectionHeading([a, b], 2)).toBe("All flows");
  });
});

describe("mixedKeys", () => {
  it("lists the keys where any flow differs from the first", () => {
    expect(
      mixedKeys([
        { a: 1, b: 1 },
        { a: 1, b: 2 },
      ]),
    ).toEqual(["b"]);
  });
});
