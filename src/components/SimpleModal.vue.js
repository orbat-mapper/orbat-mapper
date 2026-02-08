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
var uiStore_1 = require("@/stores/uiStore");
var utils_1 = require("@/lib/utils");
var props = withDefaults(defineProps(), {
    maxWidth: "sm:max-w-xl",
});
var open = defineModel({ default: false });
var emit = defineEmits(["cancel"]);
var uiStore = (0, uiStore_1.useUiStore)();
(0, vue_1.watch)(open, function (v) {
    uiStore.modalOpen = v;
    if (!v)
        emit("cancel");
}, { immediate: true });
var __VLS_defaultModels = {
    'modelValue': false,
};
var __VLS_modelEmit;
var __VLS_defaults = {
    maxWidth: "sm:max-w-xl",
};
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
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onClose': {} }, { class: (__VLS_ctx.cn('max-w-[calc(100%-1rem)] rounded', props.maxWidth)) })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onClose': {} }, { class: (__VLS_ctx.cn('max-w-[calc(100%-1rem)] rounded', props.maxWidth)) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ close: {} },
    { onClose: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.open = false;
            // @ts-ignore
            [open, open, utils_1.cn,];
        } });
var __VLS_14 = __VLS_10.slots.default;
if (__VLS_ctx.dialogTitle || __VLS_ctx.$slots.title) {
    var __VLS_15 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DialogHeader | typeof __VLS_components.DialogHeader} */
    dialog_1.DialogHeader;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_16), false));
    var __VLS_20 = __VLS_18.slots.default;
    var __VLS_21 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DialogTitle | typeof __VLS_components.DialogTitle} */
    dialog_1.DialogTitle;
    // @ts-ignore
    var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({}));
    var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_22), false));
    var __VLS_26 = __VLS_24.slots.default;
    var __VLS_27 = {};
    (__VLS_ctx.dialogTitle);
    // @ts-ignore
    [dialogTitle, dialogTitle, $slots,];
    var __VLS_24;
    // @ts-ignore
    [];
    var __VLS_18;
}
var __VLS_29 = {};
// @ts-ignore
[];
var __VLS_10;
var __VLS_11;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_28 = __VLS_27, __VLS_30 = __VLS_29;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
