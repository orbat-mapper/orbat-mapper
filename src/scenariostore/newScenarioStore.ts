import { useImmerStore } from "../composables/immerStore";
import { Scenario, ScenarioInfo, SideGroup, Unit } from "../types/scenarioModels";
import dayjs from "dayjs";
import { nanoid } from "../utils";
import { walkSide } from "../stores/scenarioStore";
import { klona } from "klona";
import { EntityId } from "../types/base";
import { NSide, NSideGroup, NUnit } from "../types/internalModels";
import { useScenarioTime } from "./time";

export interface ScenarioState {
  unitMap: Record<EntityId, NUnit>;
  sideMap: Record<EntityId, NSide>;
  sideGroupMap: Record<EntityId, NSideGroup>;
  sides: EntityId[];
  info: ScenarioInfo;
  currentTime: number;
}

export type NewScenarioStore = ReturnType<typeof useNewScenarioStore>;

function prepareScenario(scenario: Scenario): ScenarioState {
  const unitMap: Record<EntityId, NUnit> = {};
  const sideMap: Record<EntityId, NSide> = {};
  const sideGroupMap: Record<EntityId, NSideGroup> = {};
  const sides: EntityId[] = [];

  if (scenario.startTime !== undefined) {
    scenario.startTime = +dayjs(scenario.startTime);
  }

  function prepareUnit(unit1: Unit, level: number, parent: Unit | SideGroup) {
    const unit = klona(unit1);
    if (!unit.state) {
      unit.state = [];
    } else {
      unit.state = unit.state.map((e) => ({ ...e, t: +dayjs(e.t) }));
    }
    unit._state = null;
    if (!unit.id) {
      unit.id = nanoid();
    }

    unit._pid = parent.id;
    unit._isOpen = false;

    unitMap[unit1.id] = {
      ...unit,
      subUnits: unit.subUnits?.map((u) => u.id) || [],
    } as NUnit;
  }

  scenario.sides.forEach((side) => {
    sideMap[side.id] = { ...side, groups: side.groups.map((group) => group.id) };
    sides.push(side.id);
    side.groups.forEach((group) => {
      sideGroupMap[group.id] = {
        ...group,
        _pid: side.id,
        subUnits: group.units.map((unit) => unit.id),
      };
    });
    walkSide(side, prepareUnit);
  });

  const info: ScenarioInfo = {
    name: scenario.name,
    startTime: scenario.startTime,
    timeZone: scenario.timeZone,
    description: scenario.description,
    symbologyStandard: scenario.symbologyStandard,
  };

  return {
    currentTime: scenario.startTime || 0,
    info,
    sides,
    unitMap,
    sideMap,
    sideGroupMap,
  };
}

export function useNewScenarioStore(data: Scenario) {
  const inputState = prepareScenario(data);
  const store = useImmerStore(inputState);
  useScenarioTime(store).setCurrentTime(store.state.currentTime);
  return store;
}
