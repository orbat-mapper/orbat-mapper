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
var chartSettingsStore_1 = require("./chartSettingsStore");
var vue_1 = require("vue");
var PlainButton_vue_1 = require("../../components/PlainButton.vue");
var orbatchart_1 = require("./orbatchart");
var composables_1 = require("./composables");
var SettingsUnit_vue_1 = require("./SettingsUnit.vue");
var AccordionPanel_vue_1 = require("../../components/AccordionPanel.vue");
var SettingsConnectors_vue_1 = require("./SettingsConnectors.vue");
var selectedElement = (0, chartSettingsStore_1.useSelectedChartElementStore)();
var clearSpecificOptions = (0, composables_1.useChartSettings)(orbatchart_1.ChartItemTypes.Branch).clearSpecificOptions;
var currentBranch = (0, vue_1.computed)(function () { var _a; return ((_a = selectedElement.branch) === null || _a === void 0 ? void 0 : _a.parent) || null; });
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pb-4" }));
/** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
if (__VLS_ctx.currentBranch !== null) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    var __VLS_0 = PlainButton_vue_1.default || PlainButton_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClick': {} })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.currentBranch !== null))
                    return;
                __VLS_ctx.clearSpecificOptions();
                // @ts-ignore
                [currentBranch, clearSpecificOptions,];
            } });
    var __VLS_7 = __VLS_3.slots.default;
    // @ts-ignore
    [];
    var __VLS_3;
    var __VLS_4;
    var __VLS_8 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        label: "Unit settings",
        defaultOpen: true,
    }));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
            label: "Unit settings",
            defaultOpen: true,
        }], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = __VLS_11.slots.default;
    var __VLS_14 = SettingsUnit_vue_1.default;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        itemType: (__VLS_ctx.ChartItemTypes.Branch),
    }));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{
            itemType: (__VLS_ctx.ChartItemTypes.Branch),
        }], __VLS_functionalComponentArgsRest(__VLS_15), false));
    // @ts-ignore
    [orbatchart_1.ChartItemTypes,];
    var __VLS_11;
    var __VLS_19 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        label: "Connectors",
    }));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
            label: "Connectors",
        }], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = __VLS_22.slots.default;
    var __VLS_25 = SettingsConnectors_vue_1.default;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        itemType: (__VLS_ctx.ChartItemTypes.Branch),
    }));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{
            itemType: (__VLS_ctx.ChartItemTypes.Branch),
        }], __VLS_functionalComponentArgsRest(__VLS_26), false));
    // @ts-ignore
    [orbatchart_1.ChartItemTypes,];
    var __VLS_22;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
