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
var NotificationItem_vue_1 = require("./NotificationItem.vue");
var notifications_1 = require("@/composables/notifications");
var _a = (0, notifications_1.useNotifications)(), notifications = _a.notifications, deleteNotification = _a.deleteNotification, clear = _a.clear;
var notificationsReversed = (0, vue_1.computed)(function () { return __spreadArray([], notifications.value, true).reverse(); });
(0, vue_1.onUnmounted)(function () {
    clear();
});
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ 'aria-live': "assertive" }, { class: "pointer-events-none fixed inset-0 z-[9999] flex items-end px-2 py-6 sm:items-start sm:py-16" }));
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-[9999]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-end']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:py-16']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full flex-col items-center space-y-4 sm:items-end" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:items-end']} */ ;
var _loop_1 = function (title, message, duration, id, type) {
    var __VLS_0 = NotificationItem_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClose': {} }, { key: (id), title: (title), message: (message), duration: (duration), type: (type) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClose': {} }, { key: (id), title: (title), message: (message), duration: (duration), type: (type) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ close: {} },
        { onClose: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.deleteNotification(id);
                // @ts-ignore
                [notificationsReversed, deleteNotification,];
            } });
    // @ts-ignore
    [];
};
var __VLS_3, __VLS_4;
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.notificationsReversed)); _i < _b.length; _i++) {
    var _c = _b[_i][0], title = _c.title, message = _c.message, duration = _c.duration, id = _c.id, type = _c.type;
    _loop_1(title, message, duration, id, type);
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
