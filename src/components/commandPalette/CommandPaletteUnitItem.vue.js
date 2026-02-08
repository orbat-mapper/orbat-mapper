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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var props = defineProps();
var __VLS_ctx = __assign(__assign(__assign({}, {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex w-7 justify-center" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-7']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
if (__VLS_ctx.item.sidc) {
    var __VLS_0 = UnitSymbol_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ sidc: (__VLS_ctx.item.sidc), size: (20), 'aria-hidden': "true", modifiers: (__assign(__assign({}, __VLS_ctx.item.symbolOptions), { outlineColor: 'white', outlineWidth: 8 })) }, { class: "size-8" })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ sidc: (__VLS_ctx.item.sidc), size: (20), 'aria-hidden': "true", modifiers: (__assign(__assign({}, __VLS_ctx.item.symbolOptions), { outlineColor: 'white', outlineWidth: 8 })) }, { class: "size-8" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
}
if ((_a = __VLS_ctx.item._state) === null || _a === void 0 ? void 0 : _a.location) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "absolute -right-1 bottom-0 block translate-x-1/2 translate-y-1/2 transform rounded-full border-2 border-white" }));
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['-right-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)(__assign({ class: "block h-1.5 w-1.5 rounded-full bg-red-800" }));
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-800']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.p)(__assign({ class: "ml-3 flex-auto truncate" }));
__VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.item.highlight ? __VLS_ctx.item.highlight : __VLS_ctx.item.name) }), null, null);
/** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
if (__VLS_ctx.item.parent) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "flex text-xs opacity-80" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-80']} */ ;
    if (__VLS_ctx.item.parent.sidc) {
        var __VLS_5 = UnitSymbol_vue_1.default;
        // @ts-ignore
        var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ size: (12), sidc: (__VLS_ctx.item.parent.sidc), modifiers: (__assign(__assign({}, __VLS_ctx.item.parent.symbolOptions), { outlineColor: 'white', outlineWidth: 4 })) }, { class: "mr-1" })));
        var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ size: (12), sidc: (__VLS_ctx.item.parent.sidc), modifiers: (__assign(__assign({}, __VLS_ctx.item.parent.symbolOptions), { outlineColor: 'white', outlineWidth: 4 })) }, { class: "mr-1" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
    }
    (__VLS_ctx.item.parent.name);
}
// @ts-ignore
[item, item, item, item, item, item, item, item, item, item, item, item,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
