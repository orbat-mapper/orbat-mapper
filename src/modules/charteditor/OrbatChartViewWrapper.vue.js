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
var scenariostore_1 = require("@/scenariostore");
var vue_router_1 = require("vue-router");
var OrbatChartView_vue_1 = require("@/modules/charteditor/OrbatChartView.vue");
var _a = (0, scenariostore_1.useScenario)(), scenario = _a.scenario, isReady = _a.isReady;
var route = (0, vue_router_1.useRoute)();
scenario.value.io.loadDemoScenario("falkland82");
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.isReady) {
    var __VLS_0 = OrbatChartView_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        key: (__VLS_ctx.scenario.store.state.id),
        activeScenario: (__VLS_ctx.scenario),
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            key: (__VLS_ctx.scenario.store.state.id),
            activeScenario: (__VLS_ctx.scenario),
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = {};
    var __VLS_3;
}
// @ts-ignore
[isReady, scenario, scenario,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
