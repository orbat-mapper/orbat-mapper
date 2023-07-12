import type { NUnit } from "@/types/internalModels";
import type { EntityId } from "@/types/base";

export interface NOrbatItemData {
  unit: NUnit;
  children: NOrbatItemData[];
}

export function filterUnits(
  units: EntityId[],
  unitMap: Record<EntityId, NUnit>,
  query: string = "",
  locationFilter = false,
  resetOpen = true,
): NOrbatItemData[] {
  let filteredUnits: NOrbatItemData[] = [];
  let re = new RegExp(query, "i");

  function helper(currentUnitId: EntityId, parentMatched: boolean) {
    const currentUnit = unitMap[currentUnitId] as NUnit;
    if (!currentUnit) return [];
    let oi: NOrbatItemData = {
      unit: currentUnit,
      children: [],
    };
    if (query && resetOpen) oi.unit._isOpen = true;
    let matched = false;
    let childMatched = false;
    const hasPosition = Boolean(currentUnit?._state?.location);
    let children = [];
    if (currentUnit.name.search(re) >= 0) {
      matched = locationFilter ? hasPosition : true;
    } else if (parentMatched && resetOpen) {
      oi.unit._isOpen = false;
    }
    if (currentUnit.subUnits?.length) {
      for (const subUnit of currentUnit.subUnits) {
        let su = helper(subUnit, matched || parentMatched);
        if (su.length) {
          childMatched = true;
          oi.children.push(...su);
        }
      }
    }
    if (matched || childMatched || (parentMatched && !locationFilter)) {
      oi && children.push(oi);
    }
    return children;
  }

  for (const unitId of units) {
    filteredUnits.push(...helper(unitId, false));
  }
  return filteredUnits;
}
