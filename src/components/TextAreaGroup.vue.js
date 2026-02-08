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
var nanoid_1 = require("nanoid");
var index_js_1 = require("@/components/ui/textarea/index.js");
var index_js_2 = require("@/components/ui/label/index.js");
exports.default = {};
;
var __VLS_ctx = {};
var __VLS_componentsOption = { Label: index_js_2.Label, Textarea: index_js_1.Textarea };
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
index_js_2.Label;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ for: (__VLS_ctx.id || __VLS_ctx.computedId) }, { class: "" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ for: (__VLS_ctx.id || __VLS_ctx.computedId) }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6 = {};
(__VLS_ctx.label);
// @ts-ignore
[id, computedId, label,];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-1" }));
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
var __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.Textarea} */
index_js_1.Textarea;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.localValue),
    id: (__VLS_ctx.id || __VLS_ctx.computedId),
}));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.localValue),
        id: (__VLS_ctx.id || __VLS_ctx.computedId),
    }], __VLS_functionalComponentArgsRest(__VLS_9), false));
(__VLS_ctx.$attrs);
if (__VLS_ctx.description || __VLS_ctx.$slots.description) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-2 text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    var __VLS_13 = {};
    (__VLS_ctx.description);
}
// @ts-ignore
var __VLS_7 = __VLS_6, __VLS_14 = __VLS_13;
// @ts-ignore
[id, computedId, localValue, $attrs, description, description, $slots,];
var __VLS_export = (0, vue_1.defineComponent)({
    name: "TextAreaGroup",
    components: { Label: index_js_2.Label, Textarea: index_js_1.Textarea },
    props: {
        id: [String],
        label: String,
        description: String,
        modelValue: [String, Number],
    },
    emits: ["update:modelValue"],
    inheritAttrs: false,
    setup: function (props, _a) {
        var emit = _a.emit;
        var computedId = (0, nanoid_1.nanoid)();
        var localValue = (0, vue_1.computed)({
            get: function () { return props.modelValue; },
            set: function (value) { return emit("update:modelValue", value); },
        });
        return {
            localValue: localValue,
            computedId: computedId,
        };
    },
});
