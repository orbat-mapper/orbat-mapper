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
var core_1 = require("@vueuse/core");
var reka_ui_1 = require("reka-ui");
var utils_1 = require("@/lib/utils");
var props = defineProps();
var emits = defineEmits();
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var forwarded = (0, reka_ui_1.useForwardPropsEmits)(delegatedProps, emits);
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.SliderRoot | typeof __VLS_components.SliderRoot} */
reka_ui_1.SliderRoot;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ dataSlot: "slider" }, { class: (__VLS_ctx.cn('relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col', props.class)) }), (__VLS_ctx.forwarded))));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "slider" }, { class: (__VLS_ctx.cn('relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col', props.class)) }), (__VLS_ctx.forwarded))], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
{
    var __VLS_6 = __VLS_3.slots.default;
    var modelValue = __VLS_vSlot(__VLS_6)[0].modelValue;
    var __VLS_7 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SliderTrack | typeof __VLS_components.SliderTrack} */
    reka_ui_1.SliderTrack;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ dataSlot: "slider-track" }, { class: "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ dataSlot: "slider-track" }, { class: "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['grow']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[orientation=horizontal]:h-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[orientation=horizontal]:w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[orientation=vertical]:h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[orientation=vertical]:w-1.5']} */ ;
    var __VLS_12 = __VLS_10.slots.default;
    var __VLS_13 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SliderRange} */
    reka_ui_1.SliderRange;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ dataSlot: "slider-range" }, { class: "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ dataSlot: "slider-range" }, { class: "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    /** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[orientation=horizontal]:h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[orientation=vertical]:w-full']} */ ;
    // @ts-ignore
    [utils_1.cn, forwarded,];
    var __VLS_10;
    for (var _i = 0, _a = __VLS_vFor((modelValue)); _i < _a.length; _i++) {
        var _b = _a[_i], _ = _b[0], key = _b[1];
        var __VLS_18 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SliderThumb} */
        reka_ui_1.SliderThumb;
        // @ts-ignore
        var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ key: (key), dataSlot: "slider-thumb" }, { class: "border-primary ring-ring/50 bg-background block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" })));
        var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ key: (key), dataSlot: "slider-thumb" }, { class: "border-primary ring-ring/50 bg-background block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
        /** @type {__VLS_StyleScopedClasses['border-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-ring/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-[color,box-shadow]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:outline-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:pointer-events-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
