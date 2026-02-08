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
var _1 = require(".");
defineOptions({
    inheritAttrs: false,
});
var props = withDefaults(defineProps(), {
    position: "popper",
});
var emits = defineEmits();
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var forwarded = (0, reka_ui_1.useForwardPropsEmits)(delegatedProps, emits);
var __VLS_defaults = {
    position: "popper",
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.SelectPortal | typeof __VLS_components.SelectPortal} */
reka_ui_1.SelectPortal;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
reka_ui_1.SelectContent;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign({ dataSlot: "select-content" }, (__assign(__assign({}, __VLS_ctx.$attrs), __VLS_ctx.forwarded))), { class: (__VLS_ctx.cn('bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--reka-select-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md', __VLS_ctx.position === 'popper' &&
        'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1', props.class)) })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "select-content" }, (__assign(__assign({}, __VLS_ctx.$attrs), __VLS_ctx.forwarded))), { class: (__VLS_ctx.cn('bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--reka-select-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md', __VLS_ctx.position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.SelectScrollUpButton} */
_1.SelectScrollUpButton;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_14), false));
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.SelectViewport | typeof __VLS_components.SelectViewport} */
reka_ui_1.SelectViewport;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: (__VLS_ctx.cn('p-1', __VLS_ctx.position === 'popper' &&
        'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)] scroll-my-1')) })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: (__VLS_ctx.cn('p-1', __VLS_ctx.position === 'popper' &&
            'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)] scroll-my-1')) })], __VLS_functionalComponentArgsRest(__VLS_19), false));
var __VLS_23 = __VLS_21.slots.default;
var __VLS_24 = {};
// @ts-ignore
[$attrs, forwarded, utils_1.cn, utils_1.cn, position, position,];
var __VLS_21;
var __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.SelectScrollDownButton} */
_1.SelectScrollDownButton;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({}));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_27), false));
// @ts-ignore
[];
var __VLS_10;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_25 = __VLS_24;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
