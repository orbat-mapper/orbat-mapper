import {
  DEFAULT_FLOW_ARROW_OPTIONS,
  DEFAULT_FLOW_WIDTH_RATIO,
  detachFlowEnd,
  FLOW_ARROWHEAD_STYLE_OPTIONS,
  patchFlowArrowFlow,
  removeFlow,
  reverseFlow,
  type FlowArrowEdit,
  type FlowArrowFlow,
  type FlowArrowOptions,
  type ParamDescriptor,
} from "@orbat-mapper/control-measures";
import type { Position } from "geojson";
import {
  drawnFlows,
  flowEditor,
  flowLabel,
  graphicParam,
  mixedKeys,
  type FlowCommand,
} from "@/modules/scenarioeditor/controlMeasureFlows";

/**
 * The host side of the Flow Arrow's flows: what the Details Panel
 * lists, the fields it shows for the selected flow, and the edits it offers.
 * The engine owns the topology rules; everything here either reads the
 * `flows` option or asks the engine's own edit helpers.
 */

const FLOW_EDITS = flowEditor({
  reverse: reverseFlow,
  detach: detachFlowEnd,
  remove: removeFlow,
});

/** The flow patch that clears its point widths. */
export const CLEAR_FLOW_POINT_WIDTHS: Partial<FlowArrowFlow> = {
  vertexLeftWidthRatios: undefined,
  vertexRightWidthRatios: undefined,
};

export interface FlowSummary {
  index: number;
  /** "Trunk" for `flows[0]`, "Flow n" for the rest. */
  label: string;
  flow: FlowArrowFlow;
  /** The flow ends on another flow, so it has no arrowhead of its own. */
  merges: boolean;
  /** A flow other than the trunk that starts at a rear of its own. */
  ownRear: boolean;
  hasPointWidths: boolean;
}

/** The flows the engine draws: `options.flows` when its counts cover the
 *  points, otherwise every point as one trunk. */
export function flowArrowFlows(
  controlPoints: readonly Position[],
  options: FlowArrowOptions,
): readonly FlowArrowFlow[] {
  return drawnFlows(controlPoints, options);
}

/** Whether a width grip has set any of the flow's point widths. */
export function flowHasPointWidths(flow: FlowArrowFlow): boolean {
  return [flow.vertexLeftWidthRatios, flow.vertexRightWidthRatios].some((widths) =>
    widths?.some((width) => width !== null && width !== undefined),
  );
}

/** Whether any flow has point widths: the Flow Arrow's counterpart of the
 *  top-level per-vertex width arrays other arrows carry. */
export function hasAnyFlowPointWidths(options: FlowArrowOptions): boolean {
  return options.flows?.some(flowHasPointWidths) ?? false;
}

/** The `flows` options patch that clears every flow's point widths. */
export function clearAllFlowPointWidths(
  options: FlowArrowOptions,
): Pick<FlowArrowOptions, "flows"> {
  return {
    flows: options.flows?.map((flow) =>
      patchFlowArrowFlow(flow, CLEAR_FLOW_POINT_WIDTHS),
    ),
  };
}

export function summarizeFlows(
  controlPoints: readonly Position[],
  options: FlowArrowOptions,
): FlowSummary[] {
  return flowArrowFlows(controlPoints, options).map((flow, index) => ({
    index,
    label: flowLabel(index),
    flow,
    merges: flow.mergeInto !== undefined,
    ownRear: index > 0 && flow.splitFrom === undefined,
    hasPointWidths: flowHasPointWidths(flow),
  }));
}

/** Which topology edits the engine would accept on flow `index`. */
export const flowActions = FLOW_EDITS.actions;

const ARROWHEAD_STYLE: ParamDescriptor = {
  key: "arrowheadStyle",
  label: "Arrowhead",
  description: "How this flow ends in front",
  type: "enum",
  options: FLOW_ARROWHEAD_STYLE_OPTIONS.map((option) => ({ ...option })),
};

// The per-flow overrides share the graphic-wide params' ranges. A flow's own
// width takes the rear width's range: both are fractions of the trunk's length.
const flowParam = (graphicKey: string, key: string, label: string, description: string) =>
  graphicParam("flow-arrow", graphicKey, { key, label, description });

const WIDTH = flowParam(
  "rearWidthRatio",
  "widthRatio",
  "Width",
  "Width where the arrowhead begins, as a fraction of the trunk's length",
);
const REAR_WIDTH = flowParam(
  "rearWidthRatio",
  "rearWidthRatio",
  "Rear width",
  "Width at this flow's own rear, as a fraction of the trunk's length",
);
const ARROWHEAD_WIDTH = flowParam(
  "arrowheadWidthRatio",
  "arrowheadWidthRatio",
  "Arrowhead width",
  "This flow's arrowhead width as a multiple of its width at the head",
);
const ARROWHEAD_LENGTH = flowParam(
  "arrowheadLengthRatio",
  "arrowheadLengthRatio",
  "Arrowhead length",
  "This flow's arrowhead length as a multiple of its width at the head",
);

/** The fields the selected flows share, in panel order. A merging flow has no
 *  head of its own to style, so arrowhead fields need none of them to merge;
 *  only a flow with its own rear has a rear width (the trunk's is the graphic's
 *  `rearWidthRatio`), so that needs each of them to have one. */
export function sharedFlowParams(summaries: readonly FlowSummary[]): ParamDescriptor[] {
  const merges = summaries.some((summary) => summary.merges);
  const ownRear = summaries.every((summary) => summary.ownRear);
  return [
    ...(merges ? [] : [ARROWHEAD_STYLE]),
    WIDTH,
    ...(ownRear ? [REAR_WIDTH] : []),
    ...(merges ? [] : [ARROWHEAD_WIDTH, ARROWHEAD_LENGTH]),
  ];
}

/** A flow's field values, unset ones filled with what the engine draws. */
export function flowValues(
  flow: FlowArrowFlow,
  options: FlowArrowOptions,
): Record<string, unknown> {
  const widthRatio = flow.widthRatio ?? DEFAULT_FLOW_WIDTH_RATIO;
  return {
    arrowheadStyle: flow.arrowheadStyle ?? "triangle",
    widthRatio,
    rearWidthRatio: flow.rearWidthRatio ?? widthRatio,
    arrowheadWidthRatio:
      flow.arrowheadWidthRatio ??
      options.arrowheadWidthRatio ??
      DEFAULT_FLOW_ARROW_OPTIONS.arrowheadWidthRatio,
    arrowheadLengthRatio:
      flow.arrowheadLengthRatio ??
      options.arrowheadLengthRatio ??
      DEFAULT_FLOW_ARROW_OPTIONS.arrowheadLengthRatio,
  };
}

/** The values several selected flows show: the first flow's, with the fields
 *  where what the engine draws differs between them listed as `mixed`. */
export function sharedFlowValues(
  summaries: readonly Pick<FlowSummary, "flow">[],
  options: FlowArrowOptions,
): { values: Record<string, unknown>; mixed: string[] } {
  const all = summaries.map(({ flow }) => flowValues(flow, options));
  return { values: all[0]!, mixed: mixedKeys(all) };
}

/** The `flows` options patch that applies `patch` to flows `parts`. */
export function patchFlowOptions(
  controlPoints: readonly Position[],
  options: FlowArrowOptions,
  parts: readonly number[],
  patch: Partial<FlowArrowFlow>,
): Pick<FlowArrowOptions, "flows"> {
  return {
    flows: flowArrowFlows(controlPoints, options).map((flow, i) =>
      parts.includes(i) ? patchFlowArrowFlow(flow, patch) : flow,
    ),
  };
}

/** The points and options after `command` on flow `index`, or `null` when the
 *  engine refuses it. */
export const applyFlowCommand: (
  controlPoints: readonly Position[],
  options: FlowArrowOptions,
  index: number,
  command: FlowCommand,
) => FlowArrowEdit | null = FLOW_EDITS.apply;
