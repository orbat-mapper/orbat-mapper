import { defineStore } from "pinia";

import {
  Scenario,
  Side,
  SideGroup,
  State,
  Unit,
  UnitOrSide,
} from "../types/scenarioModels";

import { SID_INDEX } from "../symbology/sidc";
import { setCharAt } from "../components/helpers";
import { SID } from "../symbology/values";
import dayjs from "dayjs";
import { useSettingsStore } from "./settingsStore";
import { Position } from "../types/scenarioGeoModels";
import { nanoid } from "../utils";
import { INTERNAL_NAMES } from "../types/internalModels";

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
    sideGroup.units.forEach((unit) => helper(unit, sideGroup, sideGroup));
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
