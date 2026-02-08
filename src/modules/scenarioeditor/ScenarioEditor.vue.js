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
var vue_global_events_1 = require("vue-global-events");
var dragStore_1 = require("@/stores/dragStore");
var ShortcutsModal_vue_1 = require("@/components/ShortcutsModal.vue");
var outline_1 = require("@heroicons/vue/24/outline");
var helpers_1 = require("@/components/helpers");
var vue_router_1 = require("vue-router");
var uiStore_1 = require("@/stores/uiStore");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var core_1 = require("@vueuse/core");
var MainViewSlideOver_vue_1 = require("@/components/MainViewSlideOver.vue");
var constants_1 = require("@/types/constants");
var notifications_1 = require("@/composables/notifications");
var nprogress_1 = require("nprogress");
var injects_1 = require("@/components/injects");
var featureStyles_1 = require("@/geo/featureStyles");
var modals_1 = require("@/composables/modals");
var pinia_1 = require("pinia");
var names_1 = require("@/router/names");
var filedragdrop_1 = require("@/composables/filedragdrop");
var tabStore_1 = require("@/stores/tabStore");
var CommandPalette_vue_1 = require("@/components/commandPalette/CommandPalette.vue");
var selectedStore_1 = require("@/stores/selectedStore");
var MainMenu_vue_1 = require("@/modules/scenarioeditor/MainMenu.vue");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var PlaybackMenu_vue_1 = require("@/modules/scenarioeditor/PlaybackMenu.vue");
var DebugInfo_vue_1 = require("@/components/DebugInfo.vue");
var lucide_vue_next_1 = require("lucide-vue-next");
var components_1 = require("@vueuse/components");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var LoadScenarioDialog = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("./LoadScenarioDialog.vue"); }); });
var SymbolPickerModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/SymbolPickerModal.vue"); }); });
var InputDateModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/InputDateModal.vue"); }); });
var ExportScenarioModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ExportScenarioModal.vue"); }); });
var ImportModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ImportModal.vue"); }); });
var ShareScenarioUrlModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ShareScenarioUrlModal.vue"); }); });
var ShareScenarioModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ShareScenarioModal.vue"); }); });
var EncryptScenarioModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/EncryptScenarioModal.vue"); }); });
var dropZoneRef = (0, vue_1.ref)();
var activeParentId = (0, vue_1.ref)(null);
var activeLayerId = (0, vue_1.ref)(null);
var scnFeatureStyles = (0, featureStyles_1.useFeatureStyles)(props.activeScenario.geo);
var uiTabs = (0, tabStore_1.useTabStore)();
var activeScenarioTab = (0, pinia_1.storeToRefs)(uiTabs).activeScenarioTab;
var selectedItems = (0, selectedStore_1.useSelectedItems)();
(0, vue_1.provide)(injects_1.activeParentKey, activeParentId);
(0, vue_1.provide)(injects_1.activeLayerKey, activeLayerId);
(0, vue_1.provide)(injects_1.activeScenarioKey, props.activeScenario);
(0, vue_1.provide)(injects_1.activeFeatureStylesKey, scnFeatureStyles);
(0, vue_1.provide)(injects_1.currentScenarioTabKey, activeScenarioTab);
var onUnitSelectHook = (0, core_1.createEventHook)();
var onLayerSelectHook = (0, core_1.createEventHook)();
var onImageLayerSelectHook = (0, core_1.createEventHook)();
var onFeatureSelectHook = (0, core_1.createEventHook)();
var onEventSelectHook = (0, core_1.createEventHook)();
var onPlaceSelectHook = (0, core_1.createEventHook)();
var onScenarioActionHook = (0, core_1.createEventHook)();
(0, vue_1.provide)(injects_1.searchActionsKey, {
    onUnitSelectHook: onUnitSelectHook,
    onLayerSelectHook: onLayerSelectHook,
    onFeatureSelectHook: onFeatureSelectHook,
    onEventSelectHook: onEventSelectHook,
    onPlaceSelectHook: onPlaceSelectHook,
    onImageLayerSelectHook: onImageLayerSelectHook,
    onScenarioActionHook: onScenarioActionHook,
});
var _a = props.activeScenario.store, state = _a.state, undo = _a.undo, redo = _a.redo, canRedo = _a.canRedo, canUndo = _a.canUndo;
var _b = props.activeScenario, unitActions = _b.unitActions, io = _b.io, getUnitById = _b.helpers.getUnitById;
var route = (0, vue_router_1.useRoute)();
var router = (0, vue_router_1.useRouter)();
var _c = (0, core_1.useClipboard)(), copyToClipboard = _c.copy, copied = _c.copied;
var isOpen = (0, vue_1.ref)(false);
var showLoadModal = (0, vue_1.ref)(false);
var shortcutsModalVisible = (0, vue_1.ref)(false);
var showExportModal = (0, vue_1.ref)(false);
var showImportModal = (0, vue_1.ref)(false);
var showShareUrlModal = (0, vue_1.ref)(false);
var showShareModal = (0, vue_1.ref)(false);
var showEncryptModal = (0, vue_1.ref)(false);
(0, timeFormatStore_1.useTimeFormatterProvider)({ activeScenario: props.activeScenario });
var uiStore = (0, uiStore_1.useUiStore)();
var showSearch = (0, pinia_1.storeToRefs)(uiStore).showSearch;
var mapStore = (0, mapSettingsStore_1.useMapSettingsStore)();
mapStore.baseLayerName = state.mapSettings.baseMapId;
var originalTitle = (0, core_1.useTitle)().value;
var windowTitle = (0, vue_1.computed)(function () { return state.info.name; });
var send = (0, notifications_1.useNotifications)().send;
(0, core_1.useTitle)(windowTitle);
var _d = (0, modals_1.useDateModal)(), showDateModal = _d.showDateModal, confirmDateModal = _d.confirmDateModal, cancelDateModal = _d.cancelDateModal, initialDateModalValue = _d.initialDateModalValue, dateModalTimeZone = _d.dateModalTimeZone, dateModalTitle = _d.dateModalTitle, getModalTimestamp = _d.getModalTimestamp;
(0, vue_1.provide)(injects_1.timeModalKey, { getModalTimestamp: getModalTimestamp });
var _e = (0, modals_1.useSidcModal)(), getModalSidc = _e.getModalSidc, confirmSidcModal = _e.confirmSidcModal, showSidcModal = _e.showSidcModal, cancelSidcModal = _e.cancelSidcModal, initialSidcModalValue = _e.initialSidcModalValue, sidcModalTitle = _e.sidcModalTitle, hideModifiers = _e.hideModifiers, hideSymbolColor = _e.hideSymbolColor, hideCustomSymbols = _e.hideCustomSymbols, symbolOptions = _e.symbolOptions, inheritedSymbolOptions = _e.inheritedSymbolOptions, sidcModalInitialTab = _e.initialTab, initialReinforcedReduced = _e.initialReinforcedReduced;
(0, vue_1.provide)(injects_1.sidcModalKey, { getModalSidc: getModalSidc });
(0, vue_1.onUnmounted)(function () {
    (0, core_1.useTitle)(originalTitle);
});
var shortcutsEnabled = (0, vue_1.computed)(function () { return !uiStore.modalOpen; });
var onUnitSelect = function (unitId) {
    onUnitSelectHook.trigger({ unitId: unitId });
};
var onLayerSelect = function (layerId) {
    onLayerSelectHook.trigger({ layerId: layerId });
};
var onImageLayerSelect = function (layerId) {
    onImageLayerSelectHook.trigger({ layerId: layerId });
};
var onEventSelect = function (e) {
    onEventSelectHook.trigger(e);
};
var onFeatureSelect = function (featureId, layerId) {
    onFeatureSelectHook.trigger({ featureId: featureId, layerId: layerId });
};
var scenarioShare_1 = require("@/composables/scenarioShare");
(0, scenarioShare_1.useScenarioShare)();
function onScenarioAction(action) {
    return __awaiter(this, void 0, void 0, function () {
        var preId, newId, scenarioId, activeUnitId, initialSidc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(action === "addSide")) return [3 /*break*/, 1];
                    unitActions.addSide();
                    return [3 /*break*/, 24];
                case 1:
                    if (!(action === "save")) return [3 /*break*/, 5];
                    preId = state.id;
                    return [4 /*yield*/, io.saveToIndexedDb()];
                case 2:
                    newId = _a.sent();
                    send({ message: "Scenario saved to IndexedDb" });
                    if (!(preId !== newId)) return [3 /*break*/, 4];
                    return [4 /*yield*/, router.push({ name: names_1.MAP_EDIT_MODE_ROUTE, params: { scenarioId: newId } })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 24];
                case 5:
                    if (!(action === "load")) return [3 /*break*/, 6];
                    io.loadFromLocalStorage();
                    showInfo();
                    send({ message: "Scenario loaded from local storage" });
                    return [3 /*break*/, 24];
                case 6:
                    if (!(action === "exportJson")) return [3 /*break*/, 8];
                    return [4 /*yield*/, io.downloadAsJson()];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 24];
                case 8:
                    if (!(action === "loadNew")) return [3 /*break*/, 9];
                    showLoadModal.value = true;
                    return [3 /*break*/, 24];
                case 9:
                    if (!(action === "exportToClipboard")) return [3 /*break*/, 11];
                    return [4 /*yield*/, copyToClipboard(io.stringifyScenario())];
                case 10:
                    _a.sent();
                    if (copied.value)
                        send({ message: "Scenario copied to clipboard", type: "success" });
                    return [3 /*break*/, 24];
                case 11:
                    if (!(action === "shareAsUrl")) return [3 /*break*/, 12];
                    showShareUrlModal.value = true;
                    return [3 /*break*/, 24];
                case 12:
                    if (!(action === "share")) return [3 /*break*/, 13];
                    showShareModal.value = true;
                    return [3 /*break*/, 24];
                case 13:
                    if (!(action === "export")) return [3 /*break*/, 14];
                    showExportModal.value = true;
                    return [3 /*break*/, 24];
                case 14:
                    if (!(action === "exportEncrypted")) return [3 /*break*/, 15];
                    showEncryptModal.value = true;
                    return [3 /*break*/, 24];
                case 15:
                    if (!(action === "import")) return [3 /*break*/, 16];
                    showImportModal.value = true;
                    return [3 /*break*/, 24];
                case 16:
                    if (!(action === "showInfo")) return [3 /*break*/, 17];
                    showInfo();
                    return [3 /*break*/, 24];
                case 17:
                    if (!(action === "duplicate")) return [3 /*break*/, 20];
                    return [4 /*yield*/, io.duplicateScenario()];
                case 18:
                    scenarioId = _a.sent();
                    return [4 /*yield*/, router.push({ name: names_1.MAP_EDIT_MODE_ROUTE, params: { scenarioId: scenarioId } })];
                case 19:
                    _a.sent();
                    return [3 /*break*/, 24];
                case 20:
                    if (!(action === "createNew")) return [3 /*break*/, 22];
                    return [4 /*yield*/, router.push({ name: names_1.NEW_SCENARIO_ROUTE })];
                case 21:
                    _a.sent();
                    return [3 /*break*/, 24];
                case 22:
                    if (!(action === "browseSymbols")) return [3 /*break*/, 24];
                    activeUnitId = selectedItems.activeUnitId.value;
                    initialSidc = "10031000001211000000";
                    if (activeUnitId) {
                        initialSidc = getUnitById(activeUnitId).sidc;
                    }
                    return [4 /*yield*/, getModalSidc(initialSidc, { title: "Symbol browser", initialTab: 1 })];
                case 23:
                    _a.sent();
                    _a.label = 24;
                case 24: return [4 /*yield*/, onScenarioActionHook.trigger({ action: action })];
                case 25:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function onUiAction(action) {
    if (action === "showKeyboardShortcuts") {
        showKeyboardShortcuts();
    }
    if (action === "showSearch") {
        showSearch.value = true;
    }
}
function showKeyboardShortcuts() {
    shortcutsModalVisible.value = true;
}
(0, core_1.watchOnce)(function () { return activeScenarioTab.value === constants_1.TAB_LAYERS; }, function () {
    nprogress_1.default.start();
});
function onDrop(files) {
    if (!files || !files.length)
        return;
    var dragState = (0, dragStore_1.useDragStore)();
    dragState.draggedFiles = files;
    showImportModal.value = true;
}
function showInfo() {
    selectedItems.clear();
    selectedItems.showScenarioInfo.value = true;
}
var isOverDropZone = (0, filedragdrop_1.useFileDropZone)(dropZoneRef, onDrop).isOverDropZone;
if (state.layers.length > 0) {
    activeLayerId.value = state.layers[0];
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background flex h-dvh flex-col overflow-hidden" }, { ref: "dropZoneRef" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-dvh']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)(__assign({ class: "flex shrink-0 items-center justify-between py-1 pr-4 pl-6 print:hidden" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-6']} */ ;
/** @type {__VLS_StyleScopedClasses['print:hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex min-w-0 flex-auto items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex min-w-0 flex-auto items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_0 = MainMenu_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onAction': {} }, { 'onUiAction': {} })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { 'onUiAction': {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ action: {} },
    { onAction: (__VLS_ctx.onScenarioAction) });
var __VLS_7 = ({ uiAction: {} },
    { onUiAction: (__VLS_ctx.onUiAction) });
var __VLS_3;
var __VLS_4;
var __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign(__assign({ 'onClick': {} }, { variant: "ghost", type: "button" }), { class: "hidden truncate font-medium sm:inline-flex" })));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "ghost", type: "button" }), { class: "hidden truncate font-medium sm:inline-flex" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
var __VLS_13;
var __VLS_14 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showInfo();
            // @ts-ignore
            [onScenarioAction, onUiAction, showInfo,];
        } });
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
var __VLS_15 = __VLS_11.slots.default;
(__VLS_ctx.activeScenario.store.state.info.name);
// @ts-ignore
[activeScenario,];
var __VLS_11;
var __VLS_12;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex shrink-0 items-center space-x-1 overflow-clip sm:space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-clip']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:space-x-2']} */ ;
if (__VLS_ctx.route.name === __VLS_ctx.MAP_EDIT_MODE_ROUTE) {
    var __VLS_16 = PlaybackMenu_vue_1.default;
    // @ts-ignore
    var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({}));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_17), false));
}
var __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign(__assign({ variant: "ghost" }, { class: "hidden sm:inline-flex" }), { asChild: true })));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign(__assign({ variant: "ghost" }, { class: "hidden sm:inline-flex" }), { asChild: true })], __VLS_functionalComponentArgsRest(__VLS_22), false));
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
var __VLS_26 = __VLS_24.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.route.meta.helpUrl ||
        'https://docs.orbat-mapper.app/guide/about-orbat-mapper'),
    target: "_blank",
});
// @ts-ignore
[route, route, names_1.MAP_EDIT_MODE_ROUTE,];
var __VLS_24;
var __VLS_27;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "hidden sm:inline-flex" }), { title: "Share scenario" })));
var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "hidden sm:inline-flex" }), { title: "Share scenario" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
var __VLS_32;
var __VLS_33 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showShareModal = true;
            // @ts-ignore
            [showShareModal,];
        } });
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
var __VLS_34 = __VLS_30.slots.default;
var __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.ShareIcon} */
outline_1.ShareIcon;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign({ class: "size-6" })));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_36), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_30;
var __VLS_31;
var __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70" })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70" })], __VLS_functionalComponentArgsRest(__VLS_41), false));
var __VLS_45;
var __VLS_46 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showSearch = true;
            // @ts-ignore
            [showSearch,];
        } });
/** @type {__VLS_StyleScopedClasses['text-foreground/70']} */ ;
var __VLS_47 = __VLS_43.slots.default;
var __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.SearchIcon} */
outline_1.MagnifyingGlassIcon;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48(__assign({ class: "size-6" })));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_49), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_43;
var __VLS_44;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-muted-foreground/20 dark:bg-foreground/15 text-muted-foreground/80 flex items-center rounded-lg px-1" }));
/** @type {__VLS_StyleScopedClasses['bg-muted-foreground/20']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-foreground/15']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground/80']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1']} */ ;
var __VLS_53;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign({ to: ({ name: __VLS_ctx.MAP_EDIT_MODE_ROUTE }), title: "Map edit mode", exactActiveClass: "text-green-500" }, { class: "hover:bg-muted hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset" })));
var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ to: ({ name: __VLS_ctx.MAP_EDIT_MODE_ROUTE }), title: "Map edit mode", exactActiveClass: "text-green-500" }, { class: "hover:bg-muted hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset" })], __VLS_functionalComponentArgsRest(__VLS_54), false));
/** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-inset']} */ ;
var __VLS_58 = __VLS_56.slots.default;
var __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.GlobeAltIcon} */
outline_1.GlobeAltIcon;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59(__assign({ class: "size-6" })));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_60), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[names_1.MAP_EDIT_MODE_ROUTE,];
var __VLS_56;
var __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64(__assign({ to: ({ name: __VLS_ctx.GRID_EDIT_ROUTE }), title: "Grid edit mode", exactActiveClass: "text-green-500" }, { class: "hover:bg-muted hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset" })));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([__assign({ to: ({ name: __VLS_ctx.GRID_EDIT_ROUTE }), title: "Grid edit mode", exactActiveClass: "text-green-500" }, { class: "hover:bg-muted hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset" })], __VLS_functionalComponentArgsRest(__VLS_65), false));
/** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-inset']} */ ;
var __VLS_69 = __VLS_67.slots.default;
var __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.TableIcon} */
outline_1.TableCellsIcon;
// @ts-ignore
var __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70(__assign({ class: "size-6" })));
var __VLS_72 = __VLS_71.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_71), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[names_1.GRID_EDIT_ROUTE,];
var __VLS_67;
var __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75(__assign({ to: ({ name: __VLS_ctx.CHART_EDIT_MODE_ROUTE }), title: "Chart edit mode", exactActiveClass: "text-green-500" }, { class: "hover:bg-muted hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset" })));
var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([__assign({ to: ({ name: __VLS_ctx.CHART_EDIT_MODE_ROUTE }), title: "Chart edit mode", exactActiveClass: "text-green-500" }, { class: "hover:bg-muted hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset" })], __VLS_functionalComponentArgsRest(__VLS_76), false));
/** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-inset']} */ ;
var __VLS_80 = __VLS_78.slots.default;
var __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.IconSitemap} */
vue_mdi_1.IconSitemap;
// @ts-ignore
var __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81(__assign({ class: "size-6" })));
var __VLS_83 = __VLS_82.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_82), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[names_1.CHART_EDIT_MODE_ROUTE,];
var __VLS_78;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_86;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86(__assign(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70 hidden sm:inline-flex" }), { title: "Undo action (ctrl+z)", disabled: (!__VLS_ctx.canUndo) })));
var __VLS_88 = __VLS_87.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70 hidden sm:inline-flex" }), { title: "Undo action (ctrl+z)", disabled: (!__VLS_ctx.canUndo) })], __VLS_functionalComponentArgsRest(__VLS_87), false));
var __VLS_91;
var __VLS_92 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.undo();
            // @ts-ignore
            [canUndo, undo,];
        } });
/** @type {__VLS_StyleScopedClasses['text-foreground/70']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
var __VLS_93 = __VLS_89.slots.default;
var __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.IconUndo} */
vue_mdi_1.IconUndoVariant;
// @ts-ignore
var __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94(__assign({ class: "size-6" })));
var __VLS_96 = __VLS_95.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_95), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_89;
var __VLS_90;
var __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99(__assign(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70 hidden sm:inline-flex" }), { title: "Redo action", disabled: (!__VLS_ctx.canRedo) })));
var __VLS_101 = __VLS_100.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70 hidden sm:inline-flex" }), { title: "Redo action", disabled: (!__VLS_ctx.canRedo) })], __VLS_functionalComponentArgsRest(__VLS_100), false));
var __VLS_104;
var __VLS_105 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.redo();
            // @ts-ignore
            [canRedo, redo,];
        } });
/** @type {__VLS_StyleScopedClasses['text-foreground/70']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
var __VLS_106 = __VLS_102.slots.default;
var __VLS_107;
/** @ts-ignore @type {typeof __VLS_components.IconRedo} */
vue_mdi_1.IconRedoVariant;
// @ts-ignore
var __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107(__assign({ class: "size-6" })));
var __VLS_109 = __VLS_108.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_108), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_102;
var __VLS_103;
var __VLS_112;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112(__assign(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70 hidden sm:inline-flex" }), { title: "Show keyboard shortcuts" })));
var __VLS_114 = __VLS_113.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70 hidden sm:inline-flex" }), { title: "Show keyboard shortcuts" })], __VLS_functionalComponentArgsRest(__VLS_113), false));
var __VLS_117;
var __VLS_118 = ({ click: {} },
    { onClick: (__VLS_ctx.showKeyboardShortcuts) });
/** @type {__VLS_StyleScopedClasses['text-foreground/70']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
var __VLS_119 = __VLS_115.slots.default;
var __VLS_120;
/** @ts-ignore @type {typeof __VLS_components.IconKeyboard} */
vue_mdi_1.IconKeyboard;
// @ts-ignore
var __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120(__assign({ class: "size-6" })));
var __VLS_122 = __VLS_121.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_121), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[showKeyboardShortcuts,];
var __VLS_115;
var __VLS_116;
var __VLS_125;
/** @ts-ignore @type {typeof __VLS_components.UseDark | typeof __VLS_components.UseDark} */
components_1.UseDark;
// @ts-ignore
var __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({}));
var __VLS_127 = __VLS_126.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_126), false));
{
    var __VLS_130 = __VLS_128.slots.default;
    var _f = __VLS_vSlot(__VLS_130)[0], isDark = _f.isDark, toggleDark_1 = _f.toggleDark;
    var __VLS_131 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Toggle dark mode" }), { class: "text-foreground/70 hidden sm:inline-flex" })));
    var __VLS_133 = __VLS_132.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Toggle dark mode" }), { class: "text-foreground/70 hidden sm:inline-flex" })], __VLS_functionalComponentArgsRest(__VLS_132), false));
    var __VLS_136 = void 0;
    var __VLS_137 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                toggleDark_1();
                // @ts-ignore
                [];
            } });
    /** @type {__VLS_StyleScopedClasses['text-foreground/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
    var __VLS_138 = __VLS_134.slots.default;
    if (isDark) {
        var __VLS_139 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SunIcon} */
        lucide_vue_next_1.SunIcon;
        // @ts-ignore
        var __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139(__assign({ class: "size-5" })));
        var __VLS_141 = __VLS_140.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_140), false));
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    }
    else {
        var __VLS_144 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.MoonStarIcon} */
        lucide_vue_next_1.MoonStarIcon;
        // @ts-ignore
        var __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144(__assign({ class: "size-5" })));
        var __VLS_146 = __VLS_145.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_145), false));
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    }
    // @ts-ignore
    [];
    var __VLS_134;
    var __VLS_135;
    // @ts-ignore
    [];
    __VLS_128.slots['' /* empty slot name completion */];
}
var __VLS_128;
var __VLS_149;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149(__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70" })));
var __VLS_151 = __VLS_150.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon" }), { class: "text-foreground/70" })], __VLS_functionalComponentArgsRest(__VLS_150), false));
var __VLS_154;
var __VLS_155 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.isOpen = !__VLS_ctx.isOpen;
            // @ts-ignore
            [isOpen, isOpen,];
        } });
/** @type {__VLS_StyleScopedClasses['text-foreground/70']} */ ;
var __VLS_156 = __VLS_152.slots.default;
var __VLS_157;
/** @ts-ignore @type {typeof __VLS_components.MenuIcon} */
outline_1.Bars3Icon;
// @ts-ignore
var __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157(__assign({ class: "size-6" })));
var __VLS_159 = __VLS_158.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_158), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_152;
var __VLS_153;
var __VLS_162;
/** @ts-ignore @type {typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components.routerView | typeof __VLS_components.RouterView} */
routerView;
// @ts-ignore
var __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({}));
var __VLS_164 = __VLS_163.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_163), false));
{
    var __VLS_167 = __VLS_165.slots.default;
    var Component = __VLS_vSlot(__VLS_167)[0].Component;
    var __VLS_168 = (Component);
    // @ts-ignore
    var __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168(__assign(__assign({ 'onShowExport': {} }, { 'onShowLoad': {} }), { 'onShowSettings': {} })));
    var __VLS_170 = __VLS_169.apply(void 0, __spreadArray([__assign(__assign({ 'onShowExport': {} }, { 'onShowLoad': {} }), { 'onShowSettings': {} })], __VLS_functionalComponentArgsRest(__VLS_169), false));
    var __VLS_173 = void 0;
    var __VLS_174 = ({ showExport: {} },
        { onShowExport: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.showExportModal = true;
                // @ts-ignore
                [showExportModal,];
            } });
    var __VLS_175 = ({ showLoad: {} },
        { onShowLoad: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.showLoadModal = true;
                // @ts-ignore
                [showLoadModal,];
            } });
    var __VLS_176 = ({ showSettings: {} },
        { onShowSettings: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.isOpen = true;
                // @ts-ignore
                [isOpen,];
            } });
    var __VLS_171;
    var __VLS_172;
    // @ts-ignore
    [];
    __VLS_165.slots['' /* empty slot name completion */];
}
var __VLS_165;
if (__VLS_ctx.shortcutsEnabled) {
    var __VLS_177 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.GlobalEvents} */
    vue_global_events_1.GlobalEvents;
    // @ts-ignore
    var __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177(__assign(__assign(__assign(__assign({ 'onKeyup': {} }, { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeyup': {} }), { filter: (__VLS_ctx.inputEventFilter) })));
    var __VLS_179 = __VLS_178.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onKeyup': {} }, { 'onKeydown': {} }), { 'onKeydown': {} }), { 'onKeyup': {} }), { filter: (__VLS_ctx.inputEventFilter) })], __VLS_functionalComponentArgsRest(__VLS_178), false));
    var __VLS_182 = void 0;
    var __VLS_183 = ({ keyup: {} },
        { onKeyup: (__VLS_ctx.showKeyboardShortcuts) });
    var __VLS_184 = ({ keydown: {} },
        { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.shortcutsEnabled))
                    return;
                __VLS_ctx.showSearch = true;
                // @ts-ignore
                [showSearch, showKeyboardShortcuts, shortcutsEnabled, helpers_1.inputEventFilter,];
            } });
    var __VLS_185 = ({ keydown: {} },
        { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.shortcutsEnabled))
                    return;
                __VLS_ctx.showSearch = true;
                // @ts-ignore
                [showSearch,];
            } });
    var __VLS_186 = ({ keyup: {} },
        { onKeyup: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.shortcutsEnabled))
                    return;
                __VLS_ctx.showSearch = true;
                // @ts-ignore
                [showSearch,];
            } });
    var __VLS_180;
    var __VLS_181;
}
var __VLS_187;
/** @ts-ignore @type {typeof __VLS_components.GlobalEvents} */
vue_global_events_1.GlobalEvents;
// @ts-ignore
var __VLS_188 = __VLS_asFunctionalComponent1(__VLS_187, new __VLS_187(__assign(__assign(__assign(__assign(__assign({ 'onKeydown': {} }, { 'onKeyup': {} }), { 'onKeydown': {} }), { 'onKeyup': {} }), { 'onKeyup': {} }), { filter: (__VLS_ctx.inputEventFilter) })));
var __VLS_189 = __VLS_188.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onKeydown': {} }, { 'onKeyup': {} }), { 'onKeydown': {} }), { 'onKeyup': {} }), { 'onKeyup': {} }), { filter: (__VLS_ctx.inputEventFilter) })], __VLS_functionalComponentArgsRest(__VLS_188), false));
var __VLS_192;
var __VLS_193 = ({ keydown: {} },
    { onKeydown: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.undo();
            // @ts-ignore
            [undo, helpers_1.inputEventFilter,];
        } });
var __VLS_194 = ({ keyup: {} },
    { onKeyup: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.undo();
            // @ts-ignore
            [undo,];
        } });
var __VLS_195 = ({ keydown: {} },
    { onKeydown: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.redo();
            // @ts-ignore
            [redo,];
        } });
var __VLS_196 = ({ keyup: {} },
    { onKeyup: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.redo();
            // @ts-ignore
            [redo,];
        } });
var __VLS_197 = ({ keyup: {} },
    { onKeyup: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.redo();
            // @ts-ignore
            [redo,];
        } });
var __VLS_190;
var __VLS_191;
var __VLS_198 = ShortcutsModal_vue_1.default;
// @ts-ignore
var __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({
    modelValue: (__VLS_ctx.shortcutsModalVisible),
}));
var __VLS_200 = __VLS_199.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.shortcutsModalVisible),
    }], __VLS_functionalComponentArgsRest(__VLS_199), false));
var __VLS_203 = MainViewSlideOver_vue_1.default;
// @ts-ignore
var __VLS_204 = __VLS_asFunctionalComponent1(__VLS_203, new __VLS_203({
    modelValue: (__VLS_ctx.isOpen),
}));
var __VLS_205 = __VLS_204.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.isOpen),
    }], __VLS_functionalComponentArgsRest(__VLS_204), false));
var __VLS_208 = CommandPalette_vue_1.default;
// @ts-ignore
var __VLS_209 = __VLS_asFunctionalComponent1(__VLS_208, new __VLS_208(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onSelectUnit': {} }, { 'onSelectFeature': {} }), { 'onSelectLayer': {} }), { 'onSelectImageLayer': {} }), { 'onSelectEvent': {} }), { 'onSelectPlace': {} }), { 'onSelectAction': {} }), { modelValue: (__VLS_ctx.showSearch) })));
var __VLS_210 = __VLS_209.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onSelectUnit': {} }, { 'onSelectFeature': {} }), { 'onSelectLayer': {} }), { 'onSelectImageLayer': {} }), { 'onSelectEvent': {} }), { 'onSelectPlace': {} }), { 'onSelectAction': {} }), { modelValue: (__VLS_ctx.showSearch) })], __VLS_functionalComponentArgsRest(__VLS_209), false));
var __VLS_213;
var __VLS_214 = ({ selectUnit: {} },
    { onSelectUnit: (__VLS_ctx.onUnitSelect) });
var __VLS_215 = ({ selectFeature: {} },
    { onSelectFeature: (__VLS_ctx.onFeatureSelect) });
var __VLS_216 = ({ selectLayer: {} },
    { onSelectLayer: (__VLS_ctx.onLayerSelect) });
var __VLS_217 = ({ selectImageLayer: {} },
    { onSelectImageLayer: (__VLS_ctx.onImageLayerSelect) });
var __VLS_218 = ({ selectEvent: {} },
    { onSelectEvent: (__VLS_ctx.onEventSelect) });
var __VLS_219 = ({ selectPlace: {} },
    { onSelectPlace: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onPlaceSelectHook.trigger($event);
            // @ts-ignore
            [showSearch, isOpen, shortcutsModalVisible, onUnitSelect, onFeatureSelect, onLayerSelect, onImageLayerSelect, onEventSelect, onPlaceSelectHook,];
        } });
var __VLS_220 = ({ selectAction: {} },
    { onSelectAction: (__VLS_ctx.onScenarioAction) });
var __VLS_211;
var __VLS_212;
if (__VLS_ctx.showLoadModal) {
    var __VLS_221 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.LoadScenarioDialog} */
    LoadScenarioDialog;
    // @ts-ignore
    var __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221({
        modelValue: (__VLS_ctx.showLoadModal),
    }));
    var __VLS_223 = __VLS_222.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.showLoadModal),
        }], __VLS_functionalComponentArgsRest(__VLS_222), false));
}
if (__VLS_ctx.showDateModal) {
    var __VLS_226 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.InputDateModal} */
    InputDateModal;
    // @ts-ignore
    var __VLS_227 = __VLS_asFunctionalComponent1(__VLS_226, new __VLS_226(__assign(__assign({ 'onUpdate:timestamp': {} }, { 'onCancel': {} }), { modelValue: (__VLS_ctx.showDateModal), dialogTitle: (__VLS_ctx.dateModalTitle), timestamp: (__VLS_ctx.initialDateModalValue), timeZone: (__VLS_ctx.dateModalTimeZone) })));
    var __VLS_228 = __VLS_227.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:timestamp': {} }, { 'onCancel': {} }), { modelValue: (__VLS_ctx.showDateModal), dialogTitle: (__VLS_ctx.dateModalTitle), timestamp: (__VLS_ctx.initialDateModalValue), timeZone: (__VLS_ctx.dateModalTimeZone) })], __VLS_functionalComponentArgsRest(__VLS_227), false));
    var __VLS_231 = void 0;
    var __VLS_232 = ({ 'update:timestamp': {} },
        { 'onUpdate:timestamp': function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showDateModal))
                    return;
                __VLS_ctx.confirmDateModal($event);
                // @ts-ignore
                [onScenarioAction, showLoadModal, showLoadModal, showDateModal, showDateModal, dateModalTitle, initialDateModalValue, dateModalTimeZone, confirmDateModal,];
            } });
    var __VLS_233 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.cancelDateModal) });
    var __VLS_229;
    var __VLS_230;
}
if (__VLS_ctx.showSidcModal) {
    var __VLS_234 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SymbolPickerModal} */
    SymbolPickerModal;
    // @ts-ignore
    var __VLS_235 = __VLS_asFunctionalComponent1(__VLS_234, new __VLS_234(__assign(__assign({ 'onUpdate:sidc': {} }, { 'onCancel': {} }), { initialSidc: (__VLS_ctx.initialSidcModalValue), dialogTitle: (__VLS_ctx.sidcModalTitle), hideModifiers: __VLS_ctx.hideModifiers, hideSymbolColor: __VLS_ctx.hideSymbolColor, hideCustomSymbols: __VLS_ctx.hideCustomSymbols, inheritedSymbolOptions: __VLS_ctx.inheritedSymbolOptions, symbolOptions: __VLS_ctx.symbolOptions, initialTab: (__VLS_ctx.sidcModalInitialTab), reinforcedStatus: (__VLS_ctx.initialReinforcedReduced) })));
    var __VLS_236 = __VLS_235.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:sidc': {} }, { 'onCancel': {} }), { initialSidc: (__VLS_ctx.initialSidcModalValue), dialogTitle: (__VLS_ctx.sidcModalTitle), hideModifiers: __VLS_ctx.hideModifiers, hideSymbolColor: __VLS_ctx.hideSymbolColor, hideCustomSymbols: __VLS_ctx.hideCustomSymbols, inheritedSymbolOptions: __VLS_ctx.inheritedSymbolOptions, symbolOptions: __VLS_ctx.symbolOptions, initialTab: (__VLS_ctx.sidcModalInitialTab), reinforcedStatus: (__VLS_ctx.initialReinforcedReduced) })], __VLS_functionalComponentArgsRest(__VLS_235), false));
    var __VLS_239 = void 0;
    var __VLS_240 = ({ 'update:sidc': {} },
        { 'onUpdate:sidc': function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showSidcModal))
                    return;
                __VLS_ctx.confirmSidcModal($event);
                // @ts-ignore
                [cancelDateModal, showSidcModal, initialSidcModalValue, sidcModalTitle, hideModifiers, hideSymbolColor, hideCustomSymbols, inheritedSymbolOptions, symbolOptions, sidcModalInitialTab, initialReinforcedReduced, confirmSidcModal,];
            } });
    var __VLS_241 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.cancelSidcModal) });
    var __VLS_237;
    var __VLS_238;
}
if (__VLS_ctx.showExportModal) {
    var __VLS_242 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ExportScenarioModal} */
    ExportScenarioModal;
    // @ts-ignore
    var __VLS_243 = __VLS_asFunctionalComponent1(__VLS_242, new __VLS_242({
        modelValue: (__VLS_ctx.showExportModal),
    }));
    var __VLS_244 = __VLS_243.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.showExportModal),
        }], __VLS_functionalComponentArgsRest(__VLS_243), false));
}
if (__VLS_ctx.showImportModal) {
    var __VLS_247 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ImportModal} */
    ImportModal;
    // @ts-ignore
    var __VLS_248 = __VLS_asFunctionalComponent1(__VLS_247, new __VLS_247({
        modelValue: (__VLS_ctx.showImportModal),
    }));
    var __VLS_249 = __VLS_248.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.showImportModal),
        }], __VLS_functionalComponentArgsRest(__VLS_248), false));
}
if (__VLS_ctx.showShareUrlModal) {
    var __VLS_252 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ShareScenarioUrlModal} */
    ShareScenarioUrlModal;
    // @ts-ignore
    var __VLS_253 = __VLS_asFunctionalComponent1(__VLS_252, new __VLS_252({
        modelValue: (__VLS_ctx.showShareUrlModal),
    }));
    var __VLS_254 = __VLS_253.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.showShareUrlModal),
        }], __VLS_functionalComponentArgsRest(__VLS_253), false));
}
if (__VLS_ctx.showShareModal) {
    var __VLS_257 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ShareScenarioModal} */
    ShareScenarioModal;
    // @ts-ignore
    var __VLS_258 = __VLS_asFunctionalComponent1(__VLS_257, new __VLS_257({
        modelValue: (__VLS_ctx.showShareModal),
    }));
    var __VLS_259 = __VLS_258.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.showShareModal),
        }], __VLS_functionalComponentArgsRest(__VLS_258), false));
}
if (__VLS_ctx.showEncryptModal) {
    var __VLS_262 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.EncryptScenarioModal} */
    EncryptScenarioModal;
    // @ts-ignore
    var __VLS_263 = __VLS_asFunctionalComponent1(__VLS_262, new __VLS_262({
        modelValue: (__VLS_ctx.showEncryptModal),
    }));
    var __VLS_264 = __VLS_263.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.showEncryptModal),
        }], __VLS_functionalComponentArgsRest(__VLS_263), false));
}
if (__VLS_ctx.isOverDropZone) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background/80 fixed inset-0 z-50 flex items-center justify-center" }));
    /** @type {__VLS_StyleScopedClasses['bg-background/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-foreground bg-background/40 rounded border p-4" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-background/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
}
if (__VLS_ctx.uiStore.debugMode) {
    var __VLS_267 = DebugInfo_vue_1.default;
    // @ts-ignore
    var __VLS_268 = __VLS_asFunctionalComponent1(__VLS_267, new __VLS_267({}));
    var __VLS_269 = __VLS_268.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_268), false));
}
// @ts-ignore
[showShareModal, showShareModal, showExportModal, showExportModal, cancelSidcModal, showImportModal, showImportModal, showShareUrlModal, showShareUrlModal, showEncryptModal, showEncryptModal, isOverDropZone, uiStore,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
