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
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var utils_1 = require("@/utils");
var orbatchart_1 = require("./orbatchart");
var composables_1 = require("./composables");
var NumberInputGroup_vue_1 = require("@/components/NumberInputGroup.vue");
var props = defineProps();
var _a = (0, composables_1.useChartSettings)(props.itemType), setValue = _a.setValue, usedOptions = _a.usedOptions, mergedOptions = _a.mergedOptions;
var fontWeightItems = (0, utils_1.enum2Items)(orbatchart_1.FontWeights);
var fontStyleItems = (0, utils_1.enum2Items)(orbatchart_1.FontStyles);
var labelPlacementItems = (0, utils_1.enum2Items)(orbatchart_1.LabelPlacements);
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-6" }));
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
var __VLS_0 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Symbol size", modelValue: (__VLS_ctx.mergedOptions.symbolSize) }), { class: (!__VLS_ctx.usedOptions.has('symbolSize') && 'sepia-[50%]') })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Symbol size", modelValue: (__VLS_ctx.mergedOptions.symbolSize) }), { class: (!__VLS_ctx.usedOptions.has('symbolSize') && 'sepia-[50%]') })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('symbolSize', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue,];
        } });
var __VLS_3;
var __VLS_4;
var __VLS_7 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Font size", modelValue: (__VLS_ctx.mergedOptions.fontSize) }), { class: (!__VLS_ctx.usedOptions.has('fontSize') && 'sepia-[50%]') })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Font size", modelValue: (__VLS_ctx.mergedOptions.fontSize) }), { class: (!__VLS_ctx.usedOptions.has('fontSize') && 'sepia-[50%]') })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('fontSize', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue,];
        } });
var __VLS_10;
var __VLS_11;
var __VLS_14 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Font weight", modelValue: (__VLS_ctx.mergedOptions.fontWeight) }), { class: (!__VLS_ctx.usedOptions.has('fontWeight') && 'sepia-[50%]') }), { items: (__VLS_ctx.fontWeightItems) })));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Font weight", modelValue: (__VLS_ctx.mergedOptions.fontWeight) }), { class: (!__VLS_ctx.usedOptions.has('fontWeight') && 'sepia-[50%]') }), { items: (__VLS_ctx.fontWeightItems) })], __VLS_functionalComponentArgsRest(__VLS_15), false));
var __VLS_19;
var __VLS_20 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('fontWeight', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue, fontWeightItems,];
        } });
var __VLS_17;
var __VLS_18;
var __VLS_21 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Font style", modelValue: (__VLS_ctx.mergedOptions.fontStyle) }), { class: (!__VLS_ctx.usedOptions.has('fontStyle') && 'sepia-[50%]') }), { items: (__VLS_ctx.fontStyleItems) })));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Font style", modelValue: (__VLS_ctx.mergedOptions.fontStyle) }), { class: (!__VLS_ctx.usedOptions.has('fontStyle') && 'sepia-[50%]') }), { items: (__VLS_ctx.fontStyleItems) })], __VLS_functionalComponentArgsRest(__VLS_22), false));
var __VLS_26;
var __VLS_27 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('fontStyle', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue, fontStyleItems,];
        } });
var __VLS_24;
var __VLS_25;
var __VLS_28 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Font color", type: "color", modelValue: (__VLS_ctx.mergedOptions.fontColor) }), { class: (!__VLS_ctx.usedOptions.has('fontColor') && 'sepia-[50%]') })));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Font color", type: "color", modelValue: (__VLS_ctx.mergedOptions.fontColor) }), { class: (!__VLS_ctx.usedOptions.has('fontColor') && 'sepia-[50%]') })], __VLS_functionalComponentArgsRest(__VLS_29), false));
var __VLS_33;
var __VLS_34 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('fontColor', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue,];
        } });
var __VLS_31;
var __VLS_32;
var __VLS_35 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Label offset", modelValue: (__VLS_ctx.mergedOptions.labelOffset) }), { class: (!__VLS_ctx.usedOptions.has('labelOffset') && 'sepia-[50%]') })));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Label offset", modelValue: (__VLS_ctx.mergedOptions.labelOffset) }), { class: (!__VLS_ctx.usedOptions.has('labelOffset') && 'sepia-[50%]') })], __VLS_functionalComponentArgsRest(__VLS_36), false));
var __VLS_40;
var __VLS_41 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('labelOffset', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue,];
        } });
var __VLS_38;
var __VLS_39;
var __VLS_42 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42(__assign(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Label placement", modelValue: (__VLS_ctx.mergedOptions.labelPlacement) }), { class: (!__VLS_ctx.usedOptions.has('labelPlacement') && 'sepia-[50%]') }), { items: (__VLS_ctx.labelPlacementItems) })));
var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUpdate:modelValue': {} }, { label: "Label placement", modelValue: (__VLS_ctx.mergedOptions.labelPlacement) }), { class: (!__VLS_ctx.usedOptions.has('labelPlacement') && 'sepia-[50%]') }), { items: (__VLS_ctx.labelPlacementItems) })], __VLS_functionalComponentArgsRest(__VLS_43), false));
var __VLS_47;
var __VLS_48 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('labelPlacement', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue, labelPlacementItems,];
        } });
var __VLS_45;
var __VLS_46;
var __VLS_49 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.mergedOptions.useShortName) }), { class: (!__VLS_ctx.usedOptions.has('useShortName') && 'sepia-[50%]') })));
var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.mergedOptions.useShortName) }), { class: (!__VLS_ctx.usedOptions.has('useShortName') && 'sepia-[50%]') })], __VLS_functionalComponentArgsRest(__VLS_50), false));
var __VLS_54;
var __VLS_55 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('useShortName', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue,];
        } });
var __VLS_56 = __VLS_52.slots.default;
// @ts-ignore
[];
var __VLS_52;
var __VLS_53;
var __VLS_57 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.mergedOptions.hideLabel) }), { class: (!__VLS_ctx.usedOptions.has('hideLabel') && 'sepia-[50%]') })));
var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.mergedOptions.hideLabel) }), { class: (!__VLS_ctx.usedOptions.has('hideLabel') && 'sepia-[50%]') })], __VLS_functionalComponentArgsRest(__VLS_58), false));
var __VLS_62;
var __VLS_63 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('hideLabel', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue,];
        } });
var __VLS_64 = __VLS_60.slots.default;
// @ts-ignore
[];
var __VLS_60;
var __VLS_61;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
