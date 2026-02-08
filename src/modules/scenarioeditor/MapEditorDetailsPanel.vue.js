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
var CloseButton_vue_1 = require("@/components/CloseButton.vue");
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var uiStore_1 = require("@/stores/uiStore");
var PanelResizeHandle_vue_1 = require("@/components/PanelResizeHandle.vue");
var emit = defineEmits(["close"]);
var mapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var widthStore = (0, uiStore_1.useWidthStore)();
(0, vue_1.onMounted)(function () {
    var padding = mapRef.value.getView().padding || [0, 0, 0, 0];
    var top = padding[0], right = padding[1], bottom = padding[2], left = padding[3];
    mapRef.value.getView().padding = [top, 400, bottom, left];
});
(0, vue_1.onUnmounted)(function () {
    var padding = mapRef.value.getView().padding;
    if (padding) {
        var top_1 = padding[0], right = padding[1], bottom = padding[2], left = padding[3];
        mapRef.value.getView().padding = [top_1, 0, bottom, left];
    }
});
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)(__assign({ class: "bg-sidebar border-sidebar-border pointer-events-auto relative mt-4 flex max-h-[70vh] flex-col overflow-clip rounded-md border shadow-sm" }, { style: ({ width: __VLS_ctx.widthStore.detailsWidth + 'px' }) }));
/** @type {__VLS_StyleScopedClasses['bg-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['border-sidebar-border']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[70vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-clip']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
var __VLS_0 = CloseButton_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClick': {} }, { class: "absolute top-1 right-1 z-99" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "absolute top-1 right-1 z-99" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('close');
            // @ts-ignore
            [widthStore, emit,];
        } });
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1']} */ ;
/** @type {__VLS_StyleScopedClasses['right-1']} */ ;
/** @type {__VLS_StyleScopedClasses['z-99']} */ ;
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-auto overflow-auto p-4" }));
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
var __VLS_7 = {};
var __VLS_9 = PanelResizeHandle_vue_1.default;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9(__assign(__assign({ 'onUpdate': {} }, { 'onReset': {} }), { width: (__VLS_ctx.widthStore.detailsWidth), left: true })));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate': {} }, { 'onReset': {} }), { width: (__VLS_ctx.widthStore.detailsWidth), left: true })], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_14;
var __VLS_15 = ({ update: {} },
    { onUpdate: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.widthStore.detailsWidth = $event;
            // @ts-ignore
            [widthStore, widthStore,];
        } });
var __VLS_16 = ({ reset: {} },
    { onReset: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.widthStore.resetDetailsWidth();
            // @ts-ignore
            [widthStore,];
        } });
var __VLS_12;
var __VLS_13;
// @ts-ignore
var __VLS_8 = __VLS_7;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
});
var __VLS_export = {};
exports.default = {};
