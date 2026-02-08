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
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var InputGroupTemplate_vue_1 = require("@/components/InputGroupTemplate.vue");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var __VLS_props = defineProps();
var settings = defineModel({ required: true });
var attributes = [
    "id",
    "name",
    "sidc",
    "shortName",
    "description",
    "url",
    "location",
    { label: "parent ID", field: "_pid" },
    { label: "side ID", field: "sideId" },
    { label: "side name", field: "sideName" },
];
var locationFormatOptions = [
    { label: "JSON array [lon, lat]", value: "json" },
    { label: "Lat, Lon", value: "latlon" },
    { label: "Lon, Lat", value: "lonlat" },
    { label: "MGRS", value: "mgrs" },
    { label: "Degrees Minutes Seconds", value: "dms" },
    { label: "Decimal Degrees", value: "dd" },
];
var separatorOptions = [
    { label: "Comma (,)", value: "," },
    { label: "Tab (TSV)", value: "\t" },
    { label: "Semicolon (;)", value: ";" },
];
function mapFieldLabel(items) {
    return items.map(function (i) {
        return typeof i === "string" ? { label: i, field: i } : { label: i.label, field: i.field };
    });
}
var mappedAttributes = mapFieldLabel(attributes);
settings.value.columns = __spreadArray([], mappedAttributes, true);
if (!settings.value.locationFormat) {
    settings.value.locationFormat = "json";
}
if (!settings.value.separator) {
    settings.value.separator = ",";
}
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_0 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.settings.separator),
    items: (__VLS_ctx.separatorOptions),
    label: "Separator",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.separator),
        items: (__VLS_ctx.separatorOptions),
        label: "Separator",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    label: "Unit attributes to export",
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        label: "Unit attributes to export",
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10 = __VLS_8.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 grid grid-cols-4 gap-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.mappedAttributes)); _i < _a.length; _i++) {
    var v = _a[_i][0];
    var __VLS_11 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        key: (v.field),
        label: (v.label),
        value: (v),
        modelValue: (__VLS_ctx.settings.columns),
    }));
    var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{
            key: (v.field),
            label: (v.label),
            value: (v),
            modelValue: (__VLS_ctx.settings.columns),
        }], __VLS_functionalComponentArgsRest(__VLS_12), false));
    // @ts-ignore
    [settings, settings, separatorOptions, mappedAttributes,];
}
// @ts-ignore
[];
var __VLS_8;
var __VLS_16 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.settings.locationFormat),
    items: (__VLS_ctx.locationFormatOptions),
    label: "Location format",
}));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.locationFormat),
        items: (__VLS_ctx.locationFormatOptions),
        label: "Location format",
    }], __VLS_functionalComponentArgsRest(__VLS_17), false));
// @ts-ignore
[settings, locationFormatOptions,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
