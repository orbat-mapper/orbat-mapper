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
var solid_1 = require("@heroicons/vue/24/solid");
var button_1 = require("@/components/ui/button");
var props = withDefaults(defineProps(), { simple: false });
var emit = defineEmits(["add"]);
var __VLS_defaults = { simple: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center" }));
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
if (!__VLS_ctx.simple) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)(__assign({ class: "text-muted-foreground mx-auto h-12 w-12" }, { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", 'aria-hidden': "true" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'vector-effect': "non-scaling-stroke",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "text-foreground mt-2 text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-1 text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-6" }));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClick': {} }, { type: "button" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.$emit('add');
            // @ts-ignore
            [simple, $emit,];
        } });
var __VLS_7 = __VLS_3.slots.default;
var __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.PlusIcon} */
solid_1.PlusIcon;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign({ class: "size-4" }, { 'aria-hidden': "true" })));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ class: "size-4" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
