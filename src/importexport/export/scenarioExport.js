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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.toCsv = toCsv;
exports.useScenarioExport = useScenarioExport;
var helpers_1 = require("@turf/helpers");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var internalModels_1 = require("@/types/internalModels");
var externalModels_1 = require("@/types/externalModels");
var files_1 = require("@/utils/files");
var kmlExport_1 = require("./kmlExport");
var geojsonConverter_1 = require("@/importexport/export/geojsonConverter");
function stringifyReplacer(name, val) {
    if (val === undefined)
        return undefined;
    if (internalModels_1.INTERNAL_NAMES.includes(name))
        return undefined;
    return val;
}
function columnMapper(data, columnMap) {
    var mappedData = [];
    data.forEach(function (item) {
        var mappedItem = {};
        columnMap.forEach(function (_a) {
            var label = _a.label, field = _a.field;
            mappedItem[label] = mapField(item[field]);
        });
        mappedData.push(mappedItem);
    });
    return mappedData;
}
function mapField(field) {
    if (Array.isArray(field))
        return JSON.stringify(field);
    return field;
}
function escapeCsvField(value, separator) {
    if (value == null)
        return "";
    var str = String(value);
    if (str.includes(separator) || str.includes('"') || str.includes("\n")) {
        return "\"".concat(str.replace(/"/g, '""'), "\"");
    }
    return str;
}
function toCsv(data, separator) {
    if (data.length === 0)
        return "";
    var headers = Object.keys(data[0]);
    var headerLine = headers.map(function (h) { return escapeCsvField(h, separator); }).join(separator);
    var lines = data.map(function (row) {
        return headers.map(function (h) { return escapeCsvField(row[h], separator); }).join(separator);
    });
    return __spreadArray([headerLine], lines, true).join("\n");
}
function useScenarioExport(options) {
    if (options === void 0) { options = {}; }
    var scenario = options.activeScenario || (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
    var geo = scenario.geo, store = scenario.store, unitActions = scenario.unitActions, io = scenario.io, getUnitById = scenario.helpers.getUnitById;
    var sideMap = store.state.sideMap;
    var _a = (0, geojsonConverter_1.useGeoJsonConverter)(scenario), convertUnitsToGeoJson = _a.convertUnitsToGeoJson, convertScenarioFeaturesToGeoJson = _a.convertScenarioFeaturesToGeoJson;
    function downloadAsGeoJSON(opts) {
        return __awaiter(this, void 0, void 0, function () {
            var units, features, combined;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        units = opts.includeUnits
                            ? convertUnitsToGeoJson(geo.everyVisibleUnit.value, opts).features
                            : [];
                        features = opts.includeFeatures
                            ? convertScenarioFeaturesToGeoJson(opts).features
                            : [];
                        combined = __spreadArray(__spreadArray([], units, true), features, true);
                        return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([JSON.stringify((0, helpers_1.featureCollection)(combined), stringifyReplacer, 2)], {
                                type: "application/json",
                            }), opts.fileName)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    var _b = (0, kmlExport_1.useKmlExport)(scenario), downloadAsKML = _b.downloadAsKML, downloadAsKMZ = _b.downloadAsKMZ;
    function downloadAsMilx(opts) {
        return __awaiter(this, void 0, void 0, function () {
            var toMilx, layers, milxString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("@/importexport/milx"); })];
                    case 1:
                        toMilx = (_a.sent()).toMilx;
                        layers = [];
                        if (opts.includeUnits) {
                            if (opts.oneFolderPerSide) {
                                Object.keys(sideMap).forEach(function (sideId) {
                                    var side = sideMap[sideId];
                                    var units = [];
                                    unitActions.walkSide(sideId, function (unit) {
                                        var _a;
                                        if ((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location)
                                            units.push(unit);
                                    });
                                    layers.push({
                                        name: side.name,
                                        featureCollection: convertUnitsToGeoJson(units),
                                    });
                                });
                            }
                            else {
                                layers.push({
                                    name: "Units",
                                    featureCollection: convertUnitsToGeoJson(geo.everyVisibleUnit.value),
                                });
                            }
                        }
                        milxString = toMilx(layers);
                        return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([milxString], {
                                type: "application/xml",
                            }), "scenario.milxly", { mimeTypes: ["application/xml"], extensions: [".milxly"] })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function downloadAsXlsx(opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, writeFileXLSX, xlsxUtils, formatLocation, workbook, unitData, formatLoc, ws;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("@/extlib/xlsx-lazy"); })];
                    case 1:
                        _a = _b.sent(), writeFileXLSX = _a.writeFileXLSX, xlsxUtils = _a.xlsxUtils;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("@/importexport/export/locationFormat"); })];
                    case 2:
                        formatLocation = (_b.sent()).formatLocation;
                        workbook = xlsxUtils.book_new();
                        unitData = [];
                        formatLoc = function (loc) { return formatLocation(loc, opts.locationFormat); };
                        if (opts.oneSheetPerSide) {
                            Object.keys(sideMap).forEach(function (sideId) {
                                unitData = [];
                                var sideName = sideMap[sideId].name;
                                unitActions.walkSide(sideId, function (unit, level, parent, sideGroup, side) {
                                    var _a;
                                    unitData.push(__assign(__assign({}, unit), { location: formatLoc(((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location) || unit.location), sideId: side.id, sideName: side === null || side === void 0 ? void 0 : side.name }));
                                });
                                var ws = xlsxUtils.json_to_sheet(columnMapper(unitData, opts.columns));
                                xlsxUtils.book_append_sheet(workbook, ws, sideName);
                            });
                        }
                        else {
                            Object.keys(sideMap).forEach(function (sideId) {
                                return unitActions.walkSide(sideId, function (unit, level, parent, sideGroup, side) {
                                    var _a;
                                    unitData.push(__assign(__assign({}, unit), { location: formatLoc(((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location) || unit.location), sideId: side.id, sideName: side === null || side === void 0 ? void 0 : side.name }));
                                });
                            });
                            ws = xlsxUtils.json_to_sheet(columnMapper(unitData, opts.columns));
                            xlsxUtils.book_append_sheet(workbook, ws, "Units");
                        }
                        writeFileXLSX(workbook, "scenario.xlsx");
                        return [2 /*return*/];
                }
            });
        });
    }
    function downloadAsCsv(opts) {
        return __awaiter(this, void 0, void 0, function () {
            var formatLocation, formatLoc, separator, unitData, mappedData, csvContent, extension, mimeType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("@/importexport/export/locationFormat"); })];
                    case 1:
                        formatLocation = (_a.sent()).formatLocation;
                        formatLoc = function (loc) { return formatLocation(loc, opts.locationFormat); };
                        separator = opts.separator || ",";
                        unitData = [];
                        Object.keys(sideMap).forEach(function (sideId) {
                            return unitActions.walkSide(sideId, function (unit, level, parent, sideGroup, side) {
                                var _a;
                                unitData.push(__assign(__assign({}, unit), { location: formatLoc(((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location) || unit.location), sideId: side.id, sideName: side === null || side === void 0 ? void 0 : side.name }));
                            });
                        });
                        mappedData = columnMapper(unitData, opts.columns);
                        csvContent = toCsv(mappedData, separator);
                        extension = separator === "\t" ? ".tsv" : ".csv";
                        mimeType = separator === "\t" ? "text/tab-separated-values" : "text/csv";
                        return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([csvContent], { type: mimeType }), "scenario".concat(extension), { mimeTypes: [mimeType], extensions: [extension] })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function downloadAsSpatialIllusions(opts) {
        return __awaiter(this, void 0, void 0, function () {
            function convertUnit(unit, level) {
                var _a, _b, _c, _d;
                return {
                    options: {
                        uniqueDesignation: unit.name,
                        sidc: unit.sidc,
                        fillColor: (_a = unit.symbolOptions) === null || _a === void 0 ? void 0 : _a.fillColor,
                        reinforced: externalModels_1.reinforcedStatus2SpatialIllusions[(_b = unit.reinforcedStatus) !== null && _b !== void 0 ? _b : "None"],
                        additionalInformation: (_c = unit.textAmplifiers) === null || _c === void 0 ? void 0 : _c.additionalInformation,
                    },
                    subOrganizations: level < opts.maxLevels
                        ? ((_d = unit.subUnits) === null || _d === void 0 ? void 0 : _d.map(function (subUnit) { return convertUnit(subUnit, level + 1); })) || []
                        : [],
                };
            }
            var rootUnit, hierarchy, d;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rootUnit = opts.rootUnit;
                        hierarchy = unitActions.expandUnitWithSymbolOptions(getUnitById(rootUnit));
                        d = convertUnit(hierarchy, 0);
                        return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([JSON.stringify(d, undefined, 2)], {
                                type: "application/json",
                            }), "spatialillusions-orbat.json", { mimeTypes: ["application/json"], extensions: [".json"] })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function downloadAsOrbatMapper(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var scn, sidesWithFilteredGroups, newScenario;
            var fileName = _b.fileName, scenarioName = _b.scenarioName, sideGroups = _b.sideGroups;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        scn = io.toObject();
                        sidesWithFilteredGroups = scn.sides.map(function (side) { return (__assign(__assign({}, side), { groups: side.groups.filter(function (g) { return sideGroups.includes(g.id); }) })); });
                        newScenario = __assign(__assign({}, scn), { sides: sidesWithFilteredGroups.filter(function (e) { return e.groups.length; }) });
                        newScenario.id = (0, utils_1.nanoid)();
                        newScenario.meta = __assign(__assign({}, scn.meta), { exportedFrom: scn.id, exportedDate: new Date().toISOString() });
                        if (scenarioName)
                            newScenario.name = scenarioName;
                        return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([JSON.stringify(newScenario, undefined, 2)], {
                                type: "application/json",
                            }), fileName || "scenario-export-orbatmapper.json", { mimeTypes: ["application/json"], extensions: [".json"] })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    return {
        downloadAsGeoJSON: downloadAsGeoJSON,
        downloadAsKML: downloadAsKML,
        downloadAsKMZ: downloadAsKMZ,
        downloadAsXlsx: downloadAsXlsx,
        downloadAsCsv: downloadAsCsv,
        downloadAsMilx: downloadAsMilx,
        downloadAsSpatialIllusions: downloadAsSpatialIllusions,
        downloadAsOrbatMapper: downloadAsOrbatMapper,
    };
}
