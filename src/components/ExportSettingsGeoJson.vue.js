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
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var props = defineProps();
var settings = defineModel({ required: true });
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_0 = InputCheckbox_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "Include units",
    description: "Units with a location at current scenario time",
    modelValue: (__VLS_ctx.settings.includeUnits),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: "Include units",
        description: "Units with a location at current scenario time",
        modelValue: (__VLS_ctx.settings.includeUnits),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = InputCheckbox_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    label: "Include scenario features",
    modelValue: (__VLS_ctx.settings.includeFeatures),
    description: "",
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        label: "Include scenario features",
        modelValue: (__VLS_ctx.settings.includeFeatures),
        description: "",
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10 = InputCheckbox_vue_1.default;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    modelValue: (__VLS_ctx.settings.includeId),
    label: "Include ID",
}));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.includeId),
        label: "Include ID",
    }], __VLS_functionalComponentArgsRest(__VLS_11), false));
var __VLS_15 = InputCheckbox_vue_1.default;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.settings.includeIdInProperties),
    label: "Include ID in properties",
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.includeIdInProperties),
        label: "Include ID in properties",
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
// @ts-ignore
[settings, settings, settings, settings,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
