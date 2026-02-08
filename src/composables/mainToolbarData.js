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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToolbarUnitSymbolData = useToolbarUnitSymbolData;
exports.useActiveSidc = useActiveSidc;
var vue_1 = require("vue");
var values_1 = require("@/symbology/values");
var sidc_1 = require("@/symbology/sidc");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var dragStore_1 = require("@/stores/dragStore");
var landIcons = [
    { symbolSet: "10", code: "121100", text: "Infantry" },
    { symbolSet: "10", code: "121102", text: "Mechanized Infantry" },
    { symbolSet: "10", code: "121300", text: "Scout" },
    { symbolSet: "10", code: "130300", text: "Artillery" },
    { symbolSet: "10", code: "120500", text: "Armor" },
    { symbolSet: "10", code: "160600", text: "Combat Service Support" },
    { symbolSet: "10", code: "130100", text: "Air Defense" },
    { symbolSet: "10", code: "140700", text: "Engineer" },
];
var seaIcons = [
    { symbolSet: "30", code: "110000", text: "Military" },
    { symbolSet: "30", code: "120100", text: "Carrier" },
    { symbolSet: "30", code: "120204", text: "Frigate" },
    { symbolSet: "30", code: "120300", text: "Amphibious Warfare Ship" },
    { symbolSet: "30", code: "120500", text: "Patrol Boat" },
    { symbolSet: "35", code: "110100", text: "Submarine" },
    { symbolSet: "35", code: "130100", text: "Torpedo" },
];
var airIcons = [
    { symbolSet: "01", code: "110100", text: "Fixed Wing" },
    { symbolSet: "01", code: "110104", text: "Fighter" },
    { symbolSet: "01", code: "110103", text: "Bomber" },
    { symbolSet: "01", code: "110200", text: "Rotary Wing" },
    { symbolSet: "02", code: "110000", text: "Missile" },
];
var symbolPage = (0, vue_1.ref)("land");
var currentSid = (0, vue_1.ref)(values_1.SID.Friend);
var currentEchelon = (0, vue_1.ref)("16");
var customIcon = (0, vue_1.ref)({ code: "10031000141211000000", text: "Infantry" });
var activeSidc = (0, vue_1.ref)("10031000141211000000");
function useToolbarUnitSymbolData() {
    var _a;
    var emtStore = (_a = {}, _a[values_1.UNIT_SYMBOLSET_VALUE] = "16", _a);
    var symbolSetValue = (0, vue_1.computed)(function () { return new sidc_1.Sidc(activeSidc.value).symbolSet; });
    function mapSymbolCode(_a) {
        var code = _a.code, text = _a.text, symbolSet = _a.symbolSet;
        return {
            code: code,
            text: text,
            sidc: "100" + currentSid.value + symbolSet + "00" + "00" + code + "0000",
        };
    }
    var iconItems = (0, vue_1.computed)(function () {
        switch (symbolPage.value) {
            case "land":
                return landIcons.map(mapSymbolCode);
            case "sea":
                return seaIcons.map(mapSymbolCode);
            case "air":
                return airIcons.map(mapSymbolCode);
        }
        return [];
    });
    var seaItems = (0, vue_1.computed)(function () { return seaIcons.map(mapSymbolCode); });
    var echelonSidc = (0, vue_1.computed)(function () {
        return "100" +
            currentSid.value +
            symbolSetValue.value +
            "00" +
            currentEchelon.value +
            "0000000000";
    });
    var customSidc = (0, vue_1.computed)(function () {
        var parsedSidc = new sidc_1.Sidc(customIcon.value.code);
        parsedSidc.standardIdentity = currentSid.value;
        parsedSidc.emt = "00";
        parsedSidc.hqtfd = "0";
        return parsedSidc.toString();
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
                sidc: "100" + currentSid.value + symbolSetValue.value + "00" + code + "0000000000",
            };
        });
    });
    (0, vue_1.watch)(symbolSetValue, function (newSymbolSet, oldSymbolSet) {
        emtStore[oldSymbolSet] = currentEchelon.value;
        currentEchelon.value = emtStore[newSymbolSet] || "00";
    });
    return {
        currentSid: currentSid,
        currentEchelon: currentEchelon,
        activeSidc: activeSidc,
        iconItems: iconItems,
        echelonSidc: echelonSidc,
        customSidc: customSidc,
        customIcon: customIcon,
        emtItems: emtItems,
        seaItems: seaItems,
        symbolPage: symbolPage,
    };
}
function useActiveSidc() {
    var unitActions = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).unitActions;
    var activeParent = (0, dragStore_1.useActiveUnitStore)().activeParent;
    var sidc = (0, vue_1.computed)(function () {
        var sidcObj = new sidc_1.Sidc(activeSidc.value);
        sidcObj.emt = currentEchelon.value;
        sidcObj.standardIdentity = currentSid.value;
        return sidcObj.toString();
    });
    var symbolOptions = (0, vue_1.computed)(function () {
        return activeParent.value
            ? __assign({}, unitActions.getCombinedSymbolOptions(activeParent.value, true)) : {};
    });
    return { sidc: sidc, symbolOptions: symbolOptions };
}
