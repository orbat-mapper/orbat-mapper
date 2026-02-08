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
var klona_1 = require("klona");
var SimpleMarkdownInput = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/SimpleMarkdownInput.vue"); }); });
var props = defineProps();
var emit = defineEmits(["cancel", "update"]);
var form = (0, vue_1.ref)({
    name: "",
    shortName: "",
    description: "",
    externalUrl: "",
    title: "",
    subTitle: "",
});
var isScenarioFeatureType = function (item) {
    return "type" in item && item.type == "Feature";
};
var isScenarioEventType = function (item) {
    return "startTime" in item || ("_type" in item && item._type === "scenario");
};
var isUnitType = function (item) {
    return "sidc" in item;
};
var isUnit = (0, vue_1.computed)(function () {
    return props.item && !isUnitType(props.item);
});
var isScenarioEvent = (0, vue_1.computed)(function () {
    return props.item && isScenarioEventType(props.item);
});
(0, vue_1.watch)(function () { return props.item; }, function (item) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    if (!item)
        return;
    if (isScenarioFeatureType(item)) {
        form.value = {
            name: (_b = (_a = item === null || item === void 0 ? void 0 : item.meta) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "",
            description: (_d = (_c = item === null || item === void 0 ? void 0 : item.meta) === null || _c === void 0 ? void 0 : _c.description) !== null && _d !== void 0 ? _d : "",
            externalUrl: (_f = (_e = item === null || item === void 0 ? void 0 : item.meta) === null || _e === void 0 ? void 0 : _e.externalUrl) !== null && _f !== void 0 ? _f : "",
        };
    }
    else if (isUnitType(item)) {
        form.value = {
            name: (_g = item === null || item === void 0 ? void 0 : item.name) !== null && _g !== void 0 ? _g : "",
            shortName: (_h = item === null || item === void 0 ? void 0 : item.shortName) !== null && _h !== void 0 ? _h : "",
            description: (_j = item === null || item === void 0 ? void 0 : item.description) !== null && _j !== void 0 ? _j : "",
            externalUrl: (_k = item === null || item === void 0 ? void 0 : item.externalUrl) !== null && _k !== void 0 ? _k : "",
        };
    }
    else if (isScenarioEventType(item)) {
        form.value = {
            title: (_l = item === null || item === void 0 ? void 0 : item.title) !== null && _l !== void 0 ? _l : "",
            subTitle: (_m = item === null || item === void 0 ? void 0 : item.subTitle) !== null && _m !== void 0 ? _m : "",
            description: (_o = item === null || item === void 0 ? void 0 : item.description) !== null && _o !== void 0 ? _o : "",
            externalUrl: (_p = item === null || item === void 0 ? void 0 : item.externalUrl) !== null && _p !== void 0 ? _p : "",
        };
    }
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
if (__VLS_ctx.isScenarioEvent) {
    var __VLS_0 = InputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        label: "Title",
        modelValue: (__VLS_ctx.form.title),
        id: "title-input",
        autofocus: true,
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            label: "Title",
            modelValue: (__VLS_ctx.form.title),
            id: "title-input",
            autofocus: true,
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
}
else {
    var __VLS_5 = InputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        label: "Name",
        modelValue: (__VLS_ctx.form.name),
        id: "name-input",
        autofocus: true,
    }));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
            label: "Name",
            modelValue: (__VLS_ctx.form.name),
            id: "name-input",
            autofocus: true,
        }], __VLS_functionalComponentArgsRest(__VLS_6), false));
    if (__VLS_ctx.isUnit) {
        var __VLS_10 = InputGroup_vue_1.default;
        // @ts-ignore
        var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            label: "Short name",
            description: "Alternative name",
            modelValue: (__VLS_ctx.form.shortName),
        }));
        var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{
                label: "Short name",
                description: "Alternative name",
                modelValue: (__VLS_ctx.form.shortName),
            }], __VLS_functionalComponentArgsRest(__VLS_11), false));
    }
}
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.SimpleMarkdownInput} */
SimpleMarkdownInput;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    label: "Description",
    modelValue: (__VLS_ctx.form.description),
    description: "Use markdown syntax for formatting",
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        label: "Description",
        modelValue: (__VLS_ctx.form.description),
        description: "Use markdown syntax for formatting",
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
var __VLS_20 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    label: "External URL",
    description: "",
    modelValue: (__VLS_ctx.form.externalUrl),
}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
        label: "External URL",
        description: "",
        modelValue: (__VLS_ctx.form.externalUrl),
    }], __VLS_functionalComponentArgsRest(__VLS_21), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-end space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_25 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    type: "submit",
    small: true,
    primary: true,
}));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{
        type: "submit",
        small: true,
        primary: true,
    }], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_30 = __VLS_28.slots.default;
// @ts-ignore
[onFormSubmit, isScenarioEvent, form, form, form, form, form, isUnit,];
var __VLS_28;
var __VLS_31 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ 'onClick': {} }, { small: true })));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true })], __VLS_functionalComponentArgsRest(__VLS_32), false));
var __VLS_36;
var __VLS_37 = ({ click: {} },
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
var __VLS_38 = __VLS_34.slots.default;
// @ts-ignore
[];
var __VLS_34;
var __VLS_35;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
