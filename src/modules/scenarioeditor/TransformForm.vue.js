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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var collapsible_1 = require("@/components/ui/collapsible");
var lucide_vue_next_1 = require("lucide-vue-next");
var InputGroupTemplate_vue_1 = require("@/components/InputGroupTemplate.vue");
var PanelSubHeading_vue_1 = require("@/components/PanelSubHeading.vue");
var NewSelect_vue_1 = require("@/components/NewSelect.vue");
var NumberInputGroup_vue_1 = require("@/components/NumberInputGroup.vue");
var vue_1 = require("vue");
var slider_1 = require("@/components/ui/slider");
var switch_1 = require("@/components/ui/switch");
var button_1 = require("@/components/ui/button");
var props = withDefaults(defineProps(), {
    unitMode: false,
});
var emit = defineEmits(["delete"]);
var currentOp = defineModel({ required: true });
var transformation = (0, vue_1.ref)(currentOp.value.transform);
var disabled = (0, vue_1.ref)(false);
var isOpen = (0, vue_1.ref)((_a = currentOp.value.isOpen) !== null && _a !== void 0 ? _a : true);
var enabled = (0, vue_1.computed)({
    get: function () {
        return !disabled.value;
    },
    set: function (value) {
        disabled.value = !value;
    },
});
var bufferOptions = (0, vue_1.ref)(currentOp.value.transform === "buffer"
    ? currentOp.value.options
    : { radius: 0, units: "kilometers", steps: 8 });
var simplifyOptions = (0, vue_1.ref)(currentOp.value.transform === "simplify"
    ? currentOp.value.options
    : { tolerance: 0.001 });
var sliderValue = (0, vue_1.computed)({
    get: function () {
        var _a;
        return [(_a = simplifyOptions.value.tolerance) !== null && _a !== void 0 ? _a : 0];
    },
    set: function (_a) {
        var value = _a[0];
        simplifyOptions.value.tolerance = value;
    },
});
var transformationOptions = (0, vue_1.computed)(function () {
    return [
        {
            label: "Buffer",
            value: "buffer",
            description: "Calculates a buffer for input features for a given radius.",
        },
        { label: "Bounding box", value: "boundingBox" },
        { label: "Convex hull", value: "convexHull" },
        { label: "Concave hull", value: "concaveHull" },
        { label: "Center (absolute)", value: "center" },
        { label: "Center of mass", value: "centerOfMass" },
        { label: "Centroid", value: "centroid" },
        { label: "Explode", value: "explode" },
        { label: "Simplify", value: "simplify" },
        { label: "Smooth", value: "smooth" },
        { label: "Union", value: "union" },
    ];
});
var transformationLabel = (0, vue_1.computed)(function () {
    var selectedOption = transformationOptions.value.find(function (option) { return option.value === transformation.value; });
    return selectedOption ? selectedOption.label : transformation.value;
});
var unitItems = [
    { label: "Kilometers", value: "kilometers" },
    { label: "Meters", value: "meters" },
    { label: "Miles", value: "miles" },
    { label: "Feet", value: "feet" },
    { label: "Nautical miles", value: "nauticalmiles" },
];
var id = currentOp.value.id;
(0, vue_1.watchEffect)(function () {
    if (transformation.value === "buffer") {
        var _a = bufferOptions.value, radius = _a.radius, units = _a.units, steps = _a.steps;
        currentOp.value = {
            id: id,
            transform: "buffer",
            options: { radius: radius, units: units, steps: steps },
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "boundingBox") {
        currentOp.value = {
            id: id,
            transform: "boundingBox",
            options: {},
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "convexHull") {
        currentOp.value = {
            id: id,
            transform: "convexHull",
            options: {},
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "concaveHull") {
        currentOp.value = {
            id: id,
            transform: "concaveHull",
            options: {},
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "simplify") {
        var tolerance = simplifyOptions.value.tolerance;
        currentOp.value = {
            id: id,
            transform: "simplify",
            options: { tolerance: tolerance },
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "smooth") {
        currentOp.value = {
            id: id,
            transform: "smooth",
            options: {},
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "center") {
        currentOp.value = {
            id: id,
            transform: "center",
            options: {},
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "centerOfMass") {
        currentOp.value = {
            id: id,
            transform: "centerOfMass",
            options: {},
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "centroid") {
        currentOp.value = {
            id: id,
            transform: "centroid",
            options: {},
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "explode") {
        currentOp.value = {
            id: id,
            transform: "explode",
            options: {},
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
    else if (transformation.value === "union") {
        currentOp.value = {
            id: id,
            transform: "union",
            options: {},
            disabled: disabled.value,
            isOpen: isOpen.value,
        };
    }
});
function onSubmit() {
    // Handle form submission logic here
    console.log("Form submitted with transformation:", transformation.value);
}
var __VLS_modelEmit;
var __VLS_defaults = {
    unitMode: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Collapsible | typeof __VLS_components.Collapsible} */
collapsible_1.Collapsible;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ open: (__VLS_ctx.isOpen) }, { class: "border-border -mx-2 rounded border" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ open: (__VLS_ctx.isOpen) }, { class: "border-border -mx-2 rounded border" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['-mx-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
var __VLS_6 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "relative flex items-center justify-between rounded border-b p-2 px-4" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.CollapsibleTrigger | typeof __VLS_components.CollapsibleTrigger} */
collapsible_1.CollapsibleTrigger;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "flex w-full items-center justify-between" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "flex w-full items-center justify-between" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
var __VLS_12 = __VLS_10.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm font-bold" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
(__VLS_ctx.transformationLabel);
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.ChevronsUpDown} */
lucide_vue_next_1.ChevronsUpDown;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ class: "h-4 w-4" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ class: "h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
// @ts-ignore
[isOpen, transformationLabel,];
var __VLS_10;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pointer-events-none absolute inset-0 flex justify-end" }));
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pointer-events-auto mr-8 flex items-center gap-1" }));
/** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.Switch} */
switch_1.Switch;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    modelValue: (__VLS_ctx.enabled),
}));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.enabled),
    }], __VLS_functionalComponentArgsRest(__VLS_19), false));
var __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23(__assign({ 'onClick': {} }, { variant: "ghost", size: "sm" })));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_24), false));
var __VLS_28;
var __VLS_29 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('delete');
            // @ts-ignore
            [enabled, emit,];
        } });
var __VLS_30 = __VLS_26.slots.default;
var __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.Trash2Icon} */
lucide_vue_next_1.Trash2Icon;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({}));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_32), false));
// @ts-ignore
[];
var __VLS_26;
var __VLS_27;
var __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.CollapsibleContent | typeof __VLS_components.CollapsibleContent} */
collapsible_1.CollapsibleContent;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36(__assign({ class: "p-4" })));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign({ class: "p-4" })], __VLS_functionalComponentArgsRest(__VLS_37), false));
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
var __VLS_41 = __VLS_39.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onSubmit) }, { class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_42 = NewSelect_vue_1.default;
// @ts-ignore
var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    label: "Transformation",
    items: (__VLS_ctx.transformationOptions),
    modelValue: (__VLS_ctx.transformation),
}));
var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{
        label: "Transformation",
        items: (__VLS_ctx.transformationOptions),
        modelValue: (__VLS_ctx.transformation),
    }], __VLS_functionalComponentArgsRest(__VLS_43), false));
if (__VLS_ctx.transformation === 'buffer') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-2 grid grid-cols-2 gap-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-1" }));
    /** @type {__VLS_StyleScopedClasses['col-span-1']} */ ;
    var __VLS_47 = NumberInputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        label: "Radius",
        modelValue: (__VLS_ctx.bufferOptions.radius),
        modelModifiers: { number: true, },
    }));
    var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([{
            label: "Radius",
            modelValue: (__VLS_ctx.bufferOptions.radius),
            modelModifiers: { number: true, },
        }], __VLS_functionalComponentArgsRest(__VLS_48), false));
    var __VLS_52 = NewSelect_vue_1.default;
    // @ts-ignore
    var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        label: "Units",
        items: (__VLS_ctx.unitItems),
        modelValue: (__VLS_ctx.bufferOptions.units),
    }));
    var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([{
            label: "Units",
            items: (__VLS_ctx.unitItems),
            modelValue: (__VLS_ctx.bufferOptions.units),
        }], __VLS_functionalComponentArgsRest(__VLS_53), false));
    var __VLS_57 = NumberInputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
        label: "Steps",
        modelValue: (__VLS_ctx.bufferOptions.steps),
        modelModifiers: { number: true, },
    }));
    var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([{
            label: "Steps",
            modelValue: (__VLS_ctx.bufferOptions.steps),
            modelModifiers: { number: true, },
        }], __VLS_functionalComponentArgsRest(__VLS_58), false));
}
else if (__VLS_ctx.transformation === 'simplify') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    var __VLS_62 = PanelSubHeading_vue_1.default || PanelSubHeading_vue_1.default;
    // @ts-ignore
    var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({}));
    var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_63), false));
    var __VLS_67 = __VLS_65.slots.default;
    // @ts-ignore
    [onSubmit, transformationOptions, transformation, transformation, transformation, bufferOptions, bufferOptions, bufferOptions, unitItems,];
    var __VLS_65;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 grid grid-cols-1 gap-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    var __VLS_68 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
    // @ts-ignore
    var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        label: "Tolerance",
    }));
    var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([{
            label: "Tolerance",
        }], __VLS_functionalComponentArgsRest(__VLS_69), false));
    var __VLS_73 = __VLS_71.slots.default;
    var __VLS_74 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Slider} */
    slider_1.Slider;
    // @ts-ignore
    var __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74(__assign({ modelValue: (__VLS_ctx.sliderValue), min: (0), max: (0.15), step: (0.00001) }, { class: "mt-4" })));
    var __VLS_76 = __VLS_75.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.sliderValue), min: (0), max: (0.15), step: (0.00001) }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_75), false));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    // @ts-ignore
    [sliderValue,];
    var __VLS_71;
}
// @ts-ignore
[];
var __VLS_39;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
