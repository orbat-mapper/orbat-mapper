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
var field_1 = require("@/components/ui/field");
var radio_group_1 = require("@/components/ui/radio-group");
var __VLS_props = defineProps();
var selected = defineModel();
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.FieldGroup | typeof __VLS_components.FieldGroup} */
field_1.FieldGroup;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
radio_group_1.RadioGroup;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ modelValue: (__VLS_ctx.selected) }, { class: "gap-1" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.selected) }, { class: "gap-1" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
var __VLS_12 = __VLS_10.slots.default;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.items)); _i < _a.length; _i++) {
    var item = _a[_i][0];
    var __VLS_13 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        key: (item.value),
        for: (item.value),
    }));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
            key: (item.value),
            for: (item.value),
        }], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_18 = __VLS_16.slots.default;
    var __VLS_19 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
    field_1.Field;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        orientation: "horizontal",
    }));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
            orientation: "horizontal",
        }], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = __VLS_22.slots.default;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
    radio_group_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        id: (item.value),
        value: (item.value),
    }));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{
            id: (item.value),
            value: (item.value),
        }], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
    field_1.FieldContent;
    // @ts-ignore
    var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
    var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
    var __VLS_35 = __VLS_33.slots.default;
    var __VLS_36 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
    field_1.FieldTitle;
    // @ts-ignore
    var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
    var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_37), false));
    var __VLS_41 = __VLS_39.slots.default;
    (item.name);
    // @ts-ignore
    [selected, items,];
    var __VLS_39;
    var __VLS_42 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
    field_1.FieldDescription;
    // @ts-ignore
    var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({}));
    var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_43), false));
    var __VLS_47 = __VLS_45.slots.default;
    (item.description);
    // @ts-ignore
    [];
    var __VLS_45;
    // @ts-ignore
    [];
    var __VLS_33;
    // @ts-ignore
    [];
    var __VLS_22;
    // @ts-ignore
    [];
    var __VLS_16;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_10;
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
