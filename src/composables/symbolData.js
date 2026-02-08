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
exports.useSymbologyData = useSymbologyData;
exports.useSymbolItems = useSymbolItems;
var vue_1 = require("vue");
var values_1 = require("@/symbology/values");
var sidc_1 = require("@/symbology/sidc");
var settingsStore_1 = require("@/stores/settingsStore");
var scenarioModels_1 = require("@/types/scenarioModels");
var symbology = (0, vue_1.shallowRef)();
var isLoaded = (0, vue_1.ref)(false);
var currentSymbologyStandard = (0, vue_1.ref)();
var searchSymbolRef = (0, vue_1.computed)(function () {
    return (symbology.value &&
        Object.values(symbology.value)
            .map(function (ss) {
            return ss.mainIcon.map(function (e) { return (__assign({ symbolSet: ss.symbolSet, name: ss.name }, e)); });
        })
            .flat()
            .filter(function (e) {
            return e.symbolSet === values_1.CONTROL_MEASURE_SYMBOLSET_VALUE ? e.geometry === "Point" : true;
        })
            .map(function (e) {
            var entity = e.entity, entityType = e.entityType, entitySubtype = e.entitySubtype;
            var text = [entity, entityType, entitySubtype].filter(function (e) { return e; }).join(" - ");
            return __assign(__assign({}, e), { text: text.replaceAll("/", " / ") });
        }));
});
var searchModifierOneRef = (0, vue_1.computed)(function () {
    return (symbology.value &&
        Object.values(symbology.value)
            .map(function (ss) {
            return ss.modifierOne.map(function (e) { return (__assign({ symbolSet: ss.symbolSet, name: ss.name }, e)); });
        })
            .flat()
            .map(function (e) {
            return __assign(__assign({}, e), { text: e.modifier });
        }));
});
var searchModifierTwoRef = (0, vue_1.computed)(function () {
    return (symbology.value &&
        Object.values(symbology.value)
            .map(function (ss) {
            return ss.modifierTwo.map(function (e) { return (__assign({ symbolSet: ss.symbolSet, name: ss.name }, e)); });
        })
            .flat()
            .map(function (e) {
            return __assign(__assign({}, e), { text: e.modifier });
        }));
});
function useSymbologyData() {
    function loadData() {
        return __awaiter(this, void 0, void 0, function () {
            var settingsStore, app6d, ms2525d;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settingsStore = (0, settingsStore_1.useSymbolSettingsStore)();
                        if (symbology.value &&
                            currentSymbologyStandard.value === settingsStore.symbologyStandard) {
                            return [2 /*return*/];
                        }
                        isLoaded.value = false;
                        if (!(settingsStore.symbologyStandard === "app6")) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../symbology/standards/app6d"); })];
                    case 1:
                        app6d = (_a.sent()).app6d;
                        symbology.value = app6d;
                        currentSymbologyStandard.value = "app6";
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, Promise.resolve().then(function () { return require("../symbology/standards/milstd2525"); })];
                    case 3:
                        ms2525d = (_a.sent()).ms2525d;
                        symbology.value = ms2525d;
                        currentSymbologyStandard.value = "2525";
                        _a.label = 4;
                    case 4:
                        isLoaded.value = true;
                        return [2 /*return*/];
                }
            });
        });
    }
    return {
        isLoaded: isLoaded,
        symbology: symbology,
        loadData: loadData,
        searchSymbolRef: searchSymbolRef,
        searchModifierOneRef: searchModifierOneRef,
        searchModifierTwoRef: searchModifierTwoRef,
    };
}
function useSymbolItems(sidc, reinforcedReduced) {
    var _a = useSymbolValues(sidc, reinforcedReduced), symbolSetValue = _a.symbolSetValue, sidValue = _a.sidValue, statusValue = _a.statusValue, hqtfdValue = _a.hqtfdValue, csidc = _a.csidc, iconValue = _a.iconValue, emtValue = _a.emtValue, mod1Value = _a.mod1Value, mod2Value = _a.mod2Value, reinforcedReducedValue = _a.reinforcedReducedValue;
    var _b = useSymbologyData(), symbology = _b.symbology, isLoaded = _b.isLoaded, loadData = _b.loadData, searchSymbolRef = _b.searchSymbolRef, searchModifierOneRef = _b.searchModifierOneRef, searchModifierTwoRef = _b.searchModifierTwoRef;
    var symbolSets = (0, vue_1.computed)(function () {
        var symbSets = Object.entries(symbology.value || {}).map(function (_a) {
            var k = _a[0], v = _a[1];
            var iconValue = k === values_1.CONTROL_MEASURE_SYMBOLSET_VALUE ? "00001602050000" : "00000000000000";
            return {
                code: k,
                text: v.name,
                sidc: "100" + sidValue.value + k + iconValue,
            };
        });
        symbSets.sort(function (a, b) { return +a.code - +b.code; });
        return symbSets;
    });
    var statusItems = (0, vue_1.computed)(function () {
        return values_1.statusValues.map(function (_a) {
            var code = _a.code, text = _a.text;
            return ({
                code: code,
                text: text,
                sidc: "100" + sidValue.value + symbolSetValue.value + code + "0000000000000",
            });
        });
    });
    var reinforcedReducedItems = (0, vue_1.computed)(function () {
        return [
            {
                code: "None",
                text: "Not Applicable",
                symbolOptions: {},
            },
            {
                code: "Reinforced",
                text: "Reinforced",
                symbolOptions: { reinforcedReduced: (0, scenarioModels_1.mapReinforcedStatus2Field)("Reinforced") },
            },
            {
                code: "Reduced",
                text: "Reduced",
                symbolOptions: { reinforcedReduced: (0, scenarioModels_1.mapReinforcedStatus2Field)("Reduced") },
            },
            {
                code: "ReinforcedReduced",
                text: "Reinforced and reduced",
                symbolOptions: {
                    reinforcedReduced: (0, scenarioModels_1.mapReinforcedStatus2Field)("ReinforcedReduced"),
                },
            },
        ].map(function (_a) {
            var code = _a.code, text = _a.text, symbolOptions = _a.symbolOptions;
            return ({
                code: code,
                text: text,
                symbolOptions: symbolOptions,
                sidc: "100" + sidValue.value + symbolSetValue.value + "000000000000000",
            });
        });
    });
    var hqtfdItems = (0, vue_1.computed)(function () {
        return values_1.HQTFDummyValues.map(function (_a) {
            var code = _a.code, text = _a.text;
            return ({
                code: code,
                text: text,
                sidc: "100" + sidValue.value + symbolSetValue.value + "0" + code + "000000000000",
            });
        });
    });
    var icons = (0, vue_1.computed)(function () {
        var _a;
        if (!isLoaded.value)
            return [];
        var symbolSetCode = symbolSetValue.value || "01";
        var mis = ((_a = (symbology.value || {})[symbolSetCode]) === null || _a === void 0 ? void 0 : _a.mainIcon) || [];
        if (symbolSetCode === values_1.CONTROL_MEASURE_SYMBOLSET_VALUE)
            mis = mis.filter(function (v) { return v.geometry === "Point"; });
        return mis.map(function (mi) {
            var text = mi.entity;
            if (mi.entityType)
                text += " - " + mi.entityType;
            if (mi.entitySubtype)
                text += " - " + mi.entitySubtype;
            return {
                code: mi.code,
                text: text,
                sidc: "100" + sidValue.value + symbolSetCode + "0000" + mi.code + "0000",
                entity: mi.entity,
                entityType: mi.entityType,
                entitySubtype: mi.entitySubtype,
            };
        });
    });
    var emtItems = (0, vue_1.computed)(function () {
        var values;
        switch (symbolSetValue.value) {
            case values_1.UNIT_SYMBOLSET_VALUE:
                values = values_1.echelonValues;
                break;
            case values_1.EQUIPMENT_SYMBOLSET_VALUE:
                values = values_1.mobilityValues;
                break;
            case values_1.DISMOUNTED_SYMBOLSET_VALUE:
                values = values_1.leadershipValues;
                break;
            case values_1.SURFACE_SYMBOLSET_VALUE:
            case values_1.SUBSURFACE_SYMBOLSET_VALUE:
                values = values_1.towedArrayValues;
                break;
            default:
                values = [{ code: "00", text: "Unspecified" }];
        }
        return values.map(function (_a) {
            var code = _a.code, text = _a.text;
            return {
                code: code,
                text: text,
                sidc: "100" + sidValue.value + symbolSetValue.value + "00" + code + "0000000000",
            };
        });
    });
    var mod1Items = (0, vue_1.computed)(function () {
        var _a;
        if (!symbology.value)
            return [];
        return (((_a = symbology.value[symbolSetValue.value]) === null || _a === void 0 ? void 0 : _a.modifierOne.map(function (_a) {
            var code = _a.code, modifier = _a.modifier;
            return {
                code: code,
                text: modifier,
                sidc: "100" + sidValue.value + symbolSetValue.value + "0000000000" + code + "00",
            };
        })) || []);
    });
    var mod2Items = (0, vue_1.computed)(function () {
        var _a;
        if (!symbology.value)
            return [];
        return (((_a = symbology.value[symbolSetValue.value]) === null || _a === void 0 ? void 0 : _a.modifierTwo.map(function (_a) {
            var code = _a.code, modifier = _a.modifier;
            return {
                code: code,
                text: modifier,
                sidc: "100" + sidValue.value + symbolSetValue.value + "0000000000" + "00" + code,
            };
        })) || []);
    });
    return {
        symbolSets: symbolSets,
        icons: icons,
        sidValue: sidValue,
        symbolSetValue: symbolSetValue,
        iconValue: iconValue,
        statusValue: statusValue,
        statusItems: statusItems,
        hqtfdItems: hqtfdItems,
        hqtfdValue: hqtfdValue,
        emtValue: emtValue,
        emtItems: emtItems,
        mod1Value: mod1Value,
        mod2Value: mod2Value,
        mod1Items: mod1Items,
        mod2Items: mod2Items,
        csidc: csidc,
        isLoaded: isLoaded,
        loadData: loadData,
        searchSymbolRef: searchSymbolRef,
        searchModifierOneRef: searchModifierOneRef,
        searchModifierTwoRef: searchModifierTwoRef,
        reinforcedReducedItems: reinforcedReducedItems,
        reinforcedReducedValue: reinforcedReducedValue,
    };
}
function useSymbolValues(sidc, reinforcedReduced) {
    var sidcObj = new sidc_1.Sidc(sidc.value);
    var sidValue = (0, vue_1.ref)(sidcObj.standardIdentity);
    var symbolSetValue = (0, vue_1.ref)(sidcObj.symbolSet);
    var statusValue = (0, vue_1.ref)(sidcObj.status);
    var hqtfdValue = (0, vue_1.ref)(sidcObj.hqtfd);
    var iconValue = (0, vue_1.ref)(sidcObj.entity + sidcObj.entityType + sidcObj.entitySubType);
    var emtValue = (0, vue_1.ref)(sidcObj.emt);
    var mod1Value = (0, vue_1.ref)(sidcObj.modifierOne);
    var mod2Value = (0, vue_1.ref)(sidcObj.modifierTwo);
    var reinforcedReducedValue = (0, vue_1.ref)(reinforcedReduced !== null && reinforcedReduced !== void 0 ? reinforcedReduced : "None");
    function setValues(value) {
        var sidcObj = new sidc_1.Sidc(value);
        sidValue.value = sidcObj.standardIdentity;
        symbolSetValue.value = sidcObj.symbolSet;
        statusValue.value = sidcObj.status;
        hqtfdValue.value = sidcObj.hqtfd;
        iconValue.value = sidcObj.entity + sidcObj.entityType + sidcObj.entitySubType;
        emtValue.value = sidcObj.emt;
        mod1Value.value = sidcObj.modifierOne;
        mod2Value.value = sidcObj.modifierTwo;
    }
    (0, vue_1.watch)(sidc, function (value) {
        setValues(value);
    });
    var csidc = (0, vue_1.computed)({
        get: function () {
            return ("100" +
                sidValue.value +
                symbolSetValue.value +
                statusValue.value +
                hqtfdValue.value +
                emtValue.value +
                iconValue.value +
                mod1Value.value +
                mod2Value.value);
        },
        set: function (newValue) {
            setValues(newValue);
        },
    });
    return {
        sidValue: sidValue,
        symbolSetValue: symbolSetValue,
        statusValue: statusValue,
        hqtfdValue: hqtfdValue,
        iconValue: iconValue,
        emtValue: emtValue,
        mod1Value: mod1Value,
        mod2Value: mod2Value,
        csidc: csidc,
        reinforcedReducedValue: reinforcedReducedValue,
    };
}
