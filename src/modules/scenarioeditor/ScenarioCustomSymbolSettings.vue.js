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
var utils_1 = require("@/utils");
var injects_ts_1 = require("@/components/injects.ts");
var vue_1 = require("vue");
var toeUtils_ts_1 = require("@/composables/toeUtils.ts");
var notifications_ts_1 = require("@/composables/notifications.ts");
var tableStores_ts_1 = require("@/stores/tableStores.ts");
var ToeGridHeader_vue_1 = require("@/modules/scenarioeditor/ToeGridHeader.vue");
var InlineFormWrapper_vue_1 = require("@/modules/scenarioeditor/InlineFormWrapper.vue");
var ToeGrid_vue_1 = require("@/modules/grid/ToeGrid.vue");
var AddCustomSymbolForm_vue_1 = require("@/modules/scenarioeditor/AddCustomSymbolForm.vue");
var unitStyles_ts_1 = require("@/geo/unitStyles.ts");
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var button_1 = require("@/components/ui/button");
var lucide_vue_next_1 = require("lucide-vue-next");
var scn = (0, utils_1.injectStrict)(injects_ts_1.activeScenarioKey);
var icons = (0, vue_1.computed)(function () {
    var _a;
    scn.store.state.settingsStateCounter && rerender.value;
    return (_a = Object.values(scn.store.state.customSymbolMap)) !== null && _a !== void 0 ? _a : [];
});
var _a = (0, toeUtils_ts_1.useToeEditableItems)(), editMode = _a.editMode, editedId = _a.editedId, showAddForm = _a.showAddForm, rerender = _a.rerender, selectedItems = _a.selectedItems;
var send = (0, notifications_ts_1.useNotifications)().send;
var tableStore = (0, tableStores_ts_1.useCustomSymbolTableStore)();
var columns = [
    {
        id: "src",
        header: "Icon",
        accessorKey: "src",
        enableSorting: false,
        cell: function (_a) {
            var row = _a.row, getValue = _a.getValue, cell = _a.cell;
            return (0, vue_1.h)("img", {
                class: "w-full contain-content",
                src: getValue(),
            });
        },
        size: 100,
    },
    { id: "name", header: "Name", accessorKey: "name", size: 200 },
    {
        id: "sidcIcon",
        header: "SIDC",
        accessorKey: "sidc",
        cell: function (_a) {
            var row = _a.row, getValue = _a.getValue, cell = _a.cell;
            return (0, vue_1.h)("div", { class: "flex items-center justify-center" }, [
                (0, vue_1.h)(NewMilitarySymbol_vue_1.default, {
                    sidc: getValue(),
                    size: 40,
                    options: { monoColor: "#7a7575" },
                }),
            ]);
        },
        size: 80,
        enableSorting: false,
    },
    { id: "sidc", header: "SIDC Code", accessorKey: "sidc", size: 200 },
    { id: "id", header: "Id", accessorKey: "id", size: 100 },
];
var addForm = (0, vue_1.ref)({
    name: "Name",
    src: "",
    sidc: "10031000001100000000",
});
function cancelEdit() {
    editedId.value = null;
}
function onSubmit(e) {
    var id = e.id, rest = __rest(e, ["id"]);
    scn.settings.updateCustomSymbol(id, rest);
    cancelEdit();
    (0, vue_1.triggerRef)(rerender);
    (0, unitStyles_ts_1.clearUnitStyleCache)();
}
function onDelete() {
    var notDeletedItems = [];
    scn.store.groupUpdate(function () {
        selectedItems.value.forEach(function (e) {
            var success = scn.settings.deleteCustomSymbol(e.id);
            if (!success) {
                send({
                    type: "error",
                    message: "".concat(e.name, ": Cannot delete a symbol that is in use."),
                });
                notDeletedItems.push(e);
            }
        });
    });
    (0, vue_1.triggerRef)(editMode);
    selectedItems.value = notDeletedItems;
}
function onAddSubmit(formData) {
    // check if name exists
    if (icons.value.find(function (e) { return e.name === formData.name; })) {
        send({
            type: "error",
            message: "Custom symbol with this name already exists.",
        });
        return;
    }
    scn.settings.addCustomSymbol(__assign({}, formData));
    addForm.value = { name: "Name", src: "", sidc: "10031000001100000000" };
    (0, unitStyles_ts_1.clearUnitStyleCache)();
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_0 = ToeGridHeader_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.editMode), addMode: (__VLS_ctx.showAddForm), editLabel: "Edit symbols", selectedCount: (__VLS_ctx.selectedItems.length), hideEdit: (__VLS_ctx.icons.length === 0) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onDelete': {} }, { editMode: (__VLS_ctx.editMode), addMode: (__VLS_ctx.showAddForm), editLabel: "Edit symbols", selectedCount: (__VLS_ctx.selectedItems.length), hideEdit: (__VLS_ctx.icons.length === 0) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ delete: {} },
    { onDelete: (__VLS_ctx.onDelete) });
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.showAddForm) {
    var __VLS_7 = AddCustomSymbolForm_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { modelValue: (__VLS_ctx.addForm), heading: "Add new symbol" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onSubmit': {} }), { modelValue: (__VLS_ctx.addForm), heading: "Add new symbol" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
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
                [editMode, showAddForm, showAddForm, showAddForm, selectedItems, icons, onDelete, addForm,];
            } });
    var __VLS_14 = ({ submit: {} },
        { onSubmit: (__VLS_ctx.onAddSubmit) });
    var __VLS_10;
    var __VLS_11;
}
if (__VLS_ctx.icons.length) {
    var __VLS_15 = ToeGrid_vue_1.default || ToeGrid_vue_1.default;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        columns: (__VLS_ctx.columns),
        data: (__VLS_ctx.icons),
        editedId: (__VLS_ctx.editedId),
        tableStore: (__VLS_ctx.tableStore),
        select: (__VLS_ctx.editMode),
        selected: (__VLS_ctx.selectedItems),
        editMode: (__VLS_ctx.editMode),
        initialState: ({ columnVisibility: { id: false } }),
    }));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
            columns: (__VLS_ctx.columns),
            data: (__VLS_ctx.icons),
            editedId: (__VLS_ctx.editedId),
            tableStore: (__VLS_ctx.tableStore),
            select: (__VLS_ctx.editMode),
            selected: (__VLS_ctx.selectedItems),
            editMode: (__VLS_ctx.editMode),
            initialState: ({ columnVisibility: { id: false } }),
        }], __VLS_functionalComponentArgsRest(__VLS_16), false));
    var __VLS_20 = __VLS_18.slots.default;
    {
        var __VLS_21 = __VLS_18.slots["inline-form"];
        var row = __VLS_vSlot(__VLS_21)[0].row;
        var __VLS_22 = InlineFormWrapper_vue_1.default || InlineFormWrapper_vue_1.default;
        // @ts-ignore
        var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ class: "pr-6" })));
        var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ class: "pr-6" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
        /** @type {__VLS_StyleScopedClasses['pr-6']} */ ;
        var __VLS_27 = __VLS_25.slots.default;
        var __VLS_28 = AddCustomSymbolForm_vue_1.default;
        // @ts-ignore
        var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign(__assign({ 'onSubmit': {} }, { 'onCancel': {} }), { modelValue: (row), heading: "Edit custom symbol" })));
        var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign(__assign({ 'onSubmit': {} }, { 'onCancel': {} }), { modelValue: (row), heading: "Edit custom symbol" })], __VLS_functionalComponentArgsRest(__VLS_29), false));
        var __VLS_33 = void 0;
        var __VLS_34 = ({ submit: {} },
            { onSubmit: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.icons.length))
                        return;
                    __VLS_ctx.onSubmit($event);
                    // @ts-ignore
                    [editMode, editMode, selectedItems, icons, icons, onAddSubmit, columns, editedId, tableStore, onSubmit,];
                } });
        var __VLS_35 = ({ cancel: {} },
            { onCancel: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.icons.length))
                        return;
                    __VLS_ctx.cancelEdit();
                    // @ts-ignore
                    [cancelEdit,];
                } });
        var __VLS_31;
        var __VLS_32;
        // @ts-ignore
        [];
        var __VLS_25;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_18;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "prose prose-sm dark:prose-invert" }));
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.kbd, __VLS_intrinsics.kbd)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-6 text-center" }));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
var __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36(__assign(__assign({ variant: "link", asChild: true }, { class: "text-muted-foreground" }), { size: "sm" })));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign(__assign({ variant: "link", asChild: true }, { class: "text-muted-foreground" }), { size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_37), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
var __VLS_41 = __VLS_39.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://docs.orbat-mapper.app/guide/custom-symbols",
    target: "_blank",
    rel: "noreferrer",
});
var __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.ArrowUpRightIcon} */
lucide_vue_next_1.ArrowUpRightIcon;
// @ts-ignore
var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({}));
var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_43), false));
// @ts-ignore
[];
var __VLS_39;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
