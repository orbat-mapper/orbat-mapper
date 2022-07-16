import { until, useFetch, useLocalStorage } from "@vueuse/core";
import {
  Scenario,
  ScenarioEvent,
  ScenarioInfo,
  Side,
  SideGroup,
  Unit,
} from "@/types/scenarioModels";
import * as FileSaver from "file-saver";
import { NewScenarioStore, ScenarioState, useNewScenarioStore } from "./newScenarioStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { ShallowRef } from "vue";
import { isLoading } from "@/scenariostore/index";
import { INTERNAL_NAMES } from "@/types/internalModels";
import dayjs from "dayjs";
import { ScenarioLayer } from "@/types/scenarioGeoModels";
import { EntityId } from "@/types/base";

const LOCALSTORAGE_KEY = "orbat-scenario4";

export function createEmptyScenario(): Scenario {
  const settingsStore = useSettingsStore();
  let timeZone;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {}
  return {
    type: "ORBAT-mapper",
    version: "0.6.0",
    name: "New scenario",
    description: "Empty scenario description",
    startTime: new Date().getTime(),
    timeZone,
    symbologyStandard: settingsStore.symbologyStandard,
    sides: [],
    events: [],
    layers: [],
  };
}

function getScenarioInfo(state: ScenarioState): ScenarioInfo {
  return { ...state.info };
}

function getScenarioEvents(state: ScenarioState): ScenarioEvent[] {
  return state.events;
}

function getSides(state: ScenarioState): Side[] {
  function getUnit(unitId: EntityId): Unit {
    const nUnit = state.unitMap[unitId];
    return {
      ...nUnit,
      subUnits: nUnit.subUnits.map((subUnitId) => getUnit(subUnitId)),
    };
  }

  function getSideGroup(groupId: EntityId): SideGroup {
    const group = state.sideGroupMap[groupId];
    return { ...group, subUnits: group.subUnits.map((unitId) => getUnit(unitId)) };
  }

  return state.sides
    .map((sideId) => state.sideMap[sideId])
    .map((nSide) => ({
      ...nSide,
      groups: nSide.groups.map((groupId) => getSideGroup(groupId)),
    }));
}

function getLayers(state: ScenarioState): ScenarioLayer[] {
  return state.layers
    .map((id) => state.layerMap[id])
    .map((layer) => ({
      ...layer,
      features: layer.features.map((fId) => state.featureMap[fId]),
    }));
}

export function useScenarioIO(store: ShallowRef<NewScenarioStore>) {
  function toObject(): Scenario {
    const { state } = store.value;
    return {
      type: "ORBAT-mapper",
      version: "0.6.0",
      ...getScenarioInfo(state),
      sides: getSides(state),
      layers: getLayers(state),
      events: getScenarioEvents(state),
    };
  }

  function stringifyScenario() {
    return JSON.stringify(
      toObject(),
      (name, val) => {
        if (INTERNAL_NAMES.includes(name)) return undefined;
        if (name === "t" || name === "startTime") {
          return dayjs(val)
            .tz(store.value.state.info.timeZone || "UTC")
            .format();
        }
        return val;
      },
      "  "
    );
  }
  function saveToLocalStorage(key = LOCALSTORAGE_KEY) {
    const scn = useLocalStorage(key, "");
    scn.value = stringifyScenario();
  }

  function loadFromLocalStorage(key = LOCALSTORAGE_KEY) {
    const scn = useLocalStorage(key, "");

    if (scn.value) {
      loadFromObject(JSON.parse(scn.value));
    }
  }

  function loadFromObject(data: Scenario) {
    store.value = useNewScenarioStore(data);
  }

  async function loadFromUrl(url: string) {
    const { data, isFinished, statusCode, error } = useFetch<Scenario>(url).json();
    await until(isFinished).toBe(true);

    if (error.value) {
      console.error(statusCode.value, error.value);
      return;
    }
    loadFromObject(data.value);
  }

  function loadEmptyScenario() {
    const scn = createEmptyScenario();
    loadFromObject(scn);
  }

  async function loadDemoScenario(id: string | "falkland82" | "narvik40") {
    isLoading.value = true;
    const idUrlMap: Record<string, string> = {
      falkland82: "/scenarios/falkland82.json",
      narvik40: "/scenarios/narvik40.json",
    };
    const url = idUrlMap[id];
    if (!url) {
      console.warn("Unknown scenario id", id);
      return;
    }
    await loadFromUrl(url);
    isLoading.value = false;
  }

  async function downloadAsJson(fileName = "scenario.json") {
    FileSaver.saveAs(
      new Blob([stringifyScenario()], {
        type: "application/json",
      }),
      fileName
    );
  }
  return {
    loadDemoScenario,
    loadEmptyScenario,
    loadFromObject,
    downloadAsJson,
    saveToLocalStorage,
    loadFromLocalStorage,
    stringifyScenario,
  };
}
