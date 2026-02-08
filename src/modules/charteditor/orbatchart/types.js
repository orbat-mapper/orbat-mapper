"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartItemTypes = exports.LabelPlacements = exports.FontStyles = exports.FontWeights = exports.VerticalAlignments = exports.UnitLevelDistances = exports.LevelLayouts = exports.ChartOrientations = void 0;
exports.ChartOrientations = {
    Top: "TOP",
    Bottom: "BOTTOM",
    // Left = "LEFT",
    // Right = "RIGHT"
};
/**
 * Different ways to place units
 */
exports.LevelLayouts = {
    Horizontal: "HORIZONTAL",
    Stacked: "STACKED",
    Tree: "TREE",
    TreeLeft: "TREE_LEFT",
    TreeRight: "TREE_RIGHT",
};
exports.UnitLevelDistances = {
    Fixed: "FIXED",
    EqualPadding: "EQUAL_PADDING",
};
exports.VerticalAlignments = {
    Top: "TOP",
    Middle: "MIDDLE",
    Bottom: "BOTTOM",
};
exports.FontWeights = {
    Normal: "normal",
    Bold: "bold",
    Bolder: "bolder",
    Lighter: "lighter",
};
exports.FontStyles = {
    Normal: "normal",
    Italic: "italic",
};
exports.LabelPlacements = {
    Below: "below",
    // Left: "left",
    Right: "right",
};
exports.ChartItemTypes = {
    Chart: "chart",
    Level: "level",
    Branch: "branch",
    Unit: "unit",
};
