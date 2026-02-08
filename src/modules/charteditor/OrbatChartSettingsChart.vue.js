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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var chartSettingsStore_1 = require("./chartSettingsStore");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var orbatchart_1 = require("./orbatchart");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var utils_1 = require("@/utils");
var vue_1 = require("vue");
var MilSymbol_vue_1 = require("@/components/MilSymbol.vue");
var InputGroupTemplate_vue_1 = require("@/components/InputGroupTemplate.vue");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var solid_1 = require("@heroicons/vue/24/solid");
var CreateEmtpyDashed_vue_1 = require("@/components/CreateEmtpyDashed.vue");
var sizes_1 = require("./orbatchart/sizes");
var AccordionPanel_vue_1 = require("@/components/AccordionPanel.vue");
var NumberInputGroup_vue_1 = require("@/components/NumberInputGroup.vue");
var injects_1 = require("@/components/injects");
var SettingsToe_vue_1 = require("@/modules/charteditor/SettingsToe.vue");
var props = defineProps({ chartMode: { type: Boolean, default: false } });
var SearchModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/SearchModal.vue"); }); });
var _c = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).unitActions, expandUnitWithSymbolOptions = _c.expandUnitWithSymbolOptions, getUnitById = _c.getUnitById;
var options = (0, chartSettingsStore_1.useChartSettingsStore)();
var levelItems = (0, utils_1.enum2Items)(orbatchart_1.LevelLayouts);
var spacingItems = (0, utils_1.enum2Items)(orbatchart_1.UnitLevelDistances);
var fontWeightItems = (0, utils_1.enum2Items)(orbatchart_1.FontWeights);
var fontStyleItems = (0, utils_1.enum2Items)(orbatchart_1.FontStyles);
var labelPlacementItems = (0, utils_1.enum2Items)(orbatchart_1.LabelPlacements);
var rootUnitStore = (0, chartSettingsStore_1.useRootUnitStore)();
var showSearch = (0, vue_1.ref)(false);
var onUnitSelect = function (unitId) {
    var unit = expandUnitWithSymbolOptions(getUnitById(unitId));
    if (unit)
        rootUnitStore.unit = unit;
};
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
if (!__VLS_ctx.chartMode) {
    if (__VLS_ctx.rootUnitStore.unit) {
        var __VLS_0 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
        // @ts-ignore
        var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ label: "Root unit" }, { class: "my-4" })));
        var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ label: "Root unit" }, { class: "my-4" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
        /** @type {__VLS_StyleScopedClasses['my-4']} */ ;
        var __VLS_5 = __VLS_3.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-start" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-2 w-16 shrink-0" }));
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        var __VLS_6 = MilSymbol_vue_1.default;
        // @ts-ignore
        var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            sidc: (__VLS_ctx.rootUnitStore.unit.sidc),
            size: (30),
            modifiers: (__VLS_ctx.rootUnitStore.unit.symbolOptions),
        }));
        var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{
                sidc: (__VLS_ctx.rootUnitStore.unit.sidc),
                size: (30),
                modifiers: (__VLS_ctx.rootUnitStore.unit.symbolOptions),
            }], __VLS_functionalComponentArgsRest(__VLS_7), false));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "min-w-0 flex-auto" }));
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground truncate pt-2 text-sm font-medium" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.rootUnitStore.unit.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground truncate text-sm" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (__VLS_ctx.rootUnitStore.unit.shortName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 flex-none" }));
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
        var __VLS_11 = IconButton_vue_1.default || IconButton_vue_1.default;
        // @ts-ignore
        var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11(__assign({ 'onClick': {} })));
        var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_12), false));
        var __VLS_16 = void 0;
        var __VLS_17 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(!__VLS_ctx.chartMode))
                        return;
                    if (!(__VLS_ctx.rootUnitStore.unit))
                        return;
                    __VLS_ctx.showSearch = true;
                    // @ts-ignore
                    [chartMode, rootUnitStore, rootUnitStore, rootUnitStore, rootUnitStore, rootUnitStore, showSearch,];
                } });
        var __VLS_18 = __VLS_14.slots.default;
        var __VLS_19 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SearchIcon} */
        solid_1.MagnifyingGlassIcon;
        // @ts-ignore
        var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ class: "h-5 w-5" })));
        var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_20), false));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        // @ts-ignore
        [];
        var __VLS_14;
        var __VLS_15;
        // @ts-ignore
        [];
        var __VLS_3;
    }
    else {
        var __VLS_24 = CreateEmtpyDashed_vue_1.default || CreateEmtpyDashed_vue_1.default;
        // @ts-ignore
        var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ 'onClick': {} }, { icon: ((_a = __VLS_ctx.$options.components) === null || _a === void 0 ? void 0 : _a.SearchIcon) })));
        var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { icon: ((_b = __VLS_ctx.$options.components) === null || _b === void 0 ? void 0 : _b.SearchIcon) })], __VLS_functionalComponentArgsRest(__VLS_25), false));
        var __VLS_29 = void 0;
        var __VLS_30 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(!__VLS_ctx.chartMode))
                        return;
                    if (!!(__VLS_ctx.rootUnitStore.unit))
                        return;
                    __VLS_ctx.showSearch = true;
                    // @ts-ignore
                    [showSearch, $options,];
                } });
        var __VLS_31 = __VLS_27.slots.default;
        // @ts-ignore
        [];
        var __VLS_27;
        var __VLS_28;
    }
}
var __VLS_32 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    label: "Levels",
    modelValue: (__VLS_ctx.options.maxLevels),
}));
var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([{
        label: "Levels",
        modelValue: (__VLS_ctx.options.maxLevels),
    }], __VLS_functionalComponentArgsRest(__VLS_33), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "mt-4 w-full border-t border-gray-200" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
var __VLS_37 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    label: "Page settings",
}));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{
        label: "Page settings",
    }], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_42 = __VLS_40.slots.default;
var __VLS_43 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    modelValue: (__VLS_ctx.options.paperSize),
    label: "Page size",
    items: (__VLS_ctx.canvasSizeItems),
}));
var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.options.paperSize),
        label: "Page size",
        items: (__VLS_ctx.canvasSizeItems),
    }], __VLS_functionalComponentArgsRest(__VLS_44), false));
// @ts-ignore
[options, options, sizes_1.canvasSizeItems,];
var __VLS_40;
var __VLS_48 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    label: "Layout and spacing",
}));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{
        label: "Layout and spacing",
    }], __VLS_functionalComponentArgsRest(__VLS_49), false));
var __VLS_53 = __VLS_51.slots.default;
var __VLS_54 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    label: "Level padding",
    modelValue: (__VLS_ctx.options.levelPadding),
}));
var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([{
        label: "Level padding",
        modelValue: (__VLS_ctx.options.levelPadding),
    }], __VLS_functionalComponentArgsRest(__VLS_55), false));
var __VLS_59 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    label: "Tree offset",
    modelValue: (__VLS_ctx.options.treeOffset),
}));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([{
        label: "Tree offset",
        modelValue: (__VLS_ctx.options.treeOffset),
    }], __VLS_functionalComponentArgsRest(__VLS_60), false));
var __VLS_64 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    label: "Stacked offset",
    modelValue: (__VLS_ctx.options.stackedOffset),
}));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([{
        label: "Stacked offset",
        modelValue: (__VLS_ctx.options.stackedOffset),
    }], __VLS_functionalComponentArgsRest(__VLS_65), false));
var __VLS_69 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    label: "Last level layout",
    modelValue: (__VLS_ctx.options.lastLevelLayout),
    items: (__VLS_ctx.levelItems),
}));
var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([{
        label: "Last level layout",
        modelValue: (__VLS_ctx.options.lastLevelLayout),
        items: (__VLS_ctx.levelItems),
    }], __VLS_functionalComponentArgsRest(__VLS_70), false));
var __VLS_74 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
    label: "Unit spacing",
    modelValue: (__VLS_ctx.options.unitLevelDistance),
    items: (__VLS_ctx.spacingItems),
}));
var __VLS_76 = __VLS_75.apply(void 0, __spreadArray([{
        label: "Unit spacing",
        modelValue: (__VLS_ctx.options.unitLevelDistance),
        items: (__VLS_ctx.spacingItems),
    }], __VLS_functionalComponentArgsRest(__VLS_75), false));
// @ts-ignore
[options, options, options, options, options, levelItems, spacingItems,];
var __VLS_51;
var __VLS_79 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
    label: "Unit settings",
}));
var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([{
        label: "Unit settings",
    }], __VLS_functionalComponentArgsRest(__VLS_80), false));
var __VLS_84 = __VLS_82.slots.default;
var __VLS_85 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    label: "Symbol size",
    modelValue: (__VLS_ctx.options.symbolSize),
}));
var __VLS_87 = __VLS_86.apply(void 0, __spreadArray([{
        label: "Symbol size",
        modelValue: (__VLS_ctx.options.symbolSize),
    }], __VLS_functionalComponentArgsRest(__VLS_86), false));
var __VLS_90 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    label: "Font size",
    modelValue: (__VLS_ctx.options.fontSize),
}));
var __VLS_92 = __VLS_91.apply(void 0, __spreadArray([{
        label: "Font size",
        modelValue: (__VLS_ctx.options.fontSize),
    }], __VLS_functionalComponentArgsRest(__VLS_91), false));
var __VLS_95 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
    label: "Font weight",
    modelValue: (__VLS_ctx.options.fontWeight),
    items: (__VLS_ctx.fontWeightItems),
}));
var __VLS_97 = __VLS_96.apply(void 0, __spreadArray([{
        label: "Font weight",
        modelValue: (__VLS_ctx.options.fontWeight),
        items: (__VLS_ctx.fontWeightItems),
    }], __VLS_functionalComponentArgsRest(__VLS_96), false));
var __VLS_100 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
    label: "Font style",
    modelValue: (__VLS_ctx.options.fontStyle),
    items: (__VLS_ctx.fontStyleItems),
}));
var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([{
        label: "Font style",
        modelValue: (__VLS_ctx.options.fontStyle),
        items: (__VLS_ctx.fontStyleItems),
    }], __VLS_functionalComponentArgsRest(__VLS_101), false));
var __VLS_105 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    label: "Label offset",
    modelValue: (__VLS_ctx.options.labelOffset),
}));
var __VLS_107 = __VLS_106.apply(void 0, __spreadArray([{
        label: "Label offset",
        modelValue: (__VLS_ctx.options.labelOffset),
    }], __VLS_functionalComponentArgsRest(__VLS_106), false));
var __VLS_110 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
    label: "Label placement",
    modelValue: (__VLS_ctx.options.labelPlacement),
    items: (__VLS_ctx.labelPlacementItems),
}));
var __VLS_112 = __VLS_111.apply(void 0, __spreadArray([{
        label: "Label placement",
        modelValue: (__VLS_ctx.options.labelPlacement),
        items: (__VLS_ctx.labelPlacementItems),
    }], __VLS_functionalComponentArgsRest(__VLS_111), false));
var __VLS_115 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
    label: "Font color",
    type: "color",
    modelValue: (__VLS_ctx.options.fontColor),
}));
var __VLS_117 = __VLS_116.apply(void 0, __spreadArray([{
        label: "Font color",
        type: "color",
        modelValue: (__VLS_ctx.options.fontColor),
    }], __VLS_functionalComponentArgsRest(__VLS_116), false));
var __VLS_120 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.options.useShortName),
}));
var __VLS_122 = __VLS_121.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.options.useShortName),
    }], __VLS_functionalComponentArgsRest(__VLS_121), false));
var __VLS_125 = __VLS_123.slots.default;
// @ts-ignore
[options, options, options, options, options, options, options, options, fontWeightItems, fontStyleItems, labelPlacementItems,];
var __VLS_123;
var __VLS_126 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
    modelValue: (__VLS_ctx.options.hideLabel),
}));
var __VLS_128 = __VLS_127.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.options.hideLabel),
    }], __VLS_functionalComponentArgsRest(__VLS_127), false));
var __VLS_131 = __VLS_129.slots.default;
// @ts-ignore
[options,];
var __VLS_129;
// @ts-ignore
[];
var __VLS_82;
var __VLS_132 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
    label: "Connectors",
}));
var __VLS_134 = __VLS_133.apply(void 0, __spreadArray([{
        label: "Connectors",
    }], __VLS_functionalComponentArgsRest(__VLS_133), false));
var __VLS_137 = __VLS_135.slots.default;
var __VLS_138 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
    label: "Connector offset",
    modelValue: (__VLS_ctx.options.connectorOffset),
}));
var __VLS_140 = __VLS_139.apply(void 0, __spreadArray([{
        label: "Connector offset",
        modelValue: (__VLS_ctx.options.connectorOffset),
    }], __VLS_functionalComponentArgsRest(__VLS_139), false));
var __VLS_143 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
    label: "Line width",
    type: "number",
    modelValue: (__VLS_ctx.options.lineWidth),
}));
var __VLS_145 = __VLS_144.apply(void 0, __spreadArray([{
        label: "Line width",
        type: "number",
        modelValue: (__VLS_ctx.options.lineWidth),
    }], __VLS_functionalComponentArgsRest(__VLS_144), false));
var __VLS_148 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
    label: "Line color",
    type: "color",
    modelValue: (__VLS_ctx.options.lineColor),
}));
var __VLS_150 = __VLS_149.apply(void 0, __spreadArray([{
        label: "Line color",
        type: "color",
        modelValue: (__VLS_ctx.options.lineColor),
    }], __VLS_functionalComponentArgsRest(__VLS_149), false));
// @ts-ignore
[options, options, options,];
var __VLS_135;
var __VLS_153 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({
    label: "Equipment and personnel",
}));
var __VLS_155 = __VLS_154.apply(void 0, __spreadArray([{
        label: "Equipment and personnel",
    }], __VLS_functionalComponentArgsRest(__VLS_154), false));
var __VLS_158 = __VLS_156.slots.default;
var __VLS_159 = SettingsToe_vue_1.default;
// @ts-ignore
var __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({
    itemType: "chart",
}));
var __VLS_161 = __VLS_160.apply(void 0, __spreadArray([{
        itemType: "chart",
    }], __VLS_functionalComponentArgsRest(__VLS_160), false));
// @ts-ignore
[];
var __VLS_156;
var __VLS_164;
/** @ts-ignore @type {typeof __VLS_components.SearchModal} */
SearchModal;
// @ts-ignore
var __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164(__assign({ 'onSelectUnit': {} }, { modelValue: (__VLS_ctx.showSearch) })));
var __VLS_166 = __VLS_165.apply(void 0, __spreadArray([__assign({ 'onSelectUnit': {} }, { modelValue: (__VLS_ctx.showSearch) })], __VLS_functionalComponentArgsRest(__VLS_165), false));
var __VLS_169;
var __VLS_170 = ({ selectUnit: {} },
    { onSelectUnit: (__VLS_ctx.onUnitSelect) });
var __VLS_167;
var __VLS_168;
// @ts-ignore
[showSearch, onUnitSelect,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    props: { chartMode: { type: Boolean, default: false } },
});
exports.default = {};
