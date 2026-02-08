"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultTransformationOperation = createDefaultTransformationOperation;
exports.isLineString = isLineString;
exports.isPolygon = isPolygon;
exports.doScenarioFeatureTransformation = doScenarioFeatureTransformation;
exports.doUnitTransformations = doUnitTransformations;
var helpers_1 = require("@turf/helpers");
var buffer_1 = require("@turf/buffer");
var bbox_polygon_1 = require("@turf/bbox-polygon");
var bbox_1 = require("@turf/bbox");
var convex_1 = require("@turf/convex");
var simplify_1 = require("@turf/simplify");
var bezier_spline_1 = require("@turf/bezier-spline");
var polygon_smooth_1 = require("@turf/polygon-smooth");
var center_1 = require("@turf/center");
var center_of_mass_1 = require("@turf/center-of-mass");
var centroid_1 = require("@turf/centroid");
var explode_1 = require("@turf/explode");
var union_1 = require("@turf/union");
var utils_1 = require("@/utils");
function createDefaultTransformationOperation() {
    return {
        id: (0, utils_1.nanoid)(),
        transform: "buffer",
        options: {
            radius: 2,
            units: "kilometers",
            steps: 8,
        },
        disabled: false,
        isOpen: true,
    };
}
function isLineString(feature) {
    return feature.type === "Feature" && feature.geometry.type === "LineString";
}
function isPolygon(feature) {
    return feature.type === "Feature" && feature.geometry.type === "Polygon";
}
function doScenarioFeatureTransformation(features, transformations) {
    var _a, _b, _c;
    if (features.length === 0 || !features[0])
        return;
    var geoJSONFeatureOrFeatureCollection = features.length > 1
        ? (0, helpers_1.featureCollection)(features.map(function (f) { var _a, _b; return (0, helpers_1.feature)((_b = (_a = f === null || f === void 0 ? void 0 : f._state) === null || _a === void 0 ? void 0 : _a.geometry) !== null && _b !== void 0 ? _b : f.geometry); }))
        : (0, helpers_1.feature)((_c = (_b = (_a = features[0]) === null || _a === void 0 ? void 0 : _a._state) === null || _b === void 0 ? void 0 : _b.geometry) !== null && _c !== void 0 ? _c : features[0].geometry);
    return doTransformations(geoJSONFeatureOrFeatureCollection, transformations);
}
function unitToFeature(unit) {
    var _a, _b;
    var location = (_b = (_a = unit === null || unit === void 0 ? void 0 : unit._state) === null || _a === void 0 ? void 0 : _a.location) !== null && _b !== void 0 ? _b : unit.location;
    return (0, helpers_1.point)(location);
}
function doUnitTransformations(units, transformations) {
    var filteredUnits = units.filter(function (unit) { var _a, _b; return (_b = (_a = unit === null || unit === void 0 ? void 0 : unit._state) === null || _a === void 0 ? void 0 : _a.location) !== null && _b !== void 0 ? _b : unit.location; });
    if (filteredUnits.length === 0)
        return;
    var geoJSONFeatureOrFeatureCollection = filteredUnits.length > 1
        ? (0, helpers_1.featureCollection)(filteredUnits.map(unitToFeature))
        : unitToFeature(filteredUnits[0]);
    return doTransformations(geoJSONFeatureOrFeatureCollection, transformations);
}
function doTransformations(geoJSONFeatureOrFeatureCollection, transformations) {
    var activeTransformations = transformations.filter(function (t) { return !!t && !t.disabled; });
    return activeTransformations.reduce(function (acc, opt) {
        return doSingleTransformation(acc, opt);
    }, geoJSONFeatureOrFeatureCollection);
}
function doSingleTransformation(geoJSONFeatureOrFeatureCollection, _a) {
    var transform = _a.transform, options = _a.options;
    if (transform === "buffer") {
        var radius = options.radius, _b = options.steps, steps = _b === void 0 ? 8 : _b, _c = options.units, units = _c === void 0 ? "kilometers" : _c;
        return (0, buffer_1.buffer)(geoJSONFeatureOrFeatureCollection, radius, { units: units, steps: steps });
    }
    if (transform === "boundingBox") {
        return (0, bbox_polygon_1.bboxPolygon)((0, bbox_1.bbox)(geoJSONFeatureOrFeatureCollection));
    }
    if (transform === "convexHull") {
        return (0, convex_1.convex)(geoJSONFeatureOrFeatureCollection);
    }
    if (transform === "concaveHull") {
        return (0, convex_1.convex)(geoJSONFeatureOrFeatureCollection, { concavity: 1 });
    }
    if (transform === "simplify") {
        var _d = options.tolerance, tolerance = _d === void 0 ? 0.5 : _d;
        return (0, simplify_1.simplify)(geoJSONFeatureOrFeatureCollection, {
            tolerance: tolerance,
            highQuality: true,
        });
    }
    if (transform === "smooth") {
        if (isLineString(geoJSONFeatureOrFeatureCollection)) {
            return (0, bezier_spline_1.bezierSpline)(geoJSONFeatureOrFeatureCollection, {});
        }
        else if (isPolygon(geoJSONFeatureOrFeatureCollection)) {
            return (0, polygon_smooth_1.polygonSmooth)(geoJSONFeatureOrFeatureCollection, { iterations: 4 });
        }
    }
    if (transform === "center") {
        return (0, center_1.center)(geoJSONFeatureOrFeatureCollection);
    }
    if (transform === "centerOfMass") {
        return (0, center_of_mass_1.centerOfMass)(geoJSONFeatureOrFeatureCollection);
    }
    if (transform === "centroid") {
        return (0, centroid_1.centroid)(geoJSONFeatureOrFeatureCollection);
    }
    if (transform === "explode") {
        return (0, explode_1.explode)(geoJSONFeatureOrFeatureCollection);
    }
    if (transform === "union") {
        var collection = geoJSONFeatureOrFeatureCollection.type === "FeatureCollection"
            ? geoJSONFeatureOrFeatureCollection
            : (0, helpers_1.featureCollection)([geoJSONFeatureOrFeatureCollection]);
        // check if the collection is Polygon or MultiPolygon
        if (collection.features.length > 1 &&
            collection.features.every(function (v) { return v.geometry.type === "Polygon" || v.geometry.type === "MultiPolygon"; })) {
            return (0, union_1.union)(collection);
        }
        else {
            return geoJSONFeatureOrFeatureCollection;
        }
    }
    return null;
}
