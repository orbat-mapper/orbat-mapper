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
exports.useSymbologySearch = useSymbologySearch;
var fuzzysort_1 = require("fuzzysort");
var utils_1 = require("@/utils");
var symbolData_1 = require("@/composables/symbolData");
function useSymbologySearch(sidValue) {
    var _a = (0, symbolData_1.useSymbologyData)(), searchSymbolRef = _a.searchSymbolRef, searchModifierOneRef = _a.searchModifierOneRef, searchModifierTwoRef = _a.searchModifierTwoRef;
    function searchMainIcons(query) {
        var h = fuzzysort_1.default.go(query, searchSymbolRef.value || [], {
            key: "text",
            limit: 10,
        });
        return h.map(function (e, i) {
            var obj = e.obj, rest = __rest(e, ["obj"]);
            return {
                code: obj.code,
                text: obj.text,
                symbolSet: obj.symbolSet,
                name: obj.name,
                score: e.score,
                category: "Main icon",
                index: i,
                highlight: fuzzysort_1.default.highlight(__assign(__assign({}, rest), { target: (0, utils_1.htmlTagEscape)(rest.target) })) || "",
                sidc: "100" + sidValue.value + e.obj.symbolSet + "0000" + e.obj.code + "0000",
            };
        });
    }
    function searchModifierOne(query) {
        var h = fuzzysort_1.default.go(query, searchModifierOneRef.value || [], {
            key: "text",
            limit: 10,
        });
        return h.map(function (e, i) {
            var obj = e.obj, rest = __rest(e, ["obj"]);
            return {
                code: obj.code,
                text: obj.text,
                symbolSet: obj.symbolSet,
                name: obj.name,
                score: e.score * 10,
                category: "Modifier 1",
                index: i,
                highlight: fuzzysort_1.default.highlight(__assign(__assign({}, rest), { target: (0, utils_1.htmlTagEscape)(rest.target) })) || "",
                sidc: "100" +
                    sidValue.value +
                    e.obj.symbolSet +
                    "0000" +
                    "000000" +
                    e.obj.code +
                    "00",
            };
        });
    }
    function searchModifierTwo(query) {
        var h = fuzzysort_1.default.go(query, searchModifierTwoRef.value || [], {
            key: "text",
            limit: 10,
        });
        return h.map(function (e, i) {
            var obj = e.obj, rest = __rest(e, ["obj"]);
            return {
                code: obj.code,
                text: obj.text,
                symbolSet: obj.symbolSet,
                name: obj.name,
                score: e.score * 10,
                category: "Modifier 2",
                index: i,
                highlight: fuzzysort_1.default.highlight(__assign(__assign({}, rest), { target: (0, utils_1.htmlTagEscape)(rest.target) })) || "",
                sidc: "100" +
                    sidValue.value +
                    e.obj.symbolSet +
                    "0000" +
                    "000000" +
                    "00" +
                    e.obj.code,
            };
        });
    }
    function combineHits(hits) {
        var combinedHits = hits.sort(function (a, b) {
            var _a, _b, _c, _d;
            var scoreA = (_b = (_a = a[0]) === null || _a === void 0 ? void 0 : _a.score) !== null && _b !== void 0 ? _b : 1000;
            var scoreB = (_d = (_c = b[0]) === null || _c === void 0 ? void 0 : _c.score) !== null && _d !== void 0 ? _d : 1000;
            return scoreB - scoreA;
        });
        return __spreadArray([], combinedHits.flat(), true).map(function (e, index) { return (__assign(__assign({}, e), { index: index })); });
    }
    function search(query) {
        var mainIconHits = searchMainIcons(query);
        var modifierOneHits = searchModifierOne(query);
        var modifierTwoHits = searchModifierTwo(query);
        var allHits = combineHits([mainIconHits, modifierOneHits, modifierTwoHits]);
        var numberOfHits = mainIconHits.length + modifierOneHits.length + modifierTwoHits.length;
        return { numberOfHits: numberOfHits, groups: (0, utils_1.groupBy)(allHits, "category") };
    }
    return { search: search };
}
