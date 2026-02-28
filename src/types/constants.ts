import type { UnitSymbolOptions } from "@/types/scenarioModels";

export const DragOperations = {
  OrbatDrag: "OrbatDrag",
  FeatureDrag: "FeatureDrag",
} as const;

export const UnitActions = {
  Delete: "Delete",
  AddSubordinate: "AddSubordinate",
  Expand: "Expand",
  Collapse: "Collapse",
  Zoom: "Zoom",
  Edit: "Edit",
  Copy: "Copy",
  Paste: "Paste",
  Clone: "Clone",
  CloneWithState: "CloneWithState",
  CloneWithSubordinates: "CloneWithSubordinates",
  CloneWithSubordinatesAndState: "CloneWithSubordinatesAndState",
  MoveUp: "MoveUp",
  MoveDown: "MoveDown",
  MoveUpInHierarchy: "MoveUpInHierarchy",
  Pan: "Pan",
  DeleteWaypoints: "DeleteWaypoint",
  ClearState: "ClearState",
  ClearStateOrDelete: "ClearStateOrDelete",
  Lock: "Lock",
  Unlock: "Unlock",
} as const;

export type UnitAction = (typeof UnitActions)[keyof typeof UnitActions];

export const SideActions = {
  Delete: "Delete",
  AddSubordinate: "AddSubordinate",
  Expand: "Expand",
  Collapse: "Collapse",
  AddGroup: "AddGroup",
  Edit: "Edit",
  Add: "Add",
  MoveUp: "MoveUp",
  MoveDown: "MoveDown",
  Lock: "Lock",
  Unlock: "Unlock",
  Clone: "Clone",
  CloneWithState: "CloneWithState",
  Hide: "Hide",
  Show: "Show",
} as const;

export type SideAction = (typeof SideActions)[keyof typeof SideActions];

export type ScenarioActions =
  | "addEquipment"
  | "addPersonnel"
  | "addSide"
  | "addTileJSONLayer"
  | "addXYZLayer"
  | "addImageLayer"
  | "duplicate"
  | "export"
  | "exportJson"
  | "exportToClipboard"
  | "exportToImage"
  | "import"
  | "load"
  | "loadNew"
  | "save"
  | "showInfo"
  | "createNew"
  | "startPlayback"
  | "stopPlayback"
  | "increaseSpeed"
  | "decreaseSpeed"
  | "browseSymbols"
  | "undo"
  | "redo"
  | "shareAsUrl"
  | "share"
  | "exportEncrypted";

export type ScenarioFeatureActions =
  | "delete"
  | "zoom"
  | "moveUp"
  | "moveDown"
  | "pan"
  | "duplicate"
  | "removeMedia";

export type ScenarioEventAction = "delete" | "changeTime" | "editMeta" | "editMedia";

export type UiAction = "showKeyboardShortcuts" | "showSearch";

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
export type StoredScenarioAction =
  | "delete"
  | "duplicate"
  | "download"
  | "open"
  | "copyToClipboard";

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

export interface SymbolGroup {
  name: string;
  items: SymbolItem[];
}

export interface NullableSymbolItem extends Omit<SymbolItem, "code"> {
  code: string | null;
}

export const stateActions = [
  "delete",
  "changeTime",
  "duplicate",
  "convertToInitialPosition",
  "editTitle",
  "clearLocation",
  "changeStatus",
  "editLocation",
] as const;
export type StateAction = (typeof stateActions)[number];

export const TAB_ORBAT = 0;
export const TAB_EVENTS = 1;
export const TAB_LAYERS = 2;
export const TAB_SCENARIO_SETTINGS = 3;
