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
var props = defineProps();
var __VLS_ctx = __assign(__assign(__assign({}, {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.media) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "group @-lg:aspect-16/5 relative -mx-4 -mt-4 aspect-16/9" }));
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['@-lg:aspect-16/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['-mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['aspect-16/9']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)(__assign(__assign({ draggable: "false" }, { class: "h-full w-full object-cover" }), { src: (__VLS_ctx.media.url), alt: (__VLS_ctx.media.caption) }));
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "bg-background/75 text-foreground absolute right-0 bottom-0 left-0 hidden px-2 py-1 text-xs group-hover:block" }));
    /** @type {__VLS_StyleScopedClasses['bg-background/75']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:block']} */ ;
    if (__VLS_ctx.media.creditsUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: (__VLS_ctx.media.creditsUrl), target: "_blank" }, { class: "hover:underline" }));
        /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
        (__VLS_ctx.media.credits);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.media.credits);
    }
}
// @ts-ignore
[media, media, media, media, media, media, media,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
