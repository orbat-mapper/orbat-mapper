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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var solid_1 = require("@heroicons/vue/24/solid");
var utils_1 = require("@/utils");
var utils_2 = require("@/lib/utils");
var props = defineProps();
var emit = defineEmits(["opened", "closed", "update:open"]);
var headerRef = defineModel("headerRef");
var isOpen = (0, vue_1.ref)((_a = props.open) !== null && _a !== void 0 ? _a : true);
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
    isOpen.value = v;
    v ? emit("opened") : emit("closed");
});
var panelId = (0, utils_1.nanoid)(5);
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "border-border border-b py-2" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ ref: "headerRef" }, { class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: (__VLS_ctx.cn('group -my-3 flex w-full items-center justify-between py-3', (_b = __VLS_ctx.headerClass) !== null && _b !== void 0 ? _b : '')) }));
var __VLS_0 = {};
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleOpen();
        // @ts-ignore
        [utils_2.cn, headerClass, toggleOpen,];
    } }, { type: "button" }), { class: "group text-muted-foreground relative flex min-w-0 flex-auto items-center text-sm" }), { 'aria-expanded': (__VLS_ctx.isOpen), 'aria-controls': (__VLS_ctx.panelId) }));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_2;
/** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
solid_1.ChevronRightIcon;
// @ts-ignore
var __VLS_3 = __VLS_asFunctionalComponent1(__VLS_2, new __VLS_2(__assign({ class: "text-muted-foreground group-hover:text-foreground size-5 flex-none transform transition-transform" }, { class: ({
        'rotate-90': __VLS_ctx.isOpen,
    }) })));
var __VLS_4 = __VLS_3.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground group-hover:text-foreground size-5 flex-none transform transition-transform" }, { class: ({
            'rotate-90': __VLS_ctx.isOpen,
        }) })], __VLS_functionalComponentArgsRest(__VLS_3), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-2 min-w-0 flex-auto truncate text-left font-bold" }));
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
var __VLS_7 = {};
(__VLS_ctx.label);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "relative ml-6 flex shrink-0 items-center" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_9 = {};
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ id: (__VLS_ctx.panelId) }, { class: "space-y-4 pt-6 pl-6" }));
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.isOpen) }), null, null);
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-6']} */ ;
var __VLS_11 = {};
// @ts-ignore
var __VLS_1 = __VLS_0, __VLS_8 = __VLS_7, __VLS_10 = __VLS_9, __VLS_12 = __VLS_11;
// @ts-ignore
[isOpen, isOpen, isOpen, panelId, panelId, label,];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
