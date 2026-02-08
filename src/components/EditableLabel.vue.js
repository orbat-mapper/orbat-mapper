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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@vueuse/core");
var vue_1 = require("vue");
var props = withDefaults(defineProps(), { textClass: "text-base font-semibold leading-6 text-foreground dark:text-foreground" });
var value = defineModel({ required: true });
var emit = defineEmits(["update-value"]);
var _a = (0, core_1.useTextareaAutosize)({ input: value }), textarea = _a.textarea, input = _a.input;
var spellcheck = (0, vue_1.ref)(false);
function onKey(e) {
    e.target.blur();
}
function onFocus() {
    spellcheck.value = true;
}
function onBlur(e) {
    var _a;
    var target = e.target;
    emit("update-value", (_a = target === null || target === void 0 ? void 0 : target.value) !== null && _a !== void 0 ? _a : value.value);
    spellcheck.value = false;
}
var __VLS_modelEmit;
var __VLS_defaults = { textClass: "text-base font-semibold leading-6 text-foreground dark:text-foreground" };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea)(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ onKeyup: (__VLS_ctx.onKey) }, { onKeydown: function () { } }), { onKeydown: (__VLS_ctx.onKey) }), { onFocus: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.onFocus();
        // @ts-ignore
        [onKey, onKey, onFocus,];
    } }), { onBlur: (__VLS_ctx.onBlur) }), { ref: "textarea", type: "text", value: (__VLS_ctx.input), spellcheck: (__VLS_ctx.spellcheck) }), { class: "ring-ring -mx-3 w-full resize-none rounded-md border-0 bg-transparent ring-0 ring-inset hover:ring-1 focus:ring-2 focus:ring-inset" }), { class: (__VLS_ctx.textClass) }));
/** @type {__VLS_StyleScopedClasses['ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['-mx-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['resize-none']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-0']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-inset']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:ring-1']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-inset']} */ ;
// @ts-ignore
[onBlur, input, spellcheck, textClass,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
