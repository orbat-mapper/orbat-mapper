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
var context_menu_1 = require("@/components/ui/context-menu");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var vue_1 = require("vue");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var baseLayersStore_1 = require("@/stores/baseLayersStore");
var geoConvert_1 = require("@/utils/geoConvert");
var proj_1 = require("ol/proj");
var pinia_1 = require("pinia");
var notifications_1 = require("@/composables/notifications");
var core_1 = require("@vueuse/core");
var uiStore_1 = require("@/stores/uiStore");
var geoStore_1 = require("@/stores/geoStore");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var selectedStore_1 = require("@/stores/selectedStore");
var MilitarySymbol_vue_1 = require("@/components/MilitarySymbol.vue");
var playbackStore_1 = require("@/stores/playbackStore");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var mainToolbarData_1 = require("@/composables/mainToolbarData");
var dragStore_1 = require("@/stores/dragStore");
var mainToolbarStore_ts_1 = require("@/stores/mainToolbarStore.ts");
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var tm = (0, timeFormatStore_1.useTimeFormatStore)();
var mainToolbarStore = (0, mainToolbarStore_ts_1.useMainToolbarStore)();
var props = defineProps();
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), store = _a.store, unitActions = _a.unitActions, geo = _a.geo, getUnitById = _a.helpers.getUnitById;
var activeLayerId = (0, utils_1.injectStrict)(injects_1.activeLayerKey);
var onScenarioActionHook = (0, utils_1.injectStrict)(injects_1.searchActionsKey).onScenarioActionHook;
var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
var isMobile = breakpoints.smallerOrEqual("md");
var _b = (0, pinia_1.storeToRefs)((0, mapSettingsStore_1.useMapSettingsStore)()), coordinateFormat = _b.coordinateFormat, showLocation = _b.showLocation, showScaleLine = _b.showScaleLine, showDayNightTerminator = _b.showDayNightTerminator;
var measurementUnit = (0, pinia_1.storeToRefs)((0, geoStore_1.useMeasurementsStore)()).measurementUnit;
var uiSettings = (0, uiStore_1.useUiStore)();
var mapSettings = (0, mapSettingsStore_1.useMapSettingsStore)();
var baseLayersStore = (0, baseLayersStore_1.useBaseLayersStore)();
var send = (0, notifications_1.useNotifications)().send;
var copyToClipboard = (0, core_1.useClipboard)().copy;
var _c = (0, selectedStore_1.useSelectedItems)(), activeUnitId = _c.activeUnitId, activeFeatureId = _c.activeFeatureId, selectedUnitIds = _c.selectedUnitIds, selectedFeatureIds = _c.selectedFeatureIds;
var activeParent = (0, dragStore_1.useActiveUnitStore)().activeParent;
var playback = (0, playbackStore_1.usePlaybackStore)();
var _d = (0, mainToolbarData_1.useActiveSidc)(), sidc = _d.sidc, symbolOptions = _d.symbolOptions;
var dropPosition = (0, vue_1.ref)([0, 0]);
var pixelPosition = (0, vue_1.ref)(null);
var clickedUnits = (0, vue_1.ref)([]);
var clickedFeatures = (0, vue_1.ref)([]);
var mapZoomLevel = (0, vue_1.ref)(0);
var formattedPosition = (0, vue_1.computed)(function () {
    return (0, geoConvert_1.getCoordinateFormatFunction)(coordinateFormat.value)(dropPosition.value);
});
function onExport() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, onScenarioActionHook.trigger({ action: "exportToImage" })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function onContextMenu(e) {
    var _a, _b;
    var mapRef = props.mapRef;
    if (!mapRef) {
        console.warn("No map ref");
        return;
    }
    mapZoomLevel.value = (_b = (_a = mapRef.getView()) === null || _a === void 0 ? void 0 : _a.getZoom()) !== null && _b !== void 0 ? _b : 0;
    clickedUnits.value = [];
    clickedFeatures.value = [];
    pixelPosition.value = mapRef.getEventPixel(e);
    dropPosition.value = (0, proj_1.toLonLat)(mapRef.getEventCoordinate(e));
    mapRef.forEachFeatureAtPixel(pixelPosition.value, function (feature, layer) {
        var layerType = layer === null || layer === void 0 ? void 0 : layer.get("layerType");
        if (layerType === "UNITS") {
            var unitId = feature.getId();
            var unit = getUnitById(unitId);
            unit && clickedUnits.value.push(unit);
        }
        else if (layerType === "SCENARIO_FEATURE") {
            var featureId = feature.getId();
            var scenarioFeature = geo.getFeatureById(featureId).feature;
            scenarioFeature && clickedFeatures.value.push(scenarioFeature);
        }
    });
}
function returnMapProviders(lonLat, zoomLevel) {
    return [
        {
            name: "Bing Maps",
            url: "https://www.bing.com/maps?cp=".concat(lonLat[1], "~").concat(lonLat[0], "&lvl=").concat(zoomLevel),
        },
        {
            name: "Geohack",
            url: "https://geohack.toolforge.org/geohack.php?params=".concat(lonLat[1], "_N_").concat(lonLat[0], "_E"),
        },
        {
            name: "Google Maps",
            url: "https://www.google.com/maps/@".concat(lonLat[1], ",").concat(lonLat[0], ",").concat(zoomLevel, "z"),
        },
        {
            name: "Google Street View",
            url: "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" +
                lonLat[1] +
                "," +
                lonLat[0],
        },
        {
            name: "OpenStreetMap",
            url: "https://www.openstreetmap.org/#map=15/".concat(lonLat[1], "/").concat(lonLat[0]),
        },
    ];
}
function onCopy() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, copyToClipboard(formattedPosition.value)];
                case 1:
                    _a.sent();
                    send({
                        message: "Copied ".concat(formattedPosition.value, " to the clipboard"),
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function onUnitSelect(unit, event) {
    if (event.shiftKey) {
        if (selectedUnitIds.value.has(unit.id)) {
            selectedUnitIds.value.delete(unit.id);
        }
        else {
            selectedUnitIds.value.add(unit.id);
        }
    }
    else {
        activeUnitId.value = unit.id;
    }
}
function onFeatureSelect(feature, event) {
    if (event.shiftKey) {
        if (selectedFeatureIds.value.has(feature.id)) {
            selectedFeatureIds.value.delete(feature.id);
        }
        else {
            selectedFeatureIds.value.add(feature.id);
        }
    }
    else {
        activeFeatureId.value = feature.id;
    }
}
function onContextMenuUpdate(open) {
    if (!open) {
        pixelPosition.value = null;
    }
}
function onAddUnit() {
    store.groupUpdate(function () {
        var _a, _b;
        if (!activeParent.value || unitActions.isUnitLocked(activeParent.value.id))
            return;
        var name = "".concat(((_b = (_a = activeParent.value.subUnits) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + 1);
        var unitId = unitActions.createSubordinateUnit(activeParent.value.id, {
            sidc: sidc.value,
            name: name,
        });
        unitId && geo.addUnitPosition(unitId, dropPosition.value);
    });
}
function onAddPoint() {
    var _a, _b, _c, _d;
    var activeLayer = geo.getLayerById((_a = activeLayerId.value) !== null && _a !== void 0 ? _a : (_b = geo.layers.value[0]) === null || _b === void 0 ? void 0 : _b.id);
    if (!activeLayer)
        return;
    var name = "Point ".concat(((_c = activeLayer.features.length) !== null && _c !== void 0 ? _c : 0) + 1);
    var newFeature = {
        type: "Feature",
        id: (0, utils_1.nanoid)(),
        meta: {
            type: "Point",
            name: name,
        },
        geometry: {
            type: "Point",
            coordinates: dropPosition.value,
        },
        style: (_d = mainToolbarStore.currentDrawStyle) !== null && _d !== void 0 ? _d : {},
        properties: {},
    };
    geo.addFeature(newFeature, activeLayer.id);
}
var baseMapId = (0, vue_1.computed)({
    get: function () { return store.state.mapSettings.baseMapId; },
    set: function (value) {
        store.update(function (s) {
            s.mapSettings.baseMapId = value;
            mapSettings.baseLayerName = value;
        });
        baseLayersStore.selectLayer(value);
    },
});
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.ContextMenu | typeof __VLS_components.ContextMenu} */
context_menu_1.ContextMenu;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onUpdate:open': {} })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onUpdate:open': {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:open': {} },
    { 'onUpdate:open': (__VLS_ctx.onContextMenuUpdate) });
var __VLS_7 = {};
var __VLS_8 = __VLS_3.slots.default;
var __VLS_9;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuTrigger | typeof __VLS_components.ContextMenuTrigger} */
context_menu_1.ContextMenuTrigger;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    asChild: true,
}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_14 = __VLS_12.slots.default;
var __VLS_15 = {
    onContextMenu: (__VLS_ctx.onContextMenu),
};
if (__VLS_ctx.pixelPosition) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "absolute flex items-center justify-center" }, { style: ({ left: __VLS_ctx.pixelPosition[0] + 'px', top: __VLS_ctx.pixelPosition[1] + 'px' }) }));
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    var __VLS_17 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconTarget} */
    vue_mdi_1.IconTarget;
    // @ts-ignore
    var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ class: "-mx-1/2 -my-1/2 absolute h-8 w-8 text-yellow-500" })));
    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ class: "-mx-1/2 -my-1/2 absolute h-8 w-8 text-yellow-500" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
    /** @type {__VLS_StyleScopedClasses['-mx-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-my-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-500']} */ ;
}
// @ts-ignore
[onContextMenuUpdate, onContextMenu, pixelPosition, pixelPosition, pixelPosition,];
var __VLS_12;
var __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuContent | typeof __VLS_components.ContextMenuContent} */
context_menu_1.ContextMenuContent;
// @ts-ignore
var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({}));
var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_23), false));
var __VLS_27 = __VLS_25.slots.default;
var __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign({ 'onSelect': {} })));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_29), false));
var __VLS_33;
var __VLS_34 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onCopy();
            // @ts-ignore
            [onCopy,];
        } });
var __VLS_35 = __VLS_31.slots.default;
var __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.IconContentCopy} */
vue_mdi_1.IconContentCopy;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36(__assign({ class: "mr-2 h-4 w-4" })));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_37), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.formattedPosition);
// @ts-ignore
[formattedPosition,];
var __VLS_31;
var __VLS_32;
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSeparator} */
context_menu_1.ContextMenuSeparator;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({}));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_42), false));
if (__VLS_ctx.clickedUnits.length > 0) {
    var __VLS_46 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
    context_menu_1.ContextMenuSub;
    // @ts-ignore
    var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({}));
    var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_47), false));
    var __VLS_51 = __VLS_49.slots.default;
    var __VLS_52 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
    context_menu_1.ContextMenuSubTrigger;
    // @ts-ignore
    var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        inset: true,
    }));
    var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([{
            inset: true,
        }], __VLS_functionalComponentArgsRest(__VLS_53), false));
    var __VLS_57 = __VLS_55.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.clickedUnits.length);
    // @ts-ignore
    [clickedUnits, clickedUnits,];
    var __VLS_55;
    var __VLS_58 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
    context_menu_1.ContextMenuSubContent;
    // @ts-ignore
    var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58(__assign({ class: "max-h-[95vh] overflow-auto" })));
    var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([__assign({ class: "max-h-[95vh] overflow-auto" })], __VLS_functionalComponentArgsRest(__VLS_59), false));
    /** @type {__VLS_StyleScopedClasses['max-h-[95vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
    var __VLS_63 = __VLS_61.slots.default;
    var _loop_1 = function (unit) {
        var __VLS_64 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
        context_menu_1.ContextMenuItem;
        // @ts-ignore
        var __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64(__assign(__assign({ 'onSelect': {} }, { 'onClick': {} }), { key: (unit.id) })));
        var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([__assign(__assign({ 'onSelect': {} }, { 'onClick': {} }), { key: (unit.id) })], __VLS_functionalComponentArgsRest(__VLS_65), false));
        var __VLS_69 = void 0;
        var __VLS_70 = ({ select: {} },
            { onSelect: function () { } });
        var __VLS_71 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.clickedUnits.length > 0))
                        return;
                    __VLS_ctx.onUnitSelect(unit, $event);
                    // @ts-ignore
                    [clickedUnits, onUnitSelect,];
                } });
        var __VLS_72 = __VLS_67.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "flex w-7 items-center" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        var __VLS_73 = UnitSymbol_vue_1.default;
        // @ts-ignore
        var __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73(__assign(__assign({ sidc: (unit.sidc) }, { class: "w-6" }), { options: (__VLS_ctx.unitActions.getCombinedSymbolOptions(unit)) })));
        var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([__assign(__assign({ sidc: (unit.sidc) }, { class: "w-6" }), { options: (__VLS_ctx.unitActions.getCombinedSymbolOptions(unit)) })], __VLS_functionalComponentArgsRest(__VLS_74), false));
        /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: ([__VLS_ctx.selectedUnitIds.has(unit.id) ? 'font-semibold' : '']) }));
        (unit.name);
        // @ts-ignore
        [unitActions, selectedUnitIds,];
        // @ts-ignore
        [];
    };
    var __VLS_67, __VLS_68;
    for (var _i = 0, _e = __VLS_vFor((__VLS_ctx.clickedUnits)); _i < _e.length; _i++) {
        var unit = _e[_i][0];
        _loop_1(unit);
    }
    // @ts-ignore
    [];
    var __VLS_61;
    // @ts-ignore
    [];
    var __VLS_49;
}
if (__VLS_ctx.clickedFeatures.length > 0) {
    var __VLS_78 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
    context_menu_1.ContextMenuSub;
    // @ts-ignore
    var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({}));
    var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_79), false));
    var __VLS_83 = __VLS_81.slots.default;
    var __VLS_84 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
    context_menu_1.ContextMenuSubTrigger;
    // @ts-ignore
    var __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        inset: true,
    }));
    var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([{
            inset: true,
        }], __VLS_functionalComponentArgsRest(__VLS_85), false));
    var __VLS_89 = __VLS_87.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.clickedFeatures.length);
    // @ts-ignore
    [clickedFeatures, clickedFeatures,];
    var __VLS_87;
    var __VLS_90 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
    context_menu_1.ContextMenuSubContent;
    // @ts-ignore
    var __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90(__assign({ class: "max-h-[95vh] overflow-auto" })));
    var __VLS_92 = __VLS_91.apply(void 0, __spreadArray([__assign({ class: "max-h-[95vh] overflow-auto" })], __VLS_functionalComponentArgsRest(__VLS_91), false));
    /** @type {__VLS_StyleScopedClasses['max-h-[95vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
    var __VLS_95 = __VLS_93.slots.default;
    var _loop_2 = function (feature) {
        var __VLS_96 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
        context_menu_1.ContextMenuItem;
        // @ts-ignore
        var __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96(__assign(__assign({ 'onSelect': {} }, { 'onClick': {} }), { key: (feature.id) })));
        var __VLS_98 = __VLS_97.apply(void 0, __spreadArray([__assign(__assign({ 'onSelect': {} }, { 'onClick': {} }), { key: (feature.id) })], __VLS_functionalComponentArgsRest(__VLS_97), false));
        var __VLS_101 = void 0;
        var __VLS_102 = ({ select: {} },
            { onSelect: function () { } });
        var __VLS_103 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.clickedFeatures.length > 0))
                        return;
                    __VLS_ctx.onFeatureSelect(feature, $event);
                    // @ts-ignore
                    [clickedFeatures, onFeatureSelect,];
                } });
        var __VLS_104 = __VLS_99.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        var __VLS_105 = (__VLS_ctx.getGeometryIcon(feature));
        // @ts-ignore
        var __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105(__assign({ class: "text-muted-foreground mr-1 h-5 w-5" })));
        var __VLS_107 = __VLS_106.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground mr-1 h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_106), false));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: ([__VLS_ctx.selectedFeatureIds.has(feature.id) ? 'font-semibold' : '']) }));
        (feature.meta.name);
        // @ts-ignore
        [featureLayerUtils_1.getGeometryIcon, selectedFeatureIds,];
        // @ts-ignore
        [];
    };
    var __VLS_99, __VLS_100;
    for (var _f = 0, _g = __VLS_vFor((__VLS_ctx.clickedFeatures)); _f < _g.length; _f++) {
        var feature = _g[_f][0];
        _loop_2(feature);
    }
    // @ts-ignore
    [];
    var __VLS_93;
    // @ts-ignore
    [];
    var __VLS_81;
}
if (__VLS_ctx.clickedFeatures.length || __VLS_ctx.clickedUnits.length) {
    var __VLS_110 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuSeparator} */
    context_menu_1.ContextMenuSeparator;
    // @ts-ignore
    var __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({}));
    var __VLS_112 = __VLS_111.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_111), false));
}
var __VLS_115;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
context_menu_1.ContextMenuSub;
// @ts-ignore
var __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({}));
var __VLS_117 = __VLS_116.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_116), false));
var __VLS_120 = __VLS_118.slots.default;
var __VLS_121;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
context_menu_1.ContextMenuSubTrigger;
// @ts-ignore
var __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
    inset: true,
}));
var __VLS_123 = __VLS_122.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_122), false));
var __VLS_126 = __VLS_124.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[clickedUnits, clickedFeatures,];
var __VLS_124;
var __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
context_menu_1.ContextMenuSubContent;
// @ts-ignore
var __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({}));
var __VLS_129 = __VLS_128.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_128), false));
var __VLS_132 = __VLS_130.slots.default;
var __VLS_133;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133(__assign({ 'onSelect': {} })));
var __VLS_135 = __VLS_134.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_134), false));
var __VLS_138;
var __VLS_139 = ({ select: {} },
    { onSelect: (__VLS_ctx.onAddUnit) });
var __VLS_140 = __VLS_136.slots.default;
var __VLS_141 = MilitarySymbol_vue_1.default;
// @ts-ignore
var __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141(__assign({ sidc: (__VLS_ctx.sidc), options: (__VLS_ctx.symbolOptions), size: (15) }, { class: "w-8" })));
var __VLS_143 = __VLS_142.apply(void 0, __spreadArray([__assign({ sidc: (__VLS_ctx.sidc), options: (__VLS_ctx.symbolOptions), size: (15) }, { class: "w-8" })], __VLS_functionalComponentArgsRest(__VLS_142), false));
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
// @ts-ignore
[onAddUnit, sidc, symbolOptions,];
var __VLS_136;
var __VLS_137;
var __VLS_146;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_147 = __VLS_asFunctionalComponent1(__VLS_146, new __VLS_146(__assign({ 'onSelect': {} })));
var __VLS_148 = __VLS_147.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_147), false));
var __VLS_151;
var __VLS_152 = ({ select: {} },
    { onSelect: (__VLS_ctx.onAddPoint) });
var __VLS_153 = __VLS_149.slots.default;
var __VLS_154;
/** @ts-ignore @type {typeof __VLS_components.PointIcon} */
vue_mdi_1.IconMapMarker;
// @ts-ignore
var __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({}));
var __VLS_156 = __VLS_155.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_155), false));
// @ts-ignore
[onAddPoint,];
var __VLS_149;
var __VLS_150;
// @ts-ignore
[];
var __VLS_130;
// @ts-ignore
[];
var __VLS_118;
var __VLS_159;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
context_menu_1.ContextMenuSub;
// @ts-ignore
var __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({}));
var __VLS_161 = __VLS_160.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_160), false));
var __VLS_164 = __VLS_162.slots.default;
var __VLS_165;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
context_menu_1.ContextMenuSubTrigger;
// @ts-ignore
var __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165({
    inset: true,
}));
var __VLS_167 = __VLS_166.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_166), false));
var __VLS_170 = __VLS_168.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_168;
var __VLS_171;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
context_menu_1.ContextMenuSubContent;
// @ts-ignore
var __VLS_172 = __VLS_asFunctionalComponent1(__VLS_171, new __VLS_171({}));
var __VLS_173 = __VLS_172.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_172), false));
var __VLS_176 = __VLS_174.slots.default;
var __VLS_177;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177(__assign({ 'onSelect': {} })));
var __VLS_179 = __VLS_178.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_178), false));
var __VLS_182;
var __VLS_183 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onExport();
            // @ts-ignore
            [onExport,];
        } });
var __VLS_184 = __VLS_180.slots.default;
// @ts-ignore
[];
var __VLS_180;
var __VLS_181;
// @ts-ignore
[];
var __VLS_174;
// @ts-ignore
[];
var __VLS_162;
var __VLS_185;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
context_menu_1.ContextMenuSub;
// @ts-ignore
var __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({}));
var __VLS_187 = __VLS_186.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_186), false));
var __VLS_190 = __VLS_188.slots.default;
var __VLS_191;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
context_menu_1.ContextMenuSubTrigger;
// @ts-ignore
var __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({
    inset: true,
}));
var __VLS_193 = __VLS_192.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_192), false));
var __VLS_196 = __VLS_194.slots.default;
// @ts-ignore
[];
var __VLS_194;
var __VLS_197;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
context_menu_1.ContextMenuSubContent;
// @ts-ignore
var __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197({}));
var __VLS_199 = __VLS_198.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_198), false));
var __VLS_202 = __VLS_200.slots.default;
var __VLS_203;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioGroup | typeof __VLS_components.ContextMenuRadioGroup} */
context_menu_1.ContextMenuRadioGroup;
// @ts-ignore
var __VLS_204 = __VLS_asFunctionalComponent1(__VLS_203, new __VLS_203({
    modelValue: (__VLS_ctx.baseMapId),
}));
var __VLS_205 = __VLS_204.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.baseMapId),
    }], __VLS_functionalComponentArgsRest(__VLS_204), false));
var __VLS_208 = __VLS_206.slots.default;
for (var _h = 0, _j = __VLS_vFor((__VLS_ctx.baseLayersStore.layers)); _h < _j.length; _h++) {
    var layer = _j[_h][0];
    var __VLS_209 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioItem | typeof __VLS_components.ContextMenuRadioItem} */
    context_menu_1.ContextMenuRadioItem;
    // @ts-ignore
    var __VLS_210 = __VLS_asFunctionalComponent1(__VLS_209, new __VLS_209(__assign({ 'onSelect': {} }, { key: (layer.name), value: (layer.name) })));
    var __VLS_211 = __VLS_210.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { key: (layer.name), value: (layer.name) })], __VLS_functionalComponentArgsRest(__VLS_210), false));
    var __VLS_214 = void 0;
    var __VLS_215 = ({ select: {} },
        { onSelect: function () { } });
    var __VLS_216 = __VLS_212.slots.default;
    (layer.title);
    // @ts-ignore
    [baseMapId, baseLayersStore,];
    var __VLS_212;
    var __VLS_213;
    // @ts-ignore
    [];
}
var __VLS_217;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioItem | typeof __VLS_components.ContextMenuRadioItem} */
context_menu_1.ContextMenuRadioItem;
// @ts-ignore
var __VLS_218 = __VLS_asFunctionalComponent1(__VLS_217, new __VLS_217(__assign({ 'onSelect': {} }, { value: "None" })));
var __VLS_219 = __VLS_218.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "None" })], __VLS_functionalComponentArgsRest(__VLS_218), false));
var __VLS_222;
var __VLS_223 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_224 = __VLS_220.slots.default;
// @ts-ignore
[];
var __VLS_220;
var __VLS_221;
// @ts-ignore
[];
var __VLS_206;
// @ts-ignore
[];
var __VLS_200;
// @ts-ignore
[];
var __VLS_188;
var __VLS_225;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
context_menu_1.ContextMenuSub;
// @ts-ignore
var __VLS_226 = __VLS_asFunctionalComponent1(__VLS_225, new __VLS_225({}));
var __VLS_227 = __VLS_226.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_226), false));
var __VLS_230 = __VLS_228.slots.default;
var __VLS_231;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
context_menu_1.ContextMenuSubTrigger;
// @ts-ignore
var __VLS_232 = __VLS_asFunctionalComponent1(__VLS_231, new __VLS_231({
    inset: true,
}));
var __VLS_233 = __VLS_232.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_232), false));
var __VLS_236 = __VLS_234.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_234;
var __VLS_237;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
context_menu_1.ContextMenuSubContent;
// @ts-ignore
var __VLS_238 = __VLS_asFunctionalComponent1(__VLS_237, new __VLS_237({}));
var __VLS_239 = __VLS_238.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_238), false));
var __VLS_242 = __VLS_240.slots.default;
var __VLS_243;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
context_menu_1.ContextMenuSub;
// @ts-ignore
var __VLS_244 = __VLS_asFunctionalComponent1(__VLS_243, new __VLS_243({}));
var __VLS_245 = __VLS_244.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_244), false));
var __VLS_248 = __VLS_246.slots.default;
var __VLS_249;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
context_menu_1.ContextMenuSubTrigger;
// @ts-ignore
var __VLS_250 = __VLS_asFunctionalComponent1(__VLS_249, new __VLS_249({
    inset: true,
}));
var __VLS_251 = __VLS_250.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_250), false));
var __VLS_254 = __VLS_252.slots.default;
// @ts-ignore
[];
var __VLS_252;
var __VLS_255;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
context_menu_1.ContextMenuSubContent;
// @ts-ignore
var __VLS_256 = __VLS_asFunctionalComponent1(__VLS_255, new __VLS_255({}));
var __VLS_257 = __VLS_256.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_256), false));
var __VLS_260 = __VLS_258.slots.default;
var __VLS_261;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioGroup | typeof __VLS_components.ContextMenuRadioGroup} */
context_menu_1.ContextMenuRadioGroup;
// @ts-ignore
var __VLS_262 = __VLS_asFunctionalComponent1(__VLS_261, new __VLS_261({
    modelValue: (__VLS_ctx.coordinateFormat),
}));
var __VLS_263 = __VLS_262.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.coordinateFormat),
    }], __VLS_functionalComponentArgsRest(__VLS_262), false));
var __VLS_266 = __VLS_264.slots.default;
var __VLS_267;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioItem | typeof __VLS_components.ContextMenuRadioItem} */
context_menu_1.ContextMenuRadioItem;
// @ts-ignore
var __VLS_268 = __VLS_asFunctionalComponent1(__VLS_267, new __VLS_267(__assign({ 'onSelect': {} }, { value: "dms" })));
var __VLS_269 = __VLS_268.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "dms" })], __VLS_functionalComponentArgsRest(__VLS_268), false));
var __VLS_272;
var __VLS_273 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_274 = __VLS_270.slots.default;
// @ts-ignore
[coordinateFormat,];
var __VLS_270;
var __VLS_271;
var __VLS_275;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioItem | typeof __VLS_components.ContextMenuRadioItem} */
context_menu_1.ContextMenuRadioItem;
// @ts-ignore
var __VLS_276 = __VLS_asFunctionalComponent1(__VLS_275, new __VLS_275(__assign({ 'onSelect': {} }, { value: "dd" })));
var __VLS_277 = __VLS_276.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "dd" })], __VLS_functionalComponentArgsRest(__VLS_276), false));
var __VLS_280;
var __VLS_281 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_282 = __VLS_278.slots.default;
// @ts-ignore
[];
var __VLS_278;
var __VLS_279;
var __VLS_283;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioItem | typeof __VLS_components.ContextMenuRadioItem} */
context_menu_1.ContextMenuRadioItem;
// @ts-ignore
var __VLS_284 = __VLS_asFunctionalComponent1(__VLS_283, new __VLS_283(__assign({ 'onSelect': {} }, { value: "MGRS" })));
var __VLS_285 = __VLS_284.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "MGRS" })], __VLS_functionalComponentArgsRest(__VLS_284), false));
var __VLS_288;
var __VLS_289 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_290 = __VLS_286.slots.default;
// @ts-ignore
[];
var __VLS_286;
var __VLS_287;
// @ts-ignore
[];
var __VLS_264;
// @ts-ignore
[];
var __VLS_258;
// @ts-ignore
[];
var __VLS_246;
var __VLS_291;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
context_menu_1.ContextMenuCheckboxItem;
// @ts-ignore
var __VLS_292 = __VLS_asFunctionalComponent1(__VLS_291, new __VLS_291(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showDayNightTerminator) })));
var __VLS_293 = __VLS_292.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showDayNightTerminator) })], __VLS_functionalComponentArgsRest(__VLS_292), false));
var __VLS_296;
var __VLS_297 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_298 = __VLS_294.slots.default;
// @ts-ignore
[showDayNightTerminator,];
var __VLS_294;
var __VLS_295;
var __VLS_299;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
context_menu_1.ContextMenuSub;
// @ts-ignore
var __VLS_300 = __VLS_asFunctionalComponent1(__VLS_299, new __VLS_299({}));
var __VLS_301 = __VLS_300.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_300), false));
var __VLS_304 = __VLS_302.slots.default;
var __VLS_305;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
context_menu_1.ContextMenuSubTrigger;
// @ts-ignore
var __VLS_306 = __VLS_asFunctionalComponent1(__VLS_305, new __VLS_305({
    inset: true,
}));
var __VLS_307 = __VLS_306.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_306), false));
var __VLS_310 = __VLS_308.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "pr-4" }));
/** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
// @ts-ignore
[];
var __VLS_308;
var __VLS_311;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
context_menu_1.ContextMenuSubContent;
// @ts-ignore
var __VLS_312 = __VLS_asFunctionalComponent1(__VLS_311, new __VLS_311({}));
var __VLS_313 = __VLS_312.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_312), false));
var __VLS_316 = __VLS_314.slots.default;
var __VLS_317;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioGroup | typeof __VLS_components.ContextMenuRadioGroup} */
context_menu_1.ContextMenuRadioGroup;
// @ts-ignore
var __VLS_318 = __VLS_asFunctionalComponent1(__VLS_317, new __VLS_317({
    modelValue: (__VLS_ctx.measurementUnit),
}));
var __VLS_319 = __VLS_318.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.measurementUnit),
    }], __VLS_functionalComponentArgsRest(__VLS_318), false));
var __VLS_322 = __VLS_320.slots.default;
var __VLS_323;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioItem | typeof __VLS_components.ContextMenuRadioItem} */
context_menu_1.ContextMenuRadioItem;
// @ts-ignore
var __VLS_324 = __VLS_asFunctionalComponent1(__VLS_323, new __VLS_323(__assign({ 'onSelect': {} }, { value: "metric" })));
var __VLS_325 = __VLS_324.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "metric" })], __VLS_functionalComponentArgsRest(__VLS_324), false));
var __VLS_328;
var __VLS_329 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_330 = __VLS_326.slots.default;
// @ts-ignore
[measurementUnit,];
var __VLS_326;
var __VLS_327;
var __VLS_331;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioItem | typeof __VLS_components.ContextMenuRadioItem} */
context_menu_1.ContextMenuRadioItem;
// @ts-ignore
var __VLS_332 = __VLS_asFunctionalComponent1(__VLS_331, new __VLS_331(__assign({ 'onSelect': {} }, { value: "imperial" })));
var __VLS_333 = __VLS_332.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "imperial" })], __VLS_functionalComponentArgsRest(__VLS_332), false));
var __VLS_336;
var __VLS_337 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_338 = __VLS_334.slots.default;
// @ts-ignore
[];
var __VLS_334;
var __VLS_335;
var __VLS_339;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuRadioItem | typeof __VLS_components.ContextMenuRadioItem} */
context_menu_1.ContextMenuRadioItem;
// @ts-ignore
var __VLS_340 = __VLS_asFunctionalComponent1(__VLS_339, new __VLS_339(__assign({ 'onSelect': {} }, { value: "nautical" })));
var __VLS_341 = __VLS_340.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "nautical" })], __VLS_functionalComponentArgsRest(__VLS_340), false));
var __VLS_344;
var __VLS_345 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_346 = __VLS_342.slots.default;
// @ts-ignore
[];
var __VLS_342;
var __VLS_343;
// @ts-ignore
[];
var __VLS_320;
// @ts-ignore
[];
var __VLS_314;
// @ts-ignore
[];
var __VLS_302;
var __VLS_347;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
context_menu_1.ContextMenuCheckboxItem;
// @ts-ignore
var __VLS_348 = __VLS_asFunctionalComponent1(__VLS_347, new __VLS_347(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showLocation) })));
var __VLS_349 = __VLS_348.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showLocation) })], __VLS_functionalComponentArgsRest(__VLS_348), false));
var __VLS_352;
var __VLS_353 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_354 = __VLS_350.slots.default;
// @ts-ignore
[showLocation,];
var __VLS_350;
var __VLS_351;
var __VLS_355;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
context_menu_1.ContextMenuCheckboxItem;
// @ts-ignore
var __VLS_356 = __VLS_asFunctionalComponent1(__VLS_355, new __VLS_355(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showScaleLine) })));
var __VLS_357 = __VLS_356.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showScaleLine) })], __VLS_functionalComponentArgsRest(__VLS_356), false));
var __VLS_360;
var __VLS_361 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_362 = __VLS_358.slots.default;
// @ts-ignore
[showScaleLine,];
var __VLS_358;
var __VLS_359;
var __VLS_363;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSeparator} */
context_menu_1.ContextMenuSeparator;
// @ts-ignore
var __VLS_364 = __VLS_asFunctionalComponent1(__VLS_363, new __VLS_363({}));
var __VLS_365 = __VLS_364.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_364), false));
var __VLS_368;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
context_menu_1.ContextMenuCheckboxItem;
// @ts-ignore
var __VLS_369 = __VLS_asFunctionalComponent1(__VLS_368, new __VLS_368(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.mapSettings.mapUnitLabelBelow) })));
var __VLS_370 = __VLS_369.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.mapSettings.mapUnitLabelBelow) })], __VLS_functionalComponentArgsRest(__VLS_369), false));
var __VLS_373;
var __VLS_374 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_375 = __VLS_371.slots.default;
// @ts-ignore
[mapSettings,];
var __VLS_371;
var __VLS_372;
if (__VLS_ctx.mapSettings.mapUnitLabelBelow) {
    var __VLS_376 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
    context_menu_1.ContextMenuCheckboxItem;
    // @ts-ignore
    var __VLS_377 = __VLS_asFunctionalComponent1(__VLS_376, new __VLS_376(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.mapSettings.mapWrapUnitLabels) })));
    var __VLS_378 = __VLS_377.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.mapSettings.mapWrapUnitLabels) })], __VLS_functionalComponentArgsRest(__VLS_377), false));
    var __VLS_381 = void 0;
    var __VLS_382 = ({ select: {} },
        { onSelect: function () { } });
    var __VLS_383 = __VLS_379.slots.default;
    // @ts-ignore
    [mapSettings, mapSettings,];
    var __VLS_379;
    var __VLS_380;
}
// @ts-ignore
[];
var __VLS_240;
// @ts-ignore
[];
var __VLS_228;
var __VLS_384;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
context_menu_1.ContextMenuSub;
// @ts-ignore
var __VLS_385 = __VLS_asFunctionalComponent1(__VLS_384, new __VLS_384({}));
var __VLS_386 = __VLS_385.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_385), false));
var __VLS_389 = __VLS_387.slots.default;
var __VLS_390;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
context_menu_1.ContextMenuSubTrigger;
// @ts-ignore
var __VLS_391 = __VLS_asFunctionalComponent1(__VLS_390, new __VLS_390({
    inset: true,
}));
var __VLS_392 = __VLS_391.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_391), false));
var __VLS_395 = __VLS_393.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_393;
var __VLS_396;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
context_menu_1.ContextMenuSubContent;
// @ts-ignore
var __VLS_397 = __VLS_asFunctionalComponent1(__VLS_396, new __VLS_396({}));
var __VLS_398 = __VLS_397.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_397), false));
var __VLS_401 = __VLS_399.slots.default;
for (var _k = 0, _l = __VLS_vFor((__VLS_ctx.returnMapProviders(__VLS_ctx.dropPosition, __VLS_ctx.mapZoomLevel))); _k < _l.length; _k++) {
    var _m = _l[_k][0], name_1 = _m.name, url = _m.url;
    var __VLS_402 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
    context_menu_1.ContextMenuItem;
    // @ts-ignore
    var __VLS_403 = __VLS_asFunctionalComponent1(__VLS_402, new __VLS_402({
        key: (url),
        inset: true,
        asChild: true,
    }));
    var __VLS_404 = __VLS_403.apply(void 0, __spreadArray([{
            key: (url),
            inset: true,
            asChild: true,
        }], __VLS_functionalComponentArgsRest(__VLS_403), false));
    var __VLS_407 = __VLS_405.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: (url),
        target: "_blank",
    });
    (name_1);
    // @ts-ignore
    [returnMapProviders, dropPosition, mapZoomLevel,];
    var __VLS_405;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_399;
// @ts-ignore
[];
var __VLS_387;
var __VLS_408;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSub | typeof __VLS_components.ContextMenuSub} */
context_menu_1.ContextMenuSub;
// @ts-ignore
var __VLS_409 = __VLS_asFunctionalComponent1(__VLS_408, new __VLS_408({}));
var __VLS_410 = __VLS_409.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_409), false));
var __VLS_413 = __VLS_411.slots.default;
var __VLS_414;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubTrigger | typeof __VLS_components.ContextMenuSubTrigger} */
context_menu_1.ContextMenuSubTrigger;
// @ts-ignore
var __VLS_415 = __VLS_asFunctionalComponent1(__VLS_414, new __VLS_414({
    inset: true,
}));
var __VLS_416 = __VLS_415.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_415), false));
var __VLS_419 = __VLS_417.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_417;
var __VLS_420;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSubContent | typeof __VLS_components.ContextMenuSubContent} */
context_menu_1.ContextMenuSubContent;
// @ts-ignore
var __VLS_421 = __VLS_asFunctionalComponent1(__VLS_420, new __VLS_420({}));
var __VLS_422 = __VLS_421.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_421), false));
var __VLS_425 = __VLS_423.slots.default;
var __VLS_426;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_427 = __VLS_asFunctionalComponent1(__VLS_426, new __VLS_426(__assign({ 'onSelect': {} })));
var __VLS_428 = __VLS_427.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_427), false));
var __VLS_431;
var __VLS_432 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.togglePlayback();
            // @ts-ignore
            [playback,];
        } });
var __VLS_433 = __VLS_429.slots.default;
if (__VLS_ctx.playback.playbackRunning) {
    var __VLS_434 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconPause} */
    vue_mdi_1.IconPause;
    // @ts-ignore
    var __VLS_435 = __VLS_asFunctionalComponent1(__VLS_434, new __VLS_434(__assign({ class: "mr-2 h-4 w-4" })));
    var __VLS_436 = __VLS_435.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_435), false));
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
}
else {
    var __VLS_439 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconPlay} */
    vue_mdi_1.IconPlay;
    // @ts-ignore
    var __VLS_440 = __VLS_asFunctionalComponent1(__VLS_439, new __VLS_439(__assign({ class: "mr-2 h-4 w-4" })));
    var __VLS_441 = __VLS_440.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_440), false));
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.playback.playbackRunning ? "Pause" : "Play");
var __VLS_444;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuShortcut | typeof __VLS_components.ContextMenuShortcut} */
context_menu_1.ContextMenuShortcut;
// @ts-ignore
var __VLS_445 = __VLS_asFunctionalComponent1(__VLS_444, new __VLS_444({}));
var __VLS_446 = __VLS_445.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_445), false));
var __VLS_449 = __VLS_447.slots.default;
// @ts-ignore
[playback, playback,];
var __VLS_447;
// @ts-ignore
[];
var __VLS_429;
var __VLS_430;
var __VLS_450;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_451 = __VLS_asFunctionalComponent1(__VLS_450, new __VLS_450(__assign({ 'onSelect': {} })));
var __VLS_452 = __VLS_451.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_451), false));
var __VLS_455;
var __VLS_456 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.increaseSpeed();
            // @ts-ignore
            [playback,];
        } });
var __VLS_457 = __VLS_453.slots.default;
var __VLS_458;
/** @ts-ignore @type {typeof __VLS_components.IconSpeedometer} */
vue_mdi_1.IconSpeedometer;
// @ts-ignore
var __VLS_459 = __VLS_asFunctionalComponent1(__VLS_458, new __VLS_458(__assign({ class: "mr-2 h-4 w-4" })));
var __VLS_460 = __VLS_459.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_459), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
var __VLS_463;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuShortcut | typeof __VLS_components.ContextMenuShortcut} */
context_menu_1.ContextMenuShortcut;
// @ts-ignore
var __VLS_464 = __VLS_asFunctionalComponent1(__VLS_463, new __VLS_463({}));
var __VLS_465 = __VLS_464.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_464), false));
var __VLS_468 = __VLS_466.slots.default;
// @ts-ignore
[];
var __VLS_466;
// @ts-ignore
[];
var __VLS_453;
var __VLS_454;
var __VLS_469;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_470 = __VLS_asFunctionalComponent1(__VLS_469, new __VLS_469(__assign({ 'onSelect': {} })));
var __VLS_471 = __VLS_470.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_470), false));
var __VLS_474;
var __VLS_475 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.decreaseSpeed();
            // @ts-ignore
            [playback,];
        } });
var __VLS_476 = __VLS_472.slots.default;
var __VLS_477;
/** @ts-ignore @type {typeof __VLS_components.IconSpeedometerSlow} */
vue_mdi_1.IconSpeedometerSlow;
// @ts-ignore
var __VLS_478 = __VLS_asFunctionalComponent1(__VLS_477, new __VLS_477(__assign({ class: "mr-2 h-4 w-4" })));
var __VLS_479 = __VLS_478.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_478), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
var __VLS_482;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuShortcut | typeof __VLS_components.ContextMenuShortcut} */
context_menu_1.ContextMenuShortcut;
// @ts-ignore
var __VLS_483 = __VLS_asFunctionalComponent1(__VLS_482, new __VLS_482({}));
var __VLS_484 = __VLS_483.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_483), false));
var __VLS_487 = __VLS_485.slots.default;
// @ts-ignore
[];
var __VLS_485;
// @ts-ignore
[];
var __VLS_472;
var __VLS_473;
var __VLS_488;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSeparator} */
context_menu_1.ContextMenuSeparator;
// @ts-ignore
var __VLS_489 = __VLS_asFunctionalComponent1(__VLS_488, new __VLS_488({}));
var __VLS_490 = __VLS_489.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_489), false));
var __VLS_493;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
context_menu_1.ContextMenuCheckboxItem;
// @ts-ignore
var __VLS_494 = __VLS_asFunctionalComponent1(__VLS_493, new __VLS_493(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.playback.playbackLooping) })));
var __VLS_495 = __VLS_494.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.playback.playbackLooping) })], __VLS_functionalComponentArgsRest(__VLS_494), false));
var __VLS_498;
var __VLS_499 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_500 = __VLS_496.slots.default;
// @ts-ignore
[playback,];
var __VLS_496;
var __VLS_497;
var __VLS_501;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_502 = __VLS_asFunctionalComponent1(__VLS_501, new __VLS_501(__assign({ 'onSelect': {} }, { inset: true })));
var __VLS_503 = __VLS_502.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { inset: true })], __VLS_functionalComponentArgsRest(__VLS_502), false));
var __VLS_506;
var __VLS_507 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.addMarker(__VLS_ctx.store.state.currentTime);
            // @ts-ignore
            [playback, store,];
        } });
var __VLS_508 = __VLS_504.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-1" }));
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
(__VLS_ctx.playback.startMarker && __VLS_ctx.playback.endMarker
    ? 2
    : __VLS_ctx.playback.startMarker || __VLS_ctx.playback.endMarker
        ? 1
        : 0);
// @ts-ignore
[playback, playback, playback, playback,];
var __VLS_504;
var __VLS_505;
var __VLS_509;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_510 = __VLS_asFunctionalComponent1(__VLS_509, new __VLS_509(__assign({ 'onSelect': {} }, { inset: true, disabled: (!__VLS_ctx.playback.startMarker && !__VLS_ctx.playback.endMarker) })));
var __VLS_511 = __VLS_510.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { inset: true, disabled: (!__VLS_ctx.playback.startMarker && !__VLS_ctx.playback.endMarker) })], __VLS_functionalComponentArgsRest(__VLS_510), false));
var __VLS_514;
var __VLS_515 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.clearMarkers();
            // @ts-ignore
            [playback, playback, playback,];
        } });
var __VLS_516 = __VLS_512.slots.default;
// @ts-ignore
[];
var __VLS_512;
var __VLS_513;
if (__VLS_ctx.playback.startMarker !== undefined) {
    var __VLS_517 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
    context_menu_1.ContextMenuItem;
    // @ts-ignore
    var __VLS_518 = __VLS_asFunctionalComponent1(__VLS_517, new __VLS_517({
        disabled: true,
    }));
    var __VLS_519 = __VLS_518.apply(void 0, __spreadArray([{
            disabled: true,
        }], __VLS_functionalComponentArgsRest(__VLS_518), false));
    var __VLS_522 = __VLS_520.slots.default;
    var __VLS_523 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconClockStart} */
    vue_mdi_1.IconClockStart;
    // @ts-ignore
    var __VLS_524 = __VLS_asFunctionalComponent1(__VLS_523, new __VLS_523(__assign({ class: "mr-2 h-4 w-4" })));
    var __VLS_525 = __VLS_524.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_524), false));
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.tm.scenarioFormatter.format(__VLS_ctx.playback.startMarker));
    // @ts-ignore
    [playback, playback, tm,];
    var __VLS_520;
}
if (__VLS_ctx.playback.endMarker !== undefined) {
    var __VLS_528 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
    context_menu_1.ContextMenuItem;
    // @ts-ignore
    var __VLS_529 = __VLS_asFunctionalComponent1(__VLS_528, new __VLS_528({
        disabled: true,
    }));
    var __VLS_530 = __VLS_529.apply(void 0, __spreadArray([{
            disabled: true,
        }], __VLS_functionalComponentArgsRest(__VLS_529), false));
    var __VLS_533 = __VLS_531.slots.default;
    var __VLS_534 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconClockEnd} */
    vue_mdi_1.IconClockEnd;
    // @ts-ignore
    var __VLS_535 = __VLS_asFunctionalComponent1(__VLS_534, new __VLS_534(__assign({ class: "mr-2 h-4 w-4" })));
    var __VLS_536 = __VLS_535.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_535), false));
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.tm.scenarioFormatter.format(__VLS_ctx.playback.endMarker));
    // @ts-ignore
    [playback, playback, tm,];
    var __VLS_531;
}
// @ts-ignore
[];
var __VLS_423;
// @ts-ignore
[];
var __VLS_411;
var __VLS_539;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSeparator} */
context_menu_1.ContextMenuSeparator;
// @ts-ignore
var __VLS_540 = __VLS_asFunctionalComponent1(__VLS_539, new __VLS_539({}));
var __VLS_541 = __VLS_540.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_540), false));
var __VLS_544;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
context_menu_1.ContextMenuCheckboxItem;
// @ts-ignore
var __VLS_545 = __VLS_asFunctionalComponent1(__VLS_544, new __VLS_544(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showToolbar) })));
var __VLS_546 = __VLS_545.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showToolbar) })], __VLS_functionalComponentArgsRest(__VLS_545), false));
var __VLS_549;
var __VLS_550 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_551 = __VLS_547.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_547;
var __VLS_548;
if (!__VLS_ctx.isMobile) {
    var __VLS_552 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
    context_menu_1.ContextMenuCheckboxItem;
    // @ts-ignore
    var __VLS_553 = __VLS_asFunctionalComponent1(__VLS_552, new __VLS_552(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showLeftPanel) })));
    var __VLS_554 = __VLS_553.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showLeftPanel) })], __VLS_functionalComponentArgsRest(__VLS_553), false));
    var __VLS_557 = void 0;
    var __VLS_558 = ({ select: {} },
        { onSelect: function () { } });
    var __VLS_559 = __VLS_555.slots.default;
    // @ts-ignore
    [uiSettings, isMobile,];
    var __VLS_555;
    var __VLS_556;
}
var __VLS_560;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
context_menu_1.ContextMenuCheckboxItem;
// @ts-ignore
var __VLS_561 = __VLS_asFunctionalComponent1(__VLS_560, new __VLS_560(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showTimeline) })));
var __VLS_562 = __VLS_561.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showTimeline) })], __VLS_functionalComponentArgsRest(__VLS_561), false));
var __VLS_565;
var __VLS_566 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_567 = __VLS_563.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_563;
var __VLS_564;
var __VLS_568;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuCheckboxItem | typeof __VLS_components.ContextMenuCheckboxItem} */
context_menu_1.ContextMenuCheckboxItem;
// @ts-ignore
var __VLS_569 = __VLS_asFunctionalComponent1(__VLS_568, new __VLS_568(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showOrbatBreadcrumbs) })));
var __VLS_570 = __VLS_569.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showOrbatBreadcrumbs) })], __VLS_functionalComponentArgsRest(__VLS_569), false));
var __VLS_573;
var __VLS_574 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_575 = __VLS_571.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_571;
var __VLS_572;
// @ts-ignore
[];
var __VLS_25;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
var __VLS_16 = __VLS_15;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
