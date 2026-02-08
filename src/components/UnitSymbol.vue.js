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
var injects_ts_1 = require("@/components/injects.ts");
var constants_ts_1 = require("@/config/constants.ts");
var props = withDefaults(defineProps(), { size: 15 });
var store = ((0, vue_1.inject)(injects_ts_1.activeScenarioKey) || {}).store;
var customSidc = (0, vue_1.computed)(function () {
    var _a, _b, _c, _d;
    if ((_a = props.sidc) === null || _a === void 0 ? void 0 : _a.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)) {
        var symbolId = props.sidc.slice(constants_ts_1.CUSTOM_SYMBOL_SLICE);
        var mapping = (_d = (_c = (_b = props.options) === null || _b === void 0 ? void 0 : _b.customSymbolMap) !== null && _c !== void 0 ? _c : store === null || store === void 0 ? void 0 : store.state.customSymbolMap) !== null && _d !== void 0 ? _d : {};
        return mapping[symbolId];
    }
    return null;
});
var __VLS_defaults = { size: 15 };
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.customSidc) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)(__assign({ src: (__VLS_ctx.customSidc.src), alt: (__VLS_ctx.customSidc.name), draggable: "false" }, { class: "object-contain" }));
    /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
}
else {
    var __VLS_0 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        sidc: __VLS_ctx.sidc,
        options: __VLS_ctx.options,
        modifiers: __VLS_ctx.modifiers,
        size: __VLS_ctx.size,
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            sidc: __VLS_ctx.sidc,
            options: __VLS_ctx.options,
            modifiers: __VLS_ctx.modifiers,
            size: __VLS_ctx.size,
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = {};
    var __VLS_3;
}
// @ts-ignore
[customSidc, customSidc, customSidc, sidc, options, modifiers, size,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
