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
var xlsx_read_lazy_1 = require("@/extlib/xlsx-read-lazy");
var utils_1 = require("@/importexport/spreadsheets/utils");
var ImportOdinStep_vue_1 = require("@/components/ImportOdinStep.vue");
var ImportGenericStep_vue_1 = require("@/components/ImportGenericStep.vue");
var props = defineProps();
var emit = defineEmits(["cancel", "loaded"]);
var workbook = (0, xlsx_read_lazy_1.readSpreadsheet)(props.fileInfo.dataAsArrayBuffer || props.fileInfo.dataAsString, props.fileInfo.dataAsArrayBuffer ? undefined : { type: "string" });
var dialect = (0, utils_1.detectSpreadsheetDialect)(workbook);
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "h-full" }));
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
if (__VLS_ctx.dialect === 'ODIN_DRAGON') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "h-full overflow-y-auto px-6" }));
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    var __VLS_0 = ImportOdinStep_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { workbook: (__VLS_ctx.workbook) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { workbook: (__VLS_ctx.workbook) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ cancel: {} },
        { onCancel: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.dialect === 'ODIN_DRAGON'))
                    return;
                __VLS_ctx.emit('cancel');
                // @ts-ignore
                [dialect, workbook, emit,];
            } });
    var __VLS_7 = ({ loaded: {} },
        { onLoaded: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.dialect === 'ODIN_DRAGON'))
                    return;
                __VLS_ctx.emit('loaded');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_3;
    var __VLS_4;
}
else if (__VLS_ctx.dialect === 'generic') {
    var __VLS_8 = ImportGenericStep_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { workbook: (__VLS_ctx.workbook) })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { workbook: (__VLS_ctx.workbook) })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = void 0;
    var __VLS_14 = ({ cancel: {} },
        { onCancel: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.dialect === 'ODIN_DRAGON'))
                    return;
                if (!(__VLS_ctx.dialect === 'generic'))
                    return;
                __VLS_ctx.emit('cancel');
                // @ts-ignore
                [dialect, workbook, emit,];
            } });
    var __VLS_15 = ({ loaded: {} },
        { onLoaded: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.dialect === 'ODIN_DRAGON'))
                    return;
                if (!(__VLS_ctx.dialect === 'generic'))
                    return;
                __VLS_ctx.emit('loaded');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_11;
    var __VLS_12;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "p-6 text-center" }));
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-red-500" }));
    /** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
