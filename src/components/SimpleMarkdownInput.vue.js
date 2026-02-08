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
var formatting_1 = require("../composables/formatting");
var vue_global_events_1 = require("vue-global-events");
var index_js_1 = require("@/components/ui/textarea/index.js");
var index_js_2 = require("@/components/ui/label/index.js");
var toggle_group_1 = require("@/components/ui/toggle-group");
var props = defineProps();
defineOptions({ inheritAttrs: false });
var localValue = defineModel({ default: "" });
var computedId = (_a = props.id) !== null && _a !== void 0 ? _a : (0, vue_1.useId)();
var currentTab = (0, vue_1.ref)(0);
var isPreview = (0, vue_1.computed)(function () { return currentTab.value === 1; });
var renderedMarkdown = (0, vue_1.computed)(function () {
    if (!isPreview)
        return "";
    return (0, formatting_1.renderMarkdown)(localValue.value || "");
});
var togglePreview = function () {
    if (currentTab.value === 0)
        currentTab.value = 1;
    else
        currentTab.value = 0;
};
var __VLS_defaultModels = {
    'modelValue': "",
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-end justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-end']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
index_js_2.Label;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    for: (__VLS_ctx.computedId),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        for: (__VLS_ctx.computedId),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6 = {};
(__VLS_ctx.label);
// @ts-ignore
[computedId, label,];
var __VLS_3;
var __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.ToggleGroup | typeof __VLS_components.ToggleGroup} */
toggle_group_1.ToggleGroup;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.currentTab),
    type: "single",
    variant: "outline",
    size: "sm",
}));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.currentTab),
        type: "single",
        variant: "outline",
        size: "sm",
    }], __VLS_functionalComponentArgsRest(__VLS_9), false));
var __VLS_13 = __VLS_11.slots.default;
var __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.ToggleGroupItem | typeof __VLS_components.ToggleGroupItem} */
toggle_group_1.ToggleGroupItem;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ value: (0) }, { class: "px-4" })));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ value: (0) }, { class: "px-4" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
var __VLS_19 = __VLS_17.slots.default;
// @ts-ignore
[currentTab,];
var __VLS_17;
var __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.ToggleGroupItem | typeof __VLS_components.ToggleGroupItem} */
toggle_group_1.ToggleGroupItem;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ value: (1) }, { class: "px-4" })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ value: (1) }, { class: "px-4" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
var __VLS_25 = __VLS_23.slots.default;
// @ts-ignore
[];
var __VLS_23;
// @ts-ignore
[];
var __VLS_11;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-1.5" }));
/** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
var __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.Textarea} */
index_js_1.Textarea;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    modelValue: (__VLS_ctx.localValue),
    id: (__VLS_ctx.computedId),
}));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.localValue),
        id: (__VLS_ctx.computedId),
    }], __VLS_functionalComponentArgsRest(__VLS_27), false));
(__VLS_ctx.$attrs);
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (!__VLS_ctx.isPreview) }), null, null);
if (__VLS_ctx.isPreview) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "dark:prose-invert prose prose-sm mt-4" }));
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.renderedMarkdown) }), null, null);
    /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
}
if (!__VLS_ctx.isPreview && (__VLS_ctx.description || __VLS_ctx.$slots.description)) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-2 text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    var __VLS_31 = {};
    (__VLS_ctx.description);
}
var __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.GlobalEvents | typeof __VLS_components.GlobalEvents} */
vue_global_events_1.GlobalEvents;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign({ 'onKeyup': {} })));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ 'onKeyup': {} })], __VLS_functionalComponentArgsRest(__VLS_34), false));
var __VLS_38;
var __VLS_39 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.togglePreview) });
var __VLS_36;
var __VLS_37;
// @ts-ignore
var __VLS_7 = __VLS_6, __VLS_32 = __VLS_31;
// @ts-ignore
[computedId, localValue, $attrs, isPreview, isPreview, isPreview, renderedMarkdown, description, description, $slots, togglePreview,];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
