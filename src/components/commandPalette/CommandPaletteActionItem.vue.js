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
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var iconMap = {
    add: vue_mdi_1.IconAddCircleOutline,
    upload: vue_mdi_1.IconFileUploadOutline,
    download: vue_mdi_1.IconFileDownloadOutline,
    save: vue_mdi_1.IconContentSaveOutline,
    default: vue_mdi_1.IconHexagonOutline,
    play: vue_mdi_1.IconPlay,
    pause: vue_mdi_1.IconPause,
    increaseSpeed: vue_mdi_1.IconSpeedometer,
    decreaseSpeed: vue_mdi_1.IconSpeedometerSlow,
    share: vue_mdi_1.IconShareVariant,
};
var props = defineProps();
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-7 justify-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-7']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
var __VLS_0 = (__VLS_ctx.iconMap[__VLS_ctx.item.icon || 'default']);
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground size-8" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-8" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['size-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p)(__assign({ class: "ml-3 flex-auto truncate" }));
__VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.item.highlight ? __VLS_ctx.item.highlight : __VLS_ctx.item.name) }), null, null);
/** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
// @ts-ignore
[iconMap, item, item, item, item,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
