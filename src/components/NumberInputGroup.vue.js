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
var number_field_1 = require("@/components/ui/number-field");
var field_1 = require("@/components/ui/field");
var __VLS_props = defineProps();
var value = defineModel();
var inputId = (0, vue_1.useId)();
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
field_1.Field;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
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
(__VLS_ctx.label);
// @ts-ignore
[inputId, label,];
var __VLS_10;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.NumberField | typeof __VLS_components.NumberField} */
number_field_1.NumberField;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    id: (__VLS_ctx.inputId),
    modelValue: (__VLS_ctx.value),
    min: __VLS_ctx.min,
    max: __VLS_ctx.max,
    step: __VLS_ctx.step,
    disabled: __VLS_ctx.disabled,
}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
        id: (__VLS_ctx.inputId),
        modelValue: (__VLS_ctx.value),
        min: __VLS_ctx.min,
        max: __VLS_ctx.max,
        step: __VLS_ctx.step,
        disabled: __VLS_ctx.disabled,
    }], __VLS_functionalComponentArgsRest(__VLS_14), false));
var __VLS_18 = __VLS_16.slots.default;
var __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.NumberFieldContent | typeof __VLS_components.NumberFieldContent} */
number_field_1.NumberFieldContent;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_20), false));
var __VLS_24 = __VLS_22.slots.default;
var __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.NumberFieldDecrement} */
number_field_1.NumberFieldDecrement;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.NumberFieldInput} */
number_field_1.NumberFieldInput;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    id: (__VLS_ctx.inputId),
}));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{
        id: (__VLS_ctx.inputId),
    }], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.NumberFieldIncrement} */
number_field_1.NumberFieldIncrement;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({}));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_36), false));
// @ts-ignore
[inputId, inputId, value, min, max, step, disabled,];
var __VLS_22;
// @ts-ignore
[];
var __VLS_16;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
