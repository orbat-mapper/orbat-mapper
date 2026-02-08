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
var field_1 = require("@/components/ui/field");
var utils_1 = require("@/lib/utils");
var props = defineProps();
var id = (0, vue_1.useId)();
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
field_1.Field;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: (__VLS_ctx.cn(props.class)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: (__VLS_ctx.cn(props.class)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
field_1.FieldLabel;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    for: (__VLS_ctx.id),
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        for: (__VLS_ctx.id),
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13 = {};
(__VLS_ctx.label);
// @ts-ignore
[utils_1.cn, id, label,];
var __VLS_10;
if (__VLS_ctx.hint || __VLS_ctx.$slots.hint) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    var __VLS_15 = {};
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground text-sm leading-6" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    (__VLS_ctx.hint);
}
var __VLS_17 = {
    id: (__VLS_ctx.id),
};
if (__VLS_ctx.description || __VLS_ctx.$slots.description) {
    var __VLS_19 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
    field_1.FieldDescription;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = __VLS_22.slots.default;
    var __VLS_25 = {};
    (__VLS_ctx.description);
    // @ts-ignore
    [id, hint, hint, $slots, $slots, description, description,];
    var __VLS_22;
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13, __VLS_16 = __VLS_15, __VLS_18 = __VLS_17, __VLS_26 = __VLS_25;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
