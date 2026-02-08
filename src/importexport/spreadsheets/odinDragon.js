"use strict";
/**
 * Parse spreadsheet data exported from https://odin.tradoc.army.mil/DATEWORLD
 *
 * Export as Excel, DRAGON format
 *
 */
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
exports.parseOdinDragon = parseOdinDragon;
exports.parseOdinDragonTemplate = parseOdinDragonTemplate;
var xlsx_lazy_1 = require("@/extlib/xlsx-lazy");
var convert_symbology_1 = require("@orbat-mapper/convert-symbology");
function parseOdinDragon(wb, options) {
    var _a, _b, _c, _d;
    if (options === void 0) { options = {}; }
    var expandTemplates = (_a = options.expandTemplates) !== null && _a !== void 0 ? _a : true;
    var rowsOnly = (_b = options.rowsOnly) !== null && _b !== void 0 ? _b : false;
    var includeEquipment = (_c = options.includeEquipment) !== null && _c !== void 0 ? _c : true;
    var includePersonnel = (_d = options.includePersonnel) !== null && _d !== void 0 ? _d : true;
    var sheetNames = wb.SheetNames;
    var sheetSet = new Set(sheetNames);
    if (sheetNames[0] !== "UNIT INFO") {
        throw new Error("Invalid spreadsheet format");
    }
    var templateCache = new Map();
    var unitInfoSheet = wb.Sheets["UNIT INFO"];
    var unitRows = xlsx_lazy_1.xlsxUtils.sheet_to_json(unitInfoSheet);
    if (rowsOnly) {
        return { unitRows: unitRows.map(convertUnitInfoRowToUnit), rootUnits: [] };
    }
    var rowMap = new Map(unitRows.map(function (row) { return [row.UID, row]; }));
    var rootUnits = unitRows
        .filter(function (unit) { return !rowMap.has(unit["PARENT UID"]); })
        .map(convertUnitInfoRowToUnit2);
    var rootUnitHierarchies = helper(rootUnits);
    return {
        unitRows: unitRows.map(convertUnitInfoRowToUnit),
        rootUnits: rootUnitHierarchies,
        rowMap: rowMap,
    };
    function helper(units) {
        units.forEach(function (unit) {
            unit.subUnits = unitRows
                .filter(function (row) { return row["PARENT UID"] === +unit.id; })
                .map(function (row) { return convertUnitInfoRowToUnit2(rowMap.get(row.UID)); });
            if (unit.subUnits.length) {
                helper(unit.subUnits);
            }
            else {
                var row = rowMap.get(+unit.id);
                if (!row)
                    return;
                var templateName = row["TEMPLATE NAME"];
                if (expandTemplates && sheetSet.has(templateName)) {
                    var template = templateCache.get(templateName) ||
                        parseOdinDragonTemplate(wb, templateName, {
                            includeEquipment: includeEquipment,
                            includePersonnel: includePersonnel,
                        });
                    if (template) {
                        templateCache.set(templateName, template);
                        unit.subUnits = template.subUnits;
                    }
                }
            }
        });
        return units;
    }
}
function parseOdinDragonTemplate(wb, templateName, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var includeEquipment = (_a = options.includeEquipment) !== null && _a !== void 0 ? _a : true;
    var includePersonnel = (_b = options.includePersonnel) !== null && _b !== void 0 ? _b : true;
    var unitTemplateSheet = wb.Sheets[templateName];
    if (!unitTemplateSheet) {
        return null;
    }
    var unitRows = xlsx_lazy_1.xlsxUtils.sheet_to_json(unitTemplateSheet);
    var rowMap = new Map(unitRows.map(function (row) { return [row.UID, row]; }));
    var rootUnit = unitRows
        .filter(function (unit) { return unit.TYPE === "U" && !rowMap.has(unit["PARENT UID"]); })
        .map(function (row) {
        return convertUnitTemplateRowToUnit(row, unitRows, includeEquipment, includePersonnel);
    })[0];
    var rootUnitHierarchies = helper([rootUnit]);
    return rootUnitHierarchies[0];
    function helper(units) {
        units.forEach(function (unit) {
            unit.subUnits = unitRows
                .filter(function (row) { return row.TYPE === "U" && row["PARENT UID"] === unit.id; })
                .map(function (row) {
                return convertUnitTemplateRowToUnit(rowMap.get(row.UID), unitRows, includeEquipment, includePersonnel);
            });
            if (unit.subUnits.length)
                helper(unit.subUnits);
        });
        return units;
    }
}
function convertUnitInfoRowToUnit(row) {
    return __assign(__assign({}, row), { id: row.UID.toString(), name: row.NAME, sidc: (0, convert_symbology_1.convertLetterSidc2NumberSidc)(row["2525C"]).sidc });
}
function convertUnitInfoRowToUnit2(row) {
    return {
        id: row.UID.toString(),
        name: "".concat(row.NAME) || "No name",
        sidc: (0, convert_symbology_1.convertLetterSidc2NumberSidc)(row["2525C"]).sidc,
    };
}
function convertUnitTemplateRowToUnit(row, rows, includeEquipment, includePersonnel) {
    var equipment = undefined;
    var personnel = undefined;
    var parentUIDs = new Set();
    if (includeEquipment || includePersonnel) {
        var rootEquipment = rows.filter(function (r) { return r["TYPE GROUP"] === "EQUIPMENT" && r["PARENT UID"] === row.UID; });
        parentUIDs = new Set(rootEquipment.map(function (r) { return r["UID"]; }));
        parentUIDs.add(row.UID);
        var equipmentCounts = rows.filter(function (r) { return r["TYPE GROUP"] === "EQUIPMENT" && parentUIDs.has(r["PARENT UID"]); });
        // equipmentCounts.push(...towedEquipmentCounts);
        parentUIDs = new Set(equipmentCounts.map(function (r) { return r["UID"]; }));
        parentUIDs.add(row.UID);
        if (includeEquipment) {
            var tmp2 = equipmentCounts.reduce(function (acc, r) {
                acc[r.NAME] = (acc[r.NAME] || 0) + 1;
                return acc;
            }, {});
            equipment = Object.entries(tmp2).map(function (_a) {
                var name = _a[0], count = _a[1];
                return ({
                    name: name,
                    count: count,
                });
            });
        }
    }
    if (includePersonnel) {
        var personnelCounts = rows
            .filter(function (r) { return r["TYPE GROUP"] === "PERSONNEL" && parentUIDs.has(r["PARENT UID"]); })
            .reduce(function (acc, r) {
            acc[r.NAME] = (acc[r.NAME] || 0) + 1;
            return acc;
        }, {});
        personnel = Object.entries(personnelCounts).map(function (_a) {
            var name = _a[0], count = _a[1];
            return ({ name: name, count: count });
        });
    }
    return {
        id: row.UID,
        name: "".concat(row.NAME) || "No name",
        sidc: (0, convert_symbology_1.convertLetterSidc2NumberSidc)(row["2525C"]).sidc,
        equipment: equipment,
        personnel: personnel,
    };
}
