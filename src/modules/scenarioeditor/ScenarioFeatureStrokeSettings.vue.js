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
var vue_1 = require("vue");
var simplestyle_1 = require("@/geo/simplestyle");
var PopoverColorPicker_vue_1 = require("@/components/PopoverColorPicker.vue");
var slider_1 = require("@/components/ui/slider");
var NewSelect_vue_1 = require("@/components/NewSelect.vue");
var props = defineProps();
var emit = defineEmits();
var marker = (0, vue_1.computed)(function () {
    var _a, _b, _c, _d;
    var style = props.feature.style;
    return {
        stroke: (_a = style["stroke"]) !== null && _a !== void 0 ? _a : simplestyle_1.defaultStrokeColor,
        "stroke-width": (_b = style["stroke-width"]) !== null && _b !== void 0 ? _b : simplestyle_1.defaultStrokeWidth,
        "stroke-opacity": (_c = style["stroke-opacity"]) !== null && _c !== void 0 ? _c : simplestyle_1.defaultStrokeOpacity,
        "stroke-style": (_d = style["stroke-style"]) !== null && _d !== void 0 ? _d : "solid",
    };
});
function updateValue(name, value) {
    var _a;
    emit("update", { style: (_a = {}, _a[name] = value, _a) });
}
var width = (0, vue_1.computed)({
    get: function () { return [marker.value["stroke-width"]]; },
    set: function (_a) {
        var v = _a[0];
        return emit("update", { style: { "stroke-width": v } });
    },
});
var opacity = (0, vue_1.computed)({
    get: function () { return [marker.value["stroke-opacity"]]; },
    set: function (_a) {
        var v = _a[0];
        return emit("update", { style: { "stroke-opacity": v } });
    },
});
var opacityAsPercent = (0, vue_1.computed)(function () { return (opacity.value[0] * 100).toFixed(0); });
function onChange(e) { }
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2 -mb-2 font-semibold" }));
/** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['-mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-center" }));
/** @type {__VLS_StyleScopedClasses['self-center']} */ ;
var __VLS_0 = PopoverColorPicker_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onUpdate:modelValue': {} }, { class: "" }), { modelValue: (__VLS_ctx.marker['stroke']) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { class: "" }), { modelValue: (__VLS_ctx.marker['stroke']) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('stroke', $event);
            // @ts-ignore
            [marker, updateValue,];
        } });
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "stroke-width" }, { class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-[1fr_5ch] gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[1fr_5ch]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.Slider} */
slider_1.Slider;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign({ 'onChange': {} }, { id: "stroke-width", modelValue: (__VLS_ctx.width), min: (1), max: (10), step: (1) }), { class: "min-w-20" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign({ 'onChange': {} }, { id: "stroke-width", modelValue: (__VLS_ctx.width), min: (1), max: (10), step: (1) }), { class: "min-w-20" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ change: {} },
    { onChange: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onChange($event);
            // @ts-ignore
            [width, onChange,];
        } });
/** @type {__VLS_StyleScopedClasses['min-w-20']} */ ;
var __VLS_10;
var __VLS_11;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
(__VLS_ctx.marker["stroke-width"]);
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    for: "stroke-opacity",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-[1fr_5ch] gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[1fr_5ch]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.Slider} */
slider_1.Slider;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign(__assign({ 'onChange': {} }, { id: "stroke-opacity", modelValue: (__VLS_ctx.opacity), min: (0), max: (1), step: (0.01) }), { class: "min-w-20" })));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign(__assign({ 'onChange': {} }, { id: "stroke-opacity", modelValue: (__VLS_ctx.opacity), min: (0), max: (1), step: (0.01) }), { class: "min-w-20" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
var __VLS_19;
var __VLS_20 = ({ change: {} },
    { onChange: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onChange($event);
            // @ts-ignore
            [marker, onChange, opacity,];
        } });
/** @type {__VLS_StyleScopedClasses['min-w-20']} */ ;
var __VLS_17;
var __VLS_18;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.opacityAsPercent);
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "stroke-style" }, { class: "self-center" }));
/** @type {__VLS_StyleScopedClasses['self-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-[1fr_5ch] gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[1fr_5ch]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_21 = NewSelect_vue_1.default;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign({ 'onUpdate:modelValue': {} }, { id: "stroke-style", modelValue: (__VLS_ctx.marker['stroke-style']), items: ([
        { label: 'Solid', value: 'solid' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Dotted', value: 'dotted' },
    ]) })));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { id: "stroke-style", modelValue: (__VLS_ctx.marker['stroke-style']), items: ([
            { label: 'Solid', value: 'solid' },
            { label: 'Dashed', value: 'dashed' },
            { label: 'Dotted', value: 'dotted' },
        ]) })], __VLS_functionalComponentArgsRest(__VLS_22), false));
var __VLS_26;
var __VLS_27 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('stroke-style', $event);
            // @ts-ignore
            [marker, updateValue, opacityAsPercent,];
        } });
var __VLS_24;
var __VLS_25;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
