"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OPTIONS = exports.MARGIN_TOP = exports.STACKED_OFFSET = exports.TREE_LEFT_RIGHT_OFFSET = exports.DEFAULT_CHART_HEIGHT = exports.DEFAULT_CHART_WIDTH = void 0;
var types_1 = require("./types");
exports.DEFAULT_CHART_WIDTH = 600;
exports.DEFAULT_CHART_HEIGHT = 600;
exports.TREE_LEFT_RIGHT_OFFSET = 50;
exports.STACKED_OFFSET = 50;
exports.MARGIN_TOP = 100;
exports.DEFAULT_OPTIONS = {
    symbolSize: 32,
    maxLevels: 0,
    debug: false,
    connectorOffset: 5,
    orientation: types_1.ChartOrientations.Top,
    unitLevelDistance: types_1.UnitLevelDistances.Fixed,
    lastLevelLayout: types_1.LevelLayouts.Horizontal,
    layout: types_1.LevelLayouts.Horizontal,
    verticalAlignment: types_1.VerticalAlignments.Top,
    levelPadding: 175,
    treeOffset: exports.TREE_LEFT_RIGHT_OFFSET,
    stackedOffset: exports.STACKED_OFFSET,
    lineWidth: 1,
    fontSize: 12,
    useShortName: false,
    labelOffset: 8,
    fontStyle: "normal",
    fontWeight: "normal",
    lineColor: "#1F2937",
    fontColor: "#0F172A",
    hideLabel: false,
    showEquipment: false,
    showPersonnel: false,
};
