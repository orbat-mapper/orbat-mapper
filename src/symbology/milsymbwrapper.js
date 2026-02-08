"use strict";
/**
 * Custom milsymbol wrapper
 *
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.textAmpMapInv = exports.textAmpMap = void 0;
exports.symbolGenerator = symbolGenerator;
var milsymbol_1 = require("milsymbol");
var customColorMode = milsymbol_1.default.getColorMode("Light");
customColorMode.Friend = "rgb(170, 176, 116)";
var customIconColor = __assign({}, milsymbol_1.default.getColorMode("FrameColor"));
customIconColor.Friend = "rgb(65, 70, 22)";
var cm2 = milsymbol_1.default.getColorMode("Light");
cm2.Friend = cm2.Hostile;
function replaceAt(text, index, replace) {
    return text.substring(0, index) + replace + text.substring(index + 1);
}
function symbolGenerator(sidc, options) {
    if (options === void 0) { options = {}; }
    var opts = options;
    if (sidc[3] === "7") {
        sidc = replaceAt(sidc, 3, "3");
        opts = __assign({ colorMode: __assign({}, customColorMode), frameColor: __assign({}, customIconColor), iconColor: __assign({}, customIconColor) }, options);
    }
    else if (sidc[3] === "8") {
        sidc = replaceAt(sidc, 3, "3");
        opts = __assign({ colorMode: cm2 }, options);
    }
    return new milsymbol_1.default.Symbol(sidc, opts);
}
exports.textAmpMap = {
    C: "quantity",
    F: "reinforcedReduced",
    G: "staffComments",
    H: "additionalInformation",
    J: "evaluationRating",
    K: "combatEffectiveness",
    L: "signatureEquipment",
    M: "higherFormation",
    N: "hostile",
    P: "iffSif",
    Q: "direction",
    R: "quantity",
    T: "uniqueDesignation",
    V: "type",
    W: "dtg",
    X: "altitudeDepth",
    Y: "location",
    Z: "speed",
    AA: "specialHeadquarters",
    AC: "country",
    AD: "platformType",
    AE: "equipmentTeardownTime",
    AF: "commonIdentifier",
    AH: "headquartersElement",
    AP: "targetNumber",
    AQ: "guardedUnit",
    AR: "specialDesignator",
    R2: "sigint",
};
exports.textAmpMapInv = Object.fromEntries(Object.entries(exports.textAmpMap).map(function (_a) {
    var k = _a[0], v = _a[1];
    return [v, k];
}));
