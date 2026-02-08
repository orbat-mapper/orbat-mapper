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
var PanelSubHeading_vue_1 = require("@/components/PanelSubHeading.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var mainToolbarStore_1 = require("@/stores/mainToolbarStore");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var props = defineProps();
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), store = _a.store, time = _a.time, geo = _a.geo;
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
var st = (0, mainToolbarStore_1.useMainToolbarStore)();
var state = (0, vue_1.computed)(function () { var _a; return (_a = props.feature.state) !== null && _a !== void 0 ? _a : []; });
var menuItems = [{ label: "Delete", action: "delete" }];
var isActive = function (s, index) {
    var _a, _b;
    if (!((_a = state.value) === null || _a === void 0 ? void 0 : _a.length))
        return;
    var nextTimestamp = ((_b = state.value[index + 1]) === null || _b === void 0 ? void 0 : _b.t) || Number.MAX_VALUE;
    var currentTime = store.state.currentTime;
    return s.t <= currentTime && nextTimestamp > currentTime;
};
var changeToState = function (stateEntry) {
    time.setCurrentTime(stateEntry.t);
};
function onStateAction(index, action) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (action === "delete") {
                geo.deleteFeatureStateEntry(props.feature.id, index);
            }
            store.state.featureStateCounter++;
            return [2 /*return*/];
        });
    });
}
function clearState() {
    geo.updateFeature(props.feature.id, { state: [] });
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_0 = PanelSubHeading_vue_1.default || PanelSubHeading_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
var __VLS_6 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { small: true })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true })], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11;
var __VLS_12 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.clearState();
            // @ts-ignore
            [clearState,];
        } });
var __VLS_13 = __VLS_9.slots.default;
// @ts-ignore
[];
var __VLS_9;
var __VLS_10;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "mt-2 divide-y divide-gray-200 border-t border-b border-gray-200" }));
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
var _loop_1 = function (s, index) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "relative flex items-center py-4" }, { key: (s.id) }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex min-w-0 flex-auto flex-col text-sm" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ class: "flex" }, { class: (__VLS_ctx.isActive(s, index)
            ? 'text-foreground font-bold'
            : 'text-muted-foreground font-medium') }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    (__VLS_ctx.fmt.scenarioFormatter.format(s.t));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex flex-0 items-center space-x-0" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-0']} */ ;
    var __VLS_14 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign(__assign({ 'onClick': {} }, { title: "Goto Time and Place" }), { class: "bg-muted/50" })));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { title: "Goto Time and Place" }), { class: "bg-muted/50" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
    var __VLS_19 = void 0;
    var __VLS_20 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.changeToState(s);
                // @ts-ignore
                [state, isActive, fmt, changeToState,];
            } });
    /** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
    var __VLS_21 = __VLS_17.slots.default;
    var __VLS_22 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconCrosshairsGps} */
    vue_mdi_1.IconCrosshairsGps;
    // @ts-ignore
    var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
    var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_27 = DotsMenu_vue_1.default;
    // @ts-ignore
    var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign({ 'onAction': {} }, { items: (__VLS_ctx.menuItems) })));
    var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { items: (__VLS_ctx.menuItems) })], __VLS_functionalComponentArgsRest(__VLS_28), false));
    var __VLS_32 = void 0;
    var __VLS_33 = ({ action: {} },
        { onAction: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onStateAction(index, $event);
                // @ts-ignore
                [menuItems, onStateAction,];
            } });
    // @ts-ignore
    [];
};
var __VLS_17, __VLS_18, __VLS_30, __VLS_31;
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.state)); _i < _b.length; _i++) {
    var _c = _b[_i], s = _c[0], index = _c[1];
    _loop_1(s, index);
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
