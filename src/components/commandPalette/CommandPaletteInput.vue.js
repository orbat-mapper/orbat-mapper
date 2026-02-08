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
var core_1 = require("@vueuse/core");
var lucide_vue_next_1 = require("lucide-vue-next");
var utils_1 = require("@/lib/utils");
defineOptions({
    inheritAttrs: false,
});
var props = defineProps();
var query = defineModel({ required: true });
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var forwardedProps = (0, reka_ui_1.useForwardProps)(delegatedProps);
function onEscape(event) {
    if (query.value.length > 0) {
        query.value = "";
        event.preventDefault();
        return;
    }
}
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ 'data-slot': "command-input-wrapper" }, { class: "mr-4 flex h-12 items-center gap-2 border-b px-6" }));
/** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Search} */
lucide_vue_next_1.Search;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "size-4 shrink-0 opacity-50" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "size-4 shrink-0 opacity-50" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
var __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.ListboxFilter} */
reka_ui_1.ListboxFilter;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign(__assign(__assign({ 'onKeydown': {} }, (__assign(__assign({}, __VLS_ctx.forwardedProps), __VLS_ctx.$attrs))), { modelValue: (__VLS_ctx.query), dataSlot: "command-input", autoFocus: true }), { class: (__VLS_ctx.cn('placeholder:text-muted-foreground border-muted flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50', props.class)) })));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onKeydown': {} }, (__assign(__assign({}, __VLS_ctx.forwardedProps), __VLS_ctx.$attrs))), { modelValue: (__VLS_ctx.query), dataSlot: "command-input", autoFocus: true }), { class: (__VLS_ctx.cn('placeholder:text-muted-foreground border-muted flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10;
var __VLS_11 = ({ keydown: {} },
    { onKeydown: (__VLS_ctx.onEscape) });
var __VLS_8;
var __VLS_9;
// @ts-ignore
[forwardedProps, $attrs, query, utils_1.cn, onEscape,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
