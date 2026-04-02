import type { DropTarget, EntityId } from "@/types/base";
import type { ScenarioState } from "@/scenariostore/newScenarioStore";
import type { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { invalidateUnitStyle } from "@/geo/unitStyles";
import { setSid } from "@/symbology/helpers";

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

function syncProjectedUnitSidc(unit: NUnit, side: NSide) {
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

  if (unit._ikey) {
    invalidateUnitStyle(unit._ikey);
    unit._ikey = undefined;
  }
  invalidateUnitStyle(unit.id);
  return true;
}

function markMapStylesDirty(state: ScenarioState) {
  state.isMapStylesDirty = true;
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
    if (unit._ikey) {
      invalidateUnitStyle(unit._ikey);
      unit._ikey = undefined;
    }
    invalidateUnitStyle(unit.id);
    markMapStylesDirty(state);
  }
  if (syncProjectedUnitSidc(unit, side)) {
    markMapStylesDirty(state);
  }
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

export function resetEffectiveHierarchy(state: ScenarioState) {
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

export function projectTimedHierarchy(state: ScenarioState, timestamp: number) {
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

export function collectHierarchyChangeTimestamps(state: ScenarioState): number[] {
  const timestamps: number[] = [];
  Object.values(state.unitMap).forEach((unit) => {
    unit.state?.forEach((stateEntry) => {
      if (stateEntry.hierarchy) timestamps.push(stateEntry.t);
    });
  });
  return timestamps.sort((a, b) => a - b);
}

export function refreshHierarchyTimelineMetadata(state: ScenarioState) {
  state.hierarchyChangeTimestamps = collectHierarchyChangeTimestamps(state);
  state.hierarchyStateVersion += 1;
}

export function getHierarchyProjectionBucket(
  timestamps: number[],
  timestamp: number,
): number {
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

export function syncTimedHierarchyProjection(
  state: ScenarioState,
  timestamp: number,
  { force = false }: { force?: boolean } = {},
) {
  const nextBucket = getHierarchyProjectionBucket(
    state.hierarchyChangeTimestamps,
    timestamp,
  );
  if (
    !force &&
    state.hierarchyProjectionVersion === state.hierarchyStateVersion &&
    state.hierarchyProjectionBucket === nextBucket
  ) {
    Object.values(state.unitMap).forEach((unit) => {
      const side = state.sideMap[unit._sid];
      if (side) syncProjectedUnitSidc(unit, side);
    });
    return false;
  }

  projectTimedHierarchy(state, timestamp);
  state.hierarchyProjectionVersion = state.hierarchyStateVersion;
  state.hierarchyProjectionBucket = nextBucket;
  return true;
}
