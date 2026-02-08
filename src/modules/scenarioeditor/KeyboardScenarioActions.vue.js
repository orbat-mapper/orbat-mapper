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
var vue_global_events_1 = require("vue-global-events");
var vue_1 = require("vue");
var uiStore_1 = require("@/stores/uiStore");
var helpers_1 = require("@/components/helpers");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var dragStore_1 = require("@/stores/dragStore");
var scenarioActions_1 = require("@/composables/scenarioActions");
var constants_1 = require("@/types/constants");
var geoStore_1 = require("@/stores/geoStore");
var selectedStore_1 = require("@/stores/selectedStore");
var selectedWaypoints_1 = require("@/stores/selectedWaypoints");
var playbackStore_1 = require("@/stores/playbackStore");
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), unitActions = _a.unitActions, state = _a.store.state, getUnitById = _a.helpers.getUnitById;
var onUnitSelectHook = (0, utils_1.injectStrict)(injects_1.searchActionsKey).onUnitSelectHook;
var uiStore = (0, uiStore_1.useUiStore)();
var activeUnitStore = (0, dragStore_1.useActiveUnitStore)();
var _b = (0, selectedStore_1.useSelectedItems)(), clearSelected = _b.clear, selectedUnitIds = _b.selectedUnitIds, selectedFeatureIds = _b.selectedFeatureIds, activeUnitId = _b.activeUnitId, activeScenarioEventId = _b.activeScenarioEventId;
var onUnitAction = (0, scenarioActions_1.useUnitActions)().onUnitAction;
var onFeatureAction = (0, scenarioActions_1.useScenarioFeatureActions)().onFeatureAction;
var shortcutsEnabled = (0, vue_1.computed)(function () { return !uiStore.modalOpen; });
var unitSettings = (0, geoStore_1.useUnitSettingsStore)();
var playback = (0, playbackStore_1.usePlaybackStore)();
var selectedWaypointIds = (0, selectedWaypoints_1.useSelectedWaypoints)().selectedWaypointIds;
var selectedUnits = (0, vue_1.computed)(function () {
    return __spreadArray([], selectedUnitIds.value, true).map(function (id) { return getUnitById(id); });
});
var activeUnit = (0, vue_1.computed)(function () { return (activeUnitId.value && getUnitById(activeUnitId.value)) || null; });
var createNewUnit = function () {
    activeUnitId.value && unitActions.createSubordinateUnit(activeUnitId.value);
};
var duplicateUnit = function () {
    activeUnitId.value && unitActions.cloneUnit(activeUnitId.value);
};
function handleEscape(e) {
    if (uiStore.escEnabled) {
        if (isRekaComponent(e))
            return;
        clearSelected();
        activeUnitStore.clearActiveUnit();
        activeScenarioEventId.value = null;
    }
}
function isRekaComponent(e) {
    var target = e.target;
    if (!target)
        return false;
    return (isTargetReka(target) || (target.parentElement && isTargetReka(target.parentElement)));
}
function isTargetReka(target) {
    return (((target === null || target === void 0 ? void 0 : target.id) && (target.id.includes("dropdown") || target.id.includes("popover"))) ||
        ["dropdown", "context-menu", "popover", "select"].some(function (type) { var _a, _b; return (_b = (_a = target.dataset) === null || _a === void 0 ? void 0 : _a.slot) === null || _b === void 0 ? void 0 : _b.includes(type); }));
}
function handleZoomShortcut(e) {
    if (selectedFeatureIds.value.size) {
        var fIds = __spreadArray([], selectedFeatureIds.value, true);
        onFeatureAction(fIds.length > 1 ? fIds : fIds[0], "zoom");
    }
    else if (selectedUnitIds.value.size || activeUnit.value) {
        if (selectedUnitIds.value.size > 1) {
            var units = __spreadArray([], selectedUnitIds.value, true).map(function (id) { return getUnitById(id); });
            onUnitAction(units, constants_1.UnitActions.Zoom);
        }
        else
            onUnitAction(activeUnit.value, constants_1.UnitActions.Zoom);
    }
}
function handlePanShortcut(e) {
    if (selectedFeatureIds.value.size) {
        var fIds = __spreadArray([], selectedFeatureIds.value, true);
        onFeatureAction(fIds.length > 1 ? fIds : fIds[0], "pan");
    }
    else if (selectedUnitIds.value.size || activeUnit.value) {
        if (selectedUnitIds.value.size > 1) {
            var units = __spreadArray([], selectedUnitIds.value, true).map(function (id) { return getUnitById(id); });
            onUnitAction(units, constants_1.UnitActions.Pan);
        }
        else
            onUnitAction(activeUnit.value, constants_1.UnitActions.Pan);
    }
}
function handleMoveShortcut(e) {
    unitSettings.moveUnitEnabled = !unitSettings.moveUnitEnabled;
}
function handleDelete(e) {
    if (selectedWaypointIds.value.size) {
        var wIds = __spreadArray([], selectedWaypointIds.value, true);
        onUnitAction(selectedUnits.value, constants_1.UnitActions.DeleteWaypoints, wIds);
        return;
    }
    onUnitAction(selectedUnits.value, constants_1.UnitActions.ClearStateOrDelete);
    onFeatureAction(__spreadArray([], selectedFeatureIds.value, true), "delete");
}
function handleLocate(e) {
    if (activeUnit.value) {
        onUnitSelectHook.trigger({ unitId: activeUnit.value.id, options: { noZoom: true } });
    }
}
function handlePlaybackShortcut(e) {
    playback.togglePlayback();
}
function handleSpecialKeys(e) {
    if (e.key === "<") {
        playback.decreaseSpeed();
    }
    else if (e.key === ">") {
        playback.increaseSpeed();
    }
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.shortcutsEnabled) {
    var __VLS_0 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.GlobalEvents} */
    vue_global_events_1.GlobalEvents;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onKeydown': {} }, { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { filter: (__VLS_ctx.inputEventFilter) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onKeydown': {} }, { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeydown': {} }), { filter: (__VLS_ctx.inputEventFilter) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.createNewUnit) });
    var __VLS_7 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.duplicateUnit) });
    var __VLS_8 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handleEscape) });
    var __VLS_9 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handleZoomShortcut) });
    var __VLS_10 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handlePanShortcut) });
    var __VLS_11 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handlePlaybackShortcut) });
    var __VLS_12 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handlePlaybackShortcut) });
    var __VLS_13 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handleMoveShortcut) });
    var __VLS_14 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handleDelete) });
    var __VLS_15 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handleLocate) });
    var __VLS_16 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handleSpecialKeys) });
    var __VLS_17 = {};
    var __VLS_3;
    var __VLS_4;
}
// @ts-ignore
[shortcutsEnabled, helpers_1.inputEventFilter, createNewUnit, duplicateUnit, handleEscape, handleZoomShortcut, handlePanShortcut, handlePlaybackShortcut, handlePlaybackShortcut, handleMoveShortcut, handleDelete, handleLocate, handleSpecialKeys,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
