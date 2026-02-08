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
exports.encryptScenario = encryptScenario;
exports.decryptScenario = decryptScenario;
var ENCRYPTION_VERSION = "1.0.0";
var DEFAULT_ITERATIONS = 600000;
var SALT_LENGTH = 16;
var IV_LENGTH = 12;
/**
 * Encrypts a Scenario object with a password using AES-GCM.
 *
 * @param scenario - The scenario to encrypt.
 * @param password - The password to use for encryption.
 * @param options - Encryption options.
 * @returns The encrypted scenario object.
 */
function encryptScenario(scenario_1, password_1) {
    return __awaiter(this, arguments, void 0, function (scenario, password, options) {
        var header, salt, iv, key, encoder, plaintext, aad, ciphertextBuffer;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    header = options.header;
                    salt = generateRandomBytes(SALT_LENGTH);
                    iv = generateRandomBytes(IV_LENGTH);
                    return [4 /*yield*/, deriveKey(password, salt, DEFAULT_ITERATIONS)];
                case 1:
                    key = _a.sent();
                    encoder = new TextEncoder();
                    plaintext = encoder.encode(JSON.stringify(scenario));
                    aad = encoder.encode(JSON.stringify({
                        version: ENCRYPTION_VERSION,
                        header: header,
                    }));
                    return [4 /*yield*/, crypto.subtle.encrypt({ name: "AES-GCM", iv: iv, additionalData: aad }, key, plaintext)];
                case 2:
                    ciphertextBuffer = _a.sent();
                    return [2 /*return*/, {
                            type: "ORBAT-mapper-encrypted",
                            version: ENCRYPTION_VERSION,
                            ciphertext: bufferToBase64(ciphertextBuffer),
                            crypto: {
                                algorithm: "AES-GCM",
                                iv: bufferToBase64(iv),
                                salt: bufferToBase64(salt),
                                iterations: DEFAULT_ITERATIONS,
                                keySize: 256,
                            },
                            header: header,
                        }];
            }
        });
    });
}
/**
 * Decrypts an EncryptedScenario object with a password.
 *
 * @param encrypted - The encrypted scenario object.
 * @param password - The password to use for decryption.
 * @returns The decrypted scenario object.
 * @throws Error if decryption fails (e.g., wrong password).
 */
function decryptScenario(encrypted, password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, iv, ciphertext, key, encoder, aad, plaintextBuffer, decoder, json, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = base64ToUint8Array(encrypted.crypto.salt);
                    iv = base64ToUint8Array(encrypted.crypto.iv);
                    ciphertext = base64ToUint8Array(encrypted.ciphertext);
                    return [4 /*yield*/, deriveKey(password, salt, encrypted.crypto.iterations)];
                case 1:
                    key = _a.sent();
                    encoder = new TextEncoder();
                    aad = encoder.encode(JSON.stringify({
                        version: encrypted.version,
                        header: encrypted.header,
                    }));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, crypto.subtle.decrypt({ name: "AES-GCM", iv: iv, additionalData: aad }, key, ciphertext)];
                case 3:
                    plaintextBuffer = _a.sent();
                    decoder = new TextDecoder();
                    json = decoder.decode(plaintextBuffer);
                    return [2 /*return*/, JSON.parse(json)];
                case 4:
                    error_1 = _a.sent();
                    // If this fails, it means either the password is wrong OR the header was tampered with.
                    throw new Error("Decryption failed. Invalid password or data integrity check failed.");
                case 5: return [2 /*return*/];
            }
        });
    });
}
function deriveKey(password, salt, iterations) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, keyMaterial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    return [4 /*yield*/, crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"])];
                case 1:
                    keyMaterial = _a.sent();
                    return [2 /*return*/, crypto.subtle.deriveKey({
                            name: "PBKDF2",
                            salt: salt,
                            iterations: iterations,
                            hash: "SHA-256",
                        }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])];
            }
        });
    });
}
function generateRandomBytes(length) {
    return crypto.getRandomValues(new Uint8Array(length));
}
function bufferToBase64(buffer) {
    var bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    var binary = "";
    var CHUNK_SIZE = 0x8000; // 32KB chunks
    for (var i = 0; i < bytes.length; i += CHUNK_SIZE) {
        var chunk = bytes.subarray(i, i + CHUNK_SIZE);
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
}
function base64ToUint8Array(base64) {
    var binary = atob(base64);
    var len = binary.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
