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
var names_1 = require("@/router/names");
var core_1 = require("@vueuse/core");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var card_1 = require("@/components/ui/card");
var __VLS_props = withDefaults(defineProps(), {
    noLink: false,
    routeName: names_1.MAP_EDIT_MODE_ROUTE,
});
var emit = defineEmits(["action"]);
var menuItems = [
    { label: "Open", action: "open" },
    { label: "Delete ...", action: "delete" },
    { label: "Download", action: "download" },
    { label: "Duplicate", action: "duplicate" },
    { label: "Copy to clipboard", action: "copyToClipboard" },
];
var __VLS_defaults = {
    noLink: false,
    routeName: names_1.MAP_EDIT_MODE_ROUTE,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Card | typeof __VLS_components.Card} */
card_1.Card;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "hover:bg-card-foreground/5 ring-ring relative focus-within:ring-2" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "hover:bg-card-foreground/5 ring-ring relative focus-within:ring-2" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['hover:bg-card-foreground/5']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-within:ring-2']} */ ;
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7 = (__VLS_ctx.noLink ? 'button' : 'router-link');
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign(__assign({}, (__VLS_ctx.noLink
    ? { type: 'button' }
    : { to: { name: __VLS_ctx.routeName, params: { scenarioId: __VLS_ctx.data.id } } })), { draggable: "false" }), { class: "absolute inset-0 outline-none" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign(__assign({}, (__VLS_ctx.noLink
        ? { type: 'button' }
        : { to: { name: __VLS_ctx.routeName, params: { scenarioId: __VLS_ctx.data.id } } })), { draggable: "false" }), { class: "absolute inset-0 outline-none" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
(__VLS_ctx.noLink ? { click: function () { return __VLS_ctx.emit('action', 'open'); } } : {});
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
var __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.CardContent | typeof __VLS_components.CardContent} */
card_1.CardContent;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ class: "flex-auto" })));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "flex-auto" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
var __VLS_17 = __VLS_15.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.data.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-2 line-clamp-4 text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['line-clamp-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
(__VLS_ctx.data.description);
// @ts-ignore
[noLink, noLink, noLink, routeName, data, data, data, emit,];
var __VLS_15;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.CardFooter | typeof __VLS_components.CardFooter} */
card_1.CardFooter;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: "flex items-center justify-between" })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: "flex items-center justify-between" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
var __VLS_23 = __VLS_21.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
(__VLS_ctx.formatTimeAgo(__VLS_ctx.data.modified));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
(__VLS_ctx.formatTimeAgo(__VLS_ctx.data.created));
var __VLS_24 = DotsMenu_vue_1.default;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign(__assign({ 'onAction': {} }, { items: (__VLS_ctx.menuItems) }), { class: "z-10" })));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign(__assign({ 'onAction': {} }, { items: (__VLS_ctx.menuItems) }), { class: "z-10" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_29;
var __VLS_30 = ({ action: {} },
    { onAction: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', $event);
            // @ts-ignore
            [data, data, emit, core_1.formatTimeAgo, core_1.formatTimeAgo, menuItems,];
        } });
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
var __VLS_27;
var __VLS_28;
// @ts-ignore
[];
var __VLS_21;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
