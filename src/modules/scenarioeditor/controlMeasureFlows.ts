import {
  getControlMeasureMetadata,
  type ControlMeasureKind,
  type FlowVertexRef,
  type ParamDescriptor,
} from "@orbat-mapper/control-measures";
import type { Position } from "geojson";

/**
 * What the Flow Arrow and the Split Arrow share as arrows drawn as flows: the
 * flows the engine draws, the panel's flow names, the topology edits it
 * offers, and per-flow fields read from the graphic's metadata.
 */

/** The topology part every flow shares. */
export interface Flow {
  count: number;
  splitFrom?: FlowVertexRef;
  mergeInto?: FlowVertexRef;
}

/** A topology edit the panel offers on one flow. */
export type FlowCommand = "reverse" | "detach" | "remove";

/** Which topology edits the engine would accept on one flow. */
export type FlowActions = Record<FlowCommand, boolean>;

type FlowEdit<O, E> = (
  controlPoints: readonly Position[],
  options: O,
  flow: number,
) => E | null;

/** The flows the engine draws: `options.flows` when its counts cover the
 *  points, otherwise every point as one trunk. */
export function drawnFlows<F extends Flow>(
  controlPoints: readonly Position[],
  options: { flows?: readonly F[] },
): readonly F[] {
  const flows = options.flows;
  if (
    flows?.length &&
    flows.reduce((sum, flow) => sum + flow.count, 0) === controlPoints.length
  )
    return flows;
  return [{ count: controlPoints.length } as F];
}

/** "Trunk" for `flows[0]`, "Flow n" for the rest. */
export function flowLabel(index: number): string {
  return index === 0 ? "Trunk" : `Flow ${index}`;
}

/** The panel's side of one kind's topology edits. */
export function flowEditor<F extends Flow, O extends { flows?: readonly F[] }, E>(
  edits: Record<FlowCommand, FlowEdit<O, E>>,
) {
  return {
    /** Trial-runs the edits flow `index` can show. Each is a full engine
     *  edit, so this is for the one flow the panel shows, not for every
     *  flow; Detach only applies to a merging flow, Remove never to the trunk. */
    actions(controlPoints: readonly Position[], options: O, index: number): FlowActions {
      const flow = drawnFlows(controlPoints, options)[index];
      const accepts = (command: FlowCommand) =>
        edits[command](controlPoints, options, index) !== null;
      return {
        reverse: accepts("reverse"),
        detach: flow?.mergeInto !== undefined && accepts("detach"),
        remove: index > 0 && accepts("remove"),
      };
    },
    /** The points and options after `command` on flow `index`, or `null`
     *  when the engine refuses it. */
    apply(
      controlPoints: readonly Position[],
      options: O,
      index: number,
      command: FlowCommand,
    ) {
      return edits[command](controlPoints, options, index);
    },
  };
}

/** A per-flow field built from the graphic-wide param `graphicKey`, so the two
 *  mean the same thing and follow engine changes. Shown at once: the flow
 *  section has no Advanced fold. */
export function graphicParam(
  kind: ControlMeasureKind,
  graphicKey: string,
  overrides: { key?: string; label: string; description: string },
): ParamDescriptor {
  const param = getControlMeasureMetadata(kind).params?.find((p) => p.key === graphicKey);
  if (!param) throw new Error(`${kind} has no ${graphicKey} param`);
  const rest: Partial<ParamDescriptor> = { ...param };
  delete rest.presentationTier;
  return { ...rest, ...overrides } as ParamDescriptor;
}
