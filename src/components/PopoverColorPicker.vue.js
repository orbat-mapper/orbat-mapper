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
var colors_1 = require("@/components/colors");
var uiStore_1 = require("@/stores/uiStore");
var popover_1 = require("@/components/ui/popover");
var reka_ui_1 = require("reka-ui");
var CloseButton_vue_1 = require("@/components/CloseButton.vue");
var EditableLabel_vue_1 = require("@/components/EditableLabel.vue");
var button_1 = require("@/components/ui/button");
var props = withDefaults(defineProps(), {
    showNone: false,
});
var selectedColor = defineModel({ default: colors_1.defaultColors[1].selectedColor });
var uiStore = (0, uiStore_1.useUiStore)();
var $colors = (0, vue_1.computed)(function () {
    var _a, _b;
    var cols = props.showNone
        ? __spreadArray([
            {
                name: "None",
                value: null,
                bgColor: "bg-background",
                selectedColor: "ring-black",
            }
        ], colors_1.defaultColors, true) : __spreadArray([], colors_1.defaultColors, true);
    var notDefault = colors_1.defaultColors.find(function (c) { return c.value === selectedColor.value; }) === undefined;
    var notExtra = colors_1.extraColors.find(function (c) { return c.value === selectedColor.value; }) === undefined;
    cols.push.apply(cols, colors_1.extraColors);
    if (selectedColor.value && notDefault && notExtra) {
        cols.push({
            name: (_b = (_a = selectedColor.value) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : "None",
            value: selectedColor.value,
            bgColor: "",
            selectedColor: "ring-black",
        });
    }
    return cols;
});
var inputColor = (0, vue_1.computed)({
    get: function () { var _a; return (_a = selectedColor.value) !== null && _a !== void 0 ? _a : "#000000"; },
    set: function (v) { return (selectedColor.value = v); },
});
var hexValue = (0, vue_1.computed)({
    get: function () { var _a; return (_a = selectedColor.value) !== null && _a !== void 0 ? _a : "#000000"; },
    set: function (v) { return (selectedColor.value = v); },
});
function updateHexValue(value) {
    if ((0, colors_1.isValidHexColor)(value)) {
        selectedColor.value = value;
    }
    else {
        (0, vue_1.triggerRef)(selectedColor);
    }
}
function getColorName(color) {
    var _a, _b;
    return (_b = (_a = $colors.value.find(function (c) { return c.value === color; })) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : color.toUpperCase();
}
function onOpen(isOpen) {
    if (isOpen) {
        uiStore.popperCounter++;
    }
    else {
        uiStore.popperCounter--;
        var notDefault = colors_1.defaultColors.find(function (c) { return c.value === selectedColor.value; }) === undefined;
        var notExtra = colors_1.extraColors.find(function (c) { return c.value === selectedColor.value; }) === undefined;
        if (selectedColor.value && notDefault && notExtra) {
            colors_1.extraColors.push({
                name: selectedColor.value.toUpperCase(),
                value: selectedColor.value,
                bgColor: "",
                selectedColor: "ring-black",
            });
        }
    }
}
var __VLS_defaultModels = {
    'modelValue': colors_1.defaultColors[1].selectedColor,
};
var __VLS_modelEmit;
var __VLS_defaults = {
    showNone: false,
};
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
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    asChild: true,
}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_14 = __VLS_12.slots.default;
var __VLS_15 = {};
var __VLS_17;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ type: "button", variant: "ghost" }, { class: "justify-start" })));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ type: "button", variant: "ghost" }, { class: "justify-start" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
/** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
var __VLS_22 = __VLS_20.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign(__assign({ 'aria-hidden': "true" }, { class: ([
        'border-opacity-10 flex size-6 items-center justify-center rounded-full border border-gray-700 dark:border-gray-600',
    ]) }), { style: ({ backgroundColor: __VLS_ctx.selectedColor }) }));
/** @type {__VLS_StyleScopedClasses['border-opacity-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-600']} */ ;
if (!__VLS_ctx.selectedColor) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.getColorName(__VLS_ctx.selectedColor));
// @ts-ignore
[onOpen, selectedColor, selectedColor, selectedColor, getColorName,];
var __VLS_20;
// @ts-ignore
[];
var __VLS_12;
var __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.PopoverContent | typeof __VLS_components.PopoverContent} */
popover_1.PopoverContent;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23(__assign({ class: "relative" }, { avoidCollisions: (true) })));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([__assign({ class: "relative" }, { avoidCollisions: (true) })], __VLS_functionalComponentArgsRest(__VLS_24), false));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
var __VLS_28 = __VLS_26.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "text-sm font-bold" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-6 flex flex-wrap items-center gap-3" }));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.$colors)); _i < _a.length; _i++) {
    var color = _a[_i][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (color.name) }, { class: "flex rounded-full outline -outline-offset-1 outline-black/10" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline']} */ ;
    /** @type {__VLS_StyleScopedClasses['-outline-offset-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-black/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign({ 'aria-label': (color.name), type: "radio", name: "color", value: (color.value), checked: (__VLS_ctx.selectedColor === color.value) }, { class: "size-6 appearance-none rounded-full forced-color-adjust-none checked:outline-2 checked:outline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-3" }), { style: ({
            backgroundColor: color.value,
            outlineColor: __VLS_ctx.selectedColor === color.value ? color.value : 'transparent',
        }) }));
    (__VLS_ctx.selectedColor);
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['appearance-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['forced-color-adjust-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['checked:outline-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['checked:outline-offset-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:outline-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:outline-offset-3']} */ ;
    // @ts-ignore
    [selectedColor, selectedColor, selectedColor, $colors,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "color-picker" }, { class: "cursor-pointer text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign({ type: "color", id: "color-picker" }, { class: "h-4 flex-auto cursor-pointer p-0" }));
(__VLS_ctx.inputColor);
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['p-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 flex items-center gap-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "flex-none text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_29 = EditableLabel_vue_1.default;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29(__assign(__assign({ 'onUpdateValue': {} }, { class: "flex-auto" }), { modelValue: (__VLS_ctx.hexValue) })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdateValue': {} }, { class: "flex-auto" }), { modelValue: (__VLS_ctx.hexValue) })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_34;
var __VLS_35 = ({ updateValue: {} },
    { onUpdateValue: (__VLS_ctx.updateHexValue) });
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
var __VLS_32;
var __VLS_33;
var __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.PopoverClose | typeof __VLS_components.PopoverClose} */
reka_ui_1.PopoverClose;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    asChild: true,
}));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_37), false));
var __VLS_41 = __VLS_39.slots.default;
var __VLS_42 = CloseButton_vue_1.default;
// @ts-ignore
var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42(__assign({ class: "absolute top-4 right-4" })));
var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([__assign({ class: "absolute top-4 right-4" })], __VLS_functionalComponentArgsRest(__VLS_43), false));
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-4']} */ ;
/** @type {__VLS_StyleScopedClasses['right-4']} */ ;
// @ts-ignore
[inputColor, hexValue, updateHexValue,];
var __VLS_39;
// @ts-ignore
[];
var __VLS_26;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
var __VLS_16 = __VLS_15;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
