"use strict";
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
exports.useImageLayerTransformInteraction = useImageLayerTransformInteraction;
var Vector_1 = require("ol/layer/Vector");
var Vector_2 = require("ol/source/Vector");
var style_1 = require("ol/style");
var Transform_1 = require("ol-ext/interaction/Transform");
var vue_1 = require("vue");
var Polygon_1 = require("ol/geom/Polygon");
var Feature_1 = require("ol/Feature");
var extent_1 = require("ol/extent");
var ol_1 = require("ol");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
function useImageLayerTransformInteraction(olMap, options) {
    if (options === void 0) { options = {}; }
    var isActive = (0, vue_1.ref)(false);
    var features = new ol_1.Collection();
    var overlayLayer = createOverlayLayer();
    var interaction = new Transform_1.default({
        translateFeature: false,
        // noFlip: true,
        features: features,
        selection: false,
        keepRectangle: true,
    });
    interaction.setActive(false);
    olMap.addInteraction(interaction);
    olMap.addLayer(overlayLayer);
    (0, vue_1.onUnmounted)(function () {
        olMap.removeInteraction(interaction);
        interaction.setMap(null);
    });
    var rotation = 0;
    var startRotation = 0;
    var center = [0, 0];
    var scale = [1, 1];
    var newScale = [1, 1];
    var currentLayerId = null;
    var currentLayer = null;
    var iWidth = 0;
    var iHeight = 0;
    function initializeTransform(newLayer) {
        startRotation = newLayer.getSource().getRotation();
        center = __spreadArray([], newLayer.getSource().getCenter(), true);
        scale = __spreadArray([], newLayer.getSource().getScale(), true);
        rotation = startRotation;
    }
    (0, openlayersHelpers_1.useOlEvent)(interaction.on(["translatestart", "rotatestart", "scalestart"], function (e) {
        initializeTransform(currentLayer);
        var geom = e.feature.getGeometry().clone();
        geom.rotate(startRotation, (0, extent_1.getCenter)(geom.getExtent()));
        var extent = geom.getExtent();
        iWidth = (0, extent_1.getWidth)(extent);
        iHeight = (0, extent_1.getHeight)(extent);
    }));
    (0, openlayersHelpers_1.useOlEvent)(interaction.on(["translating", "rotating", "scaling"], function (e) {
        var _a;
        var feature = e.feature;
        if (e.type === "rotating") {
            rotation = startRotation - e.angle;
        }
        var geom = feature.getGeometry().clone();
        var c = (0, extent_1.getCenter)(geom.getExtent());
        geom.rotate(rotation, c);
        var extent = geom.getExtent();
        var width = (0, extent_1.getWidth)(extent);
        var height = (0, extent_1.getHeight)(extent);
        if (e.type === "scaling") {
            newScale[0] = (scale[0] * width) / iWidth;
            newScale[1] = (scale[1] * height) / iHeight;
        }
        else {
            newScale = scale;
        }
        center = c;
        currentLayerId &&
            ((_a = options.updateHandler) === null || _a === void 0 ? void 0 : _a.call(options, {
                rotation: rotation,
                center: center,
                scale: newScale,
                active: true,
                id: currentLayerId,
            }));
    }));
    (0, openlayersHelpers_1.useOlEvent)(interaction.on(["rotateend", "translateend", "scaleend"], function (e) {
        var _a;
        currentLayerId &&
            ((_a = options.updateHandler) === null || _a === void 0 ? void 0 : _a.call(options, {
                rotation: rotation,
                center: center,
                scale: newScale,
                active: false,
                id: currentLayerId,
            }));
    }));
    function startTransform(newLayer, layerId) {
        var _a, _b;
        isActive.value = true;
        currentLayerId = layerId;
        currentLayer = newLayer;
        var polygon = (0, Polygon_1.fromExtent)(newLayer.getSource().getExtent());
        polygon.rotate(-newLayer.getSource().getRotation(), newLayer.getSource().getCenter());
        var f = new Feature_1.default(getPolygonfromImage(newLayer));
        (_a = overlayLayer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
        (_b = overlayLayer.getSource()) === null || _b === void 0 ? void 0 : _b.addFeature(f);
        features.clear();
        features.push(f);
        interaction.setActive(true);
        interaction.select(f, true);
    }
    function endTransform() {
        var _a;
        isActive.value = false;
        currentLayerId = null;
        interaction.setActive(false);
        (_a = overlayLayer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
        features.clear();
    }
    return { startTransform: startTransform, endTransform: endTransform, isActive: isActive };
}
function createOverlayLayer() {
    return new Vector_1.default({
        source: new Vector_2.default(),
        style: new style_1.Style({
            fill: new style_1.Fill({ color: "rgba(0, 0, 0, 0)" }),
            stroke: new style_1.Stroke({ color: "rgb(238,3,3)", width: 2 }),
        }),
    });
}
function getPolygonfromImage(layer) {
    var source = layer.getSource();
    var center = source.getCenter();
    var scale = source.getScale();
    var width = source.getGeoImage().width * scale[0];
    var height = source.getGeoImage().height * scale[1];
    var p1 = [center[0] - width / 2, center[1] - height / 2];
    var p2 = [center[0] + width / 2, center[1] + height / 2];
    var extent = (0, extent_1.boundingExtent)([p1, p2]);
    var polygon = (0, Polygon_1.fromExtent)(extent);
    // The resulting polygon
    polygon.rotate(-source.getRotation(), center);
    return polygon;
}
