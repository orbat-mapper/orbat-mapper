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
var MilSymbol_vue_1 = require("./MilSymbol.vue");
var props = defineProps();
var __VLS_ctx = __assign(__assign(__assign({}, {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-10 w-10 shrink-0" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
var __VLS_0 = MilSymbol_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ size: (20), sidc: (__VLS_ctx.unit.sidc) }, { class: "inline self-center" }), { modifiers: (__VLS_ctx.unit.symbolOptions) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ size: (20), sidc: (__VLS_ctx.unit.sidc) }, { class: "inline self-center" }), { modifiers: (__VLS_ctx.unit.symbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['self-center']} */ ;
if (__VLS_ctx.unit.highlight) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p)({});
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.unit.highlight) }), null, null);
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.unit.name);
}
if (__VLS_ctx.unit.parent) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground flex self-start text-xs" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['self-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    var __VLS_5 = MilSymbol_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ size: (12), sidc: (__VLS_ctx.unit.parent.sidc), modifiers: (__VLS_ctx.unit.parent.symbolOptions) }, { class: "mr-1 opacity-80" })));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ size: (12), sidc: (__VLS_ctx.unit.parent.sidc), modifiers: (__VLS_ctx.unit.parent.symbolOptions) }, { class: "mr-1 opacity-80" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
    /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-80']} */ ;
    (__VLS_ctx.unit.parent.name);
}
// @ts-ignore
[unit, unit, unit, unit, unit, unit, unit, unit, unit,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
