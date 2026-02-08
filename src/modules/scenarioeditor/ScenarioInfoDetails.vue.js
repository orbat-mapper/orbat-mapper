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
var DescriptionItem_vue_1 = require("@/components/DescriptionItem.vue");
var PrimaryButton_vue_1 = require("@/components/PrimaryButton.vue");
var formatting_1 = require("@/composables/formatting");
var core_1 = require("@vueuse/core");
var PlainButton_vue_1 = require("@/components/PlainButton.vue");
var dayjs_1 = require("dayjs");
var RadioGroupList_vue_1 = require("@/components/RadioGroupList.vue");
var settingsStore_1 = require("@/stores/settingsStore");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var notifications_1 = require("@/composables/notifications");
var militaryTimeZones_1 = require("@/utils/militaryTimeZones");
var send = (0, notifications_1.useNotifications)().send;
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), store = _a.store, io = _a.io;
var getModalTimestamp = (0, utils_1.injectStrict)(injects_1.timeModalKey).getModalTimestamp;
var standardSettings = [
    {
        value: "2525",
        name: "MIL-STD-2525D",
        description: "US version",
    },
    {
        value: "app6",
        name: "APP-6",
        description: "NATO version",
    },
];
var TimezoneSelect = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/TimezoneSelect.vue"); }); });
var SimpleMarkdownInput = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/SimpleMarkdownInput.vue"); }); });
var settingsStore = (0, settingsStore_1.useSymbolSettingsStore)();
var state = store.state;
var isEditMode = (0, vue_1.ref)(false);
var toggleEditMode = (0, core_1.useToggle)(isEditMode);
var hDescription = (0, vue_1.computed)(function () { return (0, formatting_1.renderMarkdown)(state.info.description || ""); });
var form = (0, vue_1.ref)({
    name: "",
    description: "",
    startTime: 0,
    timeZone: "UTC",
    symbologyStandard: "2525",
});
(0, vue_1.watch)(isEditMode, function (v) {
    var _a = store.state.info, name = _a.name, description = _a.description, startTime = _a.startTime, timeZone = _a.timeZone, symbologyStandard = _a.symbologyStandard;
    form.value = {
        name: name,
        description: description,
        startTime: startTime,
        timeZone: timeZone,
        symbologyStandard: symbologyStandard,
    };
}, { immediate: true });
var computedStartTime = (0, vue_1.computed)(function () {
    try {
        return (0, dayjs_1.default)(form.value.startTime).tz((0, militaryTimeZones_1.resolveTimeZone)(form.value.timeZone || "UTC"));
    }
    catch (e) {
        return (0, dayjs_1.default)(form.value.startTime);
    }
});
function onDownload() {
    io.downloadAsJson();
}
function onSave() {
    io.saveToIndexedDb();
    send({ message: "Scenario saved to IndexedDB" });
}
function onLoad() {
    io.loadFromLocalStorage();
    send({ message: "Scenario loaded from local storage" });
}
function onFormSubmit() {
    var info = store.state.info;
    updateScenarioInfo(form.value);
    if (info.symbologyStandard)
        settingsStore.symbologyStandard = info.symbologyStandard;
    isEditMode.value = false;
}
function updateScenarioInfo(data) {
    store.update(function (s) {
        Object.assign(s.info, __assign({}, data));
    });
}
function openTimeModal() {
    return __awaiter(this, void 0, void 0, function () {
        var newTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getModalTimestamp(form.value.startTime, {
                        timeZone: form.value.timeZone,
                        title: "Set scenario start time",
                    })];
                case 1:
                    newTime = _a.sent();
                    if (newTime !== undefined) {
                        form.value.startTime = newTime;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
if (__VLS_ctx.isEditMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onFormSubmit) }, { class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    var __VLS_0 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SimpleMarkdownInput} */
    SimpleMarkdownInput;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        label: "Description",
        modelValue: (__VLS_ctx.form.description),
        description: "Use markdown syntax for formatting",
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            label: "Description",
            modelValue: (__VLS_ctx.form.description),
            description: "Use markdown syntax for formatting",
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        label: "Start time",
    }));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
            label: "Start time",
        }], __VLS_functionalComponentArgsRest(__VLS_6), false));
    var __VLS_10 = __VLS_8.slots.default;
    (__VLS_ctx.computedStartTime.format());
    var __VLS_11 = PlainButton_vue_1.default || PlainButton_vue_1.default;
    // @ts-ignore
    var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11(__assign({ 'onClick': {} }, { class: "ml-2" })));
    var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "ml-2" })], __VLS_functionalComponentArgsRest(__VLS_12), false));
    var __VLS_16 = void 0;
    var __VLS_17 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isEditMode))
                    return;
                __VLS_ctx.openTimeModal();
                // @ts-ignore
                [isEditMode, onFormSubmit, form, computedStartTime, openTimeModal,];
            } });
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    var __VLS_18 = __VLS_14.slots.default;
    // @ts-ignore
    [];
    var __VLS_14;
    var __VLS_15;
    // @ts-ignore
    [];
    var __VLS_8;
    var __VLS_19 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TimezoneSelect} */
    TimezoneSelect;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        label: "Time zone",
        modelValue: (__VLS_ctx.form.timeZone),
    }));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
            label: "Time zone",
            modelValue: (__VLS_ctx.form.timeZone),
        }], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = RadioGroupList_vue_1.default;
    // @ts-ignore
    var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        items: (__VLS_ctx.standardSettings),
        modelValue: (__VLS_ctx.form.symbologyStandard),
    }));
    var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{
            items: (__VLS_ctx.standardSettings),
            modelValue: (__VLS_ctx.form.symbologyStandard),
        }], __VLS_functionalComponentArgsRest(__VLS_25), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end space-x-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    var __VLS_29 = PrimaryButton_vue_1.default || PrimaryButton_vue_1.default;
    // @ts-ignore
    var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        type: "submit",
    }));
    var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
            type: "submit",
        }], __VLS_functionalComponentArgsRest(__VLS_30), false));
    var __VLS_34 = __VLS_32.slots.default;
    // @ts-ignore
    [form, form, standardSettings,];
    var __VLS_32;
    var __VLS_35 = PlainButton_vue_1.default || PlainButton_vue_1.default;
    // @ts-ignore
    var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign({ 'onClick': {} }, { type: "button" })));
    var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button" })], __VLS_functionalComponentArgsRest(__VLS_36), false));
    var __VLS_40 = void 0;
    var __VLS_41 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isEditMode))
                    return;
                __VLS_ctx.toggleEditMode();
                // @ts-ignore
                [toggleEditMode,];
            } });
    var __VLS_42 = __VLS_38.slots.default;
    // @ts-ignore
    [];
    var __VLS_38;
    var __VLS_39;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 p-0" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0']} */ ;
    var __VLS_43 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
    // @ts-ignore
    var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        label: "Description",
    }));
    var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
            label: "Description",
        }], __VLS_functionalComponentArgsRest(__VLS_44), false));
    var __VLS_48 = __VLS_46.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose-sm prose dark:prose-invert" }));
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.hDescription) }), null, null);
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
    // @ts-ignore
    [hDescription,];
    var __VLS_46;
    var __VLS_49 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
    // @ts-ignore
    var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        label: "Start time",
    }));
    var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([{
            label: "Start time",
        }], __VLS_functionalComponentArgsRest(__VLS_50), false));
    var __VLS_54 = __VLS_52.slots.default;
    (__VLS_ctx.computedStartTime.format());
    // @ts-ignore
    [computedStartTime,];
    var __VLS_52;
    var __VLS_55 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
    // @ts-ignore
    var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        label: "Time zone name",
    }));
    var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([{
            label: "Time zone name",
        }], __VLS_functionalComponentArgsRest(__VLS_56), false));
    var __VLS_60 = __VLS_58.slots.default;
    (__VLS_ctx.state.info.timeZone);
    // @ts-ignore
    [state,];
    var __VLS_58;
    var __VLS_61 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
    // @ts-ignore
    var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        label: "Symbology standard",
    }));
    var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([{
            label: "Symbology standard",
        }], __VLS_functionalComponentArgsRest(__VLS_62), false));
    var __VLS_66 = __VLS_64.slots.default;
    (__VLS_ctx.state.info.symbologyStandard);
    // @ts-ignore
    [state,];
    var __VLS_64;
    var __VLS_67 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
    // @ts-ignore
    var __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        label: "Number of units",
    }));
    var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([{
            label: "Number of units",
        }], __VLS_functionalComponentArgsRest(__VLS_68), false));
    var __VLS_72 = __VLS_70.slots.default;
    (Object.keys(__VLS_ctx.state.unitMap).length);
    // @ts-ignore
    [state,];
    var __VLS_70;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    var __VLS_73 = PlainButton_vue_1.default || PlainButton_vue_1.default;
    // @ts-ignore
    var __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73(__assign({ 'onClick': {} })));
    var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_74), false));
    var __VLS_78 = void 0;
    var __VLS_79 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.isEditMode))
                    return;
                __VLS_ctx.toggleEditMode();
                // @ts-ignore
                [toggleEditMode,];
            } });
    var __VLS_80 = __VLS_76.slots.default;
    // @ts-ignore
    [];
    var __VLS_76;
    var __VLS_77;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
