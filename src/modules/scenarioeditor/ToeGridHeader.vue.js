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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var EditToggleButton_vue_1 = require("@/components/EditToggleButton.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var PlainButton_vue_1 = require("@/components/PlainButton.vue");
var __VLS_props = defineProps();
var emit = defineEmits(["delete"]);
var editMode = defineModel("editMode");
var addMode = defineModel("addMode");
var includeSubordinates = defineModel("includeSubordinates", {
    default: undefined,
});
var prevIncludeSubordinates;
var __VLS_defaultModels = {
    'includeSubordinates': undefined,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "my-4 flex items-center justify-between gap-2" }));
/** @type {__VLS_StyleScopedClasses['my-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
if (__VLS_ctx.selectedCount) {
    var __VLS_0 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClick': {} }, { small: true })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.selectedCount))
                    return;
                __VLS_ctx.emit('delete');
                // @ts-ignore
                [selectedCount, emit,];
            } });
    var __VLS_7 = __VLS_3.slots.default;
    (__VLS_ctx.selectedCount);
    // @ts-ignore
    [selectedCount,];
    var __VLS_3;
    var __VLS_4;
}
else if (__VLS_ctx.includeSubordinates !== undefined) {
    var __VLS_8 = ToggleField_vue_1.default || ToggleField_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.includeSubordinates),
        disabled: (__VLS_ctx.editMode),
    }));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.includeSubordinates),
            disabled: (__VLS_ctx.editMode),
        }], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = __VLS_11.slots.default;
    // @ts-ignore
    [includeSubordinates, includeSubordinates, editMode,];
    var __VLS_11;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
if (!__VLS_ctx.hideEdit) {
    var __VLS_14 = EditToggleButton_vue_1.default || EditToggleButton_vue_1.default;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        modelValue: (__VLS_ctx.editMode),
        disabled: (__VLS_ctx.isLocked),
    }));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.editMode),
            disabled: (__VLS_ctx.isLocked),
        }], __VLS_functionalComponentArgsRest(__VLS_15), false));
    var __VLS_19 = __VLS_17.slots.default;
    ((_a = __VLS_ctx.editLabel) !== null && _a !== void 0 ? _a : "Edit");
    // @ts-ignore
    [editMode, hideEdit, isLocked, editLabel,];
    var __VLS_17;
}
var __VLS_20 = PlainButton_vue_1.default || PlainButton_vue_1.default;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.isLocked) })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25;
var __VLS_26 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.addMode = !__VLS_ctx.addMode;
            // @ts-ignore
            [isLocked, addMode, addMode,];
        } });
var __VLS_27 = __VLS_23.slots.default;
(__VLS_ctx.addMode ? "Hide form" : "Add");
// @ts-ignore
[addMode,];
var __VLS_23;
var __VLS_24;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __typeProps: {},
});
exports.default = {};
