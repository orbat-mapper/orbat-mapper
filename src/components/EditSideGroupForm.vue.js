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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var InputGroup_vue_1 = require("./InputGroup.vue");
var PlainButton_vue_1 = require("./PlainButton.vue");
var PrimaryButton_vue_1 = require("./PrimaryButton.vue");
var InlineFormPanel_vue_1 = require("./InlineFormPanel.vue");
var helpers_1 = require("./helpers");
var injects_1 = require("@/components/injects");
var utils_1 = require("@/utils");
var SymbolFillColorSelect_vue_1 = require("@/components/SymbolFillColorSelect.vue");
var _g = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), store = _g.store, unitActions = _g.unitActions, getSideById = _g.helpers.getSideById;
var props = defineProps();
var emit = defineEmits(["close"]);
var form = (0, vue_1.ref)({ name: "Units", symbolOptions: {} });
var sideGroup = (0, vue_1.computed)(function () {
    return props.sideGroupId ? store === null || store === void 0 ? void 0 : store.state.sideGroupMap[props.sideGroupId] : undefined;
});
var side = (0, vue_1.computed)(function () { var _a; return getSideById((_a = sideGroup.value) === null || _a === void 0 ? void 0 : _a._pid); });
(0, vue_1.watch)(function () { return props.sideGroupId; }, function (sideGroupId) {
    if (sideGroupId && sideGroup.value) {
        var _a = sideGroup.value, name_1 = _a.name, _b = _a.symbolOptions, symbolOptions = _b === void 0 ? {} : _b;
        form.value = { name: name_1, symbolOptions: __assign({}, symbolOptions) };
    }
}, { immediate: true });
var onFormSubmit = function () {
    unitActions.updateSideGroup(props.sideGroupId, __assign({}, form.value));
    emit("close");
};
var focusId = (0, helpers_1.useFocusOnMount)().focusId;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = InlineFormPanel_vue_1.default || InlineFormPanel_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClose': {} }, { title: "Edit group info" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClose': {} }, { title: "Edit group info" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ close: {} },
    { onClose: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.$emit('close');
            // @ts-ignore
            [$emit,];
        } });
var __VLS_7 = {};
var __VLS_8 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onFormSubmit) }, { class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_9 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    label: "Group name",
    modelValue: (__VLS_ctx.form.name),
    id: (__VLS_ctx.focusId),
}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
        label: "Group name",
        modelValue: (__VLS_ctx.form.name),
        id: (__VLS_ctx.focusId),
    }], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_14 = SymbolFillColorSelect_vue_1.default;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    modelValue: (__VLS_ctx.form.symbolOptions.fillColor),
    defaultFillColor: ((_b = (_a = __VLS_ctx.side) === null || _a === void 0 ? void 0 : _a.symbolOptions) === null || _b === void 0 ? void 0 : _b.fillColor),
    sid: ((_c = __VLS_ctx.side) === null || _c === void 0 ? void 0 : _c.standardIdentity),
}));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.form.symbolOptions.fillColor),
        defaultFillColor: ((_e = (_d = __VLS_ctx.side) === null || _d === void 0 ? void 0 : _d.symbolOptions) === null || _e === void 0 ? void 0 : _e.fillColor),
        sid: ((_f = __VLS_ctx.side) === null || _f === void 0 ? void 0 : _f.standardIdentity),
    }], __VLS_functionalComponentArgsRest(__VLS_15), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_19 = PrimaryButton_vue_1.default || PrimaryButton_vue_1.default;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    type: "submit",
}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
        type: "submit",
    }], __VLS_functionalComponentArgsRest(__VLS_20), false));
var __VLS_24 = __VLS_22.slots.default;
// @ts-ignore
[onFormSubmit, form, form, focusId, side, side,];
var __VLS_22;
var __VLS_25 = PlainButton_vue_1.default || PlainButton_vue_1.default;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ 'onClick': {} })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_30;
var __VLS_31 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.$emit('close');
            // @ts-ignore
            [$emit,];
        } });
var __VLS_32 = __VLS_28.slots.default;
// @ts-ignore
[];
var __VLS_28;
var __VLS_29;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
