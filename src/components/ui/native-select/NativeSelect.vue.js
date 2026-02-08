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
var utils_1 = require("@/lib/utils");
defineOptions({
    inheritAttrs: false,
});
var props = defineProps();
var emit = defineEmits();
var modelValue = (0, core_1.useVModel)(props, "modelValue", emit, {
    passive: true,
    defaultValue: "",
});
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "group/native-select relative w-fit has-[select:disabled]:opacity-50" }, { 'data-slot': "native-select-wrapper" }));
/** @type {__VLS_StyleScopedClasses['group/native-select']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
/** @type {__VLS_StyleScopedClasses['has-[select:disabled]:opacity-50']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)(__assign(__assign(__assign({}, (__assign(__assign({}, __VLS_ctx.$attrs), __VLS_ctx.delegatedProps))), { value: (__VLS_ctx.modelValue), 'data-slot': "native-select" }), { class: (__VLS_ctx.cn('border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 h-9 w-full min-w-0 appearance-none rounded-md border bg-transparent px-3 py-2 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', props.class)) }));
var __VLS_0 = {};
var __VLS_2;
/** @ts-ignore @type {typeof __VLS_components.ChevronDownIcon} */
lucide_vue_next_1.ChevronDownIcon;
// @ts-ignore
var __VLS_3 = __VLS_asFunctionalComponent1(__VLS_2, new __VLS_2(__assign({ class: "text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 opacity-50 select-none" }, { 'aria-hidden': "true", dataSlot: "native-select-icon" })));
var __VLS_4 = __VLS_3.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 opacity-50 select-none" }, { 'aria-hidden': "true", dataSlot: "native-select-icon" })], __VLS_functionalComponentArgsRest(__VLS_3), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['right-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
// @ts-ignore
var __VLS_1 = __VLS_0;
// @ts-ignore
[$attrs, delegatedProps, modelValue, utils_1.cn,];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
