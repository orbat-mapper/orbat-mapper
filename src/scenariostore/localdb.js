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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIndexedDb = useIndexedDb;
var idb_1 = require("idb");
var utils_1 = require("@/utils");
var files_1 = require("@/utils/files");
var db;
function useIndexedDb() {
    return __awaiter(this, void 0, void 0, function () {
        function createOrUpdateDb() {
            return (0, idb_1.openDB)("scenario-db", 3, {
                upgrade: function (db, oldVersion, newVersion, transaction) {
                    if (oldVersion < 1) {
                        db.createObjectStore("scenario-blobs");
                        var metadataStore = db.createObjectStore("scenario-metadata", {
                            keyPath: "id",
                        });
                        metadataStore.createIndex("by-name", "name", { unique: false });
                        metadataStore.createIndex("by-created", "created", { unique: false });
                    }
                    if (oldVersion < 2) {
                        var metadataStore = transaction.objectStore("scenario-metadata");
                        metadataStore.createIndex("by-modified", "modified", { unique: false });
                    }
                    if (oldVersion < 3) {
                        var metadataStore = transaction.objectStore("scenario-metadata");
                        metadataStore.deleteIndex("by-name");
                    }
                },
            });
        }
        function addScenario(scenario, id) {
            return __awaiter(this, void 0, void 0, function () {
                var scenarioId, metadata;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            scenarioId = (_a = id !== null && id !== void 0 ? id : scenario.id) !== null && _a !== void 0 ? _a : (0, utils_1.nanoid)();
                            if (scenario.id !== scenarioId) {
                                scenario = __assign(__assign({}, scenario), { id: scenarioId });
                            }
                            return [4 /*yield*/, db.add("scenario-blobs", scenario, scenarioId)];
                        case 1:
                            _e.sent();
                            metadata = {
                                id: scenarioId,
                                name: scenario.name,
                                description: (_b = scenario.description) !== null && _b !== void 0 ? _b : "",
                                created: ((_c = scenario.meta) === null || _c === void 0 ? void 0 : _c.createdDate)
                                    ? new Date(scenario.meta.createdDate)
                                    : new Date(),
                                modified: ((_d = scenario.meta) === null || _d === void 0 ? void 0 : _d.lastModifiedDate)
                                    ? new Date(scenario.meta.lastModifiedDate)
                                    : new Date(),
                                image: "",
                            };
                            return [4 /*yield*/, db.add("scenario-metadata", metadata)];
                        case 2:
                            _e.sent();
                            return [2 /*return*/, scenarioId];
                    }
                });
            });
        }
        function putScenario(scenario) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, metadata;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, db.get("scenario-metadata", scenario.id)];
                        case 1:
                            existing = _e.sent();
                            return [4 /*yield*/, db.put("scenario-blobs", scenario, scenario.id)];
                        case 2:
                            _e.sent();
                            metadata = {
                                id: scenario.id,
                                name: scenario.name,
                                description: (_a = scenario.description) !== null && _a !== void 0 ? _a : "",
                                created: ((_b = scenario.meta) === null || _b === void 0 ? void 0 : _b.createdDate)
                                    ? new Date(scenario.meta.createdDate)
                                    : ((_c = existing === null || existing === void 0 ? void 0 : existing.created) !== null && _c !== void 0 ? _c : new Date()),
                                modified: ((_d = scenario.meta) === null || _d === void 0 ? void 0 : _d.lastModifiedDate)
                                    ? new Date(scenario.meta.lastModifiedDate)
                                    : new Date(),
                                image: "",
                            };
                            return [4 /*yield*/, db.put("scenario-metadata", metadata)];
                        case 3:
                            _e.sent();
                            return [2 /*return*/, scenario.id];
                    }
                });
            });
        }
        function loadScenario(id) {
            return __awaiter(this, void 0, void 0, function () {
                var scenarioBLob, metadata;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db.get("scenario-blobs", id)];
                        case 1:
                            scenarioBLob = _a.sent();
                            if (!!(scenarioBLob === null || scenarioBLob === void 0 ? void 0 : scenarioBLob.meta)) return [3 /*break*/, 3];
                            return [4 /*yield*/, db.get("scenario-metadata", id)];
                        case 2:
                            metadata = _a.sent();
                            if (metadata && scenarioBLob) {
                                scenarioBLob.meta = {
                                    createdDate: metadata.created.toISOString(),
                                    lastModifiedDate: metadata.modified.toISOString(),
                                };
                            }
                            _a.label = 3;
                        case 3: return [2 /*return*/, scenarioBLob];
                    }
                });
            });
        }
        function listScenarios() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, db.getAllFromIndex("scenario-metadata", "by-modified")];
                });
            });
        }
        function deleteScenario(id) {
            return __awaiter(this, void 0, void 0, function () {
                var tx;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tx = db.transaction(["scenario-blobs", "scenario-metadata"], "readwrite");
                            return [4 /*yield*/, tx.objectStore("scenario-blobs").delete(id)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, tx.objectStore("scenario-metadata").delete(id)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, tx.done];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        function duplicateScenario(id) {
            return __awaiter(this, void 0, void 0, function () {
                var scenario, newId, newScenario;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, loadScenario(id)];
                        case 1:
                            scenario = _a.sent();
                            if (!scenario) {
                                return [2 /*return*/];
                            }
                            newId = (0, utils_1.nanoid)();
                            newScenario = __assign(__assign({}, scenario), { name: "".concat(scenario.name, " (copy)"), id: newId, meta: undefined });
                            return [4 /*yield*/, addScenario(newScenario)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, newId];
                    }
                });
            });
        }
        function downloadAsJson(id, fileName) {
            return __awaiter(this, void 0, void 0, function () {
                var name, scenario, filenamify;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            name = fileName;
                            return [4 /*yield*/, loadScenario(id)];
                        case 1:
                            scenario = _a.sent();
                            if (!scenario) {
                                return [2 /*return*/];
                            }
                            if (!!name) return [3 /*break*/, 3];
                            return [4 /*yield*/, Promise.resolve().then(function () { return require("filenamify/browser"); })];
                        case 2:
                            filenamify = (_a.sent()).default;
                            name = filenamify(scenario.name) + ".json";
                            _a.label = 3;
                        case 3: return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([JSON.stringify(scenario)], {
                                type: "application/json",
                            }), name)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        function getScenarioInfo(id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, db.get("scenario-metadata", id)];
                });
            });
        }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!db) return [3 /*break*/, 2];
                    return [4 /*yield*/, createOrUpdateDb()];
                case 1:
                    db = _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, {
                        db: db,
                        addScenario: addScenario,
                        listScenarios: listScenarios,
                        loadScenario: loadScenario,
                        putScenario: putScenario,
                        deleteScenario: deleteScenario,
                        duplicateScenario: duplicateScenario,
                        downloadAsJson: downloadAsJson,
                        getScenarioInfo: getScenarioInfo,
                    }];
            }
        });
    });
}
