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
var NewMilitarySymbol_vue_1 = require("./NewMilitarySymbol.vue");
var SymbolCodeSelect_vue_1 = require("./SymbolCodeSelect.vue");
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var symbolData_1 = require("@/composables/symbolData");
var solid_1 = require("@heroicons/vue/20/solid");
var core_1 = require("@vueuse/core");
var props = withDefaults(defineProps(), { symbolSize: 32 });
var searchQuery = (0, vue_1.ref)("");
var debouncedQuery = (0, core_1.useDebounce)(searchQuery, 100);
var inputRef = (0, vue_1.ref)();
var _a = (0, symbolData_1.useSymbolItems)((0, vue_1.computed)(function () { return props.initialSidc; })), mod1Items = _a.mod1Items, mod2Items = _a.mod2Items, mod1Value = _a.mod1Value, mod2Value = _a.mod2Value, symbolSets = _a.symbolSets, symbolSetValue = _a.symbolSetValue, icons = _a.icons, iconValue = _a.iconValue, csidc = _a.csidc, isLoaded = _a.isLoaded, loadData = _a.loadData;
if (!isLoaded.value)
    loadData();
var emit = defineEmits(["update-sidc"]);
var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
var isMobile = breakpoints.smallerOrEqual("md");
var filteredIconsByEntity = (0, vue_1.computed)(function () {
    if (!debouncedQuery.value.trim())
        return (0, utils_1.groupBy)(icons.value, "entity");
    var query = debouncedQuery.value.toLowerCase();
    var filtered = icons.value.filter(function (icon) {
        var _a, _b;
        return (((_a = icon.entityType) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query)) ||
            ((_b = icon.entitySubtype) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(query)));
    });
    return (0, utils_1.groupBy)(filtered, "entity");
});
var filteredMod1Items = (0, vue_1.computed)(function () {
    if (!debouncedQuery.value.trim())
        return mod1Items.value;
    var query = debouncedQuery.value.toLowerCase();
    return mod1Items.value.filter(function (item) { return item.text.toLowerCase().includes(query); });
});
var filteredMod2Items = (0, vue_1.computed)(function () {
    if (!debouncedQuery.value.trim())
        return mod2Items.value;
    var query = debouncedQuery.value.toLowerCase();
    return mod2Items.value.filter(function (item) { return item.text.toLowerCase().includes(query); });
});
(0, vue_1.watch)([mod1Value, mod2Value, iconValue], function (value, oldValue) {
    emit("update-sidc", csidc.value);
});
function goTo(sidc) {
    var el = document.getElementById("scode-".concat(sidc));
    if (el) {
        el.scrollIntoView(true);
    }
}
(0, vue_1.onActivated)(function () {
    searchQuery.value = "";
    (0, vue_1.nextTick)(function () {
        if (!isMobile.value) {
            inputRef.value.focus();
        }
        var el = document.getElementById("scode-".concat(iconValue.value));
        if (el) {
            el.scrollIntoView({ block: "center" });
        }
    });
});
function onEsc(e) {
    if (searchQuery.value.length) {
        e.stopPropagation();
        searchQuery.value = "";
    }
}
var __VLS_defaults = { symbolSize: 32 };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex px-0.5" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['px-0.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)(__assign({ class: "hidden w-60 flex-none pr-2 md:block" }));
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['w-60']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['md:block']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm leading-7 font-bold" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-7']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "dark:text-muted-foreground space-y-1.5 text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['dark:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var _loop_1 = function (entity, entityIcons) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ key: (entity) }, { class: "hover:text-muted-foreground/80" }));
    /** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground/80']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.goTo(entityIcons[0].code);
            // @ts-ignore
            [filteredIconsByEntity, goTo,];
        } }, { href: "#", type: "button" }));
    (entity);
    // @ts-ignore
    [];
};
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.filteredIconsByEntity)); _i < _b.length; _i++) {
    var _c = _b[_i][0], entity = _c[0], entityIcons = _c[1];
    _loop_1(entity, entityIcons);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-4 text-sm leading-7 font-bold" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-7']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "text-muted-foreground space-y-1.5 text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
if (__VLS_ctx.filteredMod1Items.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "hover:text-muted-foreground/80" }));
    /** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground/80']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.filteredMod1Items.length))
                return;
            __VLS_ctx.goTo('mod1');
            // @ts-ignore
            [goTo, filteredMod1Items,];
        } }, { href: "#", type: "button" }));
}
if (__VLS_ctx.filteredMod2Items.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "hover:text-muted-foreground/80" }));
    /** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground/80']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.filteredMod2Items.length))
                return;
            __VLS_ctx.goTo('mod2');
            // @ts-ignore
            [goTo, filteredMod2Items,];
        } }, { href: "#", type: "button" }));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-auto" }));
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
var __VLS_0;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign(__assign({ onKeydown: (__VLS_ctx.onEsc) }, { type: "text" }), { class: "placeholder:text-muted-foreground h-12 w-full border-0 bg-transparent pr-4 pl-7 focus:ring-0 sm:text-sm" }), { placeholder: "Search symbol set...", value: (__VLS_ctx.searchQuery), ref: "inputRef" }));
/** @type {__VLS_StyleScopedClasses['placeholder:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-7']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-0']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
var __VLS_5 = SymbolCodeSelect_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.symbolSetValue),
    items: (__VLS_ctx.symbolSets),
    symbolOptions: (__VLS_ctx.symbolOptions),
    label: "Symbol set",
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.symbolSetValue),
        items: (__VLS_ctx.symbolSets),
        symbolOptions: (__VLS_ctx.symbolOptions),
        label: "Symbol set",
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 max-h-[40vh] overflow-auto" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[40vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
for (var _d = 0, _e = __VLS_vFor((__VLS_ctx.filteredIconsByEntity)); _d < _e.length; _d++) {
    var _f = _e[_d][0], entity = _f[0], entityIcons = _f[1];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative" }, { key: (entity) }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "bg-popover border-border sticky top-0 border-t border-b p-2 px-4 text-sm font-medium" }, { id: (entity) }));
    /** @type {__VLS_StyleScopedClasses['bg-popover']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (entity);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    var _loop_2 = function (sidc, entity_1, entityType, entitySubtype, code) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.iconValue = code;
                // @ts-ignore
                [filteredIconsByEntity, onEsc, searchQuery, symbolSetValue, symbolSets, symbolOptions, iconValue,];
            } }, { type: "button", key: (sidc), id: ("scode-".concat(code)) }), { class: "flex w-full scroll-m-12 flex-col items-center justify-start rounded border border-transparent p-3 hover:border-gray-500" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['scroll-m-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-gray-500']} */ ;
        var __VLS_10 = NewMilitarySymbol_vue_1.default;
        // @ts-ignore
        var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            size: (__VLS_ctx.symbolSize),
            sidc: (sidc),
            modifiers: (__VLS_ctx.symbolOptions),
        }));
        var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{
                size: (__VLS_ctx.symbolSize),
                sidc: (sidc),
                modifiers: (__VLS_ctx.symbolOptions),
            }], __VLS_functionalComponentArgsRest(__VLS_11), false));
        if (entitySubtype && entityType) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-1 max-w-full truncate overflow-hidden text-center text-sm" }));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (entityType);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-1 max-w-full overflow-hidden text-center text-sm font-medium wrap-break-word" }, { class: (code === __VLS_ctx.iconValue ? 'bg-muted-foreground text-muted px-1' : '') }));
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['wrap-break-word']} */ ;
        (entitySubtype || entityType || entity_1);
        // @ts-ignore
        [symbolOptions, iconValue, symbolSize,];
    };
    for (var _g = 0, _h = __VLS_vFor((entityIcons)); _g < _h.length; _g++) {
        var _j = _h[_g][0], sidc = _j.sidc, entity_1 = _j.entity, entityType = _j.entityType, entitySubtype = _j.entitySubtype, code = _j.code;
        _loop_2(sidc, entity_1, entityType, entitySubtype, code);
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "border-border bg-muted sticky top-0 border-t border-b p-2 px-4 text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ id: "scode-mod1" }, { class: "mt-4 grid scroll-m-12 grid-cols-3 gap-x-2 gap-y-4 p-1" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-m-12']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
var _loop_3 = function (sidc, text, code) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.mod1Value = code;
            // @ts-ignore
            [filteredMod1Items, mod1Value,];
        } }, { type: "button", key: (sidc) }), { class: "flex w-full flex-col items-center justify-start rounded border border-transparent p-4 hover:border-gray-500" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-gray-500']} */ ;
    var __VLS_15 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        size: (__VLS_ctx.symbolSize),
        sidc: (sidc),
        modifiers: (__VLS_ctx.symbolOptions),
    }));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
            size: (__VLS_ctx.symbolSize),
            sidc: (sidc),
            modifiers: (__VLS_ctx.symbolOptions),
        }], __VLS_functionalComponentArgsRest(__VLS_16), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-1 max-w-full overflow-hidden text-center text-sm wrap-break-word" }));
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['wrap-break-word']} */ ;
    (text);
    // @ts-ignore
    [symbolOptions, symbolSize,];
};
for (var _k = 0, _l = __VLS_vFor((__VLS_ctx.filteredMod1Items)); _k < _l.length; _k++) {
    var _m = _l[_k][0], sidc = _m.sidc, text = _m.text, code = _m.code;
    _loop_3(sidc, text, code);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "bg-muted border-border sticky top-0 border-t border-b p-2 px-4 text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ id: "scode-mod2" }, { class: "mt-4 grid scroll-m-12 grid-cols-3 gap-x-2 gap-y-4 p-1" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-m-12']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
var _loop_4 = function (sidc, text, code) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.mod2Value = code;
            // @ts-ignore
            [filteredMod2Items, mod2Value,];
        } }, { type: "button", key: (sidc) }), { class: "flex w-full flex-col items-center justify-start rounded border border-transparent p-4 hover:border-gray-500" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-gray-500']} */ ;
    var __VLS_20 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        size: (__VLS_ctx.symbolSize),
        sidc: (sidc),
        modifiers: (__VLS_ctx.symbolOptions),
    }));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
            size: (__VLS_ctx.symbolSize),
            sidc: (sidc),
            modifiers: (__VLS_ctx.symbolOptions),
        }], __VLS_functionalComponentArgsRest(__VLS_21), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-1 max-w-full overflow-hidden text-center text-sm wrap-break-word" }));
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['wrap-break-word']} */ ;
    (text);
    // @ts-ignore
    [symbolOptions, symbolSize,];
};
for (var _o = 0, _p = __VLS_vFor((__VLS_ctx.filteredMod2Items)); _o < _p.length; _o++) {
    var _q = _p[_o][0], sidc = _q.sidc, text = _q.text, code = _q.code;
    _loop_4(sidc, text, code);
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
