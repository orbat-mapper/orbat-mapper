import type { CurrentState } from "@/types/scenarioModels";
import type {
  NGeometryLayerItem,
  NSide,
  NSideGroup,
  NUnit,
} from "@/types/internalModels";
import type { EntityId, DropTarget } from "@/types/base";
import { klona } from "klona";
import { invalidateUnitStyle } from "@/geo/unitStyles";
import type { ScenarioState } from "./newScenarioStore";
import {
  createInitialGeometryLayerItemState,
  isNGeometryLayerItem,
  projectGeometryLayerItemState,
} from "@/types/scenarioLayerItems";
import { isScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import { lineString } from "@turf/helpers";
import turfLength from "@turf/length";
import turfAlong from "@turf/along";
import { setSid } from "@/symbology/helpers";

// ---------------------------------------------------------------------------
// Unit state projection
// ---------------------------------------------------------------------------

export function createInitialState(unit: NUnit): CurrentState | null {
  if (
    unit.location ||
    unit.reinforcedStatus !== undefined ||
    unit.equipment?.length ||
    unit.personnel?.length ||
    unit.supplies?.length
  )
    return {
      t: Number.MIN_SAFE_INTEGER,
      location: unit.location,
      type: "initial",
      sidc: unit.sidc,
      symbolRotation: 0,
      reinforcedStatus: unit.reinforcedStatus,
      equipment: klona(unit.equipment),
      personnel: klona(unit.personnel),
      supplies: klona(unit.supplies),
    };
  return null;
}

type CountedItem = { id: EntityId; count?: number; onHand?: number };
const COUNTED_FIELDS = ["equipment", "personnel", "supplies"] as const;

function applyUpdate(items: CountedItem[], updates: CountedItem[], label: string) {
  for (const u of updates) {
    const idx = items.findIndex((it) => it.id === u.id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...u };
    } else {
      console.warn(`${label} not found`, u);
    }
  }
}

function applyDiff(items: CountedItem[], diffs: CountedItem[], label: string) {
  for (const d of diffs) {
    const idx = items.findIndex((it) => it.id === d.id);
    if (idx !== -1) {
      const it = items[idx];
      const onHand = (it?.onHand ?? it.count ?? 0) + (d.onHand ?? 0);
      items[idx] = { ...it, onHand };
    } else {
      console.warn(`${label} not found`, d);
    }
  }
}

function invalidateUnitStyleCache(unit: NUnit, state: ScenarioState) {
  if (unit._ikey) {
    invalidateUnitStyle(unit._ikey);
    unit._ikey = undefined;
  }
  invalidateUnitStyle(unit.id);
  state.isMapStylesDirty = true;
}

function updateCurrentUnitState(unit: NUnit, timestamp: number, state: ScenarioState) {
  if (!unit.state || !unit.state.length) {
    if (!unit._state) {
      unit._state = createInitialState(unit);
    }
    return;
  }
  let currentState = createInitialState(unit);
  for (const s of unit.state) {
    if (s.t <= timestamp) {
      const { diff, update, ...rest } = s;
      for (const field of COUNTED_FIELDS) {
        const items = currentState?.[field];
        if (update?.[field] && items) applyUpdate(items, update[field]!, field);
        if (diff?.[field] && items) applyDiff(items, diff[field]!, field);
      }
      currentState = { ...currentState, ...rest };
    } else {
      if (
        currentState?.location &&
        s.location &&
        !(s.interpolate === false) &&
        (s.viaStartTime ?? -Infinity) <= timestamp
      ) {
        const n = lineString(
          s.via
            ? [currentState.location, ...s.via, s.location]
            : [currentState.location, s.location],
        );
        const timeDiff = s.t - (s.viaStartTime ?? currentState.t);
        const pathLength = turfLength(n);
        const averageSpeed = pathLength / timeDiff;
        const p = turfAlong(
          n,
          averageSpeed * (timestamp - (s.viaStartTime ?? currentState.t)),
        );
        currentState = {
          ...currentState,
          t: timestamp,
          location: p.geometry.coordinates,
          type: "interpolated",
        };
      }
      break;
    }
  }
  if (
    currentState?.sidc !== unit._state?.sidc ||
    currentState?.symbolRotation !== unit._state?.symbolRotation ||
    currentState?.reinforcedStatus !== unit._state?.reinforcedStatus
  ) {
    invalidateUnitStyleCache(unit, state);
  }
  unit._state = currentState;
}

// ---------------------------------------------------------------------------
// Hierarchy projection
// ---------------------------------------------------------------------------

type HierarchyParent = NSide | NSideGroup | NUnit;

type TimedHierarchyEntry = {
  unitId: EntityId;
  stateIndex: number;
  t: number;
  hierarchy: {
    targetId: EntityId;
    placement: DropTarget;
    parentId?: EntityId;
  };
};

function getEntityById(id: EntityId, state: ScenarioState): HierarchyParent | undefined {
  if (id in state.unitMap) return state.unitMap[id];
  if (id in state.sideGroupMap) return state.sideGroupMap[id];
  if (id in state.sideMap) return state.sideMap[id];
  return undefined;
}

function getEffectiveParent(
  unit: NUnit,
  state: ScenarioState,
): HierarchyParent | undefined {
  return getEntityById(unit._pid, state);
}

function getContextFromParent(
  parent: HierarchyParent,
  state: ScenarioState,
): { side: NSide; sideGroup?: NSideGroup } | null {
  if ("groups" in parent) {
    return { side: parent };
  }
  if (!("sidc" in parent)) {
    const side = state.sideMap[parent._pid];
    return side ? { side, sideGroup: parent } : null;
  }
  const side = state.sideMap[parent._sid];
  if (!side) return null;
  const sideGroup = parent._gid ? state.sideGroupMap[parent._gid] : undefined;
  return { side, sideGroup };
}

function syncProjectedUnitSidc(unit: NUnit, side: NSide, state: ScenarioState) {
  const previousSidc = unit._state?.sidc ?? unit.sidc;
  const projectedSidc = setSid(previousSidc, side.standardIdentity);
  if (projectedSidc === previousSidc) return false;

  unit._state = {
    t: unit._state?.t ?? Number.MIN_SAFE_INTEGER,
    ...(unit._state ?? {}),
    sidc: projectedSidc,
    symbolRotation: unit._state?.symbolRotation ?? 0,
    type: unit._state?.type ?? "initial",
  };

  invalidateUnitStyleCache(unit, state);
  return true;
}

function setSubtreeContext(
  unitId: EntityId,
  parentId: EntityId,
  side: NSide,
  sideGroup: NSideGroup | undefined,
  state: ScenarioState,
) {
  const unit = state.unitMap[unitId];
  if (!unit) return;
  const previousSideId = unit._sid;
  const previousGroupId = unit._gid;
  unit._pid = parentId;
  unit._sid = side.id;
  unit._gid = sideGroup?.id;
  if (previousSideId !== side.id || previousGroupId !== sideGroup?.id) {
    invalidateUnitStyleCache(unit, state);
  }
  syncProjectedUnitSidc(unit, side, state);
  unit.subUnits.forEach((childId) =>
    setSubtreeContext(childId, unit.id, side, sideGroup, state),
  );
}

function isDescendant(
  possibleDescendantId: EntityId,
  ancestorId: EntityId,
  state: ScenarioState,
): boolean {
  const stack = [...(state.unitMap[ancestorId]?.subUnits ?? [])];
  while (stack.length) {
    const currentId = stack.pop()!;
    if (currentId === possibleDescendantId) return true;
    const current = state.unitMap[currentId];
    if (current) {
      stack.push(...current.subUnits);
    }
  }
  return false;
}

function removeFromParent(unit: NUnit, state: ScenarioState) {
  const parent = getEffectiveParent(unit, state);
  if (!parent) return;
  const idx = parent.subUnits.indexOf(unit.id);
  if (idx >= 0) parent.subUnits.splice(idx, 1);
}

function resolveTimedMoveDestination(
  targetId: EntityId,
  placement: DropTarget,
  state: ScenarioState,
  parentId?: EntityId,
): { parent: HierarchyParent; index: number } | null {
  const target = getEntityById(targetId, state);

  if (!target) {
    if (!parentId) return null;
    const fallbackParent = getEntityById(parentId, state);
    if (!fallbackParent) return null;
    return { parent: fallbackParent, index: fallbackParent.subUnits.length };
  }

  if (placement === "on") {
    return { parent: target, index: target.subUnits.length };
  }

  if (!("sidc" in target)) return null;
  const parent = getEntityById(parentId ?? target._pid, state);
  if (!parent) return null;
  const index = parent.subUnits.indexOf(target.id);
  if (index < 0) return { parent, index: parent.subUnits.length };
  return { parent, index: placement === "below" ? index + 1 : index };
}

function applyTimedHierarchyMove(entry: TimedHierarchyEntry, state: ScenarioState) {
  const unit = state.unitMap[entry.unitId];
  if (!unit) return;

  if (entry.hierarchy.targetId === unit.id) {
    console.warn("Timed hierarchy move ignored: unit cannot target itself", entry);
    return;
  }

  if (isDescendant(entry.hierarchy.targetId, unit.id, state)) {
    console.warn("Timed hierarchy move ignored: target is inside moved subtree", entry);
    return;
  }

  const destination = resolveTimedMoveDestination(
    entry.hierarchy.targetId,
    entry.hierarchy.placement,
    state,
    entry.hierarchy.parentId,
  );
  if (!destination) {
    console.warn("Timed hierarchy move ignored: invalid destination", entry);
    return;
  }

  const context = getContextFromParent(destination.parent, state);
  if (!context) {
    console.warn("Timed hierarchy move ignored: unable to resolve side context", entry);
    return;
  }

  removeFromParent(unit, state);
  const boundedIndex = Math.max(
    0,
    Math.min(destination.index, destination.parent.subUnits.length),
  );
  destination.parent.subUnits.splice(boundedIndex, 0, unit.id);
  setSubtreeContext(
    unit.id,
    destination.parent.id,
    context.side,
    context.sideGroup,
    state,
  );
}

function resetEffectiveHierarchy(state: ScenarioState) {
  Object.values(state.sideMap).forEach((side) => {
    side.subUnits = [...(side._baseSubUnits ?? side.subUnits)];
  });
  Object.values(state.sideGroupMap).forEach((group) => {
    group.subUnits = [...(group._baseSubUnits ?? group.subUnits)];
  });
  Object.values(state.unitMap).forEach((unit) => {
    unit._pid = unit._basePid ?? unit._pid;
    unit.subUnits = [...(unit._baseSubUnits ?? unit.subUnits)];
  });

  state.sides.forEach((sideId) => {
    const side = state.sideMap[sideId];
    if (!side) return;
    side.groups.forEach((groupId) => {
      const sideGroup = state.sideGroupMap[groupId];
      if (!sideGroup) return;
      sideGroup.subUnits.forEach((unitId) =>
        setSubtreeContext(unitId, sideGroup.id, side, sideGroup, state),
      );
    });
    side.subUnits.forEach((unitId) =>
      setSubtreeContext(unitId, side.id, side, undefined, state),
    );
  });
}

function projectTimedHierarchy(state: ScenarioState, timestamp: number) {
  resetEffectiveHierarchy(state);

  const entries: TimedHierarchyEntry[] = [];
  Object.values(state.unitMap).forEach((unit) => {
    unit.state?.forEach((stateEntry, stateIndex) => {
      if (stateEntry.hierarchy && stateEntry.t <= timestamp) {
        entries.push({
          unitId: unit.id,
          stateIndex,
          t: stateEntry.t,
          hierarchy: stateEntry.hierarchy,
        });
      }
    });
  });

  entries
    .sort((a, b) =>
      a.t !== b.t
        ? a.t - b.t
        : a.stateIndex !== b.stateIndex
          ? a.stateIndex - b.stateIndex
          : `${a.unitId}`.localeCompare(`${b.unitId}`),
    )
    .forEach((entry) => applyTimedHierarchyMove(entry, state));
}

function collectHierarchyChangeTimestamps(state: ScenarioState): number[] {
  const timestamps: number[] = [];
  Object.values(state.unitMap).forEach((unit) => {
    unit.state?.forEach((stateEntry) => {
      if (stateEntry.hierarchy) timestamps.push(stateEntry.t);
    });
  });
  return timestamps.sort((a, b) => a - b);
}

function getHierarchyProjectionBucket(timestamps: number[], timestamp: number): number {
  let low = 0;
  let high = timestamps.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (timestamps[mid] <= timestamp) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

// ---------------------------------------------------------------------------
// Feature layer projection
// ---------------------------------------------------------------------------

function projectFeatureLayers(state: ScenarioState, timestamp: number) {
  (
    Object.values(state.layerStackMap).filter(
      isScenarioOverlayLayer,
    ) as import("@/types/scenarioStackLayers").NScenarioOverlayLayer[]
  ).forEach((layer) => {
    const visibleFromT = layer.visibleFromT ?? Number.MIN_SAFE_INTEGER;
    const visibleUntilT = layer.visibleUntilT ?? Number.MAX_SAFE_INTEGER;
    const oldHidden = layer._hidden;
    layer._hidden = timestamp <= visibleFromT || timestamp >= visibleUntilT;
    if (oldHidden !== layer._hidden) {
      state.featureStateCounter++;
    }
    layer.items.forEach((featureId) => {
      const feature = state.layerItemMap[featureId];
      if (!feature || !isNGeometryLayerItem(feature)) return;
      const visibleFromT = feature.visibleFromT ?? Number.MIN_SAFE_INTEGER;
      const visibleUntilT = feature.visibleUntilT ?? Number.MAX_SAFE_INTEGER;
      const oldHidden = feature._hidden;
      feature._hidden =
        timestamp <= visibleFromT || timestamp >= visibleUntilT || !!feature.isHidden;
      if (oldHidden !== feature._hidden) {
        state.featureStateCounter++;
      }
      if (feature.state?.length) {
        let currentState = createInitialGeometryLayerItemState(feature);
        for (const s of feature.state) {
          if (s.t <= timestamp) {
            currentState = {
              ...currentState,
              ...projectGeometryLayerItemState(s),
            };
          } else {
            break;
          }
        }
        feature._state = currentState;
        state.featureStateCounter++;
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function projectScenarioToTime(state: ScenarioState, timestamp: number) {
  Object.values(state.unitMap).forEach((unit) =>
    updateCurrentUnitState(unit, timestamp, state),
  );
  reprojectHierarchy(state, { timestamp });
  projectFeatureLayers(state, timestamp);
  state.currentTime = timestamp;
}

export function reprojectUnit(state: ScenarioState, unitId: EntityId) {
  const unit = state.unitMap[unitId];
  if (!unit) return;
  updateCurrentUnitState(unit, state.currentTime, state);
  state.unitStateCounter++;
}

export function reprojectHierarchy(
  state: ScenarioState,
  options?: { force?: boolean; timestamp?: number },
): boolean {
  const timestamp = options?.timestamp ?? state.currentTime;
  const nextBucket = getHierarchyProjectionBucket(
    state.hierarchyChangeTimestamps,
    timestamp,
  );
  if (
    !options?.force &&
    state.hierarchyProjectionVersion === state.hierarchyStateVersion &&
    state.hierarchyProjectionBucket === nextBucket
  ) {
    Object.values(state.unitMap).forEach((unit) => {
      const side = state.sideMap[unit._sid];
      if (side) syncProjectedUnitSidc(unit, side, state);
    });
    return false;
  }

  projectTimedHierarchy(state, timestamp);
  state.hierarchyProjectionVersion = state.hierarchyStateVersion;
  state.hierarchyProjectionBucket = nextBucket;
  return true;
}

export function refreshHierarchyTimeline(state: ScenarioState) {
  state.hierarchyChangeTimestamps = collectHierarchyChangeTimestamps(state);
  state.hierarchyStateVersion += 1;
}
