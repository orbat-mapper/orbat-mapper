"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var helpers_1 = require("@/symbology/helpers");
(0, vitest_1.describe)("getNextEchelonBelow", function () {
    (0, vitest_1.it)("skips regiment", function () {
        (0, vitest_1.expect)((0, helpers_1.getNextEchelonBelow)("18")).toBe("16");
    });
    (0, vitest_1.it)("does not go below zero", function () {
        (0, vitest_1.expect)((0, helpers_1.getNextEchelonBelow)("00")).toBe("00");
    });
    (0, vitest_1.it)("returns input value if not found", function () {
        (0, vitest_1.expect)((0, helpers_1.getNextEchelonBelow)("40")).toBe("40");
    });
    (0, vitest_1.it)("return lower echelon", function () {
        (0, vitest_1.expect)((0, helpers_1.getNextEchelonBelow)("16")).toBe("15");
        (0, vitest_1.expect)((0, helpers_1.getNextEchelonBelow)("15")).toBe("14");
        (0, vitest_1.expect)((0, helpers_1.getNextEchelonBelow)("11")).toBe("00");
    });
});
