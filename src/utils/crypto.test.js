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
var vitest_1 = require("vitest");
var crypto_1 = require("./crypto");
var mockScenario = {
    type: "ORBAT-mapper",
    id: "test-id",
    name: "Test Scenario",
    version: "2.1.0",
    sides: [],
    events: [],
    layers: [],
    mapLayers: [],
};
(0, vitest_1.describe)("crypto utils", function () {
    (0, vitest_1.it)("encrypts and decrypts a scenario", function () { return __awaiter(void 0, void 0, void 0, function () {
        var password, encrypted, decrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    password = "my-secret-password";
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(mockScenario, password)];
                case 1:
                    encrypted = _a.sent();
                    (0, vitest_1.expect)(encrypted.type).toBe("ORBAT-mapper-encrypted");
                    (0, vitest_1.expect)(encrypted.ciphertext).toBeDefined();
                    return [4 /*yield*/, (0, crypto_1.decryptScenario)(encrypted, password)];
                case 2:
                    decrypted = _a.sent();
                    (0, vitest_1.expect)(decrypted).toEqual(mockScenario);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)("fails to decrypt with wrong password", function () { return __awaiter(void 0, void 0, void 0, function () {
        var password, wrongPassword, encrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    password = "correct-password";
                    wrongPassword = "wrong-password";
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(mockScenario, password)];
                case 1:
                    encrypted = _a.sent();
                    return [4 /*yield*/, (0, vitest_1.expect)((0, crypto_1.decryptScenario)(encrypted, wrongPassword)).rejects.toThrow()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)("preserves header metadata", function () { return __awaiter(void 0, void 0, void 0, function () {
        var password, header, encrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    password = "password";
                    header = {
                        id: "header-id",
                        name: "Header Name",
                        description: "Header Description",
                    };
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(mockScenario, password, { header: header })];
                case 1:
                    encrypted = _a.sent();
                    (0, vitest_1.expect)(encrypted.header).toEqual(header);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)("uses different IV and salt for each encryption", function () { return __awaiter(void 0, void 0, void 0, function () {
        var password, encrypted1, encrypted2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    password = "password";
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(mockScenario, password)];
                case 1:
                    encrypted1 = _a.sent();
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(mockScenario, password)];
                case 2:
                    encrypted2 = _a.sent();
                    (0, vitest_1.expect)(encrypted1.crypto.iv).not.toBe(encrypted2.crypto.iv);
                    (0, vitest_1.expect)(encrypted1.crypto.salt).not.toBe(encrypted2.crypto.salt);
                    (0, vitest_1.expect)(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)("handles scenarios with special characters", function () { return __awaiter(void 0, void 0, void 0, function () {
        var specialScenario, password, encrypted, decrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    specialScenario = __assign(__assign({}, mockScenario), { name: "Scenario with 🚀 and \n newlines and \t tabs and Danish chars æøå" });
                    password = "pæsswørd";
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(specialScenario, password)];
                case 1:
                    encrypted = _a.sent();
                    return [4 /*yield*/, (0, crypto_1.decryptScenario)(encrypted, password)];
                case 2:
                    decrypted = _a.sent();
                    (0, vitest_1.expect)(decrypted).toEqual(specialScenario);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)("fails if ciphertext is tampered with", function () { return __awaiter(void 0, void 0, void 0, function () {
        var password, encrypted, tamperedCiphertext, tamperedEncrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    password = "password";
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(mockScenario, password)];
                case 1:
                    encrypted = _a.sent();
                    tamperedCiphertext = encrypted.ciphertext.substring(0, 10) +
                        (encrypted.ciphertext[10] === "A" ? "B" : "A") +
                        encrypted.ciphertext.substring(11);
                    tamperedEncrypted = __assign(__assign({}, encrypted), { ciphertext: tamperedCiphertext });
                    return [4 /*yield*/, (0, vitest_1.expect)((0, crypto_1.decryptScenario)(tamperedEncrypted, password)).rejects.toThrow()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)("fails if header is tampered with", function () { return __awaiter(void 0, void 0, void 0, function () {
        var password, header, encrypted, tamperedHeader, tamperedEncrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    password = "password";
                    header = {
                        id: "header-id",
                        name: "Header Name",
                        description: "Header Description",
                    };
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(mockScenario, password, { header: header })];
                case 1:
                    encrypted = _a.sent();
                    tamperedHeader = __assign(__assign({}, header), { name: "Tampered Name" });
                    tamperedEncrypted = __assign(__assign({}, encrypted), { header: tamperedHeader });
                    return [4 /*yield*/, (0, vitest_1.expect)((0, crypto_1.decryptScenario)(tamperedEncrypted, password)).rejects.toThrow()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)("fails if version is tampered with", function () { return __awaiter(void 0, void 0, void 0, function () {
        var password, encrypted, tamperedEncrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    password = "password";
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(mockScenario, password)];
                case 1:
                    encrypted = _a.sent();
                    tamperedEncrypted = __assign(__assign({}, encrypted), { version: "9.9.9" });
                    return [4 /*yield*/, (0, vitest_1.expect)((0, crypto_1.decryptScenario)(tamperedEncrypted, password)).rejects.toThrow()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
