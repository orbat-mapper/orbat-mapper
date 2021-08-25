export type Position = number[];

export interface State {
  t: number;
  coordinates?: Position;
  sidc?: string;
}

export interface Unit {
  name: string;
  sidc: string;
  shortName?: string;
  description?: string;
  externalUrl?: string;
  subUnits?: Unit[];
  state?: State[];
  _state?: State | null;
  id: string;
  _pid?: string;
  _isOpen?: boolean;
}

export interface SideData {
  name: string;
  description?: string;
  standardIdentity: string;
}

export interface SideGroup {
  id: string;
  name: string;
  description?: string;
  units: Unit[];
  _pid?: string;
  _isNew?: boolean;
}

export interface Side extends SideData {
  id: string;
  groups: SideGroup[];
  _isNew?: boolean;
}

export interface UnitStateData {
  state: State;
  unit: Unit;
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
  startTime: number;
  uiActions: UIAction[];
  id?: string;
}

export interface ScenarioInfo {
  name: string;
  description?: string;
  startTime?: number;
  timeZone?: string;
  symbologyStandard?: SymbologyStandard;
}

export type SymbologyStandard = "2525" | "app6";

export interface Scenario extends ScenarioInfo {
  type: string;
  version: string;
  sides: Side[];
  events: ScenarioEvent[];
}

export interface UnitMapping {
  [id: string]: Unit;
}

export interface ObjectMapping<T> {
  [id: string]: T;
}

export interface SideMapping {
  [id: string]: Side;
}

export interface Mappings {
  unitMap: UnitMapping;
  sideMap: SideMapping;
}

export interface ScenarioState {
  scenario: Scenario;
  startTime: number;
  endTime: number;
  mappings?: Mappings;
}

export type UnitOrSide = Unit | Side;

export interface OrbatItemData {
  unit: Unit;
  children: OrbatItemData[];
}
