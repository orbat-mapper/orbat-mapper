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
var item_1 = require("@/components/ui/item");
var lucide_vue_next_1 = require("lucide-vue-next");
var badge_1 = require("@/components/ui/badge");
var pretty_bytes_1 = require("pretty-bytes");
var __VLS_props = defineProps();
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (Array.isArray(__VLS_ctx.importData.fileInfo)) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full flex-col gap-4 sm:flex-row sm:gap-6" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:gap-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    var __VLS_0 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ItemGroup | typeof __VLS_components.ItemGroup} */
    item_1.ItemGroup;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "flex-auto" })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "flex-auto" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    var __VLS_5 = __VLS_3.slots.default;
    for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.importData.fileInfo)); _i < _a.length; _i++) {
        var _b = _a[_i], file = _b[0], index = _b[1];
        var __VLS_6 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Item | typeof __VLS_components.Item} */
        item_1.Item;
        // @ts-ignore
        var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            key: (index),
            variant: "outline",
            size: "sm",
        }));
        var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{
                key: (index),
                variant: "outline",
                size: "sm",
            }], __VLS_functionalComponentArgsRest(__VLS_7), false));
        var __VLS_11 = __VLS_9.slots.default;
        var __VLS_12 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.ItemMedia | typeof __VLS_components.ItemMedia} */
        item_1.ItemMedia;
        // @ts-ignore
        var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({}));
        var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_13), false));
        var __VLS_17 = __VLS_15.slots.default;
        var __VLS_18 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.PaperclipIcon} */
        lucide_vue_next_1.PaperclipIcon;
        // @ts-ignore
        var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: "size-4" })));
        var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: "size-4" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        // @ts-ignore
        [importData, importData,];
        var __VLS_15;
        var __VLS_23 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.ItemContent | typeof __VLS_components.ItemContent} */
        item_1.ItemContent;
        // @ts-ignore
        var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23(__assign({ class: "flex-row items-center justify-between gap-2" })));
        var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([__assign({ class: "flex-row items-center justify-between gap-2" })], __VLS_functionalComponentArgsRest(__VLS_24), false));
        /** @type {__VLS_StyleScopedClasses['flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        var __VLS_28 = __VLS_26.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-4" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-mono font-medium" }));
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (file.fileName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        (__VLS_ctx.prettyBytes(file.fileSize));
        var __VLS_29 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        badge_1.Badge;
        // @ts-ignore
        var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            variant: "secondary",
        }));
        var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
                variant: "secondary",
            }], __VLS_functionalComponentArgsRest(__VLS_30), false));
        var __VLS_34 = __VLS_32.slots.default;
        (file.format);
        // @ts-ignore
        [pretty_bytes_1.default,];
        var __VLS_32;
        // @ts-ignore
        [];
        var __VLS_26;
        // @ts-ignore
        [];
        var __VLS_9;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_3;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
