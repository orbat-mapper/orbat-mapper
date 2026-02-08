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
var ScenarioEventsPanel_vue_1 = require("@/modules/scenarioeditor/ScenarioEventsPanel.vue");
var OrbatPanel_vue_1 = require("@/modules/scenarioeditor/OrbatPanel.vue");
var CloseButton_vue_1 = require("@/components/CloseButton.vue");
var core_1 = require("@vueuse/core");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var ScenarioLayersTabPanel_vue_1 = require("@/modules/scenarioeditor/ScenarioLayersTabPanel.vue");
var pinia_1 = require("pinia");
var uiStore_1 = require("@/stores/uiStore");
var vue_1 = require("vue");
var selectedStore_1 = require("@/stores/selectedStore");
var PanelResizeHandle_vue_1 = require("@/components/PanelResizeHandle.vue");
var ScenarioSettingsPanel_vue_1 = require("@/modules/scenarioeditor/ScenarioSettingsPanel.vue");
var ScrollTabs_vue_1 = require("@/components/ScrollTabs.vue");
var ScenarioFiltersTabPanel = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/modules/scenarioeditor/ScenarioFiltersTabPanel.vue"); }); });
var emit = defineEmits(["close"]);
var mapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var activeScenarioEventId = (0, selectedStore_1.useSelectedItems)().activeScenarioEventId;
var _a = (0, core_1.useToggle)(true), showBottomPanel = _a[0], toggleBottomPanel = _a[1];
var activeTabIndex = (0, pinia_1.storeToRefs)((0, uiStore_1.useUiStore)()).activeTabIndex;
var widthStore = (0, uiStore_1.useWidthStore)();
var orbatPanelWidth = (0, pinia_1.storeToRefs)(widthStore).orbatPanelWidth;
var activeTabIndexString = (0, vue_1.computed)({
    get: function () { return activeTabIndex.value.toString(); },
    set: function (v) { return (activeTabIndex.value = parseInt(v)); },
});
(0, vue_1.onMounted)(function () {
    var padding = mapRef.value.getView().padding || [0, 0, 0, 0];
    var top = padding[0], right = padding[1], bottom = padding[2], left = padding[3];
    mapRef.value.getView().padding = [top, right, bottom, 400];
});
(0, vue_1.onUnmounted)(function () {
    var padding = mapRef.value.getView().padding;
    if (padding) {
        var top_1 = padding[0], right = padding[1], bottom = padding[2], left = padding[3];
        mapRef.value.getView().padding = [top_1, right, bottom, 0];
    }
});
function onEventClick(scenarioEvent) {
    activeScenarioEventId.value = scenarioEvent.id;
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)(__assign({ class: "pointer-events-auto relative -mt-12 hidden max-h-[80vh] overflow-auto rounded-md border-t border-b border-l border-gray-300 shadow-sm md:block dark:border-slate-700" }, { style: ({ width: __VLS_ctx.orbatPanelWidth + 'px' }) }));
/** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['-mt-12']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[80vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['md:block']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-slate-700']} */ ;
var __VLS_0 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ modelValue: (__VLS_ctx.activeTabIndexString), items: (['ORBAT', 'Events', 'Layers', 'Settings', 'Filters']), as: "div" }, { class: "hover-none:mr-3 bg-sidebar" }), { class: ({ hidden: !__VLS_ctx.showBottomPanel }) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ modelValue: (__VLS_ctx.activeTabIndexString), items: (['ORBAT', 'Events', 'Layers', 'Settings', 'Filters']), as: "div" }, { class: "hover-none:mr-3 bg-sidebar" }), { class: ({ hidden: !__VLS_ctx.showBottomPanel }) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['hover-none:mr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
var __VLS_5 = __VLS_3.slots.default;
{
    var __VLS_6 = __VLS_3.slots.right;
    var __VLS_7 = CloseButton_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onClick': {} }, { class: "bg-transparent" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "bg-transparent" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    var __VLS_12 = void 0;
    var __VLS_13 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('close');
                // @ts-ignore
                [orbatPanelWidth, activeTabIndexString, showBottomPanel, emit,];
            } });
    /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
    var __VLS_10;
    var __VLS_11;
    // @ts-ignore
    [];
}
var __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ value: "0" }, { class: "h-full pb-10" })));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "h-full pb-10" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
var __VLS_19 = __VLS_17.slots.default;
var __VLS_20 = OrbatPanel_vue_1.default;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_21), false));
// @ts-ignore
[];
var __VLS_17;
var __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ value: "1" }, { class: "p-4 pb-10" })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ value: "1" }, { class: "p-4 pb-10" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
var __VLS_30 = __VLS_28.slots.default;
var __VLS_31 = ScenarioEventsPanel_vue_1.default;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ 'onEventClick': {} })));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ 'onEventClick': {} })], __VLS_functionalComponentArgsRest(__VLS_32), false));
var __VLS_36;
var __VLS_37 = ({ eventClick: {} },
    { onEventClick: (__VLS_ctx.onEventClick) });
var __VLS_34;
var __VLS_35;
// @ts-ignore
[onEventClick,];
var __VLS_28;
var __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ value: "2" }, { class: "p-4 pb-10" })));
var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ value: "2" }, { class: "p-4 pb-10" })], __VLS_functionalComponentArgsRest(__VLS_39), false));
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
var __VLS_43 = __VLS_41.slots.default;
var __VLS_44 = ScenarioLayersTabPanel_vue_1.default;
// @ts-ignore
var __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({}));
var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_45), false));
// @ts-ignore
[];
var __VLS_41;
var __VLS_49;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49(__assign({ value: "3" }, { class: "p-4 pb-10" })));
var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ value: "3" }, { class: "p-4 pb-10" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
var __VLS_54 = __VLS_52.slots.default;
var __VLS_55 = ScenarioSettingsPanel_vue_1.default;
// @ts-ignore
var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({}));
var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_56), false));
// @ts-ignore
[];
var __VLS_52;
var __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60(__assign({ value: "4" }, { class: "" })));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign({ value: "4" }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_61), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_65 = __VLS_63.slots.default;
var __VLS_66;
/** @ts-ignore @type {typeof __VLS_components.ScenarioFiltersTabPanel} */
ScenarioFiltersTabPanel;
// @ts-ignore
var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({}));
var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_67), false));
// @ts-ignore
[];
var __VLS_63;
// @ts-ignore
[];
var __VLS_3;
var __VLS_71 = PanelResizeHandle_vue_1.default;
// @ts-ignore
var __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71(__assign(__assign({ 'onUpdate': {} }, { 'onReset': {} }), { width: (__VLS_ctx.orbatPanelWidth) })));
var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate': {} }, { 'onReset': {} }), { width: (__VLS_ctx.orbatPanelWidth) })], __VLS_functionalComponentArgsRest(__VLS_72), false));
var __VLS_76;
var __VLS_77 = ({ update: {} },
    { onUpdate: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.orbatPanelWidth = $event;
            // @ts-ignore
            [orbatPanelWidth, orbatPanelWidth,];
        } });
var __VLS_78 = ({ reset: {} },
    { onReset: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.widthStore.resetOrbatPanelWidth();
            // @ts-ignore
            [widthStore,];
        } });
var __VLS_74;
var __VLS_75;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
});
exports.default = {};
