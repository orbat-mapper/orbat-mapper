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
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
reka_ui_1.DropdownMenuCheckboxItem;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ dataSlot: "dropdown-menu-checkbox-item" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4', props.class)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "dropdown-menu-checkbox-item" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center" }));
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['size-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItemIndicator | typeof __VLS_components.DropdownMenuItemIndicator} */
reka_ui_1.DropdownMenuItemIndicator;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13 = {};
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.Check} */
lucide_vue_next_1.Check;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ class: "size-4" })));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ class: "size-4" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
// @ts-ignore
[forwarded, utils_1.cn,];
var __VLS_10;
var __VLS_20 = {};
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13, __VLS_21 = __VLS_20;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
