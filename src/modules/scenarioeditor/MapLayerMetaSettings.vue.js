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
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var utils_1 = require("@/utils");
var DescriptionItem_vue_1 = require("@/components/DescriptionItem.vue");
var geoMapLayers_1 = require("@/composables/geoMapLayers");
var MapLayerMetaSettingsForm_vue_1 = require("@/modules/scenarioeditor/MapLayerMetaSettingsForm.vue");
var props = defineProps();
var emit = defineEmits(["update", "action"]);
var _a = (0, geoMapLayers_1.useMapLayerInfo)(props.layer), status = _a.status, isInitialized = _a.isInitialized, layerTypeLabel = _a.layerTypeLabel;
(0, vue_1.watch)(status, function (v) {
    if (v === "initialized") {
        emit("action", "zoom");
    }
});
var editMode = (0, vue_1.ref)(false);
(0, vue_1.watch)(function () { return props.layer; }, function (v) {
    var _a;
    editMode.value = (_a = props.layer._isNew) !== null && _a !== void 0 ? _a : false;
}, { immediate: true });
function updateData(formData) {
    var diff = (0, utils_1.getChangedValues)(__assign({}, formData), props.layer);
    emit("update", diff);
    editMode.value = false;
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "mt-2" }));
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
if (__VLS_ctx.editMode) {
    var __VLS_0 = MapLayerMetaSettingsForm_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onCancel': {} }, { 'onUpdate': {} }), { key: (__VLS_ctx.layer.id), layer: (__VLS_ctx.layer) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onUpdate': {} }), { key: (__VLS_ctx.layer.id), layer: (__VLS_ctx.layer) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ cancel: {} },
        { onCancel: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.editMode))
                    return;
                __VLS_ctx.editMode = false;
                // @ts-ignore
                [editMode, editMode, layer, layer,];
            } });
    var __VLS_7 = ({ update: {} },
        { onUpdate: (__VLS_ctx.updateData) });
    var __VLS_3;
    var __VLS_4;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    var __VLS_8 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        label: "Description",
    }));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
            label: "Description",
        }], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = __VLS_11.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "whitespace-pre-wrap" }));
    /** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
    (__VLS_ctx.layer.description || "Not set");
    // @ts-ignore
    [layer, updateData,];
    var __VLS_11;
    if (__VLS_ctx.layer.externalUrl) {
        var __VLS_14 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
        // @ts-ignore
        var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            label: "External URL",
            ddClass: "truncate",
        }));
        var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{
                label: "External URL",
                ddClass: "truncate",
            }], __VLS_functionalComponentArgsRest(__VLS_15), false));
        var __VLS_19 = __VLS_17.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign(__assign({ target: "_blank" }, { class: "underline" }), { href: (__VLS_ctx.layer.externalUrl) }));
        /** @type {__VLS_StyleScopedClasses['underline']} */ ;
        (__VLS_ctx.layer.externalUrl);
        // @ts-ignore
        [layer, layer, layer,];
        var __VLS_17;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "mt-4 flex justify-end space-x-2 pb-1" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
    var __VLS_20 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ 'onClick': {} }, { small: true, type: "button" })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true, type: "button" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    var __VLS_25 = void 0;
    var __VLS_26 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.editMode))
                    return;
                __VLS_ctx.editMode = true;
                // @ts-ignore
                [editMode,];
            } });
    var __VLS_27 = __VLS_23.slots.default;
    // @ts-ignore
    [];
    var __VLS_23;
    var __VLS_24;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
