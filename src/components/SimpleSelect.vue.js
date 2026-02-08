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
var field_1 = require("@/components/ui/field");
var native_select_1 = require("@/components/ui/native-select");
var props = withDefaults(defineProps(), {});
var selectedValue = defineModel({ required: false });
var computedValues = (0, vue_1.computed)(function () {
    if (props.items)
        return props.items;
    return (props.values || []).map(function (i) { return ({
        label: i,
        value: i,
    }); });
});
var __VLS_modelEmit;
var __VLS_defaults = {};
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
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13 = {};
(__VLS_ctx.label);
// @ts-ignore
[label,];
var __VLS_10;
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.NativeSelect | typeof __VLS_components.NativeSelect} */
native_select_1.NativeSelect;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.selectedValue),
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.selectedValue),
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
var __VLS_20 = __VLS_18.slots.default;
if (__VLS_ctx.addNone) {
    var __VLS_21 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.NativeSelectOption | typeof __VLS_components.NativeSelectOption} */
    native_select_1.NativeSelectOption;
    // @ts-ignore
    var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        value: (null),
    }));
    var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{
            value: (null),
        }], __VLS_functionalComponentArgsRest(__VLS_22), false));
    var __VLS_26 = __VLS_24.slots.default;
    // @ts-ignore
    [selectedValue, addNone,];
    var __VLS_24;
}
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.computedValues)); _i < _a.length; _i++) {
    var val = _a[_i][0];
    var __VLS_27 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.NativeSelectOption | typeof __VLS_components.NativeSelectOption} */
    native_select_1.NativeSelectOption;
    // @ts-ignore
    var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        value: (val.value),
        key: (val.value),
    }));
    var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([{
            value: (val.value),
            key: (val.value),
        }], __VLS_functionalComponentArgsRest(__VLS_28), false));
    var __VLS_32 = __VLS_30.slots.default;
    (val.label);
    // @ts-ignore
    [computedValues,];
    var __VLS_30;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_18;
if (__VLS_ctx.description || __VLS_ctx.$slots.description) {
    var __VLS_33 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
    field_1.FieldDescription;
    // @ts-ignore
    var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({}));
    var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_34), false));
    var __VLS_38 = __VLS_36.slots.default;
    var __VLS_39 = {};
    (__VLS_ctx.description);
    // @ts-ignore
    [description, description, $slots,];
    var __VLS_36;
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13, __VLS_40 = __VLS_39;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
