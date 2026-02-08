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
var MapContainer_vue_1 = require("./MapContainer.vue");
var geoStore_1 = require("@/stores/geoStore");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var ScenarioMapLogic_vue_1 = require("@/components/ScenarioMapLogic.vue");
var MapContextMenu_vue_1 = require("@/components/MapContextMenu.vue");
var mapViewStore_1 = require("@/stores/mapViewStore");
var emit = defineEmits();
var mapLogicComponent = (0, vue_1.ref)(null);
var mapSettings = (0, mapSettingsStore_1.useMapSettingsStore)();
var mapViewStore = (0, mapViewStore_1.useMapViewStore)();
var mapRef = (0, vue_1.shallowRef)();
var geoStore = (0, geoStore_1.useGeoStore)();
var onMapReady = function (olMap) {
    mapRef.value = olMap;
    geoStore.olMap = olMap;
};
function onMoveEnd(_a) {
    var _b;
    var view = _a.view;
    mapViewStore.zoomLevel = (_b = view.getZoom()) !== null && _b !== void 0 ? _b : 0;
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background relative" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
var __VLS_0 = MapContextMenu_vue_1.default || MapContextMenu_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    mapRef: (__VLS_ctx.mapRef),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        mapRef: (__VLS_ctx.mapRef),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
{
    var __VLS_5 = __VLS_3.slots.default;
    var onContextMenu = __VLS_vSlot(__VLS_5)[0].onContextMenu;
    var __VLS_6 = MapContainer_vue_1.default;
    // @ts-ignore
    var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign(__assign(__assign(__assign({ 'onReady': {} }, { 'onDragover': {} }), { 'onContextmenu': {} }), { 'onMoveend': {} }), { baseLayerName: (__VLS_ctx.mapSettings.baseLayerName) })));
    var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onReady': {} }, { 'onDragover': {} }), { 'onContextmenu': {} }), { 'onMoveend': {} }), { baseLayerName: (__VLS_ctx.mapSettings.baseLayerName) })], __VLS_functionalComponentArgsRest(__VLS_7), false));
    var __VLS_11 = void 0;
    var __VLS_12 = ({ ready: {} },
        { onReady: (__VLS_ctx.onMapReady) });
    var __VLS_13 = ({ dragover: {} },
        { onDragover: function () { } });
    var __VLS_14 = ({ contextmenu: {} },
        { onContextmenu: (onContextMenu) });
    var __VLS_15 = ({ moveend: {} },
        { onMoveend: (__VLS_ctx.onMoveEnd) });
    var __VLS_9;
    var __VLS_10;
    // @ts-ignore
    [mapRef, mapSettings, onMapReady, onMoveEnd,];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
if (__VLS_ctx.mapRef) {
    var __VLS_16 = ScenarioMapLogic_vue_1.default;
    // @ts-ignore
    var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign({ 'onMapReady': {} }, { ref: "mapLogicComponent", olMap: (__VLS_ctx.mapRef) })));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign({ 'onMapReady': {} }, { ref: "mapLogicComponent", olMap: (__VLS_ctx.mapRef) })], __VLS_functionalComponentArgsRest(__VLS_17), false));
    var __VLS_21 = void 0;
    var __VLS_22 = ({ mapReady: {} },
        { onMapReady: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef))
                    return;
                __VLS_ctx.emit('map-ready', $event);
                // @ts-ignore
                [mapRef, mapRef, emit,];
            } });
    var __VLS_23 = {};
    var __VLS_19;
    var __VLS_20;
}
var __VLS_25 = {};
// @ts-ignore
var __VLS_24 = __VLS_23, __VLS_26 = __VLS_25;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
});
var __VLS_export = {};
exports.default = {};
