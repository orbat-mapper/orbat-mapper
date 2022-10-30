export const enum DragOperations {
  OrbatDrag = "OrbatDrag",
}

export const enum UnitActions {
  Delete = "Delete",
  AddSubordinate = "AddSubordinate",
  Expand = "Expand",
  Zoom = "Zoom",
  Edit = "Edit",
  Copy = "Copy",
  Paste = "Paste",
  Clone = "Clone",
  MoveUp = "MoveUp",
  MoveDown = "MoveDown",
  Pan = "Pan",
}

export const enum SideActions {
  Delete = "Delete",
  AddSubordinate = "AddSubordinate",
  Expand = "Expand",
  AddGroup = "AddGroup",
  Edit = "Edit",
  Add = "Add",
  MoveUp = "MoveUp",
  MoveDown = "MoveDown",
}

export type ScenarioActions =
  | "addSide"
  | "save"
  | "load"
  | "exportJson"
  | "loadNew"
  | "exportToClipboard"
  | "export"
  | "import";

export type ScenarioFeatureActions = "delete" | "zoom" | "moveUp" | "moveDown" | "pan";
//{
//   Delete = "Delete",
//   Zoom = "Zoom",
//   MoveUp = "MoveUp",
//   MoveDown = "MoveDown",
//   Pan = "Pan",
// }

export const enum ScenarioLayerActions {
  Delete = "Delete",
  Rename = "Rename",
  Edit = "Edit",
  Zoom = "Zoom",
  MoveUp = "MoveUp",
  MoveDown = "MoveDown",
}

export interface SymbolValue {
  code: string;
  text: string;
}

export interface SymbolItem extends SymbolValue {
  sidc: string;
  entity?: string;
  entityType?: string;
  entitySubtype?: string;
}

const stateActions = [
  "delete",
  "changeTime",
  "duplicate",
  "convertToInitialPosition",
  "editTitle",
  "clearLocation",
] as const;
export type StateAction = typeof stateActions[number];

export const TAB_ORBAT = 0;
export const TAB_INFO = 1;
export const TAB_LAYERS = 2;
export const TAB_EVENTS = 3;
