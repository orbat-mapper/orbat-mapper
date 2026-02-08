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
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var MilSymbol_vue_1 = require("@/components/MilSymbol.vue");
var convert_symbology_1 = require("@orbat-mapper/convert-symbology");
var letterTarget = (0, vue_1.ref)(null);
var numberTarget = (0, vue_1.ref)(null);
var letterFocused = (0, core_1.useFocusWithin)(letterTarget).focused;
var numberFocused = (0, core_1.useFocusWithin)(numberTarget).focused;
var letterSidcInput = (0, vue_1.ref)("SFGPUCRH----");
var numberSidcInput = (0, vue_1.ref)("");
var letterSidc = (0, vue_1.ref)("");
var numberSidc = (0, vue_1.ref)("");
(0, vue_1.watch)(letterSidcInput, function (v) {
    if (letterFocused.value || !numberFocused.value) {
        numberSidc.value = (0, convert_symbology_1.convertLetterSidc2NumberSidc)(v).sidc || "Unknown value";
        numberSidcInput.value = numberSidc.value;
        letterSidc.value = v;
    }
}, { immediate: true });
(0, vue_1.watch)(numberSidcInput, function (v) {
    if (numberFocused.value) {
        letterSidc.value = (0, convert_symbology_1.convertNumberSidc2LetterSidc)(v).sidc || "Unknown value";
        letterSidcInput.value = letterSidc.value;
        numberSidc.value = v;
    }
});
(0, vue_1.onMounted)(function () { var _a; return (_a = document.getElementById("letterSIDC")) === null || _a === void 0 ? void 0 : _a.focus(); });
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-full space-y-4 p-1 pb-8" }));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-4 content-center items-center gap-8" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['content-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "col-span-3" }));
/** @type {__VLS_StyleScopedClasses['col-span-3']} */ ;
var __VLS_0 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "Letter based SIDC",
    modelValue: (__VLS_ctx.letterSidcInput),
    ref: "letterTarget",
    id: "letterSIDC",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: "Letter based SIDC",
        modelValue: (__VLS_ctx.letterSidcInput),
        ref: "letterTarget",
        id: "letterSIDC",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_3;
var __VLS_7 = MilSymbol_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    sidc: (__VLS_ctx.letterSidc),
    size: (30),
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        sidc: (__VLS_ctx.letterSidc),
        size: (30),
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "col-span-3" }));
/** @type {__VLS_StyleScopedClasses['col-span-3']} */ ;
var __VLS_12 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign(__assign({ label: "Number based SIDC", modelValue: (__VLS_ctx.numberSidcInput) }, { class: "" }), { ref: "numberTarget" })));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign(__assign({ label: "Number based SIDC", modelValue: (__VLS_ctx.numberSidcInput) }, { class: "" }), { ref: "numberTarget" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
var __VLS_17 = {};
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_15;
var __VLS_19 = MilSymbol_vue_1.default;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    sidc: (__VLS_ctx.numberSidc),
    size: (30),
}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
        sidc: (__VLS_ctx.numberSidc),
        size: (30),
    }], __VLS_functionalComponentArgsRest(__VLS_20), false));
// @ts-ignore
var __VLS_6 = __VLS_5, __VLS_18 = __VLS_17;
// @ts-ignore
[letterSidcInput, letterSidc, numberSidcInput, numberSidc,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
