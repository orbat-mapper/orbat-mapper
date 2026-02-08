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
var reka_ui_1 = require("reka-ui");
var solid_1 = require("@heroicons/vue/20/solid");
var MilSymbol_vue_1 = require("@/components/MilSymbol.vue");
var core_1 = require("@vueuse/core");
var SymbolFillColorSelect_vue_1 = require("@/components/SymbolFillColorSelect.vue");
var button_1 = require("@/components/ui/button");
var label_1 = require("@/components/ui/label");
var props = withDefaults(defineProps(), {
    compact: false,
});
var data = defineModel({ default: "3" });
var fillColorValue = defineModel("fillColor");
var sidItems = [
    {
        code: "3",
        text: "Friend",
    },
    {
        code: "6",
        text: "Hostile",
    },
    {
        code: "4",
        text: "Neutral",
    },
    {
        code: "1",
        text: "Unknown",
    },
    {
        code: "0",
        text: "Pending",
    },
    {
        code: "2",
        text: "Assumed Friend",
    },
    {
        code: "5",
        text: "Suspect",
    },
].map(addSymbol);
function addSymbol(_a) {
    var code = _a.code, text = _a.text;
    return {
        code: code,
        text: text,
        sidc: "100" + code + 10 + "00" + "00" + "0000000000",
    };
}
var _a = (0, core_1.useToggle)(false), showAll = _a[0], toggleShowAll = _a[1];
var items = (0, vue_1.computed)(function () {
    return showAll.value
        ? sidItems
        : sidItems.filter(function (e) { return ["1", "3", "6", "4", "7"].includes(e.code); });
});
var __VLS_defaultModels = {
    'modelValue': "3",
};
var __VLS_modelEmit;
var __VLS_defaults = {
    compact: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.RadioGroupRoot | typeof __VLS_components.RadioGroupRoot} */
reka_ui_1.RadioGroupRoot;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.data),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.data),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
label_1.Label;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ class: "text-heading text-sm font-medium" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ class: "text-heading text-sm font-medium" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
/** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_11 = __VLS_9.slots.default;
// @ts-ignore
[data,];
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-1 grid gap-x-4 gap-y-4" }, { class: (__VLS_ctx.compact ? 'grid-cols-2' : 'sm:grid-cols-4') }));
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-x-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-y-4']} */ ;
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.items)); _i < _b.length; _i++) {
    var sid = _b[_i][0];
    var __VLS_12 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem | typeof __VLS_components.RadioGroupItem} */
    reka_ui_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        key: (sid.code),
        value: (sid.code),
        as: "template",
    }));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{
            key: (sid.code),
            value: (sid.code),
            as: "template",
        }], __VLS_functionalComponentArgsRest(__VLS_13), false));
    var __VLS_17 = __VLS_15.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "data-[state=checked]:border-primary data-[state=checked]:ring-primary dark:bg-input/30 border-input relative flex cursor-pointer rounded-lg border bg-transparent p-4 shadow-xs focus:outline-hidden data-[state=checked]:ring-2" }));
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:border-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:ring-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-input/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:ring-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "flex flex-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "flex w-full flex-col items-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-heading block text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (sid.text);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "mt-2 flex" }));
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    var __VLS_18 = MilSymbol_vue_1.default;
    // @ts-ignore
    var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        sidc: (sid.sidc),
        size: (32),
        modifiers: ({ outlineColor: 'white', outlineWidth: 4 }),
    }));
    var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{
            sidc: (sid.sidc),
            size: (32),
            modifiers: ({ outlineColor: 'white', outlineWidth: 4 }),
        }], __VLS_functionalComponentArgsRest(__VLS_19), false));
    var __VLS_23 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CheckCircleIcon} */
    solid_1.CheckCircleIcon;
    // @ts-ignore
    var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23(__assign({ class: "text-primary invisible absolute top-1 right-1 h-5 w-5 data-[state=checked]:visible" }, { 'aria-hidden': "true" })));
    var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([__assign({ class: "text-primary invisible absolute top-1 right-1 h-5 w-5 data-[state=checked]:visible" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_24), false));
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:visible']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)(__assign({ class: "data-[state=checked]:border-primary pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent" }, { 'aria-hidden': "true" }));
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:border-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['-inset-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
    // @ts-ignore
    [compact, items,];
    var __VLS_15;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-2 flex justify-end" }));
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
var __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_29), false));
var __VLS_33;
var __VLS_34 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleShowAll();
            // @ts-ignore
            [toggleShowAll,];
        } });
var __VLS_35 = __VLS_31.slots.default;
if (__VLS_ctx.showAll) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        'aria-hidden': "true",
    });
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        'aria-hidden': "true",
    });
}
// @ts-ignore
[showAll,];
var __VLS_31;
var __VLS_32;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-0 grid gap-4" }, { class: (__VLS_ctx.compact ? 'grid-cols-1' : 'sm:grid-cols-2') }));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_36 = SymbolFillColorSelect_vue_1.default;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.fillColorValue),
    sid: (__VLS_ctx.data),
}));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.fillColorValue),
        sid: (__VLS_ctx.data),
    }], __VLS_functionalComponentArgsRest(__VLS_37), false));
// @ts-ignore
[data, compact, fillColorValue,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
