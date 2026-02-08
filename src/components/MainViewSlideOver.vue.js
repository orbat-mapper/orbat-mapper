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
var LayersPanel_vue_1 = require("./LayersPanel.vue");
var SlideOver_vue_1 = require("./SlideOver.vue");
var ScrollTabs_vue_1 = require("@/components/ScrollTabs.vue");
var TabsContent_vue_1 = require("@/components/ui/tabs/TabsContent.vue");
var settingsStore_1 = require("@/stores/settingsStore");
var NumberInputGroup_vue_1 = require("./NumberInputGroup.vue");
var MapSettingsPanel_vue_1 = require("@/components/MapSettingsPanel.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var uiStore_1 = require("@/stores/uiStore");
var TimeDateSettingsPanel_vue_1 = require("@/components/TimeDateSettingsPanel.vue");
var mapSettingsStore_ts_1 = require("@/stores/mapSettingsStore.ts");
var open = defineModel();
var settings = (0, settingsStore_1.useSettingsStore)();
var mapSettings = (0, mapSettingsStore_ts_1.useMapSettingsStore)();
var symbolSettings = (0, settingsStore_1.useSymbolSettingsStore)();
var uiSettings = (0, uiStore_1.useUiStore)();
var tabItems = ["Map view", "Map layers", "ORBAT", "Time and date"];
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = SlideOver_vue_1.default || SlideOver_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.open),
    title: "Settings",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.open),
        title: "Settings",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    items: (__VLS_ctx.tabItems),
    defaultValue: "0",
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.tabItems),
        defaultValue: "0",
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ value: "0" }, { class: "px-4 py-6" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "px-4 py-6" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
var __VLS_18 = __VLS_16.slots.default;
var __VLS_19 = MapSettingsPanel_vue_1.default;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_20), false));
// @ts-ignore
[open, tabItems,];
var __VLS_16;
var __VLS_24 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ value: "1" }, { class: "px-4 py-6" })));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ value: "1" }, { class: "px-4 py-6" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
var __VLS_29 = __VLS_27.slots.default;
var __VLS_30 = LayersPanel_vue_1.default;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
// @ts-ignore
[];
var __VLS_27;
var __VLS_35 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign({ value: "2" }, { class: "px-4 py-6" })));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ value: "2" }, { class: "px-4 py-6" })], __VLS_functionalComponentArgsRest(__VLS_36), false));
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
var __VLS_40 = __VLS_38.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 p-1" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
var __VLS_41 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    InputGroup: true,
    label: "Map symbol size",
    modelValue: (__VLS_ctx.mapSettings.mapIconSize),
}));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{
        InputGroup: true,
        label: "Map symbol size",
        modelValue: (__VLS_ctx.mapSettings.mapIconSize),
    }], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_46 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    label: "ORBAT symbol size",
    modelValue: (__VLS_ctx.settings.orbatIconSize),
}));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{
        label: "ORBAT symbol size",
        modelValue: (__VLS_ctx.settings.orbatIconSize),
    }], __VLS_functionalComponentArgsRest(__VLS_47), false));
var __VLS_51 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    modelValue: (__VLS_ctx.settings.orbatShortName),
}));
var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.orbatShortName),
    }], __VLS_functionalComponentArgsRest(__VLS_52), false));
var __VLS_56 = __VLS_54.slots.default;
// @ts-ignore
[mapSettings, settings, settings,];
var __VLS_54;
var __VLS_57 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    modelValue: (__VLS_ctx.symbolSettings.simpleStatusModifier),
}));
var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.symbolSettings.simpleStatusModifier),
    }], __VLS_functionalComponentArgsRest(__VLS_58), false));
var __VLS_62 = __VLS_60.slots.default;
// @ts-ignore
[symbolSettings,];
var __VLS_60;
var __VLS_63 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
    modelValue: (__VLS_ctx.uiSettings.debugMode),
}));
var __VLS_65 = __VLS_64.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.uiSettings.debugMode),
    }], __VLS_functionalComponentArgsRest(__VLS_64), false));
var __VLS_68 = __VLS_66.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_66;
if (__VLS_ctx.uiSettings.debugMode) {
    var __VLS_69 = ToggleField_vue_1.default || ToggleField_vue_1.default;
    // @ts-ignore
    var __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
        modelValue: (__VLS_ctx.uiSettings.showFps),
    }));
    var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.uiSettings.showFps),
        }], __VLS_functionalComponentArgsRest(__VLS_70), false));
    var __VLS_74 = __VLS_72.slots.default;
    // @ts-ignore
    [uiSettings, uiSettings,];
    var __VLS_72;
}
// @ts-ignore
[];
var __VLS_38;
var __VLS_75 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75(__assign({ value: "3" }, { class: "px-4 py-6" })));
var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([__assign({ value: "3" }, { class: "px-4 py-6" })], __VLS_functionalComponentArgsRest(__VLS_76), false));
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
var __VLS_80 = __VLS_78.slots.default;
var __VLS_81 = TimeDateSettingsPanel_vue_1.default;
// @ts-ignore
var __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({}));
var __VLS_83 = __VLS_82.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_82), false));
// @ts-ignore
[];
var __VLS_78;
// @ts-ignore
[];
var __VLS_10;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
