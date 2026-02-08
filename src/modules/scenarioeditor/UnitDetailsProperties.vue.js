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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var PropertyInput_vue_1 = require("@/components/PropertyInput.vue");
var vue_1 = require("vue");
var props = defineProps();
var showMax = (0, vue_1.ref)(false);
var showAverage = (0, vue_1.ref)(false);
var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var unitActions = activeScenario.unitActions, store = activeScenario.store;
var maxSpeed = (0, vue_1.computed)(function () {
    var _a;
    var v = (_a = props.unit.properties) === null || _a === void 0 ? void 0 : _a.maxSpeed;
    if (v === undefined)
        return "Not set";
    return formatSpeed(v);
});
var averageSpeed = (0, vue_1.computed)(function () {
    var _a;
    var v = (_a = props.unit.properties) === null || _a === void 0 ? void 0 : _a.averageSpeed;
    if (v === undefined)
        return "Not set";
    return formatSpeed(v);
});
function formatSpeed(_a) {
    var value = _a.value, uom = _a.uom;
    switch (uom) {
        case "km/h":
            return value.toFixed(1) + " km/h";
        case "knots":
            return value.toFixed(1) + " knots";
        case "mph":
            return value.toFixed(1) + " mph";
        case "ft/s":
            return value.toFixed(1) + " ft/s";
        default:
            return value.toFixed(1) + " m/s";
    }
}
function updateMaxSpeed(data) {
    showMax.value = false;
    // @ts-ignore
    if (isNaN(data.value))
        return;
    if (data.value === null || data.value === "" || data.value === undefined) {
        unitActions.updateUnitProperties(props.unit.id, {
            maxSpeed: undefined,
        });
        return;
    }
    unitActions.updateUnitProperties(props.unit.id, {
        maxSpeed: data,
    });
}
function updateAverageSpeed(data) {
    showAverage.value = false;
    // @ts-ignore
    if (isNaN(data.value))
        return;
    if (data.value === null || data.value === "" || data.value === undefined) {
        unitActions.updateUnitProperties(props.unit.id, {
            averageSpeed: undefined,
        });
        return;
    }
    else {
        unitActions.updateUnitProperties(props.unit.id, {
            averageSpeed: data,
        });
    }
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "prose text-foreground dark:prose-invert mt-4" }));
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)(__assign({ class: "divide-border w-full divide-y" }));
/** @type {__VLS_StyleScopedClasses['divide-border']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ class: "w-36" }));
/** @type {__VLS_StyleScopedClasses['w-36']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)(__assign({ class: "divide-border divide-y" }));
/** @type {__VLS_StyleScopedClasses['divide-border']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showAverage = true;
        // @ts-ignore
        [showAverage,];
    } }, { class: "flex cursor-pointer items-center justify-start" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
if (!__VLS_ctx.isLocked && __VLS_ctx.showAverage) {
    var __VLS_0 = PropertyInput_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onUpdateValue': {} }, { class: "w-32" }), { property: ((_a = props.unit.properties) === null || _a === void 0 ? void 0 : _a.averageSpeed) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdateValue': {} }, { class: "w-32" }), { property: ((_b = props.unit.properties) === null || _b === void 0 ? void 0 : _b.averageSpeed) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ updateValue: {} },
        { onUpdateValue: (__VLS_ctx.updateAverageSpeed) });
    /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
    var __VLS_3;
    var __VLS_4;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.averageSpeed);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showMax = true;
        // @ts-ignore
        [showAverage, isLocked, updateAverageSpeed, averageSpeed, showMax,];
    } }, { class: "flex cursor-pointer items-center justify-start" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
if (!__VLS_ctx.isLocked && __VLS_ctx.showMax) {
    var __VLS_7 = PropertyInput_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onUpdateValue': {} }, { class: "w-32" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onUpdateValue': {} }, { class: "w-32" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    var __VLS_12 = void 0;
    var __VLS_13 = ({ updateValue: {} },
        { onUpdateValue: (__VLS_ctx.updateMaxSpeed) });
    /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
    var __VLS_10;
    var __VLS_11;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.maxSpeed);
}
// @ts-ignore
[isLocked, showMax, updateMaxSpeed, maxSpeed,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
