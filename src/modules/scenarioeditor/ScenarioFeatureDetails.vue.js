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
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var vue_global_events_1 = require("vue-global-events");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
var core_1 = require("@vueuse/core");
var ScenarioFeatureMarkerSettings_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureMarkerSettings.vue");
var ScenarioFeatureStrokeSettings_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureStrokeSettings.vue");
var ScenarioFeatureArrowSettings_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureArrowSettings.vue");
var ScenarioFeatureFillSettings_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureFillSettings.vue");
var EditableLabel_vue_1 = require("@/components/EditableLabel.vue");
var selectedStore_1 = require("@/stores/selectedStore");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var tabs_1 = require("@/components/ui/tabs");
var ScrollTabs_vue_1 = require("@/components/ScrollTabs.vue");
var uiStore_1 = require("@/stores/uiStore");
var tabStore_1 = require("@/stores/tabStore");
var mainToolbarStore_1 = require("@/stores/mainToolbarStore");
var pinia_1 = require("pinia");
var scenarioActions_1 = require("@/composables/scenarioActions");
var formatting_1 = require("@/composables/formatting");
var EditMetaForm_vue_1 = require("@/modules/scenarioeditor/EditMetaForm.vue");
var EditMediaForm_vue_1 = require("@/modules/scenarioeditor/EditMediaForm.vue");
var ItemMedia_vue_1 = require("@/modules/scenarioeditor/ItemMedia.vue");
var helpers_1 = require("@/components/helpers");
var ScenarioFeatureDropdownMenu_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureDropdownMenu.vue");
var ScenarioFeatureState_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureState.vue");
var ScenarioFeatureTextSettings_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureTextSettings.vue");
var ScenarioFeatureVisibilitySettings_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureVisibilitySettings.vue");
var PanelDataGrid_vue_1 = require("@/components/PanelDataGrid.vue");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var FeatureTransformations = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/modules/scenarioeditor/FeatureTransformations.vue"); }); });
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), geo = _a.geo, groupUpdate = _a.store.groupUpdate;
var olMapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var featureSelectInteractionRef = (0, utils_1.injectStrict)(injects_1.activeFeatureSelectInteractionKey);
var featureActions = (0, scenarioActions_1.useScenarioFeatureActions)();
var _b = (0, selectedStore_1.useSelectedItems)(), selectedFeatureIds = _b.selectedFeatureIds, clearSelection = _b.clear;
var uiStore = (0, uiStore_1.useUiStore)();
var selectedTab = (0, pinia_1.storeToRefs)((0, tabStore_1.useTabStore)()).featureDetailsTab;
var toolbarStore = (0, mainToolbarStore_1.useMainToolbarStore)();
var feature = (0, vue_1.computed)(function () {
    if (props.selectedIds.size === 1) {
        return geo.getFeatureById(props.selectedIds.values().next().value).feature;
    }
    return null;
});
var featureName = (0, vue_1.ref)("DD");
var featureDescription = (0, vue_1.ref)();
var hDescription = (0, vue_1.computed)(function () { var _a; return (0, formatting_1.renderMarkdown)(((_a = feature.value) === null || _a === void 0 ? void 0 : _a.meta.description) || ""); });
var isEditMode = (0, vue_1.ref)(false);
function removeMedia() {
    feature.value && geo.updateFeature(feature.value.id, { media: [] });
}
function toggleEditMode() {
    isEditMode.value = !isEditMode.value;
    isEditMediaMode.value = false;
    if (isEditMode.value) {
        selectedTab.value = 1;
    }
}
var isEditMediaMode = (0, vue_1.ref)(false);
function toggleEditMediaMode() {
    isEditMediaMode.value = !isEditMediaMode.value;
    isEditMode.value = false;
    if (isEditMediaMode.value) {
        selectedTab.value = 1;
    }
}
function showStylePanel() {
    selectedTab.value = 0;
}
(0, vue_1.watch)(function () { var _a; return (_a = feature.value) === null || _a === void 0 ? void 0 : _a.meta.name; }, function (v) {
    var _a, _b;
    featureName.value = v !== null && v !== void 0 ? v : "";
    featureDescription.value = (_b = (_a = feature.value) === null || _a === void 0 ? void 0 : _a.meta.description) !== null && _b !== void 0 ? _b : "";
}, { immediate: true });
var geometryType = (0, vue_1.computed)(function () { var _a; return (_a = feature.value) === null || _a === void 0 ? void 0 : _a.meta.type; });
var hasStroke = (0, vue_1.computed)(function () { return geometryType.value !== "Point"; });
var hasArrows = (0, vue_1.computed)(function () { return geometryType.value === "LineString"; });
var hasFill = (0, vue_1.computed)(function () { return !["Point", "LineString"].includes(geometryType.value || ""); });
var isMultiMode = (0, vue_1.computed)(function () { return selectedFeatureIds.value.size > 1; });
var tabList = (0, vue_1.computed)(function () {
    var base = [
        { label: "Style", value: "0" },
        { label: "Details", value: "1" },
        { label: "State", value: "2" },
        { label: "Transform", value: "3" },
    ];
    if (uiStore.debugMode) {
        base.push({ label: "Debug", value: "4" });
    }
    return base;
});
var selectedTabString = (0, vue_1.computed)({
    get: function () { return selectedTab.value.toString(); },
    set: function (v) {
        selectedTab.value = Number(v);
    },
});
var isEditing = (0, vue_1.computed)(function () { return isEditMode.value || isEditMediaMode.value; });
var media = (0, vue_1.computed)(function () {
    var _a = (feature.value || {}).media, media = _a === void 0 ? [] : _a;
    return media.length ? media[0] : null;
});
function updateValue(value) {
    var _a;
    feature.value && geo.updateFeature((_a = feature.value) === null || _a === void 0 ? void 0 : _a.id, { meta: { name: value } });
}
var debouncedResetMap = (0, core_1.useDebounceFn)(function () { return featureSelectInteractionRef.value.setMap(olMapRef.value); }, 3000);
function doUpdateFeature(data) {
    var _a;
    var featureOrFeatures = isMultiMode.value
        ? __spreadArray([], props.selectedIds.values(), true) : (_a = feature.value) === null || _a === void 0 ? void 0 : _a.id;
    featureSelectInteractionRef.value.setMap(null);
    if (Array.isArray(featureOrFeatures)) {
        groupUpdate(function () { return featureOrFeatures.forEach(function (f) { return geo.updateFeature(f, data); }); }, {
            label: "batchLayer",
            value: "nil",
        });
    }
    else {
        featureOrFeatures && geo.updateFeature(featureOrFeatures, data);
    }
    if (feature.value) {
        toolbarStore.currentDrawStyle = __assign({}, feature.value.style);
    }
    debouncedResetMap();
}
function doMetaUpdate(data) {
    if (data)
        doUpdateFeature({ meta: data });
    isEditMode.value = false;
}
function updateMedia(mediaUpdate) {
    if (!mediaUpdate || !feature.value)
        return;
    var _a = feature.value.media, media = _a === void 0 ? [] : _a;
    var newMedia = __assign(__assign({}, media[0]), mediaUpdate);
    geo.updateFeature(feature.value.id, { media: [newMedia] });
    isEditMediaMode.value = false;
}
function doZoom() {
    featureActions.onFeatureAction(__spreadArray([], props.selectedIds, true), "zoom");
}
function onAction(action) {
    if (action === "removeMedia") {
        removeMedia();
        return;
    }
    featureActions.onFeatureAction(__spreadArray([], props.selectedIds, true), action);
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
if (__VLS_ctx.media) {
    var __VLS_0 = ItemMedia_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        media: (__VLS_ctx.media),
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            media: (__VLS_ctx.media),
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
if (__VLS_ctx.isMultiMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-6 mb-2 flex items-center justify-between" }));
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "font-medium" }));
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.selectedFeatureIds.size);
    var __VLS_5 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ 'onClick': {} }, { variant: "outline", type: "button", size: "sm" })));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", type: "button", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
    var __VLS_10 = void 0;
    var __VLS_11 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isMultiMode))
                    return;
                __VLS_ctx.clearSelection();
                // @ts-ignore
                [media, media, isMultiMode, selectedFeatureIds, clearSelection,];
            } });
    var __VLS_12 = __VLS_8.slots.default;
    // @ts-ignore
    [];
    var __VLS_8;
    var __VLS_9;
}
if (__VLS_ctx.feature) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "" }));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    var __VLS_13 = EditableLabel_vue_1.default;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.featureName) })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.featureName) })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_18 = void 0;
    var __VLS_19 = ({ updateValue: {} },
        { onUpdateValue: (__VLS_ctx.updateValue) });
    var __VLS_16;
    var __VLS_17;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_20 = (__VLS_ctx.getGeometryIcon(__VLS_ctx.feature));
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ class: "text-muted-foreground mr-2 size-6" })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground mr-2 size-6" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
var __VLS_25 = IconButton_vue_1.default || IconButton_vue_1.default;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ 'onClick': {} }, { title: "Zoom to feature" })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Zoom to feature" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_30;
var __VLS_31 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.doZoom();
            // @ts-ignore
            [feature, feature, featureName, updateValue, featureLayerUtils_1.getGeometryIcon, doZoom,];
        } });
var __VLS_32 = __VLS_28.slots.default;
var __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.ZoomIcon} */
vue_mdi_1.IconMagnifyExpand;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign({ class: "size-5" })));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_34), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_28;
var __VLS_29;
var __VLS_38 = IconButton_vue_1.default || IconButton_vue_1.default;
// @ts-ignore
var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ 'onClick': {} }, { title: "Change feature style" })));
var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Change feature style" })], __VLS_functionalComponentArgsRest(__VLS_39), false));
var __VLS_43;
var __VLS_44 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showStylePanel();
            // @ts-ignore
            [showStylePanel,];
        } });
var __VLS_45 = __VLS_41.slots.default;
var __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.StyleIcon} */
vue_mdi_1.IconPalette;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ class: "size-5" })));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_47), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_41;
var __VLS_42;
var __VLS_51 = IconButton_vue_1.default || IconButton_vue_1.default;
// @ts-ignore
var __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51(__assign({ 'onClick': {} }, { title: "Edit feature data" })));
var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Edit feature data" })], __VLS_functionalComponentArgsRest(__VLS_52), false));
var __VLS_56;
var __VLS_57 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleEditMode();
            // @ts-ignore
            [toggleEditMode,];
        } });
var __VLS_58 = __VLS_54.slots.default;
var __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.EditIcon} */
vue_mdi_1.IconPencil;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59(__assign({ class: "size-5" })));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_60), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_54;
var __VLS_55;
var __VLS_64 = IconButton_vue_1.default || IconButton_vue_1.default;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64(__assign({ 'onClick': {} }, { title: "Add/modify image" })));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Add/modify image" })], __VLS_functionalComponentArgsRest(__VLS_65), false));
var __VLS_69;
var __VLS_70 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleEditMediaMode();
            // @ts-ignore
            [toggleEditMediaMode,];
        } });
var __VLS_71 = __VLS_67.slots.default;
var __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.ImageIcon} */
vue_mdi_1.IconImage;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72(__assign({ class: "size-5" })));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_73), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_67;
var __VLS_68;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_77 = ScenarioFeatureDropdownMenu_vue_1.default;
// @ts-ignore
var __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77(__assign({ 'onAction': {} })));
var __VLS_79 = __VLS_78.apply(void 0, __spreadArray([__assign({ 'onAction': {} })], __VLS_functionalComponentArgsRest(__VLS_78), false));
var __VLS_82;
var __VLS_83 = ({ action: {} },
    { onAction: (__VLS_ctx.onAction) });
var __VLS_80;
var __VLS_81;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mx-4" }));
/** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
var __VLS_84 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
// @ts-ignore
var __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    items: (__VLS_ctx.tabList),
    modelValue: (__VLS_ctx.selectedTabString),
}));
var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.tabList),
        modelValue: (__VLS_ctx.selectedTabString),
    }], __VLS_functionalComponentArgsRest(__VLS_85), false));
var __VLS_89 = __VLS_87.slots.default;
var __VLS_90;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90(__assign({ value: "0" }, { class: "mx-4" })));
var __VLS_92 = __VLS_91.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_91), false));
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
var __VLS_95 = __VLS_93.slots.default;
var __VLS_96 = PanelDataGrid_vue_1.default || PanelDataGrid_vue_1.default;
// @ts-ignore
var __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96(__assign({ class: "mt-4" })));
var __VLS_98 = __VLS_97.apply(void 0, __spreadArray([__assign({ class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_97), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_101 = __VLS_99.slots.default;
if (__VLS_ctx.feature) {
    var __VLS_102 = ScenarioFeatureVisibilitySettings_vue_1.default;
    // @ts-ignore
    var __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102(__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })));
    var __VLS_104 = __VLS_103.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })], __VLS_functionalComponentArgsRest(__VLS_103), false));
    var __VLS_107 = void 0;
    var __VLS_108 = ({ update: {} },
        { onUpdate: (__VLS_ctx.doUpdateFeature) });
    var __VLS_105;
    var __VLS_106;
}
if (__VLS_ctx.feature &&
    (__VLS_ctx.geometryType === 'Point' || __VLS_ctx.geometryType === 'GeometryCollection')) {
    var __VLS_109 = ScenarioFeatureMarkerSettings_vue_1.default;
    // @ts-ignore
    var __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109(__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })));
    var __VLS_111 = __VLS_110.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })], __VLS_functionalComponentArgsRest(__VLS_110), false));
    var __VLS_114 = void 0;
    var __VLS_115 = ({ update: {} },
        { onUpdate: (__VLS_ctx.doUpdateFeature) });
    var __VLS_112;
    var __VLS_113;
}
if (__VLS_ctx.feature && __VLS_ctx.hasStroke) {
    var __VLS_116 = ScenarioFeatureStrokeSettings_vue_1.default;
    // @ts-ignore
    var __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116(__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })));
    var __VLS_118 = __VLS_117.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })], __VLS_functionalComponentArgsRest(__VLS_117), false));
    var __VLS_121 = void 0;
    var __VLS_122 = ({ update: {} },
        { onUpdate: (__VLS_ctx.doUpdateFeature) });
    var __VLS_119;
    var __VLS_120;
}
if (__VLS_ctx.feature && __VLS_ctx.hasArrows) {
    var __VLS_123 = ScenarioFeatureArrowSettings_vue_1.default;
    // @ts-ignore
    var __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123(__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })));
    var __VLS_125 = __VLS_124.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })], __VLS_functionalComponentArgsRest(__VLS_124), false));
    var __VLS_128 = void 0;
    var __VLS_129 = ({ update: {} },
        { onUpdate: (__VLS_ctx.doUpdateFeature) });
    var __VLS_126;
    var __VLS_127;
}
if (__VLS_ctx.feature && __VLS_ctx.hasFill) {
    var __VLS_130 = ScenarioFeatureFillSettings_vue_1.default;
    // @ts-ignore
    var __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130(__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })));
    var __VLS_132 = __VLS_131.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })], __VLS_functionalComponentArgsRest(__VLS_131), false));
    var __VLS_135 = void 0;
    var __VLS_136 = ({ update: {} },
        { onUpdate: (__VLS_ctx.doUpdateFeature) });
    var __VLS_133;
    var __VLS_134;
}
if (__VLS_ctx.feature && __VLS_ctx.geometryType !== 'Circle') {
    var __VLS_137 = ScenarioFeatureTextSettings_vue_1.default;
    // @ts-ignore
    var __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137(__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })));
    var __VLS_139 = __VLS_138.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { feature: (__VLS_ctx.feature) })], __VLS_functionalComponentArgsRest(__VLS_138), false));
    var __VLS_142 = void 0;
    var __VLS_143 = ({ update: {} },
        { onUpdate: (__VLS_ctx.doUpdateFeature) });
    var __VLS_140;
    var __VLS_141;
}
// @ts-ignore
[feature, feature, feature, feature, feature, feature, feature, feature, feature, feature, feature, feature, onAction, tabList, selectedTabString, doUpdateFeature, doUpdateFeature, doUpdateFeature, doUpdateFeature, doUpdateFeature, doUpdateFeature, geometryType, geometryType, geometryType, hasStroke, hasArrows, hasFill,];
var __VLS_99;
// @ts-ignore
[];
var __VLS_93;
var __VLS_144;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144(__assign({ value: "1" }, { class: "mx-4" })));
var __VLS_146 = __VLS_145.apply(void 0, __spreadArray([__assign({ value: "1" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_145), false));
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
var __VLS_149 = __VLS_147.slots.default;
if (!__VLS_ctx.isEditing) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose dark:prose-invert mt-4" }));
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose prose-sm dark:prose-invert" }));
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.hDescription) }), null, null);
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
}
else if (__VLS_ctx.isEditMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    var __VLS_150 = EditMetaForm_vue_1.default;
    // @ts-ignore
    var __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150(__assign(__assign({ 'onUpdate': {} }, { 'onCancel': {} }), { item: (__VLS_ctx.feature) })));
    var __VLS_152 = __VLS_151.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate': {} }, { 'onCancel': {} }), { item: (__VLS_ctx.feature) })], __VLS_functionalComponentArgsRest(__VLS_151), false));
    var __VLS_155 = void 0;
    var __VLS_156 = ({ update: {} },
        { onUpdate: (__VLS_ctx.doMetaUpdate) });
    var __VLS_157 = ({ cancel: {} },
        { onCancel: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(!__VLS_ctx.isEditing))
                    return;
                if (!(__VLS_ctx.isEditMode))
                    return;
                __VLS_ctx.toggleEditMode();
                // @ts-ignore
                [feature, toggleEditMode, isEditing, hDescription, isEditMode, doMetaUpdate,];
            } });
    var __VLS_153;
    var __VLS_154;
}
else if (__VLS_ctx.isEditMediaMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    var __VLS_158 = EditMediaForm_vue_1.default;
    // @ts-ignore
    var __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158(__assign(__assign({ 'onCancel': {} }, { 'onUpdate': {} }), { media: (__VLS_ctx.media) })));
    var __VLS_160 = __VLS_159.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onUpdate': {} }), { media: (__VLS_ctx.media) })], __VLS_functionalComponentArgsRest(__VLS_159), false));
    var __VLS_163 = void 0;
    var __VLS_164 = ({ cancel: {} },
        { onCancel: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(!__VLS_ctx.isEditing))
                    return;
                if (!!(__VLS_ctx.isEditMode))
                    return;
                if (!(__VLS_ctx.isEditMediaMode))
                    return;
                __VLS_ctx.toggleEditMediaMode();
                // @ts-ignore
                [media, toggleEditMediaMode, isEditMediaMode,];
            } });
    var __VLS_165 = ({ update: {} },
        { onUpdate: (__VLS_ctx.updateMedia) });
    var __VLS_161;
    var __VLS_162;
}
// @ts-ignore
[updateMedia,];
var __VLS_147;
var __VLS_166;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_167 = __VLS_asFunctionalComponent1(__VLS_166, new __VLS_166(__assign({ value: "2" }, { class: "mx-4" })));
var __VLS_168 = __VLS_167.apply(void 0, __spreadArray([__assign({ value: "2" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_167), false));
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
var __VLS_171 = __VLS_169.slots.default;
if (__VLS_ctx.feature) {
    var __VLS_172 = ScenarioFeatureState_vue_1.default;
    // @ts-ignore
    var __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({
        feature: (__VLS_ctx.feature),
    }));
    var __VLS_174 = __VLS_173.apply(void 0, __spreadArray([{
            feature: (__VLS_ctx.feature),
        }], __VLS_functionalComponentArgsRest(__VLS_173), false));
}
// @ts-ignore
[feature, feature,];
var __VLS_169;
var __VLS_177;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177(__assign({ value: "3" }, { class: "mx-4" })));
var __VLS_179 = __VLS_178.apply(void 0, __spreadArray([__assign({ value: "3" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_178), false));
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
var __VLS_182 = __VLS_180.slots.default;
var __VLS_183;
/** @ts-ignore @type {typeof __VLS_components.FeatureTransformations} */
FeatureTransformations;
// @ts-ignore
var __VLS_184 = __VLS_asFunctionalComponent1(__VLS_183, new __VLS_183(__assign({ class: "mt-4" })));
var __VLS_185 = __VLS_184.apply(void 0, __spreadArray([__assign({ class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_184), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
// @ts-ignore
[];
var __VLS_180;
if (__VLS_ctx.uiStore.debugMode) {
    var __VLS_188 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_189 = __VLS_asFunctionalComponent1(__VLS_188, new __VLS_188(__assign({ value: "4" }, { class: "prose prose-sm dark:prose-invert mx-4 max-w-none" })));
    var __VLS_190 = __VLS_189.apply(void 0, __spreadArray([__assign({ value: "4" }, { class: "prose prose-sm dark:prose-invert mx-4 max-w-none" })], __VLS_functionalComponentArgsRest(__VLS_189), false));
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
    var __VLS_193 = __VLS_191.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({});
    (__VLS_ctx.feature);
    // @ts-ignore
    [feature, uiStore,];
    var __VLS_191;
}
// @ts-ignore
[];
var __VLS_87;
if (__VLS_ctx.uiStore.shortcutsEnabled) {
    var __VLS_194 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.GlobalEvents} */
    vue_global_events_1.GlobalEvents;
    // @ts-ignore
    var __VLS_195 = __VLS_asFunctionalComponent1(__VLS_194, new __VLS_194(__assign({ 'onKeyup': {} }, { filter: (__VLS_ctx.inputEventFilter) })));
    var __VLS_196 = __VLS_195.apply(void 0, __spreadArray([__assign({ 'onKeyup': {} }, { filter: (__VLS_ctx.inputEventFilter) })], __VLS_functionalComponentArgsRest(__VLS_195), false));
    var __VLS_199 = void 0;
    var __VLS_200 = ({ keyup: {} },
        { onKeyup: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.uiStore.shortcutsEnabled))
                    return;
                __VLS_ctx.toggleEditMode();
                // @ts-ignore
                [toggleEditMode, uiStore, helpers_1.inputEventFilter,];
            } });
    var __VLS_197;
    var __VLS_198;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
