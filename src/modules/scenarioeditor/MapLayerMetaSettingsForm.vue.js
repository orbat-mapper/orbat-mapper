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
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var utils_1 = require("@/utils");
var helpers_1 = require("@/components/helpers");
var TextAreaGroup_vue_1 = require("@/components/TextAreaGroup.vue");
var props = defineProps();
var emit = defineEmits(["update", "action", "cancel"]);
var focusId = (0, helpers_1.useFocusOnMount)().focusId;
var formData = (0, vue_1.ref)({
    description: props.layer.description,
    externalUrl: props.layer.externalUrl,
});
(0, vue_1.watch)(function () { return props.layer; }, function (v) {
    formData.value = { externalUrl: v.externalUrl, description: v.description };
}, { immediate: true });
var status = (0, vue_1.computed)(function () { return props.layer._status; });
function updateData() {
    var diff = (0, utils_1.getChangedValues)(__assign({}, formData.value), props.layer);
    emit("update", diff);
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.updateData) }, { class: "p-1" }));
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_0 = TextAreaGroup_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    id: (__VLS_ctx.focusId),
    label: "Description",
    modelValue: (__VLS_ctx.formData.description),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        id: (__VLS_ctx.focusId),
        label: "Description",
        modelValue: (__VLS_ctx.formData.description),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign(__assign({ id: (__VLS_ctx.focusId), label: "External URL", type: "text" }, { class: "" }), { modelValue: (__VLS_ctx.formData.externalUrl) })));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign(__assign({ id: (__VLS_ctx.focusId), label: "External URL", type: "text" }, { class: "" }), { modelValue: (__VLS_ctx.formData.externalUrl) })], __VLS_functionalComponentArgsRest(__VLS_6), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "mt-4 flex justify-end space-x-2" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_10 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    small: true,
    primary: true,
    type: "submit",
}));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{
        small: true,
        primary: true,
        type: "submit",
    }], __VLS_functionalComponentArgsRest(__VLS_11), false));
var __VLS_15 = __VLS_13.slots.default;
// @ts-ignore
[updateData, focusId, focusId, formData, formData,];
var __VLS_13;
var __VLS_16 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign({ 'onClick': {} }, { small: true, type: "button" })));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true, type: "button" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
var __VLS_21;
var __VLS_22 = ({ click: {} },
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
var __VLS_23 = __VLS_19.slots.default;
// @ts-ignore
[];
var __VLS_19;
var __VLS_20;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
