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
var injects_1 = require("@/components/injects");
var utils_1 = require("@/utils");
var vue_1 = require("vue");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var baseLayersStore_1 = require("@/stores/baseLayersStore");
var scn = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var store = scn.store;
var mapSettings = (0, mapSettingsStore_1.useMapSettingsStore)();
var baseLayersStore = (0, baseLayersStore_1.useBaseLayersStore)();
var baseMapItems = (0, vue_1.computed)(function () {
    var layers = baseLayersStore.layers.map(function (l) { return ({ label: l.title, value: l.name }); });
    return __spreadArray(__spreadArray([], layers, true), [{ label: "No base map", value: "None" }], false);
});
var baseMap = (0, vue_1.computed)({
    get: function () { return store.state.mapSettings.baseMapId; },
    set: function (value) {
        store.update(function (s) {
            s.mapSettings.baseMapId = value;
            mapSettings.baseLayerName = value;
        });
        baseLayersStore.selectLayer(value);
    },
});
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_0 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "Default base map",
    items: (__VLS_ctx.baseMapItems),
    modelValue: (__VLS_ctx.baseMap),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: "Default base map",
        items: (__VLS_ctx.baseMapItems),
        modelValue: (__VLS_ctx.baseMap),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
// @ts-ignore
[baseMapItems, baseMap,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
