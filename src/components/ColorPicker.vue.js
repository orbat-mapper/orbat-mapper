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
var reka_ui_1 = require("reka-ui");
var vue_1 = require("vue");
var colors_1 = require("./colors");
var props = withDefaults(defineProps(), {
    showNone: false,
});
var selectedColor = defineModel({ default: colors_1.defaultColors[1].selectedColor });
var $colors = (0, vue_1.computed)(function () {
    return props.showNone
        ? __spreadArray([
            {
                name: "None",
                value: null,
                bgColor: "bg-background",
                selectedColor: "ring-black",
            }
        ], colors_1.defaultColors, true) : colors_1.defaultColors;
});
var __VLS_defaultModels = {
    'modelValue': colors_1.defaultColors[1].selectedColor,
};
var __VLS_modelEmit;
var __VLS_defaults = {
    showNone: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.RadioGroupRoot | typeof __VLS_components.RadioGroupRoot} */
reka_ui_1.RadioGroupRoot;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.selectedColor),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.selectedColor),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
if (__VLS_ctx.label || __VLS_ctx.$slots.label) {
    var __VLS_7 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    reka_ui_1.Label;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "mb-4 block text-sm leading-6 font-medium" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "mb-4 block text-sm leading-6 font-medium" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    var __VLS_12 = __VLS_10.slots.default;
    var __VLS_13 = {};
    (__VLS_ctx.label);
    // @ts-ignore
    [selectedColor, label, label, $slots,];
    var __VLS_10;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.$colors)); _i < _a.length; _i++) {
    var color = _a[_i][0];
    var __VLS_15 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem | typeof __VLS_components.RadioGroupItem} */
    reka_ui_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ key: (color.name), value: (color.value) }, { class: ([
            color.selectedColor,
            'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-hidden',
            'data-[state=checked]:ring-2 focus:data-[state=checked]:ring-3 focus:data-[state=checked]:ring-offset-1',
        ]) })));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ key: (color.name), value: (color.value) }, { class: ([
                color.selectedColor,
                'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-hidden',
                'data-[state=checked]:ring-2 focus:data-[state=checked]:ring-3 focus:data-[state=checked]:ring-offset-1',
            ]) })], __VLS_functionalComponentArgsRest(__VLS_16), false));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['-m-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:ring-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:data-[state=checked]:ring-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:data-[state=checked]:ring-offset-1']} */ ;
    var __VLS_20 = __VLS_18.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    (color.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ 'aria-hidden': "true" }, { class: ([
            color.bgColor,
            'border-opacity-10 flex h-7 w-7 items-center justify-center rounded-full border border-black',
        ]) }));
    /** @type {__VLS_StyleScopedClasses['border-opacity-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-black']} */ ;
    if (!color.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [$colors,];
    var __VLS_18;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
