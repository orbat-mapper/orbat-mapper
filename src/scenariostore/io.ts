import { until, useFetch, useLocalStorage } from "@vueuse/core";
import { computed, ref, type ShallowRef } from "vue";
import type {
  EquipmentData,
  PersonnelData,
  Scenario,
  ScenarioEvent,
  ScenarioInfo,
  Side,
  SideGroup,
  State,
  SupplyCategory,
  SupplyClass,
  SymbologyStandard,
  Unit,
  UnitOfMeasure,
  UnitStatus,
} from "@/types/scenarioModels";
import {
  type NewScenarioStore,
  type ScenarioState,
  useNewScenarioStore,
} from "./newScenarioStore";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import { isLoading } from "@/scenariostore/index";
import {
  INTERNAL_NAMES,
  type NState,
  type NUnit,
  TIMESTAMP_NAMES,
} from "@/types/internalModels";
import dayjs from "dayjs";
import { resolveTimeZone } from "@/utils/militaryTimeZones";
import type { RangeRingGroup, ScenarioMapLayer } from "@/types/scenarioGeoModels";
import type {
  GeometryLayerItem,
  ScenarioLayerItemsLayer,
} from "@/types/scenarioLayerItems";
import type { LoadableScenario } from "@/scenariostore/upgrade";
import { type EntityId } from "@/types/base";
import { nanoid } from "@/utils";
import {
  DEFAULT_BASEMAP_ID,
  LOCALSTORAGE_KEY,
  SCENARIO_FILE_VERSION,
} from "@/config/constants";
import { type ScenarioDraft, useIndexedDb } from "@/scenariostore/localdb";
import { klona } from "klona";
import { saveBlobToLocalFile } from "@/utils/files";
import { compare as compareVersions } from "compare-versions";
import { useNotifications } from "@/composables/notifications";
import type {
  ScenarioOverlayLayer,
  ScenarioReferenceLayer,
  ScenarioStackLayer,
} from "@/types/scenarioStackLayers";
import {
  isScenarioOverlayLayer,
  isScenarioReferenceLayer,
} from "@/types/scenarioStackLayers";

export interface CreateEmptyScenarioOptions {
  id?: string;
  addGroups?: boolean;
  symbologyStandard?: SymbologyStandard;
}

export interface LoadScenarioOptions {
  loadedBaseline?: Scenario | null;
  savedBaseline?: Scenario | null;
}

export function createEmptyScenario(options: CreateEmptyScenarioOptions = {}): Scenario {
  const addGroups = options.addGroups ?? false;
  const symbolSettings = useSymbolSettingsStore();
  const symbologyStandard = options.symbologyStandard ?? symbolSettings.symbologyStandard;
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
    meta: {
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    },
    name: "New scenario",
    description: "Empty scenario description",
    startTime: new Date().setHours(12, 0, 0, 0),
    timeZone,
    symbologyStandard,
    sides: [],
    events: [],
    layerStack: [{ id: nanoid(), kind: "overlay", name: "Features", items: [] }],
    settings: {
      rangeRingGroups,
      statuses: [],
      map: { baseMapId: DEFAULT_BASEMAP_ID },
      supplyClasses: [
        { name: "Class I" },
        { name: "Class II" },
        { name: "Class III" },
        { name: "Class IV" },
        { name: "Class V" },
      ],
      supplyUoMs: [
        { name: "Kilogram", code: "KG", type: "weight" },
        { name: "Liter", code: "LI", type: "volume" },
        { name: "Each", code: "EA", type: "quantity" },
        { name: "Meter", code: "MR", type: "distance" },
        { name: "Gallon", code: "GL", type: "volume" },
      ],
      symbolFillColors: [],
    },
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
  function getSideGroup(groupId: EntityId): SideGroup {
    const group = state.sideGroupMap[groupId];
    const { _baseSubUnits, ...rest } = group;
    return {
      ...rest,
      subUnits: (_baseSubUnits ?? group.subUnits).map((unitId) =>
        serializeUnit(unitId, state),
      ),
    };
  }

  return state.sides
    .map((sideId) => state.sideMap[sideId])
    .map((nSide) => {
      const { _baseSubUnits, ...rest } = nSide;
      return {
        ...rest,
        groups: nSide.groups.map((groupId) => getSideGroup(groupId)),
        subUnits: (_baseSubUnits ?? nSide.subUnits).length
          ? (_baseSubUnits ?? nSide.subUnits).map((unitId) =>
              serializeUnit(unitId, state),
            )
          : undefined,
      };
    });
}

export type SerializeUnitOptions = {
  newId?: boolean;
  includeSubUnits?: boolean;
};

export function serializeUnit(
  unitId: EntityId,
  scnState: ScenarioState,
  options: SerializeUnitOptions = {},
): Unit {
  const { newId = false, includeSubUnits = true } = options;
  const nUnit = scnState.unitMap[unitId];
  const { equipment, personnel, supplies } = serializeToeStuff(nUnit, scnState);
  let rangeRings = nUnit.rangeRings?.map(({ group, ...rest }) => {
    return group ? { group: scnState.rangeRingGroupMap[group].name, ...rest } : rest;
  });

  if (rangeRings?.length === 0) rangeRings = undefined;
  const { id, state, _basePid, _baseSubUnits, ...rest } = nUnit;

  return {
    id: newId ? nanoid() : id,
    ...rest,
    status: nUnit.status ? scnState.unitStatusMap[nUnit.status]?.name : undefined,
    subUnits: includeSubUnits
      ? (_baseSubUnits ?? nUnit.subUnits).map((subUnitId) =>
          serializeUnit(subUnitId, scnState, options),
        )
      : [],
    equipment,
    personnel,
    supplies,
    rangeRings,
    state: state ? state.map((s) => serializeState(s, scnState)) : undefined,
  };
}

function serializeToeStuff(nUnit: NUnit, scnState: ScenarioState) {
  let equipment = nUnit.equipment?.map(({ id, count, onHand }) => {
    const { name } = scnState.equipmentMap[id];
    return { name, count, onHand };
  });
  if (equipment?.length === 0) equipment = undefined;
  let personnel = nUnit.personnel?.map(({ id, count, onHand }) => {
    const { name } = scnState.personnelMap[id];
    return { name, count, onHand };
  });
  if (personnel?.length === 0) personnel = undefined;

  let supplies = nUnit.supplies?.map(({ id, count, onHand }) => {
    const { name } = scnState.supplyCategoryMap[id];
    return { name, count, onHand };
  });
  if (supplies?.length === 0) supplies = undefined;

  return { equipment, personnel, supplies };
}

function serializeState(s: NState, scnState: ScenarioState) {
  let diffEquipment, diffPersonnel, diffSupplies;
  const c = klona(s) as State;

  if (s.diff) {
    if (s.diff.equipment) {
      diffEquipment = s.diff.equipment.map(({ id, count, onHand }) => {
        return { name: scnState.equipmentMap[id]?.name ?? id, count, onHand };
      });
    }

    if (s.diff?.personnel) {
      diffPersonnel = s.diff.personnel.map(({ id, count, onHand }) => {
        return { name: scnState.personnelMap[id]?.name ?? id, count, onHand };
      });
    }

    if (s.diff?.supplies) {
      diffSupplies = s.diff.supplies.map(({ id, count, onHand }) => {
        return {
          name: scnState.supplyCategoryMap[id]?.name ?? id,
          count,
          onHand,
        };
      });
    }
    c.diff = {
      equipment: diffEquipment,
      personnel: diffPersonnel,
      supplies: diffSupplies,
    };
  }

  if (s.update) {
    let updateEquipment, updatePersonnel, updateSupplies;

    if (s.update.equipment) {
      updateEquipment = s.update.equipment.map(({ id, count, onHand }) => {
        return { name: scnState.equipmentMap[id]?.name ?? id, count, onHand };
      });
    }
    if (s.update.personnel) {
      updatePersonnel = s.update.personnel.map(({ id, count, onHand }) => {
        return { name: scnState.personnelMap[id]?.name ?? id, count, onHand };
      });
    }

    if (s.update.supplies) {
      updateSupplies = s.update.supplies.map(({ id, count, onHand }) => {
        return {
          name: scnState.supplyCategoryMap[id]?.name ?? id,
          count,
          onHand,
        };
      });
    }
    c.update = {
      equipment: updateEquipment,
      personnel: updatePersonnel,
      supplies: updateSupplies,
    };
  }

  if (s.status) {
    c.status = scnState.unitStatusMap[s.status]?.name;
  }
  return c;
}

function getStoredOverlayLayers(state: ScenarioState): ScenarioOverlayLayer[] {
  const layers: ScenarioOverlayLayer[] = [];
  state.layerStack.forEach((id) => {
    const layer = state.layerStackMap[id];
    if (!isScenarioOverlayLayer(layer)) return;
    const { items, ...rest } = layer;
    layers.push({
      ...rest,
      kind: "overlay",
      // Transitional geometry-only serialization. This must become item-aware
      // before annotation/tacticalGraphic/measurement items are persisted.
      items: items.map(
        (itemId: string) => state.layerItemMap[itemId] as GeometryLayerItem,
      ),
    });
  });
  return layers;
}

function getStoredReferenceLayers(state: ScenarioState): ScenarioReferenceLayer[] {
  const layers: ScenarioReferenceLayer[] = [];
  state.layerStack.forEach((id) => {
    const layer = state.layerStackMap[id];
    if (!isScenarioReferenceLayer(layer) || layer.source._isTemporary) return;
    layers.push({
      ...layer,
      source: { ...layer.source },
    });
  });
  return layers;
}

function getLayerStack(state: ScenarioState): ScenarioStackLayer[] {
  const overlayLayers = new Map(
    getStoredOverlayLayers(state).map((layer) => [layer.id, layer] as const),
  );
  const referenceLayers = new Map(
    getStoredReferenceLayers(state).map((layer) => [layer.id, layer] as const),
  );
  return state.layerStack
    .map(
      (id) =>
        overlayLayers.get(String(id)) ??
        referenceLayers.get(String(id)) ??
        state.layerStackMap[id],
    )
    .filter(Boolean) as ScenarioStackLayer[];
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

function getSupplyCategories(state: ScenarioState): SupplyCategory[] {
  return Object.values(state.supplyCategoryMap).map(({ id, ...sup }) => {
    return {
      ...sup,
      supplyClass: sup.supplyClass
        ? (state.supplyClassMap[sup.supplyClass]?.name ?? sup.supplyClass)
        : undefined,
      uom: sup.uom ? (state.supplyUomMap[sup.uom]?.name ?? sup.uom) : undefined,
    };
  });
}

function getRangeRingGroups(state: ScenarioState): RangeRingGroup[] {
  return Object.values(state.rangeRingGroupMap).map(({ id, ...rest }) => rest);
}

function getUnitStatuses(state: ScenarioState): UnitStatus[] {
  return Object.values(state.unitStatusMap).map(({ id, ...rest }) => rest);
}

function getSupplyClasses(state: ScenarioState): SupplyClass[] {
  return Object.values(state.supplyClassMap).map(({ id, ...rest }) => rest);
}

function getSupplyUoMs(state: ScenarioState): UnitOfMeasure[] {
  return Object.values(state.supplyUomMap).map(({ id, ...rest }) => rest);
}

function getSymbolFillColors(state: ScenarioState) {
  return Object.values(state.symbolFillColorMap).map(({ id, ...rest }) => rest);
}

function getCustomSymbols(state: ScenarioState) {
  return Object.values(state.customSymbolMap);
}

const DRAFT_SAVE_DEBOUNCE_MS = 2000;

export function normalizeScenarioForComparison(scenario: Scenario): Scenario {
  const normalized = klona(scenario);
  if (normalized.meta) {
    normalized.meta = {
      ...normalized.meta,
      lastModifiedDate: "",
    };
  }
  return normalized;
}

export function getScenarioComparisonKey(scenario: Scenario) {
  return JSON.stringify(normalizeScenarioForComparison(scenario));
}

function getScenarioModifiedAt(scenario?: Scenario | null) {
  if (!scenario?.meta?.lastModifiedDate) return 0;
  const ts = Date.parse(scenario.meta.lastModifiedDate);
  return Number.isNaN(ts) ? 0 : ts;
}

export function useScenarioIO(store: ShallowRef<NewScenarioStore>) {
  const settingsStore = useSymbolSettingsStore();
  const loadedBaseline = ref<Scenario | null>(null);
  const savedBaseline = ref<Scenario | null>(null);
  const draftDirty = ref(false);
  const savedDirty = ref(false);
  const lastDraftSavedAt = ref<number | null>(null);
  const loadedRevision = ref(0);
  const savedRevision = ref(0);
  const lastDraftRevision = ref<number | null>(null);
  const sessionRevision = ref(0);
  const hasLoadedBaseline = computed(() => loadedBaseline.value !== null);
  const hasSavedBaseline = computed(() => savedBaseline.value !== null);
  const hasDistinctOpenedBaseline = computed(
    () =>
      hasLoadedBaseline.value &&
      hasSavedBaseline.value &&
      loadedRevision.value !== savedRevision.value,
  );

  let draftSaveTimer: ReturnType<typeof setTimeout> | undefined;
  let stopMutationTracking: { off: () => void } | undefined;
  let dirtySyncQueued = false;
  let nextScenarioStateRevision = 1;

  function clearDraftSaveTimer() {
    if (draftSaveTimer) {
      clearTimeout(draftSaveTimer);
      draftSaveTimer = undefined;
    }
  }

  function stopMutationTrackingSubscription() {
    stopMutationTracking?.off();
    stopMutationTracking = undefined;
  }

  function allocateScenarioStateRevision() {
    return nextScenarioStateRevision++;
  }

  function toObject(): Scenario {
    const { state } = store.value;
    return {
      id: state.id,
      type: "ORBAT-mapper",
      version: SCENARIO_FILE_VERSION,
      meta: {
        createdDate: state?.meta?.createdDate,
        lastModifiedDate: new Date().toISOString(),
      },
      ...getScenarioInfo(state),
      sides: getSides(state),
      layerStack: getLayerStack(state),
      events: getScenarioEvents(state),
      equipment: getEquipment(state),
      personnel: getPersonnel(state),
      supplyCategories: getSupplyCategories(state),
      settings: {
        rangeRingGroups: getRangeRingGroups(state),
        statuses: getUnitStatuses(state),
        supplyClasses: getSupplyClasses(state),
        supplyUoMs: getSupplyUoMs(state),
        map: state.mapSettings,
        symbolFillColors: getSymbolFillColors(state),
        customSymbols: getCustomSymbols(state),
        boundingBox: state.boundingBox ?? undefined,
      },
    };
  }

  function stringifyScenario() {
    return JSON.stringify(toObject(), stringifyReplacer, "  ");
  }

  function stringifyObject(obj: any) {
    return JSON.stringify(obj, stringifyReplacer, "  ");
  }

  function stringifyReplacer(name: string, val: any) {
    if (val === undefined) return undefined;
    if (INTERNAL_NAMES.includes(name)) return undefined;
    if (TIMESTAMP_NAMES.includes(name)) {
      return dayjs(val)
        .tz(resolveTimeZone(store.value.state.info.timeZone || "UTC"))
        .format();
    }
    return val;
  }

  function serializeToObject(): Scenario {
    return JSON.parse(stringifyScenario());
  }

  function setBaselines(
    nextLoadedBaseline: Scenario | null,
    nextSavedBaseline: Scenario | null = nextLoadedBaseline,
    options: { loadedRevision?: number; savedRevision?: number } = {},
  ) {
    loadedBaseline.value = nextLoadedBaseline ? klona(nextLoadedBaseline) : null;
    savedBaseline.value = nextSavedBaseline ? klona(nextSavedBaseline) : null;
    loadedRevision.value = options.loadedRevision ?? 0;
    savedRevision.value = options.savedRevision ?? loadedRevision.value;
  }

  function syncRevisionState(currentRevision = store.value.revision.value) {
    const dirty = hasSavedBaseline.value
      ? currentRevision !== savedRevision.value
      : false;
    savedDirty.value = dirty;
    draftDirty.value =
      dirty &&
      (lastDraftRevision.value === null || currentRevision !== lastDraftRevision.value);
    return { currentRevision, dirty };
  }

  function hasUnsavedChanges() {
    return hasSavedBaseline.value
      ? store.value.revision.value !== savedRevision.value
      : false;
  }

  async function deleteDraftByScenarioId(scenarioId: string) {
    const { deleteScenarioDraft } = await useIndexedDb();
    await deleteScenarioDraft(scenarioId);
  }

  async function discardDraft(scenarioId = store.value.state.id) {
    clearDraftSaveTimer();
    await deleteDraftByScenarioId(scenarioId);
    // Reset in-memory draft tracking only when clearing the active scenario's draft.
    if (store.value?.state?.id === scenarioId) {
      draftDirty.value = false;
      lastDraftSavedAt.value = null;
      lastDraftRevision.value = null;
    }
  }

  async function persistDraftNow() {
    if (!store.value?.state) return;
    const scenarioId = store.value.state.id;
    const { currentRevision, dirty } = syncRevisionState();
    if (!dirty) {
      await discardDraft(scenarioId);
      return;
    }
    if (lastDraftRevision.value === currentRevision) {
      draftDirty.value = false;
      return;
    }
    const currentScenario = serializeToObject();
    const { putScenarioDraft } = await useIndexedDb();
    const savedAt = Date.now();
    await putScenarioDraft(scenarioId, currentScenario, {
      updatedAt: savedAt,
      appVersion: SCENARIO_FILE_VERSION,
      savedComparisonKey: savedBaseline.value
        ? getScenarioComparisonKey(savedBaseline.value)
        : undefined,
    });
    draftDirty.value = false;
    lastDraftSavedAt.value = savedAt;
    lastDraftRevision.value = currentRevision;
  }

  function scheduleDraftSave(delayMs = DRAFT_SAVE_DEBOUNCE_MS) {
    clearDraftSaveTimer();
    if (!savedDirty.value) return;
    draftSaveTimer = setTimeout(() => {
      draftSaveTimer = undefined;
      void persistDraftNow();
    }, delayMs);
  }

  function queueDirtyStateSync() {
    if (dirtySyncQueued) return;
    dirtySyncQueued = true;
    queueMicrotask(() => {
      dirtySyncQueued = false;
      const { dirty } = syncRevisionState();
      if (!dirty) {
        void discardDraft();
        return;
      }
      if (draftDirty.value) {
        scheduleDraftSave();
      }
    });
  }

  function bindMutationTracking() {
    stopMutationTrackingSubscription();
    stopMutationTracking = store.value.onMutation(queueDirtyStateSync);
  }

  function applyScenarioObject(data: LoadableScenario | Scenario) {
    const { send } = useNotifications();
    if (compareVersions(data.version, SCENARIO_FILE_VERSION, ">")) {
      send({
        message: `This scenario was created with a newer version (${data.version}). The current supported version is ${SCENARIO_FILE_VERSION}. Some features may not work correctly.`,
        type: "warning",
      });
    }

    try {
      clearDraftSaveTimer();
      stopMutationTrackingSubscription();
      store.value = useNewScenarioStore(data);
      sessionRevision.value += 1;
      bindMutationTracking();
      settingsStore.symbologyStandard =
        store.value.state.info.symbologyStandard || "2525";
      return true;
    } catch (e) {
      send({
        message: `Failed to load scenario: ${e instanceof Error ? e.message : e}. The scenario version (${data.version}) may be incompatible.`,
        type: "error",
      });
      console.error("Failed to load scenario", e);
      return false;
    }
  }

  function saveToLocalStorage(key = LOCALSTORAGE_KEY) {
    const scn = useLocalStorage(key, "");
    scn.value = stringifyScenario();
  }

  async function saveToIndexedDb() {
    const { putScenario } = await useIndexedDb();
    clearDraftSaveTimer();
    const previousScenarioId = store.value.state.id;
    const scn = serializeToObject();
    if (scn.id.startsWith("demo-")) {
      scn.id = nanoid();
      store.value.state.id = scn.id;
    }
    await putScenario(scn);
    setBaselines(loadedBaseline.value, scn, {
      loadedRevision: loadedRevision.value,
      savedRevision: store.value.revision.value,
    });
    syncRevisionState();
    draftDirty.value = false;
    lastDraftSavedAt.value = null;
    lastDraftRevision.value = null;
    await Promise.all([
      deleteDraftByScenarioId(previousScenarioId),
      previousScenarioId !== scn.id ? deleteDraftByScenarioId(scn.id) : Promise.resolve(),
    ]);
    return scn.id;
  }

  async function duplicateScenario() {
    const { putScenario } = await useIndexedDb();
    const scn = serializeToObject();
    scn.id = nanoid();
    scn.name = `${scn.name} (copy)`;
    await putScenario(scn);
    return scn.id;
  }

  function loadFromLocalStorage(key = LOCALSTORAGE_KEY) {
    const scn = useLocalStorage(key, "");

    if (scn.value) {
      loadFromObject(JSON.parse(scn.value));
    }
  }

  function loadFromObject(
    data: LoadableScenario | Scenario,
    options: LoadScenarioOptions = {},
  ) {
    if (!applyScenarioObject(data)) return;
    const currentScenario = serializeToObject();
    const nextLoadedBaseline = options.loadedBaseline ?? currentScenario;
    const nextSavedBaseline = options.savedBaseline ?? nextLoadedBaseline;
    const baselineSavedRevision = allocateScenarioStateRevision();
    const baselinesMatch =
      getScenarioComparisonKey(nextLoadedBaseline) ===
      getScenarioComparisonKey(nextSavedBaseline);
    const baselineLoadedRevision = baselinesMatch
      ? baselineSavedRevision
      : allocateScenarioStateRevision();
    const currentRevision =
      getScenarioComparisonKey(currentScenario) ===
      getScenarioComparisonKey(nextSavedBaseline)
        ? baselineSavedRevision
        : allocateScenarioStateRevision();
    store.value.setRevision(currentRevision);
    setBaselines(nextLoadedBaseline, nextSavedBaseline, {
      loadedRevision: baselineLoadedRevision,
      savedRevision: baselineSavedRevision,
    });
    lastDraftSavedAt.value = null;
    lastDraftRevision.value = null;
    syncRevisionState(currentRevision);
    if (!savedDirty.value) {
      lastDraftSavedAt.value = null;
    } else {
      scheduleDraftSave();
    }
  }

  async function loadFromUrl(url: string) {
    const { data, isFinished, statusCode, error } =
      useFetch<LoadableScenario>(url).json();
    await until(isFinished).toBe(true);

    if (error.value) {
      console.error(statusCode.value, error.value);
      return null;
    }
    loadFromObject(data.value);
    return serializeToObject();
  }

  function loadEmptyScenario() {
    const scn = createEmptyScenario();
    loadFromObject(scn);
  }

  function restoreLoadedBaseline() {
    if (!loadedBaseline.value) return false;
    if (!applyScenarioObject(loadedBaseline.value)) return false;
    store.value.clearUndoRedoStack();
    store.value.setRevision(loadedRevision.value);
    const { dirty } = syncRevisionState();
    if (!dirty) {
      void discardDraft();
    } else {
      if (draftDirty.value) scheduleDraftSave();
    }
    return true;
  }

  function revertToSaved() {
    if (!savedBaseline.value) return false;
    if (!applyScenarioObject(savedBaseline.value)) return false;
    store.value.clearUndoRedoStack();
    store.value.setRevision(savedRevision.value);
    syncRevisionState(savedRevision.value);
    void discardDraft();
    return true;
  }

  async function flushDraft() {
    clearDraftSaveTimer();
    await persistDraftNow();
  }

  async function getNewerDraft(
    scenarioId: string,
    savedScenario: Scenario,
  ): Promise<ScenarioDraft | null> {
    const { getScenarioDraft, deleteScenarioDraft } = await useIndexedDb();
    const draft = await getScenarioDraft(scenarioId);
    if (!draft) return null;

    const savedComparison = getScenarioComparisonKey(savedScenario);
    const draftComparison = getScenarioComparisonKey(draft.scenario);
    if (draftComparison === savedComparison) {
      await deleteScenarioDraft(scenarioId);
      return null;
    }

    if (
      draft.savedComparisonKey !== undefined &&
      draft.savedComparisonKey !== savedComparison
    ) {
      await deleteScenarioDraft(scenarioId);
      return null;
    }

    const savedModifiedAt = getScenarioModifiedAt(savedScenario);
    if (savedModifiedAt === 0) {
      return draft.savedComparisonKey === savedComparison ? draft : null;
    }

    if (draft.updatedAt <= savedModifiedAt) {
      await deleteScenarioDraft(scenarioId);
      return null;
    }

    return draft;
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
      return null;
    }
    const scenario = await loadFromUrl(url);
    isLoading.value = false;
    return scenario;
  }

  async function downloadAsJson(fileName?: string) {
    let name = fileName;
    if (!name) {
      //@ts-ignore
      const { default: filenamify } = await import("filenamify/browser");
      name = filenamify(store.value.state.info.name || "scenario.json");
    }
    await saveBlobToLocalFile(
      new Blob([stringifyScenario()], {
        type: "application/json",
      }),
      name + ".json",
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
    duplicateScenario,
    loadedBaseline,
    savedBaseline,
    hasLoadedBaseline,
    hasSavedBaseline,
    hasDistinctOpenedBaseline,
    draftDirty,
    savedDirty,
    hasUnsavedChanges,
    lastDraftSavedAt,
    loadedRevision,
    savedRevision,
    lastDraftRevision,
    sessionRevision,
    flushDraft,
    discardDraft,
    getNewerDraft,
    restoreLoadedBaseline,
    revertToSaved,
    stringifyObject,
    toObject,
  };
}
