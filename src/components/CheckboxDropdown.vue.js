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
var lucide_vue_next_1 = require("lucide-vue-next");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var vue_1 = require("vue");
var props = defineProps();
var selectedItems = defineModel({ required: true });
// Create a reactive checked state for each option that syncs with selectedItems array
function createCheckedModel(value) {
    return (0, vue_1.computed)({
        get: function () { return selectedItems.value.includes(value); },
        set: function (checked) {
            if (checked) {
                if (!selectedItems.value.includes(value)) {
                    selectedItems.value = __spreadArray(__spreadArray([], selectedItems.value, true), [value], false);
                }
            }
            else {
                selectedItems.value = selectedItems.value.filter(function (v) { return v !== value; });
            }
        },
    });
}
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenu | typeof __VLS_components.DropdownMenu} */
dropdown_menu_1.DropdownMenu;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuTrigger | typeof __VLS_components.DropdownMenuTrigger} */
dropdown_menu_1.DropdownMenuTrigger;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "group text-muted-foreground hover:text-foreground inline-flex items-center justify-center text-sm font-medium" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "group text-muted-foreground hover:text-foreground inline-flex items-center justify-center text-sm font-medium" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_12 = __VLS_10.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
var __VLS_13 = {};
(__VLS_ctx.label);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "bg-muted text-muted-foreground ml-1.5 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums" }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
(__VLS_ctx.selectedItems.length);
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.ChevronDown} */
lucide_vue_next_1.ChevronDown;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ class: "text-muted-foreground group-hover:text-foreground -mr-1 ml-1 size-5 shrink-0" }, { 'aria-hidden': "true" })));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground group-hover:text-foreground -mr-1 ml-1 size-5 shrink-0" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['-mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
// @ts-ignore
[label, selectedItems,];
var __VLS_10;
var __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuContent | typeof __VLS_components.DropdownMenuContent} */
dropdown_menu_1.DropdownMenuContent;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    align: "end",
}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
        align: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25 = __VLS_23.slots.default;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.options)); _i < _a.length; _i++) {
    var option = _a[_i][0];
    var __VLS_26 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
    dropdown_menu_1.DropdownMenuCheckboxItem;
    // @ts-ignore
    var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign({ 'onSelect': {} }, { key: (option.value), modelValue: (__VLS_ctx.createCheckedModel(option.value).value) })));
    var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { key: (option.value), modelValue: (__VLS_ctx.createCheckedModel(option.value).value) })], __VLS_functionalComponentArgsRest(__VLS_27), false));
    var __VLS_31 = void 0;
    var __VLS_32 = ({ select: {} },
        { onSelect: function () { } });
    var __VLS_33 = __VLS_29.slots.default;
    (option.label);
    // @ts-ignore
    [options, createCheckedModel,];
    var __VLS_29;
    var __VLS_30;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_23;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
