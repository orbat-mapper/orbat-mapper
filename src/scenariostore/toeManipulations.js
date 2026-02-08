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
exports.useToeManipulations = useToeManipulations;
var utils_1 = require("@/utils");
var klona_1 = require("klona");
var time_1 = require("@/scenariostore/time");
var unitStateManipulations_1 = require("@/scenariostore/unitStateManipulations");
function useToeManipulations(store) {
    var state = store.state, update = store.update, groupUpdate = store.groupUpdate;
    function updateUnitState(unitId) {
        var unit = state.unitMap[unitId];
        if (!unit)
            return;
        var timestamp = state.currentTime;
        (0, time_1.updateCurrentUnitState)(unit, timestamp);
        state.unitStateCounter++;
    }
    function updateEquipment(id, data) {
        update(function (s) {
            var equipment = s.equipmentMap[id];
            if (!equipment)
                return;
            Object.assign(equipment, data);
        });
        state.settingsStateCounter++;
    }
    function addEquipment(data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.noUndo, noUndo = _c === void 0 ? false : _c, _d = _b.s, s = _d === void 0 ? state : _d;
        var newEquipment = __assign({ id: (0, utils_1.nanoid)(), name: "Equipment" }, (0, klona_1.klona)(data));
        if (newEquipment.id === undefined) {
            newEquipment.id = (0, utils_1.nanoid)();
        }
        var newId = newEquipment.id;
        if (noUndo) {
            s.equipmentMap[newId] = newEquipment;
        }
        else {
            update(function (s) {
                s.equipmentMap[newId] = newEquipment;
            });
        }
        return newEquipment;
    }
    function deleteEquipment(id) {
        // check if equipment is used
        var isUsed = Object.values(state.unitMap).some(function (unit) {
            if (unit.equipment) {
                return unit.equipment.some(function (e) { return e.id === id; });
            }
            return false;
        });
        if (isUsed)
            return false;
        update(function (s) {
            delete s.equipmentMap[id];
        });
        return true;
    }
    function addPersonnel(data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.noUndo, noUndo = _c === void 0 ? false : _c, _d = _b.s, s = _d === void 0 ? state : _d;
        var newPersonnel = __assign({ id: (0, utils_1.nanoid)(), name: "Personnel" }, (0, klona_1.klona)(data));
        if (newPersonnel.id === undefined) {
            newPersonnel.id = (0, utils_1.nanoid)();
        }
        var newId = newPersonnel.id;
        if (noUndo) {
            s.personnelMap[newId] = newPersonnel;
        }
        else {
            update(function (s) {
                s.personnelMap[newId] = newPersonnel;
            });
        }
        return newPersonnel;
    }
    function deletePersonnel(id) {
        // check if personnel is used
        var isUsed = Object.values(state.unitMap).some(function (unit) {
            if (unit.personnel) {
                return unit.personnel.some(function (e) { return e.id === id; });
            }
            return false;
        });
        if (isUsed)
            return false;
        update(function (s) {
            delete s.personnelMap[id];
        });
        return true;
    }
    function updatePersonnel(id, data) {
        update(function (s) {
            var personnel = s.personnelMap[id];
            if (!personnel)
                return;
            Object.assign(personnel, data);
        });
    }
    function updateUnitEquipment(unitId, equipmentId, _a) {
        var count = _a.count, onHand = _a.onHand;
        update(function (s) {
            var _a, _b;
            var unit = s.unitMap[unitId];
            if (!unit)
                return;
            if (count === -1) {
                unit.equipment = (_a = unit.equipment) === null || _a === void 0 ? void 0 : _a.filter(function (e) { return e.id !== equipmentId; });
                unit.state = (0, unitStateManipulations_1.removeUnusedUnitStateEntries)(unit);
            }
            else {
                var equipment = (_b = unit.equipment) === null || _b === void 0 ? void 0 : _b.find(function (e) { return e.id === equipmentId; });
                if (!equipment) {
                    if (unit.equipment === undefined)
                        unit.equipment = [];
                    unit.equipment.push({ id: equipmentId, count: count, onHand: onHand });
                }
                else {
                    Object.assign(equipment, { count: count, onHand: onHand });
                }
            }
        });
        updateUnitState(unitId);
    }
    function updateUnitPersonnel(unitId, personnelId, _a) {
        var count = _a.count, onHand = _a.onHand;
        update(function (s) {
            var _a, _b;
            var unit = s.unitMap[unitId];
            if (!unit)
                return;
            if (count === -1) {
                unit.personnel = (_a = unit.personnel) === null || _a === void 0 ? void 0 : _a.filter(function (e) { return e.id !== personnelId; });
                unit.state = (0, unitStateManipulations_1.removeUnusedUnitStateEntries)(unit);
            }
            else {
                var personnel = (_b = unit.personnel) === null || _b === void 0 ? void 0 : _b.find(function (e) { return e.id === personnelId; });
                if (!personnel) {
                    if (unit.personnel === undefined)
                        unit.personnel = [];
                    unit.personnel.push({ id: personnelId, count: count });
                }
                else {
                    Object.assign(personnel, { count: count, onHand: onHand });
                }
            }
        });
        updateUnitState(unitId);
    }
    return {
        updateUnitPersonnel: updateUnitPersonnel,
        updateEquipment: updateEquipment,
        addEquipment: addEquipment,
        updatePersonnel: updatePersonnel,
        addPersonnel: addPersonnel,
        deletePersonnel: deletePersonnel,
        deleteEquipment: deleteEquipment,
        updateUnitEquipment: updateUnitEquipment,
    };
}
