"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDecimalDegrees = formatDecimalDegrees;
exports.formatMGRS = formatMGRS;
exports.getCoordinateFormatFunction = getCoordinateFormatFunction;
exports.fixExtent = fixExtent;
var mgrs_1 = require("mgrs");
var coordinate_1 = require("ol/coordinate");
function formatDecimalDegrees(p, precision) {
    var lon = p[0], lat = p[1];
    return "".concat(Math.abs(lat).toFixed(precision), "\u00B0 ").concat(lat >= 0 ? "N" : "S", " ").concat(Math.abs(lon).toFixed(precision), "\u00B0 ").concat(lon >= 0 ? "E" : "W");
}
function formatMGRS(p, precision) {
    if (precision === void 0) { precision = 5; }
    if (!p)
        return "";
    var mgrs = p && (0, mgrs_1.forward)(p, precision);
    var n = mgrs.length;
    var eastingI = n - precision * 2;
    return "".concat(mgrs.slice(0, eastingI - 2), " ").concat(mgrs.slice(eastingI - 2, eastingI), " ").concat(mgrs.slice(eastingI, n - precision), " ").concat(mgrs.slice(n - precision));
}
function getCoordinateFormatFunction(format) {
    if (format === "DegreeMinuteSeconds" || format === "dms")
        return function (v) { return (0, coordinate_1.toStringHDMS)(v, 0); };
    if (format === "MGRS")
        return function (v) { return formatMGRS(v, 4); };
    return function (v) { return formatDecimalDegrees(v, 3); };
}
function fixExtent(extent) {
    if (extent === void 0) { extent = []; }
    if (!extent || extent.length === 0)
        return;
    var minx = extent[0], miny = extent[1], maxx = extent[2], maxy = extent[3];
    return [
        Math.min(minx, maxx),
        Math.min(miny, maxy),
        Math.max(minx, maxx),
        Math.max(miny, maxy),
    ];
}
