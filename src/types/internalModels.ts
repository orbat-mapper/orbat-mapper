import type {
  CurrentStateType,
  EquipmentData,
  Media,
  PersonnelData,
  ScenarioEvent,
  Side,
  SideGroup,
  SpeedUnitOfMeasure,
  State,
  SupplyCategory,
  SupplyClass,
  Unit,
  UnitEquipment,
  UnitOfMeasure,
  UnitPersonnel,
  UnitStatus,
  UnitSupply,
} from "./scenarioModels";
import type { EntityId } from "./base";
import type {
  FeatureId,
  RangeRingGroup,
  ScenarioFeature,
  ScenarioFeatureMeta,
  ScenarioImageLayer,
  ScenarioKMLLayer,
  ScenarioLayer,
  ScenarioTileJSONLayer,
  ScenarioXYZLayer,
} from "@/types/scenarioGeoModels";
import type { Optional } from "@/types/helpers";

export interface NUnit
  extends Omit<
    Unit,
    | "subUnits"
    | "_pid"
    | "_gid"
    | "_sid"
    | "personnel"
    | "equipment"
    | "state"
    | "supplies"
  > {
  subUnits: EntityId[];
  equipment?: NUnitEquipment[];
  personnel?: NUnitPersonnel[];
  supplies?: NUnitSupply[];
  state?: NState[];
  _pid: EntityId;
  _gid: EntityId;
  _sid: EntityId;
}

export interface NUnitEquipment extends Omit<UnitEquipment, "name"> {
  id: string;
}

export interface NUnitSupply extends Omit<UnitSupply, "name"> {
  id: string;
}

export interface NUpdateUnitEquipment extends Omit<NUnitEquipment, "count"> {
  count?: number;
}

export interface UpdateUnitEquipment extends Omit<UnitEquipment, "count"> {
  count?: number;
}

export interface EUnitEquipment extends UnitEquipment {
  id: string;
}

export interface EUnitSupply extends UnitSupply {
  id: string;
}

export interface NUnitPersonnel extends Omit<UnitPersonnel, "name"> {
  id: string;
}

export interface NUpdateUnitPersonnel extends Omit<NUnitPersonnel, "count"> {
  count?: number;
}

export interface NUpdateUnitSupplies extends Omit<NUnitSupply, "count"> {
  count?: number;
}

export interface UpdateUnitPersonnel extends Omit<UnitPersonnel, "count"> {
  count?: number;
}

export interface UpdateUnitSupplies extends Omit<UnitSupply, "count"> {
  count?: number;
}

export interface EUnitPersonnel extends UnitPersonnel {
  id: string;
}

export interface NUnitAdd extends Optional<NUnit, "id" | "_pid" | "_gid" | "_sid"> {}

export interface OlUnitProps
  extends Pick<NUnit, "id" | "sidc" | "name" | "shortName" | "symbolOptions"> {
  stateType: CurrentStateType;
}

export interface NSide extends Omit<Side, "groups"> {
  groups: EntityId[];
  _isOpen?: boolean;
}

export interface SideUpdate extends Omit<NSide, "id" | "groups"> {}

export interface NSideGroup extends Omit<SideGroup, "subUnits" | "_pid"> {
  subUnits: EntityId[];
  _isOpen?: boolean;
  _pid: EntityId;
}

export interface NScenarioLayer extends Omit<ScenarioLayer, "features"> {
  features: FeatureId[];
  _isOpen?: boolean;
}
export interface NScenarioFeature extends ScenarioFeature {
  _pid: FeatureId;
}

export interface ScenarioFeatureUpdate
  extends Partial<Omit<NScenarioFeature, "id" | "meta">> {
  meta?: Partial<ScenarioFeatureMeta>;
}
export interface ScenarioLayerUpdate
  extends Partial<Omit<NScenarioLayer, "id" | "features">> {}

export interface ScenarioImageLayerUpdate
  extends Partial<Omit<ScenarioImageLayer, "id">> {}
export interface ScenarioTileJSONLayerUpdate
  extends Partial<Omit<ScenarioTileJSONLayer, "id">> {}
export interface ScenarioXYZLayerUpdate extends Partial<Omit<ScenarioXYZLayer, "id">> {}
export interface ScenarioKMLLayerUpdate extends Partial<Omit<ScenarioKMLLayer, "id">> {}

export type ScenarioMapLayerUpdate =
  | ScenarioImageLayerUpdate
  | ScenarioTileJSONLayerUpdate
  | ScenarioXYZLayerUpdate
  | ScenarioKMLLayerUpdate;

export interface SideGroupUpdate extends Partial<Omit<NSideGroup, "id" | "subUnits">> {}
export interface UnitUpdate extends Partial<Omit<NUnit, "id">> {}
export interface ScenarioEventUpdate extends Partial<Omit<NScenarioEvent, "id">> {}
export interface MediaUpdate extends Partial<Media> {}

export interface NOrbatItemData {
  unit: NUnit;
  children: NOrbatItemData[];
}
export interface NRangeRingGroup extends RangeRingGroup {
  id: string;
}

export interface NEquipmentData extends EquipmentData {
  id: string;
}

export interface NPersonnelData extends PersonnelData {
  id: string;
}

export interface NSupplyCategory extends SupplyCategory {
  id: string;
}

export interface NUnitStatus extends UnitStatus {
  id: string;
}

export interface NSupplyClass extends SupplyClass {
  id: string;
}

export interface NSupplyUoM extends UnitOfMeasure {
  id: string;
}

export interface NState extends Omit<State, "update" | "diff"> {
  // an update replaces the current state with the new state
  update?: {
    equipment?: NUpdateUnitEquipment[];
    personnel?: NUpdateUnitPersonnel[];
    supplies?: NUpdateUnitSupplies[];
  };
  // a diff is applied to the current state to update it
  diff?: {
    equipment?: NUpdateUnitEquipment[];
    personnel?: NUpdateUnitPersonnel[];
    supplies?: NUpdateUnitSupplies[];
  };
}

export interface SupplyClassUpdate extends Partial<Omit<NSupplyClass, "id">> {}
export interface SupplyUomUpdate extends Partial<Omit<NSupplyUoM, "id">> {}
export interface UnitStatusUpdate extends Partial<Omit<NUnitStatus, "id">> {}
export interface EquipmentDataUpdate extends Partial<Omit<NEquipmentData, "id">> {}
export interface PersonnelDataUpdate extends Partial<Omit<NPersonnelData, "id">> {}
export interface SupplyCategoryUpdate extends Partial<Omit<NSupplyCategory, "id">> {}
export const INTERNAL_NAMES = [
  "_state",
  "_pid",
  "_isOpen",
  "_isNew",
  "_zIndex",
  "_hidden",
  "_gid",
  "_sid",
  "_type",
  "_status",
  "_isTemporary",
  "_counter",
];
export const TIMESTAMP_NAMES = ["t", "visibleFromT", "visibleUntilT", "startTime"];
export type ScenarioEventType = "unit" | "scenario";
export interface NScenarioEvent extends ScenarioEvent {
  id: EntityId;
  _type: ScenarioEventType;
  _pid?: EntityId;
}

export type UnitPropertyUpdate = {
  value?: number | string | null;
  uom: SpeedUnitOfMeasure;
};

export type ToeMode = "equipment" | "personnel";
