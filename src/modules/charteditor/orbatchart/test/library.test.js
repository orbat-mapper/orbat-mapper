"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var index_1 = require("../index");
var testorbats_1 = require("./testorbats");
var milsymbol_1 = require("milsymbol");
// @ts-ignore
SVGElement.prototype.getBBox = function () {
    return { x: 0, y: 0, width: 20, height: 10 };
};
(0, vitest_1.describe)("OrbatChart class", function () {
    (0, vitest_1.it)("is defined", function () {
        (0, vitest_1.expect)(index_1.OrbatChart).toBeDefined();
    });
    (0, vitest_1.it)("renders", function () {
        var o = new index_1.OrbatChart(testorbats_1.ORBAT1);
        var svg = o.toSVG(document.body);
        (0, vitest_1.expect)(svg.getAttribute("width")).toBe("100%");
    });
});
(0, vitest_1.describe)("OrbatChart SVG rendering", function () {
    (0, vitest_1.it)("renders", function () {
        var o = new index_1.OrbatChart(testorbats_1.ORBAT1);
        var svg = o.toSVG(document.body);
        (0, vitest_1.expect)(svg.getAttribute("width")).toBe("100%");
    });
    (0, vitest_1.it)("has empty ID by default", function () {
        var o = new index_1.OrbatChart(testorbats_1.ORBAT1);
        var svg = o.toSVG(document.body);
        (0, vitest_1.expect)(svg.id).toBe("");
    });
    (0, vitest_1.it)("allows a custom ID", function () {
        var o = new index_1.OrbatChart(testorbats_1.ORBAT1);
        var svg = o.toSVG(document.body, { elementId: "CustomID" });
        (0, vitest_1.expect)(svg.id).toBe("CustomID");
    });
});
var DUMMY_UNIT = {
    name: "Unit A",
    shortName: "A Bde",
    id: "1",
    sidc: "10031000151211000000",
    subUnits: [],
};
(0, vitest_1.describe)("OrbatChart options", function () {
    (0, vitest_1.it)("has default values", function () {
        var ob = new index_1.OrbatChart(DUMMY_UNIT);
        (0, vitest_1.expect)(ob.options).toBeDefined();
        (0, vitest_1.expect)(ob.options.symbolSize).toBe(index_1.DEFAULT_OPTIONS.symbolSize);
        (0, vitest_1.expect)(ob.options.connectorOffset).toBe(index_1.DEFAULT_OPTIONS.connectorOffset);
        (0, vitest_1.expect)(ob.options.maxLevels).toBe(index_1.DEFAULT_OPTIONS.maxLevels);
        (0, vitest_1.expect)(ob.options.onClick).toBeUndefined();
        (0, vitest_1.expect)(ob.options.symbolGenerator).toBeUndefined();
    });
    (0, vitest_1.it)("overrides default values", function () {
        var ob = new index_1.OrbatChart(DUMMY_UNIT, { symbolSize: 13, maxLevels: 4 });
        (0, vitest_1.expect)(ob.options.symbolSize).toBe(13);
        (0, vitest_1.expect)(ob.options.connectorOffset).toBe(index_1.DEFAULT_OPTIONS.connectorOffset);
        (0, vitest_1.expect)(ob.options.maxLevels).toBe(4);
    });
});
(0, vitest_1.describe)("Symbol generator", function () {
    (0, vitest_1.it)("is undefined by default", function () {
        var ob = new index_1.OrbatChart(DUMMY_UNIT);
        (0, vitest_1.expect)(ob.options.symbolGenerator).toBeUndefined();
    });
    (0, vitest_1.it)("can be set", function () {
        var customGenerator = function (sidc, options) {
            return new milsymbol_1.default.Symbol(sidc, options);
        };
        var ob = new index_1.OrbatChart(DUMMY_UNIT, { symbolGenerator: customGenerator });
        (0, vitest_1.expect)(ob.options.symbolGenerator).toBe(customGenerator);
    });
});
(0, vitest_1.describe)("OrbatChart orientation", function () {
    (0, vitest_1.it)("has default value 'TOP'", function () {
        var ob = new index_1.OrbatChart(DUMMY_UNIT);
        (0, vitest_1.expect)(ob.options.orientation).toBe(index_1.ChartOrientations.Top);
    });
    (0, vitest_1.it)("can be changed", function () {
        var ob = new index_1.OrbatChart(DUMMY_UNIT, {
            orientation: index_1.ChartOrientations.Bottom,
        });
        (0, vitest_1.expect)(ob.options.orientation).toBe(index_1.ChartOrientations.Bottom);
    });
});
function createChartSvgString(options) {
    var o = new index_1.OrbatChart(DUMMY_UNIT, options);
    var svg = o.toSVG(document.body);
    return svg.innerHTML;
}
(0, vitest_1.describe)("OrbatChart unit labels", function () {
    (0, vitest_1.it)("uses name by default", function () {
        var svgString = createChartSvgString();
        (0, vitest_1.expect)(svgString).toContain(DUMMY_UNIT.name);
    });
    (0, vitest_1.it)("uses short name if useShortName is true", function () {
        var svgString = createChartSvgString({ useShortName: true });
        (0, vitest_1.expect)(svgString).toContain(DUMMY_UNIT.shortName);
    });
    (0, vitest_1.it)("has configurable labelOffset", function () {
        var svgString = createChartSvgString({ labelOffset: 1337 });
        (0, vitest_1.expect)(svgString).toContain("1337");
        (0, vitest_1.expect)(svgString).toContain(DUMMY_UNIT.name);
    });
    (0, vitest_1.it)("can be disable with hideLabel setting", function () {
        var svgString = createChartSvgString({ labelOffset: 1337, hideLabel: true });
        (0, vitest_1.expect)(svgString).not.toContain(DUMMY_UNIT.name);
        (0, vitest_1.expect)(svgString).not.toContain("1337");
    });
    (0, vitest_1.it)("can change color", function () {
        var svgString = createChartSvgString({ fontColor: "testvalue" });
        (0, vitest_1.expect)(svgString).toContain('fill="testvalue"');
    });
});
