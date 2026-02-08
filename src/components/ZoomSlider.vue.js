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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var utils_1 = require("@/lib/utils");
var reka_ui_1 = require("reka-ui");
var vue_1 = require("vue");
var props = defineProps();
var emits = defineEmits();
var delegatedProps = (0, vue_1.computed)(function () {
    var _ = props.class, delegated = __rest(props, ["class"]);
    return delegated;
});
var forwarded = (0, reka_ui_1.useForwardPropsEmits)(delegatedProps, emits);
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.SliderRoot | typeof __VLS_components.SliderRoot} */
reka_ui_1.SliderRoot;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: (__VLS_ctx.cn('relative flex w-full touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2 data-[orientation=vertical]:flex-col', props.class)) }, (__VLS_ctx.forwarded))));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: (__VLS_ctx.cn('relative flex w-full touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2 data-[orientation=vertical]:flex-col', props.class)) }, (__VLS_ctx.forwarded))], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.SliderTrack | typeof __VLS_components.SliderTrack} */
reka_ui_1.SliderTrack;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "bg-secondary relative h-2 w-full grow overflow-hidden rounded-full data-[orientation=vertical]:w-2" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "bg-secondary relative h-2 w-full grow overflow-hidden rounded-full data-[orientation=vertical]:w-2" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['bg-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['grow']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[orientation=vertical]:w-2']} */ ;
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.SliderRange} */
reka_ui_1.SliderRange;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ class: "bg-primary absolute h-full data-[orientation=vertical]:w-full" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ class: "bg-primary absolute h-full data-[orientation=vertical]:w-full" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
/** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[orientation=vertical]:w-full']} */ ;
// @ts-ignore
[utils_1.cn, forwarded,];
var __VLS_10;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.modelValue)); _i < _a.length; _i++) {
    var _b = _a[_i], _ = _b[0], key = _b[1];
    var __VLS_18 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SliderThumb | typeof __VLS_components.SliderThumb} */
    reka_ui_1.SliderThumb;
    // @ts-ignore
    var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ key: (key) }, { class: "border-primary bg-background ring-offset-background focus-visible:ring-ring flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 text-center text-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" })));
    var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ key: (key) }, { class: "border-primary bg-background ring-offset-background focus-visible:ring-ring flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 text-center text-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
    /** @type {__VLS_StyleScopedClasses['border-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-offset-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-ring']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-offset-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:outline-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
    var __VLS_23 = __VLS_21.slots.default;
    (_);
    // @ts-ignore
    [modelValue,];
    var __VLS_21;
    // @ts-ignore
    [];
}
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
