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
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var forwarded = (0, reka_ui_1.useForwardPropsEmits)(delegatedProps, emits);
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.CheckboxRoot | typeof __VLS_components.CheckboxRoot} */
reka_ui_1.CheckboxRoot;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ dataSlot: "checkbox" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50', props.class)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "checkbox" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
{
    var __VLS_6 = __VLS_3.slots.default;
    var slotProps = __VLS_vSlot(__VLS_6)[0];
    var __VLS_7 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CheckboxIndicator | typeof __VLS_components.CheckboxIndicator} */
    reka_ui_1.CheckboxIndicator;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ dataSlot: "checkbox-indicator" }, { class: "grid place-content-center text-current transition-none" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ dataSlot: "checkbox-indicator" }, { class: "grid place-content-center text-current transition-none" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['place-content-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-current']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-none']} */ ;
    var __VLS_12 = __VLS_10.slots.default;
    var __VLS_13 = __assign({}, (slotProps));
    if (slotProps.modelValue === 'indeterminate') {
        var __VLS_15 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Minus} */
        lucide_vue_next_1.Minus;
        // @ts-ignore
        var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ class: "size-3.5" })));
        var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ class: "size-3.5" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
        /** @type {__VLS_StyleScopedClasses['size-3.5']} */ ;
    }
    else {
        var __VLS_20 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Check} */
        lucide_vue_next_1.Check;
        // @ts-ignore
        var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ class: "size-3.5" })));
        var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ class: "size-3.5" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
        /** @type {__VLS_StyleScopedClasses['size-3.5']} */ ;
    }
    // @ts-ignore
    [forwarded, utils_1.cn,];
    var __VLS_10;
    // @ts-ignore
    [];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
