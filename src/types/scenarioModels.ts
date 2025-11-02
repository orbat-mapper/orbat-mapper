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
import type { TextAmpValue } from "@/symbology/milsymbwrapper";
import type { BBox, Geometry } from "geojson";
import type {
  NState,
  NUnitEquipment,
  NUnitPersonnel,
  NUnitSupply,
  UpdateUnitEquipment,
  UpdateUnitPersonnel,
  UpdateUnitSupplies,
} from "@/types/internalModels";
import type { VisibilityStyleSpec } from "@/geo/simplestyle";
import type { SymbolFillColor } from "@/config/colors.ts";

export interface State extends Partial<ScenarioEventDescription> {
  id: string;
  t: ScenarioTime;
  location?: Position | null;
  sidc?: string;
  via?: Position[];
  symbolOptions?: UnitSymbolOptions;
  textAmplifiers?: TextAmplifiers;
  interpolate?: boolean;
  viaStartTime?: ScenarioTime;
  reinforcedStatus?: ReinforcedStatus;
  status?: string | null;
  // an update replaces the current state with the new state
  update?: {
    equipment?: UpdateUnitEquipment[];
    personnel?: UpdateUnitPersonnel[];
    supplies?: UpdateUnitSupplies[];
  };
  // a diff is applied to the current state to update it
  diff?: {
    equipment?: UpdateUnitEquipment[];
    personnel?: UpdateUnitPersonnel[];
    supplies?: UpdateUnitSupplies[];
  };
}

export interface StateAdd extends Omit<NState, "id"> {
  id?: string;
}

export type CurrentStateType = "initial" | "interpolated";

export interface CurrentState extends Omit<NState, "id"> {
  type?: CurrentStateType;
  equipment?: NUnitEquipment[];
  personnel?: NUnitPersonnel[];
  supplies?: NUnitSupply[];
}

export interface LocationState extends State {
  location: Position;
}

export interface UnitSymbolOptions extends SymbolOptions {
  fillColor?: string;
}

export type TextAmplifiers = Partial<
  Omit<Record<TextAmpValue, string>, "direction"> & { direction: number }
>;
export type ReinforcedStatus = "Reinforced" | "Reduced" | "ReinforcedReduced" | "None";

export function mapReinforcedStatus2Field(
  value?: ReinforcedStatus,
  options: { compact?: boolean } = {},
): string | undefined {
  const compact = options.compact ?? false;
  switch (value) {
    case "Reinforced":
      return compact ? "+" : "(+)";
    case "Reduced":
      return compact ? "-" : "(-)";
    case "ReinforcedReduced":
      return compact ? "±" : "(±)";
    default:
      return "";
  }
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
  textAmplifiers?: TextAmplifiers;
  reinforcedStatus?: ReinforcedStatus;
  rangeRings?: RangeRing[];
  equipment?: UnitEquipment[];
  personnel?: UnitPersonnel[];
  supplies?: UnitSupply[];
  media?: Media[];
  status?: string;
  template?: EntityId;
  properties?: UnitProperties;
  locked?: boolean;
  style?: UnitStyle;
  // internal runtime only state
  _state?: CurrentState | null;
  _pid?: EntityId; // parent
  _gid?: EntityId; // group
  _sid?: EntityId; // side
  _isOpen?: boolean;
  _ikey?: string; // icon cache key
  _lkey?: string; // label cache key
}

export interface UnitStyle extends Partial<VisibilityStyleSpec> {}

export type SpeedUnitOfMeasure = "km/h" | "mph" | "knots" | "m/s" | "ft/s";
export type UnitProperty = { value: number; uom: SpeedUnitOfMeasure };

export interface UnitProperties {
  averageSpeed?: UnitProperty;
  maxSpeed?: UnitProperty;
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
  onHand?: number;
}

export interface UnitPersonnel {
  count: number;
  name: string;
  description?: string;
  onHand?: number;
}

export interface UnitSupply {
  count: number;
  name: string;
  description?: string;
  onHand?: number;
  supplyClass?: string;
  uom?: string;
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
  isHidden?: boolean;
  locked?: boolean;
  _pid?: EntityId;
  _isNew?: boolean;
}

export interface Side extends SideData {
  id: EntityId;
  isHidden?: boolean;
  groups: SideGroup[];
  locked?: boolean;
  subUnits?: Unit[];
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
  media?: Media[];
  externalUrl?: string;
}

/**
 *
 */
export interface ScenarioEvent extends ScenarioEventDescription {
  startTime: ScenarioTime;
  uiActions?: UIAction[];
  id?: string;
  _type?: "unit" | "scenario";
  where?: UnitsWhere | GeometryWhere;
}

export interface WhereOptions {
  mapAnimation?: "flyTo" | "easeTo" | "jumpTo";
  maxZoom?: number;
}

export interface UnitsWhere extends WhereOptions {
  type: "units";
  units: EntityId[];
}

export interface GeometryWhere extends WhereOptions {
  type: "geometry";
  geometry: Geometry;
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
  | "2.0.0"
  | "1.1.0"
  | "1.0.0"
  | "0.40.0"
  | "0.39.0"
  | "0.38.0"
  | "0.37.0"
  | "0.36.0"
  | "0.33.0"
  | "0.32.0"
  | "0.31.0"
  | "0.30.0"
  | "0.20.0"
  | "0.19.0"
  | "0.18.0"
  | "0.17.0"
  | "0.16.0"
  | "0.15.0"
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

export interface SupplyCategory {
  name: string;
  description?: string;
  supplyClass?: string;
  uom?: string;
}

export interface SupplyClass {
  name: string;
  description?: string;
}

export interface UnitOfMeasure {
  name: string;
  description?: string;
  code?: string; // Abbreviation (e.g., kg, L)
  type?: UoMType | "";
}

export type UoMType = "weight" | "volume" | "quantity" | "distance";

export interface UnitStatus {
  name: string;
  description?: string;
  color?: string;
}

export interface ScenarioSettings {
  rangeRingGroups: RangeRingGroup[];
  statuses: UnitStatus[];
  supplyClasses: SupplyClass[];
  supplyUoMs: UnitOfMeasure[];
  map?: MapSettings;
  boundingBox?: BBox;
  symbolFillColors?: SymbolFillColor[];
  customSymbols?: CustomSymbol[];
}

// add documentation
export interface CustomSymbol {
  id: string;
  name: string;
  /** Image source URI */
  src: string;
  /** @default [0.5 0.5] */
  anchor?: [number, number];
  sidc: string;
}

export interface MapSettings {
  baseMapId: string;
}

export interface ScenarioMetadata {
  createdDate: string;
  lastModifiedDate: string;
  exportedFrom?: EntityId;
  exportedDate?: string;
}

export interface Scenario extends ScenarioInfo {
  type: "ORBAT-mapper";
  id: string;
  version: ScenarioVersion;
  meta?: ScenarioMetadata;
  sides: Side[];
  events: ScenarioEvent[];
  layers: ScenarioLayer[];
  mapLayers: ScenarioMapLayer[];
  equipment?: EquipmentData[];
  personnel?: PersonnelData[];
  supplyCategories?: SupplyCategory[];
  unitTemplates?: Unit[];
  settings?: ScenarioSettings;
}

export type UnitOrSide = Unit | Side;

export interface OrbatItemData {
  unit: Unit;
  children: OrbatItemData[];
}

const exampleData: UnitOfMeasure[] = [
  {
    name: "Kilogram",
    code: "kg",
    type: "weight",
  },
  {
    name: "Liter",
    code: "L",
    type: "volume",
  },
  {
    name: "Each",
    code: "ea",
    type: "quantity",
  },
  {
    name: "Meter",
    code: "m",
    type: "distance",
  },
];
