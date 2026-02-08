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
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var vue_1 = require("vue");
var klona_1 = require("klona");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var emit = defineEmits(["cancel", "update"]);
var form = (0, vue_1.ref)({
    url: "",
    caption: "",
    credits: "",
    creditsUrl: "",
});
(0, vue_1.watch)(function () { return props.media; }, function (media) {
    var _a, _b, _c, _d;
    form.value = {
        url: (_a = media === null || media === void 0 ? void 0 : media.url) !== null && _a !== void 0 ? _a : "",
        caption: (_b = media === null || media === void 0 ? void 0 : media.caption) !== null && _b !== void 0 ? _b : "",
        credits: (_c = media === null || media === void 0 ? void 0 : media.credits) !== null && _c !== void 0 ? _c : "",
        creditsUrl: (_d = media === null || media === void 0 ? void 0 : media.creditsUrl) !== null && _d !== void 0 ? _d : "",
    };
}, { immediate: true });
var onFormSubmit = function () {
    emit("update", (0, klona_1.klona)(form.value));
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onFormSubmit) }, { class: "mt-0 mb-6 space-y-4" }));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_0 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "Image URL",
    modelValue: (__VLS_ctx.form.url),
    autofocus: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: "Image URL",
        modelValue: (__VLS_ctx.form.url),
        autofocus: true,
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    label: "Caption",
    modelValue: (__VLS_ctx.form.caption),
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        label: "Caption",
        modelValue: (__VLS_ctx.form.caption),
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    label: "Credits",
    modelValue: (__VLS_ctx.form.credits),
}));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{
        label: "Credits",
        modelValue: (__VLS_ctx.form.credits),
    }], __VLS_functionalComponentArgsRest(__VLS_11), false));
var __VLS_15 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    label: "Credits URL",
    modelValue: (__VLS_ctx.form.creditsUrl),
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        label: "Credits URL",
        modelValue: (__VLS_ctx.form.creditsUrl),
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-end space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    type: "submit",
    size: "sm",
}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
        type: "submit",
        size: "sm",
    }], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25 = __VLS_23.slots.default;
// @ts-ignore
[onFormSubmit, form, form, form, form,];
var __VLS_23;
var __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_27), false));
var __VLS_31;
var __VLS_32 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('cancel');
            // @ts-ignore
            [emit,];
        } });
var __VLS_33 = __VLS_29.slots.default;
// @ts-ignore
[];
var __VLS_29;
var __VLS_30;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
