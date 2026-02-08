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
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var EditableLabel_vue_1 = require("@/components/EditableLabel.vue");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var core_1 = require("@vueuse/core");
var eventKeys_1 = require("@/components/eventKeys");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var scenarioMapLayers_1 = require("@/modules/scenarioeditor/scenarioMapLayers");
var selectedStore_1 = require("@/stores/selectedStore");
var tabs_1 = require("@/components/ui/tabs");
var ImageMapLayerSettings_vue_1 = require("@/modules/scenarioeditor/ImageMapLayerSettings.vue");
var TileMapLayerSettings_vue_1 = require("@/modules/scenarioeditor/TileMapLayerSettings.vue");
var uiStore_1 = require("@/stores/uiStore");
var MapLayerMetaSettings_vue_1 = require("@/modules/scenarioeditor/MapLayerMetaSettings.vue");
var ScrollTabs_vue_1 = require("@/components/ScrollTabs.vue");
var props = defineProps();
var imageBus = (0, core_1.useEventBus)(eventKeys_1.imageLayerAction);
var uiStore = (0, uiStore_1.useUiStore)();
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), geo = _a.geo, groupUpdate = _a.store.groupUpdate;
var clear = (0, selectedStore_1.useSelectedItems)().clear;
var mapLayer = (0, vue_1.computed)(function () { return geo.getMapLayerById(props.layerId); });
var isVisible = (0, vue_1.computed)(function () { var _a, _b; return !((_b = (_a = mapLayer.value) === null || _a === void 0 ? void 0 : _a.isHidden) !== null && _b !== void 0 ? _b : false); });
var layerName = (0, vue_1.ref)("DD");
var selectedTab = (0, vue_1.ref)(0);
var opacity = (0, vue_1.computed)({
    get: function () { var _a; return (_a = mapLayer.value) === null || _a === void 0 ? void 0 : _a.opacity; },
    set: function (v) { return updateLayer({ opacity: v }, { undoable: false, debounce: false }); },
});
(0, vue_1.watch)(function () { var _a; return (_a = mapLayer.value) === null || _a === void 0 ? void 0 : _a.name; }, function (v) {
    layerName.value = v !== null && v !== void 0 ? v : "";
}, { immediate: true });
(0, vue_1.watch)(mapLayer, function (v) {
    if (v && v._isNew)
        selectedTab.value = 1;
}, { immediate: true });
var tabList = (0, vue_1.computed)(function () {
    var base = [
        { label: "Details", value: "0" },
        { label: "Settings", value: "1" },
    ];
    if (uiStore.debugMode) {
        base.push({ label: "Debug", value: "2" });
    }
    return base;
});
var selectedTabString = (0, vue_1.computed)({
    get: function () { return selectedTab.value.toString(); },
    set: function (v) {
        selectedTab.value = Number(v);
    },
});
function updateValue(name, value) {
    var _a;
    mapLayer.value && geo.updateMapLayer(mapLayer.value.id, (_a = {}, _a[name] = value, _a));
}
var debouncedUpdate = (0, core_1.useDebounceFn)(function (data) {
    geo.updateMapLayer(props.layerId, data, { noEmit: true });
}, 500);
function updateLayer(data, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var debounce = (_a = options.debounce) !== null && _a !== void 0 ? _a : false;
    var undoable = (_b = options.undoable) !== null && _b !== void 0 ? _b : !debounce;
    debounce && debouncedUpdate(data);
    mapLayer.value &&
        geo.updateMapLayer(props.layerId, data, { undoable: undoable, emitOnly: debounce });
}
var opacityAsPercent = (0, vue_1.computed)(function () { return (opacity.value * 100).toFixed(0); });
var imageLayerMenuItems = [
    { label: "Zoom to", action: "zoom" },
    { label: "Delete", action: "delete" },
];
function onImageLayerAction(action) {
    if (action === "zoom")
        imageBus.emit({ action: action, id: mapLayer.value.id });
    if (action === "delete") {
        geo.deleteMapLayer(mapLayer.value.id);
        clear();
    }
}
function toggleLayerVisibility() {
    var _a;
    updateLayer({ isHidden: !((_a = mapLayer.value.isHidden) !== null && _a !== void 0 ? _a : false) });
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.mapLayer) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
    var __VLS_0 = EditableLabel_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.layerName) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.layerName) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ updateValue: {} },
        { onUpdateValue: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapLayer))
                    return;
                __VLS_ctx.updateValue('name', $event);
                // @ts-ignore
                [mapLayer, layerName, updateValue,];
            } });
    var __VLS_3;
    var __VLS_4;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-auto items-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    var __VLS_7 = (__VLS_ctx.getMapLayerIcon(__VLS_ctx.mapLayer));
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "text-muted-foreground mr-2 h-7 w-7" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground mr-2 h-7 w-7" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign({ type: "range", min: "0", max: "1", step: "0.01" }, { class: "transparent h-1 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-red-800" }));
    (__VLS_ctx.opacity);
    /** @type {__VLS_StyleScopedClasses['transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['appearance-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-800']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-2 w-8 shrink-0 text-sm" }));
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.opacityAsPercent);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "ml-2 flex shrink-0 items-center" }));
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    var __VLS_12 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ 'onClick': {} }, { title: "Zoom to layer extent" })));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Zoom to layer extent" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
    var __VLS_17 = void 0;
    var __VLS_18 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapLayer))
                    return;
                __VLS_ctx.imageBus.emit({ action: 'zoom', id: __VLS_ctx.layerId });
                // @ts-ignore
                [mapLayer, scenarioMapLayers_1.getMapLayerIcon, opacity, opacityAsPercent, imageBus, layerId,];
            } });
    var __VLS_19 = __VLS_15.slots.default;
    var __VLS_20 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ZoomIcon} */
    vue_mdi_1.IconMagnifyExpand;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ class: "h-6 w-6" })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ class: "h-6 w-6" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    // @ts-ignore
    [];
    var __VLS_15;
    var __VLS_16;
    var __VLS_25 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ 'onClick': {} }, { title: "Toggle visibility" })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Toggle visibility" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = void 0;
    var __VLS_31 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapLayer))
                    return;
                __VLS_ctx.toggleLayerVisibility();
                // @ts-ignore
                [toggleLayerVisibility,];
            } });
    var __VLS_32 = __VLS_28.slots.default;
    if (__VLS_ctx.isVisible) {
        var __VLS_33 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconEye} */
        vue_mdi_1.IconEye;
        // @ts-ignore
        var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign({ class: "h-6 w-6" })));
        var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ class: "h-6 w-6" })], __VLS_functionalComponentArgsRest(__VLS_34), false));
        /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    }
    else {
        var __VLS_38 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconEyeOff} */
        vue_mdi_1.IconEyeOff;
        // @ts-ignore
        var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ class: "h-6 w-6" })));
        var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ class: "h-6 w-6" })], __VLS_functionalComponentArgsRest(__VLS_39), false));
        /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    }
    // @ts-ignore
    [isVisible,];
    var __VLS_28;
    var __VLS_29;
    var __VLS_43 = DotsMenu_vue_1.default;
    // @ts-ignore
    var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43(__assign({ 'onAction': {} }, { items: (__VLS_ctx.imageLayerMenuItems) })));
    var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { items: (__VLS_ctx.imageLayerMenuItems) })], __VLS_functionalComponentArgsRest(__VLS_44), false));
    var __VLS_48 = void 0;
    var __VLS_49 = ({ action: {} },
        { onAction: (__VLS_ctx.onImageLayerAction) });
    var __VLS_46;
    var __VLS_47;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mx-4" }));
    /** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
    var __VLS_50 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
    // @ts-ignore
    var __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        items: (__VLS_ctx.tabList),
        modelValue: (__VLS_ctx.selectedTabString),
    }));
    var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([{
            items: (__VLS_ctx.tabList),
            modelValue: (__VLS_ctx.selectedTabString),
        }], __VLS_functionalComponentArgsRest(__VLS_51), false));
    var __VLS_55 = __VLS_53.slots.default;
    var __VLS_56 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56(__assign({ value: "0" }, { class: "mx-4 pt-4" })));
    var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "mx-4 pt-4" })], __VLS_functionalComponentArgsRest(__VLS_57), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    var __VLS_61 = __VLS_59.slots.default;
    var __VLS_62 = MapLayerMetaSettings_vue_1.default;
    // @ts-ignore
    var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62(__assign({ 'onUpdate': {} }, { layer: (__VLS_ctx.mapLayer) })));
    var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { layer: (__VLS_ctx.mapLayer) })], __VLS_functionalComponentArgsRest(__VLS_63), false));
    var __VLS_67 = void 0;
    var __VLS_68 = ({ update: {} },
        { onUpdate: (__VLS_ctx.updateLayer) });
    var __VLS_65;
    var __VLS_66;
    // @ts-ignore
    [mapLayer, imageLayerMenuItems, onImageLayerAction, tabList, selectedTabString, updateLayer,];
    var __VLS_59;
    var __VLS_69 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69(__assign({ value: "1" }, { class: "mx-4" })));
    var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([__assign({ value: "1" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_70), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    var __VLS_74 = __VLS_72.slots.default;
    if (__VLS_ctx.mapLayer.type === 'ImageLayer') {
        var __VLS_75 = ImageMapLayerSettings_vue_1.default;
        // @ts-ignore
        var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75(__assign({ 'onUpdate': {} }, { layer: (__VLS_ctx.mapLayer), key: (__VLS_ctx.mapLayer.id) })));
        var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { layer: (__VLS_ctx.mapLayer), key: (__VLS_ctx.mapLayer.id) })], __VLS_functionalComponentArgsRest(__VLS_76), false));
        var __VLS_80 = void 0;
        var __VLS_81 = ({ update: {} },
            { onUpdate: (__VLS_ctx.updateLayer) });
        var __VLS_78;
        var __VLS_79;
    }
    else if (__VLS_ctx.mapLayer.type === 'TileJSONLayer' || __VLS_ctx.mapLayer.type === 'XYZLayer') {
        var __VLS_82 = TileMapLayerSettings_vue_1.default;
        // @ts-ignore
        var __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82(__assign(__assign({ 'onUpdate': {} }, { 'onAction': {} }), { layer: (__VLS_ctx.mapLayer) })));
        var __VLS_84 = __VLS_83.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate': {} }, { 'onAction': {} }), { layer: (__VLS_ctx.mapLayer) })], __VLS_functionalComponentArgsRest(__VLS_83), false));
        var __VLS_87 = void 0;
        var __VLS_88 = ({ update: {} },
            { onUpdate: (__VLS_ctx.updateLayer) });
        var __VLS_89 = ({ action: {} },
            { onAction: (__VLS_ctx.onImageLayerAction) });
        var __VLS_85;
        var __VLS_86;
    }
    // @ts-ignore
    [mapLayer, mapLayer, mapLayer, mapLayer, mapLayer, mapLayer, onImageLayerAction, updateLayer, updateLayer,];
    var __VLS_72;
    if (__VLS_ctx.uiStore.debugMode) {
        var __VLS_90 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
        tabs_1.TabsContent;
        // @ts-ignore
        var __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90(__assign({ value: "2" }, { class: "prose prose-sm dark:prose-invert mx-4 max-w-none" })));
        var __VLS_92 = __VLS_91.apply(void 0, __spreadArray([__assign({ value: "2" }, { class: "prose prose-sm dark:prose-invert mx-4 max-w-none" })], __VLS_functionalComponentArgsRest(__VLS_91), false));
        /** @type {__VLS_StyleScopedClasses['prose']} */ ;
        /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
        var __VLS_95 = __VLS_93.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({});
        (__VLS_ctx.mapLayer);
        // @ts-ignore
        [mapLayer, uiStore,];
        var __VLS_93;
    }
    // @ts-ignore
    [];
    var __VLS_53;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
