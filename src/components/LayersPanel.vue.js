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
var geoStore_1 = require("@/stores/geoStore");
var Vector_1 = require("ol/layer/Vector");
var Group_1 = require("ol/layer/Group");
var solid_1 = require("@heroicons/vue/24/solid");
var BaseLayerSwitcher_vue_1 = require("./BaseLayerSwitcher.vue");
var proj_1 = require("ol/proj");
var OpacityInput_vue_1 = require("./OpacityInput.vue");
var ol_1 = require("ol");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var Image_1 = require("ol/layer/Image");
var baseLayersStore_1 = require("@/stores/baseLayersStore");
var geoStore = (0, geoStore_1.useGeoStore)();
var mapSettings = (0, mapSettingsStore_1.useMapSettingsStore)();
var baseLayersStore = (0, baseLayersStore_1.useBaseLayersStore)();
var vectorLayers = (0, vue_1.ref)([]);
// Adapt store layers to the format expected by BaseLayerSwitcher
// BaseLayerSwitcher expects LayerInfo<any>[] but mostly cares about id, title, description
var baseLayers = (0, vue_1.computed)(function () {
    return baseLayersStore.layers.map(function (l) { return ({
        id: l.name,
        name: l.name,
        title: l.title,
        visible: baseLayersStore.activeLayerName === l.name,
        zIndex: 0,
        opacity: l.opacity,
        layer: null, // We don't need the OL layer instance here for the switcher anymore
        description: "",
        layerType: "baselayer",
    }); });
});
// We need a writable computed or something to handle v-model from BaseLayerSwitcher
var activeBaseLayer = (0, vue_1.computed)({
    get: function () { return baseLayers.value.find(function (l) { return l.name === baseLayersStore.activeLayerName; }); },
    set: function (layerInfo) {
        if (layerInfo) {
            baseLayersStore.selectLayer(layerInfo.name);
            mapSettings.baseLayerName = layerInfo.name;
        }
    },
});
var mapView = (0, vue_1.computed)(function () {
    if (!geoStore.olMap)
        return;
    var view = geoStore.olMap.getView();
    return {
        center: (0, proj_1.toLonLat)(view.getCenter() || [0, 0], view.getProjection()),
        zoom: view.getZoom(),
    };
});
(0, vue_1.watch)(function () { return geoStore.olMap; }, function (v) { return v && updateLayers(); }, { immediate: true });
function updateLayers() {
    if (!geoStore.olMap)
        return;
    var transformLayer = function (layer) {
        var l = {
            id: (0, ol_1.getUid)(layer),
            title: layer.get("title") || layer.get("name"),
            name: layer.get("name"),
            layerType: layer.get("layerType"),
            visible: layer.getVisible(),
            zIndex: layer.getZIndex() || 0,
            opacity: layer.getOpacity(),
            layer: (0, vue_1.markRaw)(layer),
            subLayers: [],
        };
        if (layer instanceof Group_1.default) {
            l.subLayers = layer
                .getLayers()
                .getArray()
                .filter(function (l) { return l.get("title"); })
                .map(transformLayer);
        }
        return l;
    };
    var mappedLayers = geoStore.olMap
        .getAllLayers()
        .filter(function (l) { return l.get("title"); })
        .map(transformLayer);
    // We filter out baserlayers from here, as they are now managed by baseLayersStore
    // Now we only want vector/other layers here.
    vectorLayers.value = mappedLayers.filter(function (_a) {
        var layer = _a.layer, layerType = _a.layerType;
        return (layer instanceof Vector_1.default ||
            layer instanceof Group_1.default ||
            layer instanceof Image_1.default) &&
            layerType !== "baselayer";
    });
}
var toggleLayer = function (l) {
    l.visible = !l.visible;
    l.layer.setOpacity(l.opacity);
    l.layer.setVisible(l.visible);
};
function updateOpacity(l, opacity) {
    if (l.layerType === "baselayer") {
        baseLayersStore.setLayerOpacity(l.name, opacity);
    }
    else {
        l.opacity = opacity;
        l.layer.setOpacity(opacity);
    }
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-xs font-medium tracking-wider uppercase" }));
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
var __VLS_0 = BaseLayerSwitcher_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onUpdate:layerOpacity': {} }, { class: "mt-4" }), { settings: (__VLS_ctx.baseLayers), modelValue: (__VLS_ctx.activeBaseLayer) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:layerOpacity': {} }, { class: "mt-4" }), { settings: (__VLS_ctx.baseLayers), modelValue: (__VLS_ctx.activeBaseLayer) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:layerOpacity': {} },
    { 'onUpdate:layerOpacity': (__VLS_ctx.updateOpacity) });
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-4 text-xs font-medium tracking-wider uppercase" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-card mt-4 overflow-hidden rounded-md shadow-sm" }));
/** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "divide-y" }));
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
var _loop_1 = function (layer) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ key: (layer.id) }, { class: "px-6 py-4" }));
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "flex-auto truncate text-sm" }));
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (layer.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "ml-2 flex shrink-0 items-center" }));
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    var __VLS_7 = OpacityInput_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (layer.opacity) })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { modelValue: (layer.opacity) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    var __VLS_12 = void 0;
    var __VLS_13 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.updateOpacity(layer, $event);
                // @ts-ignore
                [baseLayers, activeBaseLayer, updateOpacity, updateOpacity, vectorLayers,];
            } });
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleLayer(layer);
            // @ts-ignore
            [toggleLayer,];
        } }, { class: "text-muted-foreground ml-4 h-5 w-5" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    if (layer.visible) {
        var __VLS_14 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.EyeIcon} */
        solid_1.EyeIcon;
        // @ts-ignore
        var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
        var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_15), false));
    }
    else {
        var __VLS_19 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.EyeSlashIcon} */
        solid_1.EyeSlashIcon;
        // @ts-ignore
        var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
        var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_20), false));
    }
    // @ts-ignore
    [];
};
var __VLS_10, __VLS_11;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.vectorLayers)); _i < _a.length; _i++) {
    var layer = _a[_i][0];
    _loop_1(layer);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)(__assign({ class: "text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
(__VLS_ctx.mapView);
// @ts-ignore
[mapView,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
