"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSelectedItems = useSelectedItems;
var vue_1 = require("vue");
var selectedUnitIds = (0, vue_1.ref)(new Set());
var activeUnitIdRef = (0, vue_1.ref)();
var selectedFeatureIds = (0, vue_1.ref)(new Set());
var activeFeatureIdRef = (0, vue_1.ref)();
var activeMapLayerIdRef = (0, vue_1.ref)();
var selectedMapLayerIds = (0, vue_1.ref)(new Set());
var selectedScenarioEventIds = (0, vue_1.ref)(new Set());
var activeScenarioEventIdRef = (0, vue_1.ref)(null);
var showScenarioInfo = (0, vue_1.ref)(false);
(0, vue_1.watch)(selectedUnitIds.value, function (v) {
    if (v.size === 1 && !(activeUnitIdRef.value && v.has(activeUnitIdRef.value)))
        activeUnitIdRef.value = __spreadArray([], selectedUnitIds.value.values(), true).pop();
    if (v.size === 0)
        activeUnitIdRef.value = null;
}, { deep: true });
(0, vue_1.watch)(selectedFeatureIds, function (v) {
    if (v) {
        if (v.size === 1 && !(activeFeatureIdRef.value && v.has(activeFeatureIdRef.value)))
            activeFeatureIdRef.value = __spreadArray([], selectedFeatureIds.value.values(), true).pop();
        if (v.size === 0)
            activeFeatureIdRef.value = null;
    }
}, { deep: true, flush: "sync" });
(0, vue_1.watch)(selectedScenarioEventIds, function (v) {
    if (v.size === 1 &&
        !(activeScenarioEventIdRef.value && v.has(activeScenarioEventIdRef.value)))
        activeScenarioEventId.value = __spreadArray([], selectedScenarioEventIds.value.values(), true).pop();
    if (v.size === 0)
        activeScenarioEventId.value = null;
}, { deep: true });
(0, vue_1.watch)(selectedMapLayerIds, function (v) {
    if (v.size === 1 && !(activeMapLayerIdRef.value && v.has(activeMapLayerIdRef.value)))
        activeMapLayerId.value = __spreadArray([], selectedMapLayerIds.value.values(), true).pop();
    if (v.size === 0)
        activeMapLayerId.value = null;
}, { deep: true });
var activeUnitId = (0, vue_1.computed)({
    get: function () { return activeUnitIdRef.value; },
    set: function (v) {
        activeUnitIdRef.value = v;
        v && clear();
        if (v)
            selectedUnitIds.value.add(v);
    },
});
var activeFeatureId = (0, vue_1.computed)({
    get: function () { return activeFeatureIdRef.value; },
    set: function (v) {
        activeFeatureIdRef.value = v;
        v && clear();
        if (v)
            selectedFeatureIds.value.add(v);
    },
});
var activeScenarioEventId = (0, vue_1.computed)({
    get: function () { return activeScenarioEventIdRef.value; },
    set: function (v) {
        activeScenarioEventIdRef.value = v;
        v && clear();
        if (v)
            selectedScenarioEventIds.value.add(v);
    },
});
var activeMapLayerId = (0, vue_1.computed)({
    get: function () { return activeMapLayerIdRef.value; },
    set: function (v) {
        activeMapLayerIdRef.value = v;
        v && clear();
        if (v)
            selectedMapLayerIds.value.add(v);
    },
});
function clear() {
    if (selectedUnitIds.value.size > 0)
        selectedUnitIds.value.clear();
    if (selectedFeatureIds.value.size > 0)
        selectedFeatureIds.value.clear();
    if (selectedScenarioEventIds.value.size > 0)
        selectedScenarioEventIds.value.clear();
    if (selectedMapLayerIds.value.size > 0)
        selectedMapLayerIds.value.clear();
    showScenarioInfo.value = false;
}
var activeDetailsPanel = (0, vue_1.computed)(function () {
    if (selectedFeatureIds.value.size) {
        return "feature";
    }
    if (activeUnitId.value || selectedUnitIds.value.size) {
        return "unit";
    }
    if (activeScenarioEventId.value) {
        return "event";
    }
    if (activeMapLayerId.value) {
        return "mapLayer";
    }
    if (showScenarioInfo.value) {
        return "scenario";
    }
    return;
});
function useSelectedItems() {
    return {
        selectedUnitIds: selectedUnitIds,
        activeUnitId: activeUnitId,
        selectedFeatureIds: selectedFeatureIds,
        activeFeatureId: activeFeatureId,
        activeScenarioEventId: activeScenarioEventId,
        selectedScenarioEventIds: selectedScenarioEventIds,
        selectedMapLayerIds: selectedMapLayerIds,
        activeMapLayerId: activeMapLayerId,
        showScenarioInfo: showScenarioInfo,
        activeDetailsPanel: activeDetailsPanel,
        clear: clear,
    };
}
