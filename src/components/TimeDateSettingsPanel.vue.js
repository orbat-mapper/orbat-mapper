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
var PanelHeading_vue_1 = require("@/components/PanelHeading.vue");
var HeadingDescription_vue_1 = require("@/components/HeadingDescription.vue");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var scenarioUtils_1 = require("@/composables/scenarioUtils");
var pinia_1 = require("pinia");
var AccordionPanel_vue_1 = require("@/components/AccordionPanel.vue");
var TimeDateSettingsDetails_vue_1 = require("@/components/TimeDateSettingsDetails.vue");
var store = (0, scenarioUtils_1.useActiveScenario)().store;
var currentTime = store.state.currentTime;
var _a = (0, pinia_1.storeToRefs)((0, timeFormatStore_1.useTimeFormatSettingsStore)()), track = _a.track, scenario = _a.scenario;
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = PanelHeading_vue_1.default || PanelHeading_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_3;
var __VLS_6 = HeadingDescription_vue_1.default || HeadingDescription_vue_1.default;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11 = __VLS_9.slots.default;
var __VLS_9;
var __VLS_12 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    label: "Scenario datetime format",
}));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{
        label: "Scenario datetime format",
    }], __VLS_functionalComponentArgsRest(__VLS_13), false));
var __VLS_17 = __VLS_15.slots.default;
{
    var __VLS_18 = __VLS_15.slots.closedContent;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground text-sm leading-7" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-7']} */ ;
    (__VLS_ctx.fmt.scenarioFormatter.format(__VLS_ctx.currentTime));
    // @ts-ignore
    [fmt, currentTime,];
}
var __VLS_19 = TimeDateSettingsDetails_vue_1.default;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    sampleTime: (__VLS_ctx.fmt.scenarioFormatter.format(__VLS_ctx.currentTime)),
    modelValue: (__VLS_ctx.scenario),
}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
        sampleTime: (__VLS_ctx.fmt.scenarioFormatter.format(__VLS_ctx.currentTime)),
        modelValue: (__VLS_ctx.scenario),
    }], __VLS_functionalComponentArgsRest(__VLS_20), false));
// @ts-ignore
[fmt, currentTime, scenario,];
var __VLS_15;
var __VLS_24 = AccordionPanel_vue_1.default || AccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    label: "Map format",
}));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{
        label: "Map format",
    }], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_29 = __VLS_27.slots.default;
{
    var __VLS_30 = __VLS_27.slots.closedContent;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground text-sm leading-7" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-7']} */ ;
    (__VLS_ctx.fmt.trackFormatter.format(__VLS_ctx.currentTime));
    // @ts-ignore
    [fmt, currentTime,];
}
var __VLS_31 = TimeDateSettingsDetails_vue_1.default;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    sampleTime: (__VLS_ctx.fmt.trackFormatter.format(__VLS_ctx.currentTime)),
    modelValue: (__VLS_ctx.track),
}));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{
        sampleTime: (__VLS_ctx.fmt.trackFormatter.format(__VLS_ctx.currentTime)),
        modelValue: (__VLS_ctx.track),
    }], __VLS_functionalComponentArgsRest(__VLS_32), false));
// @ts-ignore
[fmt, currentTime, track,];
var __VLS_27;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
