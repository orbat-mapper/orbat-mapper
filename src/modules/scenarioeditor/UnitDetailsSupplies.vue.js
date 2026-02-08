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
var selectedStore_1 = require("@/stores/selectedStore");
var pinia_1 = require("pinia");
var toeStore_1 = require("@/stores/toeStore");
var toeUtils_1 = require("@/composables/toeUtils");
var ToeGrid_vue_1 = require("@/modules/grid/ToeGrid.vue");
var ToeGridHeader_vue_1 = require("@/modules/scenarioeditor/ToeGridHeader.vue");
var AddUnitSupplyForm_vue_1 = require("@/modules/scenarioeditor/AddUnitSupplyForm.vue");
var InlineFormWrapper_vue_1 = require("@/modules/scenarioeditor/InlineFormWrapper.vue");
var ModifyUnitSupplyForm_vue_1 = require("@/modules/scenarioeditor/ModifyUnitSupplyForm.vue");
var tableStores_1 = require("@/stores/tableStores");
var uiStore_1 = require("@/stores/uiStore");
var props = defineProps();
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), _b = _a.store, state = _b.state, onUndoRedo = _b.onUndoRedo, groupUpdate = _b.groupUpdate, _c = _a.unitActions, walkSubUnits = _c.walkSubUnits, updateUnitSupply = _c.updateUnitSupply, updateUnitState = _c.updateUnitState, addUnitStateEntry = _c.addUnitStateEntry, time = _a.time;
var addFormData = (0, vue_1.ref)({ id: "", count: 1 });
var unitMap = state.unitMap, supplyCategoryMap = state.supplyCategoryMap, supplyClassMap = state.supplyClassMap, supplyUomMap = state.supplyUomMap;
var _d = (0, toeUtils_1.useToeEditableItems)(), editedId = _d.editedId, showAddForm = _d.showAddForm, selectedSupplies = _d.selectedItems;
var suppliesEditStore = (0, toeStore_1.useSuppliesEditStore)();
// use equipment store as a reference to check if we are in edit mode
var equipmentEditStore = (0, toeStore_1.useEquipmentEditStore)();
var isSuppliesEditMode = (0, pinia_1.storeToRefs)(equipmentEditStore).isEditMode;
// const { isSuppliesEditMode } = storeToRefs(suppliesEditStore);
var tableStore = (0, tableStores_1.useUnitSupplyTableStore)();
var uiStore = (0, uiStore_1.useUiStore)();
var selectedUnitIds = (0, selectedStore_1.useSelectedItems)().selectedUnitIds;
var includeSubordinates = (0, pinia_1.storeToRefs)(uiStore).toeIncludeSubordinates;
var isMultiMode = (0, vue_1.computed)(function () { return selectedUnitIds.value.size > 1; });
var aggregatedSupplies = (0, vue_1.shallowRef)([]);
var columns = [
    { id: "name", header: "Name", accessorKey: "name", size: 100 },
    { id: "class", header: "Class", accessorKey: "supplyClass" },
    {
        id: "assigned",
        header: "Asgd.",
        accessorKey: "count",
        size: 80,
        meta: { align: "right" },
    },
    {
        id: "onHand",
        header: "Avail.",
        accessorKey: "onHand",
        size: 80,
        meta: { align: "right" },
    },
    { id: "uom", header: "Unit", accessorKey: "uom", size: 80 },
    {
        id: "percentage",
        header: "%",
        accessorFn: function (f) { return (0, toeUtils_1.asPercent)(f); },
        size: 80,
        meta: { align: "right" },
    },
];
onUndoRedo(function (param) {
    // Update the current state of the selected units in case equipment or personnel have changed
    selectedUnitIds.value.forEach(function (unitId) { return updateUnitState(unitId); });
    (0, vue_1.triggerRef)(selectedUnitIds);
});
// watch(isSuppliesEditMode, (isEditMode) => {
//   if (isEditMode) {
//     uiStore.prevToeIncludeSubordinates = includeSubordinates.value;
//     includeSubordinates.value = false;
//   } else {
//     if (uiStore.prevToeIncludeSubordinates !== undefined) {
//       includeSubordinates.value = uiStore.prevToeIncludeSubordinates;
//     }
//   }
// });
(0, vue_1.watch)([
    selectedUnitIds,
    includeSubordinates,
    time.scenarioTime,
    function () { return state.settingsStateCounter; },
], function () {
    var aggSupplies = {};
    var allUnitIds = new Set();
    selectedUnitIds.value.forEach(function (unitId) {
        if (includeSubordinates.value) {
            walkSubUnits(unitId, function (unit) {
                allUnitIds.add(unit.id);
            }, { includeParent: true });
        }
        else {
            allUnitIds.add(unitId);
        }
    });
    allUnitIds.forEach(function (unitId) {
        var _a, _b, _c;
        var unit = unitMap[unitId];
        var supplies = (_c = (_b = (_a = unit._state) === null || _a === void 0 ? void 0 : _a.supplies) !== null && _b !== void 0 ? _b : unit.supplies) !== null && _c !== void 0 ? _c : [];
        supplies.forEach(function (e) {
            var _a, _b, _c, _d, _e;
            var count = ((_b = (_a = aggSupplies[e.id]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0) + e.count;
            var onHand = ((_d = (_c = aggSupplies[e.id]) === null || _c === void 0 ? void 0 : _c.onHand) !== null && _d !== void 0 ? _d : 0) + ((_e = e === null || e === void 0 ? void 0 : e.onHand) !== null && _e !== void 0 ? _e : e.count);
            aggSupplies[e.id] = { count: count, onHand: onHand };
        });
    });
    aggregatedSupplies.value = Object.entries(aggSupplies).map(function (_a) {
        var _b, _c, _d, _e, _f, _g, _h, _j;
        var id = _a[0], _k = _a[1], count = _k.count, onHand = _k.onHand;
        var sc = supplyCategoryMap[id];
        var supplyClass = (_d = (_c = supplyClassMap[(_b = sc === null || sc === void 0 ? void 0 : sc.supplyClass) !== null && _b !== void 0 ? _b : ""]) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "";
        var uomObj = supplyUomMap[(_e = sc === null || sc === void 0 ? void 0 : sc.uom) !== null && _e !== void 0 ? _e : ""];
        var uom = (_g = (_f = uomObj === null || uomObj === void 0 ? void 0 : uomObj.code) !== null && _f !== void 0 ? _f : uomObj === null || uomObj === void 0 ? void 0 : uomObj.name) !== null && _g !== void 0 ? _g : "";
        return {
            id: id,
            name: (_h = sc === null || sc === void 0 ? void 0 : sc.name) !== null && _h !== void 0 ? _h : id,
            description: (_j = sc === null || sc === void 0 ? void 0 : sc.description) !== null && _j !== void 0 ? _j : "",
            supplyClass: supplyClass,
            count: count,
            onHand: onHand,
            uom: uom,
        };
    });
}, { immediate: true, deep: true });
function updateSupplyCount(supplyId, _a) {
    var count = _a.count;
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            updateUnitSupply(unitId, supplyId, { count: count });
        });
    });
    (0, vue_1.triggerRef)(selectedUnitIds);
    handleNextEditedId(supplyId);
}
function updateSupplyOnHand(supplyId, _a) {
    var onHand = _a.onHand;
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            var _a;
            // skip units that don't have the supply
            var unit = unitMap[unitId];
            if (!((_a = unit.supplies) === null || _a === void 0 ? void 0 : _a.find(function (e) { return e.id === supplyId; })))
                return;
            var newState = {
                t: +time.scenarioTime.value,
                update: { supplies: [{ id: supplyId, onHand: onHand }] },
            };
            addUnitStateEntry(unitId, newState, true);
        });
    });
    (0, vue_1.triggerRef)(selectedUnitIds);
    handleNextEditedId(supplyId);
}
function addSupply(unitId, supplyId, _a) {
    var count = _a.count, onHand = _a.onHand;
    updateUnitSupply(unitId, supplyId, { count: count, onHand: onHand });
    (0, vue_1.triggerRef)(selectedUnitIds);
}
function diffSupplyOnHand(supplyId, _a) {
    var onHand = _a.onHand;
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            var _a;
            // skip units that don't have the supply
            var unit = unitMap[unitId];
            if (!((_a = unit.supplies) === null || _a === void 0 ? void 0 : _a.find(function (e) { return e.id === supplyId; })))
                return;
            var newState = {
                t: +time.scenarioTime.value,
                diff: { supplies: [{ id: supplyId, onHand: onHand }] },
            };
            addUnitStateEntry(unitId, newState, true);
        });
    });
    (0, vue_1.triggerRef)(selectedUnitIds);
    handleNextEditedId(supplyId);
}
function handleNextEditedId(supplyId) {
    if (uiStore.goToNextOnSubmit) {
        var currentIndex = aggregatedSupplies.value.findIndex(function (sc) { return sc.id === supplyId; });
        if (currentIndex < aggregatedSupplies.value.length - 1) {
            editedId.value = aggregatedSupplies.value[currentIndex + 1].id;
        }
        else {
            editedId.value = null;
        }
    }
    else {
        editedId.value = null;
    }
}
function deleteSupply(unitId, supplyId) {
    updateUnitSupply(unitId, supplyId, { count: -1 });
}
function onAddSubmit(formData) {
    var id = formData.id, count = formData.count, onHand = formData.onHand;
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            addSupply(unitId, id, { count: count, onHand: onHand });
        });
    });
    addFormData.value = __assign(__assign({}, formData), { id: "" });
}
function onDelete() {
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            selectedSupplies.value.forEach(function (e) {
                deleteSupply(unitId, e.id);
            });
        });
    });
    (0, vue_1.triggerRef)(selectedUnitIds);
    selectedSupplies.value = [];
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_0 = ToeGridHeader_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.isSuppliesEditMode), addMode: (__VLS_ctx.showAddForm), includeSubordinates: (__VLS_ctx.includeSubordinates), selectedCount: (__VLS_ctx.selectedSupplies.length), isLocked: (__VLS_ctx.isLocked) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.isSuppliesEditMode), addMode: (__VLS_ctx.showAddForm), includeSubordinates: (__VLS_ctx.includeSubordinates), selectedCount: (__VLS_ctx.selectedSupplies.length), isLocked: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ delete: {} },
    { onDelete: (__VLS_ctx.onDelete) });
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.showAddForm) {
    var __VLS_7 = AddUnitSupplyForm_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { usedSupplies: (__VLS_ctx.isMultiMode ? [] : __VLS_ctx.aggregatedSupplies), form: (__VLS_ctx.addFormData) })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { usedSupplies: (__VLS_ctx.isMultiMode ? [] : __VLS_ctx.aggregatedSupplies), form: (__VLS_ctx.addFormData) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    var __VLS_12 = void 0;
    var __VLS_13 = ({ cancel: {} },
        { onCancel: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showAddForm))
                    return;
                __VLS_ctx.showAddForm = false;
                // @ts-ignore
                [isSuppliesEditMode, showAddForm, showAddForm, showAddForm, includeSubordinates, selectedSupplies, isLocked, onDelete, isMultiMode, aggregatedSupplies, addFormData,];
            } });
    var __VLS_14 = ({ submit: {} },
        { onSubmit: (__VLS_ctx.onAddSubmit) });
    var __VLS_10;
    var __VLS_11;
}
if (__VLS_ctx.aggregatedSupplies.length) {
    var __VLS_15 = ToeGrid_vue_1.default || ToeGrid_vue_1.default;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        columns: (__VLS_ctx.columns),
        data: (__VLS_ctx.aggregatedSupplies),
        editedId: (__VLS_ctx.editedId),
        select: (__VLS_ctx.isSuppliesEditMode),
        selected: (__VLS_ctx.selectedSupplies),
        editMode: (__VLS_ctx.isSuppliesEditMode),
        tableStore: (__VLS_ctx.tableStore),
        isLocked: (__VLS_ctx.isLocked),
    }));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
            columns: (__VLS_ctx.columns),
            data: (__VLS_ctx.aggregatedSupplies),
            editedId: (__VLS_ctx.editedId),
            select: (__VLS_ctx.isSuppliesEditMode),
            selected: (__VLS_ctx.selectedSupplies),
            editMode: (__VLS_ctx.isSuppliesEditMode),
            tableStore: (__VLS_ctx.tableStore),
            isLocked: (__VLS_ctx.isLocked),
        }], __VLS_functionalComponentArgsRest(__VLS_16), false));
    var __VLS_20 = __VLS_18.slots.default;
    {
        var __VLS_21 = __VLS_18.slots["inline-form"];
        var row = __VLS_vSlot(__VLS_21)[0].row;
        var __VLS_22 = InlineFormWrapper_vue_1.default || InlineFormWrapper_vue_1.default;
        // @ts-ignore
        var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ class: "pr-6" }, { detailsPanel: true })));
        var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ class: "pr-6" }, { detailsPanel: true })], __VLS_functionalComponentArgsRest(__VLS_23), false));
        /** @type {__VLS_StyleScopedClasses['pr-6']} */ ;
        var __VLS_27 = __VLS_25.slots.default;
        var __VLS_28 = ModifyUnitSupplyForm_vue_1.default;
        // @ts-ignore
        var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign(__assign(__assign(__assign({ 'onCancel': {} }, { 'onDiffOnHand': {} }), { 'onUpdateCount': {} }), { 'onUpdateOnHand': {} }), { itemData: (row), heading: (row.name) })));
        var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onCancel': {} }, { 'onDiffOnHand': {} }), { 'onUpdateCount': {} }), { 'onUpdateOnHand': {} }), { itemData: (row), heading: (row.name) })], __VLS_functionalComponentArgsRest(__VLS_29), false));
        var __VLS_33 = void 0;
        var __VLS_34 = ({ cancel: {} },
            { onCancel: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.aggregatedSupplies.length))
                        return;
                    __VLS_ctx.isSuppliesEditMode = false;
                    // @ts-ignore
                    [isSuppliesEditMode, isSuppliesEditMode, isSuppliesEditMode, selectedSupplies, isLocked, aggregatedSupplies, aggregatedSupplies, onAddSubmit, columns, editedId, tableStore,];
                } });
        var __VLS_35 = ({ diffOnHand: {} },
            { onDiffOnHand: (__VLS_ctx.diffSupplyOnHand) });
        var __VLS_36 = ({ updateCount: {} },
            { onUpdateCount: (__VLS_ctx.updateSupplyCount) });
        var __VLS_37 = ({ updateOnHand: {} },
            { onUpdateOnHand: (__VLS_ctx.updateSupplyOnHand) });
        var __VLS_31;
        var __VLS_32;
        // @ts-ignore
        [diffSupplyOnHand, updateSupplyCount, updateSupplyOnHand,];
        var __VLS_25;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_18;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
