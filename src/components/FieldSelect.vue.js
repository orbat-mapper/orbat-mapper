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
var select_1 = require("@/components/ui/select");
var field_1 = require("@/components/ui/field");
var vue_1 = require("vue");
var props = withDefaults(defineProps(), { size: "default" });
var selectedValue = defineModel({ required: false });
var id = (0, vue_1.useId)();
var __VLS_modelEmit;
var __VLS_defaults = { size: "default" };
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
    for: (__VLS_ctx.id),
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        for: (__VLS_ctx.id),
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
(__VLS_ctx.label);
// @ts-ignore
[id, label,];
var __VLS_10;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
select_1.Select;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    modelValue: (__VLS_ctx.selectedValue),
    id: __VLS_ctx.id,
}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.selectedValue),
        id: __VLS_ctx.id,
    }], __VLS_functionalComponentArgsRest(__VLS_14), false));
var __VLS_18 = __VLS_16.slots.default;
var __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
select_1.SelectTrigger;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_20), false));
var __VLS_24 = __VLS_22.slots.default;
var __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.SelectValue} */
select_1.SelectValue;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
// @ts-ignore
[id, selectedValue,];
var __VLS_22;
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
select_1.SelectContent;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35 = __VLS_33.slots.default;
if (__VLS_ctx.addNone) {
    var __VLS_36 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
    select_1.SelectItem;
    // @ts-ignore
    var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        value: (null),
    }));
    var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
            value: (null),
        }], __VLS_functionalComponentArgsRest(__VLS_37), false));
    var __VLS_41 = __VLS_39.slots.default;
    // @ts-ignore
    [addNone,];
    var __VLS_39;
}
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.items)); _i < _a.length; _i++) {
    var sideGroup = _a[_i][0];
    var __VLS_42 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
    select_1.SelectItem;
    // @ts-ignore
    var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        key: (sideGroup.value),
        value: (sideGroup.value),
    }));
    var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{
            key: (sideGroup.value),
            value: (sideGroup.value),
        }], __VLS_functionalComponentArgsRest(__VLS_43), false));
    var __VLS_47 = __VLS_45.slots.default;
    (sideGroup.label);
    // @ts-ignore
    [items,];
    var __VLS_45;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_33;
// @ts-ignore
[];
var __VLS_16;
if (__VLS_ctx.description || __VLS_ctx.$slots.description) {
    var __VLS_48 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
    field_1.FieldDescription;
    // @ts-ignore
    var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({}));
    var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_49), false));
    var __VLS_53 = __VLS_51.slots.default;
    var __VLS_54 = {};
    (__VLS_ctx.description);
    // @ts-ignore
    [description, description, $slots,];
    var __VLS_51;
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_55 = __VLS_54;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
