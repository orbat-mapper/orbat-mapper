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
var toeStore_1 = require("@/stores/toeStore");
var tabs_1 = require("@/components/ui/tabs");
var ToeGridHeader_vue_1 = require("@/modules/scenarioeditor/ToeGridHeader.vue");
var tableStores_1 = require("@/stores/tableStores");
var toeUtils_1 = require("@/composables/toeUtils");
var ToeGrid_vue_1 = require("@/modules/grid/ToeGrid.vue");
var InlineFormWrapper_vue_1 = require("@/modules/scenarioeditor/InlineFormWrapper.vue");
var ModifyUnitToeItemForm_vue_1 = require("@/modules/scenarioeditor/ModifyUnitToeItemForm.vue");
var AddUnitToeItemForm_vue_1 = require("@/modules/scenarioeditor/AddUnitToeItemForm.vue");
var uiStore_1 = require("@/stores/uiStore");
var pinia_1 = require("pinia");
var UnitDetailsSupplies_vue_1 = require("@/modules/scenarioeditor/UnitDetailsSupplies.vue");
var props = defineProps();
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), _b = _a.store, state = _b.state, onUndoRedo = _b.onUndoRedo, groupUpdate = _b.groupUpdate, _c = _a.unitActions, walkSubUnits = _c.walkSubUnits, updateUnitEquipment = _c.updateUnitEquipment, updateUnitPersonnel = _c.updateUnitPersonnel, updateUnitState = _c.updateUnitState, addUnitStateEntry = _c.addUnitStateEntry, time = _a.time;
var equipmentMap = state.equipmentMap, personnelMap = state.personnelMap, unitMap = state.unitMap;
var uiStore = (0, uiStore_1.useUiStore)();
var includeSubordinates = (0, pinia_1.storeToRefs)(uiStore).toeIncludeSubordinates;
var unitEquipmentTableStore = (0, tableStores_1.useUnitEquipmentTableStore)();
var unitPersonnelTableStore = (0, tableStores_1.useUnitPersonnelTableStore)();
var _d = (0, toeUtils_1.useToeEditableItems)(), editedEquipmentId = _d.editedId, selectedEquipment = _d.selectedItems;
var _e = (0, toeUtils_1.useToeEditableItems)(), editedPersonnelId = _e.editedId, selectedPersonnel = _e.selectedItems;
var equipmentEditStore = (0, toeStore_1.useEquipmentEditStore)();
var personnelEditStore = (0, toeStore_1.usePersonnelEditStore)();
var isEditMode = (0, pinia_1.storeToRefs)(equipmentEditStore).isEditMode;
var selectedUnitIds = (0, selectedStore_1.useSelectedItems)().selectedUnitIds;
var isMultiMode = (0, vue_1.computed)(function () { return selectedUnitIds.value.size > 1; });
var addFormData = (0, vue_1.ref)({ id: "", count: 1 });
var aggregatedEquipment = (0, vue_1.shallowRef)([]);
var aggregatedPersonnel = (0, vue_1.shallowRef)([]);
var aggregatedPersonnelCount = (0, vue_1.computed)(function () {
    return aggregatedPersonnel.value.reduce(function (acc, e) { var _a, _b; return acc + ((_b = (_a = e.onHand) !== null && _a !== void 0 ? _a : e.count) !== null && _b !== void 0 ? _b : 0); }, 0);
});
var equipmentColumns = (0, toeUtils_1.createToeTableColumns)();
var personnelColumns = (0, toeUtils_1.createToeTableColumns)();
onUndoRedo(function (param) {
    // Update the current state of the selected units in case equipment or personnel have changed
    selectedUnitIds.value.forEach(function (unitId) { return updateUnitState(unitId); });
    (0, vue_1.triggerRef)(selectedUnitIds);
});
(0, vue_1.watch)(isEditMode, function (value) {
    if (value) {
        uiStore.prevToeIncludeSubordinates = includeSubordinates.value;
        includeSubordinates.value = false;
    }
    else {
        if (uiStore.prevToeIncludeSubordinates !== undefined) {
            includeSubordinates.value = uiStore.prevToeIncludeSubordinates;
        }
    }
});
(0, vue_1.watch)([
    selectedUnitIds,
    includeSubordinates,
    time.scenarioTime,
    function () { return state.settingsStateCounter; },
], function () {
    var aggEquipment = {};
    var aggPersonnel = {};
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
        var _a, _b, _c, _d, _e, _f;
        var unit = unitMap[unitId];
        var equipment = (_c = (_b = (_a = unit._state) === null || _a === void 0 ? void 0 : _a.equipment) !== null && _b !== void 0 ? _b : unit.equipment) !== null && _c !== void 0 ? _c : [];
        var personnel = (_f = (_e = (_d = unit._state) === null || _d === void 0 ? void 0 : _d.personnel) !== null && _e !== void 0 ? _e : unit.personnel) !== null && _f !== void 0 ? _f : [];
        equipment === null || equipment === void 0 ? void 0 : equipment.forEach(function (e) {
            var _a, _b, _c, _d, _e;
            var count = ((_b = (_a = aggEquipment[e.id]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0) + e.count;
            var onHand = ((_d = (_c = aggEquipment[e.id]) === null || _c === void 0 ? void 0 : _c.onHand) !== null && _d !== void 0 ? _d : 0) + ((_e = e === null || e === void 0 ? void 0 : e.onHand) !== null && _e !== void 0 ? _e : e.count);
            aggEquipment[e.id] = { count: count, onHand: onHand };
        });
        personnel === null || personnel === void 0 ? void 0 : personnel.forEach(function (p) {
            var _a, _b, _c, _d, _e;
            var count = ((_b = (_a = aggPersonnel[p.id]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0) + p.count;
            var onHand = ((_d = (_c = aggPersonnel[p.id]) === null || _c === void 0 ? void 0 : _c.onHand) !== null && _d !== void 0 ? _d : 0) + ((_e = p === null || p === void 0 ? void 0 : p.onHand) !== null && _e !== void 0 ? _e : p.count);
            aggPersonnel[p.id] = { count: count, onHand: onHand };
        });
    });
    aggregatedEquipment.value = Object.entries(aggEquipment).map(function (_a) {
        var _b, _c, _d, _e;
        var id = _a[0], _f = _a[1], count = _f.count, onHand = _f.onHand;
        return ({
            id: id,
            name: (_c = (_b = equipmentMap[id]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : id,
            description: (_e = (_d = equipmentMap[id]) === null || _d === void 0 ? void 0 : _d.description) !== null && _e !== void 0 ? _e : "",
            count: count,
            onHand: onHand,
        });
    });
    aggregatedPersonnel.value = Object.entries(aggPersonnel).map(function (_a) {
        var _b, _c, _d, _e;
        var id = _a[0], _f = _a[1], count = _f.count, onHand = _f.onHand;
        return ({
            id: id,
            name: (_c = (_b = personnelMap[id]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : id,
            description: (_e = (_d = personnelMap[id]) === null || _d === void 0 ? void 0 : _d.description) !== null && _e !== void 0 ? _e : "",
            count: count,
            onHand: onHand,
        });
    });
}, { immediate: true, deep: true });
function onAddSubmit(toeMode, formData) {
    var id = formData.id, count = formData.count, onHand = formData.onHand;
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            if (toeMode === "equipment") {
                updateUnitEquipment(unitId, id, { count: count, onHand: onHand });
            }
            else if (toeMode === "personnel") {
                updateUnitPersonnel(unitId, id, { count: count, onHand: onHand });
            }
        });
    });
    (0, vue_1.triggerRef)(selectedUnitIds);
    addFormData.value = __assign(__assign({}, formData), { id: "" });
}
function updateItemCount(toeMode, _a) {
    var itemId = _a.id, count = _a.count;
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            if (toeMode === "equipment") {
                updateUnitEquipment(unitId, itemId, { count: count });
            }
            else if (toeMode === "personnel") {
                updateUnitPersonnel(unitId, itemId, { count: count });
            }
        });
    });
    (0, vue_1.triggerRef)(selectedUnitIds);
    handleNextEditedId(toeMode, itemId);
}
function updateItemOnHand(toeMode, _a) {
    var itemId = _a.id, onHand = _a.onHand;
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            var _a, _b;
            if (toeMode === "equipment") {
                var unit = unitMap[unitId];
                if (!((_a = unit.equipment) === null || _a === void 0 ? void 0 : _a.find(function (e) { return e.id === itemId; })))
                    return;
                var newState = {
                    t: +time.scenarioTime.value,
                    update: { equipment: [{ id: itemId, onHand: onHand }] },
                };
                addUnitStateEntry(unitId, newState, true);
            }
            else if (toeMode === "personnel") {
                var unit = unitMap[unitId];
                if (!((_b = unit.personnel) === null || _b === void 0 ? void 0 : _b.find(function (p) { return p.id === itemId; })))
                    return;
                var newState = {
                    t: +time.scenarioTime.value,
                    update: { personnel: [{ id: itemId, onHand: onHand }] },
                };
                addUnitStateEntry(unitId, newState, true);
            }
        });
    });
    (0, vue_1.triggerRef)(selectedUnitIds);
    handleNextEditedId(toeMode, itemId);
}
function diffItemOnHand(toeMode, _a) {
    var itemId = _a.id, onHand = _a.onHand;
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            var _a, _b;
            if (toeMode === "equipment") {
                var unit = unitMap[unitId];
                if (!((_a = unit.equipment) === null || _a === void 0 ? void 0 : _a.find(function (e) { return e.id === itemId; })))
                    return;
                var newState = {
                    t: +time.scenarioTime.value,
                    diff: { equipment: [{ id: itemId, onHand: onHand }] },
                };
                addUnitStateEntry(unitId, newState, true);
            }
            else if (toeMode === "personnel") {
                var unit = unitMap[unitId];
                if (!((_b = unit.personnel) === null || _b === void 0 ? void 0 : _b.find(function (p) { return p.id === itemId; })))
                    return;
                var newState = {
                    t: +time.scenarioTime.value,
                    diff: { personnel: [{ id: itemId, onHand: onHand }] },
                };
                addUnitStateEntry(unitId, newState, true);
            }
        });
    });
    (0, vue_1.triggerRef)(selectedUnitIds);
    handleNextEditedId(toeMode, itemId);
}
function onDeleteItems(toeMode) {
    groupUpdate(function () {
        selectedUnitIds.value.forEach(function (unitId) {
            if (toeMode === "equipment") {
                selectedEquipment.value.forEach(function (_a) {
                    var itemId = _a.id;
                    updateUnitEquipment(unitId, itemId, { count: -1 });
                });
                selectedEquipment.value = [];
            }
            else if (toeMode === "personnel") {
                selectedPersonnel.value.forEach(function (_a) {
                    var itemId = _a.id;
                    updateUnitPersonnel(unitId, itemId, { count: -1 });
                });
                selectedPersonnel.value = [];
            }
        });
    });
    (0, vue_1.triggerRef)(selectedUnitIds);
}
function handleNextEditedId(mode, itemId) {
    if (!uiStore.goToNextOnSubmit) {
        if (mode === "equipment") {
            editedEquipmentId.value = null;
        }
        else if (mode === "personnel") {
            editedPersonnelId.value = null;
        }
        return;
    }
    if (mode === "equipment") {
        var currentIndex = aggregatedEquipment.value.findIndex(function (e) { return e.id === itemId; });
        if (currentIndex < aggregatedEquipment.value.length - 1) {
            editedEquipmentId.value = aggregatedEquipment.value[currentIndex + 1].id;
        }
        else {
            editedEquipmentId.value = null;
        }
    }
    else if (mode === "personnel") {
        var currentIndex = aggregatedPersonnel.value.findIndex(function (p) { return p.id === itemId; });
        if (currentIndex < aggregatedPersonnel.value.length - 1) {
            editedPersonnelId.value = aggregatedPersonnel.value[currentIndex + 1].id;
        }
        else {
            editedPersonnelId.value = null;
        }
    }
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
tabs_1.Tabs;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ modelValue: (__VLS_ctx.uiStore.toeTabIndex) }, { class: "w-full gap-0" }), { unmountOnHide: (false) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ modelValue: (__VLS_ctx.uiStore.toeTabIndex) }, { class: "w-full gap-0" }), { unmountOnHide: (false) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-0']} */ ;
var __VLS_5 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mx-4" }));
/** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
tabs_1.TabsList;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ class: "border-border h-12 w-full rounded-none border-b px-4 py-1" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ class: "border-border h-12 w-full rounded-none border-b px-4 py-1" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
var __VLS_11 = __VLS_9.slots.default;
for (var _i = 0, _f = __VLS_vFor((['Equipment', 'Personnel', 'Supplies'])); _i < _f.length; _i++) {
    var _g = _f[_i], lbl = _g[0], k = _g[1];
    var __VLS_12 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
    tabs_1.TabsTrigger;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        key: (lbl),
        value: (k),
    }));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{
            key: (lbl),
            value: (k),
        }], __VLS_functionalComponentArgsRest(__VLS_13), false));
    var __VLS_17 = __VLS_15.slots.default;
    (lbl);
    // @ts-ignore
    [uiStore,];
    var __VLS_15;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_9;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    value: (0),
}));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{
        value: (0),
    }], __VLS_functionalComponentArgsRest(__VLS_19), false));
var __VLS_23 = __VLS_21.slots.default;
var __VLS_24 = ToeGridHeader_vue_1.default;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.isEditMode), addMode: (__VLS_ctx.equipmentEditStore.showAddForm), includeSubordinates: (__VLS_ctx.includeSubordinates), selectedCount: (__VLS_ctx.selectedEquipment.length), isLocked: (__VLS_ctx.isLocked) })));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.isEditMode), addMode: (__VLS_ctx.equipmentEditStore.showAddForm), includeSubordinates: (__VLS_ctx.includeSubordinates), selectedCount: (__VLS_ctx.selectedEquipment.length), isLocked: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_29;
var __VLS_30 = ({ delete: {} },
    { onDelete: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onDeleteItems('equipment');
            // @ts-ignore
            [isEditMode, equipmentEditStore, includeSubordinates, selectedEquipment, isLocked, onDeleteItems,];
        } });
var __VLS_27;
var __VLS_28;
if (__VLS_ctx.equipmentEditStore.showAddForm) {
    var __VLS_31 = AddUnitToeItemForm_vue_1.default;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { mode: "equipment", usedItems: (__VLS_ctx.isMultiMode ? [] : __VLS_ctx.aggregatedEquipment) })));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { mode: "equipment", usedItems: (__VLS_ctx.isMultiMode ? [] : __VLS_ctx.aggregatedEquipment) })], __VLS_functionalComponentArgsRest(__VLS_32), false));
    var __VLS_36 = void 0;
    var __VLS_37 = ({ cancel: {} },
        { onCancel: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.equipmentEditStore.showAddForm))
                    return;
                __VLS_ctx.equipmentEditStore.showAddForm = false;
                // @ts-ignore
                [equipmentEditStore, equipmentEditStore, isMultiMode, aggregatedEquipment,];
            } });
    var __VLS_38 = ({ submit: {} },
        { onSubmit: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.equipmentEditStore.showAddForm))
                    return;
                __VLS_ctx.onAddSubmit('equipment', $event);
                // @ts-ignore
                [onAddSubmit,];
            } });
    var __VLS_34;
    var __VLS_35;
}
if (__VLS_ctx.aggregatedEquipment.length) {
    var __VLS_39 = ToeGrid_vue_1.default || ToeGrid_vue_1.default;
    // @ts-ignore
    var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
        columns: (__VLS_ctx.equipmentColumns),
        data: (__VLS_ctx.aggregatedEquipment),
        tableStore: (__VLS_ctx.unitEquipmentTableStore),
        editMode: (__VLS_ctx.isEditMode),
        editedId: (__VLS_ctx.editedEquipmentId),
        select: (__VLS_ctx.isEditMode),
        selected: (__VLS_ctx.selectedEquipment),
        isLocked: (__VLS_ctx.isLocked),
    }));
    var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([{
            columns: (__VLS_ctx.equipmentColumns),
            data: (__VLS_ctx.aggregatedEquipment),
            tableStore: (__VLS_ctx.unitEquipmentTableStore),
            editMode: (__VLS_ctx.isEditMode),
            editedId: (__VLS_ctx.editedEquipmentId),
            select: (__VLS_ctx.isEditMode),
            selected: (__VLS_ctx.selectedEquipment),
            isLocked: (__VLS_ctx.isLocked),
        }], __VLS_functionalComponentArgsRest(__VLS_40), false));
    var __VLS_44 = __VLS_42.slots.default;
    {
        var __VLS_45 = __VLS_42.slots["inline-form"];
        var row = __VLS_vSlot(__VLS_45)[0].row;
        var __VLS_46 = InlineFormWrapper_vue_1.default || InlineFormWrapper_vue_1.default;
        // @ts-ignore
        var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ class: "pr-6" }, { detailsPanel: true })));
        var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ class: "pr-6" }, { detailsPanel: true })], __VLS_functionalComponentArgsRest(__VLS_47), false));
        /** @type {__VLS_StyleScopedClasses['pr-6']} */ ;
        var __VLS_51 = __VLS_49.slots.default;
        var __VLS_52 = ModifyUnitToeItemForm_vue_1.default;
        // @ts-ignore
        var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52(__assign(__assign(__assign(__assign({ 'onCancel': {} }, { 'onUpdateCount': {} }), { 'onUpdateOnHand': {} }), { 'onDiffOnHand': {} }), { itemData: (row), heading: (row.name), editStore: (__VLS_ctx.equipmentEditStore) })));
        var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onCancel': {} }, { 'onUpdateCount': {} }), { 'onUpdateOnHand': {} }), { 'onDiffOnHand': {} }), { itemData: (row), heading: (row.name), editStore: (__VLS_ctx.equipmentEditStore) })], __VLS_functionalComponentArgsRest(__VLS_53), false));
        var __VLS_57 = void 0;
        var __VLS_58 = ({ cancel: {} },
            { onCancel: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.aggregatedEquipment.length))
                        return;
                    __VLS_ctx.isEditMode = false;
                    // @ts-ignore
                    [isEditMode, isEditMode, isEditMode, equipmentEditStore, selectedEquipment, isLocked, aggregatedEquipment, aggregatedEquipment, equipmentColumns, unitEquipmentTableStore, editedEquipmentId,];
                } });
        var __VLS_59 = ({ updateCount: {} },
            { onUpdateCount: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.aggregatedEquipment.length))
                        return;
                    __VLS_ctx.updateItemCount('equipment', $event);
                    // @ts-ignore
                    [updateItemCount,];
                } });
        var __VLS_60 = ({ updateOnHand: {} },
            { onUpdateOnHand: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.aggregatedEquipment.length))
                        return;
                    __VLS_ctx.updateItemOnHand('equipment', $event);
                    // @ts-ignore
                    [updateItemOnHand,];
                } });
        var __VLS_61 = ({ diffOnHand: {} },
            { onDiffOnHand: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.aggregatedEquipment.length))
                        return;
                    __VLS_ctx.diffItemOnHand('equipment', $event);
                    // @ts-ignore
                    [diffItemOnHand,];
                } });
        var __VLS_55;
        var __VLS_56;
        // @ts-ignore
        [];
        var __VLS_49;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_42;
}
// @ts-ignore
[];
var __VLS_21;
var __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    value: (1),
}));
var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([{
        value: (1),
    }], __VLS_functionalComponentArgsRest(__VLS_63), false));
var __VLS_67 = __VLS_65.slots.default;
var __VLS_68 = ToeGridHeader_vue_1.default;
// @ts-ignore
var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68(__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.isEditMode), addMode: (__VLS_ctx.personnelEditStore.showAddForm), includeSubordinates: (__VLS_ctx.includeSubordinates), selectedCount: (__VLS_ctx.selectedPersonnel.length), isLocked: (__VLS_ctx.isLocked) })));
var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.isEditMode), addMode: (__VLS_ctx.personnelEditStore.showAddForm), includeSubordinates: (__VLS_ctx.includeSubordinates), selectedCount: (__VLS_ctx.selectedPersonnel.length), isLocked: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_69), false));
var __VLS_73;
var __VLS_74 = ({ delete: {} },
    { onDelete: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onDeleteItems('personnel');
            // @ts-ignore
            [isEditMode, includeSubordinates, isLocked, onDeleteItems, personnelEditStore, selectedPersonnel,];
        } });
var __VLS_71;
var __VLS_72;
if (__VLS_ctx.personnelEditStore.showAddForm) {
    var __VLS_75 = AddUnitToeItemForm_vue_1.default;
    // @ts-ignore
    var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75(__assign(__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { 'onDelete': {} }), { mode: "personnel", usedItems: (__VLS_ctx.isMultiMode ? [] : __VLS_ctx.aggregatedPersonnel) })));
    var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { 'onDelete': {} }), { mode: "personnel", usedItems: (__VLS_ctx.isMultiMode ? [] : __VLS_ctx.aggregatedPersonnel) })], __VLS_functionalComponentArgsRest(__VLS_76), false));
    var __VLS_80 = void 0;
    var __VLS_81 = ({ cancel: {} },
        { onCancel: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.personnelEditStore.showAddForm))
                    return;
                __VLS_ctx.personnelEditStore.showAddForm = false;
                // @ts-ignore
                [isMultiMode, personnelEditStore, personnelEditStore, aggregatedPersonnel,];
            } });
    var __VLS_82 = ({ submit: {} },
        { onSubmit: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.personnelEditStore.showAddForm))
                    return;
                __VLS_ctx.onAddSubmit('personnel', $event);
                // @ts-ignore
                [onAddSubmit,];
            } });
    var __VLS_83 = ({ delete: {} },
        { onDelete: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.personnelEditStore.showAddForm))
                    return;
                __VLS_ctx.onDeleteItems('personnel');
                // @ts-ignore
                [onDeleteItems,];
            } });
    var __VLS_78;
    var __VLS_79;
}
if (__VLS_ctx.aggregatedPersonnel.length) {
    var __VLS_84 = ToeGrid_vue_1.default || ToeGrid_vue_1.default;
    // @ts-ignore
    var __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        columns: (__VLS_ctx.personnelColumns),
        data: (__VLS_ctx.aggregatedPersonnel),
        tableStore: (__VLS_ctx.unitPersonnelTableStore),
        select: (__VLS_ctx.isEditMode),
        editMode: (__VLS_ctx.isEditMode),
        editedId: (__VLS_ctx.editedPersonnelId),
        selected: (__VLS_ctx.selectedPersonnel),
        isLocked: (__VLS_ctx.isLocked),
    }));
    var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([{
            columns: (__VLS_ctx.personnelColumns),
            data: (__VLS_ctx.aggregatedPersonnel),
            tableStore: (__VLS_ctx.unitPersonnelTableStore),
            select: (__VLS_ctx.isEditMode),
            editMode: (__VLS_ctx.isEditMode),
            editedId: (__VLS_ctx.editedPersonnelId),
            selected: (__VLS_ctx.selectedPersonnel),
            isLocked: (__VLS_ctx.isLocked),
        }], __VLS_functionalComponentArgsRest(__VLS_85), false));
    var __VLS_89 = __VLS_87.slots.default;
    {
        var __VLS_90 = __VLS_87.slots["inline-form"];
        var row = __VLS_vSlot(__VLS_90)[0].row;
        var __VLS_91 = InlineFormWrapper_vue_1.default || InlineFormWrapper_vue_1.default;
        // @ts-ignore
        var __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91(__assign({ class: "pr-6" }, { detailsPanel: true })));
        var __VLS_93 = __VLS_92.apply(void 0, __spreadArray([__assign({ class: "pr-6" }, { detailsPanel: true })], __VLS_functionalComponentArgsRest(__VLS_92), false));
        /** @type {__VLS_StyleScopedClasses['pr-6']} */ ;
        var __VLS_96 = __VLS_94.slots.default;
        var __VLS_97 = ModifyUnitToeItemForm_vue_1.default;
        // @ts-ignore
        var __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97(__assign(__assign(__assign(__assign({ 'onCancel': {} }, { 'onUpdateCount': {} }), { 'onUpdateOnHand': {} }), { 'onDiffOnHand': {} }), { itemData: (row), heading: (row.name), editStore: (__VLS_ctx.personnelEditStore) })));
        var __VLS_99 = __VLS_98.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onCancel': {} }, { 'onUpdateCount': {} }), { 'onUpdateOnHand': {} }), { 'onDiffOnHand': {} }), { itemData: (row), heading: (row.name), editStore: (__VLS_ctx.personnelEditStore) })], __VLS_functionalComponentArgsRest(__VLS_98), false));
        var __VLS_102 = void 0;
        var __VLS_103 = ({ cancel: {} },
            { onCancel: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.aggregatedPersonnel.length))
                        return;
                    __VLS_ctx.isEditMode = false;
                    // @ts-ignore
                    [isEditMode, isEditMode, isEditMode, isLocked, personnelEditStore, selectedPersonnel, aggregatedPersonnel, aggregatedPersonnel, personnelColumns, unitPersonnelTableStore, editedPersonnelId,];
                } });
        var __VLS_104 = ({ updateCount: {} },
            { onUpdateCount: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.aggregatedPersonnel.length))
                        return;
                    __VLS_ctx.updateItemCount('personnel', $event);
                    // @ts-ignore
                    [updateItemCount,];
                } });
        var __VLS_105 = ({ updateOnHand: {} },
            { onUpdateOnHand: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.aggregatedPersonnel.length))
                        return;
                    __VLS_ctx.updateItemOnHand('personnel', $event);
                    // @ts-ignore
                    [updateItemOnHand,];
                } });
        var __VLS_106 = ({ diffOnHand: {} },
            { onDiffOnHand: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.aggregatedPersonnel.length))
                        return;
                    __VLS_ctx.diffItemOnHand('personnel', $event);
                    // @ts-ignore
                    [diffItemOnHand,];
                } });
        var __VLS_100;
        var __VLS_101;
        // @ts-ignore
        [];
        var __VLS_94;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_87;
}
// @ts-ignore
[];
var __VLS_65;
var __VLS_107;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
    value: (2),
}));
var __VLS_109 = __VLS_108.apply(void 0, __spreadArray([{
        value: (2),
    }], __VLS_functionalComponentArgsRest(__VLS_108), false));
var __VLS_112 = __VLS_110.slots.default;
var __VLS_113 = UnitDetailsSupplies_vue_1.default || UnitDetailsSupplies_vue_1.default;
// @ts-ignore
var __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    unit: (__VLS_ctx.unit),
    isLocked: (__VLS_ctx.isLocked),
}));
var __VLS_115 = __VLS_114.apply(void 0, __spreadArray([{
        unit: (__VLS_ctx.unit),
        isLocked: (__VLS_ctx.isLocked),
    }], __VLS_functionalComponentArgsRest(__VLS_114), false));
// @ts-ignore
[isLocked, unit,];
var __VLS_110;
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose dark:prose-invert p-1" }));
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
if (!__VLS_ctx.aggregatedEquipment.length && !__VLS_ctx.aggregatedPersonnel.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    if (__VLS_ctx.includeSubordinates) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
// @ts-ignore
[includeSubordinates, aggregatedEquipment, aggregatedPersonnel,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
