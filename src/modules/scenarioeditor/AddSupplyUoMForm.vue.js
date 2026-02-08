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
var forms_1 = require("@/composables/forms");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var klona_1 = require("klona");
var FormFooter_vue_1 = require("@/modules/scenarioeditor/FormFooter.vue");
var props = withDefaults(defineProps(), {
    heading: "Add new supply category",
});
var modelValue = defineModel();
var emit = defineEmits();
var uomTypes = [
    { label: "Unspecified", value: "" },
    { value: "quantity", label: "Quantity" },
    { value: "volume", label: "Volume" },
    { value: "weight", label: "Weight" },
    { value: "distance", label: "Distance" },
];
var _a = (0, forms_1.useForm)({
    name: "",
    code: "",
    description: "",
}, modelValue), form = _a.form, handleSubmit = _a.handleSubmit;
function onSubmit() {
    handleSubmit();
    emit("submit", (0, klona_1.klona)(form.value));
}
var __VLS_modelEmit;
var __VLS_defaults = {
    heading: "Add new supply category",
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign({ onSubmit: (__VLS_ctx.onSubmit) }, { onKeyup: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('cancel');
        // @ts-ignore
        [onSubmit, emit,];
    } }), { class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "text-sm font-semibold" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
(__VLS_ctx.heading);
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "mt-4 grid grid-cols-2 gap-6" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
var __VLS_0 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    autofocus: true,
    label: "Name",
    required: true,
    modelValue: (__VLS_ctx.form.name),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        autofocus: true,
        label: "Name",
        required: true,
        modelValue: (__VLS_ctx.form.name),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    label: "Abbreviation",
    modelValue: (__VLS_ctx.form.code),
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        label: "Abbreviation",
        modelValue: (__VLS_ctx.form.code),
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    label: "Type",
    modelValue: (__VLS_ctx.form.type),
    items: (__VLS_ctx.uomTypes),
}));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{
        label: "Type",
        modelValue: (__VLS_ctx.form.type),
        items: (__VLS_ctx.uomTypes),
    }], __VLS_functionalComponentArgsRest(__VLS_11), false));
var __VLS_15 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ class: "" }, { label: "Description", modelValue: (__VLS_ctx.form.description) })));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ class: "" }, { label: "Description", modelValue: (__VLS_ctx.form.description) })], __VLS_functionalComponentArgsRest(__VLS_16), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_20 = FormFooter_vue_1.default;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ 'onCancel': {} })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ 'onCancel': {} })], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25;
var __VLS_26 = ({ cancel: {} },
    { onCancel: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('cancel');
            // @ts-ignore
            [emit, heading, form, form, form, form, uomTypes,];
        } });
var __VLS_23;
var __VLS_24;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
