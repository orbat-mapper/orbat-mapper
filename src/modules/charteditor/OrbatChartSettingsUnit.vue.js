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
var MilitarySymbol_vue_1 = require("@/components/MilitarySymbol.vue");
var SettingsToe_vue_1 = require("@/modules/charteditor/SettingsToe.vue");
var currentUnitNode = (0, chartSettingsStore_1.useSelectedChartElementStore)();
var clearSpecificOptions = (0, composables_1.useChartSettings)(orbatchart_1.ChartItemTypes.Unit).clearSpecificOptions;
var currentUnit = (0, vue_1.computed)(function () { var _a; return (_a = currentUnitNode.node) === null || _a === void 0 ? void 0 : _a.unit; });
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 pb-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
if (__VLS_ctx.currentUnit) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "s" }));
    /** @type {__VLS_StyleScopedClasses['s']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "flex items-start" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "h-20 w-16 shrink-0" }));
    /** @type {__VLS_StyleScopedClasses['h-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    var __VLS_0 = MilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        sidc: (__VLS_ctx.currentUnit.sidc),
        size: (34),
        options: (__VLS_ctx.currentUnit.symbolOptions),
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            sidc: (__VLS_ctx.currentUnit.sidc),
            size: (34),
            options: (__VLS_ctx.currentUnit.symbolOptions),
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground pt-2 font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.currentUnit.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.currentUnit.shortName);
    var __VLS_5 = PlainButton_vue_1.default || PlainButton_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ 'onClick': {} })));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_6), false));
    var __VLS_10 = void 0;
    var __VLS_11 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.currentUnit))
                    return;
                __VLS_ctx.clearSpecificOptions();
                // @ts-ignore
                [currentUnit, currentUnit, currentUnit, currentUnit, currentUnit, clearSpecificOptions,];
            } });
    var __VLS_12 = __VLS_8.slots.default;
    // @ts-ignore
    [];
    var __VLS_8;
    var __VLS_9;
    var __VLS_13 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        label: "Unit settings",
        defaultOpen: true,
    }));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
            label: "Unit settings",
            defaultOpen: true,
        }], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_18 = __VLS_16.slots.default;
    var __VLS_19 = SettingsUnit_vue_1.default;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        itemType: (__VLS_ctx.ChartItemTypes.Unit),
    }));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
            itemType: (__VLS_ctx.ChartItemTypes.Unit),
        }], __VLS_functionalComponentArgsRest(__VLS_20), false));
    // @ts-ignore
    [orbatchart_1.ChartItemTypes,];
    var __VLS_16;
    var __VLS_24 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
    // @ts-ignore
    var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        label: "Equipment and personnel",
    }));
    var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{
            label: "Equipment and personnel",
        }], __VLS_functionalComponentArgsRest(__VLS_25), false));
    var __VLS_29 = __VLS_27.slots.default;
    var __VLS_30 = SettingsToe_vue_1.default;
    // @ts-ignore
    var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        itemType: (__VLS_ctx.ChartItemTypes.Unit),
    }));
    var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{
            itemType: (__VLS_ctx.ChartItemTypes.Unit),
        }], __VLS_functionalComponentArgsRest(__VLS_31), false));
    // @ts-ignore
    [orbatchart_1.ChartItemTypes,];
    var __VLS_27;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
