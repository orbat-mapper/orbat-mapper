import type { ChangeKind, TimelineChange } from "./timelineChanges";

export const changeKindLabels: Record<ChangeKind, string> = {
  location: "Location",
  removed: "Removed from map",
  symbol: "Symbol",
  status: "Status",
  hierarchy: "Hierarchy",
  resources: "Resources",
  amplifiers: "Amplifiers",
  other: "Other",
  moving: "Moving",
  layerItem: "Map item",
};

/** The labels of a change's kinds, as a comma-separated list. */
export function formatChangeKinds(change: TimelineChange) {
  return change.kinds.map((k) => changeKindLabels[k]).join(", ");
}

/** Background classes for the colour dot of each change kind. */
export const changeKindDotClasses: Record<ChangeKind, string> = {
  location: "bg-sky-500",
  removed: "bg-zinc-500",
  symbol: "bg-violet-500",
  status: "bg-amber-500",
  hierarchy: "bg-emerald-500",
  resources: "bg-rose-500",
  amplifiers: "bg-slate-400",
  other: "bg-zinc-400",
  moving: "bg-cyan-500 dark:bg-cyan-300",
  layerItem: "bg-teal-500",
};

/** Short notes on what a change does, for list rows and lane tooltips. */
export function formatChangeDetails(
  change: TimelineChange,
  {
    unitName,
    statusName,
    formatTime,
  }: {
    unitName: (id: string) => string;
    /** Unit states store the id of a status in the scenario's status list. */
    statusName: (id: string) => string;
    formatTime: (t: number) => string;
  },
): string[] {
  const details: string[] = [];
  if (change.leg) {
    details.push(`${formatTime(change.leg.start)} → ${formatTime(change.leg.end)}`);
  }
  if (change.departure) details.push(`until ${formatTime(change.departure.end)}`);
  if (change.viaCount) {
    details.push(`via ${change.viaCount} waypoint${change.viaCount === 1 ? "" : "s"}`);
  }
  if (change.status) details.push(`status ${statusName(change.status)}`);
  if (change.reinforcedStatus) details.push(`reinforced ${change.reinforcedStatus}`);
  const { hierarchyFromId: from, hierarchyParentId: to } = change;
  if (to) {
    const name = unitName(to);
    details.push(from && from !== to ? `${unitName(from)} → ${name}` : `→ ${name}`);
  }
  if (change.resourceLineCount) {
    const n = change.resourceLineCount;
    details.push(`${n} resource line${n === 1 ? "" : "s"}`);
  }
  return details;
}
