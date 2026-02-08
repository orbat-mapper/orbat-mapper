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
var utils_1 = require("@/lib/utils");
var separator_1 = require("@/components/ui/separator");
var props = defineProps();
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ 'data-slot': "field-separator", 'data-content': (!!__VLS_ctx.$slots.default) }, { class: (__VLS_ctx.cn('relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2', props.class)) }));
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Separator} */
separator_1.Separator;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "absolute inset-0 top-1/2" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "absolute inset-0 top-1/2" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
if (__VLS_ctx.$slots.default) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "bg-background text-muted-foreground relative mx-auto block w-fit px-2" }, { 'data-slot': "field-separator-content" }));
    /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    var __VLS_5 = {};
}
// @ts-ignore
var __VLS_6 = __VLS_5;
// @ts-ignore
[$slots, $slots, utils_1.cn,];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
