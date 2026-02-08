"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMergedChartOptionsStore = exports.useSpecificChartOptionsStore = exports.useSelectedChartElementStore = exports.useChartSettingsStore = exports.useRootUnitStore = void 0;
var pinia_1 = require("pinia");
var orbatchart_1 = require("./orbatchart");
exports.useRootUnitStore = (0, pinia_1.defineStore)("chartRootUnit", {
    state: function () {
        return { unit: null };
    },
});
exports.useChartSettingsStore = (0, pinia_1.defineStore)("chartSettingsStore", {
    state: function () { return ({
        paperSize: "4:3",
        maxLevels: 4,
        symbolSize: orbatchart_1.DEFAULT_OPTIONS.symbolSize,
        fontSize: orbatchart_1.DEFAULT_OPTIONS.fontSize,
        lastLevelLayout: orbatchart_1.LevelLayouts.TreeRight,
        connectorOffset: orbatchart_1.DEFAULT_OPTIONS.connectorOffset,
        levelPadding: 160,
        treeOffset: orbatchart_1.DEFAULT_OPTIONS.treeOffset,
        stackedOffset: orbatchart_1.DEFAULT_OPTIONS.stackedOffset,
        lineWidth: orbatchart_1.DEFAULT_OPTIONS.lineWidth,
        useShortName: true,
        unitLevelDistance: orbatchart_1.DEFAULT_OPTIONS.unitLevelDistance,
        labelOffset: orbatchart_1.DEFAULT_OPTIONS.labelOffset,
        fontWeight: "normal",
        fontStyle: "normal",
        lineColor: orbatchart_1.DEFAULT_OPTIONS.lineColor,
        hideLabel: false,
        fontColor: orbatchart_1.DEFAULT_OPTIONS.fontColor,
        labelPlacement: "below",
        showEquipment: false,
        showPersonnel: false,
    }); },
});
exports.useSelectedChartElementStore = (0, pinia_1.defineStore)("selectedChartUnitStore", {
    state: function () { return ({
        node: null,
        level: null,
        branch: null,
    }); },
    actions: {
        clear: function () {
            this.node = null;
            this.level = null;
            this.branch = null;
        },
        selectUnit: function (unit) {
            this.node = unit;
            this.level = unit.level;
            this.branch = unit.parent
                ? { parent: unit.parent.unit.id, level: unit.level }
                : null;
        },
        selectLevel: function (levelNumber) {
            this.level = levelNumber;
            this.node = null;
            this.branch = null;
        },
        selectBranch: function (parentId, level) {
            this.branch = { level: level, parent: parentId };
            this.level = level;
            this.node = null;
        },
    },
});
exports.useSpecificChartOptionsStore = (0, pinia_1.defineStore)("specificChartOptions", {
    state: function () { return ({
        level: {},
        branch: {},
        unit: {},
    }); },
    actions: {
        clear: function () {
            this.level = {};
            this.branch = {};
            this.unit = {};
        },
    },
});
exports.useMergedChartOptionsStore = (0, pinia_1.defineStore)("mergedChartOption", {
    getters: {
        level: function () {
            var selected = (0, exports.useSelectedChartElementStore)();
            var specific = (0, exports.useSpecificChartOptionsStore)();
            var chart = (0, exports.useChartSettingsStore)();
            var spec = selected.level !== null ? specific.level[selected.level] || {} : {};
            return __assign(__assign({}, chart.$state), spec);
        },
        branch: function () {
            var selected = (0, exports.useSelectedChartElementStore)();
            var specific = (0, exports.useSpecificChartOptionsStore)();
            var spec = selected.branch !== null ? specific.branch[selected.branch.parent] || {} : {};
            return __assign(__assign({}, this.level), spec);
        },
        unit: function () {
            var selected = (0, exports.useSelectedChartElementStore)();
            var specific = (0, exports.useSpecificChartOptionsStore)();
            var spec = selected.node ? specific.unit[selected.node.unit.id] || {} : {};
            return __assign(__assign({}, this.branch), spec);
        },
    },
});
