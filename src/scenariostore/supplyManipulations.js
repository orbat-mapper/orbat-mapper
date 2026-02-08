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
exports.useSupplyManipulations = useSupplyManipulations;
exports.getUom = getUom;
exports.getSupplyClass = getSupplyClass;
var utils_1 = require("@/utils");
var klona_1 = require("klona");
var time_1 = require("@/scenariostore/time");
var unitStateManipulations_1 = require("@/scenariostore/unitStateManipulations");
function useSupplyManipulations(store) {
    var state = store.state, update = store.update;
    function updateUnitState(unitId) {
        var unit = state.unitMap[unitId];
        if (!unit)
            return;
        var timestamp = state.currentTime;
        (0, time_1.updateCurrentUnitState)(unit, timestamp);
        state.unitStateCounter++;
    }
    function addSupplyClass(data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.noUndo, noUndo = _c === void 0 ? false : _c, _d = _b.s, s = _d === void 0 ? state : _d;
        var newSupplyClass = __assign({ id: (0, utils_1.nanoid)(), name: "Supply Class" }, (0, klona_1.klona)(data));
        if (newSupplyClass.id === undefined) {
            newSupplyClass.id = (0, utils_1.nanoid)();
        }
        var newId = newSupplyClass.id;
        if (noUndo) {
            s.supplyClassMap[newId] = newSupplyClass;
        }
        else {
            update(function (s) {
                s.supplyClassMap[newId] = newSupplyClass;
            });
        }
        return newId;
    }
    function updateSupplyClass(id, data) {
        update(function (s) {
            var supplyClass = s.supplyClassMap[id];
            if (!supplyClass)
                return;
            Object.assign(supplyClass, data);
        });
        state.settingsStateCounter++;
    }
    function addSupplyCategory(data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.noUndo, noUndo = _c === void 0 ? false : _c, _d = _b.s, s = _d === void 0 ? state : _d;
        var newSupplyCategory = __assign({ id: (0, utils_1.nanoid)(), name: "Supply" }, (0, klona_1.klona)(data));
        if (newSupplyCategory.id === undefined) {
            newSupplyCategory.id = (0, utils_1.nanoid)();
        }
        var newId = newSupplyCategory.id;
        if (noUndo) {
            s.supplyCategoryMap[newId] = newSupplyCategory;
        }
        else {
            update(function (s) {
                s.supplyCategoryMap[newId] = newSupplyCategory;
            });
        }
        return newSupplyCategory;
    }
    function updateSupplyCategory(id, data) {
        update(function (s) {
            var supplyCategory = s.supplyCategoryMap[id];
            if (!supplyCategory)
                return;
            Object.assign(supplyCategory, data);
        });
        state.settingsStateCounter++;
    }
    function deleteSupplyClass(id) {
        // check if supply class is used
        var isUsed = Object.values(state.supplyCategoryMap).some(function (sc) { return sc.supplyClass === id; });
        if (isUsed)
            return false;
        update(function (s) {
            delete s.supplyClassMap[id];
        });
        return true;
    }
    function deleteSupplyCategory(id) {
        // check if supply category is used
        var isUsed = Object.values(state.unitMap).some(function (unit) { var _a; return (_a = unit.supplies) === null || _a === void 0 ? void 0 : _a.some(function (e) { return e.id === id; }); });
        if (isUsed)
            return false;
        update(function (s) {
            delete s.supplyCategoryMap[id];
        });
        return true;
    }
    function updateUnitSupply(unitId, supplyId, _a) {
        var count = _a.count, onHand = _a.onHand;
        update(function (s) {
            var _a, _b;
            var unit = s.unitMap[unitId];
            if (!unit)
                return;
            if (count === -1) {
                unit.supplies = (_a = unit.supplies) === null || _a === void 0 ? void 0 : _a.filter(function (e) { return e.id !== supplyId; });
                unit.state = (0, unitStateManipulations_1.removeUnusedUnitStateEntries)(unit);
            }
            else {
                var supply = (_b = unit.supplies) === null || _b === void 0 ? void 0 : _b.find(function (e) { return e.id === supplyId; });
                if (!supply) {
                    if (unit.supplies === undefined)
                        unit.supplies = [];
                    unit.supplies.push({ id: supplyId, count: count, onHand: onHand });
                }
                else {
                    Object.assign(supply, { count: count, onHand: onHand });
                }
            }
        });
        updateUnitState(unitId);
    }
    function addSupplyUom(data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.noUndo, noUndo = _c === void 0 ? false : _c, _d = _b.s, s = _d === void 0 ? state : _d;
        var newSupplyUom = __assign({ id: (0, utils_1.nanoid)(), name: "Supply UoM" }, (0, klona_1.klona)(data));
        if (newSupplyUom.id === undefined) {
            newSupplyUom.id = (0, utils_1.nanoid)();
        }
        var newId = newSupplyUom.id;
        if (noUndo) {
            s.supplyUomMap[newId] = newSupplyUom;
        }
        else {
            update(function (s) {
                s.supplyUomMap[newId] = newSupplyUom;
            });
        }
        return newId;
    }
    function updateSupplyUom(id, data) {
        update(function (s) {
            var supplyUom = s.supplyUomMap[id];
            if (!supplyUom)
                return;
            Object.assign(supplyUom, data);
        });
        state.settingsStateCounter++;
    }
    function deleteSupplyUom(id) {
        // check if supply uom is used
        var isUsed = Object.values(state.supplyCategoryMap).some(function (sc) { return sc.uom === id; });
        if (isUsed)
            return false;
        update(function (s) {
            delete s.supplyUomMap[id];
        });
        return true;
    }
    return {
        addSupplyCategory: addSupplyCategory,
        deleteSupplyCategory: deleteSupplyCategory,
        updateSupplyCategory: updateSupplyCategory,
        addSupplyClass: addSupplyClass,
        deleteSupplyClass: deleteSupplyClass,
        updateSupplyClass: updateSupplyClass,
        addSupplyUom: addSupplyUom,
        updateSupplyUom: updateSupplyUom,
        deleteSupplyUom: deleteSupplyUom,
        updateUnitSupply: updateUnitSupply,
    };
}
function getUom(supply, state) {
    var _a, _b, _c;
    var uomId = (_a = supply.uom) !== null && _a !== void 0 ? _a : "";
    if (!uomId)
        return "";
    var uom = state.supplyUomMap[uomId];
    return (_c = (_b = uom === null || uom === void 0 ? void 0 : uom.code) !== null && _b !== void 0 ? _b : uom === null || uom === void 0 ? void 0 : uom.name) !== null && _c !== void 0 ? _c : "";
}
function getSupplyClass(supply, state) {
    var _a, _b;
    var classId = (_a = supply.supplyClass) !== null && _a !== void 0 ? _a : "";
    if (!classId)
        return "";
    var supplyClass = state.supplyClassMap[classId];
    return (_b = supplyClass === null || supplyClass === void 0 ? void 0 : supplyClass.name) !== null && _b !== void 0 ? _b : "";
}
