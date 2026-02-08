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
var solid_1 = require("@heroicons/vue/24/solid");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var vue_global_events_1 = require("vue-global-events");
var uiStore_1 = require("@/stores/uiStore");
var helpers_1 = require("./helpers");
var BaseToolbar_vue_1 = require("./BaseToolbar.vue");
var ToolbarButton_vue_1 = require("./ToolbarButton.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), state = _a.store.state, _b = _a.time, scenarioTime = _b.scenarioTime, setCurrentTime = _b.setCurrentTime, add = _b.add, subtract = _b.subtract, jumpToNextEvent = _b.jumpToNextEvent, jumpToPrevEvent = _b.jumpToPrevEvent;
var getModalTimestamp = (0, utils_1.injectStrict)(injects_1.timeModalKey).getModalTimestamp;
var uiStore = (0, uiStore_1.useUiStore)();
var openTimeDialog = function () { return __awaiter(void 0, void 0, void 0, function () {
    var newTimestamp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getModalTimestamp(state.currentTime, {
                    timeZone: state.info.timeZone,
                })];
            case 1:
                newTimestamp = _a.sent();
                if (newTimestamp !== undefined) {
                    setCurrentTime(newTimestamp);
                }
                return [2 /*return*/];
        }
    });
}); };
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full items-center justify-between p-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.scenarioTime.format("YYYY-MM-DD"));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-foreground text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.scenarioTime.format("HH:mmZ"));
var __VLS_0 = BaseToolbar_vue_1.default || BaseToolbar_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { start: true })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { start: true })], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11;
var __VLS_12 = ({ click: {} },
    { onClick: (__VLS_ctx.openTimeDialog) });
var __VLS_13 = __VLS_9.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.CalendarIcon} */
solid_1.CalendarIcon;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[scenarioTime, scenarioTime, openTimeDialog,];
var __VLS_9;
var __VLS_10;
var __VLS_19 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ 'onClick': {} })));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_20), false));
var __VLS_24;
var __VLS_25 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.jumpToPrevEvent();
            // @ts-ignore
            [jumpToPrevEvent,];
        } });
var __VLS_26 = __VLS_22.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_27;
/** @ts-ignore @type {typeof __VLS_components.IconSkipPrevious} */
vue_mdi_1.IconSkipPrevious;
// @ts-ignore
var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_22;
var __VLS_23;
var __VLS_32 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32(__assign({ 'onClick': {} })));
var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_33), false));
var __VLS_37;
var __VLS_38 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.jumpToNextEvent();
            // @ts-ignore
            [jumpToNextEvent,];
        } });
var __VLS_39 = __VLS_35.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.IconSkipNext} */
vue_mdi_1.IconSkipNext;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_41), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_35;
var __VLS_36;
var __VLS_45 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45(__assign({ 'onClick': {} }, { type: "button" })));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button" })], __VLS_functionalComponentArgsRest(__VLS_46), false));
var __VLS_50;
var __VLS_51 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.subtract(1, 'day', true);
            // @ts-ignore
            [subtract,];
        } });
var __VLS_52 = __VLS_48.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_53;
/** @ts-ignore @type {typeof __VLS_components.IconChevronLeft} */
vue_mdi_1.IconChevronLeft;
// @ts-ignore
var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_54), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_48;
var __VLS_49;
var __VLS_58 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58(__assign({ 'onClick': {} }, { end: true })));
var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { end: true })], __VLS_functionalComponentArgsRest(__VLS_59), false));
var __VLS_63;
var __VLS_64 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.add(1, 'day', true);
            // @ts-ignore
            [add,];
        } });
var __VLS_65 = __VLS_61.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_66;
/** @ts-ignore @type {typeof __VLS_components.IconChevronRight} */
vue_mdi_1.IconChevronRight;
// @ts-ignore
var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_67), false));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_61;
var __VLS_62;
// @ts-ignore
[];
var __VLS_3;
if (__VLS_ctx.uiStore.shortcutsEnabled) {
    var __VLS_71 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.GlobalEvents} */
    vue_global_events_1.GlobalEvents;
    // @ts-ignore
    var __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71(__assign({ 'onKeyup': {} }, { filter: (__VLS_ctx.inputEventFilter) })));
    var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign({ 'onKeyup': {} }, { filter: (__VLS_ctx.inputEventFilter) })], __VLS_functionalComponentArgsRest(__VLS_72), false));
    var __VLS_76 = void 0;
    var __VLS_77 = ({ keyup: {} },
        { onKeyup: (__VLS_ctx.openTimeDialog) });
    var __VLS_74;
    var __VLS_75;
}
// @ts-ignore
[openTimeDialog, uiStore, helpers_1.inputEventFilter,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
