"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var searchActions_1 = require("@/composables/searchActions");
var constants_1 = require("@/types/constants");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var uiStore_1 = require("@/stores/uiStore");
var scenarioActions_1 = require("@/composables/scenarioActions");
var proj_1 = require("ol/proj");
var extent_1 = require("ol/extent");
var Polygon_1 = require("ol/geom/Polygon");
var Point_1 = require("ol/geom/Point");
var Vector_1 = require("ol/layer/Vector");
var Vector_2 = require("ol/source/Vector");
var Feature_1 = require("ol/Feature");
var selectedStore_1 = require("@/stores/selectedStore");
var core_1 = require("@vueuse/core");
var eventKeys_1 = require("@/components/eventKeys");
var geoConvert_1 = require("@/utils/geoConvert");
var scenarioMapLayers_1 = require("@/modules/scenarioeditor/scenarioMapLayers");
var playbackStore_1 = require("@/stores/playbackStore");
var mapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var activeLayerId = (0, utils_1.injectStrict)(injects_1.activeLayerKey);
var imageLayerBus = (0, core_1.useEventBus)(eventKeys_1.imageLayerAction);
var l = (0, featureLayerUtils_1.useFeatureLayerUtils)(mapRef.value);
var playback = (0, playbackStore_1.usePlaybackStore)();
var _a = (0, searchActions_1.useSearchActions)(), onUnitSelect = _a.onUnitSelect, onFeatureSelect = _a.onFeatureSelect, onLayerSelect = _a.onLayerSelect, onEventSelect = _a.onEventSelect, onPlaceSelect = _a.onPlaceSelect, onImageLayerSelect = _a.onImageLayerSelect, onScenarioAction = _a.onScenarioAction;
var ui = (0, uiStore_1.useUiStore)();
var _b = (0, selectedStore_1.useSelectedItems)(), selectedUnitIds = _b.selectedUnitIds, selectedFeatureIds = _b.selectedFeatureIds, activeUnitId = _b.activeUnitId, activeScenarioEventId = _b.activeScenarioEventId, activeMapLayerId = _b.activeMapLayerId;
var onUnitAction = (0, scenarioActions_1.useUnitActions)().onUnitAction;
var toeActions = (0, scenarioActions_1.useToeActions)();
onUnitSelect(function (_a) {
    var unitId = _a.unitId, options = _a.options;
    var doZoom = !((options === null || options === void 0 ? void 0 : options.noZoom) === true);
    ui.activeTabIndex = constants_1.TAB_ORBAT;
    activeUnitId.value = unitId;
    selectedUnitIds.value.clear();
    selectedUnitIds.value.add(unitId);
    var unit = activeScenario.unitActions.getUnitById(unitId);
    var parents = activeScenario.unitActions.getUnitHierarchy(unitId).parents;
    parents.forEach(function (p) { return (p._isOpen = true); });
    (0, vue_1.nextTick)(function () {
        var el = document.getElementById("ou-".concat(unitId));
        if (el) {
            el.scrollIntoView();
        }
        if (doZoom) {
            onUnitAction(unit, constants_1.UnitActions.Zoom);
        }
    });
});
onLayerSelect(function (_a) {
    var layerId = _a.layerId;
    if (!mapRef.value)
        return;
    ui.activeTabIndex = constants_1.TAB_LAYERS;
    (0, vue_1.nextTick)(function () {
        var layer = l.getLayerById(layerId);
        if (layer) {
            layer._isOpen = true;
            (0, vue_1.nextTick)(function () { return l.zoomToLayer(layerId); });
        }
        activeLayerId.value = layerId;
    });
});
onImageLayerSelect(function (_a) {
    var layerId = _a.layerId;
    if (!mapRef.value)
        return;
    ui.activeTabIndex = constants_1.TAB_LAYERS;
    (0, vue_1.nextTick)(function () {
        imageLayerBus.emit({ action: "zoom", id: layerId });
        activeMapLayerId.value = layerId;
    });
});
onScenarioAction(function (_a) {
    var action = _a.action;
    if (!mapRef.value)
        return;
    if (action === "addTileJSONLayer" ||
        action === "addXYZLayer" ||
        action === "addImageLayer") {
        var layerType = action === "addXYZLayer"
            ? "XYZLayer"
            : action === "addImageLayer"
                ? "ImageLayer"
                : "TileJSONLayer";
        ui.activeTabIndex = constants_1.TAB_LAYERS;
        var newLayer_1 = (0, scenarioMapLayers_1.addMapLayer)(layerType, activeScenario.geo);
        ui.mapLayersPanelOpen = true;
        (0, vue_1.nextTick)(function () {
            activeMapLayerId.value = newLayer_1.id;
        });
    }
    else if (action === "addEquipment") {
        toeActions.goToAddEquipment();
    }
    else if (action === "addPersonnel") {
        toeActions.goToAddPersonnel();
    }
    else if (action === "startPlayback") {
        playback.playbackRunning = true;
    }
    else if (action === "stopPlayback") {
        playback.playbackRunning = false;
    }
    else if (action === "increaseSpeed") {
        playback.increaseSpeed();
    }
    else if (action === "decreaseSpeed") {
        playback.decreaseSpeed();
    }
});
onFeatureSelect(function (_a) {
    var featureId = _a.featureId;
    ui.activeTabIndex = constants_1.TAB_LAYERS;
    var _b = activeScenario.geo.getFeatureById(featureId), feature = _b.feature, layer = _b.layer;
    (0, vue_1.nextTick)(function () {
        if (layer) {
            layer._isOpen = true;
        }
        if (feature) {
            selectedUnitIds.value.clear();
            selectedFeatureIds.value.clear();
            selectedFeatureIds.value.add(featureId);
            (0, vue_1.nextTick)(function () { return l.zoomToFeature(featureId); });
        }
    });
});
onEventSelect(function (e) {
    activeScenario.time.goToScenarioEvent(e.id);
    activeScenarioEventId.value = e.id;
    ui.activeTabIndex = constants_1.TAB_EVENTS;
});
onPlaceSelect(function (item) {
    var map = mapRef.value;
    var transform = (0, proj_1.getTransform)("EPSG:4326", map.getView().getProjection());
    var extent = (0, geoConvert_1.fixExtent)(item.properties.extent);
    var polygon = extent && (0, Polygon_1.fromExtent)((0, extent_1.applyTransform)(extent, transform));
    var p = new Point_1.default(item.geometry.coordinates).transform("EPSG:4326", map.getView().getProjection());
    // add temporary layer
    var layer = new Vector_1.default({
        source: new Vector_2.default({
            features: [new Feature_1.default({ geometry: polygon || p })],
        }),
        style: {
            "stroke-color": "#f00",
            "stroke-width": 2,
            "circle-radius": 12,
            "circle-stroke-color": "#f00",
            "circle-stroke-width": 4,
        },
    });
    layer.setMap(map);
    setTimeout(function () { return layer.setMap(null); }, 2000);
    map.getView().fit(polygon || p, { maxZoom: 15 });
});
var __VLS_ctx = {};
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
