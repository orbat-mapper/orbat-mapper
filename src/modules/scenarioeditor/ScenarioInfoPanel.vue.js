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
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var EditableLabel_vue_1 = require("@/components/EditableLabel.vue");
var ScenarioInfoDetails_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoDetails.vue");
var ScrollTabs_vue_1 = require("@/components/ScrollTabs.vue");
var tabs_1 = require("@/components/ui/tabs");
var scenarioInfoPanelStore_1 = require("@/stores/scenarioInfoPanelStore");
var store = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store;
var state = store.state;
var scenarioName = (0, vue_1.ref)("");
var panelStore = (0, scenarioInfoPanelStore_1.useScenarioInfoPanelStore)();
(0, vue_1.watch)(function () { return state.info.name; }, function (v) { return (scenarioName.value = v); }, { immediate: true });
var tabList = [{ label: "Details", value: "0" }];
var selectedTabString = (0, vue_1.computed)({
    get: function () { return panelStore.tabIndex.toString(); },
    set: function (v) {
        panelStore.tabIndex = Number(v);
    },
});
function updateScenarioInfo(data) {
    store.update(function (s) {
        Object.assign(s.info, __assign({}, data));
    });
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "pr-4" }));
/** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
var __VLS_0 = EditableLabel_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.scenarioName) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.scenarioName) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ updateValue: {} },
    { onUpdateValue: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.updateScenarioInfo({ name: $event });
            // @ts-ignore
            [scenarioName, updateScenarioInfo,];
        } });
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mx-4" }));
/** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
var __VLS_7 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    items: (__VLS_ctx.tabList),
    modelValue: (__VLS_ctx.selectedTabString),
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.tabList),
        modelValue: (__VLS_ctx.selectedTabString),
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ value: "0" }, { class: "mx-4 pt-4" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "mx-4 pt-4" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
var __VLS_18 = __VLS_16.slots.default;
var __VLS_19 = ScenarioInfoDetails_vue_1.default;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ class: "" })));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ class: "" })], __VLS_functionalComponentArgsRest(__VLS_20), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
// @ts-ignore
[tabList, selectedTabString,];
var __VLS_16;
// @ts-ignore
[];
var __VLS_10;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
