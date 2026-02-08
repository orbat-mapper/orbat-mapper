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
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var klona_1 = require("klona");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var InputGroupTemplate_vue_1 = require("@/components/InputGroupTemplate.vue");
var constants_1 = require("@/types/constants");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var RingStylePopover_vue_1 = require("@/modules/scenarioeditor/RingStylePopover.vue");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var scenarioActions_1 = require("@/composables/scenarioActions");
var selectedStore_1 = require("@/stores/selectedStore");
var PanelHeading_vue_1 = require("@/components/PanelHeading.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var mapViewStore_1 = require("@/stores/mapViewStore");
var ZoomSelector_vue_1 = require("@/components/ZoomSelector.vue");
var PanelDataGrid_vue_1 = require("@/components/PanelDataGrid.vue");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var unitActions = activeScenario.unitActions, store = activeScenario.store, getUnitById = activeScenario.helpers.getUnitById;
var toeActions = (0, scenarioActions_1.useToeActions)();
var selectedUnitIds = (0, selectedStore_1.useSelectedItems)().selectedUnitIds;
var mapView = (0, mapViewStore_1.useMapViewStore)();
var editedRangeRing = (0, vue_1.ref)({
    name: "",
    range: 0,
    uom: "km",
    group: undefined,
});
var originalRangeRing = (0, vue_1.ref)(null);
var editedIndex = (0, vue_1.ref)(-1);
var marker = (0, vue_1.computed)(function () {
    var _a, _b, _c;
    var _d = props.unit.style, style = _d === void 0 ? {} : _d;
    return {
        limitVisibility: (_a = style["limitVisibility"]) !== null && _a !== void 0 ? _a : false,
        minZoom: (_b = style["minZoom"]) !== null && _b !== void 0 ? _b : 0,
        maxZoom: (_c = style["maxZoom"]) !== null && _c !== void 0 ? _c : 24,
    };
});
var range = (0, vue_1.computed)({
    get: function () { var _a, _b; return [(_a = marker.value.minZoom) !== null && _a !== void 0 ? _a : 0, (_b = marker.value.maxZoom) !== null && _b !== void 0 ? _b : 24]; },
    set: function (v) {
        updateVisibilityStyle({ minZoom: +v[0], maxZoom: +v[1] });
    },
});
var limitVisibility = (0, vue_1.computed)({
    get: function () { return marker.value.limitVisibility; },
    set: function (v) { return updateVisibilityStyle({ limitVisibility: v }); },
});
var rangeRings = (0, vue_1.computed)(function () {
    var _a, _b, _c;
    if (props.isMultiMode && selectedUnitIds.value.size > 1) {
        var multiRangeRings = [];
        var usedNames = new Set();
        var usedNameCounter_1 = new Map();
        for (var _i = 0, _d = selectedUnitIds.value; _i < _d.length; _i++) {
            var unitId = _d[_i];
            var unit = getUnitById(unitId);
            if (!(unit === null || unit === void 0 ? void 0 : unit.rangeRings))
                continue;
            for (var _e = 0, _f = (_a = unit.rangeRings) !== null && _a !== void 0 ? _a : []; _e < _f.length; _e++) {
                var ring = _f[_e];
                usedNameCounter_1.set(ring.name, ((_b = usedNameCounter_1.get(ring.name)) !== null && _b !== void 0 ? _b : 0) + 1);
                if (usedNames.has(ring.name)) {
                    continue;
                }
                usedNames.add(ring.name);
                multiRangeRings.push(__assign({}, ring));
            }
        }
        return multiRangeRings.map(function (ring) {
            return __assign(__assign({}, ring), { _counter: usedNameCounter_1.get(ring.name) });
        });
    }
    return (_c = props.unit.rangeRings) !== null && _c !== void 0 ? _c : [];
});
var groupItems = (0, vue_1.computed)(function () {
    return Object.values(store.state.rangeRingGroupMap).map(function (g) { return ({
        label: g.name,
        value: g.id,
    }); });
});
var ringMenuItems = (0, vue_1.computed)(function () { return [
    {
        label: "Edit",
        action: constants_1.RangeRingActions.Edit,
        disabled: props.isLocked,
    },
    { label: "Delete", action: constants_1.RangeRingActions.Delete, disabled: props.isLocked },
]; });
function addRangeRing() {
    var defaultRing = {
        name: "New range ring-3 " + (0, utils_1.nanoid)(3),
        range: 20,
        uom: "km",
        group: null,
    };
    if (props.isMultiMode && selectedUnitIds.value.size > 1) {
        store.groupUpdate(function () {
            selectedUnitIds.value.forEach(function (unitId) {
                unitActions.addRangeRing(unitId, __assign({}, defaultRing));
            });
        });
    }
    else {
        unitActions.addRangeRing(props.unit.id, __assign({}, defaultRing));
    }
    editRingByName(defaultRing.name);
}
function getGroupName(ring) {
    var _a;
    if (!ring.group)
        return "None";
    return ((_a = store.state.rangeRingGroupMap[ring.group]) === null || _a === void 0 ? void 0 : _a.name) || "None";
}
function getRingStyle(ring) {
    if (ring.group) {
        var group = store.state.rangeRingGroupMap[ring.group];
        if (group) {
            return group.style || {};
        }
    }
    return ring.style || {};
}
function deleteRing(index) {
    if (props.isMultiMode && selectedUnitIds.value.size > 1) {
        var name_1 = rangeRings.value[index].name;
        store.groupUpdate(function () {
            selectedUnitIds.value.forEach(function (unitId) {
                unitActions.deleteRangeRingByName(unitId, name_1);
            });
        });
    }
    else {
        unitActions.deleteRangeRing(props.unit.id, index);
    }
}
function editRing(index) {
    var ring = rangeRings.value[index];
    if (!ring)
        return;
    editedRangeRing.value = (0, klona_1.klona)(ring);
    originalRangeRing.value = (0, klona_1.klona)(ring);
    editedIndex.value = index;
}
function editRingByName(name) {
    var index = rangeRings.value.findIndex(function (r) { return r.name === name; });
    if (index >= 0) {
        editRing(index);
    }
    else {
        editRing(0);
    }
}
function toggleRingVisibility(ring, index) {
    var _a;
    var hidden = !((_a = ring.hidden) !== null && _a !== void 0 ? _a : false);
    updateRangeRingOrRings(index, ring.name, { hidden: hidden });
}
function updateRangeRingOrRings(index, name, data, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.addIfNameDoesNotExists, addIfNameDoesNotExists = _c === void 0 ? false : _c;
    if (props.isMultiMode && selectedUnitIds.value.size > 1) {
        store.groupUpdate(function () {
            selectedUnitIds.value.forEach(function (unitId) {
                unitActions.updateRangeRingByName(unitId, name, data, { addIfNameDoesNotExists: addIfNameDoesNotExists });
            });
        });
    }
    else {
        unitActions.updateRangeRing(props.unit.id, index, data);
    }
}
function updateRing() {
    var _a, _b;
    if (editedIndex.value < 0 || !editedRangeRing.value)
        return;
    var _c = editedRangeRing.value, name = _c.name, range = _c.range, uom = _c.uom, group = _c.group;
    updateRangeRingOrRings(editedIndex.value, (_b = (_a = originalRangeRing.value) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : name, {
        name: name,
        range: +range,
        uom: uom,
        group: group,
    }, { addIfNameDoesNotExists: true });
    editedIndex.value = -1;
    editedRangeRing.value = { name: "", range: 0, uom: "km", group: null };
    originalRangeRing.value = null;
}
function updateRingStyle(ring, index, style) {
    if (ring.group) {
        var group = store.state.rangeRingGroupMap[ring.group];
        if (group) {
            unitActions.updateRangeRingGroup(ring.group, { style: style });
        }
    }
    updateRangeRingOrRings(index, ring.name, { style: style });
}
function onRangeRingAction(action, index) {
    switch (action) {
        case constants_1.RangeRingActions.Edit:
            editRing(index);
            break;
        case constants_1.RangeRingActions.Delete:
            deleteRing(index);
            break;
    }
}
function updateVisibilityStyle(style) {
    var _a;
    if (props.isMultiMode && selectedUnitIds.value.size > 1) {
        unitActions.batchUpdateUnitStyle(__spreadArray([], selectedUnitIds.value, true), style);
    }
    else {
        var unit = getUnitById(props.unit.id);
        if (!unit)
            return;
        var unitStyle = (_a = props.unit.style) !== null && _a !== void 0 ? _a : {};
        var newStyle = __assign(__assign({}, unitStyle), style);
        unitActions.updateUnit(props.unit.id, { style: newStyle });
    }
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = PanelDataGrid_vue_1.default || PanelDataGrid_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "mt-4" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_5 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2 mt-2 -mb-6 font-semibold" }));
/** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['-mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-end" }));
/** @type {__VLS_StyleScopedClasses['self-end']} */ ;
var __VLS_6 = ToggleField_vue_1.default;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ class: "mt-4" }, { modelValue: (__VLS_ctx.limitVisibility) })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ class: "mt-4" }, { modelValue: (__VLS_ctx.limitVisibility) })], __VLS_functionalComponentArgsRest(__VLS_7), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
if (__VLS_ctx.limitVisibility) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    var __VLS_11 = ZoomSelector_vue_1.default;
    // @ts-ignore
    var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11(__assign({ modelValue: (__VLS_ctx.range) }, { class: "mt-4 flex-auto" })));
    var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.range) }, { class: "mt-4 flex-auto" })], __VLS_functionalComponentArgsRest(__VLS_12), false));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
}
// @ts-ignore
[limitVisibility, limitVisibility, range,];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
var __VLS_16 = PanelHeading_vue_1.default || PanelHeading_vue_1.default;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({}));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_17), false));
var __VLS_21 = __VLS_19.slots.default;
// @ts-ignore
[];
var __VLS_19;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 sm:mt-0 sm:ml-16 sm:flex-none" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:ml-16']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
var __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ 'onClick': {} }, { type: "button", disabled: (__VLS_ctx.isLocked), size: "sm" })));
var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", disabled: (__VLS_ctx.isLocked), size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
var __VLS_27;
var __VLS_28 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.addRangeRing();
            // @ts-ignore
            [isLocked, addRangeRing,];
        } });
var __VLS_29 = __VLS_25.slots.default;
// @ts-ignore
[];
var __VLS_25;
var __VLS_26;
if (__VLS_ctx.rangeRings.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)(__assign({ class: "w-full divide-y divide-gray-300" }));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-gray-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ scope: "col" }, { class: "text-foreground py-3.5 pr-3 pl-4 text-left text-sm font-semibold whitespace-nowrap sm:pl-0" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pl-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:pl-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ scope: "col" }, { class: "text-foreground px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ scope: "col" }, { class: "text-foreground w-20 px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ scope: "col" }, { class: "text-foreground w-20 px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ class: "w-0" }));
    /** @type {__VLS_StyleScopedClasses['w-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)(__assign({ class: "bg-background divide-y divide-gray-200" }));
    /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-gray-200']} */ ;
    var _loop_1 = function (ring, index) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign(__assign({ onDblclick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.rangeRings.length > 0))
                    return;
                !__VLS_ctx.isLocked && __VLS_ctx.editRing(index);
                // @ts-ignore
                [isLocked, rangeRings, rangeRings, editRing,];
            } }, { key: (ring.name) }), { class: "group" }));
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        if (index === __VLS_ctx.editedIndex) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                colspan: "5",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.rangeRings.length > 0))
                        return;
                    if (!(index === __VLS_ctx.editedIndex))
                        return;
                    __VLS_ctx.updateRing();
                    // @ts-ignore
                    [editedIndex, updateRing,];
                } }, { class: "bg-muted/50 mt-2 grid grid-cols-2 gap-4 rounded border border-gray-300 p-2 py-4" }));
            /** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
            var __VLS_30 = InputGroup_vue_1.default;
            // @ts-ignore
            var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ class: "col-span-2" }, { autofocus: true, label: "Name", modelValue: (__VLS_ctx.editedRangeRing.name), disabled: (__VLS_ctx.isLocked) })));
            var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ class: "col-span-2" }, { autofocus: true, label: "Name", modelValue: (__VLS_ctx.editedRangeRing.name), disabled: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_31), false));
            /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
            var __VLS_35 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
            // @ts-ignore
            var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign({ label: "Range" }, { class: "col-span-1" })));
            var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ label: "Range" }, { class: "col-span-1" })], __VLS_functionalComponentArgsRest(__VLS_36), false));
            /** @type {__VLS_StyleScopedClasses['col-span-1']} */ ;
            {
                var __VLS_40 = __VLS_38.slots.default;
                var id = __VLS_vSlot(__VLS_40)[0].id;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative rounded-md shadow-xs" }));
                /** @type {__VLS_StyleScopedClasses['relative']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['shadow-xs']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign({ type: "text", id: (id) }, { class: "text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background ring-input focus-visible:border-ring focus-visible:ring-ring/50 block w-full rounded-md border-0 py-1.5 pr-20 ring-1 outline-hidden ring-inset focus-visible:ring-[3px] sm:text-sm sm:leading-6" }), { value: (__VLS_ctx.editedRangeRing.range) }));
                /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['placeholder:text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['selection:bg-primary']} */ ;
                /** @type {__VLS_StyleScopedClasses['selection:text-primary-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
                /** @type {__VLS_StyleScopedClasses['ring-input']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:border-ring']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring-ring/50']} */ ;
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['pr-20']} */ ;
                /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['outline-hidden']} */ ;
                /** @type {__VLS_StyleScopedClasses['ring-inset']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring-[3px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['sm:leading-6']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "absolute inset-y-0 right-0 flex items-center" }));
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "currency" }, { class: "sr-only" }));
                /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)(__assign({ id: "range", name: "range", value: (__VLS_ctx.editedRangeRing.uom) }, { class: "text-muted-foreground dark:bg-muted focus-visible:ring-ring h-full rounded-md border-0 bg-transparent py-0 pr-7 pl-2 outline-hidden focus-visible:ring-2 sm:text-sm" }));
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['dark:bg-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring-ring']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['pr-7']} */ ;
                /** @type {__VLS_StyleScopedClasses['pl-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['outline-hidden']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
                // @ts-ignore
                [isLocked, editedRangeRing, editedRangeRing, editedRangeRing,];
                __VLS_38.slots['' /* empty slot name completion */];
            }
            var __VLS_41 = SimpleSelect_vue_1.default;
            // @ts-ignore
            var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41(__assign(__assign({ addNone: true }, { class: "col-span-1" }), { label: "Group", modelValue: (__VLS_ctx.editedRangeRing.group), items: (__VLS_ctx.groupItems) })));
            var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign(__assign({ addNone: true }, { class: "col-span-1" }), { label: "Group", modelValue: (__VLS_ctx.editedRangeRing.group), items: (__VLS_ctx.groupItems) })], __VLS_functionalComponentArgsRest(__VLS_42), false));
            /** @type {__VLS_StyleScopedClasses['col-span-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2 flex items-center justify-between" }));
            /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            var __VLS_46 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
            button_1.Button;
            // @ts-ignore
            var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })));
            var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_47), false));
            var __VLS_51 = void 0;
            var __VLS_52 = ({ click: {} },
                { onClick: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(__VLS_ctx.rangeRings.length > 0))
                            return;
                        if (!(index === __VLS_ctx.editedIndex))
                            return;
                        __VLS_ctx.toeActions.goToAddGroup();
                        // @ts-ignore
                        [editedRangeRing, groupItems, toeActions,];
                    } });
            var __VLS_53 = __VLS_49.slots.default;
            // @ts-ignore
            [];
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            var __VLS_54 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
            button_1.Button;
            // @ts-ignore
            var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
                type: "submit",
                variant: "secondary",
                size: "sm",
            }));
            var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([{
                    type: "submit",
                    variant: "secondary",
                    size: "sm",
                }], __VLS_functionalComponentArgsRest(__VLS_55), false));
            var __VLS_59 = __VLS_57.slots.default;
            // @ts-ignore
            [];
            var __VLS_60 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
            button_1.Button;
            // @ts-ignore
            var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60(__assign(__assign({ 'onClick': {} }, { variant: "outline", size: "sm" }), { class: "ml-2" })));
            var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "outline", size: "sm" }), { class: "ml-2" })], __VLS_functionalComponentArgsRest(__VLS_61), false));
            var __VLS_65 = void 0;
            var __VLS_66 = ({ click: {} },
                { onClick: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(__VLS_ctx.rangeRings.length > 0))
                            return;
                        if (!(index === __VLS_ctx.editedIndex))
                            return;
                        __VLS_ctx.editedIndex = -1;
                        // @ts-ignore
                        [editedIndex,];
                    } });
            /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
            var __VLS_67 = __VLS_63.slots.default;
            // @ts-ignore
            [];
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "text-foreground py-2 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0" }));
            /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['pl-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:pl-0']} */ ;
            (ring.name);
            if (ring._counter) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground" }));
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                (ring._counter);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "text-foreground px-2 py-2 text-sm font-medium whitespace-nowrap" }));
            /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
            (ring.range);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-foreground" }));
            /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
            (ring.uom || "km");
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "relative" }));
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign(__assign({ onChange: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.rangeRings.length > 0))
                        return;
                    if (!!(index === __VLS_ctx.editedIndex))
                        return;
                    __VLS_ctx.toggleRingVisibility(ring, index);
                    // @ts-ignore
                    [toggleRingVisibility,];
                } }, { type: "checkbox" }), { class: "text-primary focus:ring-ring absolute top-1/2 left-6 -mt-2 h-4 w-4 rounded border-gray-300 disabled:opacity-50" }), { checked: (!ring.hidden), disabled: (__VLS_ctx.isLocked) }));
            /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['-mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "px-2 text-sm" }));
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (__VLS_ctx.getGroupName(ring));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "flex items-center" }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            var __VLS_68 = RingStylePopover_vue_1.default;
            // @ts-ignore
            var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68(__assign({ 'onUpdate': {} }, { ringStyle: (__VLS_ctx.getRingStyle(ring)), disabled: (__VLS_ctx.isLocked) })));
            var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { ringStyle: (__VLS_ctx.getRingStyle(ring)), disabled: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_69), false));
            var __VLS_73 = void 0;
            var __VLS_74 = ({ update: {} },
                { onUpdate: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(__VLS_ctx.rangeRings.length > 0))
                            return;
                        if (!!(index === __VLS_ctx.editedIndex))
                            return;
                        __VLS_ctx.updateRingStyle(ring, index, $event);
                        // @ts-ignore
                        [isLocked, isLocked, getGroupName, getRingStyle, updateRingStyle,];
                    } });
            var __VLS_75 = DotsMenu_vue_1.default;
            // @ts-ignore
            var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75(__assign(__assign({ 'onAction': {} }, { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { items: (__VLS_ctx.ringMenuItems), portal: true })));
            var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([__assign(__assign({ 'onAction': {} }, { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { items: (__VLS_ctx.ringMenuItems), portal: true })], __VLS_functionalComponentArgsRest(__VLS_76), false));
            var __VLS_80 = void 0;
            var __VLS_81 = ({ action: {} },
                { onAction: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(__VLS_ctx.rangeRings.length > 0))
                            return;
                        if (!!(index === __VLS_ctx.editedIndex))
                            return;
                        __VLS_ctx.onRangeRingAction($event, index);
                        // @ts-ignore
                        [ringMenuItems, onRangeRingAction,];
                    } });
            /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
        }
        // @ts-ignore
        [];
    };
    var __VLS_38, __VLS_49, __VLS_50, __VLS_57, __VLS_63, __VLS_64, __VLS_71, __VLS_72, __VLS_78, __VLS_79;
    for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.rangeRings)); _i < _a.length; _i++) {
        var _b = _a[_i], ring = _b[0], index = _b[1];
        _loop_1(ring, index);
    }
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
