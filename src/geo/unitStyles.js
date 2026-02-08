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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.labelStyleCache = exports.selectedUnitStyleCache = exports.unitStyleCache = void 0;
exports.clearUnitStyleCache = clearUnitStyleCache;
exports.invalidateUnitStyle = invalidateUnitStyle;
exports.createUnitStyle = createUnitStyle;
exports.createUnitLabelData = createUnitLabelData;
var style_1 = require("ol/style");
var milsymbwrapper_1 = require("@/symbology/milsymbwrapper");
var settingsStore_1 = require("@/stores/settingsStore");
var utils_1 = require("@/utils");
var mapSettingsStore_ts_1 = require("@/stores/mapSettingsStore.ts");
var constants_ts_1 = require("@/config/constants.ts");
exports.unitStyleCache = new Map();
exports.selectedUnitStyleCache = new Map();
exports.labelStyleCache = new Map();
function clearUnitStyleCache() {
    exports.unitStyleCache.clear();
    exports.selectedUnitStyleCache.clear();
    exports.labelStyleCache.clear();
}
function invalidateUnitStyle(cacheKey) {
    exports.unitStyleCache.delete(cacheKey);
    exports.selectedUnitStyleCache.delete(cacheKey);
    exports.labelStyleCache.delete(cacheKey);
}
function createMilSymbolStyle(milSymbol) {
    var _a = milSymbol.getAnchor(), x = _a.x, y = _a.y;
    var image = new style_1.Icon({
        scale: 1 / (window.devicePixelRatio || 1),
        anchor: [x, y],
        anchorXUnits: "pixels",
        anchorYUnits: "pixels",
        img: milSymbol.asCanvas(),
    });
    return new style_1.Style({
        image: image,
    });
}
function createCustomSymbolStyle(customSymbol, size, color) {
    var _a;
    var image = new style_1.Icon({
        anchor: (_a = customSymbol.anchor) !== null && _a !== void 0 ? _a : [0.5, 0.5],
        src: customSymbol.src,
        width: size,
        crossOrigin: "anonymous",
        color: color,
    });
    return new style_1.Style({
        image: image,
    });
}
function createUnitStyle(unit, symbolOptions, scenario, color) {
    var _a;
    var _b = unit.name, name = _b === void 0 ? "" : _b, _c = unit.shortName, shortName = _c === void 0 ? "" : _c;
    var sidc = ((_a = unit._state) === null || _a === void 0 ? void 0 : _a.sidc) || unit.sidc;
    var mapSettingsStore = (0, mapSettingsStore_ts_1.useMapSettingsStore)();
    var symbolSettings = (0, settingsStore_1.useSymbolSettingsStore)();
    var _d = unit.textAmplifiers || {}, _e = _d.uniqueDesignation, uniqueDesignation = _e === void 0 ? shortName || name : _e, textAmplifiers = __rest(_d, ["uniqueDesignation"]);
    if (sidc.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)) {
        var customSymbolId = sidc.slice(constants_ts_1.CUSTOM_SYMBOL_SLICE);
        var cacheKey = customSymbolId;
        var customSymbol = scenario.store.state.customSymbolMap[customSymbolId];
        return {
            style: customSymbol
                ? createCustomSymbolStyle(customSymbol, mapSettingsStore.mapIconSize * (mapSettingsStore.mapCustomIconScale || 1.7), color)
                : new style_1.Style(),
            cacheKey: cacheKey,
        };
    }
    var options = __assign(__assign(__assign({ size: mapSettingsStore.mapIconSize * (window.devicePixelRatio || 1), uniqueDesignation: mapSettingsStore.mapUnitLabelBelow ? "" : uniqueDesignation, outlineColor: "white", outlineWidth: 8 }, textAmplifiers), symbolSettings.symbolOptions), symbolOptions);
    var milSymbol = (0, milsymbwrapper_1.symbolGenerator)(sidc, options);
    return {
        style: createMilSymbolStyle(milSymbol),
        cacheKey: sidc + (0, utils_1.hashObject)(options),
    };
}
function createUnitLabelData(unit, unitStyle, _a) {
    var _b, _c, _d, _e, _f;
    var _g = _a === void 0 ? {} : _a, _h = _g.wrapLabels, wrapLabels = _h === void 0 ? true : _h, _j = _g.wrapWidth, wrapWidth = _j === void 0 ? 20 : _j;
    var label = unit.shortName || unit.name || "";
    var anchor = (_c = (_b = unitStyle === null || unitStyle === void 0 ? void 0 : unitStyle.getImage()) === null || _b === void 0 ? void 0 : _b.getAnchor()) !== null && _c !== void 0 ? _c : [0, 0];
    var iconHeight = ((_e = (_d = unitStyle === null || unitStyle === void 0 ? void 0 : unitStyle.getImage()) === null || _d === void 0 ? void 0 : _d.getSize()) === null || _e === void 0 ? void 0 : _e[1]) || 0;
    var scale = ((_f = unitStyle === null || unitStyle === void 0 ? void 0 : unitStyle.getImage()) === null || _f === void 0 ? void 0 : _f.getScale()) || 1;
    var yOffset = (iconHeight - anchor[1]) * scale + 5;
    return {
        yOffset: unitStyle ? yOffset : 20,
        text: wrapLabels ? (0, utils_1.wordWrap)(label, { width: wrapWidth }) : label,
    };
}
