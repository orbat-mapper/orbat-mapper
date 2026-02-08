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
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var NumberInputGroup_vue_1 = require("@/components/NumberInputGroup.vue");
var ZoomSelector_vue_1 = require("@/components/ZoomSelector.vue");
var props = defineProps();
var emit = defineEmits();
var marker = (0, vue_1.computed)(function () {
    var _a, _b, _c, _d, _e;
    var style = props.feature.style;
    return {
        showLabel: (_a = style["showLabel"]) !== null && _a !== void 0 ? _a : false,
        "text-placement": style["text-placement"] || "point",
        "text-align": style["text-align"] || "center",
        "text-offset-x": (_b = style["text-offset-x"]) !== null && _b !== void 0 ? _b : 15,
        "text-offset-y": (_c = style["text-offset-y"]) !== null && _c !== void 0 ? _c : 0,
        textMinZoom: (_d = style["textMinZoom"]) !== null && _d !== void 0 ? _d : 0,
        textMaxZoom: (_e = style["textMaxZoom"]) !== null && _e !== void 0 ? _e : 24,
    };
});
var placements = [
    { label: "Point", value: "point" },
    { label: "Line", value: "line" },
];
var align = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
    { label: "Start", value: "start" },
    { label: "End", value: "end" },
];
var range = (0, vue_1.computed)({
    get: function () {
        var _a, _b;
        return [
            (_a = marker.value.textMinZoom) !== null && _a !== void 0 ? _a : 0,
            (_b = marker.value.textMaxZoom) !== null && _b !== void 0 ? _b : 24,
        ];
    },
    set: function (v) {
        emit("update", { style: { textMinZoom: +v[0], textMaxZoom: +v[1] } });
    },
});
function updateValue(name, value) {
    var _a;
    emit("update", { style: (_a = {}, _a[name] = value, _a) });
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2 -mb-6 font-semibold" }));
/** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['-mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-end" }));
/** @type {__VLS_StyleScopedClasses['self-end']} */ ;
var __VLS_0 = ToggleField_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onUpdate:modelValue': {} }, { class: "mt-4" }), { modelValue: (__VLS_ctx.marker['showLabel']) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { class: "mt-4" }), { modelValue: (__VLS_ctx.marker['showLabel']) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('showLabel', $event);
            // @ts-ignore
            [marker, updateValue,];
        } });
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.marker.showLabel) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    var __VLS_7 = ZoomSelector_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ modelValue: (__VLS_ctx.range) }, { class: "mt-4 flex-auto" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.range) }, { class: "mt-4 flex-auto" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-center" }));
    /** @type {__VLS_StyleScopedClasses['self-center']} */ ;
    var __VLS_12 = SimpleSelect_vue_1.default || SimpleSelect_vue_1.default;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['text-placement']), items: (__VLS_ctx.placements) }), { class: "max-w-[10rem]" })));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['text-placement']), items: (__VLS_ctx.placements) }), { class: "max-w-[10rem]" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
    var __VLS_17 = void 0;
    var __VLS_18 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.marker.showLabel))
                    return;
                __VLS_ctx.updateValue('text-placement', $event);
                // @ts-ignore
                [marker, marker, updateValue, range, placements,];
            } });
    /** @type {__VLS_StyleScopedClasses['max-w-[10rem]']} */ ;
    var __VLS_15;
    var __VLS_16;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-center" }));
    /** @type {__VLS_StyleScopedClasses['self-center']} */ ;
    var __VLS_19 = SimpleSelect_vue_1.default;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['text-align']), items: (__VLS_ctx.align) }), { class: "max-w-[10rem]" })));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['text-align']), items: (__VLS_ctx.align) }), { class: "max-w-[10rem]" })], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = void 0;
    var __VLS_25 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.marker.showLabel))
                    return;
                __VLS_ctx.updateValue('text-align', $event);
                // @ts-ignore
                [marker, updateValue, align,];
            } });
    /** @type {__VLS_StyleScopedClasses['max-w-[10rem]']} */ ;
    var __VLS_22;
    var __VLS_23;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-center" }));
    /** @type {__VLS_StyleScopedClasses['self-center']} */ ;
    var __VLS_26 = NumberInputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['text-offset-x']) }), { class: "max-w-[10rem]" })));
    var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['text-offset-x']) }), { class: "max-w-[10rem]" })], __VLS_functionalComponentArgsRest(__VLS_27), false));
    var __VLS_31 = void 0;
    var __VLS_32 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.marker.showLabel))
                    return;
                __VLS_ctx.updateValue('text-offset-x', $event);
                // @ts-ignore
                [marker, updateValue,];
            } });
    /** @type {__VLS_StyleScopedClasses['max-w-[10rem]']} */ ;
    var __VLS_29;
    var __VLS_30;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-center" }));
    /** @type {__VLS_StyleScopedClasses['self-center']} */ ;
    var __VLS_33 = NumberInputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['text-offset-y']) }), { class: "max-w-[10rem]" })));
    var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['text-offset-y']) }), { class: "max-w-[10rem]" })], __VLS_functionalComponentArgsRest(__VLS_34), false));
    var __VLS_38 = void 0;
    var __VLS_39 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.marker.showLabel))
                    return;
                __VLS_ctx.updateValue('text-offset-y', $event);
                // @ts-ignore
                [marker, updateValue,];
            } });
    /** @type {__VLS_StyleScopedClasses['max-w-[10rem]']} */ ;
    var __VLS_36;
    var __VLS_37;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
