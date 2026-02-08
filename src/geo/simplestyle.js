"use strict";
/**
 * Basic implementation of simplestyle-spec
 *
 * https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
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
exports.defaultSimpleStyleText = exports.defaultSimplestyleFill = exports.defaultFillOpacity = exports.defaultFillColor = exports.defaultSimplestyleStroke = exports.strokeStyleDotted = exports.strokeStyleDashed = exports.defaultStrokeWidth = exports.defaultStrokeOpacity = exports.defaultStrokeColor = void 0;
exports.createMarkerSymbol = createMarkerSymbol;
exports.createSimpleStyle = createSimpleStyle;
var Stroke_1 = require("ol/style/Stroke");
var Fill_1 = require("ol/style/Fill");
var olColor = require("ol/color");
var Circle_1 = require("ol/style/Circle");
var Style_1 = require("ol/style/Style");
var RegularShape_1 = require("ol/style/RegularShape");
var Text_1 = require("ol/style/Text");
var scaleMap = { medium: 1, large: 1.5, small: 0.75 };
// based on https://openlayers.org/en/latest/examples/regularshape.html
function createMarkerSymbol(markerSymbol, size, markerColor) {
    if (markerColor === void 0) { markerColor = "#7e7e7e"; }
    var sizeScale = scaleMap[size] || 1;
    var fill = new Fill_1.default({ color: markerColor });
    var stroke = new Stroke_1.default({
        color: ["cross", "x"].includes(markerSymbol) ? markerColor : "#fafafa",
        width: 2,
    });
    switch (markerSymbol) {
        case "square":
            return new RegularShape_1.default({
                fill: fill,
                stroke: stroke,
                points: 4,
                radius: 10 * sizeScale,
                angle: Math.PI / 4,
            });
        case "pentagon":
            return new RegularShape_1.default({
                fill: fill,
                stroke: stroke,
                points: 5,
                radius: 10 * sizeScale,
                angle: 0,
            });
        case "hexagon":
            return new RegularShape_1.default({
                fill: fill,
                stroke: stroke,
                points: 6,
                radius: 10 * sizeScale,
                angle: Math.PI / 2,
            });
        case "triangle":
            return new RegularShape_1.default({
                fill: fill,
                stroke: stroke,
                points: 3,
                radius: 10 * sizeScale,
                angle: 0,
            });
        case "star":
            return new RegularShape_1.default({
                fill: fill,
                stroke: stroke,
                points: 5,
                radius: 10 * sizeScale,
                radius2: 4 * sizeScale,
                angle: 0,
            });
        case "cross":
            return new RegularShape_1.default({
                fill: fill,
                stroke: stroke,
                points: 4,
                radius: 10 * sizeScale,
                radius2: 0,
                angle: 0,
            });
        case "x":
            return new RegularShape_1.default({
                fill: fill,
                stroke: stroke,
                points: 4,
                radius: 10 * sizeScale,
                radius2: 0,
                angle: Math.PI / 4,
            });
    }
    return new Circle_1.default({
        fill: fill,
        stroke: stroke,
        radius: 5 * sizeScale,
    });
}
exports.defaultStrokeColor = "#555555";
exports.defaultStrokeOpacity = 1;
exports.defaultStrokeWidth = 2;
exports.strokeStyleDashed = [10, 10];
exports.strokeStyleDotted = [5, 10];
exports.defaultSimplestyleStroke = new Stroke_1.default({
    color: exports.defaultStrokeColor,
    width: exports.defaultStrokeWidth,
});
exports.defaultFillColor = "#555555";
exports.defaultFillOpacity = 0.25;
exports.defaultSimplestyleFill = new Fill_1.default({
    color: [0x55, 0x55, 0x55, exports.defaultFillOpacity],
});
exports.defaultSimpleStyleText = new Text_1.default({
    font: 'bold 13px "Inter Variable"',
    textAlign: "left",
    textBaseline: "middle",
    fill: new Fill_1.default({
        color: "#333333",
    }),
    stroke: new Stroke_1.default({
        color: "#FBFCFB",
        width: 4,
    }),
    // padding: [3, 3, 3, 3],
    offsetX: 15,
    // offsetY: -15,
});
function createSimpleStyle(opts) {
    var _a, _b, _c, _d;
    var stroke = exports.defaultSimplestyleStroke;
    var fill = exports.defaultSimplestyleFill;
    var text = exports.defaultSimpleStyleText;
    var markerSize = opts["marker-size"] || "medium";
    if (opts.stroke ||
        opts["stroke-width"] ||
        opts["stroke-opacity"] ||
        opts["stroke-style"]) {
        var strokeColor = __spreadArray([], olColor.fromString(opts.stroke || "#555555"), true);
        if (opts["stroke-opacity"])
            strokeColor[3] = opts["stroke-opacity"];
        stroke = new Stroke_1.default({
            color: strokeColor,
            width: opts["stroke-width"] || 2,
        });
        if (opts["stroke-style"] === "dashed") {
            stroke.setLineDash(exports.strokeStyleDashed);
        }
        else if (opts["stroke-style"] === "dotted") {
            stroke.setLineDash(exports.strokeStyleDotted);
        }
        else {
        }
    }
    else if (opts.stroke === null) {
        stroke = undefined;
    }
    if (opts["stroke-opacity"] === 0)
        stroke = undefined;
    if (opts.fill || opts["fill-opacity"] !== undefined) {
        var fillColor = __spreadArray([], olColor.fromString(opts.fill || exports.defaultFillColor), true);
        fillColor[3] = (_a = opts["fill-opacity"]) !== null && _a !== void 0 ? _a : 0.5;
        fill = new Fill_1.default({ color: fillColor });
    }
    else if (opts.fill === null) {
        fill = undefined;
    }
    if (opts["fill-opacity"] === 0)
        fill = undefined;
    if (opts["text-placement"] ||
        opts["text-align"] ||
        opts["text-offset-x"] !== undefined ||
        opts["text-offset-y"] !== undefined) {
        text = new Text_1.default({
            font: 'bold 13px "Inter Variable"',
            placement: opts["text-placement"],
            textAlign: (_b = opts["text-align"]) !== null && _b !== void 0 ? _b : "left",
            textBaseline: "middle",
            fill: new Fill_1.default({
                color: "#333333",
            }),
            stroke: new Stroke_1.default({
                color: "#FBFCFB",
                width: 4,
            }),
            // padding: [3, 3, 3, 3],
            offsetX: (_c = opts["text-offset-x"]) !== null && _c !== void 0 ? _c : 15,
            offsetY: (_d = opts["text-offset-y"]) !== null && _d !== void 0 ? _d : 0,
            // offsetY: -15,
        });
    }
    return new Style_1.default({
        stroke: stroke,
        fill: fill,
        text: text,
        image: createMarkerSymbol(opts["marker-symbol"] || "circle", markerSize, opts["marker-color"] || "#7e7e7e"),
    });
}
