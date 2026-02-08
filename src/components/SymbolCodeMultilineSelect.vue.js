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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var select_1 = require("@/components/ui/select");
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var field_1 = require("@/components/ui/field");
var props = defineProps();
var controlId = (0, vue_1.useId)();
var selectedValue = defineModel({ default: "00" });
function mapSymbolItem(item) {
    return {
        sidc: item.sidc,
        code: item.code,
        label: item.entitySubtype || item.entityType || item.entity,
        subLabel: item.entitySubtype
            ? "".concat(item.entity, " / ").concat(item.entityType)
            : item.entityType
                ? item.entity
                : "",
    };
}
var renderedItems = (0, vue_1.computed)(function () { return props.items.map(mapSymbolItem); });
var selected = (0, vue_1.computed)(function () {
    var v = (renderedItems.value || []).find(function (i) { return i.code === selectedValue.value; });
    return v ? v : renderedItems.value[0];
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
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ class: "w-full data-[size=default]:h-12" }, { id: (__VLS_ctx.controlId) })));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ class: "w-full data-[size=default]:h-12" }, { id: (__VLS_ctx.controlId) })], __VLS_functionalComponentArgsRest(__VLS_20), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[size=default]:h-12']} */ ;
var __VLS_24 = __VLS_22.slots.default;
var __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.SelectValue | typeof __VLS_components.SelectValue} */
select_1.SelectValue;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_30 = __VLS_28.slots.default;
if (__VLS_ctx.selected) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    var __VLS_31 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ class: "size-8" }, { sidc: (((_a = __VLS_ctx.selected) === null || _a === void 0 ? void 0 : _a.sidc) || ''), alt: "", size: (20), options: (__assign(__assign({}, __VLS_ctx.symbolOptions), { outlineWidth: 4 })) })));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ class: "size-8" }, { sidc: (((_b = __VLS_ctx.selected) === null || _b === void 0 ? void 0 : _b.sidc) || ''), alt: "", size: (20), options: (__assign(__assign({}, __VLS_ctx.symbolOptions), { outlineWidth: 4 })) })], __VLS_functionalComponentArgsRest(__VLS_32), false));
    /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "ml-3 max-w-xs text-left sm:max-w-none" }));
    /** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:max-w-none']} */ ;
    if ((_c = __VLS_ctx.selected) === null || _c === void 0 ? void 0 : _c.subLabel) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground truncate text-xs" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        (__VLS_ctx.selected.subLabel);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-0 truncate text-sm" }));
    /** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    ((_d = __VLS_ctx.selected) === null || _d === void 0 ? void 0 : _d.label);
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.placeholder);
}
// @ts-ignore
[controlId, selectedValue, selected, selected, selected, selected, selected, symbolOptions, placeholder,];
var __VLS_28;
// @ts-ignore
[];
var __VLS_22;
var __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
select_1.SelectContent;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_37), false));
var __VLS_41 = __VLS_39.slots.default;
var __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.SelectGroup | typeof __VLS_components.SelectGroup} */
select_1.SelectGroup;
// @ts-ignore
var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({}));
var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_43), false));
var __VLS_47 = __VLS_45.slots.default;
for (var _i = 0, _h = __VLS_vFor((__VLS_ctx.renderedItems)); _i < _h.length; _i++) {
    var item = _h[_i][0];
    var __VLS_48 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
    select_1.SelectItem;
    // @ts-ignore
    var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48(__assign({ key: ((_e = item.code) !== null && _e !== void 0 ? _e : undefined), value: (item.code) }, { class: "data-[state=checked]:font-semibold" })));
    var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign({ key: ((_f = item.code) !== null && _f !== void 0 ? _f : undefined), value: (item.code) }, { class: "data-[state=checked]:font-semibold" })], __VLS_functionalComponentArgsRest(__VLS_49), false));
    /** @type {__VLS_StyleScopedClasses['data-[state=checked]:font-semibold']} */ ;
    var __VLS_53 = __VLS_51.slots.default;
    if (__VLS_ctx.selected) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        var __VLS_54 = NewMilitarySymbol_vue_1.default;
        // @ts-ignore
        var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54(__assign({ class: "size-8" }, { sidc: (item.sidc || ''), alt: "", size: (20), options: (__assign(__assign({}, __VLS_ctx.symbolOptions), { outlineWidth: 4 })) })));
        var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([__assign({ class: "size-8" }, { sidc: (item.sidc || ''), alt: "", size: (20), options: (__assign(__assign({}, __VLS_ctx.symbolOptions), { outlineWidth: 4 })) })], __VLS_functionalComponentArgsRest(__VLS_55), false));
        /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "ml-3 max-w-xs flex-auto text-left sm:max-w-none" }));
        /** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:max-w-none']} */ ;
        if ((_g = __VLS_ctx.selected) === null || _g === void 0 ? void 0 : _g.subLabel) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground truncate text-xs" }));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (item.subLabel);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-0 truncate" }));
        /** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (item.label);
    }
    // @ts-ignore
    [selected, selected, symbolOptions, renderedItems,];
    var __VLS_51;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_45;
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
