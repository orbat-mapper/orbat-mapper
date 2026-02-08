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
var MapContainer_vue_1 = require("../components/MapContainer.vue");
var vue_1 = require("vue");
var MeasurementToolbar_vue_1 = require("../components/MeasurementToolbar.vue");
var MapEditToolbar_vue_1 = require("../components/MapEditToolbar.vue");
var Vector_1 = require("ol/layer/Vector");
var Vector_2 = require("ol/source/Vector");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var proj_1 = require("ol/proj");
var core_1 = require("@vueuse/core");
var Observable_1 = require("ol/Observable");
var utils_1 = require("@/geo/utils");
var geoMapLocation_1 = require("@/composables/geoMapLocation");
var mapRef = (0, vue_1.shallowRef)();
var loc = (0, vue_1.ref)("");
var nn = (0, vue_1.ref)();
var vectorLayer = new Vector_1.default({
    source: new Vector_2.default(),
    properties: {
        title: "Test layer",
    },
});
var onMapReady = function (olMap) {
    mapRef.value = olMap;
    olMap.addLayer(vectorLayer);
    nn.value = (0, geoMapLocation_1.useGetMapLocation)(olMap);
    nn.value.onGetLocation(function (location) {
        loc.value = (0, utils_1.formatPosition)(location);
    });
};
function onModify(features) {
    console.log("Modified feature(s)", features);
}
function onAdd(feature, layer) {
    console.log("Added feature", feature.getProperties(), layer.getProperties());
}
function doGetLocation() {
    var olMap = (0, vue_1.unref)(mapRef);
    var stop = (0, core_1.onClickOutside)(olMap.getTargetElement(), function (e) {
        console.log("click outside", e);
        e.stopPropagation();
    });
    var prevCursor = olMap.getTargetElement().style.cursor;
    olMap.getTargetElement().style.cursor = "crosshair";
    var stopEsc = (0, core_1.onKeyStroke)("Escape", function () { return cleanUp(); });
    function cleanUp() {
        console.log("Cleanup");
        olMap.getTargetElement().style.cursor = prevCursor;
        stop && stop();
        (0, Observable_1.unByKey)(a);
        stopEsc && stopEsc();
    }
    var a = olMap.once("click", function (event) {
        loc.value = (0, utils_1.formatPosition)((0, proj_1.toLonLat)(event.coordinate));
        event.stopPropagation();
        cleanUp();
    });
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "h-full w-full" }));
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_0 = MapContainer_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onReady': {} }, { class: "h-full w-full" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onReady': {} }, { class: "h-full w-full" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ ready: {} },
    { onReady: (__VLS_ctx.onMapReady) });
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.mapRef) {
    var __VLS_7 = MapEditToolbar_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign(__assign(__assign({ 'onModify': {} }, { 'onAdd': {} }), { olMap: (__VLS_ctx.mapRef) }), { class: "absolute top-[150px] left-3" }), { layer: (__VLS_ctx.vectorLayer), addMultiple: true })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onModify': {} }, { 'onAdd': {} }), { olMap: (__VLS_ctx.mapRef) }), { class: "absolute top-[150px] left-3" }), { layer: (__VLS_ctx.vectorLayer), addMultiple: true })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    var __VLS_12 = void 0;
    var __VLS_13 = ({ modify: {} },
        { onModify: (__VLS_ctx.onModify) });
    var __VLS_14 = ({ add: {} },
        { onAdd: (__VLS_ctx.onAdd) });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[150px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-3']} */ ;
    var __VLS_10;
    var __VLS_11;
}
if (__VLS_ctx.mapRef) {
    var __VLS_15 = MeasurementToolbar_vue_1.default;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ olMap: (__VLS_ctx.mapRef) }, { class: "absolute bottom-4 left-3" })));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ olMap: (__VLS_ctx.mapRef) }, { class: "absolute bottom-4 left-3" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-3']} */ ;
}
if (__VLS_ctx.nn) {
    var __VLS_20 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign(__assign({ 'onClick': {} }, { class: "fixed top-20 left-2" }), { class: ({ 'bg-red-100': __VLS_ctx.nn.isActive }) })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { class: "fixed top-20 left-2" }), { class: ({ 'bg-red-100': __VLS_ctx.nn.isActive }) })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    var __VLS_25 = void 0;
    var __VLS_26 = ({ click: {} },
        { onClick: function () {
                var _a;
                var _b = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _b[_i] = arguments[_i];
                }
                var $event = _b[0];
                if (!(__VLS_ctx.nn))
                    return;
                (_a = __VLS_ctx.nn) === null || _a === void 0 ? void 0 : _a.start();
                // @ts-ignore
                [onMapReady, mapRef, mapRef, mapRef, mapRef, vectorLayer, onModify, onAdd, nn, nn, nn,];
            } });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-100']} */ ;
    var __VLS_27 = __VLS_23.slots.default;
    // @ts-ignore
    [];
    var __VLS_23;
    var __VLS_24;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "bg-opacity-70 bg-background fixed bottom-5 left-20 rounded border p-1 px-2" }));
    /** @type {__VLS_StyleScopedClasses['bg-opacity-70']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    (__VLS_ctx.loc);
}
// @ts-ignore
[loc,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
