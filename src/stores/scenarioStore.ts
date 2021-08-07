import { defineStore } from "pinia";

import {
  Position,
  Scenario,
  Side,
  SideGroup,
  State,
  Unit,
  UnitOrSide,
} from "../types/models";
import { nanoid } from "nanoid";
import { SID_INDEX, Sidc } from "../symbology/sidc";
import { setCharAt } from "../components/helpers";
import { SID } from "../symbology/values";
import dayjs from "dayjs";

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

  function helper(
    currentUnit: Unit,
    parent: Unit | SideGroup,
    sideGroup: SideGroup
  ) {
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

export function walkSubUnits(parentUnit: Unit, callback: WalkSubUnitCallback) {
  function helper(currentUnit: Unit) {
    callback(currentUnit);
    if (currentUnit.subUnits) {
      for (const subUnit of currentUnit.subUnits) {
        helper(subUnit);
      }
    }
  }

  if (!parentUnit.subUnits) {
    return;
  }

  for (const unit of parentUnit.subUnits) {
    helper(unit);
  }
}

function prepareScenario(scenario: Scenario) {
  const unitMap = new Map<string, Unit>();
  const sideMap = new Map<string, Side>();
  const sideGroupMap = new Map<string, SideGroup>();

  function prepareUnit(unit: Unit, level: number, parent: Unit | SideGroup) {
    if (!unit.state) {
      unit.state = [];
    }
    unit._state = null;
    if (!unit.id) {
      unit.id = nanoid();
    }

    unit._pid = parent.id;
    unitMap.set(unit.id, unit);
  }

  // add state attributes
  scenario.sides.forEach((side) => {
    sideMap.set(side.id, side);
    side.groups.forEach((g) => {
      sideGroupMap.set(g.id, g);
      g._pid = side.id;
    });
    walkSide(side, prepareUnit);
  });
  return { scenario, unitMap, sideMap, sideGroupMap };
}

export const useScenarioStore = defineStore({
  id: "scenario",
  state: () => ({
    scenario: {} as Scenario,
    unitMap: new Map<string | number, Unit>(),
    sideMap: new Map<string | number, Side>(),
    sideGroupMap: new Map<string | number, SideGroup>(),

    counter: 0,
    name: "test",
    isLoaded: false,
    currentTime: 0,
  }),
  actions: {
    loadScenario(demoScenario: Scenario) {
      const { scenario, unitMap, sideMap, sideGroupMap } =
        prepareScenario(demoScenario);
      this.scenario = scenario;
      this.unitMap = unitMap;
      this.sideMap = sideMap;
      this.sideGroupMap = sideGroupMap;
      this.currentTime = scenario.startTime || 0;
      this.setCurrentTime(this.currentTime);
      this.isLoaded = true;
    },

    loadEmptyScenario() {
      const scn: Scenario = {
        name: "New scenario",
        type: "ScenarioViewer",
        description: "Empty scenario description",
        sides: [],
        events: [],
        startTime: new Date().getTime(),
      };
      this.loadScenario(scn);
    },

    getSideById(id: string | number) {
      return this.sideMap.get(id);
    },

    getSideGroupById(id: string | number) {
      return this.sideGroupMap.get(id);
    },

    getUnitById(id: string | number) {
      return this.unitMap.get(id);
    },

    addUnit(unit: Unit, parent: Unit | SideGroup) {
      if (!unit.id) {
        unit.id = nanoid();
      }
      unit._pid = parent.id;
      this.unitMap.set(unit.id, unit);
      // Is it a unit?
      if ("sidc" in parent && this.unitMap.has(parent.id)) {
        const parentUnit = this.unitMap.get(parent.id)!;

        if (parentUnit.subUnits) {
          parentUnit.subUnits.push(unit);
        } else {
          parentUnit.subUnits = [unit];
        }
      } else {
        const sideGroup = parent as SideGroup;
        if (sideGroup.units) {
          sideGroup.units.push(unit);
        } else {
          sideGroup.units = [unit];
        }
      }
    },

    addSideGroup(side: Side, data: Partial<SideGroup> = {}) {
      const bSide = this.sideMap.get(side.id);
      if (!bSide) return;
      const newGroup: SideGroup = {
        id: nanoid(),
        name: "New Group",
        units: [],
        _pid: bSide.id,
        _isNew: true,
        ...data,
      };
      this.sideGroupMap.set(newGroup.id, newGroup);
      bSide.groups.push(newGroup);
    },

    addSide(name = "New side") {
      const newSide: Side = {
        id: nanoid(),
        name,
        standardIdentity: SID.Friend,
        groups: [],
        _isNew: true,
      };
      this.sideMap.set(newSide.id, newSide);
      this.scenario.sides.push(newSide);
      this.addSideGroup(newSide, { name: "Units", _isNew: false });
    },

    getUnitParent(unit: Unit): Unit | SideGroup | undefined {
      return this.unitMap.get(unit._pid!) || this.sideGroupMap.get(unit._pid!);
    },

    deleteUnit(unit: Unit) {
      const parent = this.getUnitParent(unit);
      if (parent) {
        if ("sidc" in parent) {
          const index = (parent as Unit).subUnits!.indexOf(unit);
          parent.subUnits!.splice(index, 1);
        } else {
          const index = (parent as SideGroup).units!.indexOf(unit);
          parent.units.splice(index, 1);
        }
      }

      this.unitMap.delete(unit.id);
      walkSubUnits(unit, (su) => this.unitMap.delete(su.id));
    },

    addUnitPosition(unit: Unit, coordinates: Position) {
      const u = this.unitMap.get(unit.id);
      if (!u) return;
      const t = this.currentTime;
      const newState: State = { t, coordinates };
      u._state = newState;
      if (!u.state) u.state = [];
      for (let i = 0, len = u.state.length; i < len; i++) {
        if (t < u.state[i].t) {
          u.state.splice(i, 0, newState);
          return;
        } else if (t === u.state[i].t) {
          u.state[i] = newState;
          return;
        }
      }
      u.state.push(newState);
    },

    setCurrentTime(timestamp: number) {
      for (const side of this.scenario.sides) {
        walkSide(side, (unit) => {
          if (!unit.state || !unit.state.length) {
            unit._state = null;
            return;
          }
          let tmpstate: State | null = null;
          for (const s of unit.state) {
            if (s.t <= timestamp) {
              tmpstate = s;
            } else {
              break;
            }
          }
          unit._state = tmpstate;
        });
      }
      this.currentTime = timestamp;
    },

    updateUnitState(unit: Unit) {
      const timestamp = this.currentTime;
      if (!unit.state || !unit.state.length) {
        unit._state = null;
        return;
      }
      let tmpstate: State | null = null;
      for (const s of unit.state) {
        if (s.t <= timestamp) {
          tmpstate = s;
        } else {
          break;
        }
      }
      unit._state = tmpstate;
    },

    updateSide(sideData: Partial<Side>) {
      if (!sideData.id) return;
      let side = this.sideMap.get(sideData.id);
      if (!side) return;
      Object.assign(side, sideData);
      const sid = side.standardIdentity;
      walkSide(side, (unit) => {
        if (unit.sidc[SID_INDEX] !== sid) {
          unit.sidc = setCharAt(unit.sidc, SID_INDEX, sid);
        }
      });
    },

    updateSideGroup(sideGroupData: Partial<SideGroup>) {
      if (!sideGroupData.id) return;
      let sideGroup = this.sideGroupMap.get(sideGroupData.id);
      if (!sideGroup) return;
      Object.assign(sideGroup, { ...sideGroupData, _isNew: false });
    },

    stringify() {
      return JSON.stringify(
        this.scenario,
        (name, val) => {
          if (name === "_state") {
            return undefined;
          }
          if (name === "_pid") {
            return undefined;
          }

          return val;
        },
        "  "
      );
    },
  },
  getters: {
    visibleUnits(state): SideUnits[] {
      const vUnits = [];
      for (const side of state.scenario.sides) {
        const units: Unit[] = [];
        const nn = { side, units };
        vUnits.push(nn);
        walkSide(side, (unit) => {
          if (unit._state && unit._state.coordinates) {
            units.push(unit);
          }
        });
      }
      return vUnits;
    },

    everyVisibleUnits(state): Unit[] {
      const vUnits: Unit[] = [];
      for (const side of state.scenario.sides) {
        walkSide(side, (unit) => {
          if (unit._state && unit._state.coordinates) {
            vUnits.push(unit);
          }
        });
      }
      return vUnits;
    },

    units(state): Unit[] {
      return [...state.unitMap.values()];
    },

    utcTime(state) {
      return dayjs.utc(state.currentTime);
    },

    scenarioTime(state) {
      const zone = state.scenario.timeZone || "UTC";
      return dayjs(state.currentTime).tz(zone);
    },

    timeZone(state) {
      const zone = state.scenario.timeZone;
      return zone;
    },
  },
});
