"use strict";
/**
 * Arrow marker styles for LineString features
 *
 * This module provides functions to create arrow markers at the start and end
 * of line features, with configurable arrow types and colors.
 */
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
exports.getLineAngle = getLineAngle;
exports.getArrowSvgDataUri = getArrowSvgDataUri;
exports.createArrowMarkerImage = createArrowMarkerImage;
exports.createArrowStyles = createArrowStyles;
var geom_1 = require("ol/geom");
var Style_1 = require("ol/style/Style");
var RegularShape_1 = require("ol/style/RegularShape");
var Fill_1 = require("ol/style/Fill");
var Stroke_1 = require("ol/style/Stroke");
var Circle_1 = require("ol/style/Circle");
var Icon_1 = require("ol/style/Icon");
var olColor = require("ol/color");
var simplestyle_1 = require("./simplestyle");
/**
 * Calculate the angle of a line segment at the start or end of a line.
 *
 * @param coordinates - Array of coordinate pairs [[x, y], ...]
 * @param position - Whether to calculate angle at "start" or "end"
 * @returns Angle in radians
 */
function getLineAngle(coordinates, position) {
    if (coordinates.length < 2)
        return 0;
    var dx, dy;
    if (position === "start") {
        dx = coordinates[1][0] - coordinates[0][0];
        dy = coordinates[1][1] - coordinates[0][1];
    }
    else {
        var len = coordinates.length;
        dx = coordinates[len - 1][0] - coordinates[len - 2][0];
        dy = coordinates[len - 1][1] - coordinates[len - 2][1];
    }
    return Math.atan2(dy, dx);
}
/**
 * Get the SVG data URI for an arrow type, for use in direct canvas rendering.
 * Returns null for shape-based arrow types (which use RegularShape/CircleStyle).
 *
 * @param arrowType - The type of arrow marker
 * @param color - Fill/stroke color for the marker
 * @returns Base64-encoded SVG data URI, or null for non-SVG types
 */
function getArrowSvgDataUri(arrowType, color) {
    switch (arrowType) {
        case "arrow-curved": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"".concat(color, "\" d=\"M2,12 Q6,12 10,4 L22,12 L10,20 Q6,12 2,12 Z\" /></svg>");
            return "data:image/svg+xml;base64," + btoa(svg);
        }
        case "arrow-stealth": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"".concat(color, "\" d=\"M2,2 L22,12 L2,22 L6,12 Z\" /></svg>");
            return "data:image/svg+xml;base64," + btoa(svg);
        }
        case "arrow-double": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"".concat(color, "\" d=\"M2,2 L12,12 L2,22 Z M10,2 L20,12 L10,22 Z\" /></svg>");
            return "data:image/svg+xml;base64," + btoa(svg);
        }
        case "arrow-hand-drawn": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" viewBox=\"0 0 48 48\">\n        <path stroke=\"".concat(color, "\" fill=\"none\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 12 10 C 18 16 34 22 44 24 C 34 26 18 32 12 38\" />\n        <path stroke=\"").concat(color, "\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 14 14 C 20 18 30 22 40 24 C 30 26 20 30 14 34\" />\n      </svg>");
            return "data:image/svg+xml;base64," + btoa(svg);
        }
        case "arrow-double-hand-drawn": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" viewBox=\"0 0 48 48\">\n        <!-- First arrow -->\n        <path stroke=\"".concat(color, "\" fill=\"none\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 4 10 C 10 16 26 22 36 24 C 26 26 10 32 4 38\" />\n        <path stroke=\"").concat(color, "\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 6 14 C 12 18 22 22 32 24 C 22 26 12 30 6 34\" />\n        <!-- Second arrow -->\n        <path stroke=\"").concat(color, "\" fill=\"none\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 12 10 C 18 16 34 22 44 24 C 34 26 18 32 12 38\" />\n        <path stroke=\"").concat(color, "\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 14 14 C 20 18 30 22 40 24 C 30 26 20 30 14 34\" />\n      </svg>");
            return "data:image/svg+xml;base64," + btoa(svg);
        }
        default:
            return null;
    }
}
/**
 * Create an arrow marker image (RegularShape or CircleStyle) for a specific arrow type.
 *
 * @param arrowType - The type of arrow marker to create
 * @param color - Fill/stroke color for the marker
 * @param rotation - Rotation angle in radians (for directional markers)
 * @param scale - Scale factor for marker size (default 1)
 * @returns The marker image style, or null if arrowType is "none"
 */
function createArrowMarkerImage(arrowType, color, rotation, scale) {
    if (scale === void 0) { scale = 1; }
    if (arrowType === "none")
        return null;
    var size = 10 * scale;
    // Helper functions to create fill/stroke on demand
    var createFill = function () { return new Fill_1.default({ color: color }); };
    var createStroke = function () { return new Stroke_1.default({ color: color, width: 2 }); };
    switch (arrowType) {
        case "arrow":
            return new RegularShape_1.default({
                fill: createFill(),
                stroke: createStroke(),
                points: 3,
                radius: size,
                rotation: -rotation + Math.PI / 2,
                angle: 0,
            });
        case "arrow-open":
            return new RegularShape_1.default({
                stroke: createStroke(),
                points: 3,
                radius: size,
                rotation: -rotation + Math.PI / 2,
                angle: 0,
            });
        case "arrow-curved": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"".concat(color, "\" d=\"M2,12 Q6,12 10,4 L22,12 L10,20 Q6,12 2,12 Z\" /></svg>");
            return new Icon_1.default({
                src: "data:image/svg+xml;base64," + btoa(svg),
                rotation: -rotation,
                scale: scale * 0.8,
                anchor: [0.5, 0.5],
            });
        }
        case "arrow-stealth": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"".concat(color, "\" d=\"M2,2 L22,12 L2,22 L6,12 Z\" /></svg>");
            return new Icon_1.default({
                src: "data:image/svg+xml;base64," + btoa(svg),
                rotation: -rotation,
                scale: scale * 0.8,
                anchor: [0.5, 0.5],
            });
        }
        case "arrow-double": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"".concat(color, "\" d=\"M2,2 L12,12 L2,22 Z M10,2 L20,12 L10,22 Z\" /></svg>");
            return new Icon_1.default({
                src: "data:image/svg+xml;base64," + btoa(svg),
                rotation: -rotation,
                scale: scale * 0.8,
                anchor: [0.5, 0.5],
            });
        }
        case "arrow-hand-drawn": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" viewBox=\"0 0 48 48\">\n        <path stroke=\"".concat(color, "\" fill=\"none\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 12 10 C 18 16 34 22 44 24 C 34 26 18 32 12 38\" />\n        <path stroke=\"").concat(color, "\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 14 14 C 20 18 30 22 40 24 C 30 26 20 30 14 34\" />\n      </svg>");
            return new Icon_1.default({
                src: "data:image/svg+xml;base64," + btoa(svg),
                rotation: -rotation,
                scale: scale * 0.4,
                anchor: [0.5, 0.5],
            });
        }
        case "arrow-double-hand-drawn": {
            var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" viewBox=\"0 0 48 48\">\n        <!-- First arrow -->\n        <path stroke=\"".concat(color, "\" fill=\"none\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 4 10 C 10 16 26 22 36 24 C 26 26 10 32 4 38\" />\n        <path stroke=\"").concat(color, "\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 6 14 C 12 18 22 22 32 24 C 22 26 12 30 6 34\" />\n        <!-- Second arrow -->\n        <path stroke=\"").concat(color, "\" fill=\"none\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 12 10 C 18 16 34 22 44 24 C 34 26 18 32 12 38\" />\n        <path stroke=\"").concat(color, "\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\n          d=\"M 14 14 C 20 18 30 22 40 24 C 30 26 20 30 14 34\" />\n      </svg>");
            return new Icon_1.default({
                src: "data:image/svg+xml;base64," + btoa(svg),
                rotation: -rotation,
                scale: scale * 0.4,
                anchor: [0.5, 0.5],
            });
        }
        case "dot":
            return new Circle_1.default({
                fill: createFill(),
                radius: size / 2,
            });
        case "square":
            return new RegularShape_1.default({
                fill: createFill(),
                points: 4,
                radius: size * 0.7,
                rotation: -rotation + Math.PI / 4,
                angle: 0,
            });
        case "diamond":
            return new RegularShape_1.default({
                fill: createFill(),
                points: 4,
                radius: size * 0.7,
                rotation: -rotation,
                angle: 0,
            });
        case "bar":
            return new RegularShape_1.default({
                stroke: new Stroke_1.default({ color: color, width: 2 + 4 * scale }),
                points: 2,
                radius: size,
                rotation: -rotation,
                angle: 0,
            });
        default:
            return null;
    }
}
/**
 * Create arrow styles for a LineString geometry.
 *
 * Returns an array of Style objects to be appended to the main feature style.
 * Each style renders an arrow marker at the appropriate position with correct rotation.
 *
 * @param geometry - The feature geometry (only LineString is supported)
 * @param opts - Style options (including arrows, stroke, etc.)
 * @returns Array of Style objects for the arrow markers
 */
function createArrowStyles(geometry, opts) {
    var _a;
    if (!(geometry instanceof geom_1.LineString))
        return [];
    var styles = [];
    var coords = geometry.getCoordinates();
    if (coords.length < 2)
        return [];
    var strokeColor = opts.stroke || simplestyle_1.defaultStrokeColor;
    var strokeWidth = opts["stroke-width"] || simplestyle_1.defaultStrokeWidth;
    var strokeOpacity = (_a = opts["stroke-opacity"]) !== null && _a !== void 0 ? _a : simplestyle_1.defaultStrokeOpacity;
    var color = __spreadArray([], olColor.fromString(strokeColor), true);
    color[3] = strokeOpacity;
    var rgbaColor = olColor.asString(color);
    var scale = Math.max(0.4, strokeWidth / 2.5);
    // Start arrow
    if (opts["arrow-start"] && opts["arrow-start"] !== "none") {
        var angle = getLineAngle(coords, "start");
        var image = createArrowMarkerImage(opts["arrow-start"], rgbaColor, angle + Math.PI, // Point backward from start
        scale);
        if (image) {
            styles.push(new Style_1.default({
                geometry: new geom_1.Point(coords[0]),
                image: image,
            }));
        }
    }
    // End arrow
    if (opts["arrow-end"] && opts["arrow-end"] !== "none") {
        var angle = getLineAngle(coords, "end");
        var image = createArrowMarkerImage(opts["arrow-end"], rgbaColor, angle, scale);
        if (image) {
            styles.push(new Style_1.default({
                geometry: new geom_1.Point(coords[coords.length - 1]),
                image: image,
            }));
        }
    }
    return styles;
}
