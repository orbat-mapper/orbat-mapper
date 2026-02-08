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
var core_1 = require("@vueuse/core");
var lucide_vue_next_1 = require("lucide-vue-next");
var reka_ui_1 = require("reka-ui");
var utils_1 = require("@/lib/utils");
var DialogOverlay_vue_1 = require("./DialogOverlay.vue");
defineOptions({
    inheritAttrs: false,
});
var props = withDefaults(defineProps(), {
    showCloseButton: true,
});
var emits = defineEmits();
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var forwarded = (0, reka_ui_1.useForwardPropsEmits)(delegatedProps, emits);
var __VLS_defaults = {
    showCloseButton: true,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.DialogPortal | typeof __VLS_components.DialogPortal} */
reka_ui_1.DialogPortal;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7 = DialogOverlay_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.DialogContent | typeof __VLS_components.DialogContent} */
reka_ui_1.DialogContent;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign(__assign({ dataSlot: "dialog-content" }, (__assign(__assign({}, __VLS_ctx.$attrs), __VLS_ctx.forwarded))), { class: (__VLS_ctx.cn('bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg', props.class)) })));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "dialog-content" }, (__assign(__assign({}, __VLS_ctx.$attrs), __VLS_ctx.forwarded))), { class: (__VLS_ctx.cn('bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_13), false));
var __VLS_17 = __VLS_15.slots.default;
var __VLS_18 = {};
if (__VLS_ctx.showCloseButton) {
    var __VLS_20 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DialogClose | typeof __VLS_components.DialogClose} */
    reka_ui_1.DialogClose;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ dataSlot: "dialog-close" }, { class: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4" })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ dataSlot: "dialog-close" }, { class: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    /** @type {__VLS_StyleScopedClasses['ring-offset-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=open]:bg-accent']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=open]:text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-70']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-offset-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['[&_svg]:pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['[&_svg]:shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['[&_svg:not([class*=\'size-\'])]:size-4']} */ ;
    var __VLS_25 = __VLS_23.slots.default;
    var __VLS_26 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.X} */
    lucide_vue_next_1.X;
    // @ts-ignore
    var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({}));
    var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_27), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    // @ts-ignore
    [$attrs, forwarded, utils_1.cn, showCloseButton,];
    var __VLS_23;
}
// @ts-ignore
[];
var __VLS_15;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_19 = __VLS_18;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
