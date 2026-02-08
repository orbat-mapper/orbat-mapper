"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var useUpdateMatching_1 = require("./useUpdateMatching");
var vue_1 = require("vue");
(0, vitest_1.describe)("useUpdateMatching", function () {
    (0, vitest_1.it)("preserves existing echelon when new SIDC has unspecified echelon", function () {
        // 1. Setup Data
        var row = { id: "1", name: "Unit A", icon: "123456" };
        var data = (0, vue_1.ref)([row]);
        // New SIDC with echelon '00' (indices 8,9) AND different entity/icon (last digit 1)
        // 10031000001211000001 -> 8,9 are '00'
        var newSidc = "10031000001211000001";
        var mappedData = (0, vue_1.ref)([
            {
                id: "1",
                name: "Unit A",
                sidc: newSidc,
            },
        ]);
        // Existing Unit with echelon '16' (indices 8,9)
        // 10031000161211000000
        var existingSidc = "10031000161211000000";
        var existingUnit = {
            id: "1",
            name: "Unit A",
            sidc: existingSidc,
            subUnits: [],
        };
        var units = (0, vue_1.computed)(function () { return [existingUnit]; });
        var unitMap = { "1": existingUnit };
        // 2. Options
        var matchMode = (0, vue_1.ref)("id");
        var matchField = (0, vue_1.ref)("id");
        var updateFields = (0, vue_1.ref)(["sidc"]);
        // 3. Execute
        var matchedResults = (0, useUpdateMatching_1.useUpdateMatching)({
            data: data,
            mappedData: mappedData,
            matchMode: matchMode,
            matchField: matchField,
            updateFields: updateFields,
            units: units,
            unitMap: unitMap,
        }).matchedResults;
        // 4. Verify
        var result = matchedResults.value[0];
        (0, vitest_1.expect)(result).toBeDefined();
        (0, vitest_1.expect)(result.changes.sidc).toBeDefined();
        // The new SIDC should have the echelon preserved from the existing one
        // New: 1003100000...01 -> Preserved: 1003100016...01
        var expectedSidc = "10031000161211000001";
        (0, vitest_1.expect)(result.changes.sidc.new).toBe(expectedSidc);
    });
    (0, vitest_1.it)("does not overwrite if new SIDC has specified echelon", function () {
        // 1. Setup Data
        var row = { id: "1", name: "Unit A", icon: "123456" };
        var data = (0, vue_1.ref)([row]);
        // New SIDC with specific echelon '22'
        var newSidc = "10031000221211000000";
        var mappedData = (0, vue_1.ref)([
            {
                id: "1",
                name: "Unit A",
                sidc: newSidc,
            },
        ]);
        // Existing Unit with echelon '16'
        var existingSidc = "10031000161211000000";
        var existingUnit = {
            id: "1",
            name: "Unit A",
            sidc: existingSidc,
            subUnits: [],
        };
        var units = (0, vue_1.computed)(function () { return [existingUnit]; });
        var unitMap = { "1": existingUnit };
        // 2. Options
        var matchMode = (0, vue_1.ref)("id");
        var matchField = (0, vue_1.ref)("id");
        var updateFields = (0, vue_1.ref)(["sidc"]);
        // 3. Execute
        var matchedResults = (0, useUpdateMatching_1.useUpdateMatching)({
            data: data,
            mappedData: mappedData,
            matchMode: matchMode,
            matchField: matchField,
            updateFields: updateFields,
            units: units,
            unitMap: unitMap,
        }).matchedResults;
        // 4. Verify
        var result = matchedResults.value[0];
        // Should keep the new echelon '22'
        (0, vitest_1.expect)(result.changes.sidc.new).toBe(newSidc);
    });
});
