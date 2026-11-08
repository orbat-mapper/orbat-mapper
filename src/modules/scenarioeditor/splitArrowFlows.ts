import {
  DEFAULT_SPLIT_ARROW_OPTIONS,
  detachSplitArrowFlowEnd,
  removeSplitArrowFlow,
  reverseSplitArrowFlow,
  withoutSplitArrowHeadSize,
  type ParamDescriptor,
  type SplitArrowEdit,
  type SplitArrowFlow,
  type SplitArrowOptions,
} from "@orbat-mapper/control-measures";
import type { Position } from "geojson";
import { omit } from "es-toolkit";
import {
  drawnFlows,
  flowEditor,
  flowLabel,
  graphicParam,
  mixedKeys,
  type FlowCommand,
} from "@/modules/scenarioeditor/controlMeasureFlows";

/**
 * The host side of the Split Arrow's flows, the Flow Arrow's counterpart in
 * `flowArrowFlows.ts`: what the Details Panel lists, the fields it shows for
 * the selected flow, and the edits it offers. The engine owns the topology
 * rules; everything here either reads the `flows` option or asks the engine's
 * own edit helpers.
 */

const FLOW_EDITS = flowEditor({
  reverse: reverseSplitArrowFlow,
  detach: detachSplitArrowFlowEnd,
  remove: removeSplitArrowFlow,
});

/** The flow patch that returns its head to the graphic's size. */
export const RESET_HEAD_SIZE: Partial<SplitArrowFlow> = {
  arrowheadScale: undefined,
  arrowheadWidthRatio: undefined,
};

/** The flow patch that places its label automatically again. */
export const AUTO_LABEL_POSITION: Partial<SplitArrowFlow> = { labelPosition: undefined };

export interface SplitFlowSummary {
  index: number;
  /** "Trunk" for `flows[0]`, "Flow n" for the rest. */
  label: string;
  flow: SplitArrowFlow;
  /** The flow ends in an arrowhead: it neither merges nor continues into
   *  flows split from its tip. */
  hasHead: boolean;
  /** The flow sizes its head itself rather than taking the graphic's size. */
  ownHeadSize: boolean;
}

/** The flows the engine draws: `options.flows` when its counts cover the
 *  points, otherwise every point as one trunk. */
export function splitArrowFlows(
  controlPoints: readonly Position[],
  options: SplitArrowOptions,
): readonly SplitArrowFlow[] {
  return drawnFlows(controlPoints, options);
}

/** Whether another flow splits from flow `index`'s tip. A split flow's
 *  vertices start with the point it splits from, so its tip is one further. */
function continuesFromTip(flows: readonly SplitArrowFlow[], index: number): boolean {
  const flow = flows[index]!;
  const tip = flow.count - 1 + (flow.splitFrom ? 1 : 0);
  return flows.some(
    (other) => other.splitFrom?.flow === index && other.splitFrom.vertex === tip,
  );
}

export function summarizeSplitFlows(
  controlPoints: readonly Position[],
  options: SplitArrowOptions,
): SplitFlowSummary[] {
  const flows = splitArrowFlows(controlPoints, options);
  return flows.map((flow, index) => ({
    index,
    label: flowLabel(index),
    flow,
    hasHead: flow.mergeInto === undefined && !continuesFromTip(flows, index),
    ownHeadSize: withoutSplitArrowHeadSize(flow) !== flow,
  }));
}

/** Which topology edits the engine would accept on flow `index`. */
export const splitFlowActions = FLOW_EDITS.actions;

// The per-flow overrides share the graphic-wide params' ranges and choices.
const flowParam = (key: string, label: string, description: string) =>
  graphicParam("split-arrow", key, { label, description });

const DESIGNATION: ParamDescriptor = {
  key: "designation",
  label: "Label",
  description: "Designation drawn along this flow",
  type: "text",
  maxLength: 32,
};

/** The key of the trunk's label field: the graphic's Field T, not a flow option. */
export const TRUNK_LABEL_KEY = "T";

const TRUNK_LABEL: ParamDescriptor = {
  key: TRUNK_LABEL_KEY,
  label: "Label",
  description:
    "Designation drawn along the trunk. It is the graphic's Field T, also under Text labels",
  type: "text",
  maxLength: 32,
};

const LABEL_ALIGNMENT = flowParam(
  "labelVerticalAlignment",
  "Label alignment",
  "Where this flow's label sits across it",
);

const LABEL_POSITION: ParamDescriptor = {
  key: "labelPosition",
  label: "Label position",
  description:
    "Where the label sits along this flow, from its start (0) to its tip (1). Until set, it stays clear of splits and merges",
  type: "number",
  min: 0,
  max: 1,
  step: 0.01,
};

const ARROWHEAD_STYLE = flowParam(
  "arrowheadStyle",
  "Arrowhead",
  "How this flow ends in front",
);

// The engine accepts 0.1–10; a slider over that range is too coarse near 1,
// where heads are sized, so the panel offers the useful middle of it.
const ARROWHEAD_SCALE: ParamDescriptor = {
  key: "arrowheadScale",
  label: "Arrowhead size",
  description:
    "This flow's arrowhead length as a multiple of the arrow's. Ctrl/⌘ + drag a head's grip sizes every head",
  type: "number",
  min: 0.25,
  max: 4,
  step: 0.05,
};

const ARROWHEAD_WIDTH = flowParam(
  "arrowheadWidthRatio",
  "Arrowhead width",
  "This flow's arrowhead width as a ratio of its length",
);

/** The fields the selected flows share, in panel order. The trunk's label is
 *  the graphic's Field T (`TRUNK_LABEL_KEY`), offered only for the trunk alone;
 *  with any other flow among them the label is those flows' own. A flow without
 *  a head has no head to style, so head fields need each to have one. */
export function sharedSplitFlowParams(
  summaries: readonly SplitFlowSummary[],
): ParamDescriptor[] {
  return [
    summaries.some((summary) => summary.index > 0) ? DESIGNATION : TRUNK_LABEL,
    LABEL_ALIGNMENT,
    LABEL_POSITION,
    ...(summaries.every((summary) => summary.hasHead)
      ? [ARROWHEAD_STYLE, ARROWHEAD_SCALE, ARROWHEAD_WIDTH]
      : []),
  ];
}

/** A flow's field values, unset ones filled with what the engine draws. An
 *  automatic label position reads as the middle. */
export function splitFlowValues(
  flow: SplitArrowFlow,
  options: SplitArrowOptions,
): Record<string, unknown> {
  const inherit = <
    K extends "labelVerticalAlignment" | "arrowheadStyle" | "arrowheadWidthRatio",
  >(
    key: K,
  ) => flow[key] ?? options[key] ?? DEFAULT_SPLIT_ARROW_OPTIONS[key];
  return {
    designation: flow.designation ?? "",
    labelVerticalAlignment: inherit("labelVerticalAlignment"),
    labelPosition: flow.labelPosition ?? 0.5,
    arrowheadStyle: inherit("arrowheadStyle"),
    arrowheadScale: flow.arrowheadScale ?? 1,
    arrowheadWidthRatio: inherit("arrowheadWidthRatio"),
  };
}

/** The values several selected flows show: the first flow's, with the fields
 *  where they differ listed as `mixed`. An automatic label position differs
 *  from any set one, even the middle it reads as. The trunk takes no part in
 *  the label: its own is the graphic's Field T. */
export function sharedSplitFlowValues(
  summaries: readonly Pick<SplitFlowSummary, "index" | "flow">[],
  options: SplitArrowOptions,
): { values: Record<string, unknown>; mixed: string[] } {
  const designation = summaries.find(({ index }) => index > 0)?.flow.designation ?? "";
  const compared = summaries.map(({ index, flow }) => ({
    ...splitFlowValues(flow, options),
    labelPosition: flow.labelPosition,
    designation: index > 0 ? (flow.designation ?? "") : designation,
  }));
  return {
    values: { ...splitFlowValues(summaries[0]!.flow, options), designation },
    mixed: mixedKeys(compared),
  };
}

/** `flow` with `patch` applied; a key patched to `undefined`, or an emptied
 *  designation, is dropped so the flow follows the graphic again. */
function patchFlow(flow: SplitArrowFlow, patch: Partial<SplitArrowFlow>): SplitArrowFlow {
  const patched: Record<string, unknown> = { ...flow, ...patch };
  for (const key of Object.keys(patch))
    if (patched[key] === undefined) delete patched[key];
  if (patched.designation === "") delete patched.designation;
  return patched as unknown as SplitArrowFlow;
}

/** The `flows` options patch that applies `patch` to flows `parts`. A label goes
 *  on all of them but the trunk, whose label is the graphic's Field T. */
export function patchSplitFlowOptions(
  controlPoints: readonly Position[],
  options: SplitArrowOptions,
  parts: readonly number[],
  patch: Partial<SplitArrowFlow>,
): Pick<SplitArrowOptions, "flows"> {
  return {
    flows: splitArrowFlows(controlPoints, options).map((flow, i) =>
      parts.includes(i)
        ? patchFlow(flow, i === 0 ? omit(patch, ["designation"]) : patch)
        : flow,
    ),
  };
}

/** The `flows` options patch that gives every head the graphic's size. */
export function sameHeadSizeEverywhere(
  options: SplitArrowOptions,
): Pick<SplitArrowOptions, "flows"> {
  return { flows: options.flows?.map(withoutSplitArrowHeadSize) };
}

/** The points and options after `command` on flow `index`, or `null` when the
 *  engine refuses it. */
export const applySplitFlowCommand: (
  controlPoints: readonly Position[],
  options: SplitArrowOptions,
  index: number,
  command: FlowCommand,
) => SplitArrowEdit | null = FLOW_EDITS.apply;
