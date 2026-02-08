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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScenarioSettings = useScenarioSettings;
var utils_1 = require("@/utils");
var klona_1 = require("klona");
var colors_ts_1 = require("@/config/colors.ts");
var constants_ts_1 = require("@/config/constants.ts");
function useScenarioSettings(store) {
    var state = store.state, update = store.update;
    function addColorIfAbsent(code) {
        var existing = __spreadArray(__spreadArray([], colors_ts_1.SYMBOL_FILL_COLORS, true), Object.values(state.symbolFillColorMap), true).find(function (color) { return color.code.toLowerCase() === code.toLowerCase(); });
        if (!existing) {
            addSymbolFillColor({ code: code, text: "Custom color (".concat(code, ")") });
        }
    }
    function addSymbolFillColor(data, _a) {
        var _b;
        var _c = _a === void 0 ? {} : _a, _d = _c.noUndo, noUndo = _d === void 0 ? false : _d, _e = _c.s, s = _e === void 0 ? state : _e;
        var newSymbolFillColor = __assign({ id: (0, utils_1.nanoid)(), text: "Custom color (".concat((_b = data.code) !== null && _b !== void 0 ? _b : "", ")"), code: "#FF0000" }, (0, klona_1.klona)(data));
        if (newSymbolFillColor.id === undefined) {
            newSymbolFillColor.id = (0, utils_1.nanoid)();
        }
        var newId = newSymbolFillColor.id;
        if (noUndo) {
            s.symbolFillColorMap[newId] = newSymbolFillColor;
        }
        else {
            update(function (s) {
                s.symbolFillColorMap[newId] = newSymbolFillColor;
            });
        }
        return newId;
    }
    function updateSymbolFillColor(id, data) {
        update(function (s) {
            var symbolFillColor = s.symbolFillColorMap[id];
            if (!symbolFillColor)
                return;
            Object.assign(symbolFillColor, data);
        });
        state.settingsStateCounter++;
    }
    function deleteSymbolFillColor(id) {
        update(function (s) {
            delete s.symbolFillColorMap[id];
        });
    }
    function deleteCustomSymbol(id) {
        var isUsed = Object.values(state.unitMap).some(function (unit) {
            var _a;
            var customId = ":".concat(id);
            return !!((unit.sidc.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX) && unit.sidc.endsWith(customId)) ||
                ((_a = unit.state) === null || _a === void 0 ? void 0 : _a.some(function (st) { var _a; return ((_a = st.sidc) === null || _a === void 0 ? void 0 : _a.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)) && st.sidc.endsWith(customId); })));
        });
        if (isUsed)
            return false;
        update(function (s) {
            delete s.customSymbolMap[id];
        });
        return true;
    }
    function updateCustomSymbol(id, data) {
        update(function (s) {
            var customSymbol = s.customSymbolMap[id];
            if (!customSymbol)
                return;
            Object.assign(customSymbol, data);
        });
        state.settingsStateCounter++;
    }
    function addCustomSymbol(data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.noUndo, noUndo = _c === void 0 ? false : _c, _d = _b.s, s = _d === void 0 ? state : _d;
        var newCustomSymbol = __assign({ id: (0, utils_1.nanoid)(), name: "Custom Symbol", src: "custom1:xxxxxx", sidc: "10031000001100000000" }, (0, klona_1.klona)(data));
        if (newCustomSymbol.id === undefined) {
            newCustomSymbol.id = (0, utils_1.nanoid)();
        }
        var newId = newCustomSymbol.id;
        if (noUndo) {
            s.customSymbolMap[newId] = newCustomSymbol;
        }
        else {
            update(function (s) {
                s.customSymbolMap[newId] = newCustomSymbol;
            });
        }
        return newCustomSymbol;
    }
    return {
        addSymbolFillColor: addSymbolFillColor,
        updateSymbolFillColor: updateSymbolFillColor,
        deleteSymbolFillColor: deleteSymbolFillColor,
        addColorIfAbsent: addColorIfAbsent,
        deleteCustomSymbol: deleteCustomSymbol,
        updateCustomSymbol: updateCustomSymbol,
        addCustomSymbol: addCustomSymbol,
    };
}
