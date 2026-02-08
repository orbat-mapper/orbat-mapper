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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var props = withDefaults(defineProps(), { autoFocus: true });
var emit = defineEmits();
var aEle = (0, vue_1.ref)(null);
var bEle = (0, vue_1.ref)(null);
var value = (0, vue_1.ref)(((_a = props.property) === null || _a === void 0 ? void 0 : _a.value) || "");
var uom = (0, vue_1.ref)(((_b = props.property) === null || _b === void 0 ? void 0 : _b.uom) || "km/h");
function onKey(e) {
    e.target.blur();
}
function onBlur(e) {
    if (e.relatedTarget === aEle.value || e.relatedTarget === bEle.value)
        return;
    emit("update-value", { value: value.value, uom: uom.value });
}
(0, vue_1.onMounted)(function () {
    var _a;
    if (props.autoFocus) {
        (_a = aEle.value) === null || _a === void 0 ? void 0 : _a.focus();
    }
});
var __VLS_defaults = { autoFocus: true };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative rounded-md shadow-xs" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xs']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign(__assign(__assign(__assign({ onKeyup: (__VLS_ctx.onKey) }, { onKeydown: (__VLS_ctx.onKey) }), { onBlur: (__VLS_ctx.onBlur) }), { ref: "aEle", type: "text" }), { class: "border-input text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 block w-full rounded-md bg-transparent py-1.5 pr-16 outline-none focus-visible:ring-[3px] sm:text-sm sm:leading-6" }), { value: (__VLS_ctx.value) }));
/** @type {__VLS_StyleScopedClasses['border-input']} */ ;
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:border-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-ring/50']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-16']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-[3px]']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:leading-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "absolute inset-y-0 right-0 flex items-center" }));
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)(__assign(__assign({ onBlur: (__VLS_ctx.onBlur) }, { ref: "bEle", name: "uom", value: (__VLS_ctx.uom) }), { class: "text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-full rounded-md border-0 bg-transparent py-0 pr-7 pl-2 focus-visible:ring-[3px] sm:text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:border-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-ring/50']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-7']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-[3px]']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
// @ts-ignore
[onKey, onKey, onBlur, onBlur, value, uom,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
