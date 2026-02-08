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
var core_1 = require("@vueuse/core");
var TextAreaGroup_vue_1 = require("@/components/TextAreaGroup.vue");
var proj_1 = require("ol/proj");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var emit = defineEmits(["update", "action", "cancel"]);
var _a = (0, core_1.useToggle)(false), showAdvanced = _a[0], toggleAdvanced = _a[1];
var advancedSettings = (0, vue_1.ref)("");
var focusId = (0, helpers_1.useFocusOnMount)().focusId;
var formData = (0, vue_1.ref)({
    url: props.layer.url,
    attributions: props.layer.attributions,
    _isNew: false,
});
(0, vue_1.watch)(function () { return props.layer; }, function (v) {
    formData.value = { url: v.url, attributions: v.attributions, _isNew: false };
}, { immediate: true });
var status = (0, vue_1.computed)(function () { return props.layer._status; });
var urlLabel = (0, vue_1.computed)(function () {
    if (props.layer.type === "TileJSONLayer") {
        return "TileJSON URL";
    }
    else if (props.layer.type === "ImageLayer") {
        return "Image URL";
    }
    else {
        return "XYZ tile URL template";
    }
});
function updateData() {
    if (advancedSettings.value) {
        loadAdvanced();
        return;
    }
    var diff = (0, utils_1.getChangedValues)(__assign({}, formData.value), props.layer);
    if (diff.attributions) {
        diff.attributions = (0, utils_1.sanitizeHTML)(diff.attributions);
    }
    emit("update", diff);
}
//check if string is a valid JSON
function isValidJSONString(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}
function loadAdvanced() {
    var s = advancedSettings.value;
    var isValidData = s.includes("imageCenter") && s.includes("imageScale") && s.includes("imageRotate");
    if (isValidData) {
        var rawData = isValidJSONString(s)
            ? JSON.parse(s)
            : isValidJSONString("{".concat(s, "}"))
                ? JSON.parse("{".concat(s, "}"))
                : null;
        if (rawData) {
            var imageCenter = rawData.imageCenter, imageScale = rawData.imageScale, imageRotate = rawData.imageRotate, _a = rawData.url, url = _a === void 0 ? "" : _a;
            var data = {
                imageCenter: (0, proj_1.toLonLat)(imageCenter),
                imageRotate: imageRotate,
                imageScale: imageScale,
            };
            if (url) {
                data.url = url.replace(" ", "");
            }
            emit("update", data);
        }
    }
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.updateData) }, { class: "p-1" }));
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
if (!__VLS_ctx.showAdvanced) {
    var __VLS_0 = InputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ id: (__VLS_ctx.focusId), label: (__VLS_ctx.urlLabel), type: "text" }, { class: "" }), { modelValue: (__VLS_ctx.formData.url), required: true })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ id: (__VLS_ctx.focusId), label: (__VLS_ctx.urlLabel), type: "text" }, { class: "" }), { modelValue: (__VLS_ctx.formData.url), required: true })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    if (__VLS_ctx.layer.type === 'XYZLayer' || __VLS_ctx.layer.type === 'ImageLayer') {
        var __VLS_5 = InputGroup_vue_1.default;
        // @ts-ignore
        var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign(__assign({ label: "Attributions", type: "text" }, { class: "" }), { modelValue: (__VLS_ctx.formData.attributions) })));
        var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign(__assign({ label: "Attributions", type: "text" }, { class: "" }), { modelValue: (__VLS_ctx.formData.attributions) })], __VLS_functionalComponentArgsRest(__VLS_6), false));
        /** @type {__VLS_StyleScopedClasses['']} */ ;
    }
    if (__VLS_ctx.layer.type === 'ImageLayer') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "flex justify-end" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        var __VLS_10 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
        button_1.Button;
        // @ts-ignore
        var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10(__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })));
        var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_11), false));
        var __VLS_15 = void 0;
        var __VLS_16 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(!__VLS_ctx.showAdvanced))
                        return;
                    if (!(__VLS_ctx.layer.type === 'ImageLayer'))
                        return;
                    __VLS_ctx.toggleAdvanced();
                    // @ts-ignore
                    [updateData, showAdvanced, focusId, urlLabel, formData, formData, layer, layer, layer, toggleAdvanced,];
                } });
        var __VLS_17 = __VLS_13.slots.default;
        // @ts-ignore
        [];
        var __VLS_13;
        var __VLS_14;
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    var __VLS_18 = TextAreaGroup_vue_1.default;
    // @ts-ignore
    var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        label: "Map-georeferencer settings",
        modelValue: (__VLS_ctx.advancedSettings),
        description: "Paste map settings from Map-georeferencer here.",
    }));
    var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{
            label: "Map-georeferencer settings",
            modelValue: (__VLS_ctx.advancedSettings),
            description: "Paste map settings from Map-georeferencer here.",
        }], __VLS_functionalComponentArgsRest(__VLS_19), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose prose-sm dark:prose-invert mt-4" }));
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        target: "_blank",
        href: "http://viglino.github.io/Map-georeferencer/",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "rounded border border-gray-600 bg-blue-100 p-1" }));
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blue-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "mt-4 flex justify-end space-x-2" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_23 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    small: true,
    primary: true,
    type: "submit",
}));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{
        small: true,
        primary: true,
        type: "submit",
    }], __VLS_functionalComponentArgsRest(__VLS_24), false));
var __VLS_28 = __VLS_26.slots.default;
// @ts-ignore
[advancedSettings,];
var __VLS_26;
var __VLS_29 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29(__assign({ 'onClick': {} }, { small: true, type: "button" })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true, type: "button" })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_34;
var __VLS_35 = ({ click: {} },
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
var __VLS_36 = __VLS_32.slots.default;
// @ts-ignore
[];
var __VLS_32;
var __VLS_33;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
