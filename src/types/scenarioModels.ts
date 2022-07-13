import { Position, ScenarioLayer } from "./scenarioGeoModels";
import { EntityId, ScenarioTime } from "./base";

export interface State {
  t: ScenarioTime;
  location?: Position;
  sidc?: string;
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
  // internal runtime only state
  _state?: State | null;
  _pid?: EntityId;
  _isOpen?: boolean;
}

export interface SideData {
  name: string;
  description?: string;
  standardIdentity: string;
}

export interface SideGroup {
  id: EntityId;
  name: string;
  description?: string;
  units: Unit[];
  _pid?: EntityId;
  _isNew?: boolean;
}

export interface Side extends SideData {
  id: EntityId;
  groups: SideGroup[];
  _isNew?: boolean;
}

export enum UIActionType {
  CHANGE_MAP_LAYER_ACTION = "CHANGE_MAP_LAYER",
  FLY_TO_LOCATION_ACTION = "FLY_TO_LOCATION",
  FLY_TO_UNIT_LOCATION_ACTION = "FLY_TO_LOCATION",
}

/**
 * A UI/map-action
 */
export interface UIAction {
  type: UIActionType;
}

export interface ChangeMapLayerUIAction extends UIAction {
  type: UIActionType.CHANGE_MAP_LAYER_ACTION;
  layerIndex: number;
}

export interface FlyToUnitLocationAction extends UIAction {
  type: UIActionType.FLY_TO_UNIT_LOCATION_ACTION;
  unitId: string;
  zoomLevel?: number;
}

/**
 *
 */
export interface ScenarioEvent {
  title: string;
  subTitle?: string;
  description?: string;
  startTime: ScenarioTime;
  uiActions: UIAction[];
  id?: string;
}

export interface ScenarioInfo {
  name: string;
  description?: string;
  startTime?: ScenarioTime;
  timeZone?: string;
  symbologyStandard?: SymbologyStandard;
}

export type SymbologyStandard = "2525" | "app6";
export type ScenarioVersion = "0.5.0" | "0.6.0";

export interface Scenario extends ScenarioInfo {
  type: "ORBAT-mapper";
  version: ScenarioVersion;
  sides: Side[];
  events: ScenarioEvent[];
  layers: ScenarioLayer[];
}

export type UnitOrSide = Unit | Side;

export interface OrbatItemData {
  unit: Unit;
  children: OrbatItemData[];
}
