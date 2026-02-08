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
exports.UTC2MILITARY = void 0;
exports.formatDateString = formatDateString;
exports.formatDTG = formatDTG;
exports.formatPosition = formatPosition;
exports.formatLength = formatLength;
exports.formatArea = formatArea;
exports.parseCoordinates = parseCoordinates;
exports.truncatePosition = truncatePosition;
exports.parseMGRS = parseMGRS;
exports.parseDMS = parseDMS;
exports.parseLatLonPair = parseLatLonPair;
exports.parseJSON = parseJSON;
exports.parseCoordinateString = parseCoordinateString;
exports.detectCoordinateFormat = detectCoordinateFormat;
var dayjs_1 = require("dayjs");
var militaryTimeZones_1 = require("@/utils/militaryTimeZones");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var coordinate_1 = require("ol/coordinate");
var geoConvert_1 = require("@/utils/geoConvert");
var truncate_1 = require("@turf/truncate");
var helpers_1 = require("@turf/helpers");
var mgrsLib = require("mgrs");
// const s = useMapSettingsStore();
exports.UTC2MILITARY = {
    "-12": "Y",
    "-11": "X",
    "-10": "W",
    "-9": "V",
    "-8": "U",
    "-7": "T",
    "-6": "S",
    "-5": "R",
    "-4": "Q",
    "-3": "P",
    "-2": "O",
    "-1": "N",
    "0": "Z",
    "1": "A",
    "2": "B",
    "3": "C",
    "4": "D",
    "5": "E",
    "6": "F",
    "7": "G",
    "8": "H",
    "9": "I",
    "10": "K",
    "11": "L",
    "12": "M",
};
function formatDateString(value, timeZone, template) {
    if (value === undefined || value === null)
        return "";
    if (timeZone)
        return (0, dayjs_1.default)(value).tz((0, militaryTimeZones_1.resolveTimeZone)(timeZone)).format(template);
    return dayjs_1.default.utc(value).format(template);
}
function formatDTG(value, timeZone) {
    var _a;
    if (value === undefined || value === null)
        return "";
    var date = (0, dayjs_1.default)(value).tz((0, militaryTimeZones_1.resolveTimeZone)(timeZone));
    var offset = Math.round(date.utcOffset() / 60).toString();
    var letter = (_a = exports.UTC2MILITARY[offset]) !== null && _a !== void 0 ? _a : "Z";
    return date.format("DDHHmm[".concat(letter, "]MMMYY")).toUpperCase();
}
function formatPosition(value, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    if (value) {
        var s = (0, mapSettingsStore_1.useMapSettingsStore)();
        var format = (_a = options.format) !== null && _a !== void 0 ? _a : s.coordinateFormat;
        var mgrsPrecision = (_b = options.mgrsPrecision) !== null && _b !== void 0 ? _b : 4;
        if (format === "DegreeMinuteSeconds")
            return (0, coordinate_1.toStringHDMS)(value, 0);
        if (format === "MGRS")
            return (0, geoConvert_1.formatMGRS)(value, mgrsPrecision);
        return (0, geoConvert_1.formatDecimalDegrees)(value, 3);
    }
    return "";
}
function formatLength(length, unit) {
    if (unit === void 0) { unit = "metric"; }
    var output = "";
    if (unit === "metric") {
        if (length > 100) {
            output = Math.round((length / 1000) * 100) / 100 + " km";
        }
        else {
            output = Math.round(length * 100) / 100 + " m";
        }
    }
    else if (unit === "imperial") {
        var miles = length * 0.000621371192;
        if (miles > 0.1) {
            output = miles.toFixed(2) + " mi";
        }
        else {
            output = (miles * 5280).toFixed(2) + " ft";
        }
    }
    else if (unit === "nautical") {
        var nm = length * 0.000539956803;
        if (nm > 0.1) {
            output = nm.toFixed(2) + " nm";
        }
        else {
            output = nm.toFixed(3) + " nm";
        }
    }
    return output;
}
function formatArea(area, unit) {
    if (unit === void 0) { unit = "metric"; }
    var output = "";
    if (unit === "metric") {
        if (area > 10000) {
            output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
        }
        else {
            output = Math.round(area * 100) / 100 + " m\xB2";
        }
    }
    else if (unit === "imperial") {
        var squareMiles = area * 0.0000003861021585424458;
        if (squareMiles > 0.1) {
            output = squareMiles.toFixed(2) + " mi\xB2";
        }
        else {
            output = (area * 10.7639104167097).toFixed(2) + " ft\xB2";
        }
    }
    else if (unit === "nautical") {
        var squareNM = area * 0.0000003599999999999999;
        if (squareNM > 0.1) {
            output = squareNM.toFixed(2) + " nm\xB2";
        }
        else {
            output = (area * 10.7639104167097).toFixed(2) + " ft\xB2";
        }
    }
    return output;
}
function parseCoordinates(coordinateString) {
    var parts = coordinateString.split(",").map(function (s) { return s.trim(); });
    if (parts.length !== 2) {
        throw new Error("Invalid coordinate format. Expected format: 'latitude,longitude'");
    }
    var latStr = parts[0], lonStr = parts[1];
    var latitude = parseFloat(latStr);
    var longitude = parseFloat(lonStr);
    if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid coordinate values. Coordinates must be numbers.");
    }
    return [latitude, longitude];
}
function truncatePosition(p, options) {
    return (0, truncate_1.truncate)((0, helpers_1.point)(p), options).geometry.coordinates;
}
/**
 * Parse MGRS string to [lon, lat] position.
 * Uses the mgrs library for conversion.
 */
function parseMGRS(value) {
    if (!value || typeof value !== "string")
        return null;
    var trimmed = value.trim().toUpperCase().replace(/\s+/g, "");
    if (!trimmed)
        return null;
    try {
        var result = mgrsLib.toPoint(trimmed);
        if (result && result.length >= 2) {
            return truncatePosition(result);
        }
        return null;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Parse Degree-Minute-Seconds format to [lon, lat] position.
 * Supports formats like:
 * - 40°26'46"N 79°58'56"W
 * - 40°26'46.123"N, 79°58'56.456"W
 * - N40°26'46" W79°58'56"
 */
function parseDMS(value) {
    var _a, _b, _c, _d;
    if (!value || typeof value !== "string")
        return null;
    var trimmed = value.trim();
    if (!trimmed)
        return null;
    // Pattern to match DMS components
    // Supports various quote styles: ' " ′ ″ ʹ ʺ and Unicode degree symbol
    var dmsPattern = /([NSEW])?\s*(\d+)[°\s]+(\d+)[′'ʹ\s]+(\d+(?:\.\d+)?)[″"ʺ\s]*([NSEW])?/gi;
    var matches = __spreadArray([], trimmed.matchAll(dmsPattern), true);
    if (matches.length < 2)
        return null;
    var results = [];
    for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var match = matches_1[_i];
        var prefix = (_a = match[1]) === null || _a === void 0 ? void 0 : _a.toUpperCase();
        var suffix = (_b = match[5]) === null || _b === void 0 ? void 0 : _b.toUpperCase();
        var direction = prefix || suffix;
        var degrees = parseFloat(match[2]);
        var minutes = parseFloat(match[3]);
        var seconds = parseFloat(match[4]);
        if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds))
            continue;
        var decimal = degrees + minutes / 60 + seconds / 3600;
        var isNegative = direction === "S" || direction === "W";
        if (isNegative)
            decimal = -decimal;
        var isLat = direction === "N" || direction === "S";
        results.push({ value: decimal, isLat: isLat });
    }
    if (results.length < 2)
        return null;
    var lat = (_c = results.find(function (r) { return r.isLat; })) === null || _c === void 0 ? void 0 : _c.value;
    var lon = (_d = results.find(function (r) { return !r.isLat; })) === null || _d === void 0 ? void 0 : _d.value;
    if (lat === undefined || lon === undefined)
        return null;
    // Validate ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180)
        return null;
    return truncatePosition([lon, lat]);
}
/**
 * Parse separate latitude and longitude values to [lon, lat] position.
 * Handles string or numeric inputs.
 */
function parseLatLonPair(lat, lon) {
    var latNum = typeof lat === "number" ? lat : parseFloat(String(lat));
    var lonNum = typeof lon === "number" ? lon : parseFloat(String(lon));
    if (isNaN(latNum) || isNaN(lonNum))
        return null;
    // Validate ranges
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180)
        return null;
    return truncatePosition([lonNum, latNum]);
}
/**
 * Parse JSON array string [lon, lat] to position.
 */
function parseJSON(value) {
    if (!value || typeof value !== "string")
        return null;
    var trimmed = value.trim();
    if (!trimmed.startsWith("[") || !trimmed.endsWith("]"))
        return null;
    try {
        var parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length >= 2) {
            var lon = parsed[0], lat = parsed[1];
            if (typeof lon === "number" && typeof lat === "number") {
                return truncatePosition([lon, lat]);
            }
        }
    }
    catch (_a) {
        // ignore
    }
    return null;
}
/**
 * Parse a combined coordinate string in various formats.
 * Supports: MGRS, decimal degrees (lat,lon or lon,lat), DMS, JSON array.
 */
function parseCoordinateString(value, format) {
    if (!value || typeof value !== "string")
        return null;
    var trimmed = value.trim();
    if (!trimmed)
        return null;
    if (format === "MGRS") {
        return parseMGRS(trimmed);
    }
    if (format === "DMS") {
        return parseDMS(trimmed);
    }
    if (format === "JSON") {
        return parseJSON(trimmed);
    }
    // Decimal degrees - split on comma, semicolon, or whitespace
    var parts = trimmed.split(/[,;\s]+/).filter(function (p) { return p.length > 0; });
    if (parts.length < 2)
        return null;
    var first = parseFloat(parts[0]);
    var second = parseFloat(parts[1]);
    if (isNaN(first) || isNaN(second))
        return null;
    if (format === "LatLon") {
        return parseLatLonPair(first, second);
    }
    else {
        // LonLat
        return parseLatLonPair(second, first);
    }
}
function detectCoordinateFormat(samples) {
    if (samples.length === 0)
        return null;
    var mgrsCount = 0;
    var dmsCount = 0;
    var latLonCount = 0;
    var lonLatCount = 0;
    var jsonCount = 0;
    for (var _i = 0, samples_1 = samples; _i < samples_1.length; _i++) {
        var sample = samples_1[_i];
        if (!sample || typeof sample !== "string" || sample.trim().length === 0)
            continue;
        // Check JSON
        if (parseJSON(sample))
            jsonCount++;
        // Check MGRS
        if (parseMGRS(sample))
            mgrsCount++;
        // Check DMS
        if (parseDMS(sample))
            dmsCount++;
        // Check LatLon / LonLat
        // We parse manually to check values
        var parts = sample.split(/[,;\s]+/).filter(function (p) { return p.length > 0; });
        if (parts.length >= 2) {
            var a = parseFloat(parts[0]);
            var b = parseFloat(parts[1]);
            if (!isNaN(a) && !isNaN(b)) {
                // Basic range check
                var aIsLat = Math.abs(a) <= 90;
                var aIsLon = Math.abs(a) <= 180;
                var bIsLat = Math.abs(b) <= 90;
                var bIsLon = Math.abs(b) <= 180;
                if (aIsLat && bIsLon)
                    latLonCount++;
                if (aIsLon && bIsLat) {
                    // If a > 90, it MUST be lon
                    // Strong signal if first value is > 90 (can't be lat)
                    if (Math.abs(a) > 90)
                        lonLatCount += 2;
                    else
                        lonLatCount++;
                }
            }
        }
    }
    // Decision logic
    if (jsonCount > samples.length / 2)
        return "JSON";
    if (mgrsCount > samples.length / 2)
        return "MGRS";
    if (dmsCount > samples.length / 2)
        return "DMS";
    if (lonLatCount > latLonCount)
        return "LonLat";
    if (latLonCount > 0)
        return "LatLon";
    return null;
}
