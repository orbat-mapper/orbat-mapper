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
var injects_1 = require("@/components/injects");
var utils_1 = require("@/utils");
var vue_1 = require("vue");
var klona_1 = require("klona");
var FormFooter_vue_1 = require("@/modules/scenarioeditor/FormFooter.vue");
var props = withDefaults(defineProps(), {
    heading: "Add item",
});
var store = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store;
var modelValue = defineModel();
var emit = defineEmits();
var usedItems = (0, vue_1.computed)(function () { var _a; return ((_a = props.usedItems) !== null && _a !== void 0 ? _a : []).map(function (i) { return i.id; }); });
var itemCategories = (0, vue_1.computed)(function () {
    var c = props.mode === "equipment" ? store.state.equipmentMap : store.state.personnelMap;
    var sc = Object.values(c)
        .filter(function (v) { return !usedItems.value.includes(v.id); })
        .map(function (ic) {
        return {
            label: ic.name,
            value: ic.id,
        };
    });
    return (0, utils_1.sortBy)(sc, "label");
});
var _a = (0, forms_1.useForm)({
    id: "",
    count: 1,
}, modelValue), form = _a.form, handleSubmit = _a.handleSubmit;
function onSubmit() {
    handleSubmit();
    emit("submit", (0, klona_1.klona)(form.value));
}
(0, vue_1.watch)(itemCategories, function () {
    if (itemCategories.value.length) {
        form.value.id = itemCategories.value[0].value;
    }
}, { immediate: true });
var __VLS_modelEmit;
var __VLS_defaults = {
    heading: "Add item",
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
if (__VLS_ctx.itemCategories.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "mt-4 grid grid-cols-2 gap-6" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
    var __VLS_0 = SimpleSelect_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        label: "Supply category",
        modelValue: (__VLS_ctx.form.id),
        items: (__VLS_ctx.itemCategories),
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            label: "Supply category",
            modelValue: (__VLS_ctx.form.id),
            items: (__VLS_ctx.itemCategories),
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = InputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        label: "Initial value",
        type: "number",
        modelValue: (__VLS_ctx.form.count),
    }));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
            label: "Initial value",
            type: "number",
            modelValue: (__VLS_ctx.form.count),
        }], __VLS_functionalComponentArgsRest(__VLS_6), false));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "mt-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
var __VLS_10 = FormFooter_vue_1.default;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10(__assign({ 'onCancel': {} }, { submitLabel: "Add" })));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign({ 'onCancel': {} }, { submitLabel: "Add" })], __VLS_functionalComponentArgsRest(__VLS_11), false));
var __VLS_15;
var __VLS_16 = ({ cancel: {} },
    { onCancel: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('cancel');
            // @ts-ignore
            [emit, heading, itemCategories, itemCategories, form, form,];
        } });
var __VLS_13;
var __VLS_14;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
