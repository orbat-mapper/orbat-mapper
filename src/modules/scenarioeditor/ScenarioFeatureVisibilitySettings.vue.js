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
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var ZoomSelector_vue_1 = require("@/components/ZoomSelector.vue");
var props = defineProps();
var emit = defineEmits();
var marker = (0, vue_1.computed)(function () {
    var _a, _b, _c;
    var style = props.feature.style;
    return {
        limitVisibility: (_a = style["limitVisibility"]) !== null && _a !== void 0 ? _a : false,
        minZoom: (_b = style["minZoom"]) !== null && _b !== void 0 ? _b : 0,
        maxZoom: (_c = style["maxZoom"]) !== null && _c !== void 0 ? _c : 24,
    };
});
function updateValue(name, value) {
    var _a;
    emit("update", { style: (_a = {}, _a[name] = value, _a) });
}
var range = (0, vue_1.computed)({
    get: function () { var _a, _b; return [(_a = marker.value.minZoom) !== null && _a !== void 0 ? _a : 0, (_b = marker.value.maxZoom) !== null && _b !== void 0 ? _b : 24]; },
    set: function (v) {
        emit("update", { style: { minZoom: +v[0], maxZoom: +v[1] } });
    },
});
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2 mt-2 -mb-6 font-semibold" }));
/** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['-mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "self-end" }));
/** @type {__VLS_StyleScopedClasses['self-end']} */ ;
var __VLS_0 = ToggleField_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onUpdate:modelValue': {} }, { class: "mt-4" }), { modelValue: (__VLS_ctx.marker['limitVisibility']) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { class: "mt-4" }), { modelValue: (__VLS_ctx.marker['limitVisibility']) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateValue('limitVisibility', $event);
            // @ts-ignore
            [marker, updateValue,];
        } });
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.marker.limitVisibility) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    var __VLS_7 = ZoomSelector_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ modelValue: (__VLS_ctx.range) }, { class: "mt-4 flex-auto" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.range) }, { class: "mt-4 flex-auto" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
}
// @ts-ignore
[marker, range,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
