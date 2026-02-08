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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
;
var __VLS_ctx = {};
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ type: "button" }, { class: "border-input focus-visible:border-ring focus-visible:ring-ring/50 disabled:text-muted-foreground relative inline-flex items-center border px-3 py-2 text-sm font-medium transition-all outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 sm:px-2" }), { class: ([
        __VLS_ctx.start && 'rounded-l-md',
        __VLS_ctx.end && 'rounded-r-md',
        __VLS_ctx.top && 'rounded-t-md',
        __VLS_ctx.bottom && 'rounded-b-md',
        __VLS_ctx.active
            ? 'bg-army2 text-primary-foreground hover:bg-army2/90'
            : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    ]) }));
/** @type {__VLS_StyleScopedClasses['border-input']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:border-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-ring/50']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-[3px]']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-2']} */ ;
var __VLS_0 = {};
// @ts-ignore
var __VLS_1 = __VLS_0;
// @ts-ignore
[start, end, top, bottom, active,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    name: "ToolbarButton",
    props: {
        start: { type: Boolean, default: false },
        end: { type: Boolean, default: false },
        top: { type: Boolean, default: false },
        bottom: { type: Boolean, default: false },
        active: { type: Boolean, default: false },
    },
});
