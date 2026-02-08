"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMappedData = useMappedData;
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var helpers_1 = require("@/components/helpers");
var textToOrbat_1 = require("@/views/texttoorbat/textToOrbat");
var utils_2 = require("@/geo/utils");
var useColumnMapping_1 = require("./useColumnMapping");
function isNumericSidc(value) {
    return /^\d{10}(\d{5})?(\d{5})?$/.test(value);
}
function isCharacterSidc(value) {
    return /^[A-Z\-]{15}(\d{15})?$/.test(value);
}
function useMappedData(options) {
    var data = options.data, fieldMappings = options.fieldMappings, idField = options.idField, idMode = options.idMode, parentMatchField = options.parentMatchField, coordinateMode = options.coordinateMode, latitudeField = options.latitudeField, longitudeField = options.longitudeField, positionField = options.positionField, combinedCoordinateFormat = options.combinedCoordinateFormat, guessSidc = options.guessSidc, parentSidc = options.parentSidc, parentSymbolOptions = options.parentSymbolOptions, parentSideIdentifier = options.parentSideIdentifier;
    var generatedIds = new WeakMap();
    var mappedData = (0, vue_1.computed)(function () {
        if (!data.value.length)
            return [];
        var pSidc = (0, vue_1.unref)(parentSidc);
        var pSymbolOptions = (0, vue_1.unref)(parentSymbolOptions);
        var pSideId = (0, vue_1.unref)(parentSideIdentifier);
        var parentIdentity = "3";
        if (pSidc) {
            if (pSidc.startsWith("custom")) {
                parentIdentity = pSideId || "3";
            }
            else {
                parentIdentity = pSidc[3];
            }
        }
        return data.value.map(function (row) {
            var r = row;
            var unit = {};
            // Map ID
            if (idMode.value === "mapped" && idField.value && r[idField.value] !== undefined) {
                unit.id = r[idField.value];
            }
            else if (idMode.value === "autogenerate") {
                var id = generatedIds.get(r);
                if (!id) {
                    id = (0, utils_1.nanoid)();
                    generatedIds.set(r, id);
                }
                unit.id = id;
            }
            // Map other fields
            useColumnMapping_1.commonFields.forEach(function (field) {
                var mappedHeader = fieldMappings.value[field.value];
                if (mappedHeader && r[mappedHeader] !== undefined) {
                    unit[field.value] = r[mappedHeader];
                }
            });
            // Try to construct SIDC from specific icon/echelon fields if SIDC is missing
            if (!unit.sidc) {
                var iconHeader = fieldMappings.value["icon"];
                var echelonHeader = fieldMappings.value["echelon"];
                var iconValue = iconHeader ? r[iconHeader] : undefined;
                var echelonValue = echelonHeader ? r[echelonHeader] : undefined;
                if (iconValue || echelonValue) {
                    if (iconValue && (isNumericSidc(iconValue) || isCharacterSidc(iconValue))) {
                        if (iconValue.length >= 15) {
                            unit.sidc = (0, helpers_1.setCharAt)(iconValue, 3, parentIdentity);
                        }
                        else {
                            // Partial SIDC (10 digits) - assume it contains entity/type/subtype/mod
                            // We construct full SIDC: 10 + context + identity + set + status + hq + amp + iconValue
                            var derivedEchelon = echelonValue
                                ? (0, textToOrbat_1.getEchelonCodeFromName)(echelonValue) || "00"
                                : "00";
                            unit.sidc = "100" + parentIdentity + "1000" + derivedEchelon + iconValue;
                        }
                    }
                    else {
                        var derivedIcon = iconValue
                            ? (0, textToOrbat_1.getIconCodeFromName)(iconValue) || "0000000000"
                            : "0000000000";
                        var derivedEchelon = echelonValue
                            ? (0, textToOrbat_1.getEchelonCodeFromName)(echelonValue) || "00"
                            : "00";
                        // Standard Identity 3 (Friendly), SymbolSet 10 (Land Unit), Status 0, HQTFD 0
                        unit.sidc = "100" + parentIdentity + "1000" + derivedEchelon + derivedIcon;
                    }
                }
                else if (guessSidc.value && unit.name) {
                    var sidc = (0, textToOrbat_1.buildSidc)(0, unit.name);
                    unit.sidc = (0, helpers_1.setCharAt)(sidc, 3, parentIdentity);
                }
            }
            // Parse position based on coordinate mode
            if (coordinateMode.value === "separate" &&
                latitudeField.value &&
                longitudeField.value) {
                var lat = r[latitudeField.value];
                var lon = r[longitudeField.value];
                var pos = (0, utils_2.parseLatLonPair)(lat, lon);
                if (pos) {
                    unit._position = pos;
                }
            }
            else if (coordinateMode.value === "combined" && positionField.value) {
                var coordValue = r[positionField.value];
                if (coordValue && typeof coordValue === "string") {
                    var pos = (0, utils_2.parseCoordinateString)(coordValue, combinedCoordinateFormat.value);
                    if (pos) {
                        unit._position = pos;
                    }
                }
            }
            if (pSymbolOptions) {
                unit.symbolOptions = pSymbolOptions;
            }
            return unit;
        });
    });
    // Build hierarchy from flat data when parentId is mapped
    var hierarchyData = (0, vue_1.computed)(function () {
        if (!fieldMappings.value.parentId || !parentMatchField.value) {
            return [];
        }
        var sourceData = data.value;
        var flatData = mappedData.value;
        if (!flatData.length || !sourceData.length)
            return [];
        var parentIdHeader = fieldMappings.value.parentId;
        var matchFieldHeader = parentMatchField.value;
        // Create a map from the parentMatchField column value to the hierarchy unit
        // parentMatchField is a column header in the SOURCE data
        var unitMap = new Map();
        sourceData.forEach(function (sourceRow, index) {
            var _a;
            var matchValue = String((_a = sourceRow[matchFieldHeader]) !== null && _a !== void 0 ? _a : "");
            if (matchValue && flatData[index]) {
                unitMap.set(matchValue, __assign(__assign({}, flatData[index]), { subUnits: [] }));
            }
        });
        // Build the hierarchy
        var rootUnits = [];
        sourceData.forEach(function (sourceRow) {
            var _a, _b;
            var matchValue = String((_a = sourceRow[matchFieldHeader]) !== null && _a !== void 0 ? _a : "");
            var hierarchyUnit = unitMap.get(matchValue);
            if (!hierarchyUnit)
                return;
            // Get the parent reference from the source data's parentId column
            var parentIdValue = String((_b = sourceRow[parentIdHeader]) !== null && _b !== void 0 ? _b : "");
            var parentUnit = parentIdValue ? unitMap.get(parentIdValue) : null;
            if (parentUnit && parentUnit !== hierarchyUnit) {
                if (!parentUnit.subUnits)
                    parentUnit.subUnits = [];
                parentUnit.subUnits.push(hierarchyUnit);
            }
            else {
                rootUnits.push(hierarchyUnit);
            }
        });
        return rootUnits;
    });
    return {
        mappedData: mappedData,
        hierarchyData: hierarchyData,
    };
}
