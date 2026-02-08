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
var AccordionPanel_vue_1 = require("@/components/AccordionPanel.vue");
var LinkButton_vue_1 = require("@/components/LinkButton.vue");
var selectedStore_1 = require("@/stores/selectedStore");
var ScenarioInfoGroups_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoGroups.vue");
var ScenarioInfoPersonnel_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoPersonnel.vue");
var ScenarioInfoEquipment_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoEquipment.vue");
var scenarioInfoPanelStore_1 = require("@/stores/scenarioInfoPanelStore");
var ScenarioInfoUnitStatuses_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoUnitStatuses.vue");
var ScenarioMapSettings_vue_1 = require("@/modules/scenarioeditor/ScenarioMapSettings.vue");
var PanelHeading_vue_1 = require("@/components/PanelHeading.vue");
var HeadingDescription_vue_1 = require("@/components/HeadingDescription.vue");
var ScenarioInfoSupplies_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoSupplies.vue");
var ScenarioInfoSupplyClasses_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoSupplyClasses.vue");
var ScenarioInfoSupplyUnits_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoSupplyUnits.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var ScenarioSymbolColorSettings_vue_1 = require("@/modules/scenarioeditor/ScenarioSymbolColorSettings.vue");
var ScenarioCustomSymbolSettings_vue_1 = require("@/modules/scenarioeditor/ScenarioCustomSymbolSettings.vue");
var ScenarioBoundingBox_vue_1 = require("@/modules/scenarioeditor/ScenarioBoundingBox.vue");
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store, onUndoRedo = _a.onUndoRedo, state = _a.state;
onUndoRedo(function () {
    state.settingsStateCounter++;
});
var selectedItems = (0, selectedStore_1.useSelectedItems)();
var scenarioInfoPanelStore = (0, scenarioInfoPanelStore_1.useScenarioInfoPanelStore)();
function showScenarioInfo() {
    selectedItems.clear();
    selectedItems.showScenarioInfo.value = true;
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
var __VLS_0 = LinkButton_vue_1.default || LinkButton_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClick': {} })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showScenarioInfo();
            // @ts-ignore
            [showScenarioInfo,];
        } });
var __VLS_7 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    'aria-hidden': "true",
});
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
var __VLS_8 = PanelHeading_vue_1.default || PanelHeading_vue_1.default;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_9), false));
var __VLS_13 = __VLS_11.slots.default;
// @ts-ignore
[];
var __VLS_11;
var __VLS_14 = HeadingDescription_vue_1.default || HeadingDescription_vue_1.default;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_15), false));
var __VLS_19 = __VLS_17.slots.default;
// @ts-ignore
[];
var __VLS_17;
var __VLS_20 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    label: "Equipment categories",
    key: (__VLS_ctx.scenarioInfoPanelStore.tabIndex + 20),
    defaultOpen: (__VLS_ctx.scenarioInfoPanelStore.tabIndex === 1),
}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
        label: "Equipment categories",
        key: (__VLS_ctx.scenarioInfoPanelStore.tabIndex + 20),
        defaultOpen: (__VLS_ctx.scenarioInfoPanelStore.tabIndex === 1),
    }], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25 = __VLS_23.slots.default;
var __VLS_26 = ScenarioInfoEquipment_vue_1.default;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign({ class: "relative" })));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign({ class: "relative" })], __VLS_functionalComponentArgsRest(__VLS_27), false));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
// @ts-ignore
[scenarioInfoPanelStore, scenarioInfoPanelStore,];
var __VLS_23;
var __VLS_31 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    label: "Personnel categories",
    key: (__VLS_ctx.scenarioInfoPanelStore.tabIndex + 40),
    defaultOpen: (__VLS_ctx.scenarioInfoPanelStore.tabIndex === 2),
}));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{
        label: "Personnel categories",
        key: (__VLS_ctx.scenarioInfoPanelStore.tabIndex + 40),
        defaultOpen: (__VLS_ctx.scenarioInfoPanelStore.tabIndex === 2),
    }], __VLS_functionalComponentArgsRest(__VLS_32), false));
var __VLS_36 = __VLS_34.slots.default;
var __VLS_37 = ScenarioInfoPersonnel_vue_1.default;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37(__assign({ class: "relative" })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ class: "relative" })], __VLS_functionalComponentArgsRest(__VLS_38), false));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
// @ts-ignore
[scenarioInfoPanelStore, scenarioInfoPanelStore,];
var __VLS_34;
var __VLS_42 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    label: "Supply categories",
    key: (__VLS_ctx.scenarioInfoPanelStore.tabIndex + 50),
    defaultOpen: (__VLS_ctx.scenarioInfoPanelStore.tabIndex === 3),
}));
var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{
        label: "Supply categories",
        key: (__VLS_ctx.scenarioInfoPanelStore.tabIndex + 50),
        defaultOpen: (__VLS_ctx.scenarioInfoPanelStore.tabIndex === 3),
    }], __VLS_functionalComponentArgsRest(__VLS_43), false));
var __VLS_47 = __VLS_45.slots.default;
var __VLS_48 = ScenarioInfoSupplies_vue_1.default;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48(__assign({ class: "relative" })));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign({ class: "relative" })], __VLS_functionalComponentArgsRest(__VLS_49), false));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
// @ts-ignore
[scenarioInfoPanelStore, scenarioInfoPanelStore,];
var __VLS_45;
var __VLS_53 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    label: "Supply classes",
}));
var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([{
        label: "Supply classes",
    }], __VLS_functionalComponentArgsRest(__VLS_54), false));
var __VLS_58 = __VLS_56.slots.default;
var __VLS_59 = ScenarioInfoSupplyClasses_vue_1.default;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({}));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_60), false));
// @ts-ignore
[];
var __VLS_56;
var __VLS_64 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    label: "Supply unit of measure/issue",
}));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([{
        label: "Supply unit of measure/issue",
    }], __VLS_functionalComponentArgsRest(__VLS_65), false));
var __VLS_69 = __VLS_67.slots.default;
var __VLS_70 = ScenarioInfoSupplyUnits_vue_1.default;
// @ts-ignore
var __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({}));
var __VLS_72 = __VLS_71.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_71), false));
// @ts-ignore
[];
var __VLS_67;
var __VLS_75 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    label: "Sensor groups",
    key: (__VLS_ctx.scenarioInfoPanelStore.tabIndex + 60),
    defaultOpen: (__VLS_ctx.scenarioInfoPanelStore.tabIndex === 4),
}));
var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([{
        label: "Sensor groups",
        key: (__VLS_ctx.scenarioInfoPanelStore.tabIndex + 60),
        defaultOpen: (__VLS_ctx.scenarioInfoPanelStore.tabIndex === 4),
    }], __VLS_functionalComponentArgsRest(__VLS_76), false));
var __VLS_80 = __VLS_78.slots.default;
var __VLS_81 = ScenarioInfoGroups_vue_1.default;
// @ts-ignore
var __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({}));
var __VLS_83 = __VLS_82.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_82), false));
// @ts-ignore
[scenarioInfoPanelStore, scenarioInfoPanelStore,];
var __VLS_78;
var __VLS_86 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
    label: "Unit statuses",
}));
var __VLS_88 = __VLS_87.apply(void 0, __spreadArray([{
        label: "Unit statuses",
    }], __VLS_functionalComponentArgsRest(__VLS_87), false));
var __VLS_91 = __VLS_89.slots.default;
var __VLS_92 = ScenarioInfoUnitStatuses_vue_1.default;
// @ts-ignore
var __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({}));
var __VLS_94 = __VLS_93.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_93), false));
// @ts-ignore
[];
var __VLS_89;
var __VLS_97 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
    label: "Map settings",
}));
var __VLS_99 = __VLS_98.apply(void 0, __spreadArray([{
        label: "Map settings",
    }], __VLS_functionalComponentArgsRest(__VLS_98), false));
var __VLS_102 = __VLS_100.slots.default;
var __VLS_103 = ScenarioMapSettings_vue_1.default;
// @ts-ignore
var __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({}));
var __VLS_105 = __VLS_104.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_104), false));
// @ts-ignore
[];
var __VLS_100;
var __VLS_108 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
    label: "Bounding box",
}));
var __VLS_110 = __VLS_109.apply(void 0, __spreadArray([{
        label: "Bounding box",
    }], __VLS_functionalComponentArgsRest(__VLS_109), false));
var __VLS_113 = __VLS_111.slots.default;
var __VLS_114 = ScenarioBoundingBox_vue_1.default;
// @ts-ignore
var __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({}));
var __VLS_116 = __VLS_115.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_115), false));
// @ts-ignore
[];
var __VLS_111;
var __VLS_119 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
    label: "Symbol fill colors",
}));
var __VLS_121 = __VLS_120.apply(void 0, __spreadArray([{
        label: "Symbol fill colors",
    }], __VLS_functionalComponentArgsRest(__VLS_120), false));
var __VLS_124 = __VLS_122.slots.default;
var __VLS_125 = ScenarioSymbolColorSettings_vue_1.default;
// @ts-ignore
var __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({}));
var __VLS_127 = __VLS_126.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_126), false));
// @ts-ignore
[];
var __VLS_122;
var __VLS_130 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
    label: "Custom unit symbols",
}));
var __VLS_132 = __VLS_131.apply(void 0, __spreadArray([{
        label: "Custom unit symbols",
    }], __VLS_functionalComponentArgsRest(__VLS_131), false));
var __VLS_135 = __VLS_133.slots.default;
var __VLS_136 = ScenarioCustomSymbolSettings_vue_1.default;
// @ts-ignore
var __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({}));
var __VLS_138 = __VLS_137.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_137), false));
// @ts-ignore
[];
var __VLS_133;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
