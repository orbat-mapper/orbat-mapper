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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var reka_ui_1 = require("reka-ui");
exports.default = {};
;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({ inheritAttrs: false });
var __VLS_export = await (function () { return __awaiter(void 0, void 0, void 0, function () {
    var props, localValue, hasLocationFilter, hasFilter, updateValue, __VLS_modelEmit, __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives, __VLS_0, __VLS_1, __VLS_2, __VLS_5, __VLS_6, __VLS_7, __VLS_10, __VLS_11, __VLS_12, __VLS_15, __VLS_16, __VLS_17, __VLS_20, __VLS_21, __VLS_22, __VLS_23, __VLS_24, __VLS_25, __VLS_28, __VLS_29, __VLS_30, __VLS_18, __VLS_19;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                props = defineProps();
                localValue = defineModel();
                hasLocationFilter = defineModel("locationFilter");
                hasFilter = (0, vue_1.computed)(function () {
                    return !!(hasLocationFilter.value || localValue.value);
                });
                updateValue = function (event) {
                    localValue.value = event.target.value;
                };
                __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative rounded-md shadow-xs" }));
                /** @type {__VLS_StyleScopedClasses['relative']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['shadow-xs']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3" }));
                /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['pl-3']} */ ;
                if (__VLS_ctx.hasFilter) {
                    __VLS_0 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.IconFilterVariantPlus} */
                    vue_mdi_1.IconFilterVariantPlus;
                    __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground h-5 w-5" }, { 'aria-hidden': "true" })));
                    __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
                    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                }
                else {
                    __VLS_5 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.IconFilterVariant} */
                    vue_mdi_1.IconFilterVariant;
                    __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ class: "text-muted-foreground h-5 w-5" }, { 'aria-hidden': "true" })));
                    __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
                    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign(__assign({ onInput: (__VLS_ctx.updateValue) }, { value: (__VLS_ctx.localValue), type: "text" }), { class: "focus:border-primary focus:ring-ring dark:bg-muted/20 block w-full rounded-md border-gray-300 pr-10 pl-10 sm:text-sm" }), { placeholder: "Filter" }));
                (__VLS_ctx.$attrs);
                /** @type {__VLS_StyleScopedClasses['focus:border-primary']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
                /** @type {__VLS_StyleScopedClasses['dark:bg-muted/20']} */ ;
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
                /** @type {__VLS_StyleScopedClasses['pr-10']} */ ;
                /** @type {__VLS_StyleScopedClasses['pl-10']} */ ;
                /** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "absolute inset-y-0 right-0 flex items-center pr-3" }));
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        __VLS_ctx.localValue = '';
                        // @ts-ignore
                        [hasFilter, updateValue, localValue, localValue, $attrs,];
                    } }, { class: "text-muted-foreground hover:text-muted-foreground focus:ring-ring rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-hidden" }), { type: "button" }));
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-offset-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
                /** @ts-ignore @type {typeof __VLS_components.CloseIcon} */
                vue_mdi_1.IconClose;
                __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
                __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_11), false));
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @ts-ignore @type {typeof __VLS_components.Toggle | typeof __VLS_components.Toggle} */
                reka_ui_1.Toggle;
                __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign(__assign({ 'onClick': {} }, { modelValue: (__VLS_ctx.hasLocationFilter), title: "Toggle location filter" }), { class: "text-muted-foreground hover:text-muted-foreground focus:ring-ring rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-hidden" })));
                __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { modelValue: (__VLS_ctx.hasLocationFilter), title: "Toggle location filter" }), { class: "text-muted-foreground hover:text-muted-foreground focus:ring-ring rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-hidden" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
                __VLS_21 = ({ click: {} },
                    { onClick: function () {
                            var _a = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                _a[_i] = arguments[_i];
                            }
                            var $event = _a[0];
                            __VLS_ctx.hasLocationFilter = !__VLS_ctx.hasLocationFilter;
                            // @ts-ignore
                            [hasLocationFilter, hasLocationFilter, hasLocationFilter,];
                        } });
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-offset-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
                __VLS_22 = __VLS_18.slots.default;
                if (__VLS_ctx.hasLocationFilter) {
                    __VLS_23 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.IconCrosshairsOff} */
                    vue_mdi_1.IconCrosshairsOff;
                    __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
                    __VLS_25 = __VLS_24.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_24), false));
                    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                }
                else {
                    __VLS_28 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.IconCrosshairsGps} */
                    vue_mdi_1.IconCrosshairsGps;
                    __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
                    __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_29), false));
                    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                }
                // @ts-ignore
                [hasLocationFilter,];
                // @ts-ignore
                [];
                return [4 /*yield*/, Promise.resolve().then(function () { return require('vue'); })];
            case 1: return [2 /*return*/, (_a.sent()).defineComponent({
                    __typeEmits: {},
                    __typeProps: {},
                })];
        }
    });
}); })();
