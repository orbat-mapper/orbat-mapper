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
var dragStore_1 = require("@/stores/dragStore");
var injects_1 = require("@/components/injects");
var browserScenarios_1 = require("@/composables/browserScenarios");
var lucide_vue_next_1 = require("lucide-vue-next");
var utils_1 = require("@/utils");
var MapTimeController_vue_1 = require("@/components/MapTimeController.vue");
var MapEditorMainToolbar_vue_1 = require("@/modules/scenarioeditor/MapEditorMainToolbar.vue");
var mainToolbarStore_1 = require("@/stores/mainToolbarStore");
var MapEditorMeasurementToolbar_vue_1 = require("@/modules/scenarioeditor/MapEditorMeasurementToolbar.vue");
var ScenarioMap_vue_1 = require("@/components/ScenarioMap.vue");
var MapEditorDrawToolbar_vue_1 = require("@/modules/scenarioeditor/MapEditorDrawToolbar.vue");
var core_1 = require("@vueuse/core");
var KeyboardScenarioActions_vue_1 = require("@/modules/scenarioeditor/KeyboardScenarioActions.vue");
var ScenarioFeatureDetails_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureDetails.vue");
var MapEditorMobilePanel_vue_1 = require("@/modules/scenarioeditor/MapEditorMobilePanel.vue");
var MapEditorDesktopPanel_vue_1 = require("@/modules/scenarioeditor/MapEditorDesktopPanel.vue");
var MapEditorDetailsPanel_vue_1 = require("@/modules/scenarioeditor/MapEditorDetailsPanel.vue");
var uiStore_1 = require("@/stores/uiStore");
var helpers_1 = require("@/components/helpers");
var vue_global_events_1 = require("vue-global-events");
var SearchScenarioActions_vue_1 = require("@/modules/scenarioeditor/SearchScenarioActions.vue");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var solid_1 = require("@heroicons/vue/24/solid");
var ScenarioEventDetails_vue_1 = require("@/modules/scenarioeditor/ScenarioEventDetails.vue");
var selectedStore_1 = require("@/stores/selectedStore");
var ScenarioMapLayerDetails_vue_1 = require("@/modules/scenarioeditor/ScenarioMapLayerDetails.vue");
var UnitDetails_vue_1 = require("@/modules/scenarioeditor/UnitDetails.vue");
var ScenarioInfoPanel_vue_1 = require("@/modules/scenarioeditor/ScenarioInfoPanel.vue");
var ScenarioTimeline_vue_1 = require("@/modules/scenarioeditor/ScenarioTimeline.vue");
var MapEditorUnitTrackToolbar_vue_1 = require("@/modules/scenarioeditor/MapEditorUnitTrackToolbar.vue");
var pinia_1 = require("pinia");
var playbackStore_1 = require("@/stores/playbackStore");
var UnitBreadcrumbs_vue_1 = require("@/modules/scenarioeditor/UnitBreadcrumbs.vue");
var button_1 = require("@/components/ui/button");
var DecryptScenarioModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/DecryptScenarioModal.vue"); }); });
var emit = defineEmits(["showExport", "showLoad", "show-settings"]);
var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var getModalTimestamp = (0, utils_1.injectStrict)(injects_1.timeModalKey).getModalTimestamp;
var state = activeScenario.store.state;
var _a = activeScenario.time, setCurrentTime = _a.setCurrentTime, add = _a.add, subtract = _a.subtract, goToNextScenarioEvent = _a.goToNextScenarioEvent, goToPrevScenarioEvent = _a.goToPrevScenarioEvent;
var toolbarStore = (0, mainToolbarStore_1.useMainToolbarStore)();
var activeUnitStore = (0, dragStore_1.useActiveUnitStore)();
var ui = (0, uiStore_1.useUiStore)();
var playback = (0, playbackStore_1.usePlaybackStore)();
var mapRef = (0, vue_1.shallowRef)();
var featureSelectInteractionRef = (0, vue_1.shallowRef)();
(0, vue_1.provide)(injects_1.activeMapKey, mapRef);
(0, vue_1.provide)(injects_1.activeFeatureSelectInteractionKey, featureSelectInteractionRef);
var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
var isMobile = breakpoints.smallerOrEqual("md");
function onMapReady(_a) {
    var olMap = _a.olMap, featureSelectInteraction = _a.featureSelectInteraction;
    mapRef.value = olMap;
    featureSelectInteractionRef.value = featureSelectInteraction;
}
var _b = (0, selectedStore_1.useSelectedItems)(), selectedUnitIds = _b.selectedUnitIds, selectedFeatureIds = _b.selectedFeatureIds, activeUnitId = _b.activeUnitId, activeScenarioEventId = _b.activeScenarioEventId, activeMapLayerId = _b.activeMapLayerId, showScenarioInfo = _b.showScenarioInfo, activeDetailsPanel = _b.activeDetailsPanel, clearSelected = _b.clear;
var showLeftPanel = (0, pinia_1.storeToRefs)(ui).showLeftPanel;
var toggleLeftPanel = (0, core_1.useToggle)(showLeftPanel);
var showDetailsPanel = (0, vue_1.computed)(function () {
    return Boolean(selectedFeatureIds.value.size ||
        selectedUnitIds.value.size ||
        activeScenarioEventId.value ||
        activeMapLayerId.value ||
        showScenarioInfo.value);
});
(0, vue_1.onUnmounted)(function () {
    activeUnitStore.clearActiveUnit();
    playback.playbackRunning = false;
});
(0, vue_1.onActivated)(function () {
    var _a;
    (_a = mapRef.value) === null || _a === void 0 ? void 0 : _a.updateSize();
    playback.playbackRunning = false;
});
function onCloseDetailsPanel() {
    clearSelected();
}
var openTimeDialog = function () { return __awaiter(void 0, void 0, void 0, function () {
    var newTimestamp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getModalTimestamp(state.currentTime, {
                    timeZone: state.info.timeZone,
                })];
            case 1:
                newTimestamp = _a.sent();
                if (newTimestamp !== undefined) {
                    setCurrentTime(newTimestamp);
                }
                return [2 /*return*/];
        }
    });
}); };
function onIncDay() {
    add(1, "day", true);
}
function onDecDay() {
    subtract(1, "day", true);
}
function onShowPlaceSearch() {
    ui.searchGeoMode = true;
    ui.showSearch = true;
}
var _c = (0, core_1.useRafFn)(function () {
    if (playback.playbackLooping &&
        playback.endMarker !== undefined &&
        playback.startMarker !== undefined) {
        if (state.currentTime >= playback.endMarker) {
            setCurrentTime(playback.startMarker);
            return;
        }
    }
    var newTime = state.currentTime + playback.playbackSpeed;
    setCurrentTime(newTime);
}, { immediate: false, fpsLimit: 60 }), pause = _c.pause, resume = _c.resume;
(0, vue_1.watch)(function () { return playback.playbackRunning; }, function (running) {
    if (running) {
        resume();
    }
    else {
        pause();
    }
}, { immediate: true });
var showDecryptModal = (0, vue_1.ref)(false);
var currentEncryptedScenario = (0, vue_1.ref)(null);
var browserLoadScenario = (0, browserScenarios_1.useBrowserScenarios)().loadScenario;
function onDecrypted(scenario) {
    browserLoadScenario(scenario);
    showDecryptModal.value = false;
    currentEncryptedScenario.value = null;
}
(0, core_1.useEventListener)(document, "paste", function (e) {
    var _a, _b;
    if (!(0, helpers_1.inputEventFilter)(e))
        return;
    if ((_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.types.includes("application/orbat"))
        return;
    var text = (_b = e.clipboardData) === null || _b === void 0 ? void 0 : _b.getData("text/plain");
    if (!text)
        return;
    try {
        var scenarioData = JSON.parse(text);
        if ((scenarioData === null || scenarioData === void 0 ? void 0 : scenarioData.type) === "ORBAT-mapper") {
            browserLoadScenario(scenarioData);
            e.preventDefault();
        }
        else if ((scenarioData === null || scenarioData === void 0 ? void 0 : scenarioData.type) === "ORBAT-mapper-encrypted") {
            currentEncryptedScenario.value = scenarioData;
            showDecryptModal.value = true;
            e.preventDefault();
        }
    }
    catch (_c) {
        // Not a valid JSON or not a scenario, ignore
    }
});
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex min-h-0 flex-auto flex-col" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex flex-auto flex-col" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
var __VLS_0 = ScenarioMap_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onMapReady': {} }, { class: "flex-auto" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onMapReady': {} }, { class: "flex-auto" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ mapReady: {} },
    { onMapReady: (__VLS_ctx.onMapReady) });
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.mapRef) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)(__assign({ class: "pointer-events-none absolute inset-0 flex flex-col justify-between" }));
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "flex flex-none items-center justify-end p-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    var __VLS_7 = MapTimeController_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onOpenTimeModal': {} }, { 'onShowSettings': {} }), { 'onIncDay': {} }), { 'onDecDay': {} }), { 'onNextEvent': {} }), { 'onPrevEvent': {} }), { class: "pointer-events-auto" }), { showControls: (__VLS_ctx.isMobile ? __VLS_ctx.ui.mobilePanelOpen : false) })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onOpenTimeModal': {} }, { 'onShowSettings': {} }), { 'onIncDay': {} }), { 'onDecDay': {} }), { 'onNextEvent': {} }), { 'onPrevEvent': {} }), { class: "pointer-events-auto" }), { showControls: (__VLS_ctx.isMobile ? __VLS_ctx.ui.mobilePanelOpen : false) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    var __VLS_12 = void 0;
    var __VLS_13 = ({ openTimeModal: {} },
        { onOpenTimeModal: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef))
                    return;
                __VLS_ctx.openTimeDialog();
                // @ts-ignore
                [onMapReady, mapRef, isMobile, ui, openTimeDialog,];
            } });
    var __VLS_14 = ({ showSettings: {} },
        { onShowSettings: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef))
                    return;
                __VLS_ctx.emit('show-settings');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_15 = ({ incDay: {} },
        { onIncDay: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef))
                    return;
                __VLS_ctx.onIncDay();
                // @ts-ignore
                [onIncDay,];
            } });
    var __VLS_16 = ({ decDay: {} },
        { onDecDay: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef))
                    return;
                __VLS_ctx.onDecDay();
                // @ts-ignore
                [onDecDay,];
            } });
    var __VLS_17 = ({ nextEvent: {} },
        { onNextEvent: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef))
                    return;
                __VLS_ctx.goToNextScenarioEvent();
                // @ts-ignore
                [goToNextScenarioEvent,];
            } });
    var __VLS_18 = ({ prevEvent: {} },
        { onPrevEvent: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef))
                    return;
                __VLS_ctx.goToPrevScenarioEvent();
                // @ts-ignore
                [goToPrevScenarioEvent,];
            } });
    /** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
    var __VLS_10;
    var __VLS_11;
    var __VLS_19 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign(__assign({ 'onClick': {} }, { class: "pointer-events-auto ml-2" }), { title: "Search" })));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { class: "pointer-events-auto ml-2" }), { title: "Search" })], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = void 0;
    var __VLS_25 = ({ click: {} },
        { onClick: (__VLS_ctx.onShowPlaceSearch) });
    /** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    var __VLS_26 = __VLS_22.slots.default;
    var __VLS_27 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.MagnifyingGlassIcon} */
    solid_1.MagnifyingGlassIcon;
    // @ts-ignore
    var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign({ class: "text-muted-foreground h-5 w-5" })));
    var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [onShowPlaceSearch,];
    var __VLS_22;
    var __VLS_23;
    if (!__VLS_ctx.isMobile) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "flex flex-auto justify-between p-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        if (__VLS_ctx.showLeftPanel) {
            var __VLS_32 = MapEditorDesktopPanel_vue_1.default;
            // @ts-ignore
            var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32(__assign({ 'onClose': {} })));
            var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ 'onClose': {} })], __VLS_functionalComponentArgsRest(__VLS_33), false));
            var __VLS_37 = void 0;
            var __VLS_38 = ({ close: {} },
                { onClose: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(__VLS_ctx.mapRef))
                            return;
                        if (!(!__VLS_ctx.isMobile))
                            return;
                        if (!(__VLS_ctx.showLeftPanel))
                            return;
                        __VLS_ctx.toggleLeftPanel();
                        // @ts-ignore
                        [isMobile, showLeftPanel, toggleLeftPanel,];
                    } });
            var __VLS_35;
            var __VLS_36;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            var __VLS_39 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
            button_1.Button;
            // @ts-ignore
            var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign(__assign({ 'onClick': {} }, { type: "button", size: "icon", variant: "secondary", title: "Show panel" }), { class: "pointer-events-auto absolute -my-12" })));
            var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "button", size: "icon", variant: "secondary", title: "Show panel" }), { class: "pointer-events-auto absolute -my-12" })], __VLS_functionalComponentArgsRest(__VLS_40), false));
            var __VLS_44 = void 0;
            var __VLS_45 = ({ click: {} },
                { onClick: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(__VLS_ctx.mapRef))
                            return;
                        if (!(!__VLS_ctx.isMobile))
                            return;
                        if (!!(__VLS_ctx.showLeftPanel))
                            return;
                        __VLS_ctx.toggleLeftPanel();
                        // @ts-ignore
                        [toggleLeftPanel,];
                    } });
            /** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['-my-12']} */ ;
            var __VLS_46 = __VLS_42.slots.default;
            var __VLS_47 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.ShowPanelIcon} */
            lucide_vue_next_1.PanelLeftOpenIcon;
            // @ts-ignore
            var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47(__assign({ class: "size-7" })));
            var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([__assign({ class: "size-7" })], __VLS_functionalComponentArgsRest(__VLS_48), false));
            /** @type {__VLS_StyleScopedClasses['size-7']} */ ;
            // @ts-ignore
            [];
            var __VLS_42;
            var __VLS_43;
        }
        if (__VLS_ctx.showDetailsPanel) {
            var __VLS_52 = MapEditorDetailsPanel_vue_1.default || MapEditorDetailsPanel_vue_1.default;
            // @ts-ignore
            var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52(__assign({ 'onClose': {} })));
            var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign({ 'onClose': {} })], __VLS_functionalComponentArgsRest(__VLS_53), false));
            var __VLS_57 = void 0;
            var __VLS_58 = ({ close: {} },
                { onClose: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(__VLS_ctx.mapRef))
                            return;
                        if (!(!__VLS_ctx.isMobile))
                            return;
                        if (!(__VLS_ctx.showDetailsPanel))
                            return;
                        __VLS_ctx.onCloseDetailsPanel();
                        // @ts-ignore
                        [showDetailsPanel, onCloseDetailsPanel,];
                    } });
            var __VLS_59 = __VLS_55.slots.default;
            if (__VLS_ctx.activeDetailsPanel === 'feature') {
                var __VLS_60 = ScenarioFeatureDetails_vue_1.default;
                // @ts-ignore
                var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
                    selectedIds: (__VLS_ctx.selectedFeatureIds),
                }));
                var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([{
                        selectedIds: (__VLS_ctx.selectedFeatureIds),
                    }], __VLS_functionalComponentArgsRest(__VLS_61), false));
            }
            else if (__VLS_ctx.activeDetailsPanel === 'unit') {
                var __VLS_65 = UnitDetails_vue_1.default;
                // @ts-ignore
                var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
                    unitId: (__VLS_ctx.activeUnitId || __spreadArray([], __VLS_ctx.selectedUnitIds, true)[0]),
                }));
                var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([{
                        unitId: (__VLS_ctx.activeUnitId || __spreadArray([], __VLS_ctx.selectedUnitIds, true)[0]),
                    }], __VLS_functionalComponentArgsRest(__VLS_66), false));
            }
            else if (__VLS_ctx.activeDetailsPanel === 'event') {
                var __VLS_70 = ScenarioEventDetails_vue_1.default;
                // @ts-ignore
                var __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                    eventId: (__VLS_ctx.activeScenarioEventId),
                }));
                var __VLS_72 = __VLS_71.apply(void 0, __spreadArray([{
                        eventId: (__VLS_ctx.activeScenarioEventId),
                    }], __VLS_functionalComponentArgsRest(__VLS_71), false));
            }
            else if (__VLS_ctx.activeDetailsPanel === 'mapLayer') {
                var __VLS_75 = ScenarioMapLayerDetails_vue_1.default;
                // @ts-ignore
                var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
                    layerId: (__VLS_ctx.activeMapLayerId),
                }));
                var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([{
                        layerId: (__VLS_ctx.activeMapLayerId),
                    }], __VLS_functionalComponentArgsRest(__VLS_76), false));
            }
            else if (__VLS_ctx.activeDetailsPanel === 'scenario') {
                var __VLS_80 = ScenarioInfoPanel_vue_1.default;
                // @ts-ignore
                var __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({}));
                var __VLS_82 = __VLS_81.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_81), false));
            }
            // @ts-ignore
            [activeDetailsPanel, activeDetailsPanel, activeDetailsPanel, activeDetailsPanel, activeDetailsPanel, selectedFeatureIds, activeUnitId, selectedUnitIds, activeScenarioEventId, activeMapLayerId,];
            var __VLS_55;
            var __VLS_56;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        }
    }
}
if (__VLS_ctx.mapRef && __VLS_ctx.ui.showToolbar) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "pointer-events-none flex justify-center sm:absolute sm:bottom-2 sm:w-full sm:p-2" }));
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:bottom-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:p-2']} */ ;
    var __VLS_85 = MapEditorMainToolbar_vue_1.default;
    // @ts-ignore
    var __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85(__assign(__assign(__assign(__assign(__assign({ 'onOpenTimeModal': {} }, { 'onIncDay': {} }), { 'onDecDay': {} }), { 'onNextEvent': {} }), { 'onPrevEvent': {} }), { 'onShowSettings': {} })));
    var __VLS_87 = __VLS_86.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onOpenTimeModal': {} }, { 'onIncDay': {} }), { 'onDecDay': {} }), { 'onNextEvent': {} }), { 'onPrevEvent': {} }), { 'onShowSettings': {} })], __VLS_functionalComponentArgsRest(__VLS_86), false));
    var __VLS_90 = void 0;
    var __VLS_91 = ({ openTimeModal: {} },
        { onOpenTimeModal: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef && __VLS_ctx.ui.showToolbar))
                    return;
                __VLS_ctx.openTimeDialog();
                // @ts-ignore
                [mapRef, ui, openTimeDialog,];
            } });
    var __VLS_92 = ({ incDay: {} },
        { onIncDay: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef && __VLS_ctx.ui.showToolbar))
                    return;
                __VLS_ctx.onIncDay();
                // @ts-ignore
                [onIncDay,];
            } });
    var __VLS_93 = ({ decDay: {} },
        { onDecDay: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef && __VLS_ctx.ui.showToolbar))
                    return;
                __VLS_ctx.onDecDay();
                // @ts-ignore
                [onDecDay,];
            } });
    var __VLS_94 = ({ nextEvent: {} },
        { onNextEvent: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef && __VLS_ctx.ui.showToolbar))
                    return;
                __VLS_ctx.goToNextScenarioEvent();
                // @ts-ignore
                [goToNextScenarioEvent,];
            } });
    var __VLS_95 = ({ prevEvent: {} },
        { onPrevEvent: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef && __VLS_ctx.ui.showToolbar))
                    return;
                __VLS_ctx.goToPrevScenarioEvent();
                // @ts-ignore
                [goToPrevScenarioEvent,];
            } });
    var __VLS_96 = ({ showSettings: {} },
        { onShowSettings: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.mapRef && __VLS_ctx.ui.showToolbar))
                    return;
                __VLS_ctx.emit('show-settings');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_88;
    var __VLS_89;
    if (__VLS_ctx.toolbarStore.currentToolbar === 'measurements') {
        var __VLS_97 = MapEditorMeasurementToolbar_vue_1.default;
        // @ts-ignore
        var __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97(__assign({ class: "absolute bottom-14 sm:bottom-16" })));
        var __VLS_99 = __VLS_98.apply(void 0, __spreadArray([__assign({ class: "absolute bottom-14 sm:bottom-16" })], __VLS_functionalComponentArgsRest(__VLS_98), false));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-14']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:bottom-16']} */ ;
    }
    if (__VLS_ctx.toolbarStore.currentToolbar === 'draw') {
        var __VLS_102 = MapEditorDrawToolbar_vue_1.default;
        // @ts-ignore
        var __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102(__assign({ class: "absolute bottom-14 sm:bottom-16" })));
        var __VLS_104 = __VLS_103.apply(void 0, __spreadArray([__assign({ class: "absolute bottom-14 sm:bottom-16" })], __VLS_functionalComponentArgsRest(__VLS_103), false));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-14']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:bottom-16']} */ ;
    }
    if (__VLS_ctx.toolbarStore.currentToolbar === 'track') {
        var __VLS_107 = MapEditorUnitTrackToolbar_vue_1.default;
        // @ts-ignore
        var __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107(__assign({ class: "absolute bottom-14 sm:bottom-16" })));
        var __VLS_109 = __VLS_108.apply(void 0, __spreadArray([__assign({ class: "absolute bottom-14 sm:bottom-16" })], __VLS_functionalComponentArgsRest(__VLS_108), false));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-14']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:bottom-16']} */ ;
    }
}
if (__VLS_ctx.isMobile) {
    if (__VLS_ctx.ui.showOrbatBreadcrumbs) {
        var __VLS_112 = UnitBreadcrumbs_vue_1.default;
        // @ts-ignore
        var __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({}));
        var __VLS_114 = __VLS_113.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_113), false));
    }
    var __VLS_117 = MapEditorMobilePanel_vue_1.default;
    // @ts-ignore
    var __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117(__assign(__assign(__assign(__assign(__assign({ 'onOpenTimeModal': {} }, { 'onIncDay': {} }), { 'onDecDay': {} }), { 'onNextEvent': {} }), { 'onPrevEvent': {} }), { 'onShowSettings': {} })));
    var __VLS_119 = __VLS_118.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onOpenTimeModal': {} }, { 'onIncDay': {} }), { 'onDecDay': {} }), { 'onNextEvent': {} }), { 'onPrevEvent': {} }), { 'onShowSettings': {} })], __VLS_functionalComponentArgsRest(__VLS_118), false));
    var __VLS_122 = void 0;
    var __VLS_123 = ({ openTimeModal: {} },
        { onOpenTimeModal: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.openTimeDialog();
                // @ts-ignore
                [isMobile, ui, openTimeDialog, toolbarStore, toolbarStore, toolbarStore,];
            } });
    var __VLS_124 = ({ incDay: {} },
        { onIncDay: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.onIncDay();
                // @ts-ignore
                [onIncDay,];
            } });
    var __VLS_125 = ({ decDay: {} },
        { onDecDay: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.onDecDay();
                // @ts-ignore
                [onDecDay,];
            } });
    var __VLS_126 = ({ nextEvent: {} },
        { onNextEvent: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.goToNextScenarioEvent();
                // @ts-ignore
                [goToNextScenarioEvent,];
            } });
    var __VLS_127 = ({ prevEvent: {} },
        { onPrevEvent: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.goToPrevScenarioEvent();
                // @ts-ignore
                [goToPrevScenarioEvent,];
            } });
    var __VLS_128 = ({ showSettings: {} },
        { onShowSettings: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.emit('show-settings');
                // @ts-ignore
                [emit,];
            } });
    var __VLS_120;
    var __VLS_121;
}
if (__VLS_ctx.mapRef) {
    var __VLS_129 = KeyboardScenarioActions_vue_1.default;
    // @ts-ignore
    var __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({}));
    var __VLS_131 = __VLS_130.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_130), false));
}
if (__VLS_ctx.mapRef) {
    var __VLS_134 = SearchScenarioActions_vue_1.default;
    // @ts-ignore
    var __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({}));
    var __VLS_136 = __VLS_135.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_135), false));
}
if (__VLS_ctx.ui.shortcutsEnabled) {
    var __VLS_139 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.GlobalEvents} */
    vue_global_events_1.GlobalEvents;
    // @ts-ignore
    var __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139(__assign(__assign({ 'onKeyup': {} }, { 'onKeyup': {} }), { filter: (__VLS_ctx.inputEventFilter) })));
    var __VLS_141 = __VLS_140.apply(void 0, __spreadArray([__assign(__assign({ 'onKeyup': {} }, { 'onKeyup': {} }), { filter: (__VLS_ctx.inputEventFilter) })], __VLS_functionalComponentArgsRest(__VLS_140), false));
    var __VLS_144 = void 0;
    var __VLS_145 = ({ keyup: {} },
        { onKeyup: (__VLS_ctx.openTimeDialog) });
    var __VLS_146 = ({ keyup: {} },
        { onKeyup: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.ui.shortcutsEnabled))
                    return;
                __VLS_ctx.ui.showSearch = true;
                // @ts-ignore
                [mapRef, mapRef, ui, ui, openTimeDialog, helpers_1.inputEventFilter,];
            } });
    var __VLS_142;
    var __VLS_143;
}
if (__VLS_ctx.ui.showOrbatBreadcrumbs && !__VLS_ctx.isMobile) {
    var __VLS_147 = UnitBreadcrumbs_vue_1.default;
    // @ts-ignore
    var __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({}));
    var __VLS_149 = __VLS_148.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_148), false));
}
if (__VLS_ctx.ui.showTimeline) {
    var __VLS_152 = ScenarioTimeline_vue_1.default;
    // @ts-ignore
    var __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({}));
    var __VLS_154 = __VLS_153.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_153), false));
}
if (__VLS_ctx.showDecryptModal && __VLS_ctx.currentEncryptedScenario) {
    var __VLS_157 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DecryptScenarioModal} */
    DecryptScenarioModal;
    // @ts-ignore
    var __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157(__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.currentEncryptedScenario) })));
    var __VLS_159 = __VLS_158.apply(void 0, __spreadArray([__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.currentEncryptedScenario) })], __VLS_functionalComponentArgsRest(__VLS_158), false));
    var __VLS_162 = void 0;
    var __VLS_163 = ({ decrypted: {} },
        { onDecrypted: (__VLS_ctx.onDecrypted) });
    var __VLS_160;
    var __VLS_161;
}
// @ts-ignore
[isMobile, ui, ui, showDecryptModal, showDecryptModal, currentEncryptedScenario, currentEncryptedScenario, onDecrypted,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
});
exports.default = {};
