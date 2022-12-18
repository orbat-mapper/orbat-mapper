import { Side, SideGroup, Unit, UnitOrSide } from "../types/scenarioModels";

/**
 * Visit every unit and apply callback
 * @param side
 * @param callback(unit)
 */
export type WalkSideCallback = (
  unit: Unit,
  level: number,
  parent: Unit | SideGroup,
  sideGroup: SideGroup,
  side: Side
) => void;

export type WalkSubUnitCallback = (unit: Unit) => void;

export interface ParentAndIndex {
  parent: UnitOrSide;
  index: number;
}

export interface SideUnits {
  side: Side;
  units: Unit[];
}

export function walkSide(side: Side, callback: WalkSideCallback) {
  let level = 0;

  function helper(currentUnit: Unit, parent: Unit | SideGroup, sideGroup: SideGroup) {
    callback(currentUnit, level, parent, sideGroup, side);
    if (currentUnit.subUnits) {
      level += 1;
      for (const subUnit of currentUnit.subUnits) {
        helper(subUnit, currentUnit, sideGroup);
      }
      level -= 1;
    }
  }

  for (const sideGroup of side.groups) {
    sideGroup.subUnits.forEach((unit) => helper(unit, sideGroup, sideGroup));
  }
}

export function walkSubUnits(
  parentUnit: Unit,
  callback: WalkSubUnitCallback,
  includeParent = false
) {
  function helper(currentUnit: Unit) {
    callback(currentUnit);
    if (currentUnit.subUnits) {
      for (const subUnit of currentUnit.subUnits) {
        helper(subUnit);
      }
    }
  }

  if (includeParent) callback(parentUnit);

  if (!parentUnit.subUnits) {
    return;
  }

  for (const unit of parentUnit.subUnits) {
    helper(unit);
  }
}
