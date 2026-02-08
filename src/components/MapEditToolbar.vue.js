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
var ToolbarButton_vue_1 = require("./ToolbarButton.vue");
var vue_1 = require("vue");
var VerticalToolbar_vue_1 = require("./VerticalToolbar.vue");
var geoEditing_1 = require("@/composables/geoEditing");
var core_1 = require("@vueuse/core");
var uiStore_1 = require("@/stores/uiStore");
var props = withDefaults(defineProps(), { deleteEnabled: false });
var emit = defineEmits(["add", "modify", "delete"]);
var _a = (0, core_1.useToggle)(false), addMultiple = _a[0], toggleAddMultiple = _a[1];
var _b = (0, geoEditing_1.useEditingInteraction)(props.olMap, (0, vue_1.toRef)(props, "layer"), {
    emit: emit,
    addMultiple: addMultiple,
    select: props.select,
}), startDrawing = _b.startDrawing, currentDrawType = _b.currentDrawType, startModify = _b.startModify, isModifying = _b.isModifying, cancel = _b.cancel, isDrawing = _b.isDrawing;
var uiStore = (0, uiStore_1.useUiStore)();
(0, vue_1.watch)([isDrawing, isModifying], function (_a) {
    var drawing = _a[0], modifying = _a[1];
    uiStore.editToolbarActive = drawing || modifying;
}, { immediate: true });
(0, core_1.onKeyStroke)("Escape", function (event) {
    cancel();
});
var __VLS_defaults = { deleteEnabled: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-col" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
var __VLS_0 = VerticalToolbar_vue_1.default || VerticalToolbar_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "shadow-sm" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "shadow-sm" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { top: true, title: "Keep selected tool active after drawing " })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { top: true, title: "Keep selected tool active after drawing " })], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11;
var __VLS_12 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleAddMultiple();
            // @ts-ignore
            [toggleAddMultiple,];
        } });
var __VLS_13 = __VLS_9.slots.default;
if (__VLS_ctx.addMultiple) {
    var __VLS_14 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconLockOutline} */
    vue_mdi_1.IconLockOutline;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ class: "h-5 w-5" })));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
else {
    var __VLS_19 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconLockOpenVariantOutline} */
    vue_mdi_1.IconLockOpenVariantOutline;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ class: "h-5 w-5" })));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_20), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
// @ts-ignore
[addMultiple,];
var __VLS_9;
var __VLS_10;
var __VLS_24 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ 'onClick': {} }, { title: "Select features", active: (!__VLS_ctx.currentDrawType) })));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Select features", active: (!__VLS_ctx.currentDrawType) })], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_29;
var __VLS_30 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.cancel();
            // @ts-ignore
            [currentDrawType, cancel,];
        } });
var __VLS_31 = __VLS_27.slots.default;
var __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.IconCursorDefaultOutline} */
vue_mdi_1.IconCursorDefaultOutline;
// @ts-ignore
var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32(__assign({ class: "h-5 w-5" })));
var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_33), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_27;
var __VLS_28;
var __VLS_37 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37(__assign({ 'onClick': {} }, { title: "Draw point feature", active: (__VLS_ctx.currentDrawType === 'Point') })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Draw point feature", active: (__VLS_ctx.currentDrawType === 'Point') })], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_42;
var __VLS_43 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startDrawing('Point');
            // @ts-ignore
            [currentDrawType, startDrawing,];
        } });
var __VLS_44 = __VLS_40.slots.default;
var __VLS_45;
/** @ts-ignore @type {typeof __VLS_components.IconMapMarker} */
vue_mdi_1.IconMapMarker;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45(__assign({ class: "h-5 w-5" })));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_46), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_40;
var __VLS_41;
var __VLS_50 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50(__assign({ 'onClick': {} }, { title: "Draw polyline", active: (__VLS_ctx.currentDrawType === 'LineString') })));
var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Draw polyline", active: (__VLS_ctx.currentDrawType === 'LineString') })], __VLS_functionalComponentArgsRest(__VLS_51), false));
var __VLS_55;
var __VLS_56 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startDrawing('LineString');
            // @ts-ignore
            [currentDrawType, startDrawing,];
        } });
var __VLS_57 = __VLS_53.slots.default;
var __VLS_58;
/** @ts-ignore @type {typeof __VLS_components.IconVectorLine} */
vue_mdi_1.IconVectorLine;
// @ts-ignore
var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58(__assign({ class: "h-5 w-5" })));
var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_59), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_53;
var __VLS_54;
var __VLS_63 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63(__assign({ 'onClick': {} }, { title: "Draw polygon", active: (__VLS_ctx.currentDrawType === 'Polygon') })));
var __VLS_65 = __VLS_64.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Draw polygon", active: (__VLS_ctx.currentDrawType === 'Polygon') })], __VLS_functionalComponentArgsRest(__VLS_64), false));
var __VLS_68;
var __VLS_69 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startDrawing('Polygon');
            // @ts-ignore
            [currentDrawType, startDrawing,];
        } });
var __VLS_70 = __VLS_66.slots.default;
var __VLS_71;
/** @ts-ignore @type {typeof __VLS_components.IconVectorTriangle} */
vue_mdi_1.IconVectorTriangle;
// @ts-ignore
var __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71(__assign({ class: "h-5 w-5" })));
var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_72), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_66;
var __VLS_67;
var __VLS_76 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76(__assign({ 'onClick': {} }, { bottom: true, title: "Draw circle", active: (__VLS_ctx.currentDrawType === 'Circle') })));
var __VLS_78 = __VLS_77.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { bottom: true, title: "Draw circle", active: (__VLS_ctx.currentDrawType === 'Circle') })], __VLS_functionalComponentArgsRest(__VLS_77), false));
var __VLS_81;
var __VLS_82 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startDrawing('Circle');
            // @ts-ignore
            [currentDrawType, startDrawing,];
        } });
var __VLS_83 = __VLS_79.slots.default;
var __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.IconVectorCircleVariant} */
vue_mdi_1.IconVectorCircleVariant;
// @ts-ignore
var __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84(__assign({ class: "h-5 w-5" })));
var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_85), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_79;
var __VLS_80;
// @ts-ignore
[];
var __VLS_3;
var __VLS_89 = VerticalToolbar_vue_1.default || VerticalToolbar_vue_1.default;
// @ts-ignore
var __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89(__assign({ class: "mt-2 shadow-sm" })));
var __VLS_91 = __VLS_90.apply(void 0, __spreadArray([__assign({ class: "mt-2 shadow-sm" })], __VLS_functionalComponentArgsRest(__VLS_90), false));
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
var __VLS_94 = __VLS_92.slots.default;
var __VLS_95 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95(__assign({ 'onClick': {} }, { top: true, title: "Modify feature", active: (__VLS_ctx.isModifying) })));
var __VLS_97 = __VLS_96.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { top: true, title: "Modify feature", active: (__VLS_ctx.isModifying) })], __VLS_functionalComponentArgsRest(__VLS_96), false));
var __VLS_100;
var __VLS_101 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startModify();
            // @ts-ignore
            [isModifying, startModify,];
        } });
var __VLS_102 = __VLS_98.slots.default;
var __VLS_103;
/** @ts-ignore @type {typeof __VLS_components.IconSquareEditOutline} */
vue_mdi_1.IconSquareEditOutline;
// @ts-ignore
var __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103(__assign({ class: "h-5 w-5" })));
var __VLS_105 = __VLS_104.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_104), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_98;
var __VLS_99;
var __VLS_108 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108(__assign({ 'onClick': {} }, { bottom: true, title: "Delete feature", disabled: (!__VLS_ctx.deleteEnabled) })));
var __VLS_110 = __VLS_109.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { bottom: true, title: "Delete feature", disabled: (!__VLS_ctx.deleteEnabled) })], __VLS_functionalComponentArgsRest(__VLS_109), false));
var __VLS_113;
var __VLS_114 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('delete');
            // @ts-ignore
            [deleteEnabled, emit,];
        } });
var __VLS_115 = __VLS_111.slots.default;
var __VLS_116;
/** @ts-ignore @type {typeof __VLS_components.IconTrashCanOutline} */
vue_mdi_1.IconTrashCanOutline;
// @ts-ignore
var __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116(__assign({ class: "h-5 w-5" })));
var __VLS_118 = __VLS_117.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_117), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_111;
var __VLS_112;
// @ts-ignore
[];
var __VLS_92;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
