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
var solid_1 = require("@heroicons/vue/20/solid");
var props = withDefaults(defineProps(), { select: false, open: true });
var emit = defineEmits(["toggle", "change"]);
var __VLS_defaults = { select: false, open: true };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "group bg-muted/50 hover:bg-muted flex divide-x divide-gray-200" }));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-gray-200']} */ ;
if (__VLS_ctx.select) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-foreground flex w-10 flex-0 items-center justify-center overflow-hidden border-b px-4 py-3.5" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign({ onChange: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.select))
                return;
            __VLS_ctx.emit('change', $event);
            // @ts-ignore
            [select, emit,];
        } }, { type: "checkbox", id: (__VLS_ctx.item), checked: (__VLS_ctx.checked), indeterminate: (__VLS_ctx.indeterminate) }), { class: "text-primary focus:ring-ring rounded border-gray-300 sm:left-6" }));
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:left-6']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('toggle', !__VLS_ctx.open);
        // @ts-ignore
        [emit, item, checked, indeterminate, open,];
    } }, { class: "flex flex-auto cursor-pointer items-center border-b px-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('toggle', !__VLS_ctx.open);
        // @ts-ignore
        [emit, open,];
    } }, { class: "ml-0" }));
/** @type {__VLS_StyleScopedClasses['ml-0']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
solid_1.ChevronRightIcon;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground h-6 w-6 text-red-800 transition-transform" }, { class: ({
        'rotate-90': __VLS_ctx.open,
    }) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground h-6 w-6 text-red-800 transition-transform" }, { class: ({
            'rotate-90': __VLS_ctx.open,
        }) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:group-hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-800']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-bolder" }));
/** @type {__VLS_StyleScopedClasses['font-bolder']} */ ;
(__VLS_ctx.item);
// @ts-ignore
[item, open,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
