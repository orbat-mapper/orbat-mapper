import { until, useFetch, useLocalStorage } from "@vueuse/core";
import {
  EquipmentData,
  PersonnelData,
  Scenario,
  ScenarioEvent,
  ScenarioInfo,
  Side,
  SideGroup,
  Unit,
} from "@/types/scenarioModels";
import * as FileSaver from "file-saver";
import {
  type NewScenarioStore,
  type ScenarioState,
  useNewScenarioStore,
} from "./newScenarioStore";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import { ShallowRef } from "vue";
import { isLoading } from "@/scenariostore/index";
import { INTERNAL_NAMES, TIMESTAMP_NAMES } from "@/types/internalModels";
import dayjs from "dayjs";
import { type ScenarioLayer, ScenarioMapLayer } from "@/types/scenarioGeoModels";
import { type EntityId } from "@/types/base";
import { nanoid } from "@/utils";
import { LOCALSTORAGE_KEY, SCENARIO_FILE_VERSION } from "@/config/constants";

export function createEmptyScenario(): Scenario {
  const symbolSettings = useSymbolSettingsStore();
  let timeZone;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {}
  return {
    type: "ORBAT-mapper",
    version: SCENARIO_FILE_VERSION,
    name: "New scenario",
    description: "Empty scenario description",
    startTime: new Date().getTime(),
    timeZone,
    symbologyStandard: symbolSettings.symbologyStandard,
    sides: [],
    events: [],
    layers: [{ id: nanoid(), name: "Features", features: [] }],
    mapLayers: [],
  };
}

function getScenarioInfo(state: ScenarioState): ScenarioInfo {
  return { ...state.info };
}

function getScenarioEvents(state: ScenarioState): ScenarioEvent[] {
  return state.events
    .filter((id) => state.eventMap[id]._type === "scenario")
    .map((id) => state.eventMap[id]);
}

function getSides(state: ScenarioState): Side[] {
  function getUnit(unitId: EntityId): Unit {
    const nUnit = state.unitMap[unitId];
    let equipment = nUnit.equipment?.map(({ id, count }) => {
      const { name } = state.equipmentMap[id];
      return { name, count };
    });
    if (equipment?.length === 0) equipment = undefined;
    let personnel = nUnit.personnel?.map(({ id, count }) => {
      const { name } = state.personnelMap[id];
      return { name, count };
    });
    if (personnel?.length === 0) personnel = undefined;

    return {
      ...nUnit,
      subUnits: nUnit.subUnits.map((subUnitId) => getUnit(subUnitId)),
      equipment,
      personnel,
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

function getMapLayers(state: ScenarioState): ScenarioMapLayer[] {
  return state.mapLayers.map((id) => state.mapLayerMap[id]);
}

function getEquipment(state: ScenarioState): EquipmentData[] {
  return Object.values(state.equipmentMap).map(({ name, description, sidc }) => ({
    name,
    description,
    sidc,
  }));
}

function getPersonnel(state: ScenarioState): PersonnelData[] {
  return Object.values(state.personnelMap).map(({ name, description }) => ({
    name,
    description,
  }));
}

export function useScenarioIO(store: ShallowRef<NewScenarioStore>) {
  const settingsStore = useSymbolSettingsStore();

  function toObject(): Scenario {
    const { state } = store.value;
    return {
      type: "ORBAT-mapper",
      version: SCENARIO_FILE_VERSION,
      ...getScenarioInfo(state),
      sides: getSides(state),
      layers: getLayers(state),
      events: getScenarioEvents(state),
      mapLayers: getMapLayers(state),
      equipment: getEquipment(state),
      personnel: getPersonnel(state),
    };
  }

  function stringifyScenario() {
    return JSON.stringify(
      toObject(),
      (name, val) => {
        if (val === undefined) return undefined;
        if (INTERNAL_NAMES.includes(name)) return undefined;
        if (TIMESTAMP_NAMES.includes(name)) {
          return dayjs(val)
            .tz(store.value.state.info.timeZone || "UTC")
            .format();
        }
        return val;
      },
      "  ",
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
    settingsStore.symbologyStandard = store.value.state.info.symbologyStandard || "2525";
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
      fileName,
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
