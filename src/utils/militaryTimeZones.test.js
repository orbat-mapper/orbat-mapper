"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var militaryTimeZones_1 = require("./militaryTimeZones");
(0, vitest_1.describe)("militaryTimeZones", function () {
    (0, vitest_1.it)("resolves military time zones to IANA names", function () {
        (0, vitest_1.expect)((0, militaryTimeZones_1.resolveTimeZone)("Alpha")).toBe("Etc/GMT-1");
        (0, vitest_1.expect)((0, militaryTimeZones_1.resolveTimeZone)("Zulu")).toBe("UTC");
        (0, vitest_1.expect)((0, militaryTimeZones_1.resolveTimeZone)("November")).toBe("Etc/GMT+1");
        (0, vitest_1.expect)((0, militaryTimeZones_1.resolveTimeZone)("X-ray")).toBe("Etc/GMT+11");
    });
    (0, vitest_1.it)("returns the input if it is not a military time zone", function () {
        (0, vitest_1.expect)((0, militaryTimeZones_1.resolveTimeZone)("UTC")).toBe("UTC");
        (0, vitest_1.expect)((0, militaryTimeZones_1.resolveTimeZone)("Europe/Oslo")).toBe("Europe/Oslo");
        (0, vitest_1.expect)((0, militaryTimeZones_1.resolveTimeZone)("America/New_York")).toBe("America/New_York");
    });
});
