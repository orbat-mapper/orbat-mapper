"use strict";
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
exports.DEMO_SCENARIOS = void 0;
exports.useBrowserScenarios = useBrowserScenarios;
var vue_1 = require("vue");
var localdb_1 = require("@/scenariostore/localdb");
var names_1 = require("@/router/names");
var utils_1 = require("@/utils");
var vue_router_1 = require("vue-router");
var core_1 = require("@vueuse/core");
var notifications_1 = require("@/composables/notifications");
exports.DEMO_SCENARIOS = [
    {
        name: "The Falklands War 1982",
        id: "falkland82",
        summary: "The Falklands War was a military conflict that took place in 1982 between Argentina and the United Kingdom. Argentina invaded the Falkland Islands on April 2, 1982, and the UK responded by sending a task force to retake the islands.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8b/HMS_Broadsword_and_Hermes%2C_1982_%28IWM%29.jpg",
    },
    {
        name: "Battles of Narvik 1940",
        id: "narvik40",
        summary: "A series of naval and land engagements fought between German and Allied forces from April to June 1940. The battles marked the first Allied victory against Germany in the war.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Norwegian_Army_Colt_heavy_machine_gun_at_the_Narvik_front.jpg",
    },
];
function useBrowserScenarios() {
    var _this = this;
    var router = (0, vue_router_1.useRouter)();
    var copyToClipboard = (0, core_1.useClipboard)().copy;
    var send = (0, notifications_1.useNotifications)().send;
    var storedScenarios = (0, vue_1.ref)([]);
    var activeSort = (0, vue_1.ref)("lastModified");
    var sortOptions = (0, vue_1.computed)(function () { return [
        {
            label: "Name",
            action: function () {
                storedScenarios.value.sort(function (a, b) { return a.name.localeCompare(b.name); });
                activeSort.value = "name";
            },
            active: activeSort.value === "name",
        },
        {
            label: "Last modified",
            action: function () {
                activeSort.value = "lastModified";
                storedScenarios.value.sort(function (a, b) { return +b.modified - +a.modified; });
            },
            active: activeSort.value === "lastModified",
        },
        {
            label: "Created",
            action: function () {
                activeSort.value = "created";
                storedScenarios.value.sort(function (a, b) { return +b.created - +a.created; });
            },
            active: activeSort.value === "created",
        },
    ]; });
    function onAction(action, scenario) {
        return __awaiter(this, void 0, void 0, function () {
            function reloadScenarios() {
                return __awaiter(this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = storedScenarios;
                                return [4 /*yield*/, listScenarios()];
                            case 1:
                                _a.value = _b.sent();
                                storedScenarios.value.reverse();
                                return [2 /*return*/];
                        }
                    });
                });
            }
            var _a, deleteScenario, listScenarios, duplicateScenario, downloadAsJson, loadScenarioFromDb, _b, scenarioBlob;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                    case 1:
                        _a = _c.sent(), deleteScenario = _a.deleteScenario, listScenarios = _a.listScenarios, duplicateScenario = _a.duplicateScenario, downloadAsJson = _a.downloadAsJson, loadScenarioFromDb = _a.loadScenario;
                        _b = action;
                        switch (_b) {
                            case "open": return [3 /*break*/, 2];
                            case "delete": return [3 /*break*/, 4];
                            case "download": return [3 /*break*/, 7];
                            case "duplicate": return [3 /*break*/, 9];
                            case "copyToClipboard": return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 15];
                    case 2: return [4 /*yield*/, router.push({
                            name: names_1.MAP_EDIT_MODE_ROUTE,
                            params: { scenarioId: scenario.id },
                        })];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 15];
                    case 4:
                        if (!window.confirm("Are you sure you want to permanently delete the scenario \"".concat(scenario.name, "\"?"))) return [3 /*break*/, 6];
                        return [4 /*yield*/, deleteScenario(scenario.id)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [3 /*break*/, 15];
                    case 7: return [4 /*yield*/, downloadAsJson(scenario.id)];
                    case 8:
                        _c.sent();
                        return [3 /*break*/, 15];
                    case 9: return [4 /*yield*/, duplicateScenario(scenario.id)];
                    case 10:
                        _c.sent();
                        return [3 /*break*/, 15];
                    case 11: return [4 /*yield*/, loadScenarioFromDb(scenario.id)];
                    case 12:
                        scenarioBlob = _c.sent();
                        if (!scenarioBlob) return [3 /*break*/, 14];
                        return [4 /*yield*/, copyToClipboard(JSON.stringify(scenarioBlob, null, 2))];
                    case 13:
                        _c.sent();
                        send({ message: "Scenario copied to clipboard", type: "success" });
                        _c.label = 14;
                    case 14: return [3 /*break*/, 15];
                    case 15: return [4 /*yield*/, reloadScenarios()];
                    case 16:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function loadScenario(v_1) {
        return __awaiter(this, arguments, void 0, function (v, routeName) {
            var _a, addScenario, getScenarioInfo, putScenario, existingScenarioInfo, scenarioId, scenarioId;
            var _b;
            if (routeName === void 0) { routeName = names_1.MAP_EDIT_MODE_ROUTE; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                    case 1:
                        _a = _c.sent(), addScenario = _a.addScenario, getScenarioInfo = _a.getScenarioInfo, putScenario = _a.putScenario;
                        return [4 /*yield*/, getScenarioInfo((_b = v.id) !== null && _b !== void 0 ? _b : (0, utils_1.nanoid)())];
                    case 2:
                        existingScenarioInfo = _c.sent();
                        if (!existingScenarioInfo) return [3 /*break*/, 8];
                        scenarioId = v.id;
                        if (!window.confirm("A scenario with the same ID is stored in the browser. Do you want to replace it with this scenario?")) return [3 /*break*/, 4];
                        return [4 /*yield*/, putScenario(v)];
                    case 3:
                        scenarioId = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, addScenario(v, (0, utils_1.nanoid)())];
                    case 5:
                        scenarioId = _c.sent();
                        _c.label = 6;
                    case 6: return [4 /*yield*/, router.push({ name: routeName, params: { scenarioId: scenarioId } })];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 11];
                    case 8: return [4 /*yield*/, addScenario(v)];
                    case 9:
                        scenarioId = _c.sent();
                        return [4 /*yield*/, router.push({ name: routeName, params: { scenarioId: scenarioId } })];
                    case 10:
                        _c.sent();
                        _c.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    }
    function importScenario(scenarioId) {
        return __awaiter(this, void 0, void 0, function () {
            var loadScenario, scenario;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                    case 1:
                        loadScenario = (_a.sent()).loadScenario;
                        return [4 /*yield*/, loadScenario(scenarioId)];
                    case 2:
                        scenario = _a.sent();
                        if (scenario) {
                            return [2 /*return*/, scenario];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    (0, vue_1.onMounted)(function () { return __awaiter(_this, void 0, void 0, function () {
        var listScenarios, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                case 1:
                    listScenarios = (_b.sent()).listScenarios;
                    _a = storedScenarios;
                    return [4 /*yield*/, listScenarios()];
                case 2:
                    _a.value = _b.sent();
                    storedScenarios.value.reverse();
                    return [2 /*return*/];
            }
        });
    }); });
    return { storedScenarios: storedScenarios, sortOptions: sortOptions, onAction: onAction, loadScenario: loadScenario, importScenario: importScenario };
}
