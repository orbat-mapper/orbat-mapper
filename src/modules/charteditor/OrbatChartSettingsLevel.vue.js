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
var PlainButton_vue_1 = require("@/components/PlainButton.vue");
var orbatchart_1 = require("./orbatchart");
var SettingsUnit_vue_1 = require("./SettingsUnit.vue");
var composables_1 = require("./composables");
var AccordionPanel_vue_1 = require("@/components/AccordionPanel.vue");
var SettingsConnectors_vue_1 = require("./SettingsConnectors.vue");
var NumberInputGroup_vue_1 = require("@/components/NumberInputGroup.vue");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var selectedElement = (0, chartSettingsStore_1.useSelectedChartElementStore)();
var specificStore = (0, chartSettingsStore_1.useSpecificChartOptionsStore)();
var _a = (0, composables_1.useChartSettings)(orbatchart_1.ChartItemTypes.Level), clearSpecificOptions = _a.clearSpecificOptions, usedOptions = _a.usedOptions, mergedOptions = _a.mergedOptions, setValue = _a.setValue;
var test = (0, vue_1.computed)({
    get: function () {
        var _a;
        return (_a = selectedElement.level) !== null && _a !== void 0 ? _a : 0;
    },
    set: function (v) {
        selectedElement.selectLevel(v);
    },
});
var levelItems = (0, vue_1.computed)(function () {
    return __spreadArray([], Array(mergedOptions.value.maxLevels), true).map(function (_, i) {
        var hasOpts = Object.keys(specificStore.level[i] || {}).length > 0;
        return {
            label: hasOpts ? "Level ".concat(i, " *") : "Level ".concat(i),
            value: i,
        };
    });
});
if (selectedElement.level === null)
    test.value = 0;
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pb-4" }));
/** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_0 = PlainButton_vue_1.default || PlainButton_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.usedOptions.size === 0) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.usedOptions.size === 0) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.clearSpecificOptions();
            // @ts-ignore
            [usedOptions, clearSpecificOptions,];
        } });
var __VLS_7 = __VLS_3.slots.default;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_8 = SimpleSelect_vue_1.default || SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    label: "Level",
    items: (__VLS_ctx.levelItems),
    modelValue: (__VLS_ctx.test),
}));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
        label: "Level",
        items: (__VLS_ctx.levelItems),
        modelValue: (__VLS_ctx.test),
    }], __VLS_functionalComponentArgsRest(__VLS_9), false));
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
    itemType: (__VLS_ctx.ChartItemTypes.Level),
}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
        itemType: (__VLS_ctx.ChartItemTypes.Level),
    }], __VLS_functionalComponentArgsRest(__VLS_20), false));
// @ts-ignore
[levelItems, test, orbatchart_1.ChartItemTypes,];
var __VLS_16;
var __VLS_24 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    label: "Layout and spacing",
}));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{
        label: "Layout and spacing",
    }], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_29 = __VLS_27.slots.default;
var __VLS_30 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Level padding", modelValue: (__VLS_ctx.mergedOptions.levelPadding) }), { class: (!__VLS_ctx.usedOptions.has('levelPadding') && 'sepia-[50%]') })));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Level padding", modelValue: (__VLS_ctx.mergedOptions.levelPadding) }), { class: (!__VLS_ctx.usedOptions.has('levelPadding') && 'sepia-[50%]') })], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35;
var __VLS_36 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('levelPadding', $event);
            // @ts-ignore
            [usedOptions, mergedOptions, setValue,];
        } });
var __VLS_33;
var __VLS_34;
// @ts-ignore
[];
var __VLS_27;
var __VLS_37 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    label: "Connectors",
}));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{
        label: "Connectors",
    }], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_42 = __VLS_40.slots.default;
var __VLS_43 = SettingsConnectors_vue_1.default;
// @ts-ignore
var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    itemType: (__VLS_ctx.ChartItemTypes.Level),
}));
var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
        itemType: (__VLS_ctx.ChartItemTypes.Level),
    }], __VLS_functionalComponentArgsRest(__VLS_44), false));
// @ts-ignore
[orbatchart_1.ChartItemTypes,];
var __VLS_40;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
