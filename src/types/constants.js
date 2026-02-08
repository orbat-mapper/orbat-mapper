"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAB_SCENARIO_SETTINGS = exports.TAB_LAYERS = exports.TAB_EVENTS = exports.TAB_ORBAT = exports.stateActions = exports.RangeRingActions = exports.ScenarioLayerActions = exports.SideActions = exports.UnitActions = exports.DragOperations = void 0;
exports.DragOperations = {
    OrbatDrag: "OrbatDrag",
    FeatureDrag: "FeatureDrag",
};
exports.UnitActions = {
    Delete: "Delete",
    AddSubordinate: "AddSubordinate",
    Expand: "Expand",
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
    Pan: "Pan",
    DeleteWaypoints: "DeleteWaypoint",
    ClearState: "ClearState",
    ClearStateOrDelete: "ClearStateOrDelete",
    Lock: "Lock",
    Unlock: "Unlock",
};
exports.SideActions = {
    Delete: "Delete",
    AddSubordinate: "AddSubordinate",
    Expand: "Expand",
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
};
exports.ScenarioLayerActions = {
    Delete: "Delete",
    Rename: "Rename",
    Edit: "Edit",
    Zoom: "Zoom",
    MoveUp: "MoveUp",
    MoveDown: "MoveDown",
    SetActive: "SetActive",
};
exports.RangeRingActions = {
    Delete: "Delete",
    Edit: "Edit",
    MoveUp: "MoveUp",
    MoveDown: "MoveDown",
};
exports.stateActions = [
    "delete",
    "changeTime",
    "duplicate",
    "convertToInitialPosition",
    "editTitle",
    "clearLocation",
    "changeStatus",
    "editLocation",
];
exports.TAB_ORBAT = 0;
exports.TAB_EVENTS = 1;
exports.TAB_LAYERS = 2;
exports.TAB_SCENARIO_SETTINGS = 3;
