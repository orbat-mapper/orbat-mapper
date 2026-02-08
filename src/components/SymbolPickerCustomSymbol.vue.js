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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var solid_1 = require("@heroicons/vue/20/solid");
var lucide_vue_next_1 = require("lucide-vue-next");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var utils_1 = require("@/utils");
var empty_1 = require("@/components/ui/empty");
var injects_ts_1 = require("@/components/injects.ts");
var constants_ts_1 = require("@/config/constants.ts");
var button_1 = require("@/components/ui/button");
var props = withDefaults(defineProps(), {});
var emit = defineEmits(["update-sidc"]);
var store = (0, utils_1.injectStrict)(injects_ts_1.activeScenarioKey).store;
var searchQuery = (0, vue_1.ref)("");
var debouncedQuery = (0, core_1.useDebounce)(searchQuery, 100);
var inputRef = (0, vue_1.ref)();
var filteredIcons = (0, vue_1.computed)(function () {
    var icons = Object.values(store.state.customSymbolMap);
    if (!debouncedQuery.value.trim()) {
        return icons;
    }
    var query = debouncedQuery.value.toLowerCase();
    return icons.filter(function (icon) {
        return icon.name.toLowerCase().includes(query);
    });
});
function onEsc(e) {
    if (searchQuery.value.length) {
        e.stopPropagation();
        searchQuery.value = "";
    }
}
var __VLS_defaults = {};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex px-0.5" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['px-0.5']} */ ;
if (__VLS_ctx.filteredIcons.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-auto" }));
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    var __VLS_0 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.MagnifyingGlassIcon} */
    solid_1.MagnifyingGlassIcon;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground pointer-events-none absolute top-3.5 left-0 h-5 w-5" }, { 'aria-hidden': "true" })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground pointer-events-none absolute top-3.5 left-0 h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign(__assign({ onKeydown: (__VLS_ctx.onEsc) }, { type: "text" }), { class: "text-foreground placeholder:text-muted-foreground h-12 w-full border-0 bg-transparent pr-4 pl-7 focus:ring-0 sm:text-sm" }), { placeholder: "Search custom symbol...", value: (__VLS_ctx.searchQuery), ref: "inputRef" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['placeholder:text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pl-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 max-h-[40vh] overflow-auto sm:max-h-[50vh]" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[40vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:max-h-[50vh]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    var _loop_1 = function (id, name_1, src) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.filteredIcons.length))
                    return;
                __VLS_ctx.emit('update-sidc', id);
                // @ts-ignore
                [filteredIcons, filteredIcons, onEsc, searchQuery, emit,];
            } }, { type: "button", key: (id) }), { class: "flex w-full scroll-m-12 flex-col items-center justify-center rounded border border-transparent p-3 hover:border-gray-500" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['scroll-m-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-gray-500']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "relative" }));
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)(__assign({ src: src, alt: (name_1) }, { class: "w-24 flex-auto object-contain" }));
        /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-1 max-w-full shrink-0 overflow-hidden text-center text-sm font-medium break-words" }, { class: (id === ((_a = __VLS_ctx.initialSidc) === null || _a === void 0 ? void 0 : _a.slice(__VLS_ctx.CUSTOM_SYMBOL_SLICE))
                ? 'text-red-900'
                : 'text-foreground') }));
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
        (name_1);
        // @ts-ignore
        [initialSidc, constants_ts_1.CUSTOM_SYMBOL_SLICE,];
    };
    for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.filteredIcons)); _i < _b.length; _i++) {
        var _c = _b[_i][0], id = _c.id, name_1 = _c.name, src = _c.src;
        _loop_1(id, name_1, src);
    }
}
else {
    var __VLS_5 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Empty | typeof __VLS_components.Empty} */
    empty_1.Empty;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ class: "border border-dashed" })));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ class: "border border-dashed" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    var __VLS_10 = __VLS_8.slots.default;
    var __VLS_11 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.EmptyHeader | typeof __VLS_components.EmptyHeader} */
    empty_1.EmptyHeader;
    // @ts-ignore
    var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
    var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_12), false));
    var __VLS_16 = __VLS_14.slots.default;
    var __VLS_17 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.EmptyMedia | typeof __VLS_components.EmptyMedia} */
    empty_1.EmptyMedia;
    // @ts-ignore
    var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        variant: "icon",
    }));
    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
            variant: "icon",
        }], __VLS_functionalComponentArgsRest(__VLS_18), false));
    var __VLS_22 = __VLS_20.slots.default;
    var __VLS_23 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ShapesIcon} */
    lucide_vue_next_1.ShapesIcon;
    // @ts-ignore
    var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
    var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_24), false));
    // @ts-ignore
    [];
    var __VLS_20;
    var __VLS_28 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.EmptyTitle | typeof __VLS_components.EmptyTitle} */
    empty_1.EmptyTitle;
    // @ts-ignore
    var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({}));
    var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_29), false));
    var __VLS_33 = __VLS_31.slots.default;
    // @ts-ignore
    [];
    var __VLS_31;
    var __VLS_34 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.EmptyDescription | typeof __VLS_components.EmptyDescription} */
    empty_1.EmptyDescription;
    // @ts-ignore
    var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({}));
    var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_35), false));
    var __VLS_39 = __VLS_37.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    // @ts-ignore
    [];
    var __VLS_37;
    // @ts-ignore
    [];
    var __VLS_14;
    var __VLS_40 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40(__assign(__assign({ variant: "link", asChild: true }, { class: "text-muted-foreground" }), { size: "sm" })));
    var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign(__assign({ variant: "link", asChild: true }, { class: "text-muted-foreground" }), { size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_41), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    var __VLS_45 = __VLS_43.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://docs.orbat-mapper.app/guide/custom-symbols",
        target: "_blank",
        rel: "noreferrer",
    });
    var __VLS_46 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ArrowUpRightIcon} */
    lucide_vue_next_1.ArrowUpRightIcon;
    // @ts-ignore
    var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({}));
    var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_47), false));
    // @ts-ignore
    [];
    var __VLS_43;
    // @ts-ignore
    [];
    var __VLS_8;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
