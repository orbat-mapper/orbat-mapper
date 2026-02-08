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
var FloatingPanel_vue_1 = require("@/components/FloatingPanel.vue");
var MainToolbarButton_vue_1 = require("@/components/MainToolbarButton.vue");
var mainToolbarStore_1 = require("@/stores/mainToolbarStore");
var core_1 = require("@vueuse/core");
var injects_1 = require("@/components/injects");
var utils_1 = require("@/utils");
var geoMeasurement_1 = require("@/composables/geoMeasurement");
var pinia_1 = require("pinia");
var geoStore_1 = require("@/stores/geoStore");
var vue_1 = require("vue");
var mapSelectStore_1 = require("@/stores/mapSelectStore");
var mapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var store = (0, mainToolbarStore_1.useMainToolbarStore)();
var selectStore = (0, mapSelectStore_1.useMapSelectStore)();
var _a = (0, pinia_1.storeToRefs)((0, geoStore_1.useMeasurementsStore)()), showSegments = _a.showSegments, clearPrevious = _a.clearPrevious, measurementType = _a.measurementType, measurementUnit = _a.measurementUnit, snap = _a.snap, showCircle = _a.showCircle;
var clear = (0, geoMeasurement_1.useMeasurementInteraction)(mapRef.value, measurementType, {
    showSegments: showSegments,
    clearPrevious: clearPrevious,
    measurementUnit: measurementUnit,
    snap: snap,
    showCircle: showCircle,
}).clear;
selectStore.unitSelectEnabled = false;
selectStore.featureSelectEnabled = false;
(0, core_1.onKeyDown)("Escape", function () { return store.clearToolbar(); });
(0, vue_1.onUnmounted)(function () {
    clear();
    selectStore.unitSelectEnabled = true;
    selectStore.featureSelectEnabled = true;
});
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = FloatingPanel_vue_1.default || FloatingPanel_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "pointer-events-auto flex items-center space-x-0.5 rounded-md p-1" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "pointer-events-auto flex items-center space-x-0.5 rounded-md p-1" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
var __VLS_6 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground px-2 text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_7 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onClick': {} }, { title: "Length", active: (__VLS_ctx.measurementType === 'LineString') })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Length", active: (__VLS_ctx.measurementType === 'LineString') })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.measurementType = 'LineString';
            // @ts-ignore
            [measurementType, measurementType,];
        } });
var __VLS_14 = __VLS_10.slots.default;
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.LengthIcon} */
vue_mdi_1.IconVectorLine;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ class: "size-5" })));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_10;
var __VLS_11;
var __VLS_20 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ 'onClick': {} }, { title: "Area", active: (__VLS_ctx.measurementType === 'Polygon') })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Area", active: (__VLS_ctx.measurementType === 'Polygon') })], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25;
var __VLS_26 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.measurementType = 'Polygon';
            // @ts-ignore
            [measurementType, measurementType,];
        } });
var __VLS_27 = __VLS_23.slots.default;
var __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.AreaIcon} */
vue_mdi_1.IconVectorSquare;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign({ class: "size-5" })));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_29), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_23;
var __VLS_24;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "h-5 border-l border-gray-300" }));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
var __VLS_33 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign({ 'onClick': {} }, { title: "Show segment lengths", active: (__VLS_ctx.showSegments) })));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Show segment lengths", active: (__VLS_ctx.showSegments) })], __VLS_functionalComponentArgsRest(__VLS_34), false));
var __VLS_38;
var __VLS_39 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showSegments = !__VLS_ctx.showSegments;
            // @ts-ignore
            [showSegments, showSegments, showSegments,];
        } });
var __VLS_40 = __VLS_36.slots.default;
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.ShowSegmentsIcon} */
vue_mdi_1.IconMapMarkerDistance;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41(__assign({ class: "size-5" })));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_42), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_36;
var __VLS_37;
var __VLS_46 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ 'onClick': {} }, { title: "Show multiple measurements", active: (!__VLS_ctx.clearPrevious) })));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Show multiple measurements", active: (!__VLS_ctx.clearPrevious) })], __VLS_functionalComponentArgsRest(__VLS_47), false));
var __VLS_51;
var __VLS_52 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.clearPrevious = !__VLS_ctx.clearPrevious;
            // @ts-ignore
            [clearPrevious, clearPrevious, clearPrevious,];
        } });
var __VLS_53 = __VLS_49.slots.default;
var __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.ShowMultipleIcon} */
vue_mdi_1.IconSelectMultipleMarker;
// @ts-ignore
var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54(__assign({ class: "size-5" })));
var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_55), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_49;
var __VLS_50;
var __VLS_59 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59(__assign({ 'onClick': {} }, { title: "Show range circle", active: (__VLS_ctx.showCircle) })));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Show range circle", active: (__VLS_ctx.showCircle) })], __VLS_functionalComponentArgsRest(__VLS_60), false));
var __VLS_64;
var __VLS_65 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showCircle = !__VLS_ctx.showCircle;
            // @ts-ignore
            [showCircle, showCircle, showCircle,];
        } });
var __VLS_66 = __VLS_62.slots.default;
var __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.ShowCircleIcon} */
vue_mdi_1.IconSelectionEllipse;
// @ts-ignore
var __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67(__assign({ class: "size-5" })));
var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_68), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_62;
var __VLS_63;
var __VLS_72 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72(__assign({ 'onClick': {} }, { title: "Toggle snapping", active: (__VLS_ctx.snap) })));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Toggle snapping", active: (__VLS_ctx.snap) })], __VLS_functionalComponentArgsRest(__VLS_73), false));
var __VLS_77;
var __VLS_78 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.snap = !__VLS_ctx.snap;
            // @ts-ignore
            [snap, snap, snap,];
        } });
var __VLS_79 = __VLS_75.slots.default;
var __VLS_80;
/** @ts-ignore @type {typeof __VLS_components.SnapIcon} */
vue_mdi_1.IconMagnet;
// @ts-ignore
var __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80(__assign({ class: "size-5" })));
var __VLS_82 = __VLS_81.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_81), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_75;
var __VLS_76;
var __VLS_85 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85(__assign({ 'onClick': {} }, { title: "Clear measurements" })));
var __VLS_87 = __VLS_86.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Clear measurements" })], __VLS_functionalComponentArgsRest(__VLS_86), false));
var __VLS_90;
var __VLS_91 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.clear();
            // @ts-ignore
            [clear,];
        } });
var __VLS_92 = __VLS_88.slots.default;
var __VLS_93;
/** @ts-ignore @type {typeof __VLS_components.TrashIcon} */
vue_mdi_1.IconTrashCanOutline;
// @ts-ignore
var __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93(__assign({ class: "size-5" })));
var __VLS_95 = __VLS_94.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_94), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_88;
var __VLS_89;
var __VLS_98 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98(__assign({ 'onClick': {} }, { title: "Toggle toolbar" })));
var __VLS_100 = __VLS_99.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Toggle toolbar" })], __VLS_functionalComponentArgsRest(__VLS_99), false));
var __VLS_103;
var __VLS_104 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.store.clearToolbar();
            // @ts-ignore
            [store,];
        } });
var __VLS_105 = __VLS_101.slots.default;
var __VLS_106;
/** @ts-ignore @type {typeof __VLS_components.CloseIcon} */
vue_mdi_1.IconClose;
// @ts-ignore
var __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106(__assign({ class: "size-5" })));
var __VLS_108 = __VLS_107.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_107), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_101;
var __VLS_102;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
