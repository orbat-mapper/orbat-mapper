"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpdatableFields = getUpdatableFields;
exports.useUpdateMatching = useUpdateMatching;
var vue_1 = require("vue");
var utils_1 = require("@/geo/utils");
var helpers_1 = require("@/components/helpers");
var UPDATABLE_FIELDS = [
    "name",
    "shortName",
    "sidc",
    "description",
    "externalUrl",
    "location",
];
function getUpdatableFields() {
    return UPDATABLE_FIELDS;
}
function useUpdateMatching(options) {
    var data = options.data, mappedData = options.mappedData, matchMode = options.matchMode, matchField = options.matchField, updateFields = options.updateFields, units = options.units, unitMap = options.unitMap;
    // Build a name lookup map for efficient name matching
    var unitsByName = (0, vue_1.computed)(function () {
        var map = new Map();
        for (var _i = 0, _a = units.value; _i < _a.length; _i++) {
            var unit = _a[_i];
            var lowerName = unit.name.toLowerCase().trim();
            // Only store the first match for each name (in case of duplicates)
            if (!map.has(lowerName)) {
                map.set(lowerName, unit);
            }
        }
        return map;
    });
    // Helper to compare positions
    function positionsEqual(pos1, pos2) {
        if (!pos1 && !pos2)
            return true;
        if (!pos1 || !pos2)
            return false;
        return pos1[0] === pos2[0] && pos1[1] === pos2[1];
    }
    // Match imported rows to existing units
    var matchResults = (0, vue_1.computed)(function () {
        if (!matchField.value || !data.value.length)
            return [];
        return data.value.map(function (row, index) {
            var _a, _b, _c, _d, _e;
            var matchValue = String((_a = row[matchField.value]) !== null && _a !== void 0 ? _a : "").trim();
            var existingUnit = null;
            if (matchValue) {
                if (matchMode.value === "id") {
                    // Direct lookup by ID
                    existingUnit = (_b = unitMap[matchValue]) !== null && _b !== void 0 ? _b : null;
                }
                else {
                    // Lookup by name (case-insensitive)
                    existingUnit = (_c = unitsByName.value.get(matchValue.toLowerCase())) !== null && _c !== void 0 ? _c : null;
                }
            }
            // Get the mapped data for this row
            var mapped = ((_d = mappedData.value[index]) !== null && _d !== void 0 ? _d : {});
            // Calculate changes if matched
            var changes = {};
            if (existingUnit) {
                for (var _i = 0, _f = updateFields.value; _i < _f.length; _i++) {
                    var field = _f[_i];
                    if (field === "location") {
                        // Special handling for location - compare positions
                        var newPosition = mapped._position;
                        var oldPosition = (_e = existingUnit._state) === null || _e === void 0 ? void 0 : _e.location;
                        if (newPosition && !positionsEqual(newPosition, oldPosition)) {
                            changes[field] = {
                                old: (0, utils_1.formatPosition)(oldPosition !== null && oldPosition !== void 0 ? oldPosition : undefined),
                                new: (0, utils_1.formatPosition)(newPosition),
                            };
                        }
                    }
                    else {
                        var newValue = mapped[field];
                        // Special handling for SIDC to preserve hierarchy/echelon if not specified in new value
                        if (field === "sidc" && typeof newValue === "string") {
                            var oldSidc = existingUnit.sidc;
                            // Check if we have a valid 20-char SIDC to work with
                            if (newValue.length === 20 &&
                                oldSidc &&
                                oldSidc.length === 20 &&
                                /^\d+$/.test(newValue) &&
                                /^\d+$/.test(oldSidc)) {
                                var newEchelon = newValue.substring(8, 10);
                                var oldEchelon = oldSidc.substring(8, 10);
                                // If new SIDC has '00' echelon (unspecified) and old SIDC has a specific echelon
                                if (newEchelon === "00" && oldEchelon !== "00") {
                                    var currentSidc = newValue;
                                    currentSidc = (0, helpers_1.setCharAt)(currentSidc, 8, oldEchelon.charAt(0));
                                    currentSidc = (0, helpers_1.setCharAt)(currentSidc, 9, oldEchelon.charAt(1));
                                    newValue = currentSidc;
                                }
                            }
                        }
                        if (newValue !== undefined && newValue !== null) {
                            var oldValue = existingUnit[field];
                            if (oldValue !== newValue) {
                                changes[field] = { old: oldValue, new: newValue };
                            }
                        }
                    }
                }
            }
            return {
                rowIndex: index,
                row: row,
                existingUnit: existingUnit,
                matchValue: matchValue,
                matched: existingUnit !== null,
                changes: changes,
                mappedData: {
                    id: mapped.id,
                    name: mapped.name,
                    shortName: mapped.shortName,
                    sidc: mapped.sidc,
                    description: mapped.description,
                    externalUrl: mapped.externalUrl,
                    _position: mapped._position,
                    symbolOptions: mapped.symbolOptions,
                },
            };
        });
    });
    // Statistics
    var matchedResults = (0, vue_1.computed)(function () { return matchResults.value.filter(function (r) { return r.matched; }); });
    var unmatchedResults = (0, vue_1.computed)(function () { return matchResults.value.filter(function (r) { return !r.matched; }); });
    var matchedCount = (0, vue_1.computed)(function () { return matchedResults.value.length; });
    var unmatchedCount = (0, vue_1.computed)(function () { return unmatchedResults.value.length; });
    var changesCount = (0, vue_1.computed)(function () { return matchedResults.value.filter(function (r) { return Object.keys(r.changes).length > 0; }).length; });
    return {
        matchResults: matchResults,
        matchedResults: matchedResults,
        unmatchedResults: unmatchedResults,
        matchedCount: matchedCount,
        unmatchedCount: unmatchedCount,
        changesCount: changesCount,
        getUpdatableFields: getUpdatableFields,
    };
}
