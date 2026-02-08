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
var vitest_1 = require("vitest");
var io_1 = require("./io");
var vue_1 = require("vue");
// Mock the stores that might be used
vitest_1.vi.mock("@/stores/settingsStore", function () { return ({
    useSymbolSettingsStore: function () { return ({ symbologyStandard: "2525" }); },
}); });
function createMinimalState(overrides) {
    if (overrides === void 0) { overrides = {}; }
    return __assign({ id: "test-id", meta: { createdDate: "2024-01-01", lastModifiedDate: "2024-01-01" }, currentTime: 0, info: {
            name: "Test Scenario",
            description: "",
            startTime: 0,
            timeZone: "UTC",
            symbologyStandard: "2525",
        }, sides: [], events: [], layers: [], mapLayers: [], 
        // key maps
        sideMap: {}, sideGroupMap: {}, unitMap: {}, eventMap: {}, featureMap: {}, layerMap: {}, mapLayerMap: {}, equipmentMap: {}, personnelMap: {}, supplyCategoryMap: {}, supplyClassMap: {}, supplyUomMap: {}, rangeRingGroupMap: {}, unitStatusMap: {}, symbolFillColorMap: {}, customSymbolMap: {}, mapSettings: {}, boundingBox: null, 
        // counters
        unitStateCounter: 0, featureStateCounter: 0, settingsStateCounter: 0 }, overrides);
}
(0, vitest_1.describe)("Scenario IO", function () {
    (0, vitest_1.it)("serializes bounding box correctly", function () {
        var _a;
        var state = createMinimalState({
            boundingBox: [10, 20, 30, 40],
        });
        var store = { state: state };
        var storeRef = (0, vue_1.shallowRef)(store);
        var toObject = (0, io_1.useScenarioIO)(storeRef).toObject;
        var serialized = toObject();
        (0, vitest_1.expect)((_a = serialized.settings) === null || _a === void 0 ? void 0 : _a.boundingBox).toEqual([10, 20, 30, 40]);
    });
    (0, vitest_1.it)("handles null bounding box by converting to undefined", function () {
        var _a;
        var state = createMinimalState({
            boundingBox: null,
        });
        var store = { state: state };
        var storeRef = (0, vue_1.shallowRef)(store);
        var toObject = (0, io_1.useScenarioIO)(storeRef).toObject;
        var serialized = toObject();
        (0, vitest_1.expect)((_a = serialized.settings) === null || _a === void 0 ? void 0 : _a.boundingBox).toBeUndefined();
    });
});
