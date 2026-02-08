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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseLayerInstances = createBaseLayerInstances;
var Tile_1 = require("ol/layer/Tile");
var OSM_1 = require("ol/source/OSM");
var XYZ_1 = require("ol/source/XYZ");
var proj_1 = require("ol/proj");
var klona_1 = require("klona");
function createBaseLayerInstances(layers, view) {
    return layers.map(function (layerConfig) {
        var _a = (0, klona_1.klona)(layerConfig), layerSourceType = _a.layerSourceType, _b = _a.layerType, layerType = _b === void 0 ? "baselayer" : _b, title = _a.title, name = _a.name, tileLayerOptions = _a.tileLayerOptions;
        if (tileLayerOptions === null || tileLayerOptions === void 0 ? void 0 : tileLayerOptions.extent) {
            tileLayerOptions.extent = (0, proj_1.transformExtent)(tileLayerOptions.extent, "EPSG:4326", view.getProjection());
        }
        var properties = { title: title, name: name, layerType: layerType };
        var source;
        if (layerSourceType === "osm") {
            source = new OSM_1.default(layerConfig.sourceOptions);
        }
        else if (layerSourceType === "xyz") {
            source = new XYZ_1.default(layerConfig.sourceOptions);
        }
        var layer = new Tile_1.default(__assign({ source: source, properties: properties, visible: false, preload: Infinity }, tileLayerOptions));
        layer.set("name", name);
        layer.set("title", title);
        return layer;
    });
}
