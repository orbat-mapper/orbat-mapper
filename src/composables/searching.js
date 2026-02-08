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
exports.useScenarioSearch = useScenarioSearch;
exports.useActionSearch = useActionSearch;
var fuzzysort_1 = require("fuzzysort");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
function useScenarioSearch(searchActions) {
    var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), unitActions = _a.unitActions, state = _a.store.state, geo = _a.geo, getUnitById = _a.helpers.getUnitById;
    function searchUnits(query, limitToPosition) {
        if (limitToPosition === void 0) { limitToPosition = false; }
        var q = query.trim();
        if (!q)
            return [];
        var hits = fuzzysort_1.default.go(q, unitActions.units.value, {
            keys: ["name", "shortName"],
        });
        return hits
            .filter(function (h) {
            var _a, _b;
            if (limitToPosition)
                return (_b = (_a = getUnitById(h.obj.id)) === null || _a === void 0 ? void 0 : _a._state) === null || _b === void 0 ? void 0 : _b.location;
            return true;
        })
            .slice(0, 10)
            .map(function (u, i) {
            var parent = u.obj._pid && __assign({}, getUnitById(u.obj._pid));
            if (parent) {
                parent.symbolOptions = unitActions.getCombinedSymbolOptions(parent);
            }
            return {
                name: u.obj.name,
                sidc: u.obj.sidc,
                id: u.obj.id,
                index: i,
                parent: parent,
                highlight: u[0] &&
                    fuzzysort_1.default.highlight(__assign(__assign({}, u[0]), { score: u.score, target: (0, utils_1.htmlTagEscape)(u[0].target) })),
                score: u.score,
                category: "Units",
                symbolOptions: unitActions.getCombinedSymbolOptions(u.obj),
                _state: u.obj._state,
            };
        });
    }
    function searchLayerFeatures(query) {
        var q = query.trim();
        if (!q)
            return [];
        var hits = fuzzysort_1.default.go(q, geo.itemsInfo.value, { key: ["name"] });
        return hits.slice(0, 10).map(function (u, i) {
            return (__assign(__assign({}, u.obj), { highlight: fuzzysort_1.default.highlight(__assign(__assign({}, u), { target: (0, utils_1.htmlTagEscape)(u.target) })), score: u.score, category: "Features" }));
        });
    }
    function searchImageLayers(query) {
        var q = query.trim();
        if (!q)
            return [];
        var hits = fuzzysort_1.default.go(q, geo.mapLayers.value, { key: ["name"] });
        return hits.slice(0, 10).map(function (u, i) {
            return (__assign(__assign({}, u.obj), { index: i, highlight: fuzzysort_1.default.highlight(__assign(__assign({}, u), { target: (0, utils_1.htmlTagEscape)(u.target) })), score: u.score, category: "Map layers" }));
        });
    }
    function searchEvents(query) {
        var q = query.trim();
        if (!q)
            return [];
        var mergedEvents = state.events.map(function (id) { return state.eventMap[id]; });
        var hits = fuzzysort_1.default.go(q, mergedEvents, { key: ["title"] });
        return hits.slice(0, 10).map(function (u, i) {
            return (__assign(__assign({}, u.obj), { index: i, name: u.obj.title, highlight: fuzzysort_1.default.highlight(__assign(__assign({}, u), { target: (0, utils_1.htmlTagEscape)(u.target) })), score: u.score, category: "Events" }));
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
        var unitHits = searchUnits(query);
        var featureHits = searchLayerFeatures(query);
        var imageLayerHits = searchImageLayers(query);
        var eventHits = searchEvents(query);
        var actionHits = searchActions ? searchActions(query) : [];
        var allHits = combineHits([
            unitHits,
            featureHits,
            eventHits,
            imageLayerHits,
            actionHits,
        ]);
        var numberOfHits = unitHits.length +
            featureHits.length +
            eventHits.length +
            imageLayerHits.length +
            actionHits.length;
        return { numberOfHits: numberOfHits, groups: (0, utils_1.groupBy)(allHits, "category") };
    }
    return { search: search };
}
var actionItems = [
    { action: "browseSymbols", label: "Browse symbols" },
    {
        action: "save",
        label: "Save scenario to local storage",
        icon: "save",
    },
    { action: "loadNew", label: "Load scenario", icon: "upload" },
    { action: "createNew", label: "Create new scenario", icon: "add" },
    {
        action: "exportJson",
        label: "Download scenario",
        icon: "download",
    },
    {
        action: "import",
        label: "Import data",
        icon: "upload",
    },
    {
        action: "export",
        label: "Export scenario data",
        icon: "download",
    },
    { action: "addEquipment", label: "Add new equipment", icon: "add" },
    { action: "addPersonnel", label: "Add new personnel category", icon: "add" },
    { action: "exportToClipboard", label: "Copy scenario to clipboard" },
    { action: "addSide", label: "Add side", icon: "add" },
    { action: "addTileJSONLayer", label: "Add TileJSON map layer", icon: "add" },
    { action: "addXYZLayer", label: "Add XYZ map layer", icon: "add" },
    { action: "addImageLayer", label: "Add image layer", icon: "add" },
    { action: "startPlayback", label: "Start playback", icon: "play" },
    { action: "stopPlayback", label: "Pause playback", icon: "pause" },
    { action: "increaseSpeed", label: "Speed up playback", icon: "increaseSpeed" },
    { action: "decreaseSpeed", label: "slow down playback", icon: "decreaseSpeed" },
    { action: "shareAsUrl", label: "Share scenario as URL", icon: "share" },
    { action: "share", label: "Share scenario online", icon: "share" },
];
function useActionSearch() {
    function searchActions(query) {
        var q = query.trim();
        if (!q)
            return [];
        var hits = fuzzysort_1.default.go(q, actionItems, { key: ["label"] });
        return hits.map(function (u, i) {
            return (__assign(__assign({}, u.obj), { id: i, name: u.obj.label, index: i, highlight: fuzzysort_1.default.highlight(__assign(__assign({}, u), { target: (0, utils_1.htmlTagEscape)(u.target) })), score: u.score, category: "Actions" }));
        });
    }
    return {
        searchActions: searchActions,
        actionItems: actionItems.map(function (a, i) { return (__assign(__assign({}, a), { category: "Actions", index: i, id: i, name: a.label, highlight: "", score: 0 })); }),
    };
}
