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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.featureMenuItems = exports.LayerTypes = void 0;
exports.getGeometryIcon = getGeometryIcon;
exports.getItemsIcon = getItemsIcon;
exports.createScenarioLayerFeatures = createScenarioLayerFeatures;
exports.useScenarioFeatureSelect = useScenarioFeatureSelect;
exports.useFeatureLayerUtils = useFeatureLayerUtils;
exports.getOrCreateLayerGroup = getOrCreateLayerGroup;
exports.useScenarioLayerSync = useScenarioLayerSync;
var Group_1 = require("ol/layer/Group");
var condition_1 = require("ol/events/condition");
var extent_1 = require("ol/extent");
var helpers_1 = require("@turf/helpers");
var envelope_1 = require("@turf/envelope");
var utils_1 = require("@/utils");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
var GeoJSON_1 = require("ol/format/GeoJSON");
var Feature_1 = require("ol/Feature");
var Circle_1 = require("ol/geom/Circle");
var proj_1 = require("ol/proj");
var LineString_1 = require("ol/geom/LineString");
var destination_1 = require("@turf/destination");
var vue_1 = require("vue");
var Observable_1 = require("ol/Observable");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var Select_1 = require("ol/interaction/Select");
var injects_1 = require("@/components/injects");
var Fill_1 = require("ol/style/Fill");
var Style_1 = require("ol/style/Style");
var Stroke_1 = require("ol/style/Stroke");
var Circle_2 = require("ol/style/Circle");
var selectedStore_1 = require("@/stores/selectedStore");
var selectStyle = new Style_1.default({
    stroke: new Stroke_1.default({ color: "#ffff00", width: 9 }),
    image: new Circle_2.default({
        radius: 15,
        fill: new Fill_1.default({
            color: "#ffff00",
        }),
    }),
});
var selectMarkerStyle = new Style_1.default({
    image: new Circle_2.default({
        radius: 15,
        fill: new Fill_1.default({
            color: "#ffff00",
        }),
    }),
});
exports.LayerTypes = {
    scenarioFeature: "SCENARIO_FEATURE",
    units: "UNITS",
    labels: "LABELS",
};
var geometryIconMap = {
    Point: vue_mdi_1.IconMapMarker,
    LineString: vue_mdi_1.IconVectorLine,
    Polygon: vue_mdi_1.IconVectorTriangle,
    Circle: vue_mdi_1.IconVectorCircleVariant,
    GeometryCollection: vue_mdi_1.IconMapMarkerMultipleOutline,
    layer: vue_mdi_1.IconLayersOutline,
};
function getGeometryIcon(feature) {
    return (feature && geometryIconMap[feature.meta.type]) || geometryIconMap.Polygon;
}
function getItemsIcon(type) {
    return geometryIconMap[type];
}
exports.featureMenuItems = [
    { label: "Zoom to", action: "zoom" },
    { label: "Pan to", action: "pan" },
    { label: "Move up", action: "moveUp" },
    { label: "Move down", action: "moveDown" },
    { label: "Delete", action: "delete" },
    { label: "Duplicate", action: "duplicate" },
];
var layersMap = new WeakMap();
function convertRadius(center, radiusInMeters) {
    var p = (0, destination_1.default)(center, radiusInMeters / 1000, 90);
    var line = new LineString_1.default([center.geometry.coordinates, p.geometry.coordinates]);
    line.transform("EPSG:4326", "EPSG:3857");
    return line.getLength();
}
function createScenarioLayerFeatures(features, featureProjection) {
    var gjson = new GeoJSON_1.default({
        dataProjection: "EPSG:4326",
        featureProjection: featureProjection,
    });
    var olFeatures = [];
    features.forEach(function (fullFeature, index) {
        var _a;
        var feature = fullFeature;
        if (fullFeature._state) {
            var _b = fullFeature._state, geometry = _b.geometry, properties = _b.properties, rest = __rest(_b, ["geometry", "properties"]);
            feature = __assign(__assign({}, fullFeature), { geometry: geometry || fullFeature.geometry });
        }
        feature.meta._zIndex = index;
        if (((_a = feature.meta) === null || _a === void 0 ? void 0 : _a.radius) && feature.geometry.type === "Point") {
            var newRadius = convertRadius(feature, feature.meta.radius);
            var circle = new Circle_1.default((0, proj_1.fromLonLat)(feature.geometry.coordinates), newRadius);
            var f = new Feature_1.default(__assign({ geometry: circle }, feature.properties));
            f.setId(feature.id);
            olFeatures.push(f);
        }
        else {
            var f = gjson.readFeature(feature, {
                featureProjection: "EPSG:3857",
                dataProjection: "EPSG:4326",
            });
            olFeatures.push(f);
        }
    });
    return olFeatures;
}
function useScenarioFeatureSelect(olMap, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var scenarioFeatureStyle = (0, utils_1.injectStrict)(injects_1.activeFeatureStylesKey).scenarioFeatureStyle;
    var scenarioLayersGroup = getOrCreateLayerGroup(olMap);
    var scenarioLayersOl = scenarioLayersGroup.getLayers();
    var _b = (0, selectedStore_1.useSelectedItems)(), selectedIds = _b.selectedFeatureIds, selectedUnitIds = _b.selectedUnitIds;
    var enableRef = (0, vue_1.ref)((_a = options.enable) !== null && _a !== void 0 ? _a : true);
    var selectInteraction = new Select_1.default({
        condition: condition_1.click,
        hitTolerance: 20,
        layers: scenarioLayersOl.getArray(),
        style: function (feature, res) {
            var _a, _b, _c;
            var styleOrStyles = scenarioFeatureStyle(feature, res, true);
            // scenarioFeatureStyle may return an array when arrows are present
            var baseStyle = Array.isArray(styleOrStyles) ? styleOrStyles[0] : styleOrStyles;
            var activeSelectStyle;
            if (((_a = feature.getGeometry()) === null || _a === void 0 ? void 0 : _a.getType()) === "Point") {
                activeSelectStyle = selectMarkerStyle;
            }
            else {
                (_b = selectStyle.getStroke()) === null || _b === void 0 ? void 0 : _b.setWidth((((_c = baseStyle.getStroke()) === null || _c === void 0 ? void 0 : _c.getWidth()) || 0) + 8);
                activeSelectStyle = selectStyle;
            }
            if (Array.isArray(styleOrStyles)) {
                return __spreadArray([activeSelectStyle], styleOrStyles, true);
            }
            return [activeSelectStyle, baseStyle];
        },
    });
    var selectedFeatures = selectInteraction.getFeatures();
    var isInternal = false;
    (0, openlayersHelpers_1.useOlEvent)(selectInteraction.on("select", function (event) {
        isInternal = true;
        event.selected.forEach(function (f) { return selectedIds.value.add(f.getId()); });
        event.deselected.forEach(function (f) { return selectedIds.value.delete(f.getId()); });
    }));
    (0, vue_1.watch)(function () { return __spreadArray([], selectedIds.value, true); }, function (v) {
        if (!isInternal) {
            selectedFeatures.clear();
            v.forEach(function (fid) {
                var feature = ((0, openlayersHelpers_1.getFeatureAndLayerById)(fid, scenarioLayersOl) || {}).feature;
                if (feature)
                    selectedFeatures.push(feature);
            });
        }
        else {
            if (selectedUnitIds.value.size > 0) {
                selectedIds.value.clear();
                selectedFeatures.clear();
            }
        }
        isInternal = false;
    }, { immediate: true });
    olMap.addInteraction(selectInteraction);
    (0, vue_1.watch)(enableRef, function (enabled) {
        selectInteraction.getFeatures().clear();
        selectInteraction.setActive(enabled);
    }, { immediate: true });
    (0, vue_1.onUnmounted)(function () {
        olMap.removeInteraction(selectInteraction);
    });
    return { selectedIds: selectedIds, selectedFeatures: selectedFeatures, selectInteraction: selectInteraction };
}
function useFeatureLayerUtils(olMap, _a) {
    var _b = _a === void 0 ? {} : _a, activeScenario = _b.activeScenario;
    var _c = activeScenario || (0, utils_1.injectStrict)(injects_1.activeScenarioKey), geo = _c.geo, state = _c.store.state;
    var scenarioLayersGroup = getOrCreateLayerGroup(olMap);
    var scenarioLayersOl = scenarioLayersGroup.getLayers();
    function getOlLayerById(layerId) {
        return scenarioLayersOl
            .getArray()
            .find(function (e) { return e.get("id") === layerId; });
    }
    function zoomToFeature(featureId) {
        var olFeature = ((0, openlayersHelpers_1.getFeatureAndLayerById)(featureId, scenarioLayersOl) || {}).feature;
        if (!(olFeature === null || olFeature === void 0 ? void 0 : olFeature.getGeometry()))
            return;
        olMap.getView().fit(olFeature.getGeometry(), { maxZoom: 15 });
    }
    function zoomToFeatures(featureIds) {
        var c = (0, helpers_1.featureCollection)(featureIds.map(function (fid) { return state.featureMap[fid]; }));
        var bb = new GeoJSON_1.default().readFeature((0, envelope_1.default)(c), {
            featureProjection: "EPSG:3857",
            dataProjection: "EPSG:4326",
        });
        if (!bb)
            return;
        olMap.getView().fit(bb.getGeometry(), { maxZoom: 17 });
    }
    function panToFeature(featureId) {
        var _a;
        var olFeature = ((0, openlayersHelpers_1.getFeatureAndLayerById)(featureId, scenarioLayersOl) || {}).feature;
        if (!olFeature)
            return;
        var view = olMap.getView();
        var extent = (_a = olFeature === null || olFeature === void 0 ? void 0 : olFeature.getGeometry()) === null || _a === void 0 ? void 0 : _a.getExtent();
        extent &&
            view.animate({
                center: (0, extent_1.getCenter)(extent),
            });
    }
    function zoomToLayer(layerId) {
        var _a;
        var olLayer = getOlLayerById(layerId);
        if (!olLayer)
            return;
        var layerExtent = (_a = olLayer.getSource()) === null || _a === void 0 ? void 0 : _a.getExtent();
        layerExtent && !(0, extent_1.isEmpty)(layerExtent) && olMap.getView().fit(layerExtent);
    }
    function getLayerById(layerId) {
        return geo.getLayerById(layerId);
    }
    return {
        scenarioLayersGroup: scenarioLayersGroup,
        scenarioLayers: geo.layers,
        scenarioLayersFeatures: geo.layersFeatures,
        getOlLayerById: getOlLayerById,
        zoomToFeature: zoomToFeature,
        zoomToFeatures: zoomToFeatures,
        zoomToLayer: zoomToLayer,
        panToFeature: panToFeature,
        getLayerById: getLayerById,
    };
}
function getOrCreateLayerGroup(olMap) {
    if (layersMap.has(olMap))
        return layersMap.get(olMap);
    var layerGroup = new Group_1.default({
        properties: { id: (0, utils_1.nanoid)(), title: "Scenario layers" },
    });
    layersMap.set(olMap, layerGroup);
    olMap.addLayer(layerGroup);
    return layerGroup;
}
function useScenarioLayerSync(olLayers) {
    var geo = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).geo;
    var eventKeys = [];
    function addListener(l) {
        eventKeys.push(l.on("change:visible", function (event) {
            var isVisible = l.getVisible();
            geo.updateLayer(l.get("id"), { isHidden: !isVisible }, { undoable: false });
        }));
    }
    olLayers.forEach(function (l) {
        addListener(l);
    });
    (0, openlayersHelpers_1.useOlEvent)(olLayers.on("add", function (event) {
        var addedLayer = event.element;
        addListener(addedLayer);
    }));
    (0, vue_1.onUnmounted)(function () {
        eventKeys.forEach(function (key) { return (0, Observable_1.unByKey)(key); });
    });
}
