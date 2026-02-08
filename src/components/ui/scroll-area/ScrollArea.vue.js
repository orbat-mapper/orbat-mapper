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
var ScrollBar_vue_1 = require("./ScrollBar.vue");
var props = defineProps();
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.ScrollAreaRoot | typeof __VLS_components.ScrollAreaRoot} */
reka_ui_1.ScrollAreaRoot;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ dataSlot: "scroll-area" }, (__VLS_ctx.delegatedProps)), { class: (__VLS_ctx.cn('relative', props.class)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "scroll-area" }, (__VLS_ctx.delegatedProps)), { class: (__VLS_ctx.cn('relative', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.ScrollAreaViewport | typeof __VLS_components.ScrollAreaViewport} */
reka_ui_1.ScrollAreaViewport;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ dataSlot: "scroll-area-viewport" }, { class: "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ dataSlot: "scroll-area-viewport" }, { class: "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-ring/50']} */ ;
/** @type {__VLS_StyleScopedClasses['size-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-[inherit]']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-[color,box-shadow]']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-[3px]']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:outline-1']} */ ;
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13 = {};
// @ts-ignore
[delegatedProps, utils_1.cn,];
var __VLS_10;
var __VLS_15 = ScrollBar_vue_1.default;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_16), false));
var __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.ScrollAreaCorner} */
reka_ui_1.ScrollAreaCorner;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_21), false));
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
