import { UnitSymbolOptions } from "@/types/scenarioModels";

export const DragOperations = {
  OrbatDrag: "OrbatDrag",
} as const;

export const UnitActions = {
  Delete: "Delete",
  AddSubordinate: "AddSubordinate",
  Expand: "Expand",
  Zoom: "Zoom",
  Edit: "Edit",
  Copy: "Copy",
  Paste: "Paste",
  Clone: "Clone",
  CloneWithSubordinates: "CloneWithSubordinates",
  MoveUp: "MoveUp",
  MoveDown: "MoveDown",
  Pan: "Pan",
} as const;

export type UnitAction = (typeof UnitActions)[keyof typeof UnitActions];

export const SideActions = {
  Delete: "Delete",
  AddSubordinate: "AddSubordinate",
  Expand: "Expand",
  AddGroup: "AddGroup",
  Edit: "Edit",
  Add: "Add",
  MoveUp: "MoveUp",
  MoveDown: "MoveDown",
} as const;

export type SideAction = (typeof SideActions)[keyof typeof SideActions];

export type ScenarioActions =
  | "addSide"
  | "save"
  | "load"
  | "exportJson"
  | "loadNew"
  | "exportToClipboard"
  | "export"
  | "import"
  | "addTileJSONLayer"
  | "addXYZLayer"
  | "addImageLayer"
  | "showInfo"
  | "addEquipment"
  | "addPersonnel";

export type ScenarioFeatureActions = "delete" | "zoom" | "moveUp" | "moveDown" | "pan";

export const ScenarioLayerActions = {
  Delete: "Delete",
  Rename: "Rename",
  Edit: "Edit",
  Zoom: "Zoom",
  MoveUp: "MoveUp",
  MoveDown: "MoveDown",
  SetActive: "SetActive",
} as const;

export type ScenarioMapLayerAction = "zoom" | "delete" | "moveUp" | "moveDown";

export type ScenarioLayerAction =
  (typeof ScenarioLayerActions)[keyof typeof ScenarioLayerActions];

export const RangeRingActions = {
  Delete: "Delete",
  Edit: "Edit",
  MoveUp: "MoveUp",
  MoveDown: "MoveDown",
} as const;

export type RangeRingAction = (typeof RangeRingActions)[keyof typeof RangeRingActions];

export interface SymbolValue {
  code: string;
  text: string;
}

export interface SymbolItem extends SymbolValue {
  sidc: string;
  entity?: string;
  entityType?: string;
  entitySubtype?: string;
  symbolOptions?: UnitSymbolOptions;
}

const stateActions = [
  "delete",
  "changeTime",
  "duplicate",
  "convertToInitialPosition",
  "editTitle",
  "clearLocation",
] as const;
export type StateAction = (typeof stateActions)[number];

export const TAB_ORBAT = 0;
export const TAB_EVENTS = 1;
export const TAB_LAYERS = 2;
export const TAB_SCENARIO_SETTINGS = 3;
