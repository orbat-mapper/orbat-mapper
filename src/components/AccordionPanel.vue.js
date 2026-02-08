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
var lucide_vue_next_1 = require("lucide-vue-next");
var collapsible_1 = require("@/components/ui/collapsible");
var props = defineProps(["label"]);
var emit = defineEmits(["opened", "closed"]);
var open = (0, vue_1.ref)(false);
(0, vue_1.watch)(open, function (isOpen) {
    emit(isOpen ? "opened" : "closed");
});
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Collapsible | typeof __VLS_components.Collapsible} */
collapsible_1.Collapsible;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ open: (__VLS_ctx.open), as: "div" }, { class: "border-border border-b py-6" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ open: (__VLS_ctx.open), as: "div" }, { class: "border-border border-b py-6" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
var __VLS_6 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "-my-3 flow-root" }));
/** @type {__VLS_StyleScopedClasses['-my-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-root']} */ ;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.CollapsibleTrigger | typeof __VLS_components.CollapsibleTrigger} */
collapsible_1.CollapsibleTrigger;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "group flex w-full items-center justify-between py-3 text-sm" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "group flex w-full items-center justify-between py-3 text-sm" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_12 = __VLS_10.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-heading font-bold" }));
/** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
var __VLS_13 = {};
(__VLS_ctx.label);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-6 flex items-center" }));
/** @type {__VLS_StyleScopedClasses['ml-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_15 = {};
if (!__VLS_ctx.open) {
    var __VLS_17 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    lucide_vue_next_1.Plus;
    // @ts-ignore
    var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ class: "group-hover:text-muted-foreground size-4" }, { 'aria-hidden': "true" })));
    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ class: "group-hover:text-muted-foreground size-4" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
    /** @type {__VLS_StyleScopedClasses['group-hover:text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
}
else {
    var __VLS_22 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Minus} */
    lucide_vue_next_1.Minus;
    // @ts-ignore
    var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ class: "group-hover:text-muted-foreground size-4" }, { 'aria-hidden': "true" })));
    var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ class: "group-hover:text-muted-foreground size-4" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
    /** @type {__VLS_StyleScopedClasses['group-hover:text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
}
// @ts-ignore
[open, open, label,];
var __VLS_10;
if (!__VLS_ctx.open) {
    var __VLS_27 = {};
}
var __VLS_29;
/** @ts-ignore @type {typeof __VLS_components.CollapsibleContent | typeof __VLS_components.CollapsibleContent} */
collapsible_1.CollapsibleContent;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29(__assign({ class: "space-y-4 pt-6" })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ class: "space-y-4 pt-6" })], __VLS_functionalComponentArgsRest(__VLS_30), false));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
var __VLS_34 = __VLS_32.slots.default;
var __VLS_35 = {};
// @ts-ignore
[open,];
var __VLS_32;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13, __VLS_16 = __VLS_15, __VLS_28 = __VLS_27, __VLS_36 = __VLS_35;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    props: ["label"],
});
var __VLS_export = {};
exports.default = {};
