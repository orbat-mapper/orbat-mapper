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
var solid_1 = require("@heroicons/vue/24/solid");
var popover_1 = require("@/components/ui/popover");
var button_1 = require("@/components/ui/button");
var utils_1 = require("@/lib/utils");
var input_1 = require("@/components/ui/input");
var props = defineProps({
    label: String,
    description: String,
    items: { type: Array },
    values: { type: Array },
    extraClass: [String, Array, Object, Function, Boolean],
});
var selectedValue = defineModel();
var query = (0, vue_1.ref)("");
var open = (0, vue_1.ref)(false);
var computedValues = (0, vue_1.computed)(function () {
    if (props.items)
        return props.items;
    return (props.values || []).map(function (i) { return ({
        label: i,
        value: i,
    }); });
});
var filteredValues = (0, vue_1.computed)(function () {
    return query.value === ""
        ? computedValues.value
        : computedValues.value.filter(function (item) {
            return String(item.label).toLowerCase().includes(query.value.toLowerCase());
        });
});
var selectedLabel = (0, vue_1.computed)(function () {
    var found = computedValues.value.find(function (i) { return i.value === selectedValue.value; });
    return found ? found.label : "";
});
var handleSelect = function (value) {
    selectedValue.value = value;
    open.value = false;
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-col gap-1.5" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['peer-disabled:cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['peer-disabled:opacity-70']} */ ;
    (__VLS_ctx.label);
}
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
popover_1.Popover;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    open: (__VLS_ctx.open),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        open: (__VLS_ctx.open),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.PopoverTrigger | typeof __VLS_components.PopoverTrigger} */
popover_1.PopoverTrigger;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    asChild: true,
}));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11 = __VLS_9.slots.default;
var __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign(__assign({ variant: "outline", role: "combobox", 'aria-expanded': (__VLS_ctx.open) }, { class: "w-full justify-between" }), { class: (__VLS_ctx.extraClass) })));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign(__assign({ variant: "outline", role: "combobox", 'aria-expanded': (__VLS_ctx.open) }, { class: "w-full justify-between" }), { class: (__VLS_ctx.extraClass) })], __VLS_functionalComponentArgsRest(__VLS_13), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
var __VLS_17 = __VLS_15.slots.default;
(__VLS_ctx.selectedLabel || "Select...");
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.SelectorIcon} */
solid_1.ChevronUpDownIcon;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: "ml-2 h-4 w-4 shrink-0 opacity-50" })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: "ml-2 h-4 w-4 shrink-0 opacity-50" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
// @ts-ignore
[label, label, open, open, extraClass, selectedLabel,];
var __VLS_15;
// @ts-ignore
[];
var __VLS_9;
var __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.PopoverContent | typeof __VLS_components.PopoverContent} */
popover_1.PopoverContent;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23(__assign({ class: "w-[200px] p-0" }, { align: "start" })));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([__assign({ class: "w-[200px] p-0" }, { align: "start" })], __VLS_functionalComponentArgsRest(__VLS_24), false));
/** @type {__VLS_StyleScopedClasses['w-[200px]']} */ ;
/** @type {__VLS_StyleScopedClasses['p-0']} */ ;
var __VLS_28 = __VLS_26.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center border-b px-3" }, { 'cmk-input-wrapper': true }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
var __VLS_29;
/** @ts-ignore @type {typeof __VLS_components.Input} */
input_1.Input;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29(__assign(__assign({ modelValue: (__VLS_ctx.query) }, { class: "placeholder:text-muted-foreground flex h-11 w-full rounded-md border-none bg-transparent py-3 text-sm outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50" }), { placeholder: "Search..." })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign(__assign({ modelValue: (__VLS_ctx.query) }, { class: "placeholder:text-muted-foreground flex h-11 w-full rounded-md border-none bg-transparent py-3 text-sm outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50" }), { placeholder: "Search..." })], __VLS_functionalComponentArgsRest(__VLS_30), false));
/** @type {__VLS_StyleScopedClasses['placeholder:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-11']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border-none']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-0']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "max-h-[300px] overflow-x-hidden overflow-y-auto" }));
/** @type {__VLS_StyleScopedClasses['max-h-[300px]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
if (__VLS_ctx.filteredValues.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "py-6 text-center text-sm" }));
    /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
var _loop_1 = function (item) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.handleSelect(item.value);
            // @ts-ignore
            [query, filteredValues, filteredValues, handleSelect,];
        } }, { key: (item.value) }), { class: (__VLS_ctx.cn('hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50', __VLS_ctx.selectedValue === item.value ? 'bg-accent text-accent-foreground' : '')) }));
    var __VLS_34 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CheckIcon} */
    solid_1.CheckIcon;
    // @ts-ignore
    var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34(__assign({ class: (__VLS_ctx.cn('mr-2 h-4 w-4', __VLS_ctx.selectedValue === item.value ? 'opacity-100' : 'opacity-0')) })));
    var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([__assign({ class: (__VLS_ctx.cn('mr-2 h-4 w-4', __VLS_ctx.selectedValue === item.value ? 'opacity-100' : 'opacity-0')) })], __VLS_functionalComponentArgsRest(__VLS_35), false));
    (item.label);
    // @ts-ignore
    [utils_1.cn, utils_1.cn, selectedValue, selectedValue,];
};
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.filteredValues)); _i < _a.length; _i++) {
    var item = _a[_i][0];
    _loop_1(item);
}
// @ts-ignore
[];
var __VLS_26;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    props: {
        label: String,
        description: String,
        items: { type: Array },
        values: { type: Array },
        extraClass: [String, Array, Object, Function, Boolean],
    },
});
exports.default = {};
