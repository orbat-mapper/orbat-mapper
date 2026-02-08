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
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var EditableLabel_vue_1 = require("@/components/EditableLabel.vue");
var uiStore_1 = require("@/stores/uiStore");
var ScenarioEventDropdownMenu_vue_1 = require("@/modules/scenarioeditor/ScenarioEventDropdownMenu.vue");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var selectedStore_1 = require("@/stores/selectedStore");
var ItemMedia_vue_1 = require("@/modules/scenarioeditor/ItemMedia.vue");
var ScrollTabs_vue_1 = require("@/components/ScrollTabs.vue");
var tabs_1 = require("@/components/ui/tabs");
var EditMetaForm_vue_1 = require("@/modules/scenarioeditor/EditMetaForm.vue");
var EditMediaForm_vue_1 = require("@/modules/scenarioeditor/EditMediaForm.vue");
var core_1 = require("@vueuse/core");
var DescriptionItem_vue_1 = require("@/components/DescriptionItem.vue");
var formatting_1 = require("@/composables/formatting");
var props = defineProps();
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).time, updateScenarioEvent = _a.updateScenarioEvent, onGoToScenarioEventEvent = _a.onGoToScenarioEventEvent;
var getModalTimestamp = (0, utils_1.injectStrict)(injects_1.timeModalKey).getModalTimestamp;
var title = (0, vue_1.ref)("");
var isEditMode = (0, vue_1.ref)(false);
var toggleEditMode = (0, core_1.useToggle)(isEditMode);
var isEditMediaMode = (0, vue_1.ref)(false);
var toggleEditMediaMode = (0, core_1.useToggle)(isEditMediaMode);
var _b = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), time = _b.time, store = _b.store;
var ui = (0, uiStore_1.useUiStore)();
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
var _c = (0, selectedStore_1.useSelectedItems)(), clearSelected = _c.clear, activeScenarioEventId = _c.activeScenarioEventId;
var scenarioEvent = (0, vue_1.computed)(function () { return time.getEventById(props.eventId); });
var formattedEventTime = (0, vue_1.computed)(function () {
    var _a, _b;
    return fmt.scenarioFormatter.format((_b = (_a = scenarioEvent.value) === null || _a === void 0 ? void 0 : _a.startTime) !== null && _b !== void 0 ? _b : 0);
});
var media = (0, vue_1.computed)(function () {
    var _a, _b;
    return (_b = (_a = scenarioEvent.value) === null || _a === void 0 ? void 0 : _a.media) === null || _b === void 0 ? void 0 : _b[0];
});
var tabList = (0, vue_1.computed)(function () {
    var base = [{ label: "Details", value: "0" }];
    if (ui.debugMode) {
        base.push({ label: "Debug", value: "1" });
    }
    return base;
});
var selectedTab = (0, vue_1.ref)("0");
(0, vue_1.watch)(function () { return props.eventId; }, function () {
    var _a, _b;
    title.value = (_b = (_a = scenarioEvent.value) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : "";
}, { immediate: true });
var hDescription = (0, vue_1.computed)(function () {
    return (0, formatting_1.renderMarkdown)(scenarioEvent.value.description || "");
});
function updateTitle(value) {
    updateScenarioEvent(props.eventId, { title: value });
}
function onAction(action) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, newTimestamp;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = action;
                    switch (_a) {
                        case "changeTime": return [3 /*break*/, 1];
                        case "delete": return [3 /*break*/, 3];
                        case "editMeta": return [3 /*break*/, 4];
                        case "editMedia": return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 6];
                case 1: return [4 /*yield*/, getModalTimestamp(scenarioEvent.value.startTime, {
                        timeZone: store.state.info.timeZone,
                        title: "Set scenario event time",
                    })];
                case 2:
                    newTimestamp = _b.sent();
                    if (newTimestamp !== undefined) {
                        updateScenarioEvent(props.eventId, { startTime: newTimestamp });
                    }
                    return [3 /*break*/, 6];
                case 3:
                    time.deleteScenarioEvent(props.eventId);
                    clearSelected();
                    return [3 /*break*/, 6];
                case 4:
                    toggleEditMode();
                    return [3 /*break*/, 6];
                case 5:
                    toggleEditMediaMode();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
onGoToScenarioEventEvent(function (_a) {
    var event = _a.event;
    if (event.id !== props.eventId) {
        activeScenarioEventId.value = event.id;
    }
});
function updateMedia(mediaUpdate) {
    if (!mediaUpdate)
        return;
    var _a = scenarioEvent.value.media, media = _a === void 0 ? [] : _a;
    var newMedia = __assign(__assign({}, media[0]), mediaUpdate);
    updateScenarioEvent(props.eventId, { media: [newMedia] });
    isEditMediaMode.value = false;
}
var onFormSubmit = function (eventUpdate) {
    updateScenarioEvent(props.eventId, eventUpdate);
    toggleEditMode();
};
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.scenarioEvent) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (__VLS_ctx.scenarioEvent.id) }, { class: "p-1" }));
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    if (__VLS_ctx.media) {
        var __VLS_0 = ItemMedia_vue_1.default;
        // @ts-ignore
        var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            media: (__VLS_ctx.media),
        }));
        var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
                media: (__VLS_ctx.media),
            }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "" }));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    var __VLS_5 = EditableLabel_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.title) })));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.title) })], __VLS_functionalComponentArgsRest(__VLS_6), false));
    var __VLS_10 = void 0;
    var __VLS_11 = ({ updateValue: {} },
        { onUpdateValue: (__VLS_ctx.updateTitle) });
    var __VLS_8;
    var __VLS_9;
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)(__assign({ class: "flex items-center justify-between" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.formattedEventTime);
    var __VLS_12 = ScenarioEventDropdownMenu_vue_1.default;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ 'onAction': {} })));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ 'onAction': {} })], __VLS_functionalComponentArgsRest(__VLS_13), false));
    var __VLS_17 = void 0;
    var __VLS_18 = ({ action: {} },
        { onAction: (__VLS_ctx.onAction) });
    var __VLS_15;
    var __VLS_16;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mx-4" }));
    /** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
    var __VLS_19 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        items: (__VLS_ctx.tabList),
        modelValue: (__VLS_ctx.selectedTab),
    }));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
            items: (__VLS_ctx.tabList),
            modelValue: (__VLS_ctx.selectedTab),
        }], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = __VLS_22.slots.default;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ value: "0" }, { class: "mx-4 pt-4" })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "mx-4 pt-4" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    var __VLS_30 = __VLS_28.slots.default;
    if (__VLS_ctx.isEditMode) {
        var __VLS_31 = EditMetaForm_vue_1.default;
        // @ts-ignore
        var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign(__assign({ 'onUpdate': {} }, { 'onCancel': {} }), { item: (__VLS_ctx.scenarioEvent) })));
        var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate': {} }, { 'onCancel': {} }), { item: (__VLS_ctx.scenarioEvent) })], __VLS_functionalComponentArgsRest(__VLS_32), false));
        var __VLS_36 = void 0;
        var __VLS_37 = ({ update: {} },
            { onUpdate: (__VLS_ctx.onFormSubmit) });
        var __VLS_38 = ({ cancel: {} },
            { onCancel: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.scenarioEvent))
                        return;
                    if (!(__VLS_ctx.isEditMode))
                        return;
                    __VLS_ctx.toggleEditMode();
                    // @ts-ignore
                    [scenarioEvent, scenarioEvent, scenarioEvent, media, media, title, updateTitle, formattedEventTime, onAction, tabList, selectedTab, isEditMode, onFormSubmit, toggleEditMode,];
                } });
        var __VLS_34;
        var __VLS_35;
    }
    else if (__VLS_ctx.isEditMediaMode) {
        var __VLS_39 = EditMediaForm_vue_1.default;
        // @ts-ignore
        var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign(__assign(__assign({ 'onCancel': {} }, { 'onUpdate': {} }), { media: (__VLS_ctx.media) }), { class: "" })));
        var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onCancel': {} }, { 'onUpdate': {} }), { media: (__VLS_ctx.media) }), { class: "" })], __VLS_functionalComponentArgsRest(__VLS_40), false));
        var __VLS_44 = void 0;
        var __VLS_45 = ({ cancel: {} },
            { onCancel: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.scenarioEvent))
                        return;
                    if (!!(__VLS_ctx.isEditMode))
                        return;
                    if (!(__VLS_ctx.isEditMediaMode))
                        return;
                    __VLS_ctx.toggleEditMediaMode();
                    // @ts-ignore
                    [media, isEditMediaMode, toggleEditMediaMode,];
                } });
        var __VLS_46 = ({ update: {} },
            { onUpdate: (__VLS_ctx.updateMedia) });
        /** @type {__VLS_StyleScopedClasses['']} */ ;
        var __VLS_42;
        var __VLS_43;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "" }));
        /** @type {__VLS_StyleScopedClasses['']} */ ;
        if (__VLS_ctx.scenarioEvent.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose prose-sm dark:prose-invert" }));
            __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.hDescription) }), null, null);
            /** @type {__VLS_StyleScopedClasses['prose']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
        }
        if (__VLS_ctx.scenarioEvent.externalUrl) {
            var __VLS_47 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
            // @ts-ignore
            var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47(__assign({ label: "External URL", ddClass: "truncate" }, { class: "mt-4" })));
            var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([__assign({ label: "External URL", ddClass: "truncate" }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_48), false));
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
            var __VLS_52 = __VLS_50.slots.default;
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign(__assign({ target: "_blank", draggable: "false" }, { class: "underline" }), { href: (__VLS_ctx.scenarioEvent.externalUrl) }));
            /** @type {__VLS_StyleScopedClasses['underline']} */ ;
            (__VLS_ctx.scenarioEvent.externalUrl);
            // @ts-ignore
            [scenarioEvent, scenarioEvent, scenarioEvent, scenarioEvent, updateMedia, hDescription,];
            var __VLS_50;
        }
    }
    // @ts-ignore
    [];
    var __VLS_28;
    if (__VLS_ctx.ui.debugMode) {
        var __VLS_53 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
        tabs_1.TabsContent;
        // @ts-ignore
        var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign({ value: "1" }, { class: "mx-4" })));
        var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ value: "1" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_54), false));
        /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
        var __VLS_58 = __VLS_56.slots.default;
        if (__VLS_ctx.ui.debugMode) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({});
            (__VLS_ctx.scenarioEvent);
        }
        // @ts-ignore
        [scenarioEvent, ui, ui,];
        var __VLS_56;
    }
    // @ts-ignore
    [];
    var __VLS_22;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
