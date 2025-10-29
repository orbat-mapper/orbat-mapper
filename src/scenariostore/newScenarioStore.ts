import { useImmerStore } from "@/composables/immerStore";
import type {
  CustomSymbol,
  EquipmentData,
  MapSettings,
  PersonnelData,
  Scenario,
  ScenarioInfo,
  ScenarioMetadata,
  Side,
  SideGroup,
  State,
  SupplyCategory,
  SupplyClass,
  Unit,
  UnitOfMeasure,
  UnitStatus,
} from "@/types/scenarioModels";
import dayjs from "dayjs";
import { nanoid } from "@/utils";
import { walkSide } from "@/stores/scenarioStore";
import { klona } from "klona";
import type { EntityId } from "@/types/base";
import type {
  NEquipmentData,
  NPersonnelData,
  NRangeRingGroup,
  NScenarioEvent,
  NScenarioFeature,
  NScenarioLayer,
  NSide,
  NSideGroup,
  NState,
  NSupplyCategory,
  NSupplyClass,
  NSupplyUoM,
  NSymbolFillColor,
  NUnit,
  NUnitEquipment,
  NUnitPersonnel,
  NUnitStatus,
  NUnitSupply,
} from "@/types/internalModels";
import { useScenarioTime } from "./time";
import type {
  FeatureId,
  RangeRing,
  RangeRingGroup,
  ScenarioMapLayer,
  VisibilityInfo,
} from "@/types/scenarioGeoModels";
import { DEFAULT_BASEMAP_ID } from "@/config/constants";
import { upgradeScenarioIfNecessary } from "@/scenariostore/upgrade";
import { SYMBOL_FILL_COLORS } from "@/config/colors.ts";

export interface ScenarioState {
  id: EntityId;
  meta: ScenarioMetadata;
  unitMap: Record<EntityId, NUnit>;
  sideMap: Record<EntityId, NSide>;
  sideGroupMap: Record<EntityId, NSideGroup>;
  eventMap: Record<EntityId, NScenarioEvent>;
  sides: EntityId[];
  layers: FeatureId[];
  layerMap: Record<FeatureId, NScenarioLayer>;
  featureMap: Record<FeatureId, NScenarioFeature>;
  mapLayers: FeatureId[];
  mapLayerMap: Record<FeatureId, ScenarioMapLayer>;
  info: ScenarioInfo;
  events: EntityId[];
  equipmentMap: Record<string, NEquipmentData>;
  personnelMap: Record<string, NPersonnelData>;
  supplyCategoryMap: Record<string, NSupplyCategory>;
  currentTime: number;
  rangeRingGroupMap: Record<string, NRangeRingGroup>;
  unitStatusMap: Record<string, NUnitStatus>;
  supplyClassMap: Record<string, NSupplyClass>;
  supplyUomMap: Record<string, NSupplyUoM>;
  unitStateCounter: number;
  featureStateCounter: number;
  settingsStateCounter: number; // used to force reactivity
  mapSettings: MapSettings;
  symbolFillColorMap: Record<string, NSymbolFillColor>;
  customSymbolMap: Record<string, CustomSymbol>;
}

export type NewScenarioStore = ReturnType<typeof useNewScenarioStore>;

export function convertStateToInternalFormat(e: State): State {
  return {
    ...e,
    t: +dayjs(e.t),
    viaStartTime: e.viaStartTime !== undefined ? +dayjs(e.viaStartTime) : undefined,
    id: e.id || nanoid(),
  };
}

export function prepareScenario(newScenario: Scenario): ScenarioState {
  const unitMap: Record<EntityId, NUnit> = {};
  const sideMap: Record<EntityId, NSide> = {};
  const sideGroupMap: Record<EntityId, NSideGroup> = {};
  const eventMap: Record<EntityId, NScenarioEvent> = {};
  const sides: EntityId[] = [];
  const layers: FeatureId[] = [];
  const mapLayers: FeatureId[] = [];
  const layerMap: Record<FeatureId, NScenarioLayer> = {};
  const featureMap: Record<FeatureId, NScenarioFeature> = {};
  const mapLayerMap: Record<FeatureId, ScenarioMapLayer> = {};
  const equipmentMap: Record<string, NEquipmentData> = {};
  const personnelMap: Record<string, NPersonnelData> = {};
  const supplyCategoryMap: Record<string, NSupplyCategory> = {};
  const rangeRingGroupMap: Record<string, NRangeRingGroup> = {};
  const unitStatusMap: Record<string, NUnitStatus> = {};
  const supplyClassMap: Record<string, NSupplyClass> = {};
  const supplyUoMMap: Record<string, NSupplyUoM> = {};
  const symbolFillColorMap: Record<string, NSymbolFillColor> = {};
  const customSymbolMap: Record<string, CustomSymbol> = {};
  const tempSymbolFillColors = new Set<string>();
  const tempEquipmentIdMap: Record<string, string> = {};
  const tempPersonnelIdMap: Record<string, string> = {};
  const tempSuppliesIdMap: Record<string, string> = {};
  const tempRangeRingGroupIdMap: Record<string, string> = {};
  const tempUnitStatusIdMap: Record<string, string> = {};
  const tempSupplyClassIdMap: Record<string, string> = {};
  const tempSupplyUomIdMap: Record<string, string> = {};
  const scenario = upgradeScenarioIfNecessary(newScenario);

  const scenarioId = scenario.id ?? nanoid();
  const mapSettings: MapSettings = scenario.settings?.map ?? {
    baseMapId: DEFAULT_BASEMAP_ID,
  };

  let unitStateCounter = 0;
  let featureStateCounter = 0;
  let settingsStateCounter = 0;

  scenario.events.forEach((e) => {
    const nEvent: NScenarioEvent = {
      ...e,
      startTime: +dayjs(e.startTime),
      id: e.id ?? nanoid(),
      _type: "scenario",
    };
    eventMap[nEvent.id] = nEvent;
  });

  scenario.settings?.statuses?.forEach((s) => {
    const id = nanoid();
    tempUnitStatusIdMap[s.name] = id;
    unitStatusMap[id] = { ...s, id };
  });

  scenario.settings?.supplyClasses?.forEach((s) => {
    const id = nanoid();
    supplyClassMap[id] = { ...s, id };
    tempSupplyClassIdMap[s.name] = id;
  });

  scenario.settings?.supplyUoMs?.forEach((s) => {
    const id = nanoid();
    supplyUoMMap[id] = { ...s, id };
    tempSupplyUomIdMap[s.name] = id;
  });

  scenario.settings?.customSymbols?.forEach((s) => {
    customSymbolMap[s.id] = s;
  });

  SYMBOL_FILL_COLORS.forEach((s) => tempSymbolFillColors.add(s.code));
  scenario.settings?.symbolFillColors?.forEach((s) => {
    const id = nanoid();
    symbolFillColorMap[id] = { ...s, id };
    tempSymbolFillColors.add(s.code);
  });

  if (scenario.startTime !== undefined) {
    scenario.startTime = +dayjs(scenario.startTime);
  }

  function prepareUnit(
    unit1: Unit,
    level: number,
    parent: Unit | SideGroup | Side,
    sideGroup: SideGroup | null | undefined,
    side: Side,
  ) {
    const unit = klona(unit1);

    if (!unit.id) {
      unit.id = nanoid();
    }

    checkFillColor(unit);

    unit._pid = parent.id;
    unit._isOpen = false;
    unit._gid = sideGroup?.id;
    unit._sid = side.id;
    const equipment: NUnitEquipment[] = [];
    const personnel: NUnitPersonnel[] = [];
    const supplies: NUnitSupply[] = [];
    const rangeRings: RangeRing[] = [];

    unit.equipment?.forEach(({ name, count }) => {
      const id = tempEquipmentIdMap[name] || addEquipment({ name });
      equipment.push({ id, count });
    });

    unit.personnel?.forEach(({ name, count }) => {
      const id = tempPersonnelIdMap[name] || addPersonnel({ name });
      personnel.push({ id, count });
    });

    unit.supplies?.forEach((s) => {
      const { count, onHand, name } = s;
      const id = tempSuppliesIdMap[s.name] || addSupplyCategory(s);
      supplies.push({ id, count, onHand });
    });

    unit.rangeRings?.forEach((rr) => {
      const { group, style, ...rest } = rr;
      if (group) {
        const groupId =
          tempRangeRingGroupIdMap[group] || addRangeRingGroup({ name: group });
        rangeRings.push({ ...rest, group: groupId });
      } else {
        rangeRings.push(rr);
      }
    });

    if (unit.status) {
      unit.status =
        tempUnitStatusIdMap[unit.status] || addUnitStatus({ name: unit.status });
    }

    // convert state as last step since it may reference other entities
    if (!unit.state) {
      unit.state = [];
    } else {
      unit.state = unit.state.map(convertStateToInternalFormat);
    }
    unit.state
      ?.filter((s) => s.status)
      .forEach((s) => {
        s.status = tempUnitStatusIdMap[s.status!] || addUnitStatus({ name: s.status! });
      });
    unit._state = null;

    const newState: NState[] = unit.state.map((s) => {
      const { update, diff, ...rest } = s;
      checkFillColor(s);
      const newUpdate = update
        ? {
            equipment: update.equipment?.map((e) => {
              const { name, ...rest } = e;
              return { id: tempEquipmentIdMap[name] ?? name, ...rest };
            }),
            personnel: update.personnel?.map((p) => {
              const { name, ...rest } = p;
              return { id: tempPersonnelIdMap[name] ?? name, ...rest };
            }),
            supplies: update.supplies?.map((s) => {
              const { name, ...rest } = s;
              return { id: tempSuppliesIdMap[name] ?? name, ...rest };
            }),
          }
        : undefined;
      const newDiff = diff
        ? {
            equipment: diff.equipment?.map((e) => {
              const { name, ...rest } = e;
              return { id: tempEquipmentIdMap[name] ?? name, ...rest };
            }),
            personnel: diff.personnel?.map((p) => {
              const { name, ...rest } = p;
              return { id: tempPersonnelIdMap[name] ?? name, ...rest };
            }),
            supplies: diff.supplies?.map((s) => {
              const { name, ...rest } = s;
              return { id: tempSuppliesIdMap[name] ?? name, ...rest };
            }),
          }
        : undefined;
      return { ...rest, update: newUpdate, diff: newDiff };
    });

    unitMap[unit1.id] = {
      ...unit,
      subUnits: unit.subUnits?.map((u) => u.id) || [],
      equipment,
      personnel,
      supplies,
      rangeRings,
      state: newState,
    } as NUnit;
  }

  scenario.equipment?.forEach((e) => {
    addEquipment(e);
  });

  scenario.personnel?.forEach((e) => {
    addPersonnel(e);
  });

  scenario.supplyCategories?.forEach((s) => {
    addSupplyCategory(s);
  });

  scenario.settings?.rangeRingGroups?.forEach((g) => {
    addRangeRingGroup(g);
  });

  function addPersonnel(p: PersonnelData) {
    const id = nanoid();
    tempPersonnelIdMap[p.name] = id;
    personnelMap[id] = { ...p, id };
    return id;
  }

  function addEquipment(e: EquipmentData) {
    const id = nanoid();
    tempEquipmentIdMap[e.name] = id;
    equipmentMap[id] = { ...e, id };
    return id;
  }

  function addSupplyCategory(s: SupplyCategory) {
    const id = nanoid();
    const sc = { ...s, id };
    if (sc.supplyClass) {
      sc.supplyClass =
        tempSupplyClassIdMap[sc.supplyClass] ?? addSupplyClass({ name: sc.supplyClass });
    }

    if (sc.uom) {
      sc.uom = tempSupplyUomIdMap[sc.uom] ?? addSupplyUom({ name: sc.uom });
    }

    tempSuppliesIdMap[s.name] = id;
    supplyCategoryMap[id] = { ...sc, id };
    return id;
  }

  function addRangeRingGroup(g: RangeRingGroup) {
    const id = nanoid();
    tempRangeRingGroupIdMap[g.name] = id;
    rangeRingGroupMap[id] = { ...g, id };
    return id;
  }

  function addUnitStatus(s: UnitStatus) {
    const id = nanoid();
    tempUnitStatusIdMap[s.name] = id;
    unitStatusMap[id] = { ...s, id };
    return id;
  }

  function addSupplyClass(s: SupplyClass) {
    const id = nanoid();
    tempSupplyClassIdMap[s.name] = id;
    supplyClassMap[id] = { ...s, id };
    return id;
  }

  function addSupplyUom(s: UnitOfMeasure) {
    const id = nanoid();
    tempSupplyUomIdMap[s.name] = id;
    supplyUoMMap[id] = { ...s, id };
    return id;
  }

  function checkFillColor(item: Unit | Side | SideGroup | State) {
    if (item.symbolOptions?.fillColor) {
      if (!tempSymbolFillColors.has(item.symbolOptions.fillColor)) {
        const newColor: NSymbolFillColor = {
          id: nanoid(),
          text: `Custom color (${item.symbolOptions.fillColor})`,
          code: item.symbolOptions.fillColor,
        };
        symbolFillColorMap[newColor.id] = newColor;
        tempSymbolFillColors.add(item.symbolOptions.fillColor);
      }
    }
  }

  scenario.sides.forEach((side) => {
    sideMap[side.id] = {
      ...side,
      groups: side.groups.map((group) => group.id),
      subUnits: side.subUnits?.map((unit) => unit.id) ?? [],
    };
    sides.push(side.id);
    checkFillColor(side);
    side.groups.forEach((group) => {
      sideGroupMap[group.id] = {
        ...group,
        _pid: side.id,
        subUnits: group.subUnits.map((unit) => unit.id),
      };
      checkFillColor(group);
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

  function mapVisibility<T extends Partial<VisibilityInfo>>(l: T): T {
    const r = { ...l };
    if (l.visibleFromT !== undefined) {
      r.visibleFromT = +dayjs(l.visibleFromT);
    }
    if (l.visibleUntilT !== undefined) {
      r.visibleUntilT = +dayjs(l.visibleUntilT);
    }
    return r;
  }

  scenario.layers.forEach((layer) => {
    layers.push(layer.id);
    layerMap[layer.id] = {
      ...mapVisibility(layer),
      features: layer.features.map((f) => f.id),
    };
    layer.features.forEach((feature) => {
      const tmp = { ...feature };
      tmp.state = tmp.state?.map((s) => ({
        ...s,
        t: +dayjs(s.t),
        id: s.id || nanoid(),
      }));

      tmp.meta = mapVisibility(tmp.meta);
      featureMap[feature.id] = { ...tmp, _pid: layer.id };
    });
  });

  scenario.mapLayers?.forEach((layer) => {
    mapLayers.push(layer.id);
    mapLayerMap[layer.id] = {
      ...layer,
      ...mapVisibility(layer),
    };
  });

  const events = Object.values(eventMap).map((e) => e.id);

  events.sort((la, lb) => {
    const a = eventMap[la].startTime;
    const b = eventMap[lb].startTime;
    return a < b ? -1 : a > b ? 1 : 0;
  });

  const meta: ScenarioMetadata = {
    createdDate: scenario.meta?.createdDate ?? new Date().toISOString(),
    lastModifiedDate: scenario.meta?.lastModifiedDate ?? new Date().toISOString(),
  };

  return {
    id: scenarioId,
    meta,
    layers,
    mapLayers: mapLayers,
    mapLayerMap: mapLayerMap,
    layerMap,
    featureMap,
    eventMap,
    currentTime: scenario.startTime || 0,
    info,
    sides,
    unitMap,
    sideMap,
    sideGroupMap,
    events,
    equipmentMap,
    personnelMap,
    supplyCategoryMap,
    supplyClassMap,
    supplyUomMap: supplyUoMMap,
    rangeRingGroupMap,
    unitStateCounter,
    featureStateCounter,
    settingsStateCounter,
    unitStatusMap,
    mapSettings,
    symbolFillColorMap,
    customSymbolMap,
  };
}

export type ActionLabel =
  | "deleteLayer"
  | "addLayer"
  | "addFeature"
  | "deleteFeature"
  | "addUnitPosition"
  | "updateFeature"
  | "updateFeatureGeometry"
  | "updateFeatureState"
  | "addSide"
  | "updateLayer"
  | "moveLayer"
  | "moveFeature"
  | "batchLayer"
  | "addMapLayer"
  | "deleteMapLayer"
  | "updateMapLayer"
  | "moveMapLayer"
  | "clearUnitState";

export function useNewScenarioStore(data: Scenario) {
  const inputState = prepareScenario(data);
  const store = useImmerStore<ScenarioState, ActionLabel>(inputState);

  useScenarioTime(store).setCurrentTime(store.state.currentTime);
  return store;
}
