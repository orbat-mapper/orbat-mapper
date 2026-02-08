"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOlEvent = useOlEvent;
exports.isCircle = isCircle;
exports.getFeatureAndLayerById = getFeatureAndLayerById;
exports.getFeatureIndex = getFeatureIndex;
exports.getSnappableFeatures = getSnappableFeatures;
exports.saveMapAsPng = saveMapAsPng;
exports.drawGeoJsonLayer = drawGeoJsonLayer;
var Observable_1 = require("ol/Observable");
var core_1 = require("@vueuse/core");
var source_1 = require("ol/source");
var format_1 = require("ol/format");
var files_1 = require("@/utils/files");
/**
 * Unregister open layers event automatically on unmount
 * @param eventKey
 */
function useOlEvent(eventKey) {
    var eKey = eventKey;
    (0, core_1.tryOnBeforeUnmount)(function () {
        if (Array.isArray(eKey)) {
            eKey.forEach(function (key) { return (0, Observable_1.unByKey)(key); });
        }
        else
            (0, Observable_1.unByKey)(eKey);
    });
    return eventKey;
}
function isCircle(feature) {
    var _a;
    return ((_a = feature.getGeometry()) === null || _a === void 0 ? void 0 : _a.getType()) === "Circle";
}
function getFeatureAndLayerById(featureId, layerCollection) {
    var _a;
    for (var index = 0, ii = layerCollection.getLength(); index < ii; ++index) {
        var layer = layerCollection.item(index);
        var feature = (_a = layer.getSource()) === null || _a === void 0 ? void 0 : _a.getFeatureById(featureId);
        if (feature) {
            return { feature: feature, layer: layer, layerIndex: index };
        }
    }
    return null;
}
function getFeatureIndex(feature, layer) {
    var _a;
    var features = (_a = layer.getSource()) === null || _a === void 0 ? void 0 : _a.getFeaturesCollection();
    if (!features)
        return;
    for (var index = 0, ii = features.getLength(); index < ii; ++index) {
        var currentFeature = features.item(index);
        if (feature === currentFeature) {
            return index;
        }
    }
    return -1;
}
function getSnappableFeatures(olMap, options) {
    if (options === void 0) { options = {}; }
    return olMap
        .getAllLayers()
        .filter(function (l) { return l.getVisible() && l.getSource() instanceof source_1.Vector; })
        .map(function (l) { var _a; return (_a = l.getSource()) === null || _a === void 0 ? void 0 : _a.getFeatures(); })
        .flat();
}
// Copied from https://openlayers.org/en/latest/examples/export-map.html
function saveMapAsPng(map_1) {
    return __awaiter(this, arguments, void 0, function (map, options) {
        var fileName;
        var _a;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_b) {
            fileName = (_a = options.fileName) !== null && _a !== void 0 ? _a : "image.png";
            map.once("rendercomplete", function () {
                return __awaiter(this, void 0, void 0, function () {
                    var mapCanvas, size, mapContext, blob, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                mapCanvas = document.createElement("canvas");
                                size = map.getSize();
                                if (!size)
                                    return [2 /*return*/];
                                mapCanvas.width = size[0];
                                mapCanvas.height = size[1];
                                mapContext = mapCanvas.getContext("2d");
                                if (!mapContext)
                                    return [2 /*return*/];
                                Array.prototype.forEach.call(map.getViewport().querySelectorAll(".ol-layer canvas, canvas.ol-layer"), function (canvas) {
                                    if (canvas.width > 0) {
                                        var opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
                                        mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
                                        var matrix = void 0;
                                        var transform = canvas.style.transform;
                                        if (transform) {
                                            // Get the transform parameters from the style's transform matrix
                                            matrix = transform
                                                .match(/^matrix\(([^\(]*)\)$/)[1]
                                                .split(",")
                                                .map(Number);
                                        }
                                        else {
                                            matrix = [
                                                parseFloat(canvas.style.width) / canvas.width,
                                                0,
                                                0,
                                                parseFloat(canvas.style.height) / canvas.height,
                                                0,
                                                0,
                                            ];
                                        }
                                        // Apply the transform to the export map context
                                        CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
                                        var backgroundColor = canvas.parentNode.style.backgroundColor;
                                        if (backgroundColor) {
                                            mapContext.fillStyle = backgroundColor;
                                            mapContext.fillRect(0, 0, canvas.width, canvas.height);
                                        }
                                        mapContext.drawImage(canvas, 0, 0);
                                    }
                                });
                                mapContext.globalAlpha = 1;
                                mapContext.setTransform(1, 0, 0, 1, 0, 0);
                                return [4 /*yield*/, new Promise(function (resolve) { return mapCanvas.toBlob(resolve); })];
                            case 1:
                                blob = _b.sent();
                                _a = blob;
                                if (!_a) return [3 /*break*/, 3];
                                return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(blob, fileName)];
                            case 2:
                                _a = (_b.sent());
                                _b.label = 3;
                            case 3:
                                _a;
                                return [2 /*return*/];
                        }
                    });
                });
            });
            map.renderSync();
            return [2 /*return*/];
        });
    });
}
var gjs = new format_1.GeoJSON({
    featureProjection: "EPSG:3857",
    dataProjection: "EPSG:4326",
});
function drawGeoJsonLayer(layer, geoJson) {
    var _a, _b;
    (_a = layer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
    geoJson && ((_b = layer.getSource()) === null || _b === void 0 ? void 0 : _b.addFeatures(gjs.readFeatures(geoJson)));
}
