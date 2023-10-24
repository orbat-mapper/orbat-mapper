import type {
  Position,
  RangeRing,
  RangeRingGroup,
  ScenarioLayer,
  ScenarioMapLayer,
} from "./scenarioGeoModels";
import type { EntityId, ScenarioTime } from "./base";
import type { SidValue } from "@/symbology/values";
import { type SymbolOptions } from "milsymbol";

export interface State extends Partial<ScenarioEventDescription> {
  id: string;
  t: ScenarioTime;
  location?: Position | null;
  sidc?: string;
  via?: Position[];
  symbolOptions?: UnitSymbolOptions;
  interpolate?: boolean;
  viaStartTime?: ScenarioTime;
  status?: string;
}

export interface StateAdd extends Omit<State, "id"> {
  id?: string;
}

export type CurrentStateType = "initial" | "interpolated";

export interface CurrentState extends Omit<State, "id"> {
  type?: CurrentStateType;
}

export interface LocationState extends State {
  location: Position;
}

export interface UnitSymbolOptions extends SymbolOptions {
  fillColor?: string;
}

export interface Unit {
  id: EntityId;
  name: string;
  sidc: string;
  shortName?: string;
  description?: string;
  externalUrl?: string;
  subUnits?: Unit[];
  location?: Position;
  state?: State[];
  symbolOptions?: UnitSymbolOptions;
  rangeRings?: RangeRing[];
  equipment?: UnitEquipment[];
  personnel?: UnitPersonnel[];
  media?: Media[];
  status?: string;
  template?: EntityId;
  // internal runtime only state
  _state?: CurrentState | null;
  _pid?: EntityId; // parent
  _gid?: EntityId; // group
  _sid?: EntityId; // side
  _isOpen?: boolean;
}

export interface Media {
  url: string;
  caption?: string;
  credits?: string;
  creditsUrl?: string;
}

export interface UnitEquipment {
  count: number;
  name: string;
  description?: string;
}

export interface UnitPersonnel {
  count: number;
  name: string;
  description?: string;
}

export interface SideData {
  name: string;
  description?: string;
  standardIdentity: SidValue;
  symbolOptions?: UnitSymbolOptions;
}

export interface SideGroup {
  id: EntityId;
  name: string;
  description?: string;
  subUnits: Unit[];
  symbolOptions?: UnitSymbolOptions;
  _pid?: EntityId;
  _isNew?: boolean;
}

export interface Side extends SideData {
  id: EntityId;
  groups: SideGroup[];
  _isNew?: boolean;
}

export type UIActionType =
  | "CHANGE_MAP_LAYER"
  | "FLY_TO_LOCATION"
  | "FLY_TO_UNIT_LOCATION";

/**
 * A UI/map-action
 */
export interface UIAction {
  type: UIActionType;
}

export interface ChangeMapLayerUIAction extends UIAction {
  type: "CHANGE_MAP_LAYER";
  layerIndex: number;
}

export interface FlyToUnitLocationAction extends UIAction {
  type: "FLY_TO_UNIT_LOCATION";
  unitId: string;
  zoomLevel?: number;
}

export interface ScenarioEventDescription {
  title: string;
  subTitle?: string;
  description?: string;
}

/**
 *
 */
export interface ScenarioEvent extends ScenarioEventDescription {
  startTime: ScenarioTime;
  uiActions?: UIAction[];
  id?: string;
  _type?: "unit" | "scenario";
  where?: UnitsWhere;
}

export interface WhereOptions {
  mapAnimation?: "flyTo" | "easeTo" | "jumpTo";
}

export interface UnitsWhere extends WhereOptions {
  type: "units";
  units: EntityId[];
}

export interface ScenarioInfo {
  name: string;
  description?: string;
  startTime?: ScenarioTime;
  timeZone?: string;
  symbologyStandard?: SymbologyStandard;
}

export type SymbologyStandard = "2525" | "app6";
export type ScenarioVersion =
  | "0.14.0"
  | "0.13.0"
  | "0.12.0"
  | "0.11.0"
  | "0.10.0"
  | "0.9.0"
  | "0.8.0"
  | "0.7.0"
  | "0.6.0";

export interface EquipmentData {
  name: string;
  description?: string;
  sidc?: string;
}

export interface PersonnelData {
  name: string;
  description?: string;
}

export interface UnitStatus {
  name: string;
  description?: string;
  color?: string;
}

export interface ScenarioSettings {
  rangeRingGroups: RangeRingGroup[];
  statuses: UnitStatus[];
}

export interface Scenario extends ScenarioInfo {
  type: "ORBAT-mapper";
  version: ScenarioVersion;
  sides: Side[];
  events: ScenarioEvent[];
  layers: ScenarioLayer[];
  mapLayers: ScenarioMapLayer[];
  equipment?: EquipmentData[];
  personnel?: PersonnelData[];
  unitTemplates?: Unit[];
  settings?: ScenarioSettings;
}

export type UnitOrSide = Unit | Side;

export interface OrbatItemData {
  unit: Unit;
  children: OrbatItemData[];
}
