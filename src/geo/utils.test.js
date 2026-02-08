"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var utils_1 = require("./utils");
(0, vitest_1.describe)("detectCoordinateFormat", function () {
    (0, vitest_1.it)("should detect MGRS format", function () {
        var samples = ["18SUJ234567890", "18S UJ 230 670", "32U PU 1234 5678"];
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(samples)).toBe("MGRS");
    });
    (0, vitest_1.it)("should detect DMS format", function () {
        var samples = [
            "40\u00B026'46\"N 79\u00B058'56\"W",
            "41\u00B026'46\"N 80\u00B058'56\"W",
            "N40\u00B026'46\" W79\u00B058'56\"",
        ];
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(samples)).toBe("DMS");
    });
    (0, vitest_1.it)("should detect LatLon format", function () {
        var samples = ["40.446, -79.982", "34.05, -118.25", "51.507, -0.1278"];
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(samples)).toBe("LatLon");
    });
    (0, vitest_1.it)("should detect LonLat format when longitude is > 90", function () {
        var samples = ["-118.25, 34.05", "-97.74, 30.27", "151.2, -33.86"];
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(samples)).toBe("LonLat");
    });
    (0, vitest_1.it)("should detect LonLat format when simple lat check fails", function () {
        // Both values in range (-90, 90) but first is lon, second is lat
        // This is hard to distinguish without >90 check or context.
        // Our current simple heuristics favor LagLon unless specific evidence for LonLat
        // If we have samples with big numbers, it works.
        var samples = [
            "-122.4194, 37.7749", // San Francisco - Longitude > 90
            "-122.0, 37.0",
        ];
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(samples)).toBe("LonLat");
    });
    (0, vitest_1.it)("should return LatLon by default if ambiguous", function () {
        // 10, 10 could be either
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(["10, 10", "20, 20"])).toBe("LatLon");
    });
    (0, vitest_1.it)("should return null for empty samples", function () {
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)([])).toBeNull();
    });
    (0, vitest_1.it)("should return null for invalid data", function () {
        var samples = ["invalid", "not a coordinate", ""];
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(samples)).toBeNull();
    });
    (0, vitest_1.it)("should be robust to mixed valid/invalid data", function () {
        // 2 valid, 1 invalid -> >50% valid -> MGRS
        // 18SUJ2345667890 (valid 10 digit)
        // 18SUJ230670 (valid 6 digit)
        var samples = ["18SUJ2345667890", "invalid", "18SUJ230670"];
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(samples)).toBe("MGRS");
    });
    (0, vitest_1.it)("should detect JSON format", function () {
        var samples = ["[10.2, 59.4]", "[-118.25, 34.05]", "[0, 0]"];
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(samples)).toBe("JSON");
    });
    (0, vitest_1.it)("should be robust to mixed valid/invalid JSON data", function () {
        var samples = ["[10.2, 59.4]", "invalid", "[-118.25, 34.05]"];
        (0, vitest_1.expect)((0, utils_1.detectCoordinateFormat)(samples)).toBe("JSON");
    });
});
(0, vitest_1.describe)("parseJSON", function () {
    (0, vitest_1.it)("should parse valid JSON coordinates", function () {
        (0, vitest_1.expect)((0, utils_1.parseJSON)("[10.2, 59.4]")).toEqual([10.2, 59.4]);
        (0, vitest_1.expect)((0, utils_1.parseJSON)("[-118.25, 34.05]")).toEqual([-118.25, 34.05]);
    });
    (0, vitest_1.it)("should parse valid JSON coordinates with whitespace", function () {
        (0, vitest_1.expect)((0, utils_1.parseJSON)(" [ 10.2 , 59.4 ] ")).toEqual([10.2, 59.4]);
    });
    (0, vitest_1.it)("should return null for invalid JSON", function () {
        (0, vitest_1.expect)((0, utils_1.parseJSON)("invalid")).toBeNull();
        (0, vitest_1.expect)((0, utils_1.parseJSON)("[10.2, 59.4")).toBeNull(); // Missing bracket
        (0, vitest_1.expect)((0, utils_1.parseJSON)("10.2, 59.4]")).toBeNull(); // Missing bracket
        (0, vitest_1.expect)((0, utils_1.parseJSON)("not json")).toBeNull();
    });
    (0, vitest_1.it)("should return null for valid JSON that is not a coordinate pair", function () {
        (0, vitest_1.expect)((0, utils_1.parseJSON)("{}")).toBeNull();
        (0, vitest_1.expect)((0, utils_1.parseJSON)("[]")).toBeNull();
        (0, vitest_1.expect)((0, utils_1.parseJSON)("[10.2]")).toBeNull(); // Too few elements
        (0, vitest_1.expect)((0, utils_1.parseJSON)('["10.2", "59.4"]')).toBeNull(); // Strings instead of numbers
    });
});
(0, vitest_1.describe)("parseCoordinateString", function () {
    (0, vitest_1.it)("should parse JSON format", function () {
        (0, vitest_1.expect)((0, utils_1.parseCoordinateString)("[10.2, 59.4]", "JSON")).toEqual([10.2, 59.4]);
    });
    (0, vitest_1.it)("should parse MGRS format", function () {
        // Basic check using mock-like expectation since we trust mgrs library
        // 33UUU8308007274 is approx 48.81669, 14.50004
        var result = (0, utils_1.parseCoordinateString)("33UUU8308007274", "MGRS");
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.length).toBe(2);
    });
    (0, vitest_1.it)("should parse DMS format", function () {
        var result = (0, utils_1.parseCoordinateString)("40\u00B026'46\"N 79\u00B058'56\"W", "DMS");
        (0, vitest_1.expect)(result).toEqual([-79.982222, 40.446111]);
    });
    (0, vitest_1.it)("should parse LatLon format", function () {
        (0, vitest_1.expect)((0, utils_1.parseCoordinateString)("40.446, -79.982", "LatLon")).toEqual([-79.982, 40.446]);
    });
    (0, vitest_1.it)("should parse LonLat format", function () {
        (0, vitest_1.expect)((0, utils_1.parseCoordinateString)("-79.982, 40.446", "LonLat")).toEqual([-79.982, 40.446]);
    });
});
