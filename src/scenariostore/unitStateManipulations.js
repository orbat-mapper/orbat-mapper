"use strict";
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
exports.removeUnusedUnitStateEntries = removeUnusedUnitStateEntries;
exports.useUnitStateManipulations = useUnitStateManipulations;
var utils_1 = require("@/utils");
var klona_1 = require("klona");
var time_1 = require("@/scenariostore/time");
function removeUnusedUnitStateEntries(unit) {
    var _a, _b, _c, _d, _e, _f;
    if (!unit || !unit.state)
        return;
    var usedEquipmentIds = new Set((_b = (_a = unit.equipment) === null || _a === void 0 ? void 0 : _a.map(function (e) { return e.id; })) !== null && _b !== void 0 ? _b : []);
    var usedPersonnelIds = new Set((_d = (_c = unit.personnel) === null || _c === void 0 ? void 0 : _c.map(function (e) { return e.id; })) !== null && _d !== void 0 ? _d : []);
    var usedSupplyIds = new Set((_f = (_e = unit.supplies) === null || _e === void 0 ? void 0 : _e.map(function (e) { return e.id; })) !== null && _f !== void 0 ? _f : []);
    var filteredState = unit.state.map(function (state) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var update = state.update;
        var diff = state.diff;
        if (update) {
            update.equipment = (_a = update.equipment) === null || _a === void 0 ? void 0 : _a.filter(function (e) { return usedEquipmentIds.has(e.id); });
            if (((_b = update.equipment) === null || _b === void 0 ? void 0 : _b.length) === 0)
                delete update.equipment;
            update.personnel = (_c = update.personnel) === null || _c === void 0 ? void 0 : _c.filter(function (e) { return usedPersonnelIds.has(e.id); });
            if (((_d = update.personnel) === null || _d === void 0 ? void 0 : _d.length) === 0)
                delete update.personnel;
            update.supplies = (_e = update.supplies) === null || _e === void 0 ? void 0 : _e.filter(function (e) { return usedSupplyIds.has(e.id); });
            if (((_f = update.supplies) === null || _f === void 0 ? void 0 : _f.length) === 0)
                delete update.supplies;
            if (!update.equipment && !update.personnel && !update.supplies) {
                delete state.update;
            }
        }
        if (diff) {
            diff.equipment = (_g = diff.equipment) === null || _g === void 0 ? void 0 : _g.filter(function (e) { return usedEquipmentIds.has(e.id); });
            if (((_h = diff.equipment) === null || _h === void 0 ? void 0 : _h.length) === 0)
                delete diff.equipment;
            diff.personnel = (_j = diff.personnel) === null || _j === void 0 ? void 0 : _j.filter(function (e) { return usedPersonnelIds.has(e.id); });
            if (((_k = diff.personnel) === null || _k === void 0 ? void 0 : _k.length) === 0)
                delete diff.personnel;
            diff.supplies = (_l = diff.supplies) === null || _l === void 0 ? void 0 : _l.filter(function (e) { return usedSupplyIds.has(e.id); });
            if (((_m = diff.supplies) === null || _m === void 0 ? void 0 : _m.length) === 0)
                delete diff.supplies;
            if (!diff.equipment && !diff.personnel && !diff.supplies) {
                delete state.diff;
            }
        }
        return state;
    });
    return filteredState.filter(isNotEmptyState);
}
function isNotEmptyState(state) {
    return (state.update ||
        state.diff ||
        state.location ||
        state.sidc ||
        state.symbolOptions ||
        state.textAmplifiers ||
        state.status ||
        state.reinforcedStatus);
}
function useUnitStateManipulations(store) {
    var state = store.state, update = store.update;
    function updateUnitState(unitId) {
        var unit = state.unitMap[unitId];
        if (!unit)
            return;
        var timestamp = state.currentTime;
        (0, time_1.updateCurrentUnitState)(unit, timestamp);
        state.unitStateCounter++;
    }
    function clearUnitState(unitId) {
        update(function (s) {
            var _unit = s.unitMap[unitId];
            if (!_unit)
                return;
            _unit.state = [];
            _unit._state = (0, time_1.createInitialState)(_unit);
        }, { label: "clearUnitState", value: unitId });
        updateUnitState(unitId);
    }
    function deleteUnitStateEntryByStateId(unitId, stateId) {
        update(function (s) {
            var _a, _b, _c;
            var _unit = s.unitMap[unitId];
            if (!_unit)
                return;
            var index = (_b = (_a = _unit.state) === null || _a === void 0 ? void 0 : _a.findIndex(function (s) { return s.id === stateId; })) !== null && _b !== void 0 ? _b : -1;
            if (index >= 0)
                (_c = _unit.state) === null || _c === void 0 ? void 0 : _c.splice(index, 1);
        });
        updateUnitState(unitId);
    }
    function addUnitStateEntry(unitId, state, merge) {
        if (merge === void 0) { merge = false; }
        update(function (s) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            var u = s.unitMap[unitId];
            var newState = (0, klona_1.klona)(state);
            newState.id = (0, utils_1.nanoid)();
            if (!u.state)
                u.state = [];
            var t = state.t;
            for (var i = 0, len = u.state.length; i < len; i++) {
                if (t <= u.state[i].t) {
                    if (merge && u.state[i].t === t) {
                        var id = newState.id, t_1 = newState.t, update_1 = newState.update, diff = newState.diff, rest = __rest(newState, ["id", "t", "update", "diff"]);
                        Object.assign(u.state[i], rest);
                        if (update_1) {
                            var source = ((_a = u.state[i]) === null || _a === void 0 ? void 0 : _a.update) || {};
                            var dest = {
                                equipment: source.equipment || update_1.equipment
                                    ? (0, utils_1.mergeArray)((_b = source.equipment) !== null && _b !== void 0 ? _b : [], (_c = update_1.equipment) !== null && _c !== void 0 ? _c : [], "id")
                                    : undefined,
                                personnel: source.personnel || update_1.personnel
                                    ? (0, utils_1.mergeArray)((_d = source.personnel) !== null && _d !== void 0 ? _d : [], (_e = update_1.personnel) !== null && _e !== void 0 ? _e : [], "id")
                                    : undefined,
                                supplies: source.supplies || update_1.supplies
                                    ? (0, utils_1.mergeArray)((_f = source.supplies) !== null && _f !== void 0 ? _f : [], (_g = update_1.supplies) !== null && _g !== void 0 ? _g : [], "id")
                                    : undefined,
                            };
                            Object.assign(u.state[i], { update: dest });
                        }
                        if (diff) {
                            var source = ((_h = u.state[i]) === null || _h === void 0 ? void 0 : _h.diff) || {};
                            var dest = {
                                equipment: source.equipment || diff.equipment
                                    ? (0, utils_1.mergeArray)((_j = source.equipment) !== null && _j !== void 0 ? _j : [], (_k = diff.equipment) !== null && _k !== void 0 ? _k : [], "id")
                                    : undefined,
                                personnel: source.personnel || diff.personnel
                                    ? (0, utils_1.mergeArray)((_l = source.personnel) !== null && _l !== void 0 ? _l : [], (_m = diff.personnel) !== null && _m !== void 0 ? _m : [], "id")
                                    : undefined,
                                supplies: source.supplies || diff.supplies
                                    ? (0, utils_1.mergeArray)((_o = source.supplies) !== null && _o !== void 0 ? _o : [], (_p = diff.supplies) !== null && _p !== void 0 ? _p : [], "id")
                                    : undefined,
                            };
                            Object.assign(u.state[i], { diff: dest });
                        }
                    }
                    else {
                        u.state.splice(i, 0, newState);
                    }
                    return;
                }
            }
            u.state.push(newState);
        }, { label: "addUnitPosition", value: unitId });
        updateUnitState(unitId);
    }
    function deleteUnitStateEntry(unitId, index) {
        update(function (s) {
            var _a;
            var _unit = s.unitMap[unitId];
            if (!_unit)
                return;
            (_a = _unit.state) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
        });
        updateUnitState(unitId);
    }
    function updateUnitStateEntry(unitId, index, data) {
        update(function (s) {
            var unit = s.unitMap[unitId];
            if (!(unit === null || unit === void 0 ? void 0 : unit.state))
                return;
            Object.assign(unit.state[index], data);
            unit.state.sort(function (_a, _b) {
                var a = _a.t;
                var b = _b.t;
                return (a < b ? -1 : a > b ? 1 : 0);
            });
        });
        state.unitStateCounter++;
        updateUnitState(unitId);
    }
    function setUnitState(unitId, state) {
        update(function (s) {
            var unit = s.unitMap[unitId];
            if (!unit)
                return;
            unit.state = state;
        });
        updateUnitState(unitId);
    }
    function updateUnitStateVia(unitId, action, stateIndex, elementIndex, data) {
        update(function (s) {
            var unit = s.unitMap[unitId];
            if (!unit || !unit.state)
                return;
            var stateElement = unit.state[stateIndex];
            if (!stateElement)
                return;
            if (!stateElement.via)
                stateElement.via = [];
            if (action === "add") {
                stateElement.via.splice(elementIndex, 0, data);
            }
            else if (action === "modify") {
                stateElement.via[elementIndex] = data;
            }
            else if (action === "remove") {
                stateElement.via.splice(elementIndex, 1);
            }
        }, { label: "addUnitPosition", value: unitId });
    }
    return {
        clearUnitState: clearUnitState,
        updateUnitState: updateUnitState,
        deleteUnitStateEntryByStateId: deleteUnitStateEntryByStateId,
        addUnitStateEntry: addUnitStateEntry,
        deleteUnitStateEntry: deleteUnitStateEntry,
        updateUnitStateEntry: updateUnitStateEntry,
        setUnitState: setUnitState,
        updateUnitStateVia: updateUnitStateVia,
    };
}
