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
var reka_ui_1 = require("reka-ui");
var utils_1 = require("@/lib/utils");
var props = withDefaults(defineProps(), {
    orientation: "vertical",
});
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var __VLS_defaults = {
    orientation: "vertical",
};
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.ScrollAreaScrollbar | typeof __VLS_components.ScrollAreaScrollbar} */
reka_ui_1.ScrollAreaScrollbar;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ dataSlot: "scroll-area-scrollbar" }, (__VLS_ctx.delegatedProps)), { class: (__VLS_ctx.cn('flex touch-none p-px transition-colors select-none', __VLS_ctx.orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent', __VLS_ctx.orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent', props.class)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "scroll-area-scrollbar" }, (__VLS_ctx.delegatedProps)), { class: (__VLS_ctx.cn('flex touch-none p-px transition-colors select-none', __VLS_ctx.orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent', __VLS_ctx.orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.ScrollAreaThumb} */
reka_ui_1.ScrollAreaThumb;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ dataSlot: "scroll-area-thumb" }, { class: "bg-border relative flex-1 rounded-full" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ dataSlot: "scroll-area-thumb" }, { class: "bg-border relative flex-1 rounded-full" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['bg-border']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
// @ts-ignore
[delegatedProps, utils_1.cn, orientation, orientation,];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
