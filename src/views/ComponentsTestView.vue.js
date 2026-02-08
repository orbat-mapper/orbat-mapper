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
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var FormCard_vue_1 = require("@/components/FormCard.vue");
var vue_1 = require("vue");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var NumberInputGroup_vue_1 = require("@/components/NumberInputGroup.vue");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var SimpleCombo_vue_1 = require("@/components/SimpleCombo.vue");
var AccordionPanel_vue_1 = require("@/components/AccordionPanel.vue");
var ChevronPanel_vue_1 = require("@/components/ChevronPanel.vue");
var SettingsPanel_vue_1 = require("@/components/SettingsPanel.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var CheckboxDropdown_vue_1 = require("@/components/CheckboxDropdown.vue");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var LinkButton_vue_1 = require("@/components/LinkButton.vue");
var TestCoordinateInput_vue_1 = require("@/views/TestCoordinateInput.vue");
var SplitButton_vue_1 = require("@/components/SplitButton.vue");
var num = (0, vue_1.ref)(1);
var v = (0, vue_1.ref)("Test");
var v2 = (0, vue_1.ref)(1);
var values = ["Hello", "Test", "Another"];
var items = [
    { label: "Hello", value: 1 },
    { label: "Test", value: 2 },
    { label: "Another", value: 3 },
];
var sel = (0, vue_1.ref)([]);
var toggle = (0, vue_1.ref)(true);
var scenarioMenuItems = [
    { label: "Add new side", action: "addSide" },
    { label: "Save to local storage", action: "save" },
    { label: "Load from local storage", action: "load" },
    { label: "Load scenario", action: "loadNew" },
    { label: "Download as JSON", action: "exportJson" },
    { label: "Copy to clipboard", action: "exportToClipboard" },
    { label: "Export scenario", action: "export" },
    { label: "Import", action: "import" },
];
var mapLayerButtonItems = [
    {
        label: "Add feature layer",
        onClick: function () {
            console.log("Add feature layer");
        },
    },
    {
        label: "Add image layer",
        onClick: function () { return console.log("Add image layer"); },
    },
    {
        label: "Add XYZ tile layer",
        onClick: function () { return console.log("Add XYZ tile layer"); },
    },
    {
        label: "Add TileJSON layer",
        onClick: function () { return console.log("Add TileJSON layer"); },
    },
];
function onClick(e) {
    console.log(e.target);
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "min-h-full" }));
/** @type {__VLS_StyleScopedClasses['min-h-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "py-10" }));
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)(__assign({ class: "text-foreground text-3xl leading-tight font-bold" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)(__assign({ class: "mt-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto max-w-7xl space-y-4 sm:px-6 lg:px-8" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "border-b text-lg" }));
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
var __VLS_0 = TestCoordinateInput_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ onClick: (__VLS_ctx.onClick) }, { class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "border-b text-lg" }));
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "flex items-start space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_5 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    small: true,
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        small: true,
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10 = __VLS_8.slots.default;
// @ts-ignore
[onClick,];
var __VLS_8;
var __VLS_11 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_12), false));
var __VLS_16 = __VLS_14.slots.default;
// @ts-ignore
[];
var __VLS_14;
var __VLS_17 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
    large: true,
}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
        large: true,
    }], __VLS_functionalComponentArgsRest(__VLS_18), false));
var __VLS_22 = __VLS_20.slots.default;
// @ts-ignore
[];
var __VLS_20;
var __VLS_23 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    huge: true,
}));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{
        huge: true,
    }], __VLS_functionalComponentArgsRest(__VLS_24), false));
var __VLS_28 = __VLS_26.slots.default;
// @ts-ignore
[];
var __VLS_26;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "flex items-start space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_29 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    primary: true,
    small: true,
}));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
        primary: true,
        small: true,
    }], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_34 = __VLS_32.slots.default;
// @ts-ignore
[];
var __VLS_32;
var __VLS_35 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    primary: true,
}));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([{
        primary: true,
    }], __VLS_functionalComponentArgsRest(__VLS_36), false));
var __VLS_40 = __VLS_38.slots.default;
// @ts-ignore
[];
var __VLS_38;
var __VLS_41 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    primary: true,
    large: true,
}));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{
        primary: true,
        large: true,
    }], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_46 = __VLS_44.slots.default;
// @ts-ignore
[];
var __VLS_44;
var __VLS_47 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    primary: true,
    huge: true,
}));
var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([{
        primary: true,
        huge: true,
    }], __VLS_functionalComponentArgsRest(__VLS_48), false));
var __VLS_52 = __VLS_50.slots.default;
// @ts-ignore
[];
var __VLS_50;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "flex items-start space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_53 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    secondary: true,
    small: true,
}));
var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([{
        secondary: true,
        small: true,
    }], __VLS_functionalComponentArgsRest(__VLS_54), false));
var __VLS_58 = __VLS_56.slots.default;
// @ts-ignore
[];
var __VLS_56;
var __VLS_59 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    secondary: true,
}));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([{
        secondary: true,
    }], __VLS_functionalComponentArgsRest(__VLS_60), false));
var __VLS_64 = __VLS_62.slots.default;
// @ts-ignore
[];
var __VLS_62;
var __VLS_65 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    secondary: true,
    large: true,
}));
var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([{
        secondary: true,
        large: true,
    }], __VLS_functionalComponentArgsRest(__VLS_66), false));
var __VLS_70 = __VLS_68.slots.default;
// @ts-ignore
[];
var __VLS_68;
var __VLS_71 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
    secondary: true,
    huge: true,
}));
var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([{
        secondary: true,
        huge: true,
    }], __VLS_functionalComponentArgsRest(__VLS_72), false));
var __VLS_76 = __VLS_74.slots.default;
// @ts-ignore
[];
var __VLS_74;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "flex items-start space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_77 = LinkButton_vue_1.default || LinkButton_vue_1.default;
// @ts-ignore
var __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({}));
var __VLS_79 = __VLS_78.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_78), false));
var __VLS_82 = __VLS_80.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    'aria-hidden': "true",
});
// @ts-ignore
[];
var __VLS_80;
var __VLS_83 = LinkButton_vue_1.default || LinkButton_vue_1.default;
// @ts-ignore
var __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({}));
var __VLS_85 = __VLS_84.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_84), false));
var __VLS_88 = __VLS_86.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    'aria-hidden': "true",
});
// @ts-ignore
[];
var __VLS_86;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "border-b text-lg" }));
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
var __VLS_89 = SplitButton_vue_1.default;
// @ts-ignore
var __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
    items: (__VLS_ctx.mapLayerButtonItems),
}));
var __VLS_91 = __VLS_90.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.mapLayerButtonItems),
    }], __VLS_functionalComponentArgsRest(__VLS_90), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "border-b text-lg" }));
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-3 gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_94 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    type: "number",
    label: "Label",
    description: "Description",
    autofocus: true,
}));
var __VLS_96 = __VLS_95.apply(void 0, __spreadArray([{
        type: "number",
        label: "Label",
        description: "Description",
        autofocus: true,
    }], __VLS_functionalComponentArgsRest(__VLS_95), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_99 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99(__assign({ modelValue: (__VLS_ctx.num), max: (10), min: (-3), label: "Label", description: "Description" }, { class: "max-w-36" })));
var __VLS_101 = __VLS_100.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.num), max: (10), min: (-3), label: "Label", description: "Description" }, { class: "max-w-36" })], __VLS_functionalComponentArgsRest(__VLS_100), false));
/** @type {__VLS_StyleScopedClasses['max-w-36']} */ ;
var __VLS_104 = InputGroup_vue_1.default || InputGroup_vue_1.default;
// @ts-ignore
var __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({}));
var __VLS_106 = __VLS_105.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_105), false));
var __VLS_109 = __VLS_107.slots.default;
{
    var __VLS_110 = __VLS_107.slots.label;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-red-500" }));
    /** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
    // @ts-ignore
    [mapLayerButtonItems, num,];
}
// @ts-ignore
[];
var __VLS_107;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
var __VLS_111 = FormCard_vue_1.default || FormCard_vue_1.default;
// @ts-ignore
var __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
    label: "Label",
    description: "A description",
}));
var __VLS_113 = __VLS_112.apply(void 0, __spreadArray([{
        label: "Label",
        description: "A description",
    }], __VLS_functionalComponentArgsRest(__VLS_112), false));
var __VLS_116 = __VLS_114.slots.default;
var __VLS_117 = InputGroup_vue_1.default || InputGroup_vue_1.default;
// @ts-ignore
var __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
    label: "Label",
    disabled: true,
}));
var __VLS_119 = __VLS_118.apply(void 0, __spreadArray([{
        label: "Label",
        disabled: true,
    }], __VLS_functionalComponentArgsRest(__VLS_118), false));
var __VLS_122 = InputGroup_vue_1.default || InputGroup_vue_1.default;
// @ts-ignore
var __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
    label: "Label",
}));
var __VLS_124 = __VLS_123.apply(void 0, __spreadArray([{
        label: "Label",
    }], __VLS_functionalComponentArgsRest(__VLS_123), false));
// @ts-ignore
[];
var __VLS_114;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-2 gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_127 = SimpleCombo_vue_1.default;
// @ts-ignore
var __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
    label: "A label",
    modelValue: (__VLS_ctx.v),
    values: (__VLS_ctx.values),
}));
var __VLS_129 = __VLS_128.apply(void 0, __spreadArray([{
        label: "A label",
        modelValue: (__VLS_ctx.v),
        values: (__VLS_ctx.values),
    }], __VLS_functionalComponentArgsRest(__VLS_128), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
(__VLS_ctx.v);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-2 gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_132 = SimpleCombo_vue_1.default;
// @ts-ignore
var __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
    label: "A label",
    modelValue: (__VLS_ctx.v2),
    items: (__VLS_ctx.items),
}));
var __VLS_134 = __VLS_133.apply(void 0, __spreadArray([{
        label: "A label",
        modelValue: (__VLS_ctx.v2),
        items: (__VLS_ctx.items),
    }], __VLS_functionalComponentArgsRest(__VLS_133), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
(__VLS_ctx.v2);
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
var __VLS_137 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
    modelValue: (__VLS_ctx.toggle),
}));
var __VLS_139 = __VLS_138.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.toggle),
    }], __VLS_functionalComponentArgsRest(__VLS_138), false));
var __VLS_142 = __VLS_140.slots.default;
// @ts-ignore
[v, v, values, v2, v2, items, toggle,];
var __VLS_140;
var __VLS_143 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
    modelValue: (__VLS_ctx.toggle),
    disabled: true,
}));
var __VLS_145 = __VLS_144.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.toggle),
        disabled: true,
    }], __VLS_functionalComponentArgsRest(__VLS_144), false));
var __VLS_148 = __VLS_146.slots.default;
// @ts-ignore
[toggle,];
var __VLS_146;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "border-b text-lg" }));
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
var __VLS_149 = CheckboxDropdown_vue_1.default || CheckboxDropdown_vue_1.default;
// @ts-ignore
var __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
    options: (__VLS_ctx.items),
    modelValue: (__VLS_ctx.sel),
}));
var __VLS_151 = __VLS_150.apply(void 0, __spreadArray([{
        options: (__VLS_ctx.items),
        modelValue: (__VLS_ctx.sel),
    }], __VLS_functionalComponentArgsRest(__VLS_150), false));
var __VLS_154 = __VLS_152.slots.default;
// @ts-ignore
[items, sel,];
var __VLS_152;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "border-b text-lg" }));
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-3 gap-6" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
var __VLS_155 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
    label: "Accordion title",
}));
var __VLS_157 = __VLS_156.apply(void 0, __spreadArray([{
        label: "Accordion title",
    }], __VLS_functionalComponentArgsRest(__VLS_156), false));
var __VLS_160 = __VLS_158.slots.default;
// @ts-ignore
[];
var __VLS_158;
var __VLS_161 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    label: "Accordion with right slot",
}));
var __VLS_163 = __VLS_162.apply(void 0, __spreadArray([{
        label: "Accordion with right slot",
    }], __VLS_functionalComponentArgsRest(__VLS_162), false));
var __VLS_166 = __VLS_164.slots.default;
{
    var __VLS_167 = __VLS_164.slots.right;
    var __VLS_168 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconEarth} */
    vue_mdi_1.IconEarth;
    // @ts-ignore
    var __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168(__assign({ class: "h-5 w-5" })));
    var __VLS_170 = __VLS_169.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_169), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_164;
var __VLS_173 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({}));
var __VLS_175 = __VLS_174.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_174), false));
var __VLS_178 = __VLS_176.slots.default;
{
    var __VLS_179 = __VLS_176.slots.label;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-red-900" }));
    /** @type {__VLS_StyleScopedClasses['text-red-900']} */ ;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_176;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "border-b text-lg" }));
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-3 gap-6" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
var __VLS_180 = ChevronPanel_vue_1.default || ChevronPanel_vue_1.default;
// @ts-ignore
var __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
    label: "Chevron title",
}));
var __VLS_182 = __VLS_181.apply(void 0, __spreadArray([{
        label: "Chevron title",
    }], __VLS_functionalComponentArgsRest(__VLS_181), false));
var __VLS_185 = __VLS_183.slots.default;
// @ts-ignore
[];
var __VLS_183;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "border-b text-lg" }));
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid gap-6 px-4 sm:grid-cols-3" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
var __VLS_186 = SettingsPanel_vue_1.default || SettingsPanel_vue_1.default;
// @ts-ignore
var __VLS_187 = __VLS_asFunctionalComponent1(__VLS_186, new __VLS_186({
    label: "Settings panel title",
}));
var __VLS_188 = __VLS_187.apply(void 0, __spreadArray([{
        label: "Settings panel title",
    }], __VLS_functionalComponentArgsRest(__VLS_187), false));
var __VLS_191 = __VLS_189.slots.default;
{
    var __VLS_192 = __VLS_189.slots.right;
    var open_1 = __VLS_vSlot(__VLS_192)[0].open;
    (open_1);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_189;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "fixed top-10 left-20" }));
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['top-10']} */ ;
/** @type {__VLS_StyleScopedClasses['left-20']} */ ;
var __VLS_193 = DotsMenu_vue_1.default || DotsMenu_vue_1.default;
// @ts-ignore
var __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193(__assign({ items: (__VLS_ctx.scenarioMenuItems) }, { class: "relative -mr-2 pt-2" })));
var __VLS_195 = __VLS_194.apply(void 0, __spreadArray([__assign({ items: (__VLS_ctx.scenarioMenuItems) }, { class: "relative -mr-2 pt-2" })], __VLS_functionalComponentArgsRest(__VLS_194), false));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['-mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
// @ts-ignore
[scenarioMenuItems,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
