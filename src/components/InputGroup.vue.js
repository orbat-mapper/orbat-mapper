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
var vue_1 = require("vue");
var field_1 = require("@/components/ui/field");
var input_1 = require("@/components/ui/input");
var utils_ts_1 = require("@/lib/utils.ts");
var props = defineProps();
var inputValue = defineModel();
defineOptions({
    inheritAttrs: false,
});
var inputId = (_a = props.id) !== null && _a !== void 0 ? _a : (0, vue_1.useId)();
(0, vue_1.onMounted)(function () {
    var _a;
    if (props.autofocus) {
        (_a = document.getElementById(inputId)) === null || _a === void 0 ? void 0 : _a.focus();
    }
});
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
field_1.Field;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: (__VLS_ctx.cn('group', props.class)) }, { dataDisabled: (__VLS_ctx.disabled) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: (__VLS_ctx.cn('group', props.class)) }, { dataDisabled: (__VLS_ctx.disabled) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
if (__VLS_ctx.label || __VLS_ctx.$slots.label) {
    var __VLS_7 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        for: (__VLS_ctx.inputId),
    }));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
            for: (__VLS_ctx.inputId),
        }], __VLS_functionalComponentArgsRest(__VLS_8), false));
    var __VLS_12 = __VLS_10.slots.default;
    var __VLS_13 = {};
    (__VLS_ctx.label);
    // @ts-ignore
    [utils_ts_1.cn, disabled, label, label, $slots, inputId,];
    var __VLS_10;
}
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.Input} */
input_1.Input;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    type: "text",
    modelValue: (__VLS_ctx.inputValue),
    id: (__VLS_ctx.inputId),
    disabled: (__VLS_ctx.disabled),
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        type: "text",
        modelValue: (__VLS_ctx.inputValue),
        id: (__VLS_ctx.inputId),
        disabled: (__VLS_ctx.disabled),
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
(__VLS_ctx.$attrs);
if (__VLS_ctx.description || __VLS_ctx.$slots.description) {
    var __VLS_20 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
    field_1.FieldDescription;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_21), false));
    var __VLS_25 = __VLS_23.slots.default;
    var __VLS_26 = {};
    (__VLS_ctx.description);
    // @ts-ignore
    [disabled, $slots, inputId, inputValue, $attrs, description, description,];
    var __VLS_23;
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13, __VLS_27 = __VLS_26;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
