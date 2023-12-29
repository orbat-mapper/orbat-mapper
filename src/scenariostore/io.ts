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
  UnitStatus,
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
import {
  RangeRingGroup,
  type ScenarioLayer,
  ScenarioMapLayer,
} from "@/types/scenarioGeoModels";
import { type EntityId } from "@/types/base";
import { nanoid } from "@/utils";
import { LOCALSTORAGE_KEY, SCENARIO_FILE_VERSION } from "@/config/constants";
import { useIndexedDb } from "@/scenariostore/localdb";

export interface CreateEmptyScenarioOptions {
  id?: string;
  addGroups?: boolean;
}

export function createEmptyScenario(options: CreateEmptyScenarioOptions = {}): Scenario {
  const addGroups = options.addGroups ?? false;
  const symbolSettings = useSymbolSettingsStore();
  let timeZone;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {}
  const rangeRingGroups: RangeRingGroup[] = addGroups
    ? [{ name: "GR1" }, { name: "GR2" }]
    : [];

  return {
    id: options.id ?? nanoid(),
    type: "ORBAT-mapper",
    version: SCENARIO_FILE_VERSION,
    name: "New scenario",
    description: "Empty scenario description",
    startTime: new Date().setHours(12, 0, 0, 0),
    timeZone,
    symbologyStandard: symbolSettings.symbologyStandard,
    sides: [],
    events: [],
    layers: [{ id: nanoid(), name: "Features", features: [] }],
    mapLayers: [],
    settings: { rangeRingGroups, statuses: [] },
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
    let rangeRings = nUnit.rangeRings?.map(({ group, ...rest }) => {
      return group ? { group: state.rangeRingGroupMap[group].name, ...rest } : rest;
    });
    if (rangeRings?.length === 0) rangeRings = undefined;

    return {
      ...nUnit,
      status: nUnit.status ? state.unitStatusMap[nUnit.status]?.name : undefined,
      subUnits: nUnit.subUnits.map((subUnitId) => getUnit(subUnitId)),
      equipment,
      personnel,
      rangeRings,
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

function getRangeRingGroups(state: ScenarioState): RangeRingGroup[] {
  return Object.values(state.rangeRingGroupMap).map(({ id, ...rest }) => rest);
}

function getUnitStatuses(state: ScenarioState): UnitStatus[] {
  return Object.values(state.unitStatusMap).map(({ id, ...rest }) => rest);
}

export function useScenarioIO(store: ShallowRef<NewScenarioStore>) {
  const settingsStore = useSymbolSettingsStore();

  function toObject(): Scenario {
    const { state } = store.value;
    return {
      id: state.id,
      type: "ORBAT-mapper",
      version: SCENARIO_FILE_VERSION,
      ...getScenarioInfo(state),
      sides: getSides(state),
      layers: getLayers(state),
      events: getScenarioEvents(state),
      mapLayers: getMapLayers(state),
      equipment: getEquipment(state),
      personnel: getPersonnel(state),
      settings: {
        rangeRingGroups: getRangeRingGroups(state),
        statuses: getUnitStatuses(state),
      },
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

  function serializeToObject() {
    return JSON.parse(stringifyScenario());
  }

  function saveToLocalStorage(key = LOCALSTORAGE_KEY) {
    const scn = useLocalStorage(key, "");
    scn.value = stringifyScenario();
  }

  async function saveToIndexedDb() {
    const { putScenario } = await useIndexedDb();
    const scn = serializeToObject();
    if (scn.id.startsWith("demo-")) {
      scn.id = nanoid();
      store.value.state.id = scn.id;
    }
    await putScenario(scn);
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

  async function downloadAsJson(fileName?: string) {
    let name = fileName;
    if (!name) {
      //@ts-ignore
      const { default: filenamify } = await import("filenamify/browser");
      name = filenamify(store.value.state.info.name || "scenario.json");
    }
    FileSaver.saveAs(
      new Blob([stringifyScenario()], {
        type: "application/json",
      }),
      name,
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
    serializeToObject,
    saveToIndexedDb,
  };
}
