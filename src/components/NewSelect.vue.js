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
var InputGroupTemplate_vue_1 = require("./InputGroupTemplate.vue");
var vue_1 = require("vue");
var select_1 = require("@/components/ui/select");
var props = withDefaults(defineProps(), { size: "default" });
var selectedValue = defineModel({ required: false });
var computedValues = (0, vue_1.computed)(function () {
    if (props.items)
        return props.items;
    return (props.values || []).map(function (i) { return ({
        label: i,
        value: i,
        disabled: undefined,
    }); });
});
var __VLS_modelEmit;
var __VLS_defaults = { size: "default" };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: (__VLS_ctx.label),
    description: (__VLS_ctx.description),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: (__VLS_ctx.label),
        description: (__VLS_ctx.description),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
{
    var __VLS_7 = __VLS_3.slots.default;
    var id = __VLS_vSlot(__VLS_7)[0].id;
    var __VLS_8 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
    select_1.Select;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.selectedValue),
        size: __VLS_ctx.size,
        id: (id),
    }));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.selectedValue),
            size: __VLS_ctx.size,
            id: (id),
        }], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = __VLS_11.slots.default;
    var __VLS_14 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
    select_1.SelectTrigger;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ class: "w-full" })));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    var __VLS_19 = __VLS_17.slots.default;
    var __VLS_20 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
    select_1.SelectValue;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        placeholder: __VLS_ctx.placeholder,
    }));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
            placeholder: __VLS_ctx.placeholder,
        }], __VLS_functionalComponentArgsRest(__VLS_21), false));
    // @ts-ignore
    [label, description, selectedValue, size, placeholder,];
    var __VLS_17;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
    select_1.SelectContent;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ class: "border-border" })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ class: "border-border" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
    var __VLS_30 = __VLS_28.slots.default;
    if (__VLS_ctx.addNone) {
        var __VLS_31 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
            value: (null),
        }));
        var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{
                value: (null),
            }], __VLS_functionalComponentArgsRest(__VLS_32), false));
        var __VLS_36 = __VLS_34.slots.default;
        // @ts-ignore
        [addNone,];
        var __VLS_34;
    }
    for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.computedValues)); _i < _a.length; _i++) {
        var _b = _a[_i][0], value = _b.value, label = _b.label, disabled = _b.disabled;
        var __VLS_37 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            value: (value),
            key: (value),
            disabled: disabled,
        }));
        var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{
                value: (value),
                key: (value),
                disabled: disabled,
            }], __VLS_functionalComponentArgsRest(__VLS_38), false));
        var __VLS_42 = __VLS_40.slots.default;
        (label);
        // @ts-ignore
        [computedValues,];
        var __VLS_40;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_28;
    // @ts-ignore
    [];
    var __VLS_11;
    // @ts-ignore
    [];
}
{
    var __VLS_43 = __VLS_3.slots.hint;
    var __VLS_44 = {};
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_45 = __VLS_44;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
