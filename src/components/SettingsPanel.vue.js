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
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var props = withDefaults(defineProps(), { open: true });
var emit = defineEmits(["opened", "closed", "update:open"]);
var isOpen = (0, vue_1.ref)(props.open);
function toggleOpen() {
    if (isOpen.value) {
        isOpen.value = false;
        emit("update:open", false);
        emit("closed");
    }
    else {
        isOpen.value = true;
        emit("update:open", true);
        emit("opened");
    }
}
(0, vue_1.watch)(function () { return props.open; }, function (v) {
    isOpen.value = !!v;
    v ? emit("opened") : emit("closed");
});
var panelId = (0, utils_1.nanoid)(5);
var __VLS_defaults = { open: true };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "px-6 py-4" }));
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "-my-3 flex w-full items-center justify-between py-3" }));
/** @type {__VLS_StyleScopedClasses['-my-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleOpen();
        // @ts-ignore
        [toggleOpen,];
    } }, { type: "button" }), { class: "group text-muted-foreground flex min-w-0 flex-auto items-center text-sm" }), { 'aria-expanded': (__VLS_ctx.isOpen), 'aria-controls': (__VLS_ctx.panelId) }));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-foreground min-w-0 flex-auto truncate text-left font-bold" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
var __VLS_0 = {
    open: (__VLS_ctx.isOpen),
};
(__VLS_ctx.label);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "relative ml-6 flex shrink-0 items-center" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_2 = {
    open: (__VLS_ctx.isOpen),
};
var __VLS_4;
/** @ts-ignore @type {typeof __VLS_components.ChevronDownIcon} */
solid_1.ChevronDownIcon;
// @ts-ignore
var __VLS_5 = __VLS_asFunctionalComponent1(__VLS_4, new __VLS_4(__assign({ class: "text-muted-foreground group-hover:text-foreground ml-2 h-6 w-6 flex-none rotate-180 transform transition-transform" }, { class: ({
        'rotate-0': __VLS_ctx.isOpen,
    }) })));
var __VLS_6 = __VLS_5.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground group-hover:text-foreground ml-2 h-6 w-6 flex-none rotate-180 transform transition-transform" }, { class: ({
            'rotate-0': __VLS_ctx.isOpen,
        }) })], __VLS_functionalComponentArgsRest(__VLS_5), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-180']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ id: (__VLS_ctx.panelId) }, { class: "space-y-4 pt-6" }));
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.isOpen) }), null, null);
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
var __VLS_9 = {
    open: (__VLS_ctx.isOpen),
};
// @ts-ignore
var __VLS_1 = __VLS_0, __VLS_3 = __VLS_2, __VLS_10 = __VLS_9;
// @ts-ignore
[isOpen, isOpen, isOpen, isOpen, isOpen, isOpen, panelId, panelId, label,];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
