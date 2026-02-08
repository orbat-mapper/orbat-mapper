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
var solid_1 = require("@heroicons/vue/20/solid");
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var props = defineProps();
var emit = defineEmits(["toggle"]);
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }, { style: ({ paddingLeft: __VLS_ctx.level * 1.5 + 'rem' }) }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "size-6" }));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
if (__VLS_ctx.canExpand) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.canExpand))
                return;
            __VLS_ctx.emit('toggle');
            // @ts-ignore
            [level, canExpand, emit,];
        } }, { type: "button" }));
    var __VLS_0 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
    solid_1.ChevronRightIcon;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground group-hover:text-foreground size-6 transform transition-transform" }, { class: ({
            'rotate-90': __VLS_ctx.expanded,
        }) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground group-hover:text-foreground size-6 transform transition-transform" }, { class: ({
                'rotate-90': __VLS_ctx.expanded,
            }) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
}
if (__VLS_ctx.sidc) {
    var __VLS_5 = UnitSymbol_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign(__assign({ sidc: (__VLS_ctx.sidc) }, { class: "max-h-8" }), { size: (20), options: (__assign({ outlineWidth: 8, outlineColor: 'rgba(255,255,255,0.80)' }, __VLS_ctx.symbolOptions)) })));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign(__assign({ sidc: (__VLS_ctx.sidc) }, { class: "max-h-8" }), { size: (20), options: (__assign({ outlineWidth: 8, outlineColor: 'rgba(255,255,255,0.80)' }, __VLS_ctx.symbolOptions)) })], __VLS_functionalComponentArgsRest(__VLS_6), false));
    /** @type {__VLS_StyleScopedClasses['max-h-8']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: ({ 'font-bold': __VLS_ctx.sidc === undefined }) }));
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
(__VLS_ctx.value);
// @ts-ignore
[expanded, sidc, sidc, sidc, symbolOptions, value,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
