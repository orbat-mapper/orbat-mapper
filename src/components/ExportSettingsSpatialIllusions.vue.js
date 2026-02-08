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
var SymbolCodeSelect_vue_1 = require("@/components/SymbolCodeSelect.vue");
var scenarioUtils_1 = require("@/composables/scenarioUtils");
var NumberInputGroup_vue_1 = require("@/components/NumberInputGroup.vue");
var props = defineProps();
var settings = defineModel({ required: true });
var _a = (0, scenarioUtils_1.useRootUnits)(), rootUnitItems = _a.rootUnitItems, groupedRootUnitItems = _a.groupedRootUnitItems;
if (!settings.value.rootUnit && rootUnitItems.value.length > 0) {
    settings.value.rootUnit = rootUnitItems.value[0].code;
}
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "prose prose-sm dark:prose-invert" }));
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://spatialillusions.com/unitgenerator/",
    target: "_blank",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_0 = SymbolCodeSelect_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    items: (__VLS_ctx.rootUnitItems),
    groups: (__VLS_ctx.groupedRootUnitItems),
    modelValue: (__VLS_ctx.settings.rootUnit),
    label: "Root unit",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.rootUnitItems),
        groups: (__VLS_ctx.groupedRootUnitItems),
        modelValue: (__VLS_ctx.settings.rootUnit),
        label: "Root unit",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.settings.maxLevels),
    label: "Max levels/depth",
    min: (1),
    max: (10),
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.maxLevels),
        label: "Max levels/depth",
        min: (1),
        max: (10),
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
// @ts-ignore
[rootUnitItems, groupedRootUnitItems, settings, settings,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
