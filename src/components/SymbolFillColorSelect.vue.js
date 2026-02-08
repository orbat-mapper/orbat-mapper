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
var SymbolCodeSelect_vue_1 = require("@/components/SymbolCodeSelect.vue");
var colors_ts_1 = require("@/config/colors.ts");
var injects_ts_1 = require("@/components/injects.ts");
var props = withDefaults(defineProps(), { sid: "3" });
var emit = defineEmits(["update:modelValue"]);
var colorValue = defineModel({ default: null });
var scn = (0, vue_1.inject)(injects_ts_1.activeScenarioKey);
var colorIconItems = (0, vue_1.computed)(function () {
    var _a;
    return __spreadArray(__spreadArray([
        { code: null, text: "Default" }
    ], colors_ts_1.SYMBOL_FILL_COLORS, true), Object.values((_a = scn === null || scn === void 0 ? void 0 : scn.store.state.symbolFillColorMap) !== null && _a !== void 0 ? _a : {}), true).map(function (item) { return (__assign(__assign({}, item), { sidc: "100" + props.sid + 10 + "00" + "00" + "0000000000", symbolOptions: item.code
            ? { fillColor: item.code }
            : props.defaultFillColor
                ? { fillColor: props.defaultFillColor }
                : undefined })); });
});
var __VLS_defaultModels = {
    'modelValue': null,
};
var __VLS_modelEmit;
var __VLS_defaults = { sid: "3" };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = SymbolCodeSelect_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "Fill color",
    items: (__VLS_ctx.colorIconItems),
    modelValue: (__VLS_ctx.colorValue),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: "Fill color",
        items: (__VLS_ctx.colorIconItems),
        modelValue: (__VLS_ctx.colorValue),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_3;
// @ts-ignore
[colorIconItems, colorValue,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
