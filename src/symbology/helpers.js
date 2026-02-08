"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sidItems = void 0;
exports.getNextEchelonBelow = getNextEchelonBelow;
exports.echelonItems = echelonItems;
exports.getFullUnitSidc = getFullUnitSidc;
exports.getCustomSymbolId = getCustomSymbolId;
exports.setSid = setSid;
var values_1 = require("@/symbology/values");
var constants_ts_1 = require("@/config/constants.ts");
var sidc_ts_1 = require("@/symbology/sidc.ts");
var helpers_ts_1 = require("@/components/helpers.ts");
exports.sidItems = values_1.standardIdentityValues.map(function (_a) {
    var code = _a.code, text = _a.text;
    return {
        code: code,
        text: text,
        sidc: "100" + code + 10 + "00" + "00" + "0000000000",
    };
});
function getNextEchelonBelow(echelon) {
    // brigade -> battalion (skip regiment)
    if (echelon === "18")
        return "16";
    var idx = values_1.echelonValues.findIndex(function (e) { return e.code === echelon; });
    if (idx > 0)
        return values_1.echelonValues[idx - 1].code;
    return echelon;
}
function echelonItems(sid) {
    return values_1.echelonValues.map(function (_a) {
        var code = _a.code, text = _a.text;
        return {
            code: code,
            text: text,
            sidc: "100" + sid + "10" + "00" + code + "0000000000",
        };
    });
}
function getFullUnitSidc(sidc) {
    if (sidc.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)) {
        return sidc.slice(constants_ts_1.CUSTOM_SYMBOL_PREFIX.length, constants_ts_1.CUSTOM_SYMBOL_PREFIX.length + 20);
    }
    return sidc;
}
function getCustomSymbolId(sidc) {
    if (sidc.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)) {
        return sidc.slice(constants_ts_1.CUSTOM_SYMBOL_SLICE);
    }
}
function setSid(sidc, sidValue) {
    if (sidc.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)) {
        if (sidc[sidc_ts_1.CUSTOM_SYMBOL_SID_INDEX] !== sidValue) {
            return (0, helpers_ts_1.setCharAt)(sidc, sidc_ts_1.CUSTOM_SYMBOL_SID_INDEX, sidValue);
        }
    }
    else {
        if (sidc[sidc_ts_1.SID_INDEX] !== sidValue) {
            return (0, helpers_ts_1.setCharAt)(sidc, sidc_ts_1.SID_INDEX, sidValue);
        }
    }
    return sidc;
}
