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
exports.idle = void 0;
exports.getSideDragItem = getSideDragItem;
exports.isSideDragItem = isSideDragItem;
exports.getSideGroupDragItem = getSideGroupDragItem;
exports.isSideGroupDragItem = isSideGroupDragItem;
exports.getUnitDragItem = getUnitDragItem;
exports.isUnitDragItem = isUnitDragItem;
exports.getScenarioFeatureDragItem = getScenarioFeatureDragItem;
exports.isScenarioFeatureDragItem = isScenarioFeatureDragItem;
exports.getScenarioFeatureLayerDragItem = getScenarioFeatureLayerDragItem;
exports.isScenarioFeatureLayerDragItem = isScenarioFeatureLayerDragItem;
exports.idle = { type: "idle" };
var privateKey = Symbol("scenarioFeature");
var _scnFeatureLayerKey = Symbol("scenarioFeatureLayer");
var privateUnitDragKey = Symbol("unit");
var privateSideKey = Symbol("side");
var privateSideGroupKey = Symbol("sideGroup");
function getSideDragItem(data) {
    var _a;
    return __assign((_a = {}, _a[privateSideKey] = true, _a), data);
}
function isSideDragItem(data) {
    return Boolean(data[privateSideKey]);
}
function getSideGroupDragItem(data) {
    var _a;
    return __assign((_a = {}, _a[privateSideGroupKey] = true, _a), data);
}
function isSideGroupDragItem(data) {
    return Boolean(data[privateSideGroupKey]);
}
function getUnitDragItem(data, source) {
    var _a;
    return __assign(__assign((_a = {}, _a[privateUnitDragKey] = true, _a), data), { source: source });
}
function isUnitDragItem(data) {
    return Boolean(data[privateUnitDragKey]);
}
function getScenarioFeatureDragItem(data) {
    var _a;
    return __assign((_a = {}, _a[privateKey] = true, _a), data);
}
function isScenarioFeatureDragItem(data) {
    return Boolean(data[privateKey]);
}
function getScenarioFeatureLayerDragItem(data) {
    var _a;
    return __assign((_a = {}, _a[_scnFeatureLayerKey] = true, _a), data);
}
function isScenarioFeatureLayerDragItem(data) {
    return Boolean(data[_scnFeatureLayerKey]);
}
