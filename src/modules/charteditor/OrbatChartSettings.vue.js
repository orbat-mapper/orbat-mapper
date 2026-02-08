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
var ScrollTabs_vue_1 = require("@/components/ScrollTabs.vue");
var TabsContent_vue_1 = require("@/components/ui/tabs/TabsContent.vue");
var OrbatChartSettingsUnit_vue_1 = require("./OrbatChartSettingsUnit.vue");
var OrbatChartSettingsLevel_vue_1 = require("./OrbatChartSettingsLevel.vue");
var OrbatChartSettingsChart_vue_1 = require("./OrbatChartSettingsChart.vue");
var OrbatChartSettingsBranch_vue_1 = require("./OrbatChartSettingsBranch.vue");
var constants_1 = require("@/modules/charteditor/constants");
var props = withDefaults(defineProps(), {
    chartMode: false,
});
var currentTab = defineModel("tab");
var tabItems = [
    { label: "Chart", value: constants_1.ChartTabs.Chart.toString() },
    { label: "Level", value: constants_1.ChartTabs.Level.toString() },
    { label: "Branch", value: constants_1.ChartTabs.Branch.toString() },
    { label: "Unitss", value: constants_1.ChartTabs.Unit.toString() },
];
var __VLS_modelEmit;
var __VLS_defaults = {
    chartMode: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full flex-col" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
if (!__VLS_ctx.chartMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "text-foreground hidden px-4 font-medium lg:block lg:p-4" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:block']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:p-4']} */ ;
}
var __VLS_0 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ modelValue: (__VLS_ctx.currentTab), items: (__VLS_ctx.tabItems), unmountOnHide: (false) }, { class: "min-h-0 flex-auto" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.currentTab), items: (__VLS_ctx.tabItems), unmountOnHide: (false) }, { class: "min-h-0 flex-auto" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ value: (__VLS_ctx.ChartTabs.Chart) }, { class: "mt-6 px-4" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ value: (__VLS_ctx.ChartTabs.Chart) }, { class: "mt-6 px-4" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
var __VLS_11 = __VLS_9.slots.default;
if (__VLS_ctx.currentTab === __VLS_ctx.ChartTabs.Chart) {
    var __VLS_12 = OrbatChartSettingsChart_vue_1.default;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        chartMode: (__VLS_ctx.chartMode),
    }));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{
            chartMode: (__VLS_ctx.chartMode),
        }], __VLS_functionalComponentArgsRest(__VLS_13), false));
}
// @ts-ignore
[chartMode, chartMode, currentTab, currentTab, tabItems, constants_1.ChartTabs, constants_1.ChartTabs,];
var __VLS_9;
var __VLS_17 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ value: (__VLS_ctx.ChartTabs.Level) }, { class: "mt-6 px-4" })));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ value: (__VLS_ctx.ChartTabs.Level) }, { class: "mt-6 px-4" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
var __VLS_22 = __VLS_20.slots.default;
var __VLS_23 = OrbatChartSettingsLevel_vue_1.default;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_24), false));
// @ts-ignore
[constants_1.ChartTabs,];
var __VLS_20;
var __VLS_28 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign({ value: (__VLS_ctx.ChartTabs.Branch) }, { class: "mt-6 px-4" })));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign({ value: (__VLS_ctx.ChartTabs.Branch) }, { class: "mt-6 px-4" })], __VLS_functionalComponentArgsRest(__VLS_29), false));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
var __VLS_33 = __VLS_31.slots.default;
var __VLS_34 = OrbatChartSettingsBranch_vue_1.default;
// @ts-ignore
var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({}));
var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_35), false));
// @ts-ignore
[constants_1.ChartTabs,];
var __VLS_31;
var __VLS_39 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign({ value: (__VLS_ctx.ChartTabs.Unit) }, { class: "mt-6 px-4" })));
var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign({ value: (__VLS_ctx.ChartTabs.Unit) }, { class: "mt-6 px-4" })], __VLS_functionalComponentArgsRest(__VLS_40), false));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
var __VLS_44 = __VLS_42.slots.default;
var __VLS_45 = OrbatChartSettingsUnit_vue_1.default;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({}));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_46), false));
// @ts-ignore
[constants_1.ChartTabs,];
var __VLS_42;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
