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
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var RadioGroupList_vue_1 = require("@/components/RadioGroupList.vue");
var uiStore_1 = require("@/stores/uiStore");
var geoStore_1 = require("@/stores/geoStore");
var NumberInputGroup_vue_1 = require("@/components/NumberInputGroup.vue");
var SimpleDivider_vue_1 = require("@/components/SimpleDivider.vue");
var PanelSubHeading_vue_1 = require("@/components/PanelSubHeading.vue");
var settings = (0, mapSettingsStore_1.useMapSettingsStore)();
var measurementStore = (0, geoStore_1.useMeasurementsStore)();
var uiSettings = (0, uiStore_1.useUiStore)();
var coordinateFormatItems = [
    { name: "DG", description: "Decimal degrees", value: "DecimalDegrees" },
    { name: "DMS", description: "Degree Minutes Seconds", value: "DegreeMinuteSeconds" },
    { name: "MGRS", description: "Military grid reference system", value: "MGRS" },
];
var measurementItems = [
    { name: "Metric", value: "metric" },
    { name: "Imperial", value: "imperial" },
    { name: "Nautical", value: "nautical" },
];
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-5 p-1" }));
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
var __VLS_0 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.uiSettings.showToolbar),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.uiSettings.showToolbar),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_3;
var __VLS_6 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    modelValue: (__VLS_ctx.uiSettings.showTimeline),
}));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.uiSettings.showTimeline),
    }], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11 = __VLS_9.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_9;
var __VLS_12 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.uiSettings.showOrbatBreadcrumbs),
}));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.uiSettings.showOrbatBreadcrumbs),
    }], __VLS_functionalComponentArgsRest(__VLS_13), false));
var __VLS_17 = __VLS_15.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_15;
var __VLS_18 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    modelValue: (__VLS_ctx.settings.showScaleLine),
}));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.showScaleLine),
    }], __VLS_functionalComponentArgsRest(__VLS_19), false));
var __VLS_23 = __VLS_21.slots.default;
// @ts-ignore
[settings,];
var __VLS_21;
var __VLS_24 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.settings.showLocation),
}));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.showLocation),
    }], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_29 = __VLS_27.slots.default;
// @ts-ignore
[settings,];
var __VLS_27;
var __VLS_30 = SimpleDivider_vue_1.default;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ class: "mt-8" })));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ class: "mt-8" })], __VLS_functionalComponentArgsRest(__VLS_31), false));
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
var __VLS_35 = PanelSubHeading_vue_1.default || PanelSubHeading_vue_1.default;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({}));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_36), false));
var __VLS_40 = __VLS_38.slots.default;
// @ts-ignore
[];
var __VLS_38;
var __VLS_41 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    label: "Map symbol size",
    modelValue: (__VLS_ctx.settings.mapIconSize),
}));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{
        label: "Map symbol size",
        modelValue: (__VLS_ctx.settings.mapIconSize),
    }], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_46 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    modelValue: (__VLS_ctx.settings.mapUnitLabelBelow),
}));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.mapUnitLabelBelow),
    }], __VLS_functionalComponentArgsRest(__VLS_47), false));
var __VLS_51 = __VLS_49.slots.default;
// @ts-ignore
[settings, settings,];
var __VLS_49;
if (__VLS_ctx.settings.mapUnitLabelBelow) {
    var __VLS_52 = NumberInputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        label: "Unit label font size(px)",
        modelValue: (__VLS_ctx.settings.mapLabelSize),
    }));
    var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([{
            label: "Unit label font size(px)",
            modelValue: (__VLS_ctx.settings.mapLabelSize),
        }], __VLS_functionalComponentArgsRest(__VLS_53), false));
    var __VLS_57 = ToggleField_vue_1.default || ToggleField_vue_1.default;
    // @ts-ignore
    var __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
        modelValue: (__VLS_ctx.settings.mapWrapUnitLabels),
    }));
    var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.settings.mapWrapUnitLabels),
        }], __VLS_functionalComponentArgsRest(__VLS_58), false));
    var __VLS_62 = __VLS_60.slots.default;
    // @ts-ignore
    [settings, settings, settings,];
    var __VLS_60;
    var __VLS_63 = NumberInputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
        label: "Label wrap width",
        modelValue: (__VLS_ctx.settings.mapWrapLabelWidth),
    }));
    var __VLS_65 = __VLS_64.apply(void 0, __spreadArray([{
            label: "Label wrap width",
            modelValue: (__VLS_ctx.settings.mapWrapLabelWidth),
        }], __VLS_functionalComponentArgsRest(__VLS_64), false));
}
var __VLS_68 = SimpleDivider_vue_1.default;
// @ts-ignore
var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68(__assign({ class: "mt-8" })));
var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign({ class: "mt-8" })], __VLS_functionalComponentArgsRest(__VLS_69), false));
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-base leading-loose font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-loose']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_73 = RadioGroupList_vue_1.default;
// @ts-ignore
var __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    modelValue: (__VLS_ctx.settings.coordinateFormat),
    items: (__VLS_ctx.coordinateFormatItems),
}));
var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.coordinateFormat),
        items: (__VLS_ctx.coordinateFormatItems),
    }], __VLS_functionalComponentArgsRest(__VLS_74), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-base leading-loose font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-loose']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_78 = RadioGroupList_vue_1.default;
// @ts-ignore
var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    modelValue: (__VLS_ctx.measurementStore.measurementUnit),
    items: (__VLS_ctx.measurementItems),
}));
var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.measurementStore.measurementUnit),
        items: (__VLS_ctx.measurementItems),
    }], __VLS_functionalComponentArgsRest(__VLS_79), false));
// @ts-ignore
[settings, settings, coordinateFormatItems, measurementStore, measurementItems,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
