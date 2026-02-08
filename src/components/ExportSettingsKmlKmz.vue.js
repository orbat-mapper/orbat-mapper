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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var slider_1 = require("@/components/ui/slider");
var InputGroupTemplate_vue_1 = require("@/components/InputGroupTemplate.vue");
var NewAccordionPanel_vue_1 = require("@/components/NewAccordionPanel.vue");
var MRadioGroup_vue_1 = require("@/components/MRadioGroup.vue");
var InputRadio_vue_1 = require("@/components/InputRadio.vue");
var selectedStore_ts_1 = require("@/stores/selectedStore.ts");
var timeFormatStore_ts_1 = require("@/stores/timeFormatStore.ts");
var utils_1 = require("@/utils");
var injects_ts_1 = require("@/components/injects.ts");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var form = defineModel({ required: true });
var _b = (0, utils_1.injectStrict)(injects_ts_1.activeScenarioKey), store = _b.store, time = _b.time;
var fmt = (0, timeFormatStore_ts_1.useTimeFormatStore)();
var formattedTime = (0, vue_1.computed)(function () {
    return fmt.scenarioFormatter.format(+time.scenarioTime.value);
});
var isKml = (0, vue_1.computed)(function () { return props.format === "kml"; });
var isKmz = (0, vue_1.computed)(function () { return props.format === "kmz"; });
var selectedUnitIds = (0, selectedStore_ts_1.useSelectedItems)().selectedUnitIds;
var iconScale = (0, vue_1.computed)({
    get: function () { var _a; return [(_a = form.value.iconScale) !== null && _a !== void 0 ? _a : 1]; },
    set: function (_a) {
        var value = _a[0];
        form.value.iconScale = value;
    },
});
var labelScale = (0, vue_1.computed)({
    get: function () { var _a; return [(_a = form.value.labelScale) !== null && _a !== void 0 ? _a : 1]; },
    set: function (_a) {
        var value = _a[0];
        form.value.labelScale = value;
    },
});
var events = (0, vue_1.computed)(function () {
    return store.state.events
        .map(function (e) { return store.state.eventMap[e]; })
        .sort(function (a, b) { return (a.startTime < b.startTime ? -1 : 1); })
        .map(function (e) { return ({
        label: "".concat(fmt.scenarioFormatter.format(e.startTime), " - ").concat(e.title),
        value: e.id,
    }); });
});
if (!events.value.some(function (e) { return e.value === form.value.exportEventId; })) {
    form.value.exportEventId = (_a = events.value[0]) === null || _a === void 0 ? void 0 : _a.value;
}
if (!Array.isArray(form.value.exportEventIds)) {
    form.value.exportEventIds = [];
}
else {
    form.value.exportEventIds = form.value.exportEventIds.filter(function (id) {
        return events.value.some(function (e) { return e.value === id; });
    });
}
function toggleAllEvents() {
    if (form.value.exportEventIds.length === events.value.length) {
        form.value.exportEventIds = [];
    }
    else {
        form.value.exportEventIds = events.value.map(function (e) { return e.value; });
    }
}
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-1 gap-8 sm:grid-cols-2" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
var __VLS_0 = InputCheckbox_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "Include units",
    description: "Units with a location at current scenario time",
    modelValue: (__VLS_ctx.form.includeUnits),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: "Include units",
        description: "Units with a location at current scenario time",
        modelValue: (__VLS_ctx.form.includeUnits),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
if (__VLS_ctx.form.includeUnits) {
    var __VLS_5 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        label: ("Include selected units only (".concat(__VLS_ctx.selectedUnitIds.size, ")")),
        description: "Selected units with a location",
        modelValue: (__VLS_ctx.form.includeSelectedUnitsOnly),
    }));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
            label: ("Include selected units only (".concat(__VLS_ctx.selectedUnitIds.size, ")")),
            description: "Selected units with a location",
            modelValue: (__VLS_ctx.form.includeSelectedUnitsOnly),
        }], __VLS_functionalComponentArgsRest(__VLS_6), false));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({});
}
var __VLS_10 = InputCheckbox_vue_1.default;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    label: "Include scenario features",
    modelValue: (__VLS_ctx.form.includeFeatures),
    description: "",
}));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{
        label: "Include scenario features",
        modelValue: (__VLS_ctx.form.includeFeatures),
        description: "",
    }], __VLS_functionalComponentArgsRest(__VLS_11), false));
if (__VLS_ctx.isKml || __VLS_ctx.isKmz) {
    var __VLS_15 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        label: "Use short unit names",
        modelValue: (__VLS_ctx.form.useShortName),
    }));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
            label: "Use short unit names",
            modelValue: (__VLS_ctx.form.useShortName),
        }], __VLS_functionalComponentArgsRest(__VLS_16), false));
}
if (__VLS_ctx.isKmz) {
    var __VLS_20 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        label: "Include unit icons",
        modelValue: (__VLS_ctx.form.embedIcons),
        description: "Embed icons as images",
    }));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
            label: "Include unit icons",
            modelValue: (__VLS_ctx.form.embedIcons),
            description: "Embed icons as images",
        }], __VLS_functionalComponentArgsRest(__VLS_21), false));
}
var __VLS_25 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ class: "col-span-full" }, { label: "Folder settings" })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ class: "col-span-full" }, { label: "Folder settings" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
/** @type {__VLS_StyleScopedClasses['col-span-full']} */ ;
var __VLS_30 = __VLS_28.slots.default;
var __VLS_31 = MRadioGroup_vue_1.default || MRadioGroup_vue_1.default;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ class: "mt-4 sm:flex sm:gap-6" })));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ class: "mt-4 sm:flex sm:gap-6" })], __VLS_functionalComponentArgsRest(__VLS_32), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:gap-6']} */ ;
var __VLS_36 = __VLS_34.slots.default;
var __VLS_37 = InputRadio_vue_1.default || InputRadio_vue_1.default;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    modelValue: (__VLS_ctx.form.folderMode),
    value: "one",
}));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.form.folderMode),
        value: "one",
    }], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_42 = __VLS_40.slots.default;
// @ts-ignore
[form, form, form, form, form, form, form, selectedUnitIds, isKml, isKmz, isKmz,];
var __VLS_40;
var __VLS_43 = InputRadio_vue_1.default || InputRadio_vue_1.default;
// @ts-ignore
var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    modelValue: (__VLS_ctx.form.folderMode),
    value: "side",
}));
var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.form.folderMode),
        value: "side",
    }], __VLS_functionalComponentArgsRest(__VLS_44), false));
var __VLS_48 = __VLS_46.slots.default;
// @ts-ignore
[form,];
var __VLS_46;
var __VLS_49 = InputRadio_vue_1.default || InputRadio_vue_1.default;
// @ts-ignore
var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    modelValue: (__VLS_ctx.form.folderMode),
    value: "sideGroup",
}));
var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.form.folderMode),
        value: "sideGroup",
    }], __VLS_functionalComponentArgsRest(__VLS_50), false));
var __VLS_54 = __VLS_52.slots.default;
// @ts-ignore
[form,];
var __VLS_52;
// @ts-ignore
[];
var __VLS_34;
// @ts-ignore
[];
var __VLS_28;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2" }));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
var __VLS_55 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
// @ts-ignore
var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    label: "Label scale",
}));
var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([{
        label: "Label scale",
    }], __VLS_functionalComponentArgsRest(__VLS_56), false));
var __VLS_60 = __VLS_58.slots.default;
var __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.Slider} */
slider_1.Slider;
// @ts-ignore
var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61(__assign({ modelValue: (__VLS_ctx.labelScale), min: (0), max: (2), step: (0.1) }, { class: "mt-4" })));
var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.labelScale), min: (0), max: (2), step: (0.1) }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_62), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
{
    var __VLS_66 = __VLS_58.slots.description;
    // @ts-ignore
    [labelScale,];
}
{
    var __VLS_67 = __VLS_58.slots.hint;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.form.labelScale);
    // @ts-ignore
    [form,];
}
// @ts-ignore
[];
var __VLS_58;
var __VLS_68 = InputGroupTemplate_vue_1.default || InputGroupTemplate_vue_1.default;
// @ts-ignore
var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
    label: "Icon scale",
}));
var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([{
        label: "Icon scale",
    }], __VLS_functionalComponentArgsRest(__VLS_69), false));
var __VLS_73 = __VLS_71.slots.default;
var __VLS_74;
/** @ts-ignore @type {typeof __VLS_components.Slider} */
slider_1.Slider;
// @ts-ignore
var __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74(__assign({ modelValue: (__VLS_ctx.iconScale), min: (0.5), max: (3), step: (0.1) }, { class: "mt-4" })));
var __VLS_76 = __VLS_75.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.iconScale), min: (0.5), max: (3), step: (0.1) }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_75), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
{
    var __VLS_79 = __VLS_71.slots.description;
    // @ts-ignore
    [iconScale,];
}
{
    var __VLS_80 = __VLS_71.slots.hint;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.form.iconScale);
    // @ts-ignore
    [form,];
}
// @ts-ignore
[];
var __VLS_71;
var __VLS_81 = NewAccordionPanel_vue_1.default || NewAccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
    label: "Time mode",
    defaultOpen: true,
}));
var __VLS_83 = __VLS_82.apply(void 0, __spreadArray([{
        label: "Time mode",
        defaultOpen: true,
    }], __VLS_functionalComponentArgsRest(__VLS_82), false));
var __VLS_86 = __VLS_84.slots.default;
var __VLS_87 = MRadioGroup_vue_1.default || MRadioGroup_vue_1.default;
// @ts-ignore
var __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87(__assign({ class: "mt-2 sm:flex sm:gap-6" })));
var __VLS_89 = __VLS_88.apply(void 0, __spreadArray([__assign({ class: "mt-2 sm:flex sm:gap-6" })], __VLS_functionalComponentArgsRest(__VLS_88), false));
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:gap-6']} */ ;
var __VLS_92 = __VLS_90.slots.default;
var __VLS_93 = InputRadio_vue_1.default || InputRadio_vue_1.default;
// @ts-ignore
var __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
    modelValue: (__VLS_ctx.form.timeMode),
    value: "current",
}));
var __VLS_95 = __VLS_94.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.form.timeMode),
        value: "current",
    }], __VLS_functionalComponentArgsRest(__VLS_94), false));
var __VLS_98 = __VLS_96.slots.default;
(__VLS_ctx.formattedTime);
// @ts-ignore
[form, formattedTime,];
var __VLS_96;
var __VLS_99 = InputRadio_vue_1.default || InputRadio_vue_1.default;
// @ts-ignore
var __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    modelValue: (__VLS_ctx.form.timeMode),
    value: "event",
}));
var __VLS_101 = __VLS_100.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.form.timeMode),
        value: "event",
    }], __VLS_functionalComponentArgsRest(__VLS_100), false));
var __VLS_104 = __VLS_102.slots.default;
// @ts-ignore
[form,];
var __VLS_102;
var __VLS_105 = InputRadio_vue_1.default || InputRadio_vue_1.default;
// @ts-ignore
var __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    modelValue: (__VLS_ctx.form.timeMode),
    value: "multiple",
}));
var __VLS_107 = __VLS_106.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.form.timeMode),
        value: "multiple",
    }], __VLS_functionalComponentArgsRest(__VLS_106), false));
var __VLS_110 = __VLS_108.slots.default;
// @ts-ignore
[form,];
var __VLS_108;
// @ts-ignore
[];
var __VLS_90;
if (__VLS_ctx.form.timeMode === 'event') {
    var __VLS_111 = SimpleSelect_vue_1.default;
    // @ts-ignore
    var __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111(__assign({ class: "mt-4" }, { label: "Select event", items: (__VLS_ctx.events), modelValue: (__VLS_ctx.form.exportEventId) })));
    var __VLS_113 = __VLS_112.apply(void 0, __spreadArray([__assign({ class: "mt-4" }, { label: "Select event", items: (__VLS_ctx.events), modelValue: (__VLS_ctx.form.exportEventId) })], __VLS_functionalComponentArgsRest(__VLS_112), false));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
}
else if (__VLS_ctx.form.timeMode === 'multiple') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 space-y-2" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-4" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    var __VLS_116 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116(__assign({ 'onClick': {} }, { type: "button", variant: "outline", size: "sm" })));
    var __VLS_118 = __VLS_117.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_117), false));
    var __VLS_121 = void 0;
    var __VLS_122 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.form.timeMode === 'event'))
                    return;
                if (!(__VLS_ctx.form.timeMode === 'multiple'))
                    return;
                __VLS_ctx.toggleAllEvents();
                // @ts-ignore
                [form, form, form, events, toggleAllEvents,];
            } });
    var __VLS_123 = __VLS_119.slots.default;
    // @ts-ignore
    [];
    var __VLS_119;
    var __VLS_120;
    var __VLS_124 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
        label: "Use radio folder",
        modelValue: (__VLS_ctx.form.useRadioFolder),
        description: "Only one event visible at a time",
    }));
    var __VLS_126 = __VLS_125.apply(void 0, __spreadArray([{
            label: "Use radio folder",
            modelValue: (__VLS_ctx.form.useRadioFolder),
            description: "Only one event visible at a time",
        }], __VLS_functionalComponentArgsRest(__VLS_125), false));
    for (var _i = 0, _c = __VLS_vFor((__VLS_ctx.events)); _i < _c.length; _i++) {
        var e = _c[_i][0];
        var __VLS_129 = InputCheckbox_vue_1.default;
        // @ts-ignore
        var __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
            key: (e.value),
            label: (e.label),
            value: (e.value),
            modelValue: (__VLS_ctx.form.exportEventIds),
        }));
        var __VLS_131 = __VLS_130.apply(void 0, __spreadArray([{
                key: (e.value),
                label: (e.label),
                value: (e.value),
                modelValue: (__VLS_ctx.form.exportEventIds),
            }], __VLS_functionalComponentArgsRest(__VLS_130), false));
        // @ts-ignore
        [form, form, events,];
    }
}
// @ts-ignore
[];
var __VLS_84;
if (__VLS_ctx.isKmz) {
    var __VLS_134 = NewAccordionPanel_vue_1.default || NewAccordionPanel_vue_1.default;
    // @ts-ignore
    var __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
        label: "Advanced settings",
        defaultOpen: true,
    }));
    var __VLS_136 = __VLS_135.apply(void 0, __spreadArray([{
            label: "Advanced settings",
            defaultOpen: true,
        }], __VLS_functionalComponentArgsRest(__VLS_135), false));
    var __VLS_139 = __VLS_137.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-1 gap-8 sm:grid-cols-2" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    var __VLS_140 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
        label: "Draw symbol outline",
        modelValue: (__VLS_ctx.form.drawSymbolOutline),
        description: "Improves visibility",
    }));
    var __VLS_142 = __VLS_141.apply(void 0, __spreadArray([{
            label: "Draw symbol outline",
            modelValue: (__VLS_ctx.form.drawSymbolOutline),
            description: "Improves visibility",
        }], __VLS_functionalComponentArgsRest(__VLS_141), false));
    var __VLS_145 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
        label: "Render symbol amplifiers",
        modelValue: (__VLS_ctx.form.renderAmplifiers),
        description: "Warning: will increase file size",
    }));
    var __VLS_147 = __VLS_146.apply(void 0, __spreadArray([{
            label: "Render symbol amplifiers",
            modelValue: (__VLS_ctx.form.renderAmplifiers),
            description: "Warning: will increase file size",
        }], __VLS_functionalComponentArgsRest(__VLS_146), false));
    // @ts-ignore
    [form, form, isKmz,];
    var __VLS_137;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
