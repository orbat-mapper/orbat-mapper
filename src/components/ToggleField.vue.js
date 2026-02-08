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
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var props = defineProps();
var enabled = defineModel({ default: true });
var id = (0, vue_1.useId)();
var __VLS_defaultModels = {
    'modelValue': true,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Switch} */
switch_1.Switch;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.enabled),
    id: (__VLS_ctx.id),
    disabled: __VLS_ctx.disabled,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.enabled),
        id: (__VLS_ctx.id),
        disabled: __VLS_ctx.disabled,
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
if (__VLS_ctx.$slots.default) {
    var __VLS_5 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        for: (__VLS_ctx.id),
        disabled: __VLS_ctx.disabled,
    }));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
            for: (__VLS_ctx.id),
            disabled: __VLS_ctx.disabled,
        }], __VLS_functionalComponentArgsRest(__VLS_6), false));
    var __VLS_10 = __VLS_8.slots.default;
    var __VLS_11 = {};
    // @ts-ignore
    [enabled, id, id, disabled, disabled, $slots,];
    var __VLS_8;
}
// @ts-ignore
var __VLS_12 = __VLS_11;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
