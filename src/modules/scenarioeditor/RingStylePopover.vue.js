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
var popover_1 = require("@/components/ui/popover");
var DrawRangeRingMarker_vue_1 = require("@/components/DrawRangeRingMarker.vue");
var vue_1 = require("vue");
var uiStore_1 = require("@/stores/uiStore");
var reka_ui_1 = require("reka-ui");
var CloseButton_vue_1 = require("@/components/CloseButton.vue");
var PopoverColorPicker_vue_1 = require("@/components/PopoverColorPicker.vue");
var slider_1 = require("@/components/ui/slider");
var props = defineProps();
var emit = defineEmits(["update"]);
var rStyle = (0, vue_1.computed)(function () {
    var _a, _b, _c, _d, _e, _f;
    return {
        fill: (_a = props.ringStyle.fill) !== null && _a !== void 0 ? _a : null,
        "fill-opacity": (_b = props.ringStyle["fill-opacity"]) !== null && _b !== void 0 ? _b : 0.5,
        stroke: (_c = props.ringStyle.stroke) !== null && _c !== void 0 ? _c : "#f43f5e",
        "stroke-width": (_d = props.ringStyle["stroke-width"]) !== null && _d !== void 0 ? _d : 2,
        "stroke-opacity": (_e = props.ringStyle["stroke-opacity"]) !== null && _e !== void 0 ? _e : 1,
        "stroke-style": (_f = props.ringStyle["stroke-style"]) !== null && _f !== void 0 ? _f : "solid",
    };
});
var uiStore = (0, uiStore_1.useUiStore)();
var width = (0, vue_1.computed)({
    get: function () { return [rStyle.value["stroke-width"]]; },
    set: function (_a) {
        var v = _a[0];
        return emit("update", { "stroke-width": v });
    },
});
var strokeOpacity = (0, vue_1.computed)({
    get: function () { return [rStyle.value["stroke-opacity"]]; },
    set: function (_a) {
        var v = _a[0];
        return emit("update", { "stroke-opacity": v });
    },
});
var strokeOpacityAsPercent = (0, vue_1.computed)(function () { return (strokeOpacity.value[0] * 100).toFixed(0); });
var fillOpacity = (0, vue_1.computed)({
    get: function () { return [rStyle.value["fill-opacity"]]; },
    set: function (_a) {
        var v = _a[0];
        return emit("update", { "fill-opacity": v });
    },
});
var fillOpacityAsPercent = (0, vue_1.computed)(function () { return (fillOpacity.value[0] * 100).toFixed(0); });
function updateValue(name, value) {
    var _a;
    emit("update", (_a = {}, _a[name] = value, _a));
}
function onOpen(isOpen) {
    if (isOpen) {
        uiStore.popperCounter++;
    }
    else {
        uiStore.popperCounter--;
    }
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
popover_1.Popover;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onUpdate:open': {} })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onUpdate:open': {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:open': {} },
    { 'onUpdate:open': (__VLS_ctx.onOpen) });
var __VLS_7 = {};
var __VLS_8 = __VLS_3.slots.default;
var __VLS_9;
/** @ts-ignore @type {typeof __VLS_components.PopoverTrigger | typeof __VLS_components.PopoverTrigger} */
popover_1.PopoverTrigger;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9(__assign(__assign({ title: "Change style" }, { class: "hover:bg-muted disabled:opacity-50" }), { disabled: (__VLS_ctx.disabled) })));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign(__assign({ title: "Change style" }, { class: "hover:bg-muted disabled:opacity-50" }), { disabled: (__VLS_ctx.disabled) })], __VLS_functionalComponentArgsRest(__VLS_10), false));
/** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
var __VLS_14 = __VLS_12.slots.default;
var __VLS_15 = DrawRangeRingMarker_vue_1.default;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    styling: (__VLS_ctx.rStyle),
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        styling: (__VLS_ctx.rStyle),
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
// @ts-ignore
[onOpen, disabled, rStyle,];
var __VLS_12;
var __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.PopoverContent | typeof __VLS_components.PopoverContent} */
popover_1.PopoverContent;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ class: "relative" }, { side: "left", align: "start" })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ class: "relative" }, { side: "left", align: "start" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
var __VLS_25 = __VLS_23.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between text-sm font-bold" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "text-foreground mt-4 grid w-full grid-cols-[max-content_1fr] gap-4 pb-1 text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[max-content_1fr]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2 -mb-2 font-semibold" }));
/** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['-mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_26 = PopoverColorPicker_vue_1.default;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign({ 'onUpdate:modelValue': {} }, { modelValue: __VLS_ctx.rStyle['stroke'] })));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { modelValue: __VLS_ctx.rStyle['stroke'] })], __VLS_functionalComponentArgsRest(__VLS_27), false));
var __VLS_31;
var __VLS_32 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('stroke', $event);
            // @ts-ignore
            [rStyle, updateValue,];
        } });
var __VLS_29;
var __VLS_30;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "stroke-width" }, { class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-[1fr_5ch] gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[1fr_5ch]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.Slider} */
slider_1.Slider;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign({ id: "stroke-width", modelValue: (__VLS_ctx.width), min: (1), max: (10), step: (1) }, { class: "min-w-20" })));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ id: "stroke-width", modelValue: (__VLS_ctx.width), min: (1), max: (10), step: (1) }, { class: "min-w-20" })], __VLS_functionalComponentArgsRest(__VLS_34), false));
/** @type {__VLS_StyleScopedClasses['min-w-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
(__VLS_ctx.rStyle["stroke-width"]);
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    for: "stroke-opacity",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-[1fr_5ch] gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[1fr_5ch]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.Slider} */
slider_1.Slider;
// @ts-ignore
var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ id: "stroke-opacity", modelValue: (__VLS_ctx.strokeOpacity), min: (0), max: (1), step: (0.01) }, { class: "min-w-20" })));
var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ id: "stroke-opacity", modelValue: (__VLS_ctx.strokeOpacity), min: (0), max: (1), step: (0.01) }, { class: "min-w-20" })], __VLS_functionalComponentArgsRest(__VLS_39), false));
/** @type {__VLS_StyleScopedClasses['min-w-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
(__VLS_ctx.strokeOpacityAsPercent);
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "text-foreground mt-4 grid w-full grid-cols-[max-content_1fr] gap-4 pb-1 text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[max-content_1fr]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2 -mb-2 font-semibold" }));
/** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['-mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_43 = PopoverColorPicker_vue_1.default;
// @ts-ignore
var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43(__assign({ 'onUpdate:modelValue': {} }, { modelValue: __VLS_ctx.rStyle['fill'], showNone: true })));
var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { modelValue: __VLS_ctx.rStyle['fill'], showNone: true })], __VLS_functionalComponentArgsRest(__VLS_44), false));
var __VLS_48;
var __VLS_49 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('fill', $event);
            // @ts-ignore
            [rStyle, rStyle, updateValue, width, strokeOpacity, strokeOpacityAsPercent,];
        } });
var __VLS_46;
var __VLS_47;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    for: "stroke-opacity",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-[1fr_5ch] gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[1fr_5ch]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.Slider} */
slider_1.Slider;
// @ts-ignore
var __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50(__assign({ id: "stroke-opacity", modelValue: (__VLS_ctx.fillOpacity), min: (0), max: (1), step: (0.01) }, { class: "min-w-20" })));
var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([__assign({ id: "stroke-opacity", modelValue: (__VLS_ctx.fillOpacity), min: (0), max: (1), step: (0.01) }, { class: "min-w-20" })], __VLS_functionalComponentArgsRest(__VLS_51), false));
/** @type {__VLS_StyleScopedClasses['min-w-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
(__VLS_ctx.fillOpacityAsPercent);
var __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.PopoverClose | typeof __VLS_components.PopoverClose} */
reka_ui_1.PopoverClose;
// @ts-ignore
var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    asChild: true,
}));
var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_56), false));
var __VLS_60 = __VLS_58.slots.default;
var __VLS_61 = CloseButton_vue_1.default;
// @ts-ignore
var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61(__assign({ class: "absolute top-4 right-4" })));
var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([__assign({ class: "absolute top-4 right-4" })], __VLS_functionalComponentArgsRest(__VLS_62), false));
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-4']} */ ;
/** @type {__VLS_StyleScopedClasses['right-4']} */ ;
// @ts-ignore
[fillOpacity, fillOpacityAsPercent,];
var __VLS_58;
// @ts-ignore
[];
var __VLS_23;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
