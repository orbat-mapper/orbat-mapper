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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var uiStore_1 = require("@/stores/uiStore");
var core_1 = require("@vueuse/core");
var geoStore_1 = require("@/stores/geoStore");
var settingsStore_1 = require("@/stores/settingsStore");
var pinia_1 = require("pinia");
var geoUnitLayers_1 = require("@/composables/geoUnitLayers");
var Group_1 = require("ol/layer/Group");
var scenarioMapLayers_1 = require("@/modules/scenarioeditor/scenarioMapLayers");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
var mapSelectStore_1 = require("@/stores/mapSelectStore");
var geoHover_1 = require("@/composables/geoHover");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var geoShowLocation_1 = require("@/composables/geoShowLocation");
var geoScaleLine_1 = require("@/composables/geoScaleLine");
var unitStyles_1 = require("@/geo/unitStyles");
var geoRangeRings_1 = require("@/composables/geoRangeRings");
var geoUnitHistory_1 = require("@/composables/geoUnitHistory");
var geoDayNight_1 = require("@/composables/geoDayNight");
var scenarioEvents_1 = require("@/modules/scenarioeditor/scenarioEvents");
var searchActions_1 = require("@/composables/searchActions");
var scenarioFeatureLayers_1 = require("@/modules/scenarioeditor/scenarioFeatureLayers");
var selectedStore_1 = require("@/stores/selectedStore");
var props = defineProps();
var emit = defineEmits();
var _c = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), geo = _c.geo, state = _c.store.state;
var mapRef = (0, vue_1.shallowRef)();
var uiStore = (0, uiStore_1.useUiStore)();
var widthStore = (0, uiStore_1.useWidthStore)();
var _d = (0, pinia_1.storeToRefs)(widthStore), orbatPanelWidth = _d.orbatPanelWidth, detailsWidth = _d.detailsWidth;
var showLeftPanel = (0, pinia_1.storeToRefs)(uiStore).showLeftPanel;
var _e = (0, selectedStore_1.useSelectedItems)(), selectedFeatureIds = _e.selectedFeatureIds, selectedUnitIds = _e.selectedUnitIds, activeScenarioEventId = _e.activeScenarioEventId, activeMapLayerId = _e.activeMapLayerId, showScenarioInfo = _e.showScenarioInfo;
var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
var isMobile = breakpoints.smallerOrEqual("md");
var showDetailsPanel = (0, vue_1.computed)(function () {
    return Boolean(selectedFeatureIds.value.size ||
        selectedUnitIds.value.size ||
        activeScenarioEventId.value ||
        activeMapLayerId.value ||
        showScenarioInfo.value);
});
var doNotFilterLayers = (0, vue_1.computed)(function () { return uiStore.layersPanelActive; });
var unitSettingsStore = (0, geoStore_1.useUnitSettingsStore)();
var mapSettingsStore = (0, mapSettingsStore_1.useMapSettingsStore)();
var geoStore = (0, geoStore_1.useGeoStore)();
var settingsStore = (0, settingsStore_1.useSettingsStore)();
var symbolSettings = (0, settingsStore_1.useSymbolSettingsStore)();
var moveUnitEnabled = (0, pinia_1.storeToRefs)((0, geoStore_1.useUnitSettingsStore)()).moveUnitEnabled;
var measurementUnit = (0, pinia_1.storeToRefs)((0, geoStore_1.useMeasurementsStore)()).measurementUnit;
var _f = (0, geoUnitLayers_1.useUnitLayer)(), unitLayer = _f.unitLayer, drawUnits = _f.drawUnits, labelLayer = _f.labelLayer;
var onScenarioAction = (0, searchActions_1.useSearchActions)().onScenarioAction;
var _g = (0, geoUnitLayers_1.useMapDrop)(mapRef, unitLayer), isDragging = _g.isDragging, formattedPosition = _g.formattedPosition;
var olMap = props.olMap;
mapRef.value = olMap;
geoStore.olMap = olMap;
(0, geoUnitLayers_1.calculateZoomToResolution)(olMap.getView());
var unitLayerGroup = new Group_1.default({
    layers: [labelLayer, unitLayer],
});
unitLayerGroup.set("title", "Units");
var _h = (0, pinia_1.storeToRefs)(unitSettingsStore), showHistory = _h.showHistory, editHistory = _h.editHistory, showWaypointTimestamps = _h.showWaypointTimestamps;
var _j = (0, pinia_1.storeToRefs)((0, mapSelectStore_1.useMapSelectStore)()), unitSelectEnabled = _j.unitSelectEnabled, featureSelectEnabled = _j.featureSelectEnabled, hoverEnabled = _j.hoverEnabled;
var dayNightLayer = (0, geoDayNight_1.useDayNightLayer)();
olMap.addLayer(dayNightLayer);
var loadMapLayers = (0, scenarioMapLayers_1.useScenarioMapLayers)(olMap).initializeFromStore;
var initializeFeatureLayersFromStore = (0, scenarioFeatureLayers_1.useScenarioFeatureLayers)(olMap).initializeFeatureLayersFromStore;
var _k = (0, geoRangeRings_1.useRangeRingsLayer)(), rangeLayer = _k.rangeLayer, drawRangeRings = _k.drawRangeRings;
// Disable temporarily
var _l = (0, scenarioEvents_1.useScenarioEvents)(olMap);
olMap.addLayer(rangeLayer);
var _m = (0, geoUnitHistory_1.useUnitHistory)(olMap, {
    showHistory: showHistory,
    editHistory: editHistory,
    showWaypointTimestamps: showWaypointTimestamps,
}), historyLayer = _m.historyLayer, drawHistory = _m.drawHistory, historyModify = _m.historyModify, waypointSelect = _m.waypointSelect, ctrlClickInteraction = _m.ctrlClickInteraction;
(0, geoHover_1.useMapHover)(olMap, { enable: hoverEnabled });
olMap.addLayer(historyLayer);
olMap.addLayer(unitLayerGroup);
var _o = (0, geoUnitLayers_1.useUnitSelectInteraction)([unitLayer], olMap, {
    enable: unitSelectEnabled,
}), unitSelectInteraction = _o.unitSelectInteraction, boxSelectInteraction = _o.boxSelectInteraction, redrawSelectedUnits = _o.redraw;
// Order of select interactions is important. The interaction that is added last
// will be the one that receives the select event first and can stop the propagation.
olMap.addInteraction(unitSelectInteraction);
olMap.addInteraction(boxSelectInteraction);
olMap.addInteraction(waypointSelect);
olMap.addInteraction(historyModify);
olMap.addInteraction(ctrlClickInteraction);
var featureSelectInteraction = (0, featureLayerUtils_1.useScenarioFeatureSelect)(olMap, {
    enable: featureSelectEnabled,
}).selectInteraction;
var moveUnitInteraction = (0, geoUnitLayers_1.useMoveInteraction)(olMap, unitLayer, moveUnitEnabled).moveInteraction;
(0, openlayersHelpers_1.useOlEvent)(unitLayerGroup.on("change:visible", toggleMoveUnitInteraction));
olMap.addInteraction(moveUnitInteraction);
var _p = (0, pinia_1.storeToRefs)((0, mapSettingsStore_1.useMapSettingsStore)()), showLocation = _p.showLocation, coordinateFormat = _p.coordinateFormat, showScaleLine = _p.showScaleLine;
(0, geoShowLocation_1.useShowLocationControl)(olMap, {
    coordinateFormat: coordinateFormat,
    enable: showLocation,
});
(0, geoScaleLine_1.useShowScaleLine)(olMap, {
    enabled: showScaleLine,
    measurementUnits: measurementUnit,
});
drawRangeRings();
drawUnits();
drawHistory();
loadMapLayers();
initializeFeatureLayersFromStore();
//loadScenarioLayers();
// Set initial view: prioritize bounding box, then fall back to unit extent
if (state.boundingBox && state.boundingBox.length === 4) {
    var leftPadding = !isMobile.value && showLeftPanel.value ? orbatPanelWidth.value : 0;
    var rightPadding = !isMobile.value && showDetailsPanel.value ? detailsWidth.value : 0;
    var padding = [20, rightPadding + 20, 20, leftPadding + 20];
    geoStore.zoomToBbox(state.boundingBox, {
        duration: 0,
        maxZoom: 16,
        padding: padding,
    });
}
else {
    var extent = (_a = unitLayer.getSource()) === null || _a === void 0 ? void 0 : _a.getExtent();
    if (extent && !((_b = unitLayer.getSource()) === null || _b === void 0 ? void 0 : _b.isEmpty()))
        olMap.getView().fit(extent, { padding: [100, 100, 150, 100], maxZoom: 16 });
}
function toggleMoveUnitInteraction(event) {
    var isUnitLayerVisible = !event.oldValue;
    moveUnitInteraction.setActive(isUnitLayerVisible && moveUnitEnabled.value);
}
emit("map-ready", { olMap: olMap, featureSelectInteraction: featureSelectInteraction, unitSelectInteraction: unitSelectInteraction });
function redrawUnits() {
    drawUnits();
    drawHistory();
    redrawSelectedUnits();
    drawRangeRings();
}
(0, vue_1.watch)(geo.everyVisibleUnit, function () { return redrawUnits(); }, { deep: true });
(0, vue_1.watch)([settingsStore, symbolSettings, mapSettingsStore], function () {
    (0, unitStyles_1.clearUnitStyleCache)();
    drawUnits();
});
(0, vue_1.watch)([function () { return state.currentTime; }, doNotFilterLayers, function () { return state.featureStateCounter; }], function () {
    initializeFeatureLayersFromStore({
        doClearCache: false,
        filterVisible: !doNotFilterLayers.value,
    });
    // trigger redraw of selected features
    if (selectedFeatureIds.value.size > 0) {
        var ids = Array.from(selectedFeatureIds.value);
        selectedFeatureIds.value.clear();
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            selectedFeatureIds.value.add(id);
        }
    }
});
(0, vue_1.onUnmounted)(function () {
    geoStore.olMap = undefined;
    (0, unitStyles_1.clearUnitStyleCache)();
});
onScenarioAction(function (e) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(e.action === "exportToImage")) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, openlayersHelpers_1.saveMapAsPng)(olMap)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.isDragging) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pointer-events-none absolute inset-0 border-4 border-dashed border-blue-700" }));
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blue-700']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-foreground bg-background absolute bottom-1 left-2 rounded px-1 text-base tracking-tighter tabular-nums" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-tighter']} */ ;
    /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
    (__VLS_ctx.formattedPosition);
}
// @ts-ignore
[isDragging, formattedPosition,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
