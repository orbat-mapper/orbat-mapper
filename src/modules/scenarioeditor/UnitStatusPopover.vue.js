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
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var popover_1 = require("@/components/ui/popover");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var emit = defineEmits();
var unitStatusMap = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store.state.unitStatusMap;
var isOpen = (0, vue_1.ref)(false);
var statusValue = (0, vue_1.ref)(null);
var unitStatusValues = (0, vue_1.computed)(function () {
    return (0, utils_1.sortBy)(Object.values(unitStatusMap), "name").map(function (v) { return ({
        value: v.id,
        label: v.name,
    }); });
});
function onFormSubmit() {
    emit("update", statusValue.value);
    isOpen.value = false;
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
popover_1.Popover;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    open: (__VLS_ctx.isOpen),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        open: (__VLS_ctx.isOpen),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.PopoverTrigger | typeof __VLS_components.PopoverTrigger} */
popover_1.PopoverTrigger;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    asChild: true,
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    variant: "outline",
}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
        variant: "outline",
    }], __VLS_functionalComponentArgsRest(__VLS_14), false));
var __VLS_18 = __VLS_16.slots.default;
// @ts-ignore
[isOpen,];
var __VLS_16;
// @ts-ignore
[];
var __VLS_10;
var __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.PopoverContent | typeof __VLS_components.PopoverContent} */
popover_1.PopoverContent;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ class: "" })));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ class: "" })], __VLS_functionalComponentArgsRest(__VLS_20), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_24 = __VLS_22.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.onFormSubmit();
        // @ts-ignore
        [onFormSubmit,];
    } }, { class: "mt-2 space-y-2" }));
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
var __VLS_25 = SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    addNone: true,
    items: (__VLS_ctx.unitStatusValues),
    modelValue: (__VLS_ctx.statusValue),
}));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{
        addNone: true,
        items: (__VLS_ctx.unitStatusValues),
        modelValue: (__VLS_ctx.statusValue),
    }], __VLS_functionalComponentArgsRest(__VLS_26), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "flex justify-end" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
var __VLS_30 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    small: true,
    primary: true,
    type: "submit",
}));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{
        small: true,
        primary: true,
        type: "submit",
    }], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35 = __VLS_33.slots.default;
// @ts-ignore
[unitStatusValues, statusValue,];
var __VLS_33;
// @ts-ignore
[];
var __VLS_22;
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
