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
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var textToOrbat_ts_1 = require("@/views/texttoorbat/textToOrbat.ts");
var props = defineProps();
// Map echelon codes (from SIDC positions 8-9) to labels
var echelonCodeLabels = {
    "00": "Unspecified",
    "11": "Team/Crew",
    "12": "Squad",
    "13": "Section",
    "14": "Platoon",
    "15": "Company",
    "16": "Battalion",
    "17": "Regiment",
    "18": "Brigade",
    "21": "Division",
    "22": "Corps",
    "23": "Army",
    "24": "Army Group",
    "25": "Region",
    "26": "Command",
};
var echelonCode = (0, vue_1.computed)(function () { return props.unit.sidc.substring(8, 10); });
var entityCode = (0, vue_1.computed)(function () { return props.unit.sidc.substring(10, 20); });
var echelonLabel = (0, vue_1.computed)(function () {
    var _a;
    return (_a = echelonCodeLabels[echelonCode.value]) !== null && _a !== void 0 ? _a : "Unit";
});
var echelonVarName = (0, vue_1.computed)(function () {
    var _a;
    return (_a = textToOrbat_ts_1.ECHELON_CODE_TO_NAME[echelonCode.value]) !== null && _a !== void 0 ? _a : echelonCode.value;
});
var entityVarName = (0, vue_1.computed)(function () {
    var _a;
    return (_a = textToOrbat_ts_1.ICON_CODE_TO_NAME[entityCode.value]) !== null && _a !== void 0 ? _a : entityCode.value;
});
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "hover:bg-muted/50 flex items-center gap-2 rounded px-2 py-1" }));
/** @type {__VLS_StyleScopedClasses['hover:bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
var __VLS_0 = NewMilitarySymbol_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    sidc: (__VLS_ctx.unit.sidc),
    size: (24),
    options: ({ outlineColor: 'white', outlineWidth: 8 }),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        sidc: (__VLS_ctx.unit.sidc),
        size: (24),
        options: ({ outlineColor: 'white', outlineWidth: 8 }),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
(__VLS_ctx.unit.name);
if (__VLS_ctx.showDebug) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-mono text-xs text-amber-600 dark:text-amber-400" }));
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:text-amber-400']} */ ;
    (__VLS_ctx.echelonVarName);
    (__VLS_ctx.entityVarName);
}
if (__VLS_ctx.unit.children.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "mt-1 ml-6 space-y-1 border-l pl-2" }));
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-l']} */ ;
    /** @type {__VLS_StyleScopedClasses['pl-2']} */ ;
    for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.unit.children)); _i < _a.length; _i++) {
        var child = _a[_i][0];
        var __VLS_5 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.OrbatTreeNode} */
        OrbatTreeNode;
        // @ts-ignore
        var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            key: (child.id),
            unit: (child),
            showDebug: (__VLS_ctx.showDebug),
        }));
        var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
                key: (child.id),
                unit: (child),
                showDebug: (__VLS_ctx.showDebug),
            }], __VLS_functionalComponentArgsRest(__VLS_6), false));
        // @ts-ignore
        [unit, unit, unit, unit, showDebug, showDebug, echelonVarName, entityVarName,];
    }
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
