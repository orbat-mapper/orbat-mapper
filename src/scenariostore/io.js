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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyScenario = createEmptyScenario;
exports.serializeUnit = serializeUnit;
exports.useScenarioIO = useScenarioIO;
var core_1 = require("@vueuse/core");
var newScenarioStore_1 = require("./newScenarioStore");
var settingsStore_1 = require("@/stores/settingsStore");
var index_1 = require("@/scenariostore/index");
var internalModels_1 = require("@/types/internalModels");
var dayjs_1 = require("dayjs");
var militaryTimeZones_1 = require("@/utils/militaryTimeZones");
var utils_1 = require("@/utils");
var constants_1 = require("@/config/constants");
var localdb_1 = require("@/scenariostore/localdb");
var klona_1 = require("klona");
var files_1 = require("@/utils/files");
function createEmptyScenario(options) {
    var _a, _b, _c;
    if (options === void 0) { options = {}; }
    var addGroups = (_a = options.addGroups) !== null && _a !== void 0 ? _a : false;
    var symbolSettings = (0, settingsStore_1.useSymbolSettingsStore)();
    var symbologyStandard = (_b = options.symbologyStandard) !== null && _b !== void 0 ? _b : symbolSettings.symbologyStandard;
    var timeZone;
    try {
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    catch (e) { }
    var rangeRingGroups = addGroups
        ? [{ name: "GR1" }, { name: "GR2" }]
        : [];
    return {
        id: (_c = options.id) !== null && _c !== void 0 ? _c : (0, utils_1.nanoid)(),
        type: "ORBAT-mapper",
        version: constants_1.SCENARIO_FILE_VERSION,
        meta: {
            createdDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
        },
        name: "New scenario",
        description: "Empty scenario description",
        startTime: new Date().setHours(12, 0, 0, 0),
        timeZone: timeZone,
        symbologyStandard: symbologyStandard,
        sides: [],
        events: [],
        layers: [{ id: (0, utils_1.nanoid)(), name: "Features", features: [] }],
        mapLayers: [],
        settings: {
            rangeRingGroups: rangeRingGroups,
            statuses: [],
            map: { baseMapId: constants_1.DEFAULT_BASEMAP_ID },
            supplyClasses: [
                { name: "Class I" },
                { name: "Class II" },
                { name: "Class III" },
                { name: "Class IV" },
                { name: "Class V" },
            ],
            supplyUoMs: [
                { name: "Kilogram", code: "KG", type: "weight" },
                { name: "Liter", code: "LI", type: "volume" },
                { name: "Each", code: "EA", type: "quantity" },
                { name: "Meter", code: "MR", type: "distance" },
                { name: "Gallon", code: "GL", type: "volume" },
            ],
            symbolFillColors: [],
        },
    };
}
function getScenarioInfo(state) {
    return __assign({}, state.info);
}
function getScenarioEvents(state) {
    return state.events
        .filter(function (id) { return state.eventMap[id]._type === "scenario"; })
        .map(function (id) { return state.eventMap[id]; });
}
function getSides(state) {
    function getSideGroup(groupId) {
        var group = state.sideGroupMap[groupId];
        return __assign(__assign({}, group), { subUnits: group.subUnits.map(function (unitId) { return serializeUnit(unitId, state); }) });
    }
    return state.sides
        .map(function (sideId) { return state.sideMap[sideId]; })
        .map(function (nSide) { return (__assign(__assign({}, nSide), { groups: nSide.groups.map(function (groupId) { return getSideGroup(groupId); }), subUnits: nSide.subUnits.length
            ? nSide.subUnits.map(function (unitId) { return serializeUnit(unitId, state); })
            : undefined })); });
}
function serializeUnit(unitId, scnState, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var _c = options.newId, newId = _c === void 0 ? false : _c, _d = options.includeSubUnits, includeSubUnits = _d === void 0 ? true : _d;
    var nUnit = scnState.unitMap[unitId];
    var _e = serializeToeStuff(nUnit, scnState), equipment = _e.equipment, personnel = _e.personnel, supplies = _e.supplies;
    var rangeRings = (_a = nUnit.rangeRings) === null || _a === void 0 ? void 0 : _a.map(function (_a) {
        var group = _a.group, rest = __rest(_a, ["group"]);
        return group ? __assign({ group: scnState.rangeRingGroupMap[group].name }, rest) : rest;
    });
    if ((rangeRings === null || rangeRings === void 0 ? void 0 : rangeRings.length) === 0)
        rangeRings = undefined;
    var id = nUnit.id, state = nUnit.state, rest = __rest(nUnit, ["id", "state"]);
    return __assign(__assign({ id: newId ? (0, utils_1.nanoid)() : id }, rest), { status: nUnit.status ? (_b = scnState.unitStatusMap[nUnit.status]) === null || _b === void 0 ? void 0 : _b.name : undefined, subUnits: includeSubUnits
            ? nUnit.subUnits.map(function (subUnitId) { return serializeUnit(subUnitId, scnState, options); })
            : [], equipment: equipment, personnel: personnel, supplies: supplies, rangeRings: rangeRings, state: state ? state.map(function (s) { return serializeState(s, scnState); }) : undefined });
}
function serializeToeStuff(nUnit, scnState) {
    var _a, _b, _c;
    var equipment = (_a = nUnit.equipment) === null || _a === void 0 ? void 0 : _a.map(function (_a) {
        var id = _a.id, count = _a.count, onHand = _a.onHand;
        var name = scnState.equipmentMap[id].name;
        return { name: name, count: count, onHand: onHand };
    });
    if ((equipment === null || equipment === void 0 ? void 0 : equipment.length) === 0)
        equipment = undefined;
    var personnel = (_b = nUnit.personnel) === null || _b === void 0 ? void 0 : _b.map(function (_a) {
        var id = _a.id, count = _a.count, onHand = _a.onHand;
        var name = scnState.personnelMap[id].name;
        return { name: name, count: count, onHand: onHand };
    });
    if ((personnel === null || personnel === void 0 ? void 0 : personnel.length) === 0)
        personnel = undefined;
    var supplies = (_c = nUnit.supplies) === null || _c === void 0 ? void 0 : _c.map(function (_a) {
        var id = _a.id, count = _a.count, onHand = _a.onHand;
        var name = scnState.supplyCategoryMap[id].name;
        return { name: name, count: count, onHand: onHand };
    });
    if ((supplies === null || supplies === void 0 ? void 0 : supplies.length) === 0)
        supplies = undefined;
    return { equipment: equipment, personnel: personnel, supplies: supplies };
}
function serializeState(s, scnState) {
    var _a, _b, _c;
    var diffEquipment, diffPersonnel, diffSupplies;
    var c = (0, klona_1.klona)(s);
    if (s.diff) {
        if (s.diff.equipment) {
            diffEquipment = s.diff.equipment.map(function (_a) {
                var _b, _c;
                var id = _a.id, count = _a.count, onHand = _a.onHand;
                return { name: (_c = (_b = scnState.equipmentMap[id]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : id, count: count, onHand: onHand };
            });
        }
        if ((_a = s.diff) === null || _a === void 0 ? void 0 : _a.personnel) {
            diffPersonnel = s.diff.personnel.map(function (_a) {
                var _b, _c;
                var id = _a.id, count = _a.count, onHand = _a.onHand;
                return { name: (_c = (_b = scnState.personnelMap[id]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : id, count: count, onHand: onHand };
            });
        }
        if ((_b = s.diff) === null || _b === void 0 ? void 0 : _b.supplies) {
            diffSupplies = s.diff.supplies.map(function (_a) {
                var _b, _c;
                var id = _a.id, count = _a.count, onHand = _a.onHand;
                return {
                    name: (_c = (_b = scnState.supplyCategoryMap[id]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : id,
                    count: count,
                    onHand: onHand,
                };
            });
        }
        c.diff = {
            equipment: diffEquipment,
            personnel: diffPersonnel,
            supplies: diffSupplies,
        };
    }
    if (s.update) {
        var updateEquipment = void 0, updatePersonnel = void 0, updateSupplies = void 0;
        if (s.update.equipment) {
            updateEquipment = s.update.equipment.map(function (_a) {
                var _b, _c;
                var id = _a.id, count = _a.count, onHand = _a.onHand;
                return { name: (_c = (_b = scnState.equipmentMap[id]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : id, count: count, onHand: onHand };
            });
        }
        if (s.update.personnel) {
            updatePersonnel = s.update.personnel.map(function (_a) {
                var _b, _c;
                var id = _a.id, count = _a.count, onHand = _a.onHand;
                return { name: (_c = (_b = scnState.personnelMap[id]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : id, count: count, onHand: onHand };
            });
        }
        if (s.update.supplies) {
            updateSupplies = s.update.supplies.map(function (_a) {
                var _b, _c;
                var id = _a.id, count = _a.count, onHand = _a.onHand;
                return {
                    name: (_c = (_b = scnState.supplyCategoryMap[id]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : id,
                    count: count,
                    onHand: onHand,
                };
            });
        }
        c.update = {
            equipment: updateEquipment,
            personnel: updatePersonnel,
            supplies: updateSupplies,
        };
    }
    if (s.status) {
        c.status = (_c = scnState.unitStatusMap[s.status]) === null || _c === void 0 ? void 0 : _c.name;
    }
    return c;
}
function getLayers(state) {
    return state.layers
        .map(function (id) { return state.layerMap[id]; })
        .map(function (layer) { return (__assign(__assign({}, layer), { features: layer.features.map(function (fId) { return state.featureMap[fId]; }) })); });
}
function getMapLayers(state) {
    return state.mapLayers
        .map(function (id) { return state.mapLayerMap[id]; })
        .filter(function (l) { return !l._isTemporary; });
}
function getEquipment(state) {
    return Object.values(state.equipmentMap).map(function (_a) {
        var name = _a.name, description = _a.description, sidc = _a.sidc;
        return ({
            name: name,
            description: description,
            sidc: sidc,
        });
    });
}
function getPersonnel(state) {
    return Object.values(state.personnelMap).map(function (_a) {
        var name = _a.name, description = _a.description;
        return ({
            name: name,
            description: description,
        });
    });
}
function getSupplyCategories(state) {
    return Object.values(state.supplyCategoryMap).map(function (_a) {
        var _b, _c, _d, _e;
        var id = _a.id, sup = __rest(_a, ["id"]);
        return __assign(__assign({}, sup), { supplyClass: sup.supplyClass
                ? ((_c = (_b = state.supplyClassMap[sup.supplyClass]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : sup.supplyClass)
                : undefined, uom: sup.uom ? ((_e = (_d = state.supplyUomMap[sup.uom]) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : sup.uom) : undefined });
    });
}
function getRangeRingGroups(state) {
    return Object.values(state.rangeRingGroupMap).map(function (_a) {
        var id = _a.id, rest = __rest(_a, ["id"]);
        return rest;
    });
}
function getUnitStatuses(state) {
    return Object.values(state.unitStatusMap).map(function (_a) {
        var id = _a.id, rest = __rest(_a, ["id"]);
        return rest;
    });
}
function getSupplyClasses(state) {
    return Object.values(state.supplyClassMap).map(function (_a) {
        var id = _a.id, rest = __rest(_a, ["id"]);
        return rest;
    });
}
function getSupplyUoMs(state) {
    return Object.values(state.supplyUomMap).map(function (_a) {
        var id = _a.id, rest = __rest(_a, ["id"]);
        return rest;
    });
}
function getSymbolFillColors(state) {
    return Object.values(state.symbolFillColorMap).map(function (_a) {
        var id = _a.id, rest = __rest(_a, ["id"]);
        return rest;
    });
}
function getCustomSymbols(state) {
    return Object.values(state.customSymbolMap);
}
function useScenarioIO(store) {
    var settingsStore = (0, settingsStore_1.useSymbolSettingsStore)();
    function toObject() {
        var _a, _b;
        var state = store.value.state;
        return __assign(__assign({ id: state.id, type: "ORBAT-mapper", version: constants_1.SCENARIO_FILE_VERSION, meta: {
                createdDate: (_a = state === null || state === void 0 ? void 0 : state.meta) === null || _a === void 0 ? void 0 : _a.createdDate,
                lastModifiedDate: new Date().toISOString(),
            } }, getScenarioInfo(state)), { sides: getSides(state), layers: getLayers(state), events: getScenarioEvents(state), mapLayers: getMapLayers(state), equipment: getEquipment(state), personnel: getPersonnel(state), supplyCategories: getSupplyCategories(state), settings: {
                rangeRingGroups: getRangeRingGroups(state),
                statuses: getUnitStatuses(state),
                supplyClasses: getSupplyClasses(state),
                supplyUoMs: getSupplyUoMs(state),
                map: state.mapSettings,
                symbolFillColors: getSymbolFillColors(state),
                customSymbols: getCustomSymbols(state),
                boundingBox: (_b = state.boundingBox) !== null && _b !== void 0 ? _b : undefined,
            } });
    }
    function stringifyScenario() {
        return JSON.stringify(toObject(), stringifyReplacer, "  ");
    }
    function stringifyObject(obj) {
        return JSON.stringify(obj, stringifyReplacer, "  ");
    }
    function stringifyReplacer(name, val) {
        if (val === undefined)
            return undefined;
        if (internalModels_1.INTERNAL_NAMES.includes(name))
            return undefined;
        if (internalModels_1.TIMESTAMP_NAMES.includes(name)) {
            return (0, dayjs_1.default)(val)
                .tz((0, militaryTimeZones_1.resolveTimeZone)(store.value.state.info.timeZone || "UTC"))
                .format();
        }
        return val;
    }
    function serializeToObject() {
        return JSON.parse(stringifyScenario());
    }
    function saveToLocalStorage(key) {
        if (key === void 0) { key = constants_1.LOCALSTORAGE_KEY; }
        var scn = (0, core_1.useLocalStorage)(key, "");
        scn.value = stringifyScenario();
    }
    function saveToIndexedDb() {
        return __awaiter(this, void 0, void 0, function () {
            var putScenario, scn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                    case 1:
                        putScenario = (_a.sent()).putScenario;
                        scn = serializeToObject();
                        if (scn.id.startsWith("demo-")) {
                            scn.id = (0, utils_1.nanoid)();
                            store.value.state.id = scn.id;
                        }
                        return [4 /*yield*/, putScenario(scn)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    function duplicateScenario() {
        return __awaiter(this, void 0, void 0, function () {
            var putScenario, scn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                    case 1:
                        putScenario = (_a.sent()).putScenario;
                        scn = serializeToObject();
                        scn.id = (0, utils_1.nanoid)();
                        scn.name = "".concat(scn.name, " (copy)");
                        return [4 /*yield*/, putScenario(scn)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, scn.id];
                }
            });
        });
    }
    function loadFromLocalStorage(key) {
        if (key === void 0) { key = constants_1.LOCALSTORAGE_KEY; }
        var scn = (0, core_1.useLocalStorage)(key, "");
        if (scn.value) {
            loadFromObject(JSON.parse(scn.value));
        }
    }
    function loadFromObject(data) {
        store.value = (0, newScenarioStore_1.useNewScenarioStore)(data);
        settingsStore.symbologyStandard = store.value.state.info.symbologyStandard || "2525";
    }
    function loadFromUrl(url) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, isFinished, statusCode, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, core_1.useFetch)(url).json(), data = _a.data, isFinished = _a.isFinished, statusCode = _a.statusCode, error = _a.error;
                        return [4 /*yield*/, (0, core_1.until)(isFinished).toBe(true)];
                    case 1:
                        _b.sent();
                        if (error.value) {
                            console.error(statusCode.value, error.value);
                            return [2 /*return*/];
                        }
                        loadFromObject(data.value);
                        return [2 /*return*/];
                }
            });
        });
    }
    function loadEmptyScenario() {
        var scn = createEmptyScenario();
        loadFromObject(scn);
    }
    function loadDemoScenario(id) {
        return __awaiter(this, void 0, void 0, function () {
            var idUrlMap, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        index_1.isLoading.value = true;
                        idUrlMap = {
                            falkland82: "/scenarios/falkland82.json",
                            narvik40: "/scenarios/narvik40.json",
                        };
                        url = idUrlMap[id];
                        if (!url) {
                            console.warn("Unknown scenario id", id);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, loadFromUrl(url)];
                    case 1:
                        _a.sent();
                        index_1.isLoading.value = false;
                        return [2 /*return*/];
                }
            });
        });
    }
    function downloadAsJson(fileName) {
        return __awaiter(this, void 0, void 0, function () {
            var name, filenamify;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = fileName;
                        if (!!name) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("filenamify/browser"); })];
                    case 1:
                        filenamify = (_a.sent()).default;
                        name = filenamify(store.value.state.info.name || "scenario.json");
                        _a.label = 2;
                    case 2: return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([stringifyScenario()], {
                            type: "application/json",
                        }), name + ".json")];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    return {
        loadDemoScenario: loadDemoScenario,
        loadEmptyScenario: loadEmptyScenario,
        loadFromObject: loadFromObject,
        downloadAsJson: downloadAsJson,
        saveToLocalStorage: saveToLocalStorage,
        loadFromLocalStorage: loadFromLocalStorage,
        stringifyScenario: stringifyScenario,
        serializeToObject: serializeToObject,
        saveToIndexedDb: saveToIndexedDb,
        duplicateScenario: duplicateScenario,
        stringifyObject: stringifyObject,
        toObject: toObject,
    };
}
