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
exports.convertGeojsonLayer = convertGeojsonLayer;
var utils_1 = require("@/utils");
var convert_symbology_1 = require("@orbat-mapper/convert-symbology");
var isNumeric = /^\d+$/;
function convertGeojsonLayer(layer) {
    var fc = layer;
    var nFeatures = fc.features, rest = __rest(fc, ["features"]);
    var features = nFeatures
        .filter(function (f) { return f.geometry.type === "Point"; })
        .map(function (f) { return (__assign(__assign({}, f), { id: (0, utils_1.nanoid)(), properties: convertGeojsonProperties(f.properties || {}) })); });
    return __assign(__assign({}, fc), { features: features });
}
function convertGeojsonProperties(f) {
    var sidc = f.sidc || "10031000000000000000";
    var props = {
        sidc: isNumeric.test(sidc) ? sidc : (0, convert_symbology_1.convertLetterSidc2NumberSidc)(sidc).sidc,
    };
    if (f.m)
        props.higherFormation = f.m;
    props.name = f.name || f.uniqueDesignation || f.t || "";
    return props;
}
