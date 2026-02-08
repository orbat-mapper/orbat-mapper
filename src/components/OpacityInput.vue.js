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
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var core_1 = require("@vueuse/core");
var props = withDefaults(defineProps(), {
    visible: false,
});
var opacity = defineModel({ default: 1 });
var _a = (0, core_1.useToggle)(props.visible), showRange = _a[0], toggleRange = _a[1];
var opacityAsPercent = (0, vue_1.computed)(function () { return (opacity.value * 100).toFixed(0); });
var __VLS_defaultModels = {
    'modelValue': 1,
};
var __VLS_modelEmit;
var __VLS_defaults = {
    visible: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
if (__VLS_ctx.showRange) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign({ type: "range", min: "0", max: "1", step: "0.01" }, { class: "w-24" }));
    (__VLS_ctx.opacity);
    /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleRange();
        // @ts-ignore
        [showRange, opacity, toggleRange,];
    } }, { class: "text-muted-foreground flex h-6 items-center" }), { title: "Opacity" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.OpacityIcon} */
vue_mdi_1.IconOpacity;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "scale-110 transform" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "scale-110 transform" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['scale-110']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground ml-1 w-7 text-right text-xs" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-7']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
(__VLS_ctx.opacityAsPercent);
// @ts-ignore
[opacityAsPercent,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
