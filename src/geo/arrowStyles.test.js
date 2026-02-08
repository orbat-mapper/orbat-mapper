"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var arrowStyles_1 = require("./arrowStyles");
var geom_1 = require("ol/geom");
var Style_1 = require("ol/style/Style");
var RegularShape_1 = require("ol/style/RegularShape");
var Circle_1 = require("ol/style/Circle");
var Icon_1 = require("ol/style/Icon");
(0, vitest_1.describe)("getLineAngle", function () {
    (0, vitest_1.it)("returns 0 for a horizontal line pointing right", function () {
        var coords = [
            [0, 0],
            [10, 0],
        ];
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "start")).toBeCloseTo(0);
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "end")).toBeCloseTo(0);
    });
    (0, vitest_1.it)("returns PI/2 for a vertical line pointing up", function () {
        var coords = [
            [0, 0],
            [0, 10],
        ];
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "start")).toBeCloseTo(Math.PI / 2);
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "end")).toBeCloseTo(Math.PI / 2);
    });
    (0, vitest_1.it)("returns -PI/2 for a vertical line pointing down", function () {
        var coords = [
            [0, 0],
            [0, -10],
        ];
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "start")).toBeCloseTo(-Math.PI / 2);
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "end")).toBeCloseTo(-Math.PI / 2);
    });
    (0, vitest_1.it)("returns PI for a horizontal line pointing left", function () {
        var coords = [
            [10, 0],
            [0, 0],
        ];
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "start")).toBeCloseTo(Math.PI);
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "end")).toBeCloseTo(Math.PI);
    });
    (0, vitest_1.it)("handles multi-segment lines correctly", function () {
        // L-shaped line: right then up
        var coords = [
            [0, 0],
            [10, 0],
            [10, 10],
        ];
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "start")).toBeCloseTo(0); // First segment goes right
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)(coords, "end")).toBeCloseTo(Math.PI / 2); // Last segment goes up
    });
    (0, vitest_1.it)("returns 0 for lines with fewer than 2 coordinates", function () {
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)([[0, 0]], "start")).toBe(0);
        (0, vitest_1.expect)((0, arrowStyles_1.getLineAngle)([], "end")).toBe(0);
    });
});
(0, vitest_1.describe)("createArrowMarkerImage", function () {
    (0, vitest_1.it)("returns null for 'none' arrow type", function () {
        (0, vitest_1.expect)((0, arrowStyles_1.createArrowMarkerImage)("none", "#000", 0)).toBeNull();
    });
    (0, vitest_1.it)("creates a RegularShape for 'arrow' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("arrow", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(RegularShape_1.default);
    });
    (0, vitest_1.it)("creates a RegularShape for 'arrow-open' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("arrow-open", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(RegularShape_1.default);
    });
    (0, vitest_1.it)("creates a CircleStyle for 'dot' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("dot", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(Circle_1.default);
    });
    (0, vitest_1.it)("creates a RegularShape for 'square' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("square", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(RegularShape_1.default);
    });
    (0, vitest_1.it)("creates a RegularShape for 'diamond' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("diamond", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(RegularShape_1.default);
    });
    (0, vitest_1.it)("creates a RegularShape for 'bar' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("bar", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(RegularShape_1.default);
    });
    (0, vitest_1.it)("creates an Icon for 'arrow-curved' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("arrow-curved", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(Icon_1.default);
    });
    (0, vitest_1.it)("creates an Icon for 'arrow-stealth' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("arrow-stealth", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(Icon_1.default);
    });
    (0, vitest_1.it)("creates an Icon for 'arrow-double' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("arrow-double", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(Icon_1.default);
    });
    (0, vitest_1.it)("creates an Icon for 'arrow-hand-drawn' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("arrow-hand-drawn", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(Icon_1.default);
    });
    (0, vitest_1.it)("creates an Icon for 'arrow-double-hand-drawn' type", function () {
        var image = (0, arrowStyles_1.createArrowMarkerImage)("arrow-double-hand-drawn", "#ff0000", 0);
        (0, vitest_1.expect)(image).toBeInstanceOf(Icon_1.default);
    });
    (0, vitest_1.it)("respects scale parameter", function () {
        var scale1 = (0, arrowStyles_1.createArrowMarkerImage)("arrow", "#000", 0, 1);
        var scale2 = (0, arrowStyles_1.createArrowMarkerImage)("arrow", "#000", 0, 2);
        (0, vitest_1.expect)(scale2.getRadius()).toBe(scale1.getRadius() * 2);
    });
});
(0, vitest_1.describe)("createArrowStyles", function () {
    (0, vitest_1.it)("returns empty array for non-LineString geometries", function () {
        var point = new geom_1.Point([0, 0]);
        var polygon = new geom_1.Polygon([
            [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 0],
            ],
        ]);
        (0, vitest_1.expect)((0, arrowStyles_1.createArrowStyles)(point, { "arrow-end": "arrow" })).toEqual([]);
        (0, vitest_1.expect)((0, arrowStyles_1.createArrowStyles)(polygon, { "arrow-end": "arrow" })).toEqual([]);
    });
    (0, vitest_1.it)("returns empty array when no arrows are configured", function () {
        var line = new geom_1.LineString([
            [0, 0],
            [10, 10],
        ]);
        (0, vitest_1.expect)((0, arrowStyles_1.createArrowStyles)(line, {})).toEqual([]);
        (0, vitest_1.expect)((0, arrowStyles_1.createArrowStyles)(line, { "arrow-start": "none", "arrow-end": "none" })).toEqual([]);
    });
    (0, vitest_1.it)("creates a single style for end arrow only", function () {
        var line = new geom_1.LineString([
            [0, 0],
            [10, 10],
        ]);
        var styles = (0, arrowStyles_1.createArrowStyles)(line, { "arrow-end": "arrow" });
        (0, vitest_1.expect)(styles).toHaveLength(1);
        (0, vitest_1.expect)(styles[0]).toBeInstanceOf(Style_1.default);
    });
    (0, vitest_1.it)("creates a single style for start arrow only", function () {
        var line = new geom_1.LineString([
            [0, 0],
            [10, 10],
        ]);
        var styles = (0, arrowStyles_1.createArrowStyles)(line, { "arrow-start": "dot" });
        (0, vitest_1.expect)(styles).toHaveLength(1);
        (0, vitest_1.expect)(styles[0]).toBeInstanceOf(Style_1.default);
    });
    (0, vitest_1.it)("creates two styles for both start and end arrows", function () {
        var line = new geom_1.LineString([
            [0, 0],
            [10, 10],
        ]);
        var styles = (0, arrowStyles_1.createArrowStyles)(line, {
            "arrow-start": "dot",
            "arrow-end": "arrow",
        });
        (0, vitest_1.expect)(styles).toHaveLength(2);
    });
    (0, vitest_1.it)("uses strokeColor for arrow markers", function () {
        var line = new geom_1.LineString([
            [0, 0],
            [10, 10],
        ]);
        var strokeColor = "#00ff00";
        var styles = (0, arrowStyles_1.createArrowStyles)(line, { "arrow-end": "arrow", stroke: strokeColor });
        (0, vitest_1.expect)(styles).toHaveLength(1);
    });
    (0, vitest_1.it)("uses strokeOpacity for arrow markers", function () {
        var _a;
        var line = new geom_1.LineString([
            [0, 0],
            [10, 10],
        ]);
        var strokeColor = "#ff0000";
        var strokeOpacity = 0.5;
        var styles = (0, arrowStyles_1.createArrowStyles)(line, {
            "arrow-end": "arrow",
            stroke: strokeColor,
            "stroke-opacity": strokeOpacity,
        });
        (0, vitest_1.expect)(styles).toHaveLength(1);
        var image = styles[0].getImage();
        (0, vitest_1.expect)((_a = image.getFill()) === null || _a === void 0 ? void 0 : _a.getColor()).toBe("rgba(255,0,0,0.5)");
    });
    (0, vitest_1.it)("scales arrow markers with strokeWidth", function () {
        var line = new geom_1.LineString([
            [0, 0],
            [10, 10],
        ]);
        var stylesWidth2 = (0, arrowStyles_1.createArrowStyles)(line, {
            "arrow-end": "arrow",
            stroke: "#000",
            "stroke-width": 2,
        });
        var stylesWidth4 = (0, arrowStyles_1.createArrowStyles)(line, {
            "arrow-end": "arrow",
            stroke: "#000",
            "stroke-width": 4,
        });
        var image2 = stylesWidth2[0].getImage();
        var image4 = stylesWidth4[0].getImage();
        // Radius should be larger for larger strokeWidth
        (0, vitest_1.expect)(image4.getRadius()).toBeGreaterThan(image2.getRadius());
    });
    (0, vitest_1.it)("returns empty for lines with too few coordinates", function () {
        var line = new geom_1.LineString([[0, 0]]);
        var styles = (0, arrowStyles_1.createArrowStyles)(line, { "arrow-end": "arrow" });
        (0, vitest_1.expect)(styles).toEqual([]);
    });
    (0, vitest_1.it)("positions start arrow at first coordinate", function () {
        var line = new geom_1.LineString([
            [5, 5],
            [10, 10],
        ]);
        var styles = (0, arrowStyles_1.createArrowStyles)(line, { "arrow-start": "dot" });
        var geometry = styles[0].getGeometry();
        (0, vitest_1.expect)(geometry.getCoordinates()).toEqual([5, 5]);
    });
    (0, vitest_1.it)("positions end arrow at last coordinate", function () {
        var line = new geom_1.LineString([
            [5, 5],
            [10, 10],
            [15, 20],
        ]);
        var styles = (0, arrowStyles_1.createArrowStyles)(line, { "arrow-end": "dot" });
        var geometry = styles[0].getGeometry();
        (0, vitest_1.expect)(geometry.getCoordinates()).toEqual([15, 20]);
    });
});
