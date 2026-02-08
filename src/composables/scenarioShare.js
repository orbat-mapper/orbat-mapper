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
exports.useScenarioShare = useScenarioShare;
exports.useShareHistory = useShareHistory;
var core_1 = require("@vueuse/core");
var constants_1 = require("@/config/constants");
function useScenarioShare() {
    function shareScenario(scenario) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, strFromU8, strToU8, zlibSync, scenarioData, jsonString, compressed, base64, url, urlStr, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("fflate"); })];
                    case 1:
                        _a = _b.sent(), strFromU8 = _a.strFromU8, strToU8 = _a.strToU8, zlibSync = _a.zlibSync;
                        scenarioData = scenario.io.serializeToObject();
                        jsonString = JSON.stringify(scenarioData);
                        compressed = zlibSync(strToU8(jsonString), { level: 9 });
                        base64 = btoa(strFromU8(compressed, true));
                        url = new URL(window.location.href);
                        url.pathname = "/import";
                        url.hash = "";
                        url.searchParams.set("data", base64);
                        urlStr = url.toString();
                        result = { url: urlStr, warning: "" };
                        if (urlStr.length > 2048) {
                            result.warning = "The generated URL is very long (".concat(urlStr.length, " chars). It might not work in some browsers or chat apps.");
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    }
    function loadScenarioFromUrlParam(param) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, strFromU8, strToU8, unzlibSync, compressed, decompressed, jsonString;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("fflate"); })];
                    case 1:
                        _a = _b.sent(), strFromU8 = _a.strFromU8, strToU8 = _a.strToU8, unzlibSync = _a.unzlibSync;
                        compressed = strToU8(atob(param), true);
                        decompressed = unzlibSync(compressed);
                        jsonString = strFromU8(decompressed);
                        return [2 /*return*/, JSON.parse(jsonString)];
                }
            });
        });
    }
    return {
        shareScenario: shareScenario,
        loadScenarioFromUrlParam: loadScenarioFromUrlParam,
    };
}
function useShareHistory() {
    var history = (0, core_1.useLocalStorage)(constants_1.SHARE_HISTORY_LOCALSTORAGE_KEY, []);
    function addToHistory(item) {
        var newItem = __assign(__assign({}, item), { timestamp: Date.now() });
        var index = history.value.findIndex(function (i) { return i.id === item.id; });
        if (index !== -1) {
            history.value.splice(index, 1);
        }
        history.value.unshift(newItem);
        if (history.value.length > 10) {
            history.value.pop();
        }
    }
    function clearHistory() {
        history.value = [];
    }
    return {
        history: history,
        addToHistory: addToHistory,
        clearHistory: clearHistory,
    };
}
