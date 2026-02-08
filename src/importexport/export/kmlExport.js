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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.useKmlExport = useKmlExport;
var files_1 = require("@/utils/files");
var settingsStore_1 = require("@/stores/settingsStore");
var geojsonConverter_1 = require("@/importexport/export/geojsonConverter");
var milsymbwrapper_1 = require("@/symbology/milsymbwrapper");
var selectedStore_ts_1 = require("@/stores/selectedStore.ts");
var utils_1 = require("@/utils");
// This composable provides KML/KMZ export functions, parameterized with required dependencies.
function useKmlExport(scenario) {
    var _a = (0, geojsonConverter_1.useGeoJsonConverter)(scenario), convertUnitsToGeoJson = _a.convertUnitsToGeoJson, convertScenarioFeaturesToGeoJson = _a.convertScenarioFeaturesToGeoJson;
    var geo = scenario.geo, store = scenario.store, unitActions = scenario.unitActions;
    var sideMap = store.state.sideMap;
    var symbolSettings = (0, settingsStore_1.useSymbolSettingsStore)();
    var selectedUnitIds = (0, selectedStore_ts_1.useSelectedItems)().selectedUnitIds;
    function createKMLString(opts) {
        var root = { type: "root", children: [] };
        var symbolDataCache = new Map();
        function createUnitsFolder(units, name) {
            var features = convertUnitsToGeoJson(units, {
                includeIdInProperties: true,
            }).features;
            return {
                type: "folder",
                meta: { name: name },
                children: features.map(function (unit) {
                    var _a = unit.properties, name = _a.name, shortName = _a.shortName, description = _a.description, id = _a.id, sidc = _a.sidc, fillColor = _a.fillColor;
                    var nUnit = scenario.helpers.getUnitById(id);
                    var s = createRenderSymbolSettings(nUnit, opts);
                    symbolDataCache.set(s.cacheKey, s);
                    var styleUrl = "#sidc".concat(s.cacheKey);
                    return __assign(__assign({}, unit), { properties: {
                            name: opts.useShortName ? shortName || name : name,
                            description: description,
                            styleUrl: styleUrl,
                        } });
                }),
            };
        }
        function writeFolders(parentFolder) {
            if (opts.includeUnits) {
                if (opts.folderMode === "side") {
                    var _loop_1 = function (sideId) {
                        var side = sideMap[sideId];
                        var units = [];
                        unitActions.walkSide(sideId, function (unit) {
                            var _a;
                            if (((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location) &&
                                (opts.includeSelectedUnitsOnly
                                    ? selectedUnitIds.value.has(unit.id)
                                    : true))
                                units.push(unit);
                        });
                        if (units.length) {
                            parentFolder.children.push(createUnitsFolder(units, side.name));
                        }
                    };
                    for (var _i = 0, _a = Object.keys(sideMap); _i < _a.length; _i++) {
                        var sideId = _a[_i];
                        _loop_1(sideId);
                    }
                }
                else if (opts.folderMode === "sideGroup") {
                    var _loop_2 = function (sideId) {
                        var _d;
                        var side = sideMap[sideId];
                        if (!side)
                            return "continue";
                        var sideFolder = {
                            type: "folder",
                            meta: { name: side.name },
                            children: [],
                        };
                        var _loop_3 = function (groupId) {
                            var group = store.state.sideGroupMap[groupId];
                            if (!group)
                                return "continue";
                            var sideGroupUnits = [];
                            unitActions.walkItem(group.id, function (unit) {
                                var _a;
                                if (((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location) &&
                                    (opts.includeSelectedUnitsOnly
                                        ? selectedUnitIds.value.has(unit.id)
                                        : true))
                                    sideGroupUnits.push(unit);
                            });
                            if (sideGroupUnits.length) {
                                sideFolder.children.push(createUnitsFolder(sideGroupUnits, group.name));
                            }
                        };
                        for (var _e = 0, _f = side.groups; _e < _f.length; _e++) {
                            var groupId = _f[_e];
                            _loop_3(groupId);
                        }
                        var sideUnits = [];
                        for (var _g = 0, _h = side.subUnits; _g < _h.length; _g++) {
                            var rootUnitId = _h[_g];
                            unitActions.walkItem(rootUnitId, function (unit) {
                                var _a;
                                if (((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location) &&
                                    (opts.includeSelectedUnitsOnly
                                        ? selectedUnitIds.value.has(unit.id)
                                        : true))
                                    sideUnits.push(unit);
                            });
                        }
                        if (sideUnits.length) {
                            var tempFolder = createUnitsFolder(sideUnits, "Root units");
                            (_d = sideFolder.children).push.apply(_d, tempFolder.children);
                        }
                        if (sideFolder.children.length) {
                            parentFolder.children.push(sideFolder);
                        }
                    };
                    for (var _b = 0, _c = Object.keys(sideMap); _b < _c.length; _b++) {
                        var sideId = _c[_b];
                        _loop_2(sideId);
                    }
                }
                else {
                    parentFolder.children.push(createUnitsFolder(geo.everyVisibleUnit.value, "Units"));
                }
            }
        }
        if (opts.timeMode === "multiple" && opts.exportEventIds.length) {
            var currentTime = store.state.currentTime;
            var events = store.state.events
                .filter(function (e) { return opts.exportEventIds.includes(e); })
                .map(function (id) { return store.state.eventMap[id]; });
            for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                var event_1 = events_1[_i];
                var eventFolder = {
                    type: "folder",
                    meta: { name: event_1.title || "Event" },
                    children: [],
                };
                scenario.time.setCurrentTime(event_1.startTime);
                writeFolders(eventFolder);
                root.children.push(eventFolder);
            }
            scenario.time.setCurrentTime(currentTime);
        }
        else {
            if (opts.timeMode === "event") {
                var currentTime = store.state.currentTime;
                var event_2 = store.state.eventMap[opts.exportEventId || ""];
                if (event_2) {
                    scenario.time.setCurrentTime(event_2.startTime);
                    writeFolders(root);
                    scenario.time.setCurrentTime(currentTime);
                }
                else {
                    writeFolders(root);
                }
            }
            else {
                writeFolders(root);
            }
        }
        var features = opts.includeFeatures
            ? convertScenarioFeaturesToGeoJson().features
            : [];
        if (opts.includeFeatures) {
            root.children.push({
                type: "folder",
                meta: { name: "Scenario features" },
                children: features,
            });
        }
        return { root: root, symbolDataCache: symbolDataCache };
    }
    function downloadAsKML(opts) {
        return __awaiter(this, void 0, void 0, function () {
            var foldersToKML, root, kmlString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("@/extlib/tokml"); })];
                    case 1:
                        foldersToKML = (_a.sent()).foldersToKML;
                        root = createKMLString(opts).root;
                        kmlString = foldersToKML(root, [], {
                            listStyle: opts.useRadioFolder ? "radioFolder" : undefined,
                        });
                        return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([kmlString], {
                                type: "application/vnd.google-earth.kml+xml",
                            }), "scenario.kml", { mimeTypes: ["application/vnd.google-earth.kml+xml"], extensions: [".kml"] })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function createRenderSymbolSettings(unit, opts) {
        var _a;
        var sidc = ((_a = unit._state) === null || _a === void 0 ? void 0 : _a.sidc) || unit.sidc;
        var symbolOptions = unitActions.getCombinedSymbolOptions(unit);
        if (opts.renderAmplifiers) {
            var _b = unit.textAmplifiers || {}, _c = _b.uniqueDesignation, uniqueDesignation = _c === void 0 ? unit.shortName || unit.name : _c, textAmplifiers = __rest(_b, ["uniqueDesignation"]);
            symbolOptions = __assign(__assign(__assign({}, symbolOptions), { uniqueDesignation: uniqueDesignation }), textAmplifiers);
        }
        var cacheKey = "".concat(sidc, "-").concat((0, utils_1.hashObject)(symbolOptions));
        return { sidc: sidc, symbolOptions: symbolOptions, cacheKey: cacheKey };
    }
    function downloadAsKMZ(opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, zipSync, strToU8, foldersToKML, data, offsetCache, _b, root, symbolDataCache, _loop_4, _i, symbolDataCache_1, _c, cacheKey, symbolData, kmlString, zipData;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("fflate"); })];
                    case 1:
                        _a = _d.sent(), zipSync = _a.zipSync, strToU8 = _a.strToU8;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("@/extlib/tokml"); })];
                    case 2:
                        foldersToKML = (_d.sent()).foldersToKML;
                        data = {};
                        offsetCache = new Map();
                        _b = createKMLString(opts), root = _b.root, symbolDataCache = _b.symbolDataCache;
                        if (!opts.embedIcons) return [3 /*break*/, 6];
                        _loop_4 = function (cacheKey, symbolData) {
                            var sidc, outlineOptions, symb, _e, x, y, size, blob, _f, _g, _h;
                            return __generator(this, function (_j) {
                                switch (_j.label) {
                                    case 0:
                                        sidc = symbolData.sidc;
                                        outlineOptions = opts.drawSymbolOutline
                                            ? { outlineWidth: opts.outlineWidth, outlineColor: opts.outlineColor }
                                            : {};
                                        symb = (0, milsymbwrapper_1.symbolGenerator)(sidc, __assign(__assign(__assign({}, symbolSettings.symbolOptions), symbolData.symbolOptions), outlineOptions));
                                        _e = symb.getOctagonAnchor(), x = _e.x, y = _e.y;
                                        size = symb.getSize();
                                        offsetCache.set(cacheKey, { x: size.width - x, y: y });
                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                return symb.asCanvas().toBlob(resolve);
                                            })];
                                    case 1:
                                        blob = _j.sent();
                                        if (!blob) return [3 /*break*/, 3];
                                        _f = data;
                                        _g = "icons/".concat(cacheKey, ".png");
                                        _h = Uint8Array.bind;
                                        return [4 /*yield*/, blob.arrayBuffer()];
                                    case 2:
                                        _f[_g] = new (_h.apply(Uint8Array, [void 0, _j.sent()]))();
                                        _j.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, symbolDataCache_1 = symbolDataCache;
                        _d.label = 3;
                    case 3:
                        if (!(_i < symbolDataCache_1.length)) return [3 /*break*/, 6];
                        _c = symbolDataCache_1[_i], cacheKey = _c[0], symbolData = _c[1];
                        return [5 /*yield**/, _loop_4(cacheKey, symbolData)];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        kmlString = foldersToKML(root, __spreadArray([], symbolDataCache.keys(), true).map(function (cacheKey) {
                            var _a, _b;
                            return ({
                                sidc: cacheKey,
                                labelScale: opts.labelScale,
                                iconScale: opts.iconScale,
                                xOffset: (_a = offsetCache === null || offsetCache === void 0 ? void 0 : offsetCache.get(cacheKey)) === null || _a === void 0 ? void 0 : _a.x,
                                yOffset: (_b = offsetCache === null || offsetCache === void 0 ? void 0 : offsetCache.get(cacheKey)) === null || _b === void 0 ? void 0 : _b.y,
                            });
                        }), {
                            listStyle: opts.useRadioFolder ? "radioFolder" : undefined,
                        });
                        data["doc.kml"] = strToU8(kmlString);
                        zipData = zipSync(data);
                        return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([zipData], {
                                type: "application/vnd.google-earth.kmz",
                            }), "scenario.kmz", { mimeTypes: ["application/vnd.google-earth.kmz"], extensions: [".kmz"] })];
                    case 7:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    return {
        downloadAsKML: downloadAsKML,
        downloadAsKMZ: downloadAsKMZ,
    };
}
