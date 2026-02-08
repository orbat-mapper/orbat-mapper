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
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var InputGroupTemplate_vue_1 = require("@/components/InputGroupTemplate.vue");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var form = defineModel({ required: true });
var state = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store.state;
form.value.scenarioName = state.info.name;
var sides = (0, vue_1.computed)(function () {
    return state.sides.map(function (id) { return state.sideMap[id]; });
});
function toggleSide(sideId) {
    var _a;
    var groups = state.sideMap[sideId].groups;
    if (form.value.sideGroups.some(function (g) { return groups.includes(g); })) {
        form.value.sideGroups = form.value.sideGroups.filter(function (g) { return !groups.includes(g); });
    }
    else {
        (_a = form.value.sideGroups).push.apply(_a, groups);
    }
}
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "prose prose-sm dark:prose-invert" }));
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)(__assign({ class: "flex flex-col gap-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_0 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "Select which side groups you want to export",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: "Select which side groups you want to export",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "divide-y" }));
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
var _loop_1 = function (v) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-4 gap-4 py-3" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleSide(v.id);
            // @ts-ignore
            [sides, toggleSide,];
        } }, { type: "button" }), { class: "flex text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (v.name);
    for (var _b = 0, _c = __VLS_vFor((v.groups)); _b < _c.length; _b++) {
        var g = _c[_b][0];
        var __VLS_6 = InputCheckbox_vue_1.default;
        // @ts-ignore
        var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            label: (__VLS_ctx.state.sideGroupMap[g].name),
            value: (g),
            key: (g),
            modelValue: (__VLS_ctx.form.sideGroups),
        }));
        var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{
                label: (__VLS_ctx.state.sideGroupMap[g].name),
                value: (g),
                key: (g),
                modelValue: (__VLS_ctx.form.sideGroups),
            }], __VLS_functionalComponentArgsRest(__VLS_7), false));
        // @ts-ignore
        [state, form,];
    }
    // @ts-ignore
    [];
};
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.sides)); _i < _a.length; _i++) {
    var v = _a[_i][0];
    _loop_1(v);
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_11 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    label: "Scenario name",
    modelValue: (__VLS_ctx.form.scenarioName),
}));
var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{
        label: "Scenario name",
        modelValue: (__VLS_ctx.form.scenarioName),
    }], __VLS_functionalComponentArgsRest(__VLS_12), false));
var __VLS_16 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    label: "Name of downloaded file",
    modelValue: (__VLS_ctx.form.fileName),
}));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([{
        label: "Name of downloaded file",
        modelValue: (__VLS_ctx.form.fileName),
    }], __VLS_functionalComponentArgsRest(__VLS_17), false));
// @ts-ignore
[form, form,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
