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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var utils_1 = require("@/geo/utils");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var scenarioActions_1 = require("@/composables/scenarioActions");
var constants_1 = require("@/types/constants");
var utils_2 = require("@/utils");
var injects_1 = require("@/components/injects");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var CoordinateInput_vue_1 = require("@/components/CoordinateInput.vue");
var SplitButton_vue_1 = require("@/components/SplitButton.vue");
var uiStore_1 = require("@/stores/uiStore");
var selectedWaypoints_1 = require("@/stores/selectedWaypoints");
var UnitStatusPopover_vue_1 = require("@/modules/scenarioeditor/UnitStatusPopover.vue");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var core_1 = require("@vueuse/core");
var input_1 = require("@/components/ui/input");
var props = defineProps();
var _k = (0, utils_2.injectStrict)(injects_1.activeScenarioKey), store = _k.store, time = _k.time, unitActions = _k.unitActions;
var getModalTimestamp = (0, utils_2.injectStrict)(injects_1.timeModalKey).getModalTimestamp;
var getModalSidc = (0, utils_2.injectStrict)(injects_1.sidcModalKey).getModalSidc;
var unitStatusMap = store.state.unitStatusMap;
var onUnitAction = (0, scenarioActions_1.useUnitActions)().onUnitAction;
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
var state = (0, vue_1.computed)(function () { return props.unit.state || []; });
var uiState = (0, uiStore_1.useUiStore)();
var selectedWaypointIds = (0, selectedWaypoints_1.useSelectedWaypoints)().selectedWaypointIds;
var menuItems = (0, vue_1.computed)(function () { return [
    { label: "Delete", action: "delete", disabled: props.isLocked },
    { label: "Duplicate", action: "duplicate", disabled: props.isLocked },
    { label: "Change time", action: "changeTime", disabled: props.isLocked },
    { label: "Edit title", action: "editTitle", disabled: props.isLocked },
    { label: "Edit location", action: "editLocation", disabled: props.isLocked },
    { label: "Clear location", action: "clearLocation", disabled: props.isLocked },
    {
        label: "Convert to initial position",
        action: "convertToInitialPosition",
        disabled: props.isLocked,
    },
    // { label: "Change status", action: "changeStatus" },
]; });
var initialMenuItems = (0, vue_1.computed)(function () { return [
    { label: "Delete", action: "delete", disabled: props.isLocked },
    { label: "Edit initial position", action: "editLocation", disabled: props.isLocked },
]; });
var stateItems = (0, vue_1.computed)(function () { return [
    {
        label: "Change symbol",
        onClick: function () {
            handleChangeSymbol();
        },
        disabled: props.isLocked,
    },
    {
        label: "Remove from map",
        onClick: function () {
            handleRemoveFromMap();
        },
        disabled: props.isLocked,
    },
]; });
var coordinateInputFormat = (0, core_1.useLocalStorage)("coordinateInputFormat", "LonLat");
var editedTitle = (0, vue_1.ref)();
var editedPosition = (0, vue_1.ref)();
var editInitialPosition = (0, vue_1.ref)(false);
var deleteState = function (index) {
    unitActions.deleteUnitStateEntry(props.unit.id, index);
};
var isActive = function (s, index) {
    var _a, _b;
    if (!((_a = state.value) === null || _a === void 0 ? void 0 : _a.length))
        return;
    var nextUnitTimestamp = ((_b = state.value[index + 1]) === null || _b === void 0 ? void 0 : _b.t) || Number.MAX_VALUE;
    var currentTime = store.state.currentTime;
    return s.t <= currentTime && nextUnitTimestamp > currentTime;
};
var changeToState = function (stateEntry) {
    time.setCurrentTime(stateEntry.t);
    if (stateEntry.location) {
        onUnitAction(props.unit, constants_1.UnitActions.Pan);
    }
};
function onStateAction(index, action) {
    return __awaiter(this, void 0, void 0, function () {
        var newTimestamp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(action === "delete")) return [3 /*break*/, 1];
                    if (index < 0) {
                        unitActions.updateUnit(props.unit.id, { location: undefined }, { doUpdateUnitState: true });
                    }
                    else {
                        deleteState(index);
                    }
                    return [3 /*break*/, 11];
                case 1:
                    if (!(action === "convertToInitialPosition")) return [3 /*break*/, 2];
                    unitActions.convertStateEntryToInitialLocation(props.unit.id, index);
                    return [3 /*break*/, 11];
                case 2:
                    if (!(action === "changeTime")) return [3 /*break*/, 4];
                    return [4 /*yield*/, getModalTimestamp(state.value[index].t, {
                            timeZone: store.state.info.timeZone,
                            title: "Set event time",
                        })];
                case 3:
                    newTimestamp = _a.sent();
                    if (newTimestamp !== undefined) {
                        unitActions.updateUnitStateEntry(props.unit.id, index, {
                            t: newTimestamp,
                        });
                    }
                    return [3 /*break*/, 11];
                case 4:
                    if (!(action === "editTitle")) return [3 /*break*/, 6];
                    return [4 /*yield*/, editTitle(state.value[index])];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 6:
                    if (!(action === "editLocation")) return [3 /*break*/, 10];
                    if (!(index < 0)) return [3 /*break*/, 7];
                    startEditInitialPosition();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, editPosition(state.value[index])];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (action === "duplicate") {
                        unitActions.addUnitStateEntry(props.unit.id, __assign(__assign({}, state.value[index]), { t: store.state.currentTime }));
                    }
                    else if (action === "clearLocation") {
                        unitActions.updateUnitStateEntry(props.unit.id, index, {
                            location: null,
                        });
                    }
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    });
}
function onStateClick(e, s) {
    if (s.location) {
        if (selectedWaypointIds.value.has(s.id)) {
            selectedWaypointIds.value.delete(s.id);
        }
        else {
            if (!e.shiftKey) {
                selectedWaypointIds.value.clear();
            }
            selectedWaypointIds.value.add(s.id);
        }
    }
}
var newTitle = (0, vue_1.ref)();
function editTitle(s) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 200); })];
                case 1:
                    _a.sent();
                    editedTitle.value = s;
                    newTitle.value = s.title || "";
                    return [2 /*return*/];
            }
        });
    });
}
function doneEdit(s) {
    if (!editedTitle.value)
        return;
    var index = state.value.indexOf(s);
    editedTitle.value = null;
    if (index < 0 || newTitle.value === s.title)
        return;
    unitActions.updateUnitStateEntry(props.unit.id, index, {
        title: newTitle.value,
    });
    newTitle.value = "";
}
function cancelEdit() {
    editedTitle.value = null;
    newTitle.value = "";
    editedPosition.value = null;
    newPosition.value = null;
    editInitialPosition.value = false;
}
var newPosition = (0, vue_1.ref)();
function editPosition(s) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 200); })];
                case 1:
                    _a.sent();
                    editedPosition.value = s;
                    newPosition.value = s.location;
                    return [2 /*return*/];
            }
        });
    });
}
function doneEditPosition(s) {
    if (!editedPosition.value)
        return;
    var index = state.value.indexOf(s);
    editedPosition.value = null;
    if (index < 0)
        return;
    unitActions.updateUnitStateEntry(props.unit.id, index, {
        location: newPosition.value,
    });
    newPosition.value = null;
}
function startEditInitialPosition() {
    var _a;
    (0, vue_1.nextTick)(function () { return (editInitialPosition.value = true); });
    newPosition.value = (_a = props.unit.location) !== null && _a !== void 0 ? _a : [0, 0];
}
function doneEditInitialPosition() {
    editInitialPosition.value = false;
    unitActions.updateUnit(props.unit.id, { location: newPosition.value }, { doUpdateUnitState: true });
    newPosition.value = null;
}
var onVMounted = function (_a) {
    var el = _a.el;
    return el === null || el === void 0 ? void 0 : el.focus();
};
function handleChangeSymbol() {
    return __awaiter(this, void 0, void 0, function () {
        var newSidcValue, newState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getModalSidc(props.unit.sidc, {
                        title: "Change symbol at ".concat((0, utils_1.formatDateString)(store.state.currentTime, store.state.info.timeZone)),
                        symbolOptions: unitActions.getCombinedSymbolOptions(props.unit),
                    })];
                case 1:
                    newSidcValue = _a.sent();
                    if (newSidcValue !== undefined) {
                        newState = {
                            sidc: newSidcValue.sidc,
                            t: store.state.currentTime,
                            symbolOptions: newSidcValue.symbolOptions,
                        };
                        unitActions.addUnitStateEntry(props.unit.id, newState, true);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function handleRemoveFromMap() {
    var newState = {
        location: null,
        t: store.state.currentTime,
    };
    unitActions.addUnitStateEntry(props.unit.id, newState, true);
}
function setUnitStatus(newStatus) {
    var newState = {
        status: newStatus,
        t: store.state.currentTime,
    };
    unitActions.addUnitStateEntry(props.unit.id, newState, true);
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "text-foreground mt-6 font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
var __VLS_0 = UnitStatusPopover_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onUpdate': {} }, { disabled: (__VLS_ctx.isLocked) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { disabled: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ update: {} },
    { onUpdate: (__VLS_ctx.setUnitStatus) });
var __VLS_3;
var __VLS_4;
var __VLS_7 = SplitButton_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    items: (__VLS_ctx.stateItems),
    activeItem: (__VLS_ctx.uiState.activeStateItem),
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.stateItems),
        activeItem: (__VLS_ctx.uiState.activeStateItem),
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "divide-border border-border mt-2 divide-y border-t border-b" }));
/** @type {__VLS_StyleScopedClasses['divide-border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
if (__VLS_ctx.unit.location) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "relative flex items-center py-4" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex min-w-0 flex-auto flex-col text-sm" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    if (__VLS_ctx.editInitialPosition) {
        var __VLS_12 = CoordinateInput_vue_1.default;
        // @ts-ignore
        var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign(__assign(__assign(__assign({ 'onUpdate:format': {} }, { 'onOutBlur': {} }), { 'onKeyup': {} }), { 'onKeyup': {} }), { modelValue: (__VLS_ctx.newPosition), format: (__VLS_ctx.coordinateInputFormat), autofocus: true })));
        var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onUpdate:format': {} }, { 'onOutBlur': {} }), { 'onKeyup': {} }), { 'onKeyup': {} }), { modelValue: (__VLS_ctx.newPosition), format: (__VLS_ctx.coordinateInputFormat), autofocus: true })], __VLS_functionalComponentArgsRest(__VLS_13), false));
        var __VLS_17 = void 0;
        var __VLS_18 = ({ 'update:format': {} },
            { 'onUpdate:format': function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.unit.location))
                        return;
                    if (!(__VLS_ctx.editInitialPosition))
                        return;
                    __VLS_ctx.coordinateInputFormat = $event;
                    // @ts-ignore
                    [isLocked, setUnitStatus, stateItems, uiState, unit, editInitialPosition, newPosition, coordinateInputFormat, coordinateInputFormat,];
                } });
        var __VLS_19 = ({ outBlur: {} },
            { onOutBlur: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.unit.location))
                        return;
                    if (!(__VLS_ctx.editInitialPosition))
                        return;
                    __VLS_ctx.doneEditInitialPosition();
                    // @ts-ignore
                    [doneEditInitialPosition,];
                } });
        var __VLS_20 = ({ keyup: {} },
            { onKeyup: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.unit.location))
                        return;
                    if (!(__VLS_ctx.editInitialPosition))
                        return;
                    __VLS_ctx.doneEditInitialPosition();
                    // @ts-ignore
                    [doneEditInitialPosition,];
                } });
        var __VLS_21 = ({ keyup: {} },
            { onKeyup: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.unit.location))
                        return;
                    if (!(__VLS_ctx.editInitialPosition))
                        return;
                    __VLS_ctx.cancelEdit();
                    // @ts-ignore
                    [cancelEdit,];
                } });
        var __VLS_15;
        var __VLS_16;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ onDblclick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.unit.location))
                    return;
                if (!!(__VLS_ctx.editInitialPosition))
                    return;
                __VLS_ctx.startEditInitialPosition();
                // @ts-ignore
                [startEditInitialPosition,];
            } }, { class: "text-foreground" }));
        /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
        (__VLS_ctx.formatPosition(__VLS_ctx.unit.location));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex flex-0 items-center space-x-0" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-0']} */ ;
    var __VLS_22 = DotsMenu_vue_1.default;
    // @ts-ignore
    var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ 'onAction': {} }, { items: (__VLS_ctx.initialMenuItems), portal: true })));
    var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { items: (__VLS_ctx.initialMenuItems), portal: true })], __VLS_functionalComponentArgsRest(__VLS_23), false));
    var __VLS_27 = void 0;
    var __VLS_28 = ({ action: {} },
        { onAction: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.unit.location))
                    return;
                __VLS_ctx.onStateAction(-1, $event);
                // @ts-ignore
                [unit, utils_1.formatPosition, initialMenuItems, onStateAction,];
            } });
    var __VLS_25;
    var __VLS_26;
}
var _loop_1 = function (s, index) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign(__assign({ class: "relative flex items-center py-4" }, { key: (s.id) }), { class: (__VLS_ctx.selectedWaypointIds.has(s.id) ? 'bg-accent/10' : '') }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex min-w-0 flex-auto flex-col text-sm" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onStateClick($event, s);
            // @ts-ignore
            [state, selectedWaypointIds, onStateClick,];
        } }, { class: "flex" }), { class: (__VLS_ctx.isActive(s, index)
            ? 'text-foreground font-bold'
            : 'text-muted-foreground font-medium') }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    (__VLS_ctx.fmt.scenarioFormatter.format(s.t));
    if (s === __VLS_ctx.editedTitle) {
        var __VLS_29 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Input} */
        input_1.Input;
        // @ts-ignore
        var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29(__assign(__assign(__assign(__assign({ 'onVue:mounted': {} }, { 'onBlur': {} }), { 'onKeyup': {} }), { 'onKeyup': {} }), { type: "text", modelValue: (__VLS_ctx.newTitle) })));
        var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onVue:mounted': {} }, { 'onBlur': {} }), { 'onKeyup': {} }), { 'onKeyup': {} }), { type: "text", modelValue: (__VLS_ctx.newTitle) })], __VLS_functionalComponentArgsRest(__VLS_30), false));
        var __VLS_34 = void 0;
        var __VLS_35 = ({ vnodeMounted: {} },
            { onVnodeMounted: (__VLS_ctx.onVMounted) });
        var __VLS_36 = ({ blur: {} },
            { onBlur: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(s === __VLS_ctx.editedTitle))
                        return;
                    __VLS_ctx.doneEdit(s);
                    // @ts-ignore
                    [isActive, fmt, editedTitle, newTitle, onVMounted, doneEdit,];
                } });
        var __VLS_37 = ({ keyup: {} },
            { onKeyup: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(s === __VLS_ctx.editedTitle))
                        return;
                    __VLS_ctx.doneEdit(s);
                    // @ts-ignore
                    [doneEdit,];
                } });
        var __VLS_38 = ({ keyup: {} },
            { onKeyup: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(s === __VLS_ctx.editedTitle))
                        return;
                    __VLS_ctx.cancelEdit();
                    // @ts-ignore
                    [cancelEdit,];
                } });
    }
    else if (s.title) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ onDblclick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(s === __VLS_ctx.editedTitle))
                    return;
                if (!(s.title))
                    return;
                __VLS_ctx.editTitle(s);
                // @ts-ignore
                [editTitle,];
            } }, { class: "text-foreground my-1 leading-tight font-medium" }));
        /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (s.title);
    }
    if (s === __VLS_ctx.editedPosition) {
        var __VLS_39 = CoordinateInput_vue_1.default;
        // @ts-ignore
        var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign(__assign(__assign(__assign({ 'onUpdate:format': {} }, { 'onOutBlur': {} }), { 'onKeyup': {} }), { 'onKeyup': {} }), { modelValue: (__VLS_ctx.newPosition), format: (__VLS_ctx.coordinateInputFormat), autofocus: true })));
        var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onUpdate:format': {} }, { 'onOutBlur': {} }), { 'onKeyup': {} }), { 'onKeyup': {} }), { modelValue: (__VLS_ctx.newPosition), format: (__VLS_ctx.coordinateInputFormat), autofocus: true })], __VLS_functionalComponentArgsRest(__VLS_40), false));
        var __VLS_44 = void 0;
        var __VLS_45 = ({ 'update:format': {} },
            { 'onUpdate:format': function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(s === __VLS_ctx.editedPosition))
                        return;
                    __VLS_ctx.coordinateInputFormat = $event;
                    // @ts-ignore
                    [newPosition, coordinateInputFormat, coordinateInputFormat, editedPosition,];
                } });
        var __VLS_46 = ({ outBlur: {} },
            { onOutBlur: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(s === __VLS_ctx.editedPosition))
                        return;
                    __VLS_ctx.doneEditPosition(s);
                    // @ts-ignore
                    [doneEditPosition,];
                } });
        var __VLS_47 = ({ keyup: {} },
            { onKeyup: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(s === __VLS_ctx.editedPosition))
                        return;
                    __VLS_ctx.doneEditPosition(s);
                    // @ts-ignore
                    [doneEditPosition,];
                } });
        var __VLS_48 = ({ keyup: {} },
            { onKeyup: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(s === __VLS_ctx.editedPosition))
                        return;
                    __VLS_ctx.cancelEdit();
                    // @ts-ignore
                    [cancelEdit,];
                } });
    }
    else if (s.location) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ onDblclick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(s === __VLS_ctx.editedPosition))
                    return;
                if (!(s.location))
                    return;
                __VLS_ctx.editPosition(s);
                // @ts-ignore
                [editPosition,];
            } }, { class: "text-foreground mt-1" }));
        /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        (__VLS_ctx.formatPosition(s.location));
    }
    if (s.location === null) {
        var __VLS_49 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconMapMarkerOffOutline} */
        vue_mdi_1.IconMapMarkerOffOutline;
        // @ts-ignore
        var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49(__assign({ class: "text-muted-foreground h-5 w-5" })));
        var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-1 flex gap-1" }));
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    if (s.sidc) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "bg-accent/10 text-accent-foreground w-12 rounded-full px-2.5 py-0.5 text-xs font-medium" }));
        /** @type {__VLS_StyleScopedClasses['bg-accent/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-accent-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    }
    if (s.status) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "bg-muted/10 text-muted-foreground w-auto rounded-full px-2.5 py-0.5 text-xs font-medium" }));
        /** @type {__VLS_StyleScopedClasses['bg-muted/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        ((_a = __VLS_ctx.unitStatusMap[s.status]) === null || _a === void 0 ? void 0 : _a.name);
    }
    if ((_b = s.update) === null || _b === void 0 ? void 0 : _b.equipment) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    }
    if ((_c = s.update) === null || _c === void 0 ? void 0 : _c.personnel) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    }
    if ((_d = s.update) === null || _d === void 0 ? void 0 : _d.supplies) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    }
    if ((_e = s.diff) === null || _e === void 0 ? void 0 : _e.equipment) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    }
    if ((_f = s.diff) === null || _f === void 0 ? void 0 : _f.personnel) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    }
    if ((_g = s.diff) === null || _g === void 0 ? void 0 : _g.supplies) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex flex-0 items-center space-x-0" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-0']} */ ;
    var __VLS_54 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54(__assign({ 'onClick': {} }, { title: "Goto Time and Place" })));
    var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Goto Time and Place" })], __VLS_functionalComponentArgsRest(__VLS_55), false));
    var __VLS_59 = void 0;
    var __VLS_60 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.changeToState(s);
                // @ts-ignore
                [utils_1.formatPosition, unitStatusMap, changeToState,];
            } });
    var __VLS_61 = __VLS_57.slots.default;
    var __VLS_62 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconCrosshairsGps} */
    vue_mdi_1.IconCrosshairsGps;
    // @ts-ignore
    var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
    var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_63), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_67 = DotsMenu_vue_1.default;
    // @ts-ignore
    var __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67(__assign({ 'onAction': {} }, { items: (__VLS_ctx.menuItems), portal: true })));
    var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { items: (__VLS_ctx.menuItems), portal: true })], __VLS_functionalComponentArgsRest(__VLS_68), false));
    var __VLS_72 = void 0;
    var __VLS_73 = ({ action: {} },
        { onAction: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onStateAction(index, $event);
                // @ts-ignore
                [onStateAction, menuItems,];
            } });
    if (((_h = s.via) === null || _h === void 0 ? void 0 : _h.length) || s.viaStartTime !== undefined || s.interpolate === false) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "absolute -top-3 left-1/2" }));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['-top-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "border-border bg-muted relative -left-1/2 flex items-center rounded-full border px-4 py-0.5" }));
        /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['-left-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        if ((_j = s.via) === null || _j === void 0 ? void 0 : _j.length) {
            var __VLS_74 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.IconMapMarkerPath} */
            vue_mdi_1.IconMapMarkerPath;
            // @ts-ignore
            var __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74(__assign({ class: "text-muted-foreground h-5 w-5" })));
            var __VLS_76 = __VLS_75.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_75), false));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        }
        else if (s.interpolate === false) {
            var __VLS_79 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.IconMapMarkerAlert} */
            vue_mdi_1.IconMapMarkerAlert;
            // @ts-ignore
            var __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79(__assign({ class: "text-muted-foreground h-5 w-5" })));
            var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_80), false));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        }
        if (s.viaStartTime) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground ml-2 text-xs" }));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (__VLS_ctx.formatDateString(s.viaStartTime, __VLS_ctx.store.state.info.timeZone));
        }
    }
    // @ts-ignore
    [utils_1.formatDateString, store,];
};
var __VLS_32, __VLS_33, __VLS_42, __VLS_43, __VLS_57, __VLS_58, __VLS_70, __VLS_71;
for (var _i = 0, _l = __VLS_vFor((__VLS_ctx.state)); _i < _l.length; _i++) {
    var _m = _l[_i], s = _m[0], index = _m[1];
    _loop_1(s, index);
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
