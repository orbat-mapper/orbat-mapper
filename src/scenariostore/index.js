"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoading = void 0;
exports.useScenario = useScenario;
var vue_1 = require("vue");
var unitManipulations_1 = require("./unitManipulations");
var io_1 = require("./io");
var time_1 = require("./time");
var geo_1 = require("@/scenariostore/geo");
var helpers_1 = require("@/scenariostore/helpers");
var settingsManipulations_ts_1 = require("@/scenariostore/settingsManipulations.ts");
var globalStoreRef = (0, vue_1.shallowRef)({});
exports.isLoading = (0, vue_1.ref)(false);
// Todo: add store ref as parameter in case we want to load multiple scenarios.
function useScenario() {
    return {
        scenario: (0, vue_1.computed)(function () {
            return {
                store: globalStoreRef.value,
                unitActions: (0, unitManipulations_1.useUnitManipulations)(globalStoreRef.value),
                time: (0, time_1.useScenarioTime)(globalStoreRef.value),
                io: (0, io_1.useScenarioIO)(globalStoreRef),
                geo: (0, geo_1.useGeo)(globalStoreRef.value),
                helpers: (0, helpers_1.useStateHelpers)(globalStoreRef.value),
                settings: (0, settingsManipulations_ts_1.useScenarioSettings)(globalStoreRef.value),
            };
        }),
        isLoading: exports.isLoading,
        isReady: (0, vue_1.computed)(function () { return !!globalStoreRef.value.state; }),
    };
}
