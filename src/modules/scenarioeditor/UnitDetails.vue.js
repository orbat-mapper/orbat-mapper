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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var geoStore_1 = require("@/stores/geoStore");
var vue_global_events_1 = require("vue-global-events");
var helpers_1 = require("@/components/helpers");
var DescriptionItem_vue_1 = require("@/components/DescriptionItem.vue");
var core_1 = require("@vueuse/core");
var formatting_1 = require("@/composables/formatting");
var UnitPanelState_vue_1 = require("./UnitPanelState.vue");
var scenarioActions_1 = require("@/composables/scenarioActions");
var constants_1 = require("@/types/constants");
var SplitButton_vue_1 = require("@/components/SplitButton.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var utils_2 = require("@/geo/utils");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var geoMapLocation_1 = require("@/composables/geoMapLocation");
var uiStore_1 = require("@/stores/uiStore");
var sidc_1 = require("@/symbology/sidc");
var selectedStore_1 = require("@/stores/selectedStore");
var tabs_1 = require("@/components/ui/tabs");
var EditableLabel_vue_1 = require("@/components/EditableLabel.vue");
var UnitDetailsMapDisplay_vue_1 = require("@/modules/scenarioeditor/UnitDetailsMapDisplay.vue");
var tabStore_1 = require("@/stores/tabStore");
var pinia_1 = require("pinia");
var UnitDetailsToe_vue_1 = require("@/modules/scenarioeditor/UnitDetailsToe.vue");
var ScrollTabs_vue_1 = require("@/components/ScrollTabs.vue");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var EditMediaForm_vue_1 = require("@/modules/scenarioeditor/EditMediaForm.vue");
var EditMetaForm_vue_1 = require("@/modules/scenarioeditor/EditMetaForm.vue");
var ItemMedia_vue_1 = require("@/modules/scenarioeditor/ItemMedia.vue");
var UnitDetailsProperties_vue_1 = require("@/modules/scenarioeditor/UnitDetailsProperties.vue");
var UnitDetailsSymbol_vue_1 = require("@/modules/scenarioeditor/UnitDetailsSymbol.vue");
var button_1 = require("@/components/ui/button");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var draggables_ts_1 = require("@/types/draggables.ts");
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var constants_ts_1 = require("@/config/constants.ts");
var badge_1 = require("@/components/ui/badge");
var FeatureTransformations = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/modules/scenarioeditor/FeatureTransformations.vue"); }); });
var props = defineProps();
var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var store = activeScenario.store, getUnitById = activeScenario.helpers.getUnitById, addUnitPosition = activeScenario.geo.addUnitPosition, _b = activeScenario.unitActions, updateUnit = _b.updateUnit, getUnitHierarchy = _b.getUnitHierarchy, getCombinedSymbolOptions = _b.getCombinedSymbolOptions, isUnitLocked = _b.isUnitLocked, updateUnitLocked = _b.updateUnitLocked;
var onUnitSelectHook = (0, utils_1.injectStrict)(injects_1.searchActionsKey).onUnitSelectHook;
var unitStatusMap = store.state.unitStatusMap;
var selectedTab = (0, pinia_1.storeToRefs)((0, tabStore_1.useTabStore)()).unitDetailsTab;
var unitName = (0, vue_1.ref)("");
var shortName = (0, vue_1.ref)("");
var truncateUnits = (0, vue_1.ref)(true);
var isDragged = (0, vue_1.ref)(false);
var elRef = (0, vue_1.useTemplateRef)({});
var tabList = (0, vue_1.computed)(function () {
    var base = [
        { label: "Details", value: "0" },
        { label: "Map symbol", value: "1" },
        { label: "Unit state", value: "2" },
        { label: "TO&E/S", value: "3" },
        { label: "Map display", value: "4" },
        { label: "Properties", value: "5" },
        { label: "Transform", value: "6" },
    ];
    if (uiStore.debugMode) {
        base.push({ label: "Debug", value: "7" });
    }
    return base;
});
var selectedTabString = (0, vue_1.computed)({
    get: function () { return selectedTab.value.toString(); },
    set: function (v) {
        selectedTab.value = Number(v);
    },
});
var unit = (0, vue_1.computed)(function () {
    return getUnitById(props.unitId);
});
var unitStatus = (0, vue_1.computed)(function () {
    var _a, _b;
    var status = ((_a = unit.value._state) === null || _a === void 0 ? void 0 : _a.status) || unit.value.status;
    return status ? (_b = unitStatusMap[status]) === null || _b === void 0 ? void 0 : _b.name : undefined;
});
var isLocked = (0, vue_1.computed)(function () { return isUnitLocked(props.unitId); });
var geoStore = (0, geoStore_1.useGeoStore)();
var unitSettings = (0, geoStore_1.useUnitSettingsStore)();
var getModalSidc = (0, utils_1.injectStrict)(injects_1.sidcModalKey).getModalSidc;
var unitMenuItems = (0, vue_1.computed)(function () { return [
    {
        label: "Change symbol",
        action: function () { return handleChangeSymbol(); },
        disabled: isLocked.value,
    },
    { label: "Edit unit data", action: function () { return toggleEditMode(); }, disabled: isLocked.value },
    {
        label: "Add or change image",
        action: function () { return toggleEditMediaMode(); },
        disabled: isLocked.value,
    },
    { label: "Remove unit image", action: function () { return removeMedia(); }, disabled: isLocked.value },
    unit.value.locked
        ? {
            label: "Unlock unit",
            action: function () { return setLocked(false); },
            disabled: isUnitLocked(props.unitId, { excludeUnit: true }),
        }
        : {
            label: "Lock unit",
            action: function () { return setLocked(true); },
            disabled: isUnitLocked(props.unitId, { excludeUnit: true }),
        },
]; });
(0, vue_1.watchEffect)(function (onCleanup) {
    var el = (0, core_1.unrefElement)(elRef.value);
    if (!el)
        return;
    var dndFunction = (0, adapter_1.draggable)({
        element: el,
        getInitialData: function () { return (0, draggables_ts_1.getUnitDragItem)({ unit: unit.value }, "detailsPanel"); },
        onDragStart: function () { return (isDragged.value = true); },
        onDrop: function () { return (isDragged.value = false); },
        canDrag: function () { return !isUnitLocked(unit.value.id); },
        // onGenerateDragPreview({ nativeSetDragImage }) {
        //   setCustomNativeDragPreview({
        //     getOffset: pointerOutsideOfPreview({ x: "16px", y: "8px" }),
        //     render: ({ container }) => {
        //       return render(
        //         h(UnitSymbol, {
        //           sidc: unit.value.sidc,
        //           options: combinedSymbolOptions.value,
        //           size: 25,
        //         }),
        //         container,
        //       );
        //     },
        //     nativeSetDragImage,
        //   });
        // },
    });
    onCleanup(function () { return dndFunction(); });
});
(0, vue_1.watch)(function () { var _a; return (_a = unit.value) === null || _a === void 0 ? void 0 : _a.name; }, function () {
    var _a;
    unitName.value = (_a = unit.value) === null || _a === void 0 ? void 0 : _a.name;
}, { immediate: true });
(0, vue_1.watch)(function () { var _a; return (_a = unit.value) === null || _a === void 0 ? void 0 : _a.shortName; }, function () {
    var _a;
    shortName.value = ((_a = unit.value) === null || _a === void 0 ? void 0 : _a.shortName) || "";
}, { immediate: true });
(0, vue_1.watch)(function () { return unitSettings.editHistory; }, function (v) {
    if (v && !unitSettings.showHistory) {
        unitSettings.showHistory = true;
    }
});
var combinedSymbolOptions = (0, vue_1.computed)(function () {
    return __assign(__assign({}, getCombinedSymbolOptions(unit.value)), { outlineWidth: 8 });
});
var unitSidc = (0, vue_1.computed)(function () { var _a; return ((_a = unit.value._state) === null || _a === void 0 ? void 0 : _a.sidc) || unit.value.sidc; });
var _c = (0, geoMapLocation_1.useGetMapLocation)(geoStore.olMap), startGetLocation = _c.start, isGetLocationActive = _c.isActive, onGetLocation = _c.onGetLocation;
var uiStore = (0, uiStore_1.useUiStore)();
var _d = (0, selectedStore_1.useSelectedItems)(), selectedUnitIds = _d.selectedUnitIds, clearSelection = _d.clear;
var isMultiMode = (0, vue_1.computed)(function () { return selectedUnitIds.value.size > 1; });
var selectedUnits = (0, vue_1.computed)(function () {
    return __spreadArray([], selectedUnitIds.value, true).map(function (id) { return getUnitById(id); });
});
var visibleSelectedUnits = (0, vue_1.computed)(function () {
    if (selectedUnits.value.length > 50 && truncateUnits.value) {
        return selectedUnits.value.slice(0, 50);
    }
    return selectedUnits.value;
});
var isTruncated = (0, vue_1.computed)(function () { return selectedUnits.value.length > visibleSelectedUnits.value.length; });
onGetLocation(function (location) { return addUnitPosition(props.unitId, location); });
var isEditMode = (0, vue_1.ref)(false);
var toggleEditMode = (0, core_1.useToggle)(isEditMode);
var isEditMediaMode = (0, vue_1.ref)(false);
var toggleEditMediaMode = (0, core_1.useToggle)(isEditMediaMode);
var onFormSubmit = function (unitUpdate) {
    updateUnit(props.unitId, unitUpdate);
    toggleEditMode();
};
function removeMedia() {
    updateUnit(props.unitId, { media: [] });
}
function setLocked(locked) {
    updateUnitLocked(props.unitId, locked);
}
var hDescription = (0, vue_1.computed)(function () { return (0, formatting_1.renderMarkdown)(unit.value.description || ""); });
var hasPosition = (0, vue_1.computed)(function () { var _a; return Boolean((_a = unit.value._state) === null || _a === void 0 ? void 0 : _a.location); });
var media = (0, vue_1.computed)(function () {
    var media = unit.value.media;
    if (!media || isMultiMode.value)
        return;
    return media[0];
});
(0, vue_1.watch)(isEditMode, function (v) {
    if (!v)
        return;
    isEditMediaMode.value = false;
    selectedTab.value = 0;
}, { immediate: true });
(0, vue_1.watch)(isEditMediaMode, function (v) {
    if (!v)
        return;
    isEditMode.value = false;
    selectedTab.value = 0;
});
(0, vue_1.watch)(isGetLocationActive, function (isActive) {
    uiStore.getLocationActive = isActive;
}, { immediate: true });
var onUnitAction = (0, scenarioActions_1.useUnitActions)().onUnitAction;
function actionWrapper(action) {
    if (isMultiMode.value) {
        onUnitAction(selectedUnits.value, action);
        return;
    }
    onUnitAction(unit.value, action);
}
function updateMedia(mediaUpdate) {
    if (!mediaUpdate)
        return;
    var _a = unit.value.media, media = _a === void 0 ? [] : _a;
    var newMedia = __assign(__assign({}, media[0]), mediaUpdate);
    updateUnit(props.unitId, { media: [newMedia] });
    isEditMediaMode.value = false;
}
var buttonItems = (0, vue_1.computed)(function () { return [
    {
        label: "Duplicate",
        onClick: function () { return actionWrapper(constants_1.UnitActions.Clone); },
        disabled: isLocked.value,
    },
    {
        label: "Duplicate (with state)",
        onClick: function () { return actionWrapper(constants_1.UnitActions.CloneWithState); },
        disabled: isLocked.value,
    },
    {
        label: "Duplicate hierarchy",
        onClick: function () { return actionWrapper(constants_1.UnitActions.CloneWithSubordinates); },
        disabled: isLocked.value,
    },
    {
        label: "Duplicate hierarchy (with state)",
        onClick: function () { return actionWrapper(constants_1.UnitActions.CloneWithSubordinatesAndState); },
        disabled: isLocked.value,
    },
    {
        label: "Move up",
        onClick: function () { return actionWrapper(constants_1.UnitActions.MoveUp); },
        disabled: isLocked.value,
    },
    {
        label: "Move down",
        onClick: function () { return actionWrapper(constants_1.UnitActions.MoveDown); },
        disabled: isLocked.value,
    },
    {
        label: "Create subordinate",
        onClick: function () { return actionWrapper(constants_1.UnitActions.AddSubordinate); },
        disabled: isLocked.value,
    },
    {
        label: "Zoom",
        onClick: function () { return actionWrapper(constants_1.UnitActions.Zoom); },
    },
    {
        label: "Pan",
        onClick: function () { return actionWrapper(constants_1.UnitActions.Pan); },
        disabled: !hasPosition.value,
    },
    {
        label: "Delete",
        onClick: function () { return actionWrapper(constants_1.UnitActions.Delete); },
        disabled: isLocked.value,
    },
    {
        label: "Clear state",
        onClick: function () { return actionWrapper(constants_1.UnitActions.ClearState); },
        disabled: isLocked.value,
    },
]; });
function handleChangeSymbol() {
    return __awaiter(this, void 0, void 0, function () {
        var newSidcValue, sidc_2, _a, symbolOptions, reinforcedStatus, isCustomSymbol_1, dataUpdate_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (isLocked.value)
                        return [2 /*return*/];
                    return [4 /*yield*/, getModalSidc(unit.value.sidc, {
                            symbolOptions: unit.value.symbolOptions,
                            inheritedSymbolOptions: getCombinedSymbolOptions(unit.value, true),
                            reinforcedStatus: unit.value.reinforcedStatus,
                        })];
                case 1:
                    newSidcValue = _b.sent();
                    if (newSidcValue !== undefined) {
                        sidc_2 = newSidcValue.sidc, _a = newSidcValue.symbolOptions, symbolOptions = _a === void 0 ? {} : _a, reinforcedStatus = newSidcValue.reinforcedStatus;
                        isCustomSymbol_1 = sidc_2.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX);
                        dataUpdate_1 = { sidc: sidc_2, symbolOptions: symbolOptions };
                        if (reinforcedStatus)
                            dataUpdate_1.reinforcedStatus = reinforcedStatus;
                        if (isMultiMode.value) {
                            store.groupUpdate(function () {
                                return selectedUnitIds.value.forEach(function (unitId) {
                                    var side = getUnitHierarchy(unitId).side;
                                    dataUpdate_1.sidc = (0, helpers_1.setCharAt)(sidc_2, isCustomSymbol_1 ? sidc_1.CUSTOM_SYMBOL_SID_INDEX : sidc_1.SID_INDEX, side.standardIdentity);
                                    updateUnit(unitId, dataUpdate_1);
                                });
                            });
                        }
                        else
                            updateUnit(props.unitId, dataUpdate_1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function locateInOrbat() {
    onUnitSelectHook.trigger({ unitId: props.unitId, options: { noZoom: true } });
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.unit) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "@container" }, { key: (__VLS_ctx.unit.id) }));
    /** @type {__VLS_StyleScopedClasses['@container']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "-mx-4 px-2 pt-2" }));
    /** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    if (!__VLS_ctx.isMultiMode) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.unit))
                    return;
                if (!(!__VLS_ctx.isMultiMode))
                    return;
                __VLS_ctx.handleChangeSymbol();
                // @ts-ignore
                [unit, unit, media, media, isMultiMode, handleChangeSymbol,];
            } }, { type: "button" }), { class: "mr-2 inline-flex w-16 justify-start" }), { ref: "elRef" }));
        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
        var __VLS_5 = UnitSymbol_vue_1.default;
        // @ts-ignore
        var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ class: "w-16" }, { sidc: (__VLS_ctx.unitSidc), size: (34), options: (__VLS_ctx.combinedSymbolOptions) })));
        var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ class: "w-16" }, { sidc: (__VLS_ctx.unitSidc), size: (34), options: (__VLS_ctx.combinedSymbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_6), false));
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mt-1.5 flex-auto pr-4" }));
        /** @type {__VLS_StyleScopedClasses['-mt-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
        var __VLS_10 = EditableLabel_vue_1.default;
        // @ts-ignore
        var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10(__assign(__assign(__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.unitName) }), { class: "relative z-10 bg-transparent" }), { disabled: (__VLS_ctx.isLocked) })));
        var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUpdateValue': {} }, { modelValue: (__VLS_ctx.unitName) }), { class: "relative z-10 bg-transparent" }), { disabled: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_11), false));
        var __VLS_15 = void 0;
        var __VLS_16 = ({ updateValue: {} },
            { onUpdateValue: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.unit))
                        return;
                    if (!(!__VLS_ctx.isMultiMode))
                        return;
                    __VLS_ctx.updateUnit(__VLS_ctx.unitId, { name: $event });
                    // @ts-ignore
                    [unitSidc, combinedSymbolOptions, unitName, isLocked, updateUnit, unitId,];
                } });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
        var __VLS_13;
        var __VLS_14;
        var __VLS_17 = EditableLabel_vue_1.default;
        // @ts-ignore
        var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign(__assign({ 'onUpdateValue': {} }, { class: "relative -top-4" }), { modelValue: (__VLS_ctx.shortName), textClass: "text-sm text-muted-foreground", disabled: (__VLS_ctx.isLocked) })));
        var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdateValue': {} }, { class: "relative -top-4" }), { modelValue: (__VLS_ctx.shortName), textClass: "text-sm text-muted-foreground", disabled: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_18), false));
        var __VLS_22 = void 0;
        var __VLS_23 = ({ updateValue: {} },
            { onUpdateValue: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.unit))
                        return;
                    if (!(!__VLS_ctx.isMultiMode))
                        return;
                    __VLS_ctx.updateUnit(__VLS_ctx.unitId, { shortName: $event });
                    // @ts-ignore
                    [isLocked, updateUnit, unitId, shortName,];
                } });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['-top-4']} */ ;
        var __VLS_20;
        var __VLS_21;
        if (__VLS_ctx.isLocked) {
            var __VLS_24 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.IconLockOutline} */
            vue_mdi_1.IconLockOutline;
            // @ts-ignore
            var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ class: "text-muted-foreground size-5" })));
            var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-5" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
        }
        if (__VLS_ctx.unitStatus) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            var __VLS_29 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
            badge_1.Badge;
            // @ts-ignore
            var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({}));
            var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_30), false));
            var __VLS_34 = __VLS_32.slots.default;
            (__VLS_ctx.unitStatus);
            // @ts-ignore
            [isLocked, unitStatus, unitStatus,];
            var __VLS_32;
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "font-medium" }));
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.selectedUnitIds.size);
        var __VLS_35 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
        button_1.Button;
        // @ts-ignore
        var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign({ 'onClick': {} }, { type: "button", size: "sm", variant: "outline" })));
        var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", size: "sm", variant: "outline" })], __VLS_functionalComponentArgsRest(__VLS_36), false));
        var __VLS_40 = void 0;
        var __VLS_41 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.unit))
                        return;
                    if (!!(!__VLS_ctx.isMultiMode))
                        return;
                    __VLS_ctx.clearSelection();
                    // @ts-ignore
                    [selectedUnitIds, clearSelection,];
                } });
        var __VLS_42 = __VLS_38.slots.default;
        // @ts-ignore
        [];
        var __VLS_38;
        var __VLS_39;
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "relative my-4 flex w-full flex-wrap gap-1 pb-4" }));
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['my-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
        for (var _i = 0, _e = __VLS_vFor((__VLS_ctx.visibleSelectedUnits)); _i < _e.length; _i++) {
            var sUnit = _e[_i][0];
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "relative flex" }));
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            var __VLS_43 = UnitSymbol_vue_1.default;
            // @ts-ignore
            var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43(__assign(__assign({ sidc: (sUnit.sidc), size: (24) }, { class: "block w-9" }), { options: (__assign(__assign({}, __VLS_ctx.getCombinedSymbolOptions(sUnit)), { outlineWidth: 8 })) })));
            var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([__assign(__assign({ sidc: (sUnit.sidc), size: (24) }, { class: "block w-9" }), { options: (__assign(__assign({}, __VLS_ctx.getCombinedSymbolOptions(sUnit)), { outlineWidth: 8 })) })], __VLS_functionalComponentArgsRest(__VLS_44), false));
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
            if ((_a = sUnit._state) === null || _a === void 0 ? void 0 : _a.location) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-red-700" }));
                /** @type {__VLS_StyleScopedClasses['text-red-700']} */ ;
            }
            // @ts-ignore
            [visibleSelectedUnits, getCombinedSymbolOptions,];
        }
        if (__VLS_ctx.isTruncated) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.unit))
                        return;
                    if (!!(!__VLS_ctx.isMultiMode))
                        return;
                    if (!(__VLS_ctx.isTruncated))
                        return;
                    __VLS_ctx.truncateUnits = !__VLS_ctx.truncateUnits;
                    // @ts-ignore
                    [isTruncated, truncateUnits, truncateUnits,];
                } }, { type: "button" }), { class: "bg-opacity-80 bg-muted text-muted-foreground absolute right-0 bottom-0 left-0 border p-2 text-center" }));
            /** @type {__VLS_StyleScopedClasses['bg-opacity-80']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            (__VLS_ctx.selectedUnits.length - __VLS_ctx.visibleSelectedUnits.length);
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)(__assign({ class: "-mt-2 mb-4 flex items-center justify-between" }));
    /** @type {__VLS_StyleScopedClasses['-mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-0.5" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
    var __VLS_48 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48(__assign({ 'onClick': {} }, { title: "Zoom to" })));
    var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Zoom to" })], __VLS_functionalComponentArgsRest(__VLS_49), false));
    var __VLS_53 = void 0;
    var __VLS_54 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.unit))
                    return;
                __VLS_ctx.actionWrapper(__VLS_ctx.UnitActions.Zoom);
                // @ts-ignore
                [visibleSelectedUnits, selectedUnits, actionWrapper, constants_1.UnitActions,];
            } });
    var __VLS_55 = __VLS_51.slots.default;
    var __VLS_56 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ZoomIcon} */
    vue_mdi_1.IconMagnifyExpand;
    // @ts-ignore
    var __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56(__assign({ class: "size-5" })));
    var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_57), false));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_51;
    var __VLS_52;
    var __VLS_61 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61(__assign({ 'onClick': {} }, { title: "Edit unit", disabled: (__VLS_ctx.isMultiMode || __VLS_ctx.isLocked) })));
    var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Edit unit", disabled: (__VLS_ctx.isMultiMode || __VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_62), false));
    var __VLS_66 = void 0;
    var __VLS_67 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.unit))
                    return;
                __VLS_ctx.toggleEditMode();
                // @ts-ignore
                [isMultiMode, isLocked, toggleEditMode,];
            } });
    var __VLS_68 = __VLS_64.slots.default;
    var __VLS_69 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.EditIcon} */
    vue_mdi_1.IconPencil;
    // @ts-ignore
    var __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69(__assign({ class: "size-5" })));
    var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_70), false));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_64;
    var __VLS_65;
    var __VLS_74 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74(__assign({ 'onClick': {} }, { title: "Add/modify unit image", disabled: (__VLS_ctx.isMultiMode || __VLS_ctx.isLocked) })));
    var __VLS_76 = __VLS_75.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Add/modify unit image", disabled: (__VLS_ctx.isMultiMode || __VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_75), false));
    var __VLS_79 = void 0;
    var __VLS_80 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.unit))
                    return;
                __VLS_ctx.toggleEditMediaMode();
                // @ts-ignore
                [isMultiMode, isLocked, toggleEditMediaMode,];
            } });
    var __VLS_81 = __VLS_77.slots.default;
    var __VLS_82 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ImageIcon} */
    vue_mdi_1.IconImage;
    // @ts-ignore
    var __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82(__assign({ class: "size-5" })));
    var __VLS_84 = __VLS_83.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_83), false));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_77;
    var __VLS_78;
    var __VLS_87 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87(__assign({ 'onClick': {} }, { title: "Set unit location", disabled: (__VLS_ctx.isMultiMode || __VLS_ctx.isLocked) })));
    var __VLS_89 = __VLS_88.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Set unit location", disabled: (__VLS_ctx.isMultiMode || __VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_88), false));
    var __VLS_92 = void 0;
    var __VLS_93 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.unit))
                    return;
                __VLS_ctx.startGetLocation();
                // @ts-ignore
                [isMultiMode, isLocked, startGetLocation,];
            } });
    var __VLS_94 = __VLS_90.slots.default;
    var __VLS_95 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconCrosshairsGps} */
    vue_mdi_1.IconCrosshairsGps;
    // @ts-ignore
    var __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95(__assign({ class: "size-5" }, { 'aria-hidden': "true" })));
    var __VLS_97 = __VLS_96.apply(void 0, __spreadArray([__assign({ class: "size-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_96), false));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_90;
    var __VLS_91;
    var __VLS_100 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100(__assign({ 'onClick': {} }, { title: "Show in ORBAT", disabled: (__VLS_ctx.isMultiMode) })));
    var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Show in ORBAT", disabled: (__VLS_ctx.isMultiMode) })], __VLS_functionalComponentArgsRest(__VLS_101), false));
    var __VLS_105 = void 0;
    var __VLS_106 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.unit))
                    return;
                __VLS_ctx.locateInOrbat();
                // @ts-ignore
                [isMultiMode, locateInOrbat,];
            } });
    var __VLS_107 = __VLS_103.slots.default;
    var __VLS_108 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TreeLocateIcon} */
    vue_mdi_1.IconFileTreeOutline;
    // @ts-ignore
    var __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108(__assign({ class: "size-5" }, { 'aria-hidden': "true" })));
    var __VLS_110 = __VLS_109.apply(void 0, __spreadArray([__assign({ class: "size-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_109), false));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_103;
    var __VLS_104;
    var __VLS_113 = SplitButton_vue_1.default;
    // @ts-ignore
    var __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113(__assign({ class: "ml-1" }, { triggerClass: "max-w-24", items: (__VLS_ctx.buttonItems), activeItem: (__VLS_ctx.uiStore.activeItem) })));
    var __VLS_115 = __VLS_114.apply(void 0, __spreadArray([__assign({ class: "ml-1" }, { triggerClass: "max-w-24", items: (__VLS_ctx.buttonItems), activeItem: (__VLS_ctx.uiStore.activeItem) })], __VLS_functionalComponentArgsRest(__VLS_114), false));
    /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    var __VLS_118 = DotsMenu_vue_1.default;
    // @ts-ignore
    var __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
        items: (__VLS_ctx.unitMenuItems),
    }));
    var __VLS_120 = __VLS_119.apply(void 0, __spreadArray([{
            items: (__VLS_ctx.unitMenuItems),
        }], __VLS_functionalComponentArgsRest(__VLS_119), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mx-4" }));
    /** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
    var __VLS_123 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
    // @ts-ignore
    var __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123(__assign({ items: (__VLS_ctx.tabList), modelValue: (__VLS_ctx.selectedTabString) }, { class: "" })));
    var __VLS_125 = __VLS_124.apply(void 0, __spreadArray([__assign({ items: (__VLS_ctx.tabList), modelValue: (__VLS_ctx.selectedTabString) }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_124), false));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    var __VLS_128 = __VLS_126.slots.default;
    var __VLS_129 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129(__assign({ value: "0" }, { class: "mx-4 pt-4" })));
    var __VLS_131 = __VLS_130.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "mx-4 pt-4" })], __VLS_functionalComponentArgsRest(__VLS_130), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    var __VLS_134 = __VLS_132.slots.default;
    if (!__VLS_ctx.isMultiMode) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "relative" }));
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        if (__VLS_ctx.isEditMode) {
            var __VLS_135 = EditMetaForm_vue_1.default;
            // @ts-ignore
            var __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135(__assign(__assign({ 'onUpdate': {} }, { 'onCancel': {} }), { item: (__VLS_ctx.unit) })));
            var __VLS_137 = __VLS_136.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate': {} }, { 'onCancel': {} }), { item: (__VLS_ctx.unit) })], __VLS_functionalComponentArgsRest(__VLS_136), false));
            var __VLS_140 = void 0;
            var __VLS_141 = ({ update: {} },
                { onUpdate: (__VLS_ctx.onFormSubmit) });
            var __VLS_142 = ({ cancel: {} },
                { onCancel: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(__VLS_ctx.unit))
                            return;
                        if (!(!__VLS_ctx.isMultiMode))
                            return;
                        if (!(__VLS_ctx.isEditMode))
                            return;
                        __VLS_ctx.toggleEditMode();
                        // @ts-ignore
                        [unit, isMultiMode, toggleEditMode, buttonItems, uiStore, unitMenuItems, tabList, selectedTabString, isEditMode, onFormSubmit,];
                    } });
            var __VLS_138;
            var __VLS_139;
        }
        else if (__VLS_ctx.isEditMediaMode) {
            var __VLS_143 = EditMediaForm_vue_1.default;
            // @ts-ignore
            var __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143(__assign(__assign({ 'onCancel': {} }, { 'onUpdate': {} }), { media: (__VLS_ctx.media) })));
            var __VLS_145 = __VLS_144.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onUpdate': {} }), { media: (__VLS_ctx.media) })], __VLS_functionalComponentArgsRest(__VLS_144), false));
            var __VLS_148 = void 0;
            var __VLS_149 = ({ cancel: {} },
                { onCancel: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(__VLS_ctx.unit))
                            return;
                        if (!(!__VLS_ctx.isMultiMode))
                            return;
                        if (!!(__VLS_ctx.isEditMode))
                            return;
                        if (!(__VLS_ctx.isEditMediaMode))
                            return;
                        __VLS_ctx.toggleEditMediaMode();
                        // @ts-ignore
                        [media, toggleEditMediaMode, isEditMediaMode,];
                    } });
            var __VLS_150 = ({ update: {} },
                { onUpdate: (__VLS_ctx.updateMedia) });
            var __VLS_146;
            var __VLS_147;
        }
        else if (!__VLS_ctx.isMultiMode) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mb-4 space-y-4" }));
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            var __VLS_151 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
            // @ts-ignore
            var __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
                label: "Name",
            }));
            var __VLS_153 = __VLS_152.apply(void 0, __spreadArray([{
                    label: "Name",
                }], __VLS_functionalComponentArgsRest(__VLS_152), false));
            var __VLS_156 = __VLS_154.slots.default;
            (__VLS_ctx.unit.name);
            // @ts-ignore
            [unit, isMultiMode, updateMedia,];
            var __VLS_154;
            if (__VLS_ctx.unit.shortName) {
                var __VLS_157 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
                // @ts-ignore
                var __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
                    label: "Short name",
                }));
                var __VLS_159 = __VLS_158.apply(void 0, __spreadArray([{
                        label: "Short name",
                    }], __VLS_functionalComponentArgsRest(__VLS_158), false));
                var __VLS_162 = __VLS_160.slots.default;
                (__VLS_ctx.unit.shortName);
                // @ts-ignore
                [unit, unit,];
                var __VLS_160;
            }
            if (__VLS_ctx.unit.externalUrl) {
                var __VLS_163 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
                // @ts-ignore
                var __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
                    label: "External URL",
                    ddClass: "truncate",
                }));
                var __VLS_165 = __VLS_164.apply(void 0, __spreadArray([{
                        label: "External URL",
                        ddClass: "truncate",
                    }], __VLS_functionalComponentArgsRest(__VLS_164), false));
                var __VLS_168 = __VLS_166.slots.default;
                __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign(__assign({ target: "_blank", draggable: "false" }, { class: "underline" }), { href: (__VLS_ctx.unit.externalUrl) }));
                /** @type {__VLS_StyleScopedClasses['underline']} */ ;
                (__VLS_ctx.unit.externalUrl);
                // @ts-ignore
                [unit, unit, unit,];
                var __VLS_166;
            }
            if (__VLS_ctx.unit.description) {
                var __VLS_169 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
                // @ts-ignore
                var __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
                    label: "Description",
                }));
                var __VLS_171 = __VLS_170.apply(void 0, __spreadArray([{
                        label: "Description",
                    }], __VLS_functionalComponentArgsRest(__VLS_170), false));
                var __VLS_174 = __VLS_172.slots.default;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose prose-sm dark:prose-invert" }));
                __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.hDescription) }), null, null);
                /** @type {__VLS_StyleScopedClasses['prose']} */ ;
                /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
                // @ts-ignore
                [unit, hDescription,];
                var __VLS_172;
            }
            if (__VLS_ctx.unit.location) {
                var __VLS_175 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
                // @ts-ignore
                var __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({
                    label: "Initial location",
                }));
                var __VLS_177 = __VLS_176.apply(void 0, __spreadArray([{
                        label: "Initial location",
                    }], __VLS_functionalComponentArgsRest(__VLS_176), false));
                var __VLS_180 = __VLS_178.slots.default;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
                (__VLS_ctx.formatPosition(__VLS_ctx.unit.location));
                var __VLS_181 = IconButton_vue_1.default || IconButton_vue_1.default;
                // @ts-ignore
                var __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181(__assign({ 'onClick': {} })));
                var __VLS_183 = __VLS_182.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_182), false));
                var __VLS_186 = void 0;
                var __VLS_187 = ({ click: {} },
                    { onClick: function () {
                            var _a = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                _a[_i] = arguments[_i];
                            }
                            var $event = _a[0];
                            if (!(__VLS_ctx.unit))
                                return;
                            if (!(!__VLS_ctx.isMultiMode))
                                return;
                            if (!!(__VLS_ctx.isEditMode))
                                return;
                            if (!!(__VLS_ctx.isEditMediaMode))
                                return;
                            if (!(!__VLS_ctx.isMultiMode))
                                return;
                            if (!(__VLS_ctx.unit.location))
                                return;
                            __VLS_ctx.geoStore.panToLocation(__VLS_ctx.unit.location);
                            // @ts-ignore
                            [unit, unit, unit, utils_2.formatPosition, geoStore,];
                        } });
                var __VLS_188 = __VLS_184.slots.default;
                var __VLS_189 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.IconCrosshairsGps} */
                vue_mdi_1.IconCrosshairsGps;
                // @ts-ignore
                var __VLS_190 = __VLS_asFunctionalComponent1(__VLS_189, new __VLS_189(__assign({ class: "h-5 w-5" })));
                var __VLS_191 = __VLS_190.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_190), false));
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                // @ts-ignore
                [];
                var __VLS_184;
                var __VLS_185;
                // @ts-ignore
                [];
                var __VLS_178;
            }
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "p-2 pt-4 text-sm" }));
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    // @ts-ignore
    [];
    var __VLS_132;
    var __VLS_194 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_195 = __VLS_asFunctionalComponent1(__VLS_194, new __VLS_194(__assign({ value: "1" }, { class: "mx-4" })));
    var __VLS_196 = __VLS_195.apply(void 0, __spreadArray([__assign({ value: "1" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_195), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    var __VLS_199 = __VLS_197.slots.default;
    var __VLS_200 = UnitDetailsSymbol_vue_1.default;
    // @ts-ignore
    var __VLS_201 = __VLS_asFunctionalComponent1(__VLS_200, new __VLS_200({
        unit: (__VLS_ctx.unit),
        key: (__VLS_ctx.unit.id),
        isMultiMode: (__VLS_ctx.isMultiMode),
        isLocked: (__VLS_ctx.isLocked),
    }));
    var __VLS_202 = __VLS_201.apply(void 0, __spreadArray([{
            unit: (__VLS_ctx.unit),
            key: (__VLS_ctx.unit.id),
            isMultiMode: (__VLS_ctx.isMultiMode),
            isLocked: (__VLS_ctx.isLocked),
        }], __VLS_functionalComponentArgsRest(__VLS_201), false));
    // @ts-ignore
    [unit, unit, isMultiMode, isLocked,];
    var __VLS_197;
    var __VLS_205 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_206 = __VLS_asFunctionalComponent1(__VLS_205, new __VLS_205(__assign({ value: "2" }, { class: "mx-4" })));
    var __VLS_207 = __VLS_206.apply(void 0, __spreadArray([__assign({ value: "2" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_206), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    var __VLS_210 = __VLS_208.slots.default;
    if (!__VLS_ctx.isMultiMode) {
        var __VLS_211 = UnitPanelState_vue_1.default;
        // @ts-ignore
        var __VLS_212 = __VLS_asFunctionalComponent1(__VLS_211, new __VLS_211({
            unit: (__VLS_ctx.unit),
            isLocked: (__VLS_ctx.isLocked),
        }));
        var __VLS_213 = __VLS_212.apply(void 0, __spreadArray([{
                unit: (__VLS_ctx.unit),
                isLocked: (__VLS_ctx.isLocked),
            }], __VLS_functionalComponentArgsRest(__VLS_212), false));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "p-2 pt-4 text-sm" }));
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    // @ts-ignore
    [unit, isMultiMode, isLocked,];
    var __VLS_208;
    var __VLS_216 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216(__assign({ value: "3" }, { class: "mx-4" })));
    var __VLS_218 = __VLS_217.apply(void 0, __spreadArray([__assign({ value: "3" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_217), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    var __VLS_221 = __VLS_219.slots.default;
    var __VLS_222 = UnitDetailsToe_vue_1.default;
    // @ts-ignore
    var __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
        unit: (__VLS_ctx.unit),
        isLocked: (__VLS_ctx.isLocked),
    }));
    var __VLS_224 = __VLS_223.apply(void 0, __spreadArray([{
            unit: (__VLS_ctx.unit),
            isLocked: (__VLS_ctx.isLocked),
        }], __VLS_functionalComponentArgsRest(__VLS_223), false));
    // @ts-ignore
    [unit, isLocked,];
    var __VLS_219;
    var __VLS_227 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227(__assign({ value: "4" }, { class: "mx-4" })));
    var __VLS_229 = __VLS_228.apply(void 0, __spreadArray([__assign({ value: "4" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_228), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    var __VLS_232 = __VLS_230.slots.default;
    var __VLS_233 = UnitDetailsMapDisplay_vue_1.default;
    // @ts-ignore
    var __VLS_234 = __VLS_asFunctionalComponent1(__VLS_233, new __VLS_233({
        unit: (__VLS_ctx.unit),
        isMultiMode: (__VLS_ctx.isMultiMode),
        isLocked: (__VLS_ctx.isLocked),
    }));
    var __VLS_235 = __VLS_234.apply(void 0, __spreadArray([{
            unit: (__VLS_ctx.unit),
            isMultiMode: (__VLS_ctx.isMultiMode),
            isLocked: (__VLS_ctx.isLocked),
        }], __VLS_functionalComponentArgsRest(__VLS_234), false));
    // @ts-ignore
    [unit, isMultiMode, isLocked,];
    var __VLS_230;
    var __VLS_238 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_239 = __VLS_asFunctionalComponent1(__VLS_238, new __VLS_238(__assign({ value: "5" }, { class: "mx-4" })));
    var __VLS_240 = __VLS_239.apply(void 0, __spreadArray([__assign({ value: "5" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_239), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    var __VLS_243 = __VLS_241.slots.default;
    if (!__VLS_ctx.isMultiMode) {
        var __VLS_244 = UnitDetailsProperties_vue_1.default;
        // @ts-ignore
        var __VLS_245 = __VLS_asFunctionalComponent1(__VLS_244, new __VLS_244({
            unit: (__VLS_ctx.unit),
            isLocked: (__VLS_ctx.isLocked),
        }));
        var __VLS_246 = __VLS_245.apply(void 0, __spreadArray([{
                unit: (__VLS_ctx.unit),
                isLocked: (__VLS_ctx.isLocked),
            }], __VLS_functionalComponentArgsRest(__VLS_245), false));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "p-2 pt-4 text-sm" }));
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    // @ts-ignore
    [unit, isMultiMode, isLocked,];
    var __VLS_241;
    var __VLS_249 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_250 = __VLS_asFunctionalComponent1(__VLS_249, new __VLS_249(__assign({ value: "6" }, { class: "mx-4" })));
    var __VLS_251 = __VLS_250.apply(void 0, __spreadArray([__assign({ value: "6" }, { class: "mx-4" })], __VLS_functionalComponentArgsRest(__VLS_250), false));
    /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
    var __VLS_254 = __VLS_252.slots.default;
    var __VLS_255 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FeatureTransformations} */
    FeatureTransformations;
    // @ts-ignore
    var __VLS_256 = __VLS_asFunctionalComponent1(__VLS_255, new __VLS_255(__assign({ class: "mt-4" }, { unitMode: true })));
    var __VLS_257 = __VLS_256.apply(void 0, __spreadArray([__assign({ class: "mt-4" }, { unitMode: true })], __VLS_functionalComponentArgsRest(__VLS_256), false));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    // @ts-ignore
    [];
    var __VLS_252;
    if (__VLS_ctx.uiStore.debugMode) {
        var __VLS_260 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
        tabs_1.TabsContent;
        // @ts-ignore
        var __VLS_261 = __VLS_asFunctionalComponent1(__VLS_260, new __VLS_260(__assign({ value: "7" }, { class: "prose prose-sm dark:prose-invert mx-4 max-w-none" })));
        var __VLS_262 = __VLS_261.apply(void 0, __spreadArray([__assign({ value: "7" }, { class: "prose prose-sm dark:prose-invert mx-4 max-w-none" })], __VLS_functionalComponentArgsRest(__VLS_261), false));
        /** @type {__VLS_StyleScopedClasses['prose']} */ ;
        /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
        var __VLS_265 = __VLS_263.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({});
        (__VLS_ctx.unit);
        // @ts-ignore
        [unit, uiStore,];
        var __VLS_263;
    }
    // @ts-ignore
    [];
    var __VLS_126;
    if (__VLS_ctx.uiStore.shortcutsEnabled) {
        var __VLS_266 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.GlobalEvents} */
        vue_global_events_1.GlobalEvents;
        // @ts-ignore
        var __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266(__assign({ 'onKeyup': {} }, { filter: (__VLS_ctx.inputEventFilter) })));
        var __VLS_268 = __VLS_267.apply(void 0, __spreadArray([__assign({ 'onKeyup': {} }, { filter: (__VLS_ctx.inputEventFilter) })], __VLS_functionalComponentArgsRest(__VLS_267), false));
        var __VLS_271 = void 0;
        var __VLS_272 = ({ keyup: {} },
            { onKeyup: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.unit))
                        return;
                    if (!(__VLS_ctx.uiStore.shortcutsEnabled))
                        return;
                    __VLS_ctx.toggleEditMode();
                    // @ts-ignore
                    [toggleEditMode, uiStore, helpers_1.inputEventFilter,];
                } });
        var __VLS_269;
        var __VLS_270;
    }
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
