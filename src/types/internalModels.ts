import { CurrentStateType, ScenarioEvent, Side, SideGroup, Unit } from "./scenarioModels";
import { EntityId } from "./base";
import { FeatureId, ScenarioFeature, ScenarioLayer } from "@/types/scenarioGeoModels";
import { Optional } from "@/types/helpers";

export interface NUnit extends Omit<Unit, "subUnits" | "_pid" | "_gid" | "_sid"> {
  subUnits: EntityId[];
  _pid: EntityId;
  _gid: EntityId;
  _sid: EntityId;
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

export interface SideGroupUpdate extends Partial<Omit<NSideGroup, "id">> {}
export interface UnitUpdate extends Partial<Omit<NUnit, "id">> {}
export interface ScenarioEventUpdate extends Partial<Omit<NScenarioEvent, "id">> {}

export interface NOrbatItemData {
  unit: NUnit;
  children: NOrbatItemData[];
}

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
];
export const TIMESTAMP_NAMES = ["t", "visibleFromT", "visibleUntilT", "startTime"];
export type ScenarioEventType = "unit" | "scenario";
export interface NScenarioEvent extends ScenarioEvent {
  id: string;
  _type: ScenarioEventType;
}
