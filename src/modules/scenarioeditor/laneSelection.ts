import type { ChangeGroup, TimelineChange } from "./timelineChanges";

/** A rectangle over the lanes, in px from the top left of the first lane. */
export interface LaneBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface LaneLayout {
  laneHeight: number;
  /** Where the lanes' track starts, in px from the left. */
  trackLeft: number;
  trackWidth: number;
  axis: [number, number];
}

/** The state marks whose centre is inside a box drawn over the lanes. Legs are left
 * out, since they are not selected. */
export function changesInBox(
  lanes: ChangeGroup[],
  box: LaneBox,
  { laneHeight, trackLeft, trackWidth, axis: [start, end] }: LaneLayout,
): TimelineChange[] {
  const out: TimelineChange[] = [];
  const first = Math.max(Math.floor(box.top / laneHeight), 0);
  const last = Math.min(Math.floor(box.bottom / laneHeight), lanes.length - 1);
  for (let i = first; i <= last; i++) {
    const y = (i + 0.5) * laneHeight;
    if (y < box.top || y > box.bottom) continue;
    for (const change of lanes[i].changes) {
      if (change.leg) continue;
      const x = trackLeft + ((change.t - start) / (end - start)) * trackWidth;
      if (x >= box.left && x <= box.right) out.push(change);
    }
  }
  return out;
}

/** The state marks on a lane from one change's time to another's, both included. */
export function changesBetween(
  lane: ChangeGroup,
  a: TimelineChange,
  b: TimelineChange,
): TimelineChange[] {
  const [from, to] = a.t <= b.t ? [a.t, b.t] : [b.t, a.t];
  return lane.changes.filter((c) => !c.leg && c.t >= from && c.t <= to);
}
