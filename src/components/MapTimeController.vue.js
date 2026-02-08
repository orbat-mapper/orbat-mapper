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
var solid_1 = require("@heroicons/vue/24/solid");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var uiStore_1 = require("@/stores/uiStore");
var BaseToolbar_vue_1 = require("./BaseToolbar.vue");
var ToolbarButton_vue_1 = require("./ToolbarButton.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var props = withDefaults(defineProps(), { showControls: true, hideTime: false });
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
var emit = defineEmits([
    "open-time-modal",
    "inc-day",
    "dec-day",
    "next-event",
    "prev-event",
    "show-settings",
]);
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), state = _a.store.state, scenarioTime = _a.time.scenarioTime;
var uiStore = (0, uiStore_1.useUiStore)();
var __VLS_defaults = { showControls: true, hideTime: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
if (!__VLS_ctx.hideTime) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "pointer-events-none font-mono text-xl font-bold sm:text-2xl" }, { style: {} }));
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ ;
    (__VLS_ctx.fmt.scenarioFormatter.format(__VLS_ctx.state.currentTime));
}
if (__VLS_ctx.showControls) {
    var __VLS_0 = BaseToolbar_vue_1.default || BaseToolbar_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = __VLS_3.slots.default;
    var __VLS_6 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
    // @ts-ignore
    var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { start: true })));
    var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { start: true })], __VLS_functionalComponentArgsRest(__VLS_7), false));
    var __VLS_11 = void 0;
    var __VLS_12 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showControls))
                    return;
                __VLS_ctx.emit('show-settings');
                // @ts-ignore
                [hideTime, fmt, state, showControls, emit,];
            } });
    var __VLS_13 = __VLS_9.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    var __VLS_14 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SettingsIcon} */
    vue_mdi_1.IconCogOutline;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_9;
    var __VLS_10;
    var __VLS_19 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ 'onClick': {} })));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = void 0;
    var __VLS_25 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showControls))
                    return;
                __VLS_ctx.emit('open-time-modal');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_26 = __VLS_22.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    var __VLS_27 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CalendarIcon} */
    solid_1.CalendarIcon;
    // @ts-ignore
    var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
    var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_22;
    var __VLS_23;
    var __VLS_32 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32(__assign({ 'onClick': {} }, { type: "button" })));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button" })], __VLS_functionalComponentArgsRest(__VLS_33), false));
    var __VLS_37 = void 0;
    var __VLS_38 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showControls))
                    return;
                __VLS_ctx.emit('dec-day');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_39 = __VLS_35.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    var __VLS_40 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconChevronLeft} */
    vue_mdi_1.IconChevronLeft;
    // @ts-ignore
    var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
    var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_41), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_35;
    var __VLS_36;
    var __VLS_45 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
    // @ts-ignore
    var __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45(__assign({ 'onClick': {} })));
    var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_46), false));
    var __VLS_50 = void 0;
    var __VLS_51 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showControls))
                    return;
                __VLS_ctx.emit('inc-day');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_52 = __VLS_48.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    var __VLS_53 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconChevronRight} */
    vue_mdi_1.IconChevronRight;
    // @ts-ignore
    var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
    var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_54), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_48;
    var __VLS_49;
    var __VLS_58 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
    // @ts-ignore
    var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58(__assign({ 'onClick': {} })));
    var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_59), false));
    var __VLS_63 = void 0;
    var __VLS_64 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showControls))
                    return;
                __VLS_ctx.emit('prev-event');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_65 = __VLS_61.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    var __VLS_66 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconSkipPrevious} */
    vue_mdi_1.IconSkipPrevious;
    // @ts-ignore
    var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
    var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_67), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_61;
    var __VLS_62;
    var __VLS_71 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
    // @ts-ignore
    var __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71(__assign({ 'onClick': {} }, { end: true })));
    var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { end: true })], __VLS_functionalComponentArgsRest(__VLS_72), false));
    var __VLS_76 = void 0;
    var __VLS_77 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showControls))
                    return;
                __VLS_ctx.emit('next-event');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_78 = __VLS_74.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    var __VLS_79 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconSkipNext} */
    vue_mdi_1.IconSkipNext;
    // @ts-ignore
    var __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
    var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_80), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_74;
    var __VLS_75;
    // @ts-ignore
    [];
    var __VLS_3;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
