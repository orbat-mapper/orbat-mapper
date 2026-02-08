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
var select_1 = require("@/components/ui/select");
var utils_1 = require("@/utils");
var injects_ts_1 = require("@/components/injects.ts");
var featureLayerUtils_ts_1 = require("@/modules/scenarioeditor/featureLayerUtils.ts");
var props = withDefaults(defineProps(), { layerMode: false });
var layers = (0, utils_1.injectStrict)(injects_ts_1.activeScenarioKey).geo.layers;
var selectedValue = defineModel({
    required: false,
});
var __VLS_modelEmit;
var __VLS_defaults = { layerMode: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
select_1.Select;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.selectedValue),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.selectedValue),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
select_1.SelectTrigger;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "w-full" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.SelectValue} */
select_1.SelectValue;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    placeholder: (__VLS_ctx.layerMode ? 'Select layer' : 'Select feature'),
}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
        placeholder: (__VLS_ctx.layerMode ? 'Select layer' : 'Select feature'),
    }], __VLS_functionalComponentArgsRest(__VLS_14), false));
// @ts-ignore
[selectedValue, layerMode,];
var __VLS_10;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
select_1.SelectContent;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: "border-border" })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: "border-border" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
var __VLS_23 = __VLS_21.slots.default;
if (props.layerMode) {
    var __VLS_24 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectGroup | typeof __VLS_components.SelectGroup} */
    select_1.SelectGroup;
    // @ts-ignore
    var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
    var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_25), false));
    var __VLS_29 = __VLS_27.slots.default;
    var __VLS_30 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectLabel | typeof __VLS_components.SelectLabel} */
    select_1.SelectLabel;
    // @ts-ignore
    var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
    var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
    var __VLS_35 = __VLS_33.slots.default;
    // @ts-ignore
    [];
    var __VLS_33;
    for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.layers)); _i < _a.length; _i++) {
        var layer = _a[_i][0];
        var __VLS_36 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
            key: (layer.id),
            value: (layer.id),
        }));
        var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
                key: (layer.id),
                value: (layer.id),
            }], __VLS_functionalComponentArgsRest(__VLS_37), false));
        var __VLS_41 = __VLS_39.slots.default;
        (layer.name);
        // @ts-ignore
        [layers,];
        var __VLS_39;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_27;
}
else {
    for (var _b = 0, _c = __VLS_vFor((__VLS_ctx.layers)); _b < _c.length; _b++) {
        var layer = _c[_b][0];
        var __VLS_42 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectGroup | typeof __VLS_components.SelectGroup} */
        select_1.SelectGroup;
        // @ts-ignore
        var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            key: (layer.id),
        }));
        var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{
                key: (layer.id),
            }], __VLS_functionalComponentArgsRest(__VLS_43), false));
        var __VLS_47 = __VLS_45.slots.default;
        var __VLS_48 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectLabel | typeof __VLS_components.SelectLabel} */
        select_1.SelectLabel;
        // @ts-ignore
        var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({}));
        var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_49), false));
        var __VLS_53 = __VLS_51.slots.default;
        (layer.name);
        // @ts-ignore
        [layers,];
        var __VLS_51;
        for (var _d = 0, _e = __VLS_vFor((layer.features)); _d < _e.length; _d++) {
            var feature = _e[_d][0];
            var __VLS_54 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
            select_1.SelectItem;
            // @ts-ignore
            var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
                key: (feature.id),
                value: (feature.id),
            }));
            var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([{
                    key: (feature.id),
                    value: (feature.id),
                }], __VLS_functionalComponentArgsRest(__VLS_55), false));
            var __VLS_59 = __VLS_57.slots.default;
            var __VLS_60 = (__VLS_ctx.getGeometryIcon(feature));
            // @ts-ignore
            var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({}));
            var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_61), false));
            (feature.meta.name || feature.type || feature.geometry.type);
            // @ts-ignore
            [featureLayerUtils_ts_1.getGeometryIcon,];
            var __VLS_57;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_45;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
var __VLS_21;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
