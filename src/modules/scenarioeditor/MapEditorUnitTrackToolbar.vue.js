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
var mainToolbarStore_1 = require("@/stores/mainToolbarStore");
var MainToolbarButton_vue_1 = require("@/components/MainToolbarButton.vue");
var geoStore_1 = require("@/stores/geoStore");
var unitSettings = (0, geoStore_1.useUnitSettingsStore)();
var store = (0, mainToolbarStore_1.useMainToolbarStore)();
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = FloatingPanel_vue_1.default || FloatingPanel_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "pointer-events-auto flex items-center space-x-1 rounded-md p-1" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "pointer-events-auto flex items-center space-x-1 rounded-md p-1" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
var __VLS_6 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground px-2 text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "border-border h-5 border-l" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
var __VLS_7 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onClick': {} }, { title: "Show unit track", active: (__VLS_ctx.unitSettings.showHistory) })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Show unit track", active: (__VLS_ctx.unitSettings.showHistory) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.unitSettings.showHistory = !__VLS_ctx.unitSettings.showHistory;
            // @ts-ignore
            [unitSettings, unitSettings, unitSettings,];
        } });
var __VLS_14 = __VLS_10.slots.default;
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.ShowPathIcon} */
vue_mdi_1.IconMapMarkerDistance;
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
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ 'onClick': {} }, { title: "Edit track", active: (__VLS_ctx.unitSettings.editHistory) })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Edit track", active: (__VLS_ctx.unitSettings.editHistory) })], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25;
var __VLS_26 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.unitSettings.editHistory = !__VLS_ctx.unitSettings.editHistory;
            // @ts-ignore
            [unitSettings, unitSettings, unitSettings,];
        } });
var __VLS_27 = __VLS_23.slots.default;
var __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.EditIcon} */
vue_mdi_1.IconSquareEditOutline;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign({ class: "size-5" })));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_29), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_23;
var __VLS_24;
var __VLS_33 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign({ 'onClick': {} }, { title: "Show timestamps", active: (__VLS_ctx.unitSettings.showWaypointTimestamps) })));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Show timestamps", active: (__VLS_ctx.unitSettings.showWaypointTimestamps) })], __VLS_functionalComponentArgsRest(__VLS_34), false));
var __VLS_38;
var __VLS_39 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.unitSettings.showWaypointTimestamps = !__VLS_ctx.unitSettings.showWaypointTimestamps;
            // @ts-ignore
            [unitSettings, unitSettings, unitSettings,];
        } });
var __VLS_40 = __VLS_36.slots.default;
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.IconTimelineClockOutline} */
vue_mdi_1.IconTimelineClockOutline;
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
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ 'onClick': {} }, { title: "Toggle toolbar" })));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Toggle toolbar" })], __VLS_functionalComponentArgsRest(__VLS_47), false));
var __VLS_51;
var __VLS_52 = ({ click: {} },
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
var __VLS_53 = __VLS_49.slots.default;
var __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.CloseIcon} */
vue_mdi_1.IconClose;
// @ts-ignore
var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54(__assign({ class: "size-5" })));
var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_55), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_49;
var __VLS_50;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
