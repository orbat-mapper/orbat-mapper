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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScenarioFeatureLayers = useScenarioFeatureLayers;
exports.convertOlFeatureToScenarioFeature = convertOlFeatureToScenarioFeature;
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var proj_1 = require("ol/proj");
var Vector_1 = require("ol/layer/Vector");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
var Vector_2 = require("ol/source/Vector");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
var coordinate_1 = require("ol/coordinate");
var sphere_1 = require("ol/sphere");
var LineString_1 = require("ol/geom/LineString");
var helpers_1 = require("@turf/helpers");
var format_1 = require("ol/format");
var undoActionLabels = [
    "deleteLayer",
    "moveLayer",
    "updateLayer",
    "batchLayer",
    "moveFeature",
    "deleteFeature",
    "addFeature",
    "updateFeatureGeometry",
    "updateFeature",
];
// A composable responsible for keeping scenario feature layers in sync with the OpenLayers map.
function useScenarioFeatureLayers(olMap) {
    var scn = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
    var _a = (0, utils_1.injectStrict)(injects_1.activeFeatureStylesKey), scenarioFeatureStyle = _a.scenarioFeatureStyle, clearCache = _a.clearCache, invalidateStyle = _a.invalidateStyle;
    var olFeatureLayersGroup = (0, featureLayerUtils_1.getOrCreateLayerGroup)(olMap);
    scn.geo.onFeatureLayerEvent(featureLayerEventHandler);
    function featureLayerEventHandler(event) {
        switch (event.type) {
            case "removeLayer":
                olDeleteLayer(event.id);
                break;
            case "addLayer":
                olAddLayer(event.id);
                break;
            case "moveLayer":
                moveLayer(event.id);
                break;
            case "updateLayer":
                olUpdateLayer(event.id, event.data);
                break;
            case "updateFeature":
                olDeleteFeature(event.id);
                var feature = scn.geo.getFeatureById(event.id).feature;
                if (feature && !feature._hidden) {
                    olAddFeature(event.id);
                }
                invalidateStyle(event.id);
                olFeatureLayersGroup.getLayers().forEach(function (layer) { return layer.changed(); });
                break;
            case "moveFeature":
                initializeFeatureLayersFromStore({ doClearCache: false, filterVisible: false });
                break;
            case "deleteFeature":
                olDeleteFeature(event.id);
                break;
            case "addFeature":
                olAddFeature(event.id);
                break;
            default:
                console.warn("Unhandled feature layer event", event);
        }
    }
    scn.store.onUndoRedo(function (_a) {
        var meta = _a.meta, action = _a.action;
        if (!meta || !undoActionLabels.includes(meta.label))
            return;
        var label = meta.label, layerOrFeatureId = meta.value;
        if (label === "deleteLayer") {
            if (action === "undo") {
                olDeleteLayer(layerOrFeatureId);
            }
            else {
                olAddLayer(layerOrFeatureId);
            }
        }
        else if (label === "moveLayer") {
            moveLayer(layerOrFeatureId);
        }
        else if (label === "updateLayer") {
            var layer = scn.geo.getLayerById(layerOrFeatureId);
            if (layer) {
                olUpdateLayer(layerOrFeatureId, layer);
            }
        }
        else if (label === "batchLayer") {
            // FIXME ugly hack
            initializeFeatureLayersFromStore({ doClearCache: true, filterVisible: false });
        }
        else if (label === "moveFeature") {
            initializeFeatureLayersFromStore({ doClearCache: true, filterVisible: false });
        }
        else if (label === "updateFeature") {
            olDeleteFeature(layerOrFeatureId);
            var feature = scn.geo.getFeatureById(layerOrFeatureId).feature;
            if (feature && !feature._hidden) {
                olAddFeature(layerOrFeatureId);
            }
            invalidateStyle(layerOrFeatureId);
            olFeatureLayersGroup.getLayers().forEach(function (layer) { return layer.changed(); });
        }
        else if (label === "deleteFeature") {
            if (action === "undo") {
                olAddFeature(layerOrFeatureId);
            }
            else {
                olDeleteFeature(layerOrFeatureId);
            }
        }
        else if (label === "addFeature") {
            if (action === "undo") {
                olDeleteFeature(layerOrFeatureId);
            }
            else {
                olAddFeature(layerOrFeatureId);
            }
        }
        else if (label === "updateFeatureGeometry") {
            olDeleteFeature(layerOrFeatureId);
            olAddFeature(layerOrFeatureId);
        }
    });
    function olDeleteLayer(layerId) {
        var _a;
        var layer = getOlLayerById(layerId);
        if (layer) {
            (_a = layer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
            olFeatureLayersGroup.getLayers().remove(layer);
        }
    }
    function olAddLayer(layerId) {
        var featureLayer = scn.geo.getFullLayer(layerId);
        featureLayer &&
            olFeatureLayersGroup.getLayers().push(olCreateScenarioFeatureLayer(featureLayer));
    }
    function olUpdateLayer(layerId, data) {
        var _a;
        var layer = getOlLayerById(layerId);
        if (!layer) {
            olAddLayer(layerId);
            return;
        }
        if (data.isHidden !== undefined) {
            layer.setVisible(!data.isHidden);
        }
        if (data.opacity !== undefined) {
            layer.setOpacity(data.opacity);
        }
        if (data.attributions !== undefined) {
            (_a = layer.getSource()) === null || _a === void 0 ? void 0 : _a.setAttributions(data.attributions);
        }
        if (data.name !== undefined) {
            layer.set("title", data.name);
        }
    }
    function moveLayer(layerId) {
        var layer = getOlLayerById(layerId);
        var newIndex = scn.geo.getLayerIndex(layerId);
        if (!layer)
            return;
        olFeatureLayersGroup.getLayers().remove(layer);
        olFeatureLayersGroup.getLayers().insertAt(newIndex, layer);
    }
    function olAddFeature(featureId) {
        var _a;
        var feature = scn.geo.getFeatureById(featureId).feature;
        var olLayer = getOlLayerById(feature._pid);
        if (!olLayer)
            return;
        var olFeature = (0, featureLayerUtils_1.createScenarioLayerFeatures)([feature], "EPSG:3837");
        (_a = olLayer.getSource()) === null || _a === void 0 ? void 0 : _a.addFeatures(olFeature);
    }
    function olDeleteFeature(featureId) {
        var _a;
        var _b = (0, openlayersHelpers_1.getFeatureAndLayerById)(featureId, olFeatureLayersGroup.getLayers()) || {}, olFeature = _b.feature, layer = _b.layer;
        if (!(olFeature && layer))
            return;
        (_a = layer.getSource()) === null || _a === void 0 ? void 0 : _a.removeFeature(olFeature);
    }
    function initializeFeatureLayersFromStore(options) {
        if (options === void 0) { options = {}; }
        var _a = options.doClearCache, doClearCache = _a === void 0 ? true : _a, _b = options.filterVisible, filterVisible = _b === void 0 ? true : _b;
        if (doClearCache) {
            clearCache();
        }
        var olLayers = olFeatureLayersGroup.getLayers();
        olLayers.clear();
        var projection = olMap.getView().getProjection();
        scn.geo.layers.value.forEach(function (layer) {
            if (filterVisible && layer._hidden)
                return;
            var olLayer = olCreateScenarioFeatureLayer(layer, { projection: projection, filterVisible: filterVisible });
            olLayers.push(olLayer);
        });
    }
    function getOlLayerById(layerId) {
        return olFeatureLayersGroup
            .getLayers()
            .getArray()
            .find(function (e) { return e.get("id") === layerId; });
    }
    function olCreateScenarioFeatureLayer(layer, options) {
        if (options === void 0) { options = {}; }
        var _a = options.projection, projection = _a === void 0 ? "EPSG:3837" : _a, _b = options.filterVisible, filterVisible = _b === void 0 ? true : _b;
        var vectorLayer = new Vector_1.default({
            source: new Vector_2.default({
                features: (0, featureLayerUtils_1.createScenarioLayerFeatures)(layer.features.filter(function (f) { return !filterVisible || !f._hidden; }), projection),
            }),
            style: scenarioFeatureStyle,
            properties: {
                id: layer.id,
                title: layer.name,
                layerType: featureLayerUtils_1.LayerTypes.scenarioFeature,
            },
            updateWhileInteracting: true,
            updateWhileAnimating: true,
        });
        if (layer.isHidden)
            vectorLayer.setVisible(false);
        return vectorLayer;
    }
    return {
        initializeFeatureLayersFromStore: initializeFeatureLayersFromStore,
    };
}
// Fixme: Should only return properties needed to represent the geometry
function convertOlFeatureToScenarioFeature(olFeature) {
    if ((0, openlayersHelpers_1.isCircle)(olFeature)) {
        var circle = olFeature.getGeometry();
        var _a = olFeature.getProperties(), geometry = _a.geometry, _b = _a.properties, properties = _b === void 0 ? {} : _b;
        var center = circle.getCenter();
        var r = (0, coordinate_1.add)(__spreadArray([], center, true), [0, circle.getRadius()]);
        var meta = {
            type: "Circle",
            radius: (0, sphere_1.getLength)(new LineString_1.default([center, r])),
        };
        return __assign(__assign({}, (0, helpers_1.point)((0, proj_1.toLonLat)(circle.getCenter()), properties, {
            id: olFeature.getId() || (0, utils_1.nanoid)(),
        })), { meta: meta, style: {} });
    }
    var gj = new format_1.GeoJSON({ featureProjection: "EPSG:3857" }).writeFeatureObject(olFeature);
    return __assign(__assign({}, gj), { style: {}, meta: { type: gj.geometry.type } });
}
