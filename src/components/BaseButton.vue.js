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
var index_js_1 = require("@/components/ui/button/index.js");
var props = withDefaults(defineProps(), {
    primary: false,
    secondary: false,
    small: false,
    large: false,
    huge: false,
});
var __VLS_defaults = {
    primary: false,
    secondary: false,
    small: false,
    large: false,
    huge: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
index_js_1.Button;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    variant: (__VLS_ctx.primary ? 'default' : __VLS_ctx.secondary ? 'secondary' : 'outline'),
    size: (__VLS_ctx.small ? 'sm' : __VLS_ctx.large ? 'lg' : __VLS_ctx.huge ? 'lg' : undefined),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        variant: (__VLS_ctx.primary ? 'default' : __VLS_ctx.secondary ? 'secondary' : 'outline'),
        size: (__VLS_ctx.small ? 'sm' : __VLS_ctx.large ? 'lg' : __VLS_ctx.huge ? 'lg' : undefined),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7 = {};
// @ts-ignore
[primary, secondary, small, large, huge,];
var __VLS_3;
// @ts-ignore
var __VLS_8 = __VLS_7;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
