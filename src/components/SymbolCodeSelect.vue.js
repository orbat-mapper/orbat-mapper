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
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var select_1 = require("@/components/ui/select");
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var field_1 = require("@/components/ui/field");
var props = defineProps();
var controlId = (0, vue_1.useId)();
var selectedValue = defineModel({ default: "00" });
var selected = (0, vue_1.computed)(function () {
    if (props.groups) {
        for (var _i = 0, _a = props.groups; _i < _a.length; _i++) {
            var group = _a[_i];
            var found = group.items.find(function (i) { return i.code === selectedValue.value; });
            if (found)
                return found;
        }
        return null;
    }
    return (props.items || []).find(function (i) { return i.code === selectedValue.value; });
});
var __VLS_defaultModels = {
    'modelValue': "00",
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
field_1.Field;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
field_1.FieldLabel;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    for: (__VLS_ctx.controlId),
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        for: (__VLS_ctx.controlId),
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
(__VLS_ctx.label);
// @ts-ignore
[controlId, label,];
var __VLS_10;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
select_1.Select;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    modelValue: (__VLS_ctx.selectedValue),
}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.selectedValue),
    }], __VLS_functionalComponentArgsRest(__VLS_14), false));
var __VLS_18 = __VLS_16.slots.default;
var __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
select_1.SelectTrigger;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ class: "w-full data-[size=default]:h-10" }, { id: (__VLS_ctx.controlId) })));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ class: "w-full data-[size=default]:h-10" }, { id: (__VLS_ctx.controlId) })], __VLS_functionalComponentArgsRest(__VLS_20), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[size=default]:h-10']} */ ;
var __VLS_24 = __VLS_22.slots.default;
var __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.SelectValue | typeof __VLS_components.SelectValue} */
select_1.SelectValue;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ class: "" })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ class: "" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_30 = __VLS_28.slots.default;
if (__VLS_ctx.selected) {
    var __VLS_31 = UnitSymbol_vue_1.default;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ class: "size-8" }, { sidc: (((_a = __VLS_ctx.selected) === null || _a === void 0 ? void 0 : _a.sidc) || ''), size: (20), options: (__assign(__assign({ outlineWidth: 8 }, __VLS_ctx.symbolOptions), (_b = __VLS_ctx.selected) === null || _b === void 0 ? void 0 : _b.symbolOptions)) })));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ class: "size-8" }, { sidc: (((_c = __VLS_ctx.selected) === null || _c === void 0 ? void 0 : _c.sidc) || ''), size: (20), options: (__assign(__assign({ outlineWidth: 8 }, __VLS_ctx.symbolOptions), (_d = __VLS_ctx.selected) === null || _d === void 0 ? void 0 : _d.symbolOptions)) })], __VLS_functionalComponentArgsRest(__VLS_32), false));
    /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "truncate" }));
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    ((_e = __VLS_ctx.selected) === null || _e === void 0 ? void 0 : _e.text);
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.placeholder);
}
// @ts-ignore
[controlId, selectedValue, selected, selected, selected, selected, symbolOptions, placeholder,];
var __VLS_28;
// @ts-ignore
[];
var __VLS_22;
var __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
select_1.SelectContent;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36(__assign({ class: "border-border max-h-[400px]" })));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign({ class: "border-border max-h-[400px]" })], __VLS_functionalComponentArgsRest(__VLS_37), false));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[400px]']} */ ;
var __VLS_41 = __VLS_39.slots.default;
if (__VLS_ctx.groups) {
    for (var _i = 0, _k = __VLS_vFor((__VLS_ctx.groups)); _i < _k.length; _i++) {
        var group = _k[_i][0];
        var __VLS_42 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectGroup | typeof __VLS_components.SelectGroup} */
        select_1.SelectGroup;
        // @ts-ignore
        var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            key: (group.name),
        }));
        var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{
                key: (group.name),
            }], __VLS_functionalComponentArgsRest(__VLS_43), false));
        var __VLS_47 = __VLS_45.slots.default;
        var __VLS_48 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectLabel | typeof __VLS_components.SelectLabel} */
        select_1.SelectLabel;
        // @ts-ignore
        var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({}));
        var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_49), false));
        var __VLS_53 = __VLS_51.slots.default;
        (group.name);
        // @ts-ignore
        [groups, groups,];
        var __VLS_51;
        for (var _l = 0, _m = __VLS_vFor((group.items)); _l < _m.length; _l++) {
            var item = _m[_l][0];
            var __VLS_54 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
            select_1.SelectItem;
            // @ts-ignore
            var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54(__assign({ key: ((_f = item.code) !== null && _f !== void 0 ? _f : undefined), value: (item.code) }, { class: "data-[state=checked]:font-semibold" })));
            var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([__assign({ key: ((_g = item.code) !== null && _g !== void 0 ? _g : undefined), value: (item.code) }, { class: "data-[state=checked]:font-semibold" })], __VLS_functionalComponentArgsRest(__VLS_55), false));
            /** @type {__VLS_StyleScopedClasses['data-[state=checked]:font-semibold']} */ ;
            var __VLS_59 = __VLS_57.slots.default;
            var __VLS_60 = UnitSymbol_vue_1.default;
            // @ts-ignore
            var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60(__assign(__assign({ size: (20) }, { class: "size-8" }), { sidc: (item.sidc), options: (__assign(__assign({ outlineWidth: 8 }, __VLS_ctx.symbolOptions), item.symbolOptions)) })));
            var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign(__assign({ size: (20) }, { class: "size-8" }), { sidc: (item.sidc), options: (__assign(__assign({ outlineWidth: 8 }, __VLS_ctx.symbolOptions), item.symbolOptions)) })], __VLS_functionalComponentArgsRest(__VLS_61), false));
            /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
            (item.text);
            // @ts-ignore
            [symbolOptions,];
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
else {
    var __VLS_65 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectGroup | typeof __VLS_components.SelectGroup} */
    select_1.SelectGroup;
    // @ts-ignore
    var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({}));
    var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_66), false));
    var __VLS_70 = __VLS_68.slots.default;
    for (var _o = 0, _p = __VLS_vFor((__VLS_ctx.items)); _o < _p.length; _o++) {
        var item = _p[_o][0];
        var __VLS_71 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71(__assign({ key: ((_h = item.code) !== null && _h !== void 0 ? _h : undefined), value: (item.code) }, { class: "data-[state=checked]:font-semibold" })));
        var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign({ key: ((_j = item.code) !== null && _j !== void 0 ? _j : undefined), value: (item.code) }, { class: "data-[state=checked]:font-semibold" })], __VLS_functionalComponentArgsRest(__VLS_72), false));
        /** @type {__VLS_StyleScopedClasses['data-[state=checked]:font-semibold']} */ ;
        var __VLS_76 = __VLS_74.slots.default;
        var __VLS_77 = UnitSymbol_vue_1.default;
        // @ts-ignore
        var __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77(__assign(__assign({ size: (20) }, { class: "size-8" }), { sidc: (item.sidc), options: (__assign(__assign({ outlineWidth: 8 }, __VLS_ctx.symbolOptions), item.symbolOptions)) })));
        var __VLS_79 = __VLS_78.apply(void 0, __spreadArray([__assign(__assign({ size: (20) }, { class: "size-8" }), { sidc: (item.sidc), options: (__assign(__assign({ outlineWidth: 8 }, __VLS_ctx.symbolOptions), item.symbolOptions)) })], __VLS_functionalComponentArgsRest(__VLS_78), false));
        /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
        (item.text);
        // @ts-ignore
        [symbolOptions, items,];
        var __VLS_74;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_68;
}
// @ts-ignore
[];
var __VLS_39;
// @ts-ignore
[];
var __VLS_16;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
