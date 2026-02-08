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
var vue_1 = require("vue");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var tabs_1 = require("@/components/ui/tabs");
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var textToOrbat_1 = require("@/views/texttoorbat/textToOrbat");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var open = defineModel({ default: false });
var searchQuery = (0, vue_1.ref)("");
var showDebug = (0, vue_1.ref)(false);
// Build SIDC for icon patterns (using battalion echelon for display)
function buildIconSidc(entityCode) {
    // Format: 10 + 03 (friendly) + 10 (land unit) + 0 (present) + 0 (not HQ/TF) + 16 (battalion) + entityCode
    return "1003100000".concat(entityCode);
}
// Build SIDC for echelon patterns (using infantry as base icon)
function buildEchelonSidc(echelonCode) {
    // Format: 10 + 03 (friendly) + 10 (land unit) + 0 (present) + 0 (not HQ/TF) + echelon + infantry icon
    return "10031000".concat(echelonCode, "1211000000");
}
// Extract keywords from regex pattern for display
function extractKeywords(pattern) {
    var source = pattern.source;
    // Remove regex syntax and extract the main keywords
    var cleaned = source
        .replace(/\\b/g, "") // word boundaries
        .replace(/\\s\*/g, " ") // space patterns
        .replace(/\[- ]\??/g, "-") // optional hyphen/space
        .replace(/\(\?:/g, "(") // non-capturing groups
        .replace(/\?/g, "") // optional markers
        .replace(/s\?/g, "(s)") // optional plurals
        .replace(/\\/g, ""); // escape chars
    // Split by | and clean up
    return cleaned
        .replace(/^\(/, "")
        .replace(/\)$/, "")
        .split("|")
        .map(function (p) { return p.trim(); })
        .filter(function (p) { return p.length > 0; });
}
var echelonEntries = (0, vue_1.computed)(function () {
    return textToOrbat_1.ECHELON_PATTERNS.map(function (p) { return ({
        label: p.label,
        keywords: extractKeywords(p.pattern),
        sidc: buildEchelonSidc(p.code),
        originalPattern: p.pattern.source,
    }); });
});
var iconEntries = (0, vue_1.computed)(function () {
    return textToOrbat_1.ICON_PATTERNS.map(function (p) { return ({
        label: p.label,
        keywords: extractKeywords(p.pattern),
        sidc: buildIconSidc(p.code),
        originalPattern: p.pattern.source,
        constantName: textToOrbat_1.ICON_CODE_TO_NAME[p.code],
        code: p.code,
    }); });
});
var filteredEchelonEntries = (0, vue_1.computed)(function () {
    var query = searchQuery.value.toLowerCase().trim();
    if (!query)
        return echelonEntries.value;
    return echelonEntries.value.filter(function (entry) {
        return entry.label.toLowerCase().includes(query) ||
            entry.keywords.some(function (kw) { return kw.toLowerCase().includes(query); });
    });
});
var filteredIconEntries = (0, vue_1.computed)(function () {
    var query = searchQuery.value.toLowerCase().trim();
    if (!query)
        return iconEntries.value;
    return iconEntries.value.filter(function (entry) {
        return entry.label.toLowerCase().includes(query) ||
            entry.keywords.some(function (kw) { return kw.toLowerCase().includes(query); });
    });
});
var __VLS_defaultModels = {
    'modelValue': false,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
dialog_1.Dialog;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    open: (__VLS_ctx.open),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        open: (__VLS_ctx.open),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.DialogContent | typeof __VLS_components.DialogContent} */
dialog_1.DialogContent;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "md:max-w-4xl" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "md:max-w-4xl" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['md:max-w-4xl']} */ ;
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.DialogHeader | typeof __VLS_components.DialogHeader} */
dialog_1.DialogHeader;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_14), false));
var __VLS_18 = __VLS_16.slots.default;
var __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.DialogTitle | typeof __VLS_components.DialogTitle} */
dialog_1.DialogTitle;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_20), false));
var __VLS_24 = __VLS_22.slots.default;
// @ts-ignore
[open,];
var __VLS_22;
var __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.DialogDescription | typeof __VLS_components.DialogDescription} */
dialog_1.DialogDescription;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_30 = __VLS_28.slots.default;
// @ts-ignore
[];
var __VLS_28;
// @ts-ignore
[];
var __VLS_16;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['md:justify-between']} */ ;
var __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.Input} */
input_1.Input;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ modelValue: (__VLS_ctx.searchQuery), type: "text", placeholder: "Search patterns..." }, { class: "w-full md:max-w-sm" })));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.searchQuery), type: "text", placeholder: "Search patterns..." }, { class: "w-full md:max-w-sm" })], __VLS_functionalComponentArgsRest(__VLS_32), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-sm']} */ ;
var __VLS_36 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.showDebug),
}));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.showDebug),
    }], __VLS_functionalComponentArgsRest(__VLS_37), false));
var __VLS_41 = __VLS_39.slots.default;
// @ts-ignore
[searchQuery, showDebug,];
var __VLS_39;
var __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
tabs_1.Tabs;
// @ts-ignore
var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42(__assign({ defaultValue: "icons" }, { class: "w-full" })));
var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([__assign({ defaultValue: "icons" }, { class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_43), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_47 = __VLS_45.slots.default;
var __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
tabs_1.TabsList;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48(__assign({ class: "grid w-full grid-cols-2" })));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign({ class: "grid w-full grid-cols-2" })], __VLS_functionalComponentArgsRest(__VLS_49), false));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
var __VLS_53 = __VLS_51.slots.default;
var __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
tabs_1.TabsTrigger;
// @ts-ignore
var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    value: "icons",
}));
var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([{
        value: "icons",
    }], __VLS_functionalComponentArgsRest(__VLS_55), false));
var __VLS_59 = __VLS_57.slots.default;
(__VLS_ctx.filteredIconEntries.length);
// @ts-ignore
[filteredIconEntries,];
var __VLS_57;
var __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
tabs_1.TabsTrigger;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    value: "echelons",
}));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([{
        value: "echelons",
    }], __VLS_functionalComponentArgsRest(__VLS_61), false));
var __VLS_65 = __VLS_63.slots.default;
(__VLS_ctx.filteredEchelonEntries.length);
// @ts-ignore
[filteredEchelonEntries,];
var __VLS_63;
// @ts-ignore
[];
var __VLS_51;
var __VLS_66;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66(__assign({ value: "icons" }, { class: "mt-4" })));
var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([__assign({ value: "icons" }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_67), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_71 = __VLS_69.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "max-h-[45vh] overflow-y-auto sm:max-h-[60vh]" }));
/** @type {__VLS_StyleScopedClasses['max-h-[45vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:max-h-[60vh]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)(__assign({ class: "w-full table-fixed text-sm md:table-auto" }));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['table-fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['md:table-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)(__assign({ class: "bg-muted sticky top-0" }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ class: "p-2 text-left font-medium" }));
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ class: "p-2 text-left font-medium" }));
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ class: "p-2 text-left font-medium" }));
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)(__assign({ class: "divide-y" }));
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.filteredIconEntries)); _i < _a.length; _i++) {
    var entry = _a[_i][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign({ key: (entry.label) }, { class: "hover:bg-muted/50" }));
    /** @type {__VLS_StyleScopedClasses['hover:bg-muted/50']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "p-2" }));
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-10 w-10 items-center justify-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    var __VLS_72 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        sidc: (entry.sidc),
        size: (35),
        options: ({ outlineWidth: 6, outlineColor: 'white' }),
    }));
    var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([{
            sidc: (entry.sidc),
            size: (35),
            options: ({ outlineWidth: 6, outlineColor: 'white' }),
        }], __VLS_functionalComponentArgsRest(__VLS_73), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "min-w-0 p-2" }));
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-col gap-0.5" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (entry.label);
    if (__VLS_ctx.showDebug) {
        if (entry.constantName) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground text-xs wrap-break-word whitespace-normal" }));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['wrap-break-word']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-normal']} */ ;
            (entry.constantName);
        }
        if (entry.code) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground font-mono text-xs tracking-wider break-all whitespace-normal" }));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['break-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-normal']} */ ;
            (entry.code);
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "p-2" }));
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap gap-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    for (var _b = 0, _c = __VLS_vFor((entry.keywords)); _b < _c.length; _b++) {
        var keyword = _c[_b][0];
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ key: (keyword) }, { class: "rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200" }));
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-blue-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:bg-blue-900']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:text-blue-200']} */ ;
        (keyword);
        // @ts-ignore
        [showDebug, filteredIconEntries,];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_69;
var __VLS_77;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77(__assign({ value: "echelons" }, { class: "mt-4" })));
var __VLS_79 = __VLS_78.apply(void 0, __spreadArray([__assign({ value: "echelons" }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_78), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_82 = __VLS_80.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "max-h-96 overflow-x-auto overflow-y-auto" }));
/** @type {__VLS_StyleScopedClasses['max-h-96']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)(__assign({ class: "w-full table-fixed text-sm" }));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['table-fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)(__assign({ class: "bg-muted sticky top-0" }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ class: "p-2 text-left font-medium" }));
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ class: "w-1/3 p-2 text-left font-medium" }));
/** @type {__VLS_StyleScopedClasses['w-1/3']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ class: "p-2 text-left font-medium" }));
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)(__assign({ class: "divide-y" }));
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
for (var _d = 0, _e = __VLS_vFor((__VLS_ctx.filteredEchelonEntries)); _d < _e.length; _d++) {
    var entry = _e[_d][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign({ key: (entry.label) }, { class: "hover:bg-muted/50" }));
    /** @type {__VLS_StyleScopedClasses['hover:bg-muted/50']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "p-2" }));
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-10 w-10 items-center justify-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    var __VLS_83 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
        sidc: (entry.sidc),
        size: (35),
        options: ({ outlineWidth: 8, outlineColor: 'white' }),
    }));
    var __VLS_85 = __VLS_84.apply(void 0, __spreadArray([{
            sidc: (entry.sidc),
            size: (35),
            options: ({ outlineWidth: 8, outlineColor: 'white' }),
        }], __VLS_functionalComponentArgsRest(__VLS_84), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "min-w-0 p-2" }));
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    (entry.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "p-2" }));
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap gap-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    for (var _f = 0, _g = __VLS_vFor((entry.keywords)); _f < _g.length; _f++) {
        var keyword = _g[_f][0];
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ key: (keyword) }, { class: "rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200" }));
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-green-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-green-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:bg-green-900']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:text-green-200']} */ ;
        (keyword);
        // @ts-ignore
        [filteredEchelonEntries,];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_80;
// @ts-ignore
[];
var __VLS_45;
var __VLS_88;
/** @ts-ignore @type {typeof __VLS_components.DialogFooter | typeof __VLS_components.DialogFooter} */
dialog_1.DialogFooter;
// @ts-ignore
var __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88(__assign({ class: "text-muted-foreground mt-2 text-sm" })));
var __VLS_90 = __VLS_89.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground mt-2 text-sm" })], __VLS_functionalComponentArgsRest(__VLS_89), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_93 = __VLS_91.slots.default;
// @ts-ignore
[];
var __VLS_91;
// @ts-ignore
[];
var __VLS_10;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
