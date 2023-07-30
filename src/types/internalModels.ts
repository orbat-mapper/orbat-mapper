import {
  CurrentStateType,
  EquipmentData,
  PersonnelData,
  ScenarioEvent,
  Side,
  SideGroup,
  Unit,
  UnitEquipment,
  UnitPersonnel,
} from "./scenarioModels";
import { EntityId } from "./base";
import {
  FeatureId,
  ScenarioFeature,
  ScenarioImageLayer,
  ScenarioLayer,
  ScenarioTileJSONLayer,
  ScenarioXYZLayer,
} from "@/types/scenarioGeoModels";
import { Optional } from "@/types/helpers";

export interface NUnit
  extends Omit<Unit, "subUnits" | "_pid" | "_gid" | "_sid" | "personnel" | "equipment"> {
  subUnits: EntityId[];
  equipment?: NUnitEquipment[];
  personnel?: NUnitPersonnel[];
  _pid: EntityId;
  _gid: EntityId;
  _sid: EntityId;
}

export interface NUnitEquipment extends Omit<UnitEquipment, "name"> {
  id: string;
}

export interface EUnitEquipment extends UnitEquipment {
  id: string;
}

export interface NUnitPersonnel extends Omit<UnitPersonnel, "name"> {
  id: string;
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

export interface SideUpdate extends Omit<NSide, "id"> {}

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

export interface ScenarioFeatureUpdate extends Partial<Omit<NScenarioFeature, "id">> {}
export interface ScenarioLayerUpdate
  extends Partial<Omit<NScenarioLayer, "id" | "features">> {}

export interface ScenarioImageLayerUpdate
  extends Partial<Omit<ScenarioImageLayer, "id">> {}
export interface ScenarioTileJSONLayerUpdate
  extends Partial<Omit<ScenarioTileJSONLayer, "id">> {}
export interface ScenarioXYZLayerUpdate extends Partial<Omit<ScenarioXYZLayer, "id">> {}

export type ScenarioMapLayerUpdate =
  | ScenarioImageLayerUpdate
  | ScenarioTileJSONLayerUpdate
  | ScenarioXYZLayerUpdate;
export interface SideGroupUpdate extends Partial<Omit<NSideGroup, "id">> {}
export interface UnitUpdate extends Partial<Omit<NUnit, "id">> {}
export interface ScenarioEventUpdate extends Partial<Omit<NScenarioEvent, "id">> {}

export interface NOrbatItemData {
  unit: NUnit;
  children: NOrbatItemData[];
}

export interface NEquipmentData extends EquipmentData {
  id: string;
}

export interface NPersonnelData extends PersonnelData {
  id: string;
}

export interface EquipmentDataUpdate extends Partial<Omit<NEquipmentData, "id">> {}
export interface PersonnelDataUpdate extends Partial<Omit<NPersonnelData, "id">> {}
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
];
export const TIMESTAMP_NAMES = ["t", "visibleFromT", "visibleUntilT", "startTime"];
export type ScenarioEventType = "unit" | "scenario";
export interface NScenarioEvent extends ScenarioEvent {
  id: string;
  _type: ScenarioEventType;
  _pid?: EntityId;
}
