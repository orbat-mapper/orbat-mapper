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
Object.defineProperty(exports, "__esModule", { value: true });
var props = defineProps({
    items: { type: Array, required: true },
    small: { type: Boolean, default: false },
});
var __VLS_ctx = __assign(__assign(__assign({}, {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "relative z-0 inline-flex rounded-md shadow-xs" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-0']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xs']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.items)); _i < _a.length; _i++) {
    var _b = _a[_i], item = _b[0], index = _b[1];
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: (item.onClick) }, { type: "button", disabled: (item.disabled) }), { class: "text-muted-foreground focus:border-primary focus:ring-ring bg-background hover:bg-muted/50 relative inline-flex items-center border border-gray-300 px-4 font-medium focus:z-10 focus:ring-1 focus:outline-hidden disabled:opacity-50" }), { class: ({
            'rounded-l-md': index === 0,
            'rounded-r-md': index === __VLS_ctx.items.length - 1,
            '-ml-px': index > 0,
            'py-1.5 text-xs': __VLS_ctx.small,
            'py-2 text-sm': !__VLS_ctx.small,
        }) }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-muted/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-l-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-r-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['-ml-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (item.label);
    // @ts-ignore
    [items, items, small, small,];
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    props: {
        items: { type: Array, required: true },
        small: { type: Boolean, default: false },
    },
});
exports.default = {};
