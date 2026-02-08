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
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var textToOrbat_1 = require("@/views/texttoorbat/textToOrbat");
var open = defineModel({ default: false });
var searchQuery = (0, vue_1.ref)("");
// Build SIDC from entity code (same compact form used previously in this component)
function buildSidc(entityCode) {
    // Format: version(2) context(1) standard_identity(1) symbol_set(2) status(1) hq/TF(1) echelon(2) entity(10)
    // Use friendly standard identity and land unit symbol set with unspecified echelon
    return "1003".concat(10, "0000").concat(entityCode);
}
function friendlyNameFromVar(varName) {
    return varName
        .replace(/^ICON_/, "")
        .split("_")
        .map(function (w) { return w[0] + w.slice(1).toLowerCase(); })
        .join(" ");
}
var icons = Object.entries(textToOrbat_1.ICON_CODE_TO_NAME)
    .map(function (_a) {
    var _b;
    var entityCode = _a[0], varName = _a[1];
    var patternLabel = (_b = textToOrbat_1.ICON_PATTERNS.find(function (p) { return p.code === entityCode; })) === null || _b === void 0 ? void 0 : _b.label;
    var name = patternLabel !== null && patternLabel !== void 0 ? patternLabel : friendlyNameFromVar(varName);
    return { name: name, code: varName, sidc: buildSidc(entityCode) };
})
    .sort(function (a, b) { return a.name.localeCompare(b.name); });
var filteredIcons = (0, vue_1.computed)(function () {
    var query = searchQuery.value.toLowerCase().trim();
    if (!query)
        return icons;
    return icons.filter(function (icon) {
        return icon.name.toLowerCase().includes(query) || icon.code.toLowerCase().includes(query);
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
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "md:max-w-3xl" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "md:max-w-3xl" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['md:max-w-3xl']} */ ;
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
var __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.Input} */
input_1.Input;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ modelValue: (__VLS_ctx.searchQuery), type: "text", placeholder: "Search by name or code..." }, { class: "w-full" })));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.searchQuery), type: "text", placeholder: "Search by name or code..." }, { class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_32), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid max-h-[60vh] grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[60vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.filteredIcons)); _i < _a.length; _i++) {
    var icon = _a[_i][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (icon.code) }, { class: "hover:bg-muted flex flex-col items-center gap-2 rounded border p-3 transition-colors" }));
    /** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-12 w-12 items-center justify-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    var __VLS_36 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        sidc: (icon.sidc),
        size: (40),
        options: ({ outlineWidth: 8, outlineColor: 'white' }),
    }));
    var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
            sidc: (icon.sidc),
            size: (40),
            options: ({ outlineWidth: 8, outlineColor: 'white' }),
        }], __VLS_functionalComponentArgsRest(__VLS_37), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "truncate" }, { title: (icon.name) }));
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    (icon.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-mono text-xs leading-6 text-amber-600 dark:text-amber-400" }));
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:text-amber-400']} */ ;
    (icon.code.slice(5));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-mono text-sm tracking-wider" }));
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    (icon.sidc.slice(10));
    // @ts-ignore
    [searchQuery, filteredIcons,];
}
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.DialogFooter | typeof __VLS_components.DialogFooter} */
dialog_1.DialogFooter;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41(__assign({ class: "text-muted-foreground mt-2 text-sm" })));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground mt-2 text-sm" })], __VLS_functionalComponentArgsRest(__VLS_42), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_46 = __VLS_44.slots.default;
(__VLS_ctx.filteredIcons.length);
(__VLS_ctx.icons.length);
// @ts-ignore
[filteredIcons, icons,];
var __VLS_44;
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
