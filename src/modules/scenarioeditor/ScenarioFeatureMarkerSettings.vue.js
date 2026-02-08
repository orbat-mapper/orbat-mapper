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
var reka_ui_1 = require("reka-ui");
var DrawMarker_vue_1 = require("@/components/DrawMarker.vue");
var PopoverColorPicker_vue_1 = require("@/components/PopoverColorPicker.vue");
var props = defineProps();
var emit = defineEmits();
var sizeOptions = [
    { name: "S", value: "small" },
    { name: "M", value: "medium" },
    { name: "L", value: "large" },
];
var markerItems = [
    { label: "Circle", value: "circle" },
    { label: "Cross", value: "cross" },
    { label: "Hexagon", value: "hexagon" },
    { label: "Pentagon", value: "pentagon" },
    { label: "Star", value: "star" },
    { label: "Square", value: "square" },
    { label: "Triangle", value: "triangle" },
    { label: "X", value: "x" },
];
var marker = (0, vue_1.computed)(function () {
    var style = props.feature.style;
    return {
        "marker-color": style["marker-color"] || "black",
        "marker-symbol": style["marker-symbol"] || "circle",
        "marker-size": style["marker-size"] || "medium",
    };
});
function updateValue(name, value) {
    var _a;
    if (name === "marker-color") {
        emit("update", {
            style: {
                fill: value,
                stroke: value,
                "marker-color": value,
            },
        });
    }
    else {
        emit("update", { style: (_a = {}, _a[name] = value, _a) });
    }
}
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
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['marker-color']) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['marker-color']) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('marker-color', $event);
            // @ts-ignore
            [marker, updateValue,];
        } });
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-center" }));
/** @type {__VLS_StyleScopedClasses['self-center']} */ ;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.RadioGroupRoot | typeof __VLS_components.RadioGroupRoot} */
reka_ui_1.RadioGroupRoot;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['marker-size']) }), { class: "" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['marker-size']) }), { class: "" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('marker-size', $event);
            // @ts-ignore
            [marker, updateValue,];
        } });
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_14 = __VLS_10.slots.default;
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
reka_ui_1.Label;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ class: "sr-only" })));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ class: "sr-only" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_20 = __VLS_18.slots.default;
// @ts-ignore
[];
var __VLS_18;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.sizeOptions)); _i < _a.length; _i++) {
    var option = _a[_i][0];
    var __VLS_21 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem | typeof __VLS_components.RadioGroupItem} */
    reka_ui_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign({ key: (option.name), value: (option.value) }, { class: ([
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
            'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:hover:bg-primary/90',
            'bg-muted text-foreground border-border hover:bg-muted/90 border',
            'flex cursor-pointer items-center justify-center rounded-md px-5 py-3 text-sm font-semibold uppercase focus:outline-hidden',
        ]) })));
    var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign({ key: (option.name), value: (option.value) }, { class: ([
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
                'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:hover:bg-primary/90',
                'bg-muted text-foreground border-border hover:bg-muted/90 border',
                'flex cursor-pointer items-center justify-center rounded-md px-5 py-3 text-sm font-semibold uppercase focus:outline-hidden',
            ]) })], __VLS_functionalComponentArgsRest(__VLS_22), false));
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-ring']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-offset-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:bg-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:text-primary-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:hover:bg-primary/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-muted/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
    var __VLS_26 = __VLS_24.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (option.name);
    // @ts-ignore
    [sizeOptions,];
    var __VLS_24;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_10;
var __VLS_11;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-center" }));
/** @type {__VLS_StyleScopedClasses['self-center']} */ ;
var __VLS_27;
/** @ts-ignore @type {typeof __VLS_components.RadioGroupRoot | typeof __VLS_components.RadioGroupRoot} */
reka_ui_1.RadioGroupRoot;
// @ts-ignore
var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['marker-symbol']) }), { class: "mt-2" })));
var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.marker['marker-symbol']) }), { class: "mt-2" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
var __VLS_32;
var __VLS_33 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('marker-symbol', $event);
            // @ts-ignore
            [marker, updateValue,];
        } });
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
var __VLS_34 = __VLS_30.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap items-center gap-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
for (var _b = 0, _c = __VLS_vFor((__VLS_ctx.markerItems)); _b < _c.length; _b++) {
    var option = _c[_b][0];
    var __VLS_35 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem | typeof __VLS_components.RadioGroupItem} */
    reka_ui_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign({ key: (option.value), value: (option.value) }, { class: ([
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
            'data-[state=checked]:bg-primary/80 data-[state=checked]:text-primary-foreground data-[state=checked]:hover:bg-primary',
            'bg-muted text-foreground hover:bg-muted/90',
            'flex cursor-pointer items-center justify-center rounded-md px-2 py-2 text-sm font-semibold uppercase focus:outline-hidden',
        ]) })));
    var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ key: (option.value), value: (option.value) }, { class: ([
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
                'data-[state=checked]:bg-primary/80 data-[state=checked]:text-primary-foreground data-[state=checked]:hover:bg-primary',
                'bg-muted text-foreground hover:bg-muted/90',
                'flex cursor-pointer items-center justify-center rounded-md px-2 py-2 text-sm font-semibold uppercase focus:outline-hidden',
            ]) })], __VLS_functionalComponentArgsRest(__VLS_36), false));
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-ring']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-offset-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:bg-primary/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:text-primary-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:hover:bg-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-muted/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
    var __VLS_40 = __VLS_38.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    (option.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        'aria-hidden': "true",
    });
    var __VLS_41 = DrawMarker_vue_1.default;
    // @ts-ignore
    var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        marker: (option.value),
        color: (__VLS_ctx.marker['marker-color']),
    }));
    var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{
            marker: (option.value),
            color: (__VLS_ctx.marker['marker-color']),
        }], __VLS_functionalComponentArgsRest(__VLS_42), false));
    // @ts-ignore
    [marker, markerItems,];
    var __VLS_38;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_30;
var __VLS_31;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
