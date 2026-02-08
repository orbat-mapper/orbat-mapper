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
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var button_1 = require("@/components/ui/button");
var props = withDefaults(defineProps(), {
    active: false,
    size: 24,
});
var __VLS_defaults = {
    active: false,
    size: 24,
};
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ type: "button", variant: "ghost", size: "icon" }, { class: ([__VLS_ctx.active ? 'invert' : '']) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ type: "button", variant: "ghost", size: "icon" }, { class: ([__VLS_ctx.active ? 'invert' : '']) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7 = NewMilitarySymbol_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign({ sidc: (__VLS_ctx.sidc), size: (__VLS_ctx.size) }, { class: "size-9" }), { options: (__assign(__assign({}, __VLS_ctx.symbolOptions), { square: true })) })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign({ sidc: (__VLS_ctx.sidc), size: (__VLS_ctx.size) }, { class: "size-9" }), { options: (__assign(__assign({}, __VLS_ctx.symbolOptions), { square: true })) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['size-9']} */ ;
var __VLS_12 = {};
// @ts-ignore
[active, sidc, size, symbolOptions,];
var __VLS_3;
// @ts-ignore
var __VLS_13 = __VLS_12;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
