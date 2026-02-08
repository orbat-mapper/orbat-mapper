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
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var TableHeader_vue_1 = require("@/components/TableHeader.vue");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var notifications_1 = require("@/composables/notifications");
var scenarioInfoPanelStore_1 = require("@/stores/scenarioInfoPanelStore");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var button_1 = require("@/components/ui/button");
var scn = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var store = (0, scenarioInfoPanelStore_1.useScenarioInfoPanelStore)();
var send = (0, notifications_1.useNotifications)().send;
var groups = (0, vue_1.computed)(function () {
    return Object.values(scn.store.state.rangeRingGroupMap);
});
var itemActions = [
    { label: "Edit", action: "edit" },
    { label: "Delete", action: "delete" },
];
var editedId = (0, vue_1.ref)();
var form = (0, vue_1.ref)({ name: "" });
var addForm = (0, vue_1.ref)({ name: "" });
function startEdit(data) {
    editedId.value = data.id;
    var id = data.id, rest = __rest(data, ["id"]);
    form.value = rest;
}
function onSubmit() {
    scn.unitActions.updateRangeRingGroup(editedId.value, form.value);
    editedId.value = null;
}
function cancelEdit() {
    editedId.value = null;
}
function onItemAction(item, action) {
    switch (action) {
        case "edit":
            startEdit(item);
            break;
        case "delete":
            var success = scn.unitActions.deleteRangeRingGroup(item.id);
            if (!success) {
                send({
                    type: "error",
                    message: "Cannot delete a group that is in use.",
                });
            }
            break;
    }
}
function onAddSubmit() {
    // check if name exists
    if (groups.value.find(function (e) { return e.name === addForm.value.name; })) {
        send({
            type: "error",
            message: "A group with this name already exists.",
        });
        return;
    }
    scn.unitActions.addRangeRingGroup(__assign({}, addForm.value));
    addForm.value = { name: "" };
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose dark:prose-invert max-w-none" }));
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
var __VLS_0 = TableHeader_vue_1.default || TableHeader_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    description: "Range ring groups available in this scenario.",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        description: "Range ring groups available in this scenario.",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { variant: "outline" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11;
var __VLS_12 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.store.toggleAddGroup();
            // @ts-ignore
            [store,];
        } });
var __VLS_13 = __VLS_9.slots.default;
(__VLS_ctx.store.showAddGroup ? "Hide form" : "Add");
// @ts-ignore
[store,];
var __VLS_9;
var __VLS_10;
// @ts-ignore
[];
var __VLS_3;
if (__VLS_ctx.store.showAddGroup) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onAddSubmit) }, { class: "not-prose grid grid-cols-3 gap-2" }));
    /** @type {__VLS_StyleScopedClasses['not-prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_14 = InputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        autofocus: true,
        label: "Name",
        required: true,
        modelValue: (__VLS_ctx.addForm.name),
    }));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{
            autofocus: true,
            label: "Name",
            required: true,
            modelValue: (__VLS_ctx.addForm.name),
        }], __VLS_functionalComponentArgsRest(__VLS_15), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2 flex items-start gap-3" }));
    /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    var __VLS_19 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ type: "submit", small: true, primary: true }, { class: "self-center" })));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ type: "submit", small: true, primary: true }, { class: "self-center" })], __VLS_functionalComponentArgsRest(__VLS_20), false));
    /** @type {__VLS_StyleScopedClasses['self-center']} */ ;
    var __VLS_24 = __VLS_22.slots.default;
    // @ts-ignore
    [store, onAddSubmit, addForm,];
    var __VLS_22;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onSubmit) }));
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
var _loop_1 = function (eq) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign(__assign({ onDblclick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startEdit(eq);
            // @ts-ignore
            [onSubmit, groups, startEdit,];
        } }, { key: (eq.id) }), { class: "cursor-pointer" }));
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    if (eq.id === __VLS_ctx.editedId) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign(__assign({ 'onVue:mounted': (function (_a) {
                var el = _a.el;
                return el.focus();
            }) }, { type: "text", value: (__VLS_ctx.form.name) }), { class: "h-full w-full text-sm" }), { placeholder: "Name" }));
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "" }, { colspan: "3" }));
        /** @type {__VLS_StyleScopedClasses['']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        var __VLS_25 = BaseButton_vue_1.default || BaseButton_vue_1.default;
        // @ts-ignore
        var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ small: true, type: "submit", secondary: true }, { class: "ml-2" })));
        var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ small: true, type: "submit", secondary: true }, { class: "ml-2" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        var __VLS_30 = __VLS_28.slots.default;
        // @ts-ignore
        [editedId, form,];
        var __VLS_31 = BaseButton_vue_1.default || BaseButton_vue_1.default;
        // @ts-ignore
        var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign(__assign({ 'onClick': {} }, { small: true }), { class: "ml-2" })));
        var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { small: true }), { class: "ml-2" })], __VLS_functionalComponentArgsRest(__VLS_32), false));
        var __VLS_36 = void 0;
        var __VLS_37 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(eq.id === __VLS_ctx.editedId))
                        return;
                    __VLS_ctx.cancelEdit();
                    // @ts-ignore
                    [cancelEdit,];
                } });
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        var __VLS_38 = __VLS_34.slots.default;
        // @ts-ignore
        [];
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        (eq.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "not-prose w-6" }));
        /** @type {__VLS_StyleScopedClasses['not-prose']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
        var __VLS_39 = DotsMenu_vue_1.default;
        // @ts-ignore
        var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign({ 'onAction': {} }, { items: (__VLS_ctx.itemActions) })));
        var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { items: (__VLS_ctx.itemActions) })], __VLS_functionalComponentArgsRest(__VLS_40), false));
        var __VLS_44 = void 0;
        var __VLS_45 = ({ action: {} },
            { onAction: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!!(eq.id === __VLS_ctx.editedId))
                        return;
                    __VLS_ctx.onItemAction(eq, $event);
                    // @ts-ignore
                    [itemActions, onItemAction,];
                } });
    }
    // @ts-ignore
    [];
};
var __VLS_28, __VLS_34, __VLS_35, __VLS_42, __VLS_43;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.groups)); _i < _a.length; _i++) {
    var eq = _a[_i][0];
    _loop_1(eq);
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
