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
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var composables_1 = require("./composables");
var props = defineProps();
var _a = (0, composables_1.useChartSettings)(props.itemType), setValue = _a.setValue, usedOptions = _a.usedOptions, mergedOptions = _a.mergedOptions;
console.log(usedOptions);
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-6" }));
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
var __VLS_0 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.mergedOptions.showPersonnel) }), { class: (!__VLS_ctx.usedOptions.has('showPersonnel') && 'sepia-[50%]') })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.mergedOptions.showPersonnel) }), { class: (!__VLS_ctx.usedOptions.has('showPersonnel') && 'sepia-[50%]') })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('showPersonnel', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue,];
        } });
var __VLS_7 = __VLS_3.slots.default;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
var __VLS_8 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.mergedOptions.showEquipment) }), { class: (!__VLS_ctx.usedOptions.has('showEquipment') && 'sepia-[50%]') })));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.mergedOptions.showEquipment) }), { class: (!__VLS_ctx.usedOptions.has('showEquipment') && 'sepia-[50%]') })], __VLS_functionalComponentArgsRest(__VLS_9), false));
var __VLS_13;
var __VLS_14 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setValue('showEquipment', $event);
            // @ts-ignore
            [mergedOptions, usedOptions, setValue,];
        } });
var __VLS_15 = __VLS_11.slots.default;
// @ts-ignore
[];
var __VLS_11;
var __VLS_12;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
