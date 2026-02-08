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
var tzdb_1 = require("@vvo/tzdb");
var SimpleSelect_vue_1 = require("./SimpleSelect.vue");
var militaryTimeZones_1 = require("@/utils/militaryTimeZones");
var tzValue = defineModel({ default: "UTC" });
var timeZonesNamesWithUtc = __spreadArray(__spreadArray(__spreadArray([], tzdb_1.timeZonesNames, true), ["UTC"], false), militaryTimeZones_1.MILITARY_TIME_ZONE_NAMES, true);
var __VLS_defaultModels = {
    'modelValue': "UTC",
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    values: (__VLS_ctx.timeZonesNamesWithUtc),
    modelValue: (__VLS_ctx.tzValue),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        values: (__VLS_ctx.timeZonesNamesWithUtc),
        modelValue: (__VLS_ctx.tzValue),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_3;
// @ts-ignore
[timeZonesNamesWithUtc, tzValue,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
