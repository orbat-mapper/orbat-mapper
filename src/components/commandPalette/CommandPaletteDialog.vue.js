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
var reka_ui_1 = require("reka-ui");
var dialog_1 = require("@/components/ui/dialog");
var props = withDefaults(defineProps(), {
    title: "Command Palette",
    description: "Search for a command to run...",
});
var emits = defineEmits();
var forwarded = (0, reka_ui_1.useForwardPropsEmits)(props, emits);
var __VLS_defaults = {
    title: "Command Palette",
    description: "Search for a command to run...",
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
dialog_1.Dialog;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({}, (__VLS_ctx.forwarded))));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({}, (__VLS_ctx.forwarded))], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
{
    var __VLS_6 = __VLS_3.slots.default;
    var slotProps = __VLS_vSlot(__VLS_6)[0];
    var __VLS_7 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DialogContent | typeof __VLS_components.DialogContent} */
    dialog_1.DialogContent;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "bg-popover top-14 translate-y-0 overflow-hidden p-0 sm:max-w-xl" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "bg-popover top-14 translate-y-0 overflow-hidden p-0 sm:max-w-xl" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['bg-popover']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['translate-y-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:max-w-xl']} */ ;
    var __VLS_12 = __VLS_10.slots.default;
    var __VLS_13 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DialogHeader | typeof __VLS_components.DialogHeader} */
    dialog_1.DialogHeader;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ class: "sr-only" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ class: "sr-only" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    var __VLS_18 = __VLS_16.slots.default;
    var __VLS_19 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DialogTitle | typeof __VLS_components.DialogTitle} */
    dialog_1.DialogTitle;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = __VLS_22.slots.default;
    (__VLS_ctx.title);
    // @ts-ignore
    [forwarded, title,];
    var __VLS_22;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DialogDescription | typeof __VLS_components.DialogDescription} */
    dialog_1.DialogDescription;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = __VLS_28.slots.default;
    (__VLS_ctx.description);
    // @ts-ignore
    [description,];
    var __VLS_28;
    // @ts-ignore
    [];
    var __VLS_16;
    var __VLS_31 = __assign({}, (slotProps));
    // @ts-ignore
    [];
    var __VLS_10;
    // @ts-ignore
    [];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
// @ts-ignore
var __VLS_32 = __VLS_31;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
