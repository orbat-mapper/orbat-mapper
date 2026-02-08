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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var injects_1 = require("@/components/injects");
var utils_1 = require("@/utils");
var vue_1 = require("vue");
var TableHeader_vue_1 = require("@/components/TableHeader.vue");
var notifications_1 = require("@/composables/notifications");
var ToeGridHeader_vue_1 = require("@/modules/scenarioeditor/ToeGridHeader.vue");
var ToeGrid_vue_1 = require("@/modules/grid/ToeGrid.vue");
var InlineFormWrapper_vue_1 = require("@/modules/scenarioeditor/InlineFormWrapper.vue");
var AddNameDescriptionForm_vue_1 = require("@/modules/scenarioeditor/AddNameDescriptionForm.vue");
var tableStores_1 = require("@/stores/tableStores");
var toeUtils_1 = require("@/composables/toeUtils");
var uiStore_1 = require("@/stores/uiStore");
var scn = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var send = (0, notifications_1.useNotifications)().send;
var _a = (0, toeUtils_1.useToeEditableItems)(), editMode = _a.editMode, editedId = _a.editedId, showAddForm = _a.showAddForm, rerender = _a.rerender, selectedItems = _a.selectedItems;
var tableStore = (0, tableStores_1.usePersonnelTableStore)();
var uiStore = (0, uiStore_1.useUiStore)();
var personnel = (0, vue_1.computed)(function () {
    rerender.value;
    return Object.values(scn.store.state.personnelMap);
});
var columns = [
    { id: "name", header: "Name", accessorKey: "name", size: 200 },
    { id: "description", header: "Description", accessorKey: "description" },
];
var addForm = (0, vue_1.ref)({ name: "", description: "" });
function onSubmit(e) {
    var id = e.id, rest = __rest(e, ["id"]);
    scn.unitActions.updatePersonnel(id, rest);
    if (uiStore.goToNextOnSubmit) {
        var currentIndex = personnel.value.findIndex(function (sc) { return sc.id === id; });
        if (currentIndex < personnel.value.length - 1) {
            editedId.value = personnel.value[currentIndex + 1].id;
        }
        else {
            editedId.value = null;
        }
    }
    else {
        editedId.value = null;
    }
    (0, vue_1.triggerRef)(rerender);
}
function cancelEdit() {
    editedId.value = null;
}
function onAddSubmit(formData) {
    // check if name exists
    if (personnel.value.find(function (e) { return e.name === formData.name; })) {
        send({
            type: "error",
            message: "Personnel category with this name already exists.",
        });
        return;
    }
    scn.unitActions.addPersonnel(__assign({}, formData));
    addForm.value = { name: "", description: "" };
}
function onDelete() {
    var notDeletedItems = [];
    scn.store.groupUpdate(function () {
        selectedItems.value.forEach(function (e) {
            var success = scn.unitActions.deletePersonnel(e.id);
            if (!success) {
                send({
                    type: "error",
                    message: "".concat(e.name, ": Cannot delete an equipment category that is in use."),
                });
                notDeletedItems.push(e);
            }
        });
    });
    (0, vue_1.triggerRef)(editMode);
    selectedItems.value = notDeletedItems;
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_0 = TableHeader_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    description: "A list of personnel categories available in this scenario.",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        description: "A list of personnel categories available in this scenario.",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = ToeGridHeader_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.editMode), addMode: (__VLS_ctx.showAddForm), editLabel: "Edit personnel", selectedCount: (__VLS_ctx.selectedItems.length), hideEdit: (__VLS_ctx.personnel.length === 0) })));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.editMode), addMode: (__VLS_ctx.showAddForm), editLabel: "Edit personnel", selectedCount: (__VLS_ctx.selectedItems.length), hideEdit: (__VLS_ctx.personnel.length === 0) })], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10;
var __VLS_11 = ({ delete: {} },
    { onDelete: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onDelete();
            // @ts-ignore
            [editMode, showAddForm, selectedItems, personnel, onDelete,];
        } });
var __VLS_8;
var __VLS_9;
if (__VLS_ctx.showAddForm) {
    var __VLS_12 = AddNameDescriptionForm_vue_1.default;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { modelValue: (__VLS_ctx.addForm), heading: "Add new personnel category" })));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { modelValue: (__VLS_ctx.addForm), heading: "Add new personnel category" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
    var __VLS_17 = void 0;
    var __VLS_18 = ({ cancel: {} },
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
                [showAddForm, showAddForm, addForm,];
            } });
    var __VLS_19 = ({ submit: {} },
        { onSubmit: (__VLS_ctx.onAddSubmit) });
    var __VLS_15;
    var __VLS_16;
}
if (__VLS_ctx.personnel.length) {
    var __VLS_20 = ToeGrid_vue_1.default || ToeGrid_vue_1.default;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        columns: (__VLS_ctx.columns),
        data: (__VLS_ctx.personnel),
        editedId: (__VLS_ctx.editedId),
        select: (__VLS_ctx.editMode),
        selected: (__VLS_ctx.selectedItems),
        editMode: (__VLS_ctx.editMode),
        tableStore: (__VLS_ctx.tableStore),
    }));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
            columns: (__VLS_ctx.columns),
            data: (__VLS_ctx.personnel),
            editedId: (__VLS_ctx.editedId),
            select: (__VLS_ctx.editMode),
            selected: (__VLS_ctx.selectedItems),
            editMode: (__VLS_ctx.editMode),
            tableStore: (__VLS_ctx.tableStore),
        }], __VLS_functionalComponentArgsRest(__VLS_21), false));
    var __VLS_25 = __VLS_23.slots.default;
    {
        var __VLS_26 = __VLS_23.slots["inline-form"];
        var row = __VLS_vSlot(__VLS_26)[0].row;
        var __VLS_27 = InlineFormWrapper_vue_1.default || InlineFormWrapper_vue_1.default;
        // @ts-ignore
        var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign({ class: "pr-6" })));
        var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ class: "pr-6" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
        /** @type {__VLS_StyleScopedClasses['pr-6']} */ ;
        var __VLS_32 = __VLS_30.slots.default;
        var __VLS_33 = AddNameDescriptionForm_vue_1.default;
        // @ts-ignore
        var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign(__assign({ 'onSubmit': {} }, { 'onCancel': {} }), { modelValue: (row), heading: "Edit personnel category", showNextToggle: true })));
        var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign(__assign({ 'onSubmit': {} }, { 'onCancel': {} }), { modelValue: (row), heading: "Edit personnel category", showNextToggle: true })], __VLS_functionalComponentArgsRest(__VLS_34), false));
        var __VLS_38 = void 0;
        var __VLS_39 = ({ submit: {} },
            { onSubmit: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.personnel.length))
                        return;
                    __VLS_ctx.onSubmit($event);
                    // @ts-ignore
                    [editMode, editMode, selectedItems, personnel, personnel, onAddSubmit, columns, editedId, tableStore, onSubmit,];
                } });
        var __VLS_40 = ({ cancel: {} },
            { onCancel: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.personnel.length))
                        return;
                    __VLS_ctx.cancelEdit();
                    // @ts-ignore
                    [cancelEdit,];
                } });
        var __VLS_36;
        var __VLS_37;
        // @ts-ignore
        [];
        var __VLS_30;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_23;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "prose prose-sm dark:prose-invert" }));
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.kbd, __VLS_intrinsics.kbd)({});
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
