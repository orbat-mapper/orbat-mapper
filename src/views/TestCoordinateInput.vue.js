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
var CoordinateInput_vue_1 = require("@/components/CoordinateInput.vue");
var vue_1 = require("vue");
var utils_1 = require("@/geo/utils");
var InputGroupTemplate_vue_1 = require("@/components/InputGroupTemplate.vue");
var position = (0, vue_1.ref)([13.369, 37.598]);
var format = (0, vue_1.ref)("LonLat");
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 space-y-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-8" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
var __VLS_0 = CoordinateInput_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ modelValue: (__VLS_ctx.position), format: (__VLS_ctx.format) }, { class: "max-w-sm" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.position), format: (__VLS_ctx.format) }, { class: "max-w-sm" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
var __VLS_5 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    label: "Label",
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        label: "Label",
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10 = __VLS_8.slots.default;
var __VLS_11 = CoordinateInput_vue_1.default;
// @ts-ignore
var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11(__assign({ 'onUpdate:format': {} }, { modelValue: (__VLS_ctx.position), format: (__VLS_ctx.format) })));
var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([__assign({ 'onUpdate:format': {} }, { modelValue: (__VLS_ctx.position), format: (__VLS_ctx.format) })], __VLS_functionalComponentArgsRest(__VLS_12), false));
var __VLS_16;
var __VLS_17 = ({ 'update:format': {} },
    { 'onUpdate:format': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            console.log('update format to', $event);
            // @ts-ignore
            [position, position, format, format,];
        } });
var __VLS_14;
var __VLS_15;
// @ts-ignore
[];
var __VLS_8;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
(__VLS_ctx.position);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
(__VLS_ctx.formatPosition(__VLS_ctx.position, { format: "DecimalDegrees" }));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
(__VLS_ctx.formatPosition(__VLS_ctx.position, { format: "DegreeMinuteSeconds" }));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
(__VLS_ctx.formatPosition(__VLS_ctx.position, { format: "MGRS" }));
// @ts-ignore
[position, position, position, position, utils_1.formatPosition, utils_1.formatPosition, utils_1.formatPosition,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
