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
exports.labelStyle = exports.selectedWaypointStyle = exports.waypointStyle = exports.VIA_TIME = void 0;
exports.createUnitHistoryLayers = createUnitHistoryLayers;
exports.createUnitPathFeatures = createUnitPathFeatures;
var Feature_1 = require("ol/Feature");
var LineString_1 = require("ol/geom/LineString");
var MultiPoint_1 = require("ol/geom/MultiPoint");
var Point_1 = require("ol/geom/Point");
var great_circle_1 = require("@turf/great-circle");
var sphere_1 = require("ol/sphere");
var Fill_1 = require("ol/style/Fill");
var Stroke_1 = require("ol/style/Stroke");
var Style_1 = require("ol/style/Style");
var Text_1 = require("ol/style/Text");
var Circle_1 = require("ol/style/Circle");
var Vector_1 = require("ol/layer/Vector");
var Vector_2 = require("ol/source/Vector");
var Group_1 = require("ol/layer/Group");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
exports.VIA_TIME = -1337;
var viaStyle = new Style_1.default({
    image: new Circle_1.default({
        radius: 4,
        fill: new Fill_1.default({
            color: "rgba(101,213,57,0.73)",
        }),
        stroke: new Stroke_1.default({
            color: "green",
            width: 1,
        }),
    }),
    stroke: new Stroke_1.default({
        color: "rgba(255,0,0,0.65)",
        width: 3,
    }),
    geometry: function (feature) {
        var _a;
        // @ts-ignore
        var coordinates = (_a = feature === null || feature === void 0 ? void 0 : feature.getGeometry()) === null || _a === void 0 ? void 0 : _a.getCoordinates();
        return new MultiPoint_1.default(coordinates);
    },
});
var legStyle = new Style_1.default({
    stroke: new Stroke_1.default({
        color: "rgba(255,0,0,0.65)",
        width: 2,
    }),
});
exports.waypointStyle = new Style_1.default({
    image: new Circle_1.default({
        radius: 5,
        fill: new Fill_1.default({
            color: "orange",
        }),
        stroke: new Stroke_1.default({
            color: "green",
            width: 3,
        }),
    }),
});
exports.selectedWaypointStyle = new Style_1.default({
    image: new Circle_1.default({
        radius: 5,
        fill: new Fill_1.default({
            color: "red",
        }),
        stroke: new Stroke_1.default({
            color: "yellow",
            width: 3,
        }),
    }),
});
exports.labelStyle = new Style_1.default({
    text: new Text_1.default({
        text: "HH",
        textAlign: "left",
        offsetY: -15,
        offsetX: 15,
        fill: new Fill_1.default({ color: "#aa3300" }),
        stroke: new Stroke_1.default({ color: "white", width: 4 }),
    }),
});
function createUnitHistoryLayers() {
    var legLayer = new Vector_1.default({
        source: new Vector_2.default({}),
        style: legStyle,
        properties: {
            layerType: "leg",
        },
    });
    var waypointLayer = new Vector_1.default({
        source: new Vector_2.default(),
        style: exports.waypointStyle,
        properties: {
            layerType: "waypoint",
        },
    });
    var arcLayer = new Vector_1.default({
        source: new Vector_2.default(),
        style: legStyle,
    });
    var viaLayer = new Vector_1.default({
        source: legLayer.getSource(),
        style: viaStyle,
        properties: {
            layerType: "via",
        },
    });
    var labelsLayer = new Vector_1.default({
        declutter: true,
        source: waypointLayer.getSource(),
        style: function (feature) {
            exports.labelStyle.getText().setText(feature.get("label") || "");
            return exports.labelStyle;
        },
    });
    return {
        historyLayer: new Group_1.default({
            layers: [arcLayer, legLayer, viaLayer, waypointLayer, labelsLayer],
        }),
        legLayer: legLayer,
        waypointLayer: waypointLayer,
        viaLayer: viaLayer,
        arcLayer: arcLayer,
        labelsLayer: labelsLayer,
    };
}
function unwindCoordinates(coordinates) {
    var result = [coordinates[0]]; // Start with the first coordinate
    for (var i = 1; i < coordinates.length; i++) {
        var currentCoordinate = __spreadArray([], coordinates[i], true);
        var prevLongitude = result[i - 1][0];
        var longitude = coordinates[i][0];
        var latitude = coordinates[i][1];
        while (longitude - prevLongitude > 180) {
            longitude -= 360;
        }
        while (prevLongitude - longitude > 180) {
            longitude += 360;
        }
        currentCoordinate[0] = longitude;
        currentCoordinate[1] = latitude;
        result.push(currentCoordinate);
    }
    return result;
}
function createUnitPathFeatures(unit, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var isEditMode = (_a = options.isEditMode) !== null && _a !== void 0 ? _a : false;
    var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
    // extract the location states from the unit, and add the initial location
    // we then remove any states that don't have a location
    var state = __spreadArray([
        { location: unit.location, t: Number.MIN_SAFE_INTEGER }
    ], (unit.state || []), true).filter(function (s) { return s.location !== undefined; });
    // split state entries into groups in case the path is split
    var parts = splitLocationStateIntoParts(state);
    var waypointFeatures = parts
        .flat()
        .map(function (part, index) { return createWaypointFeature(part, index + 1); });
    var legFeatures = [];
    var arcFeatures = [];
    parts.forEach(function (part) {
        if (part.length < 2) {
            if (isEditMode) {
                legFeatures.push(createSegmentFeature([__spreadArray(__spreadArray([], part[0].location, true), [part[0].t], false)]));
            }
            // arcFeatures.push(createSegmentFeature[[...part[0].location, part[0].t]]);return;
            return;
        }
        var segment = [];
        for (var i = 0; i < part.length - 1; i++) {
            var from = part[i];
            var to = part[i + 1];
            if (i === 0)
                segment.push(__spreadArray(__spreadArray([], from.location, true), [from.t], false));
            if (to.via) {
                to.via.forEach(function (v) {
                    segment.push(__spreadArray(__spreadArray([], v, true), [exports.VIA_TIME], false));
                });
            }
            segment.push(__spreadArray(__spreadArray([], to.location, true), [to.t], false));
        }
        if (isEditMode) {
            legFeatures.push(createSegmentFeature(segment));
        }
        arcFeatures.push(createSegmentFeature(createGreatCircleArcFeature(segment), "XY"));
    });
    function createSegmentFeature(segment, geometryLayout) {
        if (geometryLayout === void 0) { geometryLayout = "XYM"; }
        var geometry = segment.length > 1
            ? new LineString_1.default(unwindCoordinates(segment), geometryLayout)
            : new Point_1.default(segment[0], geometryLayout);
        geometry.transform("EPSG:4326", "EPSG:3857");
        return new Feature_1.default({
            geometry: geometry,
            unitId: unit.id,
        });
    }
    function createWaypointFeature(state, index) {
        var geometry = new Point_1.default(state.location);
        geometry.transform("EPSG:4326", "EPSG:3857");
        var f = new Feature_1.default({
            geometry: geometry,
            id: state.id,
            unitId: unit.id,
            label: state.t > Number.MIN_SAFE_INTEGER
                ? "#".concat(index, " ").concat(fmt.trackFormatter.format(state.t))
                : "#".concat(index),
        });
        f.setId(state.id);
        return f;
    }
    return { legFeatures: legFeatures, waypointFeatures: waypointFeatures, viaPointFeatures: [], arcFeatures: arcFeatures };
}
function createGreatCircleArcFeature(leg) {
    var coords = [];
    for (var i = 0; i < leg.length - 1; i++) {
        var from = leg[i];
        var to = leg[i + 1];
        var distance = (0, sphere_1.getDistance)(from, to);
        if (distance > 100000) {
            var arcLine = (0, great_circle_1.greatCircle)(from, to, {
                offset: -100000,
                npoints: Math.min(Math.ceil(distance / 200000), 50),
            });
            // @ts-ignore
            coords.push.apply(coords, arcLine.geometry.coordinates);
        }
        else {
            coords.push.apply(coords, [from, to]);
        }
    }
    return coords;
}
function splitLocationStateIntoParts(state) {
    var parts = [];
    var currentPart = [];
    state.forEach(function (s) {
        if (s.location === null || s.interpolate === false) {
            if (currentPart.length)
                parts.push(currentPart);
            currentPart = [];
        }
        else {
            currentPart.push(s);
        }
    });
    if (currentPart.length)
        parts.push(currentPart);
    return parts;
}
