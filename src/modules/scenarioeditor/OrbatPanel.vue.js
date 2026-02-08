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
var vue_1 = require("vue");
var OrbatPanelAddSide_vue_1 = require("@/components/OrbatPanelAddSide.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var OrbatSide_vue_1 = require("@/components/OrbatSide.vue");
var constants_1 = require("@/types/constants");
var scenarioActions_1 = require("@/composables/scenarioActions");
var core_1 = require("@vueuse/core");
var eventKeys_1 = require("@/components/eventKeys");
var selectedStore_1 = require("@/stores/selectedStore");
var helpers_1 = require("@/components/helpers");
var io_1 = require("@/scenariostore/io");
var convertUtils_1 = require("@/importexport/convertUtils");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var draggables_1 = require("@/types/draggables");
var tree_item_1 = require("@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item");
var props = withDefaults(defineProps(), { hideFilter: false });
var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var store = activeScenario.store, unitActions = activeScenario.unitActions, io = activeScenario.io, time = activeScenario.time;
var activeParentId = (0, utils_1.injectStrict)(injects_1.activeParentKey);
var isDragging = (0, vue_1.ref)(false);
var isDraggingUnit = (0, vue_1.ref)(false);
var isCopying = (0, vue_1.ref)(false);
var isCopyingState = (0, vue_1.ref)(false);
var state = store.state, groupUpdate = store.groupUpdate;
var changeUnitParent = unitActions.changeUnitParent, addSide = unitActions.addSide;
var bus = (0, core_1.useEventBus)(eventKeys_1.orbatUnitClick);
(0, core_1.useEventListener)(document, "paste", onPaste);
(0, core_1.useEventListener)(document, "copy", onCopy);
var sides = (0, vue_1.computed)(function () {
    return state.sides.map(function (id) { return state.sideMap[id]; });
});
var onUnitAction = (0, scenarioActions_1.useUnitActions)().onUnitAction;
var _a = (0, selectedStore_1.useSelectedItems)(), selectedUnitIds = _a.selectedUnitIds, activeUnitId = _a.activeUnitId;
var dndCleanup = function () { };
(0, vue_1.onMounted)(function () {
    dndCleanup = (0, adapter_1.monitorForElements)({
        canMonitor: function (_a) {
            var source = _a.source;
            return (0, draggables_1.isUnitDragItem)(source.data) ||
                (0, draggables_1.isSideGroupDragItem)(source.data) ||
                (0, draggables_1.isSideDragItem)(source.data);
        },
        onDragStart: function (_a) {
            var location = _a.location, source = _a.source;
            isDragging.value = true;
            isCopying.value = location.initial.input.ctrlKey || location.initial.input.metaKey;
            isCopyingState.value = isCopying.value && location.initial.input.altKey;
            isDraggingUnit.value = (0, draggables_1.isUnitDragItem)(source.data);
        },
        onDrop: function (_a) {
            var source = _a.source, location = _a.location;
            isDragging.value = false;
            isDraggingUnit.value = false;
            var destination = location.current.dropTargets[0];
            if (!destination) {
                return;
            }
            var instruction = (0, tree_item_1.extractInstruction)(destination.data);
            var sourceData = source.data;
            var destinationData = destination.data;
            if (!instruction)
                return;
            var isDuplicateAction = location.initial.input.ctrlKey || location.initial.input.metaKey;
            var isDuplicateState = isDuplicateAction && location.initial.input.altKey;
            if ((0, draggables_1.isUnitDragItem)(sourceData)) {
                var target = mapInstructionToTarget(instruction);
                if ((0, draggables_1.isUnitDragItem)(destinationData)) {
                    onUnitDrop(sourceData.unit, destinationData.unit, target, {
                        isDuplicateAction: isDuplicateAction,
                        isDuplicateState: isDuplicateState,
                    });
                    if (instruction.type === "make-child") {
                        destinationData.unit._isOpen = true;
                    }
                }
                else if ((0, draggables_1.isSideGroupDragItem)(destinationData)) {
                    onUnitDrop(sourceData.unit, destinationData.sideGroup, target, {
                        isDuplicateAction: isDuplicateAction,
                        isDuplicateState: isDuplicateState,
                    });
                }
                else if ((0, draggables_1.isSideDragItem)(destinationData)) {
                    onUnitDrop(sourceData.unit, destinationData.side, "on", {
                        isDuplicateAction: isDuplicateAction,
                        isDuplicateState: isDuplicateState,
                    });
                }
                var unitId_1 = sourceData.unit.id;
                (0, vue_1.nextTick)(function () {
                    var el = document.getElementById("ou-".concat(unitId_1));
                    if (el) {
                        (0, utils_1.triggerPostMoveFlash)(el);
                    }
                });
            }
            else if ((0, draggables_1.isSideGroupDragItem)(sourceData)) {
                var target_1 = mapInstructionToTarget(instruction);
                if ((0, draggables_1.isSideGroupDragItem)(destinationData)) {
                    var sourceId_1 = sourceData.sideGroup.id;
                    groupUpdate(function () {
                        if (isDuplicateAction) {
                            sourceId_1 = unitActions.cloneSideGroup(sourceId_1, {
                                includeState: isDuplicateState,
                            });
                        }
                        unitActions.changeSideGroupParent(sourceId_1, destinationData.sideGroup.id, target_1);
                    });
                    (0, vue_1.nextTick)(function () {
                        var el = document.getElementById("osg-".concat(sourceId_1));
                        if (el) {
                            (0, utils_1.triggerPostMoveFlash)(el);
                        }
                    });
                }
                else if ((0, draggables_1.isSideDragItem)(destinationData)) {
                    var sourceId_2 = sourceData.sideGroup.id;
                    groupUpdate(function () {
                        if (isDuplicateAction) {
                            sourceId_2 = unitActions.cloneSideGroup(sourceId_2, {
                                includeState: isDuplicateState,
                            });
                        }
                        unitActions.changeSideGroupParent(sourceId_2, destinationData.side.id, "on");
                    });
                    (0, vue_1.nextTick)(function () {
                        var el = document.getElementById("os-".concat(sourceId_2));
                        if (el) {
                            (0, utils_1.triggerPostMoveFlash)(el);
                        }
                    });
                }
            }
            else if ((0, draggables_1.isSideDragItem)(sourceData)) {
                var target_2 = mapInstructionToTarget(instruction);
                groupUpdate(function () {
                    var sourceId = sourceData.side.id;
                    if (isDuplicateAction) {
                        sourceId = unitActions.cloneSide(sourceData.side.id, {
                            includeState: isDuplicateState,
                        });
                    }
                    if ((0, draggables_1.isSideDragItem)(destinationData)) {
                        unitActions.moveSide(sourceId, destinationData.side.id, target_2);
                        (0, vue_1.nextTick)(function () {
                            var el = document.getElementById("os-".concat(sourceId));
                            if (el) {
                                (0, utils_1.triggerPostMoveFlash)(el);
                            }
                        });
                    }
                });
            }
        },
    });
});
(0, vue_1.onUnmounted)(function () {
    dndCleanup();
});
function mapInstructionToTarget(instruction) {
    if (instruction.type === "make-child") {
        return "on";
    }
    else if (instruction.type === "reorder-above") {
        return "above";
    }
    else {
        return "below";
    }
}
function onUnitDrop(unit, destinationUnit, target, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var isDuplicateAction = (_a = options.isDuplicateAction) !== null && _a !== void 0 ? _a : false;
    var isDuplicateState = (_b = options.isDuplicateState) !== null && _b !== void 0 ? _b : false;
    groupUpdate(function () {
        var selUnits = new Set(__spreadArray(__spreadArray([], selectedUnitIds.value, true), [unit.id], false));
        for (var _i = 0, selUnits_1 = selUnits; _i < selUnits_1.length; _i++) {
            var id = selUnits_1[_i];
            var unitId = id;
            if (isDuplicateAction) {
                unitId = unitActions.cloneUnit(id, {
                    includeSubordinates: true,
                    includeState: isDuplicateState,
                });
            }
            changeUnitParent(unitId, destinationUnit.id, target);
        }
    });
    if (isDuplicateState) {
        time.setCurrentTime(state.currentTime);
    }
}
function onUnitClick(unit, event) {
    var ids = selectedUnitIds.value;
    if (event.shiftKey) {
        var selectedIds = calculateSelectedUnitIds(unit.id);
        selectedIds.forEach(function (id) {
            ids.add(id);
        });
    }
    else if (event.ctrlKey || event.metaKey) {
        if (ids.has(unit.id)) {
            ids.delete(unit.id);
        }
        else {
            ids.add(unit.id);
        }
    }
    else {
        activeUnitId.value = unit.id;
        activeParentId.value = unit.id;
    }
    bus.emit(unit);
}
function calculateSelectedUnitIds(newUnitId) {
    var lastSelectedId = __spreadArray([], selectedUnitIds.value, true).pop();
    if (lastSelectedId === undefined)
        return [newUnitId];
    var allOpenUnits = [];
    for (var _i = 0, _a = state.sides; _i < _a.length; _i++) {
        var side = _a[_i];
        unitActions.walkSide(side, function (unit) {
            allOpenUnits.push(unit.id);
            if (!unit._isOpen)
                return false;
        });
    }
    var lastSelectedIndex = allOpenUnits.indexOf(lastSelectedId);
    var newUnitIndex = allOpenUnits.indexOf(newUnitId);
    if (lastSelectedIndex === -1 || newUnitIndex === -1)
        return [newUnitId];
    return allOpenUnits.slice(Math.min(lastSelectedIndex, newUnitIndex), Math.max(lastSelectedIndex, newUnitIndex) + 1);
}
function onSideAction(side, action) {
    if (action === constants_1.SideActions.Delete) {
        unitActions.deleteSide(side.id);
    }
    else if (action === constants_1.SideActions.MoveDown) {
        unitActions.reorderSide(side.id, "down");
    }
    else if (action === constants_1.SideActions.MoveUp) {
        unitActions.reorderSide(side.id, "up");
    }
    else if (action === constants_1.SideActions.Add) {
        addSide();
    }
    else if (action === constants_1.SideActions.Lock) {
        unitActions.updateSide(side.id, { locked: true }, { noUndo: true });
    }
    else if (action === constants_1.SideActions.Unlock) {
        unitActions.updateSide(side.id, { locked: false }, { noUndo: true });
    }
    else if (action === constants_1.SideActions.Clone) {
        unitActions.cloneSide(side.id);
    }
    else if (action === constants_1.SideActions.CloneWithState) {
        unitActions.cloneSide(side.id, { includeState: true });
    }
    else if (action === constants_1.SideActions.Hide) {
        unitActions.updateSide(side.id, { isHidden: true });
    }
    else if (action === constants_1.SideActions.Show) {
        unitActions.updateSide(side.id, { isHidden: false });
    }
}
function getUnitIdFromElement(element) {
    if ((element === null || element === void 0 ? void 0 : element.tagName) == "LI" && (element === null || element === void 0 ? void 0 : element.id.startsWith("ou-"))) {
        return element.id.slice(3);
    }
}
function onCopy(c) {
    var _a, _b;
    if (!(0, helpers_1.inputEventFilter)(c))
        return;
    var target = document.activeElement;
    var unitId = getUnitIdFromElement(target.closest('li[id^="ou-"]'));
    // only copy if an ORBAT item has focus
    if (!unitId)
        return;
    var serializedUnits = __spreadArray([], selectedUnitIds.value, true).map(function (id) {
        return (0, io_1.serializeUnit)(id, state, { newId: true });
    });
    (_a = c.clipboardData) === null || _a === void 0 ? void 0 : _a.setData("application/orbat", io.stringifyObject(serializedUnits));
    var txt = serializedUnits.map(function (unit) { return (0, convertUtils_1.orbatToText)(unit).join(""); }).join("");
    (_b = c.clipboardData) === null || _b === void 0 ? void 0 : _b.setData("text/plain", txt);
    c.preventDefault();
}
function onPaste(e) {
    var _a, _b;
    if (!(0, helpers_1.inputEventFilter)(e))
        return;
    var target = document.activeElement;
    var parentId = getUnitIdFromElement(target.closest('li[id^="ou-"]'));
    // only paste if an ORBAT item has focus
    if (!parentId || !((_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.types.includes("application/orbat")))
        return;
    var pastedOrbat = (0, convertUtils_1.parseApplicationOrbat)((_b = e.clipboardData) === null || _b === void 0 ? void 0 : _b.getData("application/orbat"));
    pastedOrbat === null || pastedOrbat === void 0 ? void 0 : pastedOrbat.forEach(function (unit) { return (0, convertUtils_1.addUnitHierarchy)(unit, parentId, activeScenario); });
    unitActions.getUnitById(parentId)._isOpen = true;
    e.preventDefault();
}
var __VLS_defaults = { hideFilter: false };
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-1 pt-2" }));
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
var __VLS_0 = {};
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.sides)); _i < _b.length; _i++) {
    var side = _b[_i][0];
    var __VLS_2 = OrbatSide_vue_1.default;
    // @ts-ignore
    var __VLS_3 = __VLS_asFunctionalComponent1(__VLS_2, new __VLS_2(__assign(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { 'onSideAction': {} }), { key: (side.id), side: (side), hideFilter: (__VLS_ctx.hideFilter) })));
    var __VLS_4 = __VLS_3.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { 'onSideAction': {} }), { key: (side.id), side: (side), hideFilter: (__VLS_ctx.hideFilter) })], __VLS_functionalComponentArgsRest(__VLS_3), false));
    var __VLS_7 = void 0;
    var __VLS_8 = ({ unitAction: {} },
        { onUnitAction: (__VLS_ctx.onUnitAction) });
    var __VLS_9 = ({ unitClick: {} },
        { onUnitClick: (__VLS_ctx.onUnitClick) });
    var __VLS_10 = ({ sideAction: {} },
        { onSideAction: (__VLS_ctx.onSideAction) });
    var __VLS_5;
    var __VLS_6;
    // @ts-ignore
    [sides, hideFilter, onUnitAction, onUnitClick, onSideAction,];
}
if (__VLS_ctx.sides.length < 2) {
    var __VLS_11 = OrbatPanelAddSide_vue_1.default;
    // @ts-ignore
    var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11(__assign(__assign({ 'onAdd': {} }, { simple: (__VLS_ctx.sides.length >= 1) }), { class: "mt-8" })));
    var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([__assign(__assign({ 'onAdd': {} }, { simple: (__VLS_ctx.sides.length >= 1) }), { class: "mt-8" })], __VLS_functionalComponentArgsRest(__VLS_12), false));
    var __VLS_16 = void 0;
    var __VLS_17 = ({ add: {} },
        { onAdd: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.sides.length < 2))
                    return;
                __VLS_ctx.addSide();
                // @ts-ignore
                [sides, sides, addSide,];
            } });
    /** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
    var __VLS_14;
    var __VLS_15;
}
if (__VLS_ctx.isDragging && __VLS_ctx.isCopying) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-opacity-50 border-border bg-background/50 text-foreground fixed top-2 right-1/2 z-50 rounded border p-2 text-center text-sm" }));
    /** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-background/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    if (__VLS_ctx.isCopyingState) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
if (__VLS_ctx.isDraggingUnit && __VLS_ctx.selectedUnitIds.size > 1) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-opacity-50 border-border bg-background/50 text-foreground fixed top-2 right-1/2 z-50 rounded border p-2 text-center text-sm" }));
    /** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-background/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "bg-muted rounded-full border px-1" }));
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    (__VLS_ctx.selectedUnitIds.size);
}
// @ts-ignore
var __VLS_1 = __VLS_0;
// @ts-ignore
[isDragging, isCopying, isCopyingState, isDraggingUnit, selectedUnitIds, selectedUnitIds,];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
