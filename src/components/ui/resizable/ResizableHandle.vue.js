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
var props = defineProps();
var emits = defineEmits();
var delegatedProps = (0, core_1.reactiveOmit)(props, "class", "withHandle");
var forwarded = (0, reka_ui_1.useForwardPropsEmits)(delegatedProps, emits);
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.SplitterResizeHandle | typeof __VLS_components.SplitterResizeHandle} */
reka_ui_1.SplitterResizeHandle;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ dataSlot: "resizable-handle" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:translate-x-0 data-[orientation=vertical]:after:-translate-y-1/2 [&[data-orientation=vertical]>div]:rotate-90', props.class)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "resizable-handle" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:translate-x-0 data-[orientation=vertical]:after:-translate-y-1/2 [&[data-orientation=vertical]>div]:rotate-90', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
if (props.withHandle) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border" }));
    /** @type {__VLS_StyleScopedClasses['bg-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    var __VLS_7 = {};
    var __VLS_9 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.GripVertical} */
    lucide_vue_next_1.GripVertical;
    // @ts-ignore
    var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9(__assign({ class: "size-2.5" })));
    var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign({ class: "size-2.5" })], __VLS_functionalComponentArgsRest(__VLS_10), false));
    /** @type {__VLS_StyleScopedClasses['size-2.5']} */ ;
}
// @ts-ignore
[forwarded, utils_1.cn,];
var __VLS_3;
// @ts-ignore
var __VLS_8 = __VLS_7;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
