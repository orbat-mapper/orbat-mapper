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
var ScenarioFeatureArrowSelect_vue_1 = require("./ScenarioFeatureArrowSelect.vue");
var props = defineProps();
var emit = defineEmits();
var arrowSettings = (0, vue_1.computed)({
    get: function () {
        var _a, _b;
        var style = props.feature.style;
        return {
            "arrow-start": (_a = style["arrow-start"]) !== null && _a !== void 0 ? _a : "none",
            "arrow-end": (_b = style["arrow-end"]) !== null && _b !== void 0 ? _b : "none",
        };
    },
    set: function (val) {
        // This setter is not used since we use updateValue explicitly or v-model with computed is tricky here
    },
});
function updateValue(name, value) {
    var _a;
    emit("update", { style: (_a = {}, _a[name] = value, _a) });
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2 -mb-2 font-semibold" }));
/** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['-mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "arrow-start" }, { class: "self-center" }));
/** @type {__VLS_StyleScopedClasses['self-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-[1fr_5ch] gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[1fr_5ch]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_0 = ScenarioFeatureArrowSelect_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onUpdate:modelValue': {} }, { id: "arrow-start", modelValue: (__VLS_ctx.arrowSettings['arrow-start']) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { id: "arrow-start", modelValue: (__VLS_ctx.arrowSettings['arrow-start']) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('arrow-start', $event);
            // @ts-ignore
            [arrowSettings, updateValue,];
        } });
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "arrow-end" }, { class: "self-center" }));
/** @type {__VLS_StyleScopedClasses['self-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-[1fr_5ch] gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[1fr_5ch]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_7 = ScenarioFeatureArrowSelect_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onUpdate:modelValue': {} }, { id: "arrow-end", modelValue: (__VLS_ctx.arrowSettings['arrow-end']) })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { id: "arrow-end", modelValue: (__VLS_ctx.arrowSettings['arrow-end']) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('arrow-end', $event);
            // @ts-ignore
            [arrowSettings, updateValue,];
        } });
var __VLS_10;
var __VLS_11;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
