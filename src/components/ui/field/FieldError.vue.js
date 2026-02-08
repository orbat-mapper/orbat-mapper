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
var vue_1 = require("vue");
var utils_1 = require("@/lib/utils");
var props = defineProps();
var content = (0, vue_1.computed)(function () {
    if (!props.errors || props.errors.length === 0)
        return null;
    var uniqueErrors = __spreadArray([], new Map(props.errors.filter(Boolean).map(function (error) {
        var message = typeof error === "string" ? error : error === null || error === void 0 ? void 0 : error.message;
        return [message, error];
    })).values(), true);
    if (uniqueErrors.length === 1 && uniqueErrors[0]) {
        return typeof uniqueErrors[0] === "string"
            ? uniqueErrors[0]
            : uniqueErrors[0].message;
    }
    return uniqueErrors.map(function (error) {
        return typeof error === "string" ? error : error === null || error === void 0 ? void 0 : error.message;
    });
});
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.$slots.default || __VLS_ctx.content) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ role: "alert", 'data-slot': "field-error" }, { class: (__VLS_ctx.cn('text-destructive text-sm font-normal', props.class)) }));
    if (__VLS_ctx.$slots.default) {
        var __VLS_0 = {};
    }
    else if (typeof __VLS_ctx.content === 'string') {
        (__VLS_ctx.content);
    }
    else if (Array.isArray(__VLS_ctx.content)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "ml-4 flex list-disc flex-col gap-1" }));
        /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['list-disc']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.content)); _i < _a.length; _i++) {
            var _b = _a[_i], error = _b[0], index = _b[1];
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (index),
            });
            (error);
            // @ts-ignore
            [$slots, $slots, content, content, content, content, content, utils_1.cn,];
        }
    }
}
// @ts-ignore
var __VLS_1 = __VLS_0;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
