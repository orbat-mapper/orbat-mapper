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
var lucide_vue_next_1 = require("lucide-vue-next");
var collapsible_1 = require("@/components/ui/collapsible");
var props = defineProps();
var isOpen = defineModel({ default: true });
var __VLS_defaultModels = {
    'modelValue': true,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Collapsible | typeof __VLS_components.Collapsible} */
collapsible_1.Collapsible;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ open: (__VLS_ctx.isOpen) }, { class: "border-border relative border-b" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ open: (__VLS_ctx.isOpen) }, { class: "border-border relative border-b" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
{
    var __VLS_6 = __VLS_3.slots.default;
    var open_1 = __VLS_vSlot(__VLS_6)[0].open;
    var __VLS_7 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CollapsibleTrigger | typeof __VLS_components.CollapsibleTrigger} */
    collapsible_1.CollapsibleTrigger;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "group flex w-full items-center justify-between py-3" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "group flex w-full items-center justify-between py-3" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    var __VLS_12 = __VLS_10.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "flex items-center gap-2 text-sm font-semibold" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.label);
    var __VLS_13 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.PlusIcon} */
    lucide_vue_next_1.PlusIcon;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ class: "text-muted-foreground hidden h-4 w-4 group-data-[state=closed]:block" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground hidden h-4 w-4 group-data-[state=closed]:block" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-data-[state=closed]:block']} */ ;
    var __VLS_18 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.MinusIcon} */
    lucide_vue_next_1.MinusIcon;
    // @ts-ignore
    var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: "text-muted-foreground hidden h-4 w-4 group-data-[state=open]:block" })));
    var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground hidden h-4 w-4 group-data-[state=open]:block" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-data-[state=open]:block']} */ ;
    // @ts-ignore
    [isOpen, label,];
    var __VLS_10;
    if (__VLS_ctx.$slots.header && open_1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pointer-events-none absolute top-0 right-6 left-0 flex justify-end" }));
        /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pointer-events-auto" }));
        /** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
        var __VLS_23 = {};
    }
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CollapsibleContent | typeof __VLS_components.CollapsibleContent} */
    collapsible_1.CollapsibleContent;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        className: "pt-1 pb-3",
    }));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{
            className: "pt-1 pb-3",
        }], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = __VLS_28.slots.default;
    var __VLS_31 = {};
    // @ts-ignore
    [$slots,];
    var __VLS_28;
    // @ts-ignore
    [];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
// @ts-ignore
var __VLS_24 = __VLS_23, __VLS_32 = __VLS_31;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
