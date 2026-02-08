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
var core_1 = require("@vueuse/core");
var PrimaryButton_vue_1 = require("./PrimaryButton.vue");
var InputGroup_vue_1 = require("./InputGroup.vue");
var DescriptionItem_vue_1 = require("./DescriptionItem.vue");
var scenarioTime_1 = require("@/composables/scenarioTime");
var helpers_1 = require("@/components/helpers");
var ScenarioEventsPanel_vue_1 = require("@/modules/scenarioeditor/ScenarioEventsPanel.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var NewSimpleModal_vue_1 = require("@/components/NewSimpleModal.vue");
var tabs_1 = require("@/components/ui/tabs");
var props = withDefaults(defineProps(), {
    dialogTitle: "Set scenario date and time",
    timestamp: 386467200000,
    modelValue: false,
    timeZone: "UTC",
});
var emit = defineEmits(["update:timestamp", "cancel"]);
var focusId = (0, helpers_1.useFocusOnMount)(undefined, 150).focusId;
var open = defineModel();
var enabled = (0, core_1.useStorage)("utc-mode", false);
var isLocal = (0, vue_1.computed)(function () { return !enabled.value; });
var _a = (0, scenarioTime_1.useDateElements)({
    timestamp: props.timestamp,
    isLocal: isLocal,
    timeZone: props.timeZone,
}), date = _a.date, hour = _a.hour, minute = _a.minute, resDateTime = _a.resDateTime;
var updateTime = function () {
    emit("update:timestamp", resDateTime.value.valueOf());
    open.value = false;
};
function onEventClick(event) {
    emit("update:timestamp", event.startTime);
    open.value = false;
}
var __VLS_modelEmit;
var __VLS_defaults = {
    dialogTitle: "Set scenario date and time",
    timestamp: 386467200000,
    modelValue: false,
    timeZone: "UTC",
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = NewSimpleModal_vue_1.default || NewSimpleModal_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), dialogTitle: (__VLS_ctx.dialogTitle) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), dialogTitle: (__VLS_ctx.dialogTitle) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ cancel: {} },
    { onCancel: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('cancel');
            // @ts-ignore
            [open, dialogTitle, emit,];
        } });
var __VLS_7 = {};
var __VLS_8 = __VLS_3.slots.default;
var __VLS_9;
/** @ts-ignore @type {typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
tabs_1.Tabs;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9(__assign({ class: "" }, { defaultValue: "time" })));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign({ class: "" }, { defaultValue: "time" })], __VLS_functionalComponentArgsRest(__VLS_10), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_14 = __VLS_12.slots.default;
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
tabs_1.TabsList;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ class: "w-full" })));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_20 = __VLS_18.slots.default;
var __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
tabs_1.TabsTrigger;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign({ value: "time" }, { class: "" })));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign({ value: "time" }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_22), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_26 = __VLS_24.slots.default;
// @ts-ignore
[];
var __VLS_24;
var __VLS_27;
/** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
tabs_1.TabsTrigger;
// @ts-ignore
var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign({ value: "events" }, { class: "" })));
var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ value: "events" }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_32 = __VLS_30.slots.default;
// @ts-ignore
[];
var __VLS_30;
// @ts-ignore
[];
var __VLS_18;
var __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    value: "time",
}));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([{
        value: "time",
    }], __VLS_functionalComponentArgsRest(__VLS_34), false));
var __VLS_38 = __VLS_36.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.updateTime) }, { class: "mt-4 space-y-6" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
var __VLS_39 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
// @ts-ignore
var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    label: "Time zone name",
}));
var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([{
        label: "Time zone name",
    }], __VLS_functionalComponentArgsRest(__VLS_40), false));
var __VLS_44 = __VLS_42.slots.default;
(__VLS_ctx.timeZone);
// @ts-ignore
[updateTime, timeZone,];
var __VLS_42;
var __VLS_45 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    modelValue: (__VLS_ctx.enabled),
}));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.enabled),
    }], __VLS_functionalComponentArgsRest(__VLS_46), false));
var __VLS_50 = __VLS_48.slots.default;
// @ts-ignore
[enabled,];
var __VLS_48;
var __VLS_51 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    id: (__VLS_ctx.focusId),
    label: "Date",
    type: "date",
    modelValue: (__VLS_ctx.date),
}));
var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([{
        id: (__VLS_ctx.focusId),
        label: "Date",
        type: "date",
        modelValue: (__VLS_ctx.date),
    }], __VLS_functionalComponentArgsRest(__VLS_52), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex space-x-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
var __VLS_56 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    label: "Hour",
    modelValue: (__VLS_ctx.hour),
    type: "number",
    min: "0",
    max: "23",
}));
var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([{
        label: "Hour",
        modelValue: (__VLS_ctx.hour),
        type: "number",
        min: "0",
        max: "23",
    }], __VLS_functionalComponentArgsRest(__VLS_57), false));
var __VLS_61 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
    label: "Minute",
    modelValue: (__VLS_ctx.minute),
    type: "number",
    min: "0",
    max: "59",
}));
var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([{
        label: "Minute",
        modelValue: (__VLS_ctx.minute),
        type: "number",
        min: "0",
        max: "59",
    }], __VLS_functionalComponentArgsRest(__VLS_62), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground font-mono" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
(__VLS_ctx.resDateTime.format());
var __VLS_66 = PrimaryButton_vue_1.default || PrimaryButton_vue_1.default;
// @ts-ignore
var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66(__assign({ type: "submit" }, { class: "" })));
var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([__assign({ type: "submit" }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_67), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_71 = __VLS_69.slots.default;
// @ts-ignore
[focusId, date, hour, minute, resDateTime,];
var __VLS_69;
// @ts-ignore
[];
var __VLS_36;
var __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
    value: "events",
}));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([{
        value: "events",
    }], __VLS_functionalComponentArgsRest(__VLS_73), false));
var __VLS_77 = __VLS_75.slots.default;
var __VLS_78 = ScenarioEventsPanel_vue_1.default;
// @ts-ignore
var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78(__assign({ 'onEventClick': {} }, { selectOnly: true, hideDropdown: true })));
var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([__assign({ 'onEventClick': {} }, { selectOnly: true, hideDropdown: true })], __VLS_functionalComponentArgsRest(__VLS_79), false));
var __VLS_83;
var __VLS_84 = ({ eventClick: {} },
    { onEventClick: (__VLS_ctx.onEventClick) });
var __VLS_81;
var __VLS_82;
// @ts-ignore
[onEventClick,];
var __VLS_75;
// @ts-ignore
[];
var __VLS_12;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
