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
exports.imageCache = void 0;
exports.clearCache = clearCache;
exports.guessImportFormat = guessImportFormat;
exports.arrayBufferToString = arrayBufferToString;
exports.unzip = unzip;
exports.imageCache = new Map();
function clearCache() {
    exports.imageCache.forEach(function (value) {
        URL.revokeObjectURL(value);
    });
    exports.imageCache.clear();
}
function guessImportFormat(file) {
    return __awaiter(this, void 0, void 0, function () {
        var guess, unzipped, e_1, f, kmz, _a, text, e_2, json, geojsonProps, delimiter;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    guess = {
                        format: "unknown",
                        dialect: "unknown",
                        isZipped: false,
                        isJson: false,
                        hasMultipleFiles: false,
                        dataAsString: "Unknown data",
                        isInvalid: false,
                        errors: [],
                        objectUrl: "",
                        fileName: file.name,
                        fileSize: file.size,
                    };
                    if (!hasZippedFileType(file)) return [3 /*break*/, 5];
                    guess.isZipped = true;
                    unzipped = void 0;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, readZippedFile(file)];
                case 2:
                    unzipped = _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _d.sent();
                    console.error(e_1);
                    guess.isInvalid = true;
                    guess.errors.push("Failed to unzip file: ".concat(e_1));
                    return [2 /*return*/, guess];
                case 4:
                    f = Object.entries(unzipped).find(function (_a) {
                        var filename = _a[0];
                        return filename.endsWith(".milxly");
                    });
                    if (f) {
                        guess.format = "milx";
                        guess.dataAsString = arrayBufferToString(f[1]);
                        return [2 /*return*/, guess];
                    }
                    kmz = Object.entries(unzipped).find(function (_a) {
                        var filename = _a[0];
                        return filename.endsWith(".kml");
                    });
                    if (kmz) {
                        guess.format = "kml";
                        guess.dataAsString = arrayBufferToString(kmz[1]);
                        guess.objectUrl = URL.createObjectURL(new Blob([kmz[1]], { type: "application/vnd.google-earth.kml+xml" }));
                        Object.entries(unzipped).forEach(function (_a) {
                            var filename = _a[0], data = _a[1];
                            if (!filename.endsWith(".kml")) {
                                exports.imageCache.set(filename, URL.createObjectURL(new Blob([data])));
                            }
                        });
                        return [2 /*return*/, guess];
                    }
                    return [3 /*break*/, 8];
                case 5:
                    if (!hasImageFileType(file)) return [3 /*break*/, 6];
                    guess.format = "image";
                    guess.dataAsString = file.name;
                    guess.objectUrl = URL.createObjectURL(file);
                    return [2 /*return*/, guess];
                case 6:
                    if (!isSpreadsheetFileType(file)) return [3 /*break*/, 8];
                    guess.format = "xlsx";
                    _a = guess;
                    return [4 /*yield*/, file.arrayBuffer()];
                case 7:
                    _a.dataAsArrayBuffer = _d.sent();
                    return [2 /*return*/, guess];
                case 8:
                    _d.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, file.text()];
                case 9:
                    text = _d.sent();
                    return [3 /*break*/, 11];
                case 10:
                    e_2 = _d.sent();
                    guess.isInvalid = true;
                    guess.errors.push("Could not read file as text");
                    console.error(e_2);
                    return [2 /*return*/, guess];
                case 11:
                    if (isKMFileType(file)) {
                        guess.format = "kml";
                        guess.dataAsString = text;
                        guess.objectUrl = URL.createObjectURL(file);
                        return [2 /*return*/, guess];
                    }
                    // is it json
                    try {
                        json = JSON.parse(text);
                        guess.isJson = true;
                        guess.dataAsString = text;
                        if (isOrbatMapperScenario(json)) {
                            guess.format = "orbatmapper";
                        }
                        else if (isOrbatMapperEncryptedScenario(json)) {
                            guess.format = "orbatmapper-encrypted";
                        }
                        else if (isFeatureCollection(json)) {
                            guess.format = "geojson";
                            geojsonProps = (_c = (_b = json.features[0]) === null || _b === void 0 ? void 0 : _b.properties) !== null && _c !== void 0 ? _c : {};
                            if ("uniqueDesignation" in geojsonProps ||
                                "datetime" in geojsonProps ||
                                "drawable" in geojsonProps) {
                                guess.dialect = "geojson-unitgenerator";
                            }
                        }
                        else if (isGeoJsonFeature(json)) {
                            guess.format = "geojson";
                        }
                        else if (json.options && json.subOrganizations) {
                            guess.format = "unitgenerator";
                        }
                        else if (Array.isArray(json) && Array.isArray(json[0]) && json[0].length >= 6) {
                            guess.format = "orbatgenerator";
                        }
                    }
                    catch (_e) {
                        // ignore
                    }
                    if (guess.isJson)
                        return [2 /*return*/, guess];
                    delimiter = detectDelimiter(text);
                    if (delimiter === "\t") {
                        guess.format = "tsv";
                        guess.dataAsString = text;
                        return [2 /*return*/, guess];
                    }
                    else if (delimiter === ",") {
                        guess.format = "csv";
                        guess.dataAsString = text;
                        return [2 /*return*/, guess];
                    }
                    // Fallback to extension check if delimiter detection is inconclusive
                    if (isCsvFileType(file)) {
                        guess.format = "csv";
                        guess.dataAsString = text;
                        return [2 /*return*/, guess];
                    }
                    if (isTsvFileType(file)) {
                        guess.format = "tsv";
                        guess.dataAsString = text;
                        return [2 /*return*/, guess];
                    }
                    return [2 /*return*/, guess];
            }
        });
    });
}
function detectDelimiter(text) {
    var lines = text.split(/\r?\n/).filter(function (line) { return line.trim() !== ""; });
    if (lines.length === 0)
        return null;
    var sampleSize = Math.min(lines.length, 10);
    var commaScore = 0;
    var tabScore = 0;
    for (var i = 0; i < sampleSize; i++) {
        var line = lines[i];
        var commas = (line.match(/,/g) || []).length;
        var tabs = (line.match(/\t/g) || []).length;
        if (commas > tabs && commas > 0)
            commaScore++;
        if (tabs > commas && tabs > 0)
            tabScore++;
    }
    if (tabScore > commaScore)
        return "\t";
    if (commaScore > tabScore)
        return ",";
    return null;
}
function isGeoJsonFeature(json) {
    return (typeof json === "object" && json !== null && "type" in json && json.type === "Feature");
}
function isFeatureCollection(json) {
    return (typeof json === "object" &&
        json !== null &&
        "type" in json &&
        json.type === "FeatureCollection");
}
function isOrbatMapperScenario(json) {
    if (typeof json === "object" &&
        json !== null &&
        "type" in json &&
        json.type === "ORBAT-mapper") {
        if ("sides" in json && Array.isArray(json.sides)) {
            return true;
        }
    }
    return false;
}
function isOrbatMapperEncryptedScenario(json) {
    return (typeof json === "object" &&
        json !== null &&
        "type" in json &&
        json.type === "ORBAT-mapper-encrypted");
}
function hasZippedFileType(file) {
    var zippedTypes = ["application/vnd.google-earth.kmz", "application/zip"];
    if (zippedTypes.includes(file.type))
        return true;
    if (file.name.endsWith(".kmz"))
        return true;
    if (file.name.endsWith(".odin"))
        return true;
    return file.name.endsWith(".milxlyz");
}
function isKMFileType(file) {
    var kmlTypes = ["application/vnd.google-earth.kml+xml"];
    if (kmlTypes.includes(file.type))
        return true;
    return file.name.endsWith(".kml");
}
function hasImageFileType(file) {
    return file.type.startsWith("image/");
}
function isSpreadsheetFileType(file) {
    var xlsxTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (xlsxTypes.includes(file.type))
        return true;
    return file.name.endsWith(".xlsx");
}
function isCsvFileType(file) {
    return file.type === "text/csv" || file.name.endsWith(".csv");
}
function isTsvFileType(file) {
    return file.type === "text/tab-separated-values" || file.name.endsWith(".tsv");
}
function arrayBufferToString(arrayBuffer, decoderType) {
    if (decoderType === void 0) { decoderType = "utf-8"; }
    var decoder = new TextDecoder(decoderType);
    return decoder.decode(arrayBuffer);
}
function unzip(file) {
    return __awaiter(this, void 0, void 0, function () {
        var fflate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("fflate"); })];
                case 1:
                    fflate = _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            fflate.unzip(new Uint8Array(file), function (err, res) {
                                if (err)
                                    return reject(err);
                                resolve(res);
                            });
                        })];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function readZippedFile(file) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, file.arrayBuffer()];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, unzip(data)];
            }
        });
    });
}
