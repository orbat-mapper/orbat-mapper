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
exports.useChartSettings = useChartSettings;
var orbatchart_1 = require("./orbatchart");
var chartSettingsStore_1 = require("./chartSettingsStore");
var vue_1 = require("vue");
function useChartSettings(chartElementType) {
    var options = (0, chartSettingsStore_1.useChartSettingsStore)();
    var selectedElementStore = (0, chartSettingsStore_1.useSelectedChartElementStore)();
    var specificOptionsStore = (0, chartSettingsStore_1.useSpecificChartOptionsStore)();
    var mOptions = (0, chartSettingsStore_1.useMergedChartOptionsStore)();
    var mergedOptions = (0, vue_1.computed)(function () {
        switch (chartElementType) {
            case orbatchart_1.ChartItemTypes.Level:
                return mOptions.level;
            case orbatchart_1.ChartItemTypes.Branch:
                return mOptions.branch;
            case orbatchart_1.ChartItemTypes.Unit:
                return mOptions.unit;
            case orbatchart_1.ChartItemTypes.Chart:
                return options;
            default:
                return {};
        }
    });
    var currentElement = (0, vue_1.computed)(function () {
        var _a, _b;
        switch (chartElementType) {
            case orbatchart_1.ChartItemTypes.Level:
                return selectedElementStore.level;
            case orbatchart_1.ChartItemTypes.Branch:
                return ((_a = selectedElementStore.branch) === null || _a === void 0 ? void 0 : _a.parent) || null;
            case orbatchart_1.ChartItemTypes.Unit:
                return ((_b = selectedElementStore.node) === null || _b === void 0 ? void 0 : _b.unit) || null;
            default:
                return null;
        }
    });
    var elementOptions = (0, vue_1.computed)(function () {
        if (currentElement.value == null && chartElementType !== orbatchart_1.ChartItemTypes.Chart)
            return null;
        switch (chartElementType) {
            case orbatchart_1.ChartItemTypes.Level:
                return specificOptionsStore.level[currentElement.value];
            case orbatchart_1.ChartItemTypes.Branch:
                return specificOptionsStore.branch[currentElement.value];
            case orbatchart_1.ChartItemTypes.Unit:
                return specificOptionsStore.unit[currentElement.value.id] || null;
            case orbatchart_1.ChartItemTypes.Chart:
                return options.$state;
            default:
                return null;
        }
    });
    function setValue(name, value) {
        var _a;
        if (currentElement.value == null) {
            if (chartElementType !== orbatchart_1.ChartItemTypes.Chart)
                return;
        }
        var opts = __assign(__assign({}, (elementOptions.value || {})), (_a = {}, _a[name] = value, _a));
        switch (chartElementType) {
            case orbatchart_1.ChartItemTypes.Level:
                specificOptionsStore.level[currentElement.value] = opts;
                break;
            case orbatchart_1.ChartItemTypes.Branch:
                specificOptionsStore.branch[currentElement.value] = opts;
                break;
            case orbatchart_1.ChartItemTypes.Unit:
                specificOptionsStore.unit[currentElement.value.id] = opts;
                break;
            case orbatchart_1.ChartItemTypes.Chart:
                //@ts-ignore
                options.$state[name] = value;
                break;
        }
    }
    function clearSpecificOptions() {
        var opts = {};
        if (currentElement.value == null)
            return;
        switch (chartElementType) {
            case orbatchart_1.ChartItemTypes.Level:
                specificOptionsStore.level[currentElement.value] = opts;
                break;
            case orbatchart_1.ChartItemTypes.Branch:
                specificOptionsStore.branch[currentElement.value] = opts;
                break;
            case orbatchart_1.ChartItemTypes.Unit:
                specificOptionsStore.unit[currentElement.value.id] = opts;
                break;
        }
    }
    var usedOptions = (0, vue_1.computed)(function () { return new Set(Object.keys(elementOptions.value || {})); });
    return { setValue: setValue, clearSpecificOptions: clearSpecificOptions, usedOptions: usedOptions, mergedOptions: mergedOptions };
}
