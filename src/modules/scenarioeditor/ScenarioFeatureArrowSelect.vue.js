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
var DrawArrow_vue_1 = require("@/components/DrawArrow.vue");
var modelValue = defineModel({ required: true });
var __VLS_props = defineProps();
var arrowTypeOptions = [
    { label: "None", value: "none" },
    { label: "Arrow", value: "arrow" },
    { label: "Arrow (open)", value: "arrow-open" },
    { label: "Arrow (curved)", value: "arrow-curved" },
    { label: "Arrow (stealth)", value: "arrow-stealth" },
    { label: "Arrow (double)", value: "arrow-double" },
    { label: "Hand drawn", value: "arrow-hand-drawn" },
    { label: "Hand drawn (double)", value: "arrow-double-hand-drawn" },
    { label: "Dot", value: "dot" },
    { label: "Square", value: "square" },
    { label: "Diamond", value: "diamond" },
    { label: "Bar", value: "bar" },
];
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
select_1.Select;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.modelValue),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.modelValue),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
select_1.SelectTrigger;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ id: (__VLS_ctx.id) }, { class: "w-full" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ id: (__VLS_ctx.id) }, { class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_12 = __VLS_10.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
if (__VLS_ctx.modelValue !== 'none') {
    var __VLS_13 = DrawArrow_vue_1.default;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ arrowType: (__VLS_ctx.modelValue), size: (20), rotation: (0) }, { class: "text-foreground shrink-0" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ arrowType: (__VLS_ctx.modelValue), size: (20), rotation: (0) }, { class: "text-foreground shrink-0" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
}
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.SelectValue} */
select_1.SelectValue;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    placeholder: "Select arrow",
}));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{
        placeholder: "Select arrow",
    }], __VLS_functionalComponentArgsRest(__VLS_19), false));
// @ts-ignore
[modelValue, modelValue, modelValue, id,];
var __VLS_10;
var __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
select_1.SelectContent;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_24), false));
var __VLS_28 = __VLS_26.slots.default;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.arrowTypeOptions)); _i < _a.length; _i++) {
    var item = _a[_i][0];
    var __VLS_29 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
    select_1.SelectItem;
    // @ts-ignore
    var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        key: (item.value),
        value: (item.value),
    }));
    var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
            key: (item.value),
            value: (item.value),
        }], __VLS_functionalComponentArgsRest(__VLS_30), false));
    var __VLS_34 = __VLS_32.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    if (item.value !== 'none') {
        var __VLS_35 = DrawArrow_vue_1.default;
        // @ts-ignore
        var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign({ arrowType: (item.value), size: (20), rotation: (0) }, { class: "text-foreground" })));
        var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ arrowType: (item.value), size: (20), rotation: (0) }, { class: "text-foreground" })], __VLS_functionalComponentArgsRest(__VLS_36), false));
        /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (item.label);
    // @ts-ignore
    [arrowTypeOptions,];
    var __VLS_32;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_26;
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
