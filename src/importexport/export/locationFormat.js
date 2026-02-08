"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLocation = formatLocation;
var geoConvert_1 = require("@/utils/geoConvert");
var coordinate_1 = require("ol/coordinate");
/**
 * Format a location based on the specified export format.
 */
function formatLocation(location, format) {
    if (format === void 0) { format = "json"; }
    if (!location)
        return "";
    var lon = location[0], lat = location[1];
    switch (format) {
        case "latlon":
            return "".concat(lat, ", ").concat(lon);
        case "lonlat":
            return "".concat(lon, ", ").concat(lat);
        case "mgrs":
            return (0, geoConvert_1.formatMGRS)(location, 5);
        case "dms":
            return (0, coordinate_1.toStringHDMS)([lon, lat], 0);
        case "dd":
            return (0, geoConvert_1.formatDecimalDegrees)(location, 6);
        case "json":
        default:
            return JSON.stringify(location);
    }
}
