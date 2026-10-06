import type { Position } from "geojson";
import { coordAll } from "@turf/meta";
import { utcDay, utcHour, utcMinute } from "d3-time";
import { utcFormat } from "d3-time-format";
import type { Bbox } from "@/geo/contracts/mapAdapter";
import type { EntityId } from "@/types/base";
import {
  isNGeometryLayerItem,
  isNTacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";
import type { NScenarioLayerItem, NState, NUnit } from "@/types/internalModels";
import { MS_PER_DAY, MS_PER_HOUR } from "@/utils/time";

/** What a timed state entry changes. "moving" and "layerItem" are not unit state fields:
 * "moving" marks a unit travelling along an interpolated leg, and "layerItem" a timed
 * state on a map layer item. */
export type ChangeKind =
  | "location"
  | "removed"
  | "symbol"
  | "status"
  | "hierarchy"
  | "resources"
  | "amplifiers"
  | "other"
  | "moving"
  | "layerItem";

export type ChangeEntityType = "unit" | "layerItem";

/** The unit or map item a change is for. */
export type ChangeTarget = Pick<TimelineChange, "entityType" | "entityId">;

export interface TimelineChange {
  /** Unique within a collection: entity id plus state id (and a suffix for legs). */
  id: string;
  t: number;
  entityType: ChangeEntityType;
  entityId: EntityId;
  stateId: string;
  kinds: ChangeKind[];
  title?: string;
  status?: string | null;
  reinforcedStatus?: string;
  viaCount?: number;
  hierarchyParentId?: EntityId;
  /** On hierarchy changes: the parent the unit had before, as its last earlier move or
   * the ORBAT placed it. */
  hierarchyFromId?: EntityId;
  resourceLineCount?: number;
  /** Only on "moving" changes: the interpolated leg the unit travels along. */
  leg?: TimelineLeg;
  /** On a state the unit sets off from: the leg it starts, listed on the state rather
   * than as a "moving" change of its own (see mergeDepartures). */
  departure?: TimelineLeg;
  /** Where the change happens: a state's location, a leg's endpoints, or a layer
   * item's shape. */
  positions: Position[];
}

export interface TimelineLeg {
  start: number;
  end: number;
  /** The time of the unit's state before the leg. The leg can't start earlier. */
  earliest: number;
  /** The time of the unit's state after the leg, if any. The leg can't end later. */
  latest?: number;
}

/** A change to move to a new time. */
export interface ChangeMove {
  change: TimelineChange;
  t: number;
}

export interface ChangeGroup {
  entityType: ChangeEntityType;
  entityId: EntityId;
  changes: TimelineChange[];
}

export interface TimelineChangeSource {
  unitMap: Record<EntityId, NUnit>;
  layerItemMap: Record<EntityId, NScenarioLayerItem>;
}

export interface CollectOptions {
  includeMoving?: boolean;
  /** Leave out legs that arrive inside the range. Their arrival is already a
   * "location" change. Defaults to true. */
  skipArrivals?: boolean;
}

export interface AxisTick {
  t: number;
  label: string;
  /** Whether the tick starts a day in the scenario's time zone. */
  day: boolean;
}

const dayLabel = utcFormat("%d %b");
const hourLabel = utcFormat("%H:%M");
const dayHourLabel = utcFormat("%d %b %H:%M");

/** Ticks for the lanes time axis in the scenario's time zone. `offset` is the zone's UTC
 * offset in milliseconds. Like the scenario timeline, times are shifted by the offset and
 * laid out and labelled as UTC. Midnight ticks show the date, and when no midnight is in
 * range the first tick does, so every axis says which day it shows. */
export function laneAxisTicks(axis: [number, number], offset: number): AxisTick[] {
  const [start, end] = axis;
  const span = end - start;
  const interval =
    span <= 4 * MS_PER_HOUR
      ? utcMinute.every(30)
      : span <= 8 * MS_PER_HOUR
        ? utcHour
        : span <= 30 * MS_PER_HOUR
          ? utcHour.every(3)
          : span <= 4 * MS_PER_DAY
            ? utcHour.every(6)
            : span <= 8 * MS_PER_DAY
              ? utcDay
              : utcDay.every(2);
  // Labels are centred on their tick, so leave out ticks too close to an edge to fit.
  const margin = span * 0.02;
  const dates = interval!.range(
    new Date(start + offset + margin),
    new Date(end + offset - margin + 1),
  );
  const ticks = dates.map((d) => {
    const day = +utcDay.floor(d) === +d;
    return { t: +d - offset, day, label: day ? dayLabel(d) : hourLabel(d) };
  });
  if (ticks.length && !ticks.some(({ day }) => day)) {
    ticks[0].label = dayHourLabel(dates[0]);
  }
  return ticks;
}

type StateDescription = Pick<
  TimelineChange,
  | "kinds"
  | "status"
  | "reinforcedStatus"
  | "viaCount"
  | "hierarchyParentId"
  | "hierarchyFromId"
  | "resourceLineCount"
>;

export function describeUnitState(s: NState): StateDescription {
  const description: StateDescription = { kinds: [] };
  const { kinds } = description;
  if (s.location === null) {
    kinds.push("removed");
  } else if (s.location || s.via?.length) {
    kinds.push("location");
    if (s.via?.length) description.viaCount = s.via.length;
  }
  if (s.sidc || s.symbolRotation !== undefined) kinds.push("symbol");
  if (s.status !== undefined || s.reinforcedStatus) {
    kinds.push("status");
    if (s.status !== undefined) description.status = s.status;
    if (s.reinforcedStatus) description.reinforcedStatus = s.reinforcedStatus;
  }
  if (s.hierarchy) {
    kinds.push("hierarchy");
    description.hierarchyParentId = s.hierarchy.parentId ?? s.hierarchy.targetId;
  }
  if (s.update || s.diff) {
    kinds.push("resources");
    let lines = 0;
    for (const r of [s.update, s.diff]) {
      lines += (r?.equipment?.length ?? 0) + (r?.personnel?.length ?? 0);
      lines += r?.supplies?.length ?? 0;
    }
    if (lines) description.resourceLineCount = lines;
  }
  if (s.textAmplifiers || s.symbolOptions) kinds.push("amplifiers");
  if (!kinds.length) kinds.push("other");
  return description;
}

/** The id of the change for a unit or map item's timed state. */
export function stateChangeId(entityId: EntityId, stateId: string) {
  return `${entityId}:${stateId}`;
}

/** Whether a leg was already under way when the range it was listed for starts. It is
 * listed at the range start, but shown and gone to at the time it set off. */
export function isUnderWay(change: TimelineChange | undefined) {
  return !!change?.leg && change.leg.start < change.t;
}

/** The change at the time it happens: a leg under way at the time it set off. */
export function atStart(change: TimelineChange): TimelineChange {
  return isUnderWay(change) ? { ...change, t: change.leg!.start } : change;
}

function indexUnitStates(unit: NUnit, out: TimelineChange[]) {
  // The effective `_pid` follows the current time, so start from the ORBAT's parent.
  let parentId: EntityId | undefined = unit._basePid ?? unit._pid;
  for (const s of unit.state ?? []) {
    const description = describeUnitState(s);
    if (description.hierarchyParentId) {
      description.hierarchyFromId = parentId;
      parentId = description.hierarchyParentId;
    }
    out.push({
      id: stateChangeId(unit.id, s.id),
      t: s.t,
      entityType: "unit",
      entityId: unit.id,
      stateId: s.id,
      title: s.title,
      ...description,
      positions: s.location ? [s.location] : [],
    });
  }
}

/** Interpolated legs, with `t` at the leg start. Follows rebuildCurrentUnitState in
 * scenariostore/time.ts: a unit moves from its last known location towards the next
 * state that has a location, unless that state sets `interpolate: false`. Movement starts
 * at the previous state's time, or at `viaStartTime` if that is later. */
function indexUnitLegs(unit: NUnit, out: TimelineChange[]) {
  let lastLocation = unit.location ?? null;
  let lastT = Number.NEGATIVE_INFINITY;
  const states = unit.state ?? [];
  states.forEach((s, i) => {
    if (s.location !== undefined) {
      if (lastLocation && s.location && s.interpolate !== false) {
        const start = Math.max(s.viaStartTime ?? lastT, lastT);
        if (Number.isFinite(start)) {
          out.push({
            id: `${unit.id}:${s.id}:leg`,
            t: start,
            entityType: "unit",
            entityId: unit.id,
            stateId: s.id,
            kinds: ["moving"],
            leg: { start, end: s.t, earliest: lastT, latest: states[i + 1]?.t },
            positions: [lastLocation, s.location],
          });
        }
      }
      lastLocation = s.location;
    }
    lastT = s.t;
  });
}

/** How far a leg can be moved in time, as the earliest and latest shift. */
export function legShiftBounds({ start, end, earliest, latest }: TimelineLeg) {
  return [earliest - start, latest === undefined ? Infinity : latest - end] as const;
}

function geometryPositions(geometry: unknown): Position[] {
  if (!geometry) return [];
  try {
    return coordAll(geometry as Parameters<typeof coordAll>[0]);
  } catch {
    return [];
  }
}

/** Where a layer item is drawn: its current timed shape, or its base shape when
 * `current` is false. Control measures have control points, geometry items a geometry. */
export function getLayerItemPositions(
  item: NScenarioLayerItem,
  current = true,
): Position[] {
  if (isNTacticalGraphicLayerItem(item)) {
    return (current && item._state?.controlPoints) || item.controlPoints;
  }
  if (isNGeometryLayerItem(item)) {
    return geometryPositions((current && item._state?.geometry) || item.geometry);
  }
  return [];
}

/** Uses the item's base shape, since the index only changes with edits. Where the item
 * is now is up to the in-view filter. */
function indexLayerItemStates(item: NScenarioLayerItem, out: TimelineChange[]) {
  const states = (item.state ?? []) as { id: string; t: number }[];
  const positions = getLayerItemPositions(item, false);
  for (const s of states) {
    out.push({
      id: stateChangeId(item.id, s.id),
      t: s.t,
      entityType: "layerItem",
      entityId: item.id,
      stateId: s.id,
      kinds: ["layerItem"],
      positions,
    });
  }
}

/** Every change in a scenario, sorted so that a time range can be looked up without
 * walking every unit. Build it once per edit, then query it as time moves. */
export interface ChangeIndex {
  /** Timed states of units and layer items, oldest first. */
  states: TimelineChange[];
  /** Interpolated legs, by start time. */
  legs: TimelineChange[];
  /** The longest leg, which bounds how long before a range a leg into it can start. */
  maxLegMs: number;
}

const byTime = (a: TimelineChange, b: TimelineChange) => a.t - b.t;

export function buildChangeIndex(source: TimelineChangeSource): ChangeIndex {
  const states: TimelineChange[] = [];
  const legs: TimelineChange[] = [];
  for (const unit of Object.values(source.unitMap)) {
    if (!unit?.state?.length) continue;
    indexUnitStates(unit, states);
    indexUnitLegs(unit, legs);
  }
  for (const item of Object.values(source.layerItemMap)) {
    if (item?.state?.length) indexLayerItemStates(item, states);
  }
  states.sort(byTime);
  legs.sort(byTime);
  let maxLegMs = 0;
  for (const { leg } of legs) maxLegMs = Math.max(maxLegMs, leg!.end - leg!.start);
  return { states, legs, maxLegMs };
}

/** The index of the first change at or after `t` in changes sorted by time, or the first
 * change strictly after it with `after`. Works on any rows with a time. */
export function findChangeIndex(changes: { t: number }[], t: number, after = false) {
  let lo = 0;
  let hi = changes.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (after ? changes[mid].t <= t : changes[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Every change in [from, to), oldest first. A leg's `t` is clamped to the range start. */
export function queryChangeIndex(
  index: ChangeIndex,
  [from, to]: [number, number],
  { includeMoving = false, skipArrivals = true }: CollectOptions = {},
): TimelineChange[] {
  const states = index.states.slice(
    findChangeIndex(index.states, from),
    findChangeIndex(index.states, to),
  );
  if (!includeMoving) return states;
  const legs: TimelineChange[] = [];
  const allLegs = index.legs;
  for (let i = findChangeIndex(allLegs, from - index.maxLegMs); i < allLegs.length; i++) {
    const change = allLegs[i];
    const { start, end } = change.leg!;
    if (start >= to) break;
    if (end <= from || (skipArrivals && end < to)) continue;
    legs.push({ ...change, t: Math.max(start, from) });
  }
  // Both lists are in time order (clamping keeps legs in start order), so merge them.
  const out: TimelineChange[] = [];
  let i = 0;
  let j = 0;
  while (i < states.length && j < legs.length) {
    out.push(legs[j].t < states[i].t ? legs[j++] : states[i++]);
  }
  for (; i < states.length; i++) out.push(states[i]);
  for (; j < legs.length; j++) out.push(legs[j]);
  return out;
}

/** Whether two queries of the index found the same changes. Legs are copied per query and
 * a leg under way has its time clamped to the range start, which moves with the range, so
 * legs match by the index's leg and whether they are under way. */
export function isSameChangeList(a: TimelineChange[], b: TimelineChange[]) {
  return (
    a.length === b.length &&
    a.every((c, i) => {
      const d = b[i];
      if (c === d) return true;
      return !!c.leg && c.leg === d.leg && c.t > c.leg.start === d.t > d.leg.start;
    })
  );
}

/** Puts each leg that sets off at a listed change of its unit on that change, as its
 * `departure`, so the unit has one row at that time instead of two. Legs already under
 * way when the range starts keep their own row. */
export function mergeDepartures(changes: TimelineChange[]): TimelineChange[] {
  const states = new Map<string, number>();
  changes.forEach((c, i) => {
    if (!c.leg && c.entityType === "unit") states.set(`${c.entityId}@${c.t}`, i);
  });
  const departures = new Map<number, TimelineChange>();
  for (const c of changes) {
    if (!c.leg || c.leg.start !== c.t) continue;
    const i = states.get(`${c.entityId}@${c.t}`);
    if (i !== undefined && !departures.has(i)) departures.set(i, c);
  }
  if (!departures.size) return changes;
  const merged = new Set(departures.values());
  const out: TimelineChange[] = [];
  changes.forEach((c, i) => {
    if (merged.has(c)) return;
    const leg = departures.get(i);
    out.push(
      leg
        ? {
            ...c,
            kinds: [...c.kinds, "moving"],
            departure: leg.leg,
            positions: [...c.positions, ...leg.positions],
          }
        : c,
    );
  });
  return out;
}

/** The first timed state at or after `t` that `accept` takes. Legs are left out, since
 * each ends at a state. */
export function findNextChange(
  index: ChangeIndex,
  t: number,
  accept: (change: TimelineChange) => boolean = () => true,
): TimelineChange | undefined {
  const { states } = index;
  for (let i = findChangeIndex(states, t); i < states.length; i++) {
    if (accept(states[i])) return states[i];
  }
}

/** The last timed state before `t` that `accept` takes. Legs are left out, since each
 * ends at a state. */
export function findPreviousChange(
  index: ChangeIndex,
  t: number,
  accept: (change: TimelineChange) => boolean = () => true,
): TimelineChange | undefined {
  const { states } = index;
  for (let i = findChangeIndex(states, t) - 1; i >= 0; i--) {
    if (accept(states[i])) return states[i];
  }
}

function isInBbox([lon, lat]: Position, [west, south, east, north]: Bbox) {
  if (lat < south || lat > north) return false;
  // MapLibre reports west/east outside ±180 when the view crosses the antimeridian.
  const inLon = (x: number) => x >= west && x <= east;
  return inLon(lon) || inLon(lon - 360) || inLon(lon + 360);
}

/** A change is in view if it happens in view, or if its unit or map item is in view now. */
export function isChangeInView(
  change: TimelineChange,
  bbox: Bbox,
  currentPositions: Position[] = [],
) {
  const inView = (p: Position) => isInBbox(p, bbox);
  return currentPositions.some(inView) || change.positions.some(inView);
}

/** Groups changes by unit or layer item, keeping the first-seen order. */
export function groupChangesByEntity(changes: TimelineChange[]): ChangeGroup[] {
  const groups = new Map<EntityId, ChangeGroup>();
  for (const change of changes) {
    let group = groups.get(change.entityId);
    if (!group) {
      group = { entityType: change.entityType, entityId: change.entityId, changes: [] };
      groups.set(change.entityId, group);
    }
    group.changes.push(change);
  }
  return [...groups.values()];
}

export function countChangeKinds(changes: TimelineChange[]): Map<ChangeKind, number> {
  const counts = new Map<ChangeKind, number>();
  for (const change of changes) {
    for (const kind of change.kinds) counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  return counts;
}
