"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnitLayer = createUnitLayer;
exports.createUnitFeatureAt = createUnitFeatureAt;
exports.flyTo = flyTo;
var Vector_1 = require("ol/layer/Vector");
var Vector_2 = require("ol/source/Vector");
var Feature_1 = require("ol/Feature");
var Point_1 = require("ol/geom/Point");
var proj_1 = require("ol/proj");
var utils_1 = require("@/utils");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
function createUnitLayer() {
    return new Vector_1.default({
        source: new Vector_2.default(),
        updateWhileInteracting: true,
        updateWhileAnimating: true,
        properties: {
            id: (0, utils_1.nanoid)(),
            title: "Unit layer",
            layerType: featureLayerUtils_1.LayerTypes.units,
        },
    });
}
function createUnitFeatureAt(position, unit) {
    var geometry = new Point_1.default((0, proj_1.fromLonLat)(position));
    var feature = new Feature_1.default({
        geometry: geometry,
    });
    feature.setId(unit.id);
    return feature;
}
// Based on https://openlayers.org/en/latest/examples/animation.html
function flyTo(view, _a) {
    var location = _a.location, zoom = _a.zoom, _b = _a.duration, duration = _b === void 0 ? 2000 : _b;
    var zoom_ = zoom || view.getZoom();
    var parts = 2;
    var called = false;
    return new Promise(function (resolve) {
        function callback(complete) {
            --parts;
            if (called) {
                return;
            }
            if (parts === 0 || !complete) {
                called = true;
                resolve(complete);
            }
        }
        view.animate({
            center: location,
            duration: duration,
        }, callback);
        if (zoom_)
            view.animate({
                zoom: zoom_ - 1,
                duration: duration / 2,
            }, {
                zoom: zoom_,
                duration: duration / 2,
            }, callback);
    });
}
