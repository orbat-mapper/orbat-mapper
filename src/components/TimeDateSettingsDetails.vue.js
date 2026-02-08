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
var RadioGroupList_vue_1 = require("@/components/RadioGroupList.vue");
var LanguageSelect_vue_1 = require("@/components/LanguageSelect.vue");
var InputGroupTemplate_vue_1 = require("@/components/InputGroupTemplate.vue");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var props = defineProps();
var settings = defineModel({ required: true });
var browserLocale = navigator.language;
var languageNames = new Intl.DisplayNames(["en"], { type: "language" });
var browserLanguageName = languageNames.of(browserLocale);
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_0 = RadioGroupList_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.settings.timeFormat),
    items: (__VLS_ctx.timeFormatItems),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.settings.timeFormat),
        items: (__VLS_ctx.timeFormatItems),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
if (__VLS_ctx.settings.timeFormat === 'local') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    var __VLS_5 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        label: "Language",
    }));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
            label: "Language",
        }], __VLS_functionalComponentArgsRest(__VLS_6), false));
    var __VLS_10 = __VLS_8.slots.default;
    var __VLS_11 = LanguageSelect_vue_1.default;
    // @ts-ignore
    var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        modelValue: (__VLS_ctx.settings.locale),
    }));
    var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.settings.locale),
        }], __VLS_functionalComponentArgsRest(__VLS_12), false));
    {
        var __VLS_16 = __VLS_8.slots.description;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.browserLanguageName);
        (__VLS_ctx.browserLocale);
        // @ts-ignore
        [settings, settings, settings, timeFormatStore_1.timeFormatItems, browserLanguageName, browserLocale,];
    }
    // @ts-ignore
    [];
    var __VLS_8;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-2 gap-4" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    var __VLS_17 = SimpleSelect_vue_1.default;
    // @ts-ignore
    var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        label: "Date style",
        modelValue: (__VLS_ctx.settings.dateStyle),
        items: (__VLS_ctx.intlItems),
    }));
    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
            label: "Date style",
            modelValue: (__VLS_ctx.settings.dateStyle),
            items: (__VLS_ctx.intlItems),
        }], __VLS_functionalComponentArgsRest(__VLS_18), false));
    var __VLS_22 = SimpleSelect_vue_1.default;
    // @ts-ignore
    var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        label: "Time style",
        modelValue: (__VLS_ctx.settings.timeStyle),
        items: (__VLS_ctx.intlItems),
    }));
    var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([{
            label: "Time style",
            modelValue: (__VLS_ctx.settings.timeStyle),
            items: (__VLS_ctx.intlItems),
        }], __VLS_functionalComponentArgsRest(__VLS_23), false));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm font-semibold" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
(__VLS_ctx.sampleTime);
// @ts-ignore
[settings, settings, timeFormatStore_1.intlItems, timeFormatStore_1.intlItems, sampleTime,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
