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
var injects_1 = require("@/components/injects");
var utils_1 = require("@/utils");
var vue_1 = require("vue");
var klona_1 = require("klona");
var FormFooter_vue_1 = require("@/modules/scenarioeditor/FormFooter.vue");
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var toeStore_1 = require("@/stores/toeStore");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var props = withDefaults(defineProps(), {});
var emit = defineEmits();
var modelValue = defineModel();
(0, vue_1.watch)(function () { return props.itemData; }, function () {
    modelValue.value = (0, klona_1.klona)(props.itemData);
}, { immediate: true });
var time = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).time;
var editStore = (0, toeStore_1.useSuppliesEditStore)();
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
var formattedTime = (0, vue_1.computed)(function () {
    return fmt.scenarioFormatter.format(+time.scenarioTime.value);
});
var _a = (0, forms_1.useForm)({
    id: "",
    count: 1,
}, modelValue), form = _a.form, handleSubmit = _a.handleSubmit;
function resetForm() {
    modelValue.value = (0, klona_1.klona)(props.itemData);
}
function onSubmit(e) {
    // prevent double form submission with ctrl/meta+enter
    if (e instanceof KeyboardEvent && e.target instanceof HTMLInputElement) {
        return;
    }
    if (editStore.isOnHandMode) {
        if (editStore.isDiffMode) {
            emit("diffOnHand", form.value.id, {
                id: form.value.id,
                onHand: editStore.diffValue,
                count: -1,
            });
        }
        else {
            emit("updateOnHand", form.value.id, {
                id: form.value.id,
                onHand: form.value.onHand,
                count: -1,
            });
        }
    }
    else {
        emit("updateCount", form.value.id, { id: form.value.id, count: form.value.count });
    }
}
(0, vue_1.watch)([function () { return editStore.isOnHandMode; }, function () { return editStore.isDiffMode; }], function () {
    resetForm();
});
var __VLS_modelEmit;
var __VLS_defaults = {};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign(__assign({ onSubmit: (__VLS_ctx.onSubmit) }, { onKeyup: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('cancel');
        // @ts-ignore
        [onSubmit, emit,];
    } }), { onKeyup: (__VLS_ctx.onSubmit) }), { onKeyup: (__VLS_ctx.onSubmit) }));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "text-sm font-semibold" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
(__VLS_ctx.itemData.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
if (__VLS_ctx.itemData.supplyClass) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }));
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    (__VLS_ctx.itemData.supplyClass);
}
if (__VLS_ctx.itemData.uom) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }));
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    (__VLS_ctx.itemData.uom);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_0 = InputCheckbox_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.editStore.isOnHandMode),
    label: ("Edit supplies at ".concat(__VLS_ctx.formattedTime)),
    description: "",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.editStore.isOnHandMode),
        label: ("Edit supplies at ".concat(__VLS_ctx.formattedTime)),
        description: "",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "mt-4 grid grid-cols-2 items-start gap-6" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
var __VLS_5 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    label: "Initial value",
    type: "number",
    disabled: (__VLS_ctx.editStore.isOnHandMode),
    modelValue: (__VLS_ctx.form.count),
    autofocus: (!__VLS_ctx.editStore.isOnHandMode),
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        label: "Initial value",
        type: "number",
        disabled: (__VLS_ctx.editStore.isOnHandMode),
        modelValue: (__VLS_ctx.form.count),
        autofocus: (!__VLS_ctx.editStore.isOnHandMode),
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    label: "Available / On hand",
    type: "number",
    disabled: (!__VLS_ctx.editStore.isOnHandMode || __VLS_ctx.editStore.isDiffMode),
    modelValue: (__VLS_ctx.form.onHand),
    min: "0",
    autofocus: (__VLS_ctx.editStore.isOnHandMode && !__VLS_ctx.editStore.isDiffMode),
}));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{
        label: "Available / On hand",
        type: "number",
        disabled: (!__VLS_ctx.editStore.isOnHandMode || __VLS_ctx.editStore.isDiffMode),
        modelValue: (__VLS_ctx.form.onHand),
        min: "0",
        autofocus: (__VLS_ctx.editStore.isOnHandMode && !__VLS_ctx.editStore.isDiffMode),
    }], __VLS_functionalComponentArgsRest(__VLS_11), false));
if (__VLS_ctx.editStore.isOnHandMode) {
    var __VLS_15 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        label: "Add/subtract mode",
        description: "",
        modelValue: (__VLS_ctx.editStore.isDiffMode),
    }));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
            label: "Add/subtract mode",
            description: "",
            modelValue: (__VLS_ctx.editStore.isDiffMode),
        }], __VLS_functionalComponentArgsRest(__VLS_16), false));
    if (__VLS_ctx.editStore.isDiffMode) {
        var __VLS_20 = InputGroup_vue_1.default;
        // @ts-ignore
        var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            label: "Add/subtract",
            type: "number",
            autofocus: (__VLS_ctx.editStore.isDiffMode),
            modelValue: (__VLS_ctx.editStore.diffValue),
        }));
        var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
                label: "Add/subtract",
                type: "number",
                autofocus: (__VLS_ctx.editStore.isDiffMode),
                modelValue: (__VLS_ctx.editStore.diffValue),
            }], __VLS_functionalComponentArgsRest(__VLS_21), false));
    }
}
var __VLS_25 = FormFooter_vue_1.default;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ 'onCancel': {} }, { showNextToggle: true })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ 'onCancel': {} }, { showNextToggle: true })], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_30;
var __VLS_31 = ({ cancel: {} },
    { onCancel: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('cancel');
            // @ts-ignore
            [onSubmit, onSubmit, emit, itemData, itemData, itemData, itemData, itemData, editStore, editStore, editStore, editStore, editStore, editStore, editStore, editStore, editStore, editStore, editStore, editStore, formattedTime, form, form,];
        } });
var __VLS_28;
var __VLS_29;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
