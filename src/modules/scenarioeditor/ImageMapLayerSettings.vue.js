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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var geoMapLayers_1 = require("@/composables/geoMapLayers");
var core_1 = require("@vueuse/core");
var eventKeys_1 = require("@/components/eventKeys");
var utils_1 = require("@/utils");
var DescriptionItem_vue_1 = require("@/components/DescriptionItem.vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var TileMapLayerSettingsForm_vue_1 = require("@/modules/scenarioeditor/TileMapLayerSettingsForm.vue");
var props = defineProps();
var emit = defineEmits();
var bus = (0, core_1.useEventBus)(eventKeys_1.imageLayerAction);
var editMode = (0, vue_1.ref)((_a = (props.layer._isNew && !props.layer._isTemporary)) !== null && _a !== void 0 ? _a : false);
var _b = (0, geoMapLayers_1.useMapLayerInfo)(props.layer), layerTypeLabel = _b.layerTypeLabel, status = _b.status, isInitialized = _b.isInitialized;
(0, vue_1.watch)(status, function (v) {
    if (v === "initialized") {
        bus.emit({ action: "zoom", id: props.layer.id });
        bus.emit({ action: "startTransform", id: props.layer.id });
    }
});
(0, vue_1.onMounted)(function () {
    if (isInitialized.value)
        bus.emit({ action: "startTransform", id: props.layer.id });
});
(0, vue_1.onUnmounted)(function () {
    bus.emit({ action: "endTransform", id: props.layer.id });
});
(0, vue_1.watch)(function () { return props.layer.id; }, function (v) {
    bus.emit({ action: "endTransform", id: v });
    bus.emit({ action: "startTransform", id: v });
});
function updateData(formData) {
    var diff = (0, utils_1.getChangedValues)(__assign({}, formData), props.layer);
    emit("update", diff);
    editMode.value = false;
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "flex justify-end" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }));
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
(__VLS_ctx.layerTypeLabel);
if (__VLS_ctx.editMode) {
    var __VLS_0 = TileMapLayerSettingsForm_vue_1.default;
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
                [layerTypeLabel, editMode, editMode, layer, layer,];
            } });
    var __VLS_7 = ({ update: {} },
        { onUpdate: (__VLS_ctx.updateData) });
    var __VLS_3;
    var __VLS_4;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    var __VLS_8 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        label: "Image URL",
    }));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
            label: "Image URL",
        }], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = __VLS_11.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "break-all" }));
    /** @type {__VLS_StyleScopedClasses['break-all']} */ ;
    (__VLS_ctx.layer.url || "Not set");
    // @ts-ignore
    [layer, updateData,];
    var __VLS_11;
    var __VLS_14 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ label: "Attributions" }, { class: "mt-4" })));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ label: "Attributions" }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    var __VLS_19 = __VLS_17.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "break-all" }));
    /** @type {__VLS_StyleScopedClasses['break-all']} */ ;
    (__VLS_ctx.layer.attributions || "Not set");
    // @ts-ignore
    [layer,];
    var __VLS_17;
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
if (!__VLS_ctx.isInitialized) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-2 text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
if (__VLS_ctx.status === 'error') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-2 text-sm text-red-600" }));
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
}
// @ts-ignore
[isInitialized, status,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
