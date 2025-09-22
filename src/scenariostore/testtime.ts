import type { EntityId } from "@/types/base.ts";
import type { DropTarget } from "@/components/types.ts";
import { removeElement } from "@/utils";
import { SID_INDEX } from "@/symbology/sidc.ts";
import { setCharAt } from "@/components/helpers.ts";
import { invalidateUnitStyle } from "@/geo/unitStyles.ts";
import type { NewScenarioStore } from "@/scenariostore/newScenarioStore.ts";
import type { NSide, NSideGroup, NUnit } from "@/types/internalModels.ts";
import type {
  NWalkSubUnitCallback,
  WalkSubUnitsOptions,
} from "@/scenariostore/unitManipulations.ts";

export function changeUnitParentTemporarily(
  unitId: EntityId,
  targetId: EntityId,
  target: DropTarget = "on",
  store: NewScenarioStore,
) {
  const { state: s } = store;
  const unit = s.unitMap[unitId];
  let parentId = targetId;

  if (target === "above" || target === "below") {
    parentId = getUnitOrSideGroup(targetId)?._pid!;
  }
  const newParent = getUnitOrSideGroupOrSide(parentId);
  if (!(unit && newParent)) return;
  const { side, sideGroup, parents } = getUnitHierarchy(newParent.id);
  if (parents.includes(unit)) {
    console.error("Not allowed");
    return;
  }
  const originalParent = getUnitOrSideGroupOrSide(unit._pid);
  unit._pid = parentId;
  unit._sid = side.id;
  unit._gid = sideGroup?.id;

  if (originalParent) {
    removeElement(unitId, originalParent.subUnits);
  }

  if (target === "on") {
    newParent.subUnits.push(unitId);
  } else {
    const idx = newParent.subUnits.findIndex((id) => id === targetId);
    if (idx < 0) return;
    if (target === "below") newParent.subUnits.splice(idx + 1, 0, unitId);
    if (target === "above") newParent.subUnits.splice(idx, 0, unitId);
  }

  //update SID if necessary
  if (side) {
    walkSubUnits(
      unitId,
      (u) => {
        if (u.sidc[SID_INDEX] !== side.standardIdentity) {
          u.sidc = setCharAt(u.sidc, SID_INDEX, side.standardIdentity);
        }
        u._sid = side.id;
        u._gid = sideGroup?.id;
        invalidateUnitStyle(u.id);
      },
      { state: s, includeParent: true },
    );
  }

  function getUnitOrSideGroupOrSide(
    id: EntityId,
  ): NUnit | NSideGroup | NSide | undefined {
    if (id in s.unitMap) return s.unitMap[id];
    if (id in s.sideGroupMap) return s.sideGroupMap[id];
    return s.sideMap[id];
  }

  function walkSubUnits(
    parentUnitId: EntityId,
    callback: NWalkSubUnitCallback,
    options: Partial<WalkSubUnitsOptions>,
  ) {
    const { includeParent = false } = options;

    function helper(currentUnitId: EntityId) {
      const currentUnit = s.unitMap[currentUnitId]!;
      callback(currentUnit);
      currentUnit.subUnits.forEach((id) => helper(id));
    }

    const parentUnit = s.unitMap[parentUnitId]!;
    if (includeParent) callback(parentUnit);
    parentUnit.subUnits.forEach((unitId) => helper(unitId));
  }

  function getUnitHierarchy(entityId: EntityId): {
    side: NSide;
    sideGroup: NSideGroup | undefined;
    parents: NUnit[];
  } {
    const parents: NUnit[] = [];
    const unit = getUnitOrSideGroupOrSide(entityId);

    const helper = (uId: EntityId) => {
      const u = s.unitMap[uId];
      const parent = u?._pid && s.unitMap[u._pid];
      if (parent) {
        parents.push(parent);
        helper(parent.id);
      }
    };

    helper(entityId);
    parents.reverse();
    let sideGroupId, sideId;
    if (parents.length) {
      sideGroupId = parents[0]._pid;
    } else if (unit && "_gid" in unit) {
      sideGroupId = unit._gid;
    } else {
      sideGroupId = unit && "_pid" in unit ? unit.id : undefined;
    }

    const sideGroup = sideGroupId ? s.sideGroupMap[sideGroupId] : undefined;
    if (sideGroup) {
      sideId = sideGroup._pid;
    } else if (unit && "_sid" in unit) {
      sideId = unit._sid;
    } else if (unit && "_pid" in unit) {
      sideId = unit._pid;
    } else if (unit) {
      sideId = unit.id;
    }
    const side = s.sideMap[sideId!];
    return { side, sideGroup, parents };
  }
  function getUnitOrSideGroup(id: EntityId): NUnit | NSideGroup | undefined {
    if (id in s.unitMap) return s.unitMap[id];
    return s.sideGroupMap[id] || undefined;
  }
}
