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
var tabs_1 = require("@/components/ui/tabs");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var ScenarioEventsPanel_vue_1 = require("@/modules/scenarioeditor/ScenarioEventsPanel.vue");
var ScenarioInfoPanel_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoPanel.vue");
var ScenarioFeatureDetails_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureDetails.vue");
var OrbatPanel_vue_1 = require("@/modules/scenarioeditor/OrbatPanel.vue");
var CloseButton_vue_1 = require("@/components/CloseButton.vue");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var MapTimeController_vue_1 = require("@/components/MapTimeController.vue");
var uiStore_1 = require("@/stores/uiStore");
var pinia_1 = require("pinia");
var ScenarioLayersTabPanel_vue_1 = require("@/modules/scenarioeditor/ScenarioLayersTabPanel.vue");
var selectedStore_1 = require("@/stores/selectedStore");
var ScenarioMapLayerDetails_vue_1 = require("@/modules/scenarioeditor/ScenarioMapLayerDetails.vue");
var ScenarioEventDetails_vue_1 = require("@/modules/scenarioeditor/ScenarioEventDetails.vue");
var UnitDetails_vue_1 = require("@/modules/scenarioeditor/UnitDetails.vue");
var ScenarioSettingsPanel_vue_1 = require("@/modules/scenarioeditor/ScenarioSettingsPanel.vue");
var ScrollTabs_vue_1 = require("@/components/ScrollTabs.vue");
var ScenarioFiltersTabPanel = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/modules/scenarioeditor/ScenarioFiltersTabPanel.vue"); }); });
var emit = defineEmits([
    "open-time-modal",
    "inc-day",
    "dec-day",
    "next-event",
    "prev-event",
    "show-settings",
]);
var _a = (0, selectedStore_1.useSelectedItems)(), selectedFeatureIds = _a.selectedFeatureIds, selectedUnitIds = _a.selectedUnitIds, activeUnitId = _a.activeUnitId, activeScenarioEventId = _a.activeScenarioEventId, activeMapLayerId = _a.activeMapLayerId, activeDetailsPanel = _a.activeDetailsPanel;
var showBottomPanel = (0, pinia_1.storeToRefs)((0, uiStore_1.useUiStore)()).mobilePanelOpen;
var toggleBottomPanel = (0, core_1.useToggle)(showBottomPanel);
var activeTabIndex = (0, pinia_1.storeToRefs)((0, uiStore_1.useUiStore)()).activeTabIndex;
var activeTabIndexString = (0, vue_1.computed)({
    get: function () { return activeTabIndex.value.toString(); },
    set: function (v) { return (activeTabIndex.value = parseInt(v)); },
});
var swipeUpEl = (0, vue_1.ref)(null);
var swipeDownEl = (0, vue_1.ref)(null);
var _b = (0, core_1.useSwipe)(swipeUpEl), isSwiping = _b.isSwiping, direction = _b.direction;
var _c = (0, core_1.useSwipe)(swipeDownEl), isSwipingDown = _c.isSwiping, downDirection = _c.direction;
(0, vue_1.watch)(isSwiping, function (swiping) {
    if (swiping && direction.value === "up") {
        showBottomPanel.value = true;
    }
});
(0, vue_1.watch)(isSwipingDown, function (swiping) {
    if (swiping && downDirection.value === "down") {
        showBottomPanel.value = false;
    }
});
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)(__assign({ class: "overflow-auto" }, { class: ([__VLS_ctx.showBottomPanel ? 'h-1/2' : 'h-12']) }));
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-full items-center" }, { ref: "swipeUpEl" }));
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (!__VLS_ctx.showBottomPanel) }), null, null);
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleBottomPanel();
        // @ts-ignore
        [showBottomPanel, showBottomPanel, toggleBottomPanel,];
    } }, { class: "relative flex flex-1 items-center justify-center" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
var __VLS_0 = IconButton_vue_1.default || IconButton_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.IconChevronDoubleUp} */
vue_mdi_1.IconChevronDoubleUp;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { class: "h-6 w-6" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "h-6 w-6" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11;
var __VLS_12 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleBottomPanel();
            // @ts-ignore
            [toggleBottomPanel,];
        } });
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
var __VLS_9;
var __VLS_10;
// @ts-ignore
[];
var __VLS_3;
var __VLS_13 = MapTimeController_vue_1.default;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onOpenTimeModal': {} }, { 'onShowSettings': {} }), { 'onDecDay': {} }), { 'onIncDay': {} }), { 'onNextEvent': {} }), { 'onPrevEvent': {} }), { class: "flex-none" }), { hideTime: true })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onOpenTimeModal': {} }, { 'onShowSettings': {} }), { 'onDecDay': {} }), { 'onIncDay': {} }), { 'onNextEvent': {} }), { 'onPrevEvent': {} }), { class: "flex-none" }), { hideTime: true })], __VLS_functionalComponentArgsRest(__VLS_14), false));
var __VLS_18;
var __VLS_19 = ({ openTimeModal: {} },
    { onOpenTimeModal: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('open-time-modal');
            // @ts-ignore
            [emit,];
        } });
var __VLS_20 = ({ showSettings: {} },
    { onShowSettings: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('show-settings');
            // @ts-ignore
            [emit,];
        } });
var __VLS_21 = ({ decDay: {} },
    { onDecDay: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('dec-day');
            // @ts-ignore
            [emit,];
        } });
var __VLS_22 = ({ incDay: {} },
    { onIncDay: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('inc-day');
            // @ts-ignore
            [emit,];
        } });
var __VLS_23 = ({ nextEvent: {} },
    { onNextEvent: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('next-event');
            // @ts-ignore
            [emit,];
        } });
var __VLS_24 = ({ prevEvent: {} },
    { onPrevEvent: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('prev-event');
            // @ts-ignore
            [emit,];
        } });
/** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
var __VLS_16;
var __VLS_17;
var __VLS_25 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ modelValue: (__VLS_ctx.activeTabIndexString), items: (['ORBAT', 'Events', 'Layers', 'Settings', 'Filter', 'Details']) }, { class: ({ hidden: !__VLS_ctx.showBottomPanel }) })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.activeTabIndexString), items: (['ORBAT', 'Events', 'Layers', 'Settings', 'Filter', 'Details']) }, { class: ({ hidden: !__VLS_ctx.showBottomPanel }) })], __VLS_functionalComponentArgsRest(__VLS_26), false));
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
var __VLS_30 = __VLS_28.slots.default;
{
    var __VLS_31 = __VLS_28.slots.right;
    var __VLS_32 = CloseButton_vue_1.default;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32(__assign({ 'onClick': {} }, { class: "px-6" })));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "px-6" })], __VLS_functionalComponentArgsRest(__VLS_33), false));
    var __VLS_37 = void 0;
    var __VLS_38 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.toggleBottomPanel();
                // @ts-ignore
                [showBottomPanel, toggleBottomPanel, activeTabIndexString,];
            } });
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    var __VLS_35;
    var __VLS_36;
    // @ts-ignore
    [];
}
var __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign({ value: "0" }, { class: "mt-0 h-full pb-10" })));
var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "mt-0 h-full pb-10" })], __VLS_functionalComponentArgsRest(__VLS_40), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
var __VLS_44 = __VLS_42.slots.default;
var __VLS_45 = OrbatPanel_vue_1.default;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({}));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_46), false));
// @ts-ignore
[];
var __VLS_42;
var __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50(__assign({ value: "1" }, { class: "mt-0 p-4 pb-10" })));
var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([__assign({ value: "1" }, { class: "mt-0 p-4 pb-10" })], __VLS_functionalComponentArgsRest(__VLS_51), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
var __VLS_55 = __VLS_53.slots.default;
var __VLS_56 = ScenarioEventsPanel_vue_1.default;
// @ts-ignore
var __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_57), false));
// @ts-ignore
[];
var __VLS_53;
var __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61(__assign({ value: "2" }, { class: "mt-0 p-4 pb-10" })));
var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([__assign({ value: "2" }, { class: "mt-0 p-4 pb-10" })], __VLS_functionalComponentArgsRest(__VLS_62), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
var __VLS_66 = __VLS_64.slots.default;
var __VLS_67 = ScenarioLayersTabPanel_vue_1.default;
// @ts-ignore
var __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({}));
var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_68), false));
// @ts-ignore
[];
var __VLS_64;
var __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72(__assign({ value: "3" }, { class: "mt-0 p-4 pb-10" })));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([__assign({ value: "3" }, { class: "mt-0 p-4 pb-10" })], __VLS_functionalComponentArgsRest(__VLS_73), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
var __VLS_77 = __VLS_75.slots.default;
var __VLS_78 = ScenarioSettingsPanel_vue_1.default;
// @ts-ignore
var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({}));
var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_79), false));
// @ts-ignore
[];
var __VLS_75;
var __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83(__assign({ value: "4" }, { class: "mt-0" })));
var __VLS_85 = __VLS_84.apply(void 0, __spreadArray([__assign({ value: "4" }, { class: "mt-0" })], __VLS_functionalComponentArgsRest(__VLS_84), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
var __VLS_88 = __VLS_86.slots.default;
var __VLS_89;
/** @ts-ignore @type {typeof __VLS_components.ScenarioFiltersTabPanel} */
ScenarioFiltersTabPanel;
// @ts-ignore
var __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({}));
var __VLS_91 = __VLS_90.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_90), false));
// @ts-ignore
[];
var __VLS_86;
var __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94(__assign({ value: "5" }, { class: "mt-0 pb-10" })));
var __VLS_96 = __VLS_95.apply(void 0, __spreadArray([__assign({ value: "5" }, { class: "mt-0 pb-10" })], __VLS_functionalComponentArgsRest(__VLS_95), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
var __VLS_99 = __VLS_97.slots.default;
if (__VLS_ctx.activeDetailsPanel === 'unit') {
    var __VLS_100 = UnitDetails_vue_1.default;
    // @ts-ignore
    var __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100(__assign({ unitId: (__VLS_ctx.activeUnitId || __spreadArray([], __VLS_ctx.selectedUnitIds, true)[0]) }, { class: "p-4" })));
    var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([__assign({ unitId: (__VLS_ctx.activeUnitId || __spreadArray([], __VLS_ctx.selectedUnitIds, true)[0]) }, { class: "p-4" })], __VLS_functionalComponentArgsRest(__VLS_101), false));
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
}
else if (__VLS_ctx.activeDetailsPanel === 'feature') {
    var __VLS_105 = ScenarioFeatureDetails_vue_1.default;
    // @ts-ignore
    var __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105(__assign({ selectedIds: (__VLS_ctx.selectedFeatureIds) }, { class: "p-4" })));
    var __VLS_107 = __VLS_106.apply(void 0, __spreadArray([__assign({ selectedIds: (__VLS_ctx.selectedFeatureIds) }, { class: "p-4" })], __VLS_functionalComponentArgsRest(__VLS_106), false));
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
}
else if (__VLS_ctx.activeDetailsPanel === 'event') {
    var __VLS_110 = ScenarioEventDetails_vue_1.default;
    // @ts-ignore
    var __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110(__assign({ eventId: (__VLS_ctx.activeScenarioEventId) }, { class: "p-4" })));
    var __VLS_112 = __VLS_111.apply(void 0, __spreadArray([__assign({ eventId: (__VLS_ctx.activeScenarioEventId) }, { class: "p-4" })], __VLS_functionalComponentArgsRest(__VLS_111), false));
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
}
else if (__VLS_ctx.activeDetailsPanel === 'mapLayer') {
    var __VLS_115 = ScenarioMapLayerDetails_vue_1.default;
    // @ts-ignore
    var __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115(__assign({ layerId: (__VLS_ctx.activeMapLayerId) }, { class: "p-4" })));
    var __VLS_117 = __VLS_116.apply(void 0, __spreadArray([__assign({ layerId: (__VLS_ctx.activeMapLayerId) }, { class: "p-4" })], __VLS_functionalComponentArgsRest(__VLS_116), false));
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
}
else if (__VLS_ctx.activeDetailsPanel === 'scenario') {
    var __VLS_120 = ScenarioInfoPanel_vue_1.default;
    // @ts-ignore
    var __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120(__assign({ class: "p-4" })));
    var __VLS_122 = __VLS_121.apply(void 0, __spreadArray([__assign({ class: "p-4" })], __VLS_functionalComponentArgsRest(__VLS_121), false));
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
}
// @ts-ignore
[activeDetailsPanel, activeDetailsPanel, activeDetailsPanel, activeDetailsPanel, activeDetailsPanel, activeUnitId, selectedUnitIds, selectedFeatureIds, activeScenarioEventId, activeMapLayerId,];
var __VLS_97;
// @ts-ignore
[];
var __VLS_28;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
});
exports.default = {};
