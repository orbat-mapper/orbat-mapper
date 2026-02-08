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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMilXLayers = getMilXLayers;
exports.convertMilXLayer = convertMilXLayer;
var domutils_1 = require("@/importexport/milx/domutils");
var convert_symbology_1 = require("@orbat-mapper/convert-symbology");
var utils_1 = require("@/utils");
var milsymbwrapper_1 = require("@/symbology/milsymbwrapper");
var supportedAttributes = ["M", "G", "H"];
function getMilXLayers(node) {
    var layers = (0, domutils_1.getElements)(node, "MilXLayer");
    return layers.map(function (layerElement) { return ({
        name: getLayerName(layerElement),
        coordSystemType: getCoordinateSystem(layerElement) || "WGS84",
        featureCollection: getGraphics(layerElement),
    }); });
}
function convertMilXLayer(layer) {
    var fc = layer.featureCollection;
    var nFeatures = fc.features, rest = __rest(fc, ["features"]);
    var features = nFeatures
        .filter(function (f) { return f.geometry.type === "Point"; })
        .map(function (f) { return (__assign(__assign({}, f), { id: (0, utils_1.nanoid)(), properties: convertProperties(f.properties) })); });
    return __assign(__assign({}, fc), { features: features });
}
function convertProperties(f) {
    var props = {
        sidc: (0, convert_symbology_1.convertLetterSidc2NumberSidc)(f.ID).sidc,
        name: "",
    };
    if (f.T)
        props.name = f.T;
    if (f.M)
        props.higherFormation = f.M;
    if (f.XO)
        props.fillColor = convertColor(f.XO);
    if (f.F) {
        if (f.F === "RD") {
            props.reinforcedStatus = "ReinforcedReduced";
        }
        else if (f.F === "R") {
            props.reinforcedStatus = "Reinforced";
        }
        else if (f.F === "D") {
            props.reinforcedStatus = "Reduced";
        }
    }
    for (var _i = 0, supportedAttributes_1 = supportedAttributes; _i < supportedAttributes_1.length; _i++) {
        var key = supportedAttributes_1[_i];
        if (key in f) {
            //@ts-ignore
            props[milsymbwrapper_1.textAmpMap[key]] = f[key];
        }
    }
    return { convertedProperties: props, originalProperties: f };
}
function convertColor(milxColor) {
    var a = milxColor.substring(1, 3);
    var b = milxColor.substring(3, 5);
    var g = milxColor.substring(5, 7);
    var r = milxColor.substring(7, 9);
    return "#" + r + g + b;
}
function getLayerName(node) {
    var nameNode = (0, domutils_1.getOneElement)(node, "Name");
    return (0, domutils_1.nodeValue)(nameNode);
}
function getCoordinateSystem(node) {
    var nameNode = (0, domutils_1.getOneElement)(node, "CoordSystemType");
    return (0, domutils_1.nodeValue)(nameNode);
}
function getGraphics(node) {
    var features = (0, domutils_1.getElements)(node, "MilXGraphic").map(getGraphic);
    return { type: "FeatureCollection", features: features };
}
function getGraphic(node) {
    var points = (0, domutils_1.getElements)(node, "Point").map(function (p) { return [
        +(0, domutils_1.nodeValue)((0, domutils_1.getOneElement)(p, "X")),
        +(0, domutils_1.nodeValue)((0, domutils_1.getOneElement)(p, "Y")),
    ]; });
    var isPoint = points.length === 1;
    var geometry = isPoint
        ? { type: "Point", coordinates: points[0] }
        : { type: "LineString", coordinates: points };
    return { type: "Feature", geometry: geometry, properties: getSymbol(node) };
}
function getSymbol(node) {
    var n = (0, domutils_1.createFromString)((0, domutils_1.nodeValue)((0, domutils_1.getOneElement)(node, "MssStringXML")));
    var symbElement = (0, domutils_1.getOneElement)(n, "Symbol");
    var ID = (symbElement === null || symbElement === void 0 ? void 0 : symbElement.getAttribute("ID")) || "";
    var attributes = Object.fromEntries((0, domutils_1.getElements)(symbElement, "Attribute").map(function (e) { return [
        e.getAttribute("ID"),
        (0, domutils_1.nodeValue)(e),
    ]; }));
    return __assign({ ID: ID }, attributes);
}
