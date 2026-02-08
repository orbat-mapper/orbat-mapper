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
exports.toMilx = toMilx;
var xast_util_to_xml_1 = require("xast-util-to-xml");
var unist_builder_1 = require("unist-builder");
var xastscript_1 = require("xastscript");
var convert_symbology_1 = require("@orbat-mapper/convert-symbology");
var domutils_1 = require("@/importexport/milx/domutils");
var milsymbwrapper_1 = require("@/symbology/milsymbwrapper");
var supportedAttributes = [
    "higherFormation",
    "staffComments",
    "additionalInformation",
    "uniqueDesignation",
];
function toMilx(layers) {
    return (0, xast_util_to_xml_1.toXml)((0, unist_builder_1.u)("root", [
        (0, unist_builder_1.u)("instruction", { name: "xml" }, 'version="1.0" encoding="UTF-8" standalone="no"'),
        domutils_1.BR,
        xastscript_1.x.apply(void 0, __spreadArray(__spreadArray(["MilXDocument_Layer",
            {
                xmlns: "http://gs-soft.com/MilX/V3.1",
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            },
            domutils_1.BRTAB,
            (0, domutils_1.tagValue)("MssLibraryVersionTag", "2022.04.12"),
            domutils_1.BRTAB,
            domutils_1.BRTAB], layers.map(function (l) { return convertLayer(l.featureCollection, l.name); }), false), [domutils_1.BR], false)),
    ]));
}
function convertLayer(featureCollection, layerName) {
    if (layerName === void 0) { layerName = "Layer"; }
    return (0, xastscript_1.x)("MilXLayer", [
        domutils_1.BRTAB,
        (0, domutils_1.tagValue)("Name", layerName),
        domutils_1.BRTAB,
        (0, domutils_1.tagValue)("LayerType", "Normal"),
        domutils_1.BR,
        (0, xastscript_1.x)("GraphicList", __spreadArray([], featureCollection.features.map(function (feature) { return convertFeature(feature); }), true)),
        domutils_1.BR,
        (0, domutils_1.tagValue)("CoordSystemType", "WGS84"),
        domutils_1.BR,
    ]);
}
function convertFeature(feature) {
    return (0, xastscript_1.x)("MilXGraphic", [domutils_1.BR, convertSymbol(feature.properties), domutils_1.BR, convertGeometry(feature.geometry)], domutils_1.BR);
}
function convertColor(color) {
    var r = color.slice(1, 3);
    var g = color.slice(3, 5);
    var b = color.slice(5, 7);
    return "$" + "00" + b + g + r;
}
function convertSymbol(properties) {
    var numberSidc = properties.sidc, name = properties.name, shortName = properties.shortName, fillColor = properties.fillColor;
    var _a = (0, convert_symbology_1.convertNumberSidc2LetterSidc)(numberSidc), sidc = _a.sidc, match = _a.match;
    if (match === "partial" || match === "failed") {
        console.warn("Failed to convert", properties, match, sidc);
    }
    var attributes = {};
    if (fillColor) {
        attributes["XO"] = convertColor(fillColor);
    }
    if (shortName || name) {
        attributes["T"] = (shortName || name);
    }
    for (var _i = 0, supportedAttributes_1 = supportedAttributes; _i < supportedAttributes_1.length; _i++) {
        var key = supportedAttributes_1[_i];
        if (key in properties) {
            var value = properties[key];
            var mappedKey = milsymbwrapper_1.textAmpMapInv[key];
            if (!mappedKey || !value) {
                continue;
            }
            attributes[mappedKey] = value;
        }
    }
    return (0, domutils_1.tagValue)("MssStringXML", (0, xast_util_to_xml_1.toXml)((0, unist_builder_1.u)("root", [
        xastscript_1.x.apply(void 0, __spreadArray(["Symbol",
            { ID: sidc }], Object.entries(attributes).map(function (_a) {
            var k = _a[0], v = _a[1];
            return (0, domutils_1.tagIdValue)("Attribute", k, v);
        }), false)),
    ])));
}
function convertGeometry(geometry) {
    if (geometry.type === "Point") {
        return convertPoint(geometry);
    }
}
function convertPoint(point) {
    return (0, xastscript_1.x)("PointList", [
        domutils_1.BR,
        (0, xastscript_1.x)("Point", [
            domutils_1.BR,
            (0, domutils_1.tagValue)("X", "".concat(point.coordinates[0])),
            domutils_1.BR,
            (0, domutils_1.tagValue)("Y", "".concat(point.coordinates[1])),
            domutils_1.BR,
        ]),
        domutils_1.BR,
    ]);
}
