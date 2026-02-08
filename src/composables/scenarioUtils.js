"use strict";
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
exports.useActiveScenario = useActiveScenario;
exports.useRootUnits = useRootUnits;
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
function useActiveScenario() {
    var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
    return activeScenario;
}
function useRootUnits() {
    var _a = useActiveScenario(), state = _a.store.state, unitActions = _a.unitActions;
    var rootUnitItems = (0, vue_1.computed)(function () {
        var getUnitItems = function (map) {
            return Object.values(map)
                .flatMap(function (value) { return value.subUnits; })
                .map(function (id) {
                var u = state.unitMap[id];
                return {
                    text: u.name,
                    code: u.id,
                    sidc: u.sidc,
                    symbolOptions: unitActions.getCombinedSymbolOptions(u),
                };
            });
        };
        return __spreadArray(__spreadArray([], getUnitItems(state.sideMap), true), getUnitItems(state.sideGroupMap), true);
    });
    var groupedRootUnitItems = (0, vue_1.computed)(function () {
        var groups = [];
        var mapUnit = function (unitId) {
            var unit = state.unitMap[unitId];
            return {
                text: unit.name,
                code: unit.id,
                sidc: unit.sidc,
                symbolOptions: unitActions.getCombinedSymbolOptions(unit),
            };
        };
        Object.values(state.sideMap).forEach(function (side) {
            var _a;
            if (!((_a = side.subUnits) === null || _a === void 0 ? void 0 : _a.length))
                return;
            groups.push({
                name: side.name,
                items: side.subUnits.map(mapUnit),
            });
        });
        Object.values(state.sideGroupMap).forEach(function (group) {
            var _a;
            if (!((_a = group.subUnits) === null || _a === void 0 ? void 0 : _a.length))
                return;
            var name = group.name;
            if (group._pid) {
                var side = state.sideMap[group._pid];
                if (side) {
                    name = "".concat(side.name, " > ").concat(group.name);
                }
            }
            groups.push({
                name: name,
                items: group.subUnits.map(mapUnit),
            });
        });
        return groups;
    });
    return { rootUnitItems: rootUnitItems, groupedRootUnitItems: groupedRootUnitItems };
}
