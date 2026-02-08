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
exports.useUnitManipulations = useUnitManipulations;
var utils_1 = require("@/utils");
var sidc_1 = require("@/symbology/sidc");
var helpers_1 = require("@/components/helpers");
var values_1 = require("@/symbology/values");
var klona_1 = require("klona");
var time_1 = require("@/scenariostore/time");
var vue_1 = require("vue");
var scenarioModels_1 = require("@/types/scenarioModels");
var helpers_2 = require("@/symbology/helpers");
var unitStyles_1 = require("@/geo/unitStyles");
var supplyManipulations_1 = require("@/scenariostore/supplyManipulations");
var toeManipulations_1 = require("@/scenariostore/toeManipulations");
var rangeRingManipulations_1 = require("@/scenariostore/rangeRingManipulations");
var unitStateManipulations_1 = require("@/scenariostore/unitStateManipulations");
var constants_ts_1 = require("@/config/constants.ts");
var counter = 1;
function cloneUnitState(state) {
    var stateCopy = (0, klona_1.klona)(state);
    return stateCopy.map(function (s) { return (__assign(__assign({}, s), { id: (0, utils_1.nanoid)() })); });
}
function updateSidIfNecessary(u, side) {
    if (u.sidc.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)) {
        if (u.sidc[sidc_1.CUSTOM_SYMBOL_SID_INDEX] !== side.standardIdentity) {
            u.sidc = (0, helpers_1.setCharAt)(u.sidc, sidc_1.CUSTOM_SYMBOL_SID_INDEX, side.standardIdentity);
        }
    }
    else {
        if (u.sidc[sidc_1.SID_INDEX] !== side.standardIdentity) {
            u.sidc = (0, helpers_1.setCharAt)(u.sidc, sidc_1.SID_INDEX, side.standardIdentity);
        }
    }
}
function useUnitManipulations(store) {
    var state = store.state, update = store.update, groupUpdate = store.groupUpdate;
    var _a = (0, supplyManipulations_1.useSupplyManipulations)(store), addSupplyClass = _a.addSupplyClass, updateSupplyClass = _a.updateSupplyClass, deleteSupplyClass = _a.deleteSupplyClass, addSupplyCategory = _a.addSupplyCategory, deleteSupplyCategory = _a.deleteSupplyCategory, updateSupplyCategory = _a.updateSupplyCategory, updateUnitSupply = _a.updateUnitSupply, addSupplyUom = _a.addSupplyUom, updateSupplyUom = _a.updateSupplyUom, deleteSupplyUom = _a.deleteSupplyUom;
    var _b = (0, toeManipulations_1.useToeManipulations)(store), updateEquipment = _b.updateEquipment, addEquipment = _b.addEquipment, updatePersonnel = _b.updatePersonnel, addPersonnel = _b.addPersonnel, deletePersonnel = _b.deletePersonnel, deleteEquipment = _b.deleteEquipment, updateUnitEquipment = _b.updateUnitEquipment, updateUnitPersonnel = _b.updateUnitPersonnel;
    var _c = (0, rangeRingManipulations_1.useRangeRingManipulations)(store), addRangeRing = _c.addRangeRing, deleteRangeRing = _c.deleteRangeRing, deleteRangeRingByName = _c.deleteRangeRingByName, updateRangeRing = _c.updateRangeRing, updateRangeRingByName = _c.updateRangeRingByName, updateRangeRingGroup = _c.updateRangeRingGroup, addRangeRingGroup = _c.addRangeRingGroup, deleteRangeRingGroup = _c.deleteRangeRingGroup;
    var _d = (0, unitStateManipulations_1.useUnitStateManipulations)(store), clearUnitState = _d.clearUnitState, updateUnitState = _d.updateUnitState, deleteUnitStateEntryByStateId = _d.deleteUnitStateEntryByStateId, addUnitStateEntry = _d.addUnitStateEntry, deleteUnitStateEntry = _d.deleteUnitStateEntry, updateUnitStateEntry = _d.updateUnitStateEntry, setUnitState = _d.setUnitState, updateUnitStateVia = _d.updateUnitStateVia;
    function addSide(sideData, _a) {
        if (sideData === void 0) { sideData = {}; }
        var _b = _a === void 0 ? {} : _a, _c = _b.markAsNew, markAsNew = _c === void 0 ? true : _c, _d = _b.addDefaultGroup, addDefaultGroup = _d === void 0 ? true : _d, _e = _b.newId, newId = _e === void 0 ? true : _e;
        var newSide = __assign(__assign({}, sideData), { id: newId || sideData.id === undefined ? (0, utils_1.nanoid)() : sideData.id, name: sideData.name || "New side", standardIdentity: sideData.standardIdentity || values_1.SID.Friend, symbolOptions: sideData.symbolOptions || {}, groups: [], subUnits: [], _isNew: markAsNew !== null && markAsNew !== void 0 ? markAsNew : true });
        groupUpdate(function () {
            update(function (s) {
                s.sideMap[newSide.id] = newSide;
                s.sides.push(newSide.id);
            });
            if (addDefaultGroup) {
                addSideGroup(newSide.id, { name: "Units", _isNew: false });
            }
        }, { label: "addSide", value: newSide.id });
        return newSide.id;
    }
    function addSideGroup(sideId, data, _a) {
        if (data === void 0) { data = {}; }
        var _b = _a === void 0 ? {} : _a, _c = _b.newId, newId = _c === void 0 ? true : _c;
        var newSideGroupId = undefined;
        update(function (s) {
            var _a;
            var side = s.sideMap[sideId];
            if (!side)
                return;
            var newSideGroup = __assign(__assign({}, data), { id: newId || data.id === undefined ? (0, utils_1.nanoid)() : data.id, name: data.name || "New group", subUnits: [], _pid: sideId, _isNew: (_a = data._isNew) !== null && _a !== void 0 ? _a : true });
            s.sideGroupMap[newSideGroup.id] = newSideGroup;
            side.groups.push(newSideGroup.id);
            newSideGroupId = newSideGroup.id;
        });
        return newSideGroupId;
    }
    function updateSide(sideId, sideData, _a) {
        var _b;
        var _c = _a === void 0 ? {} : _a, _d = _c.noUndo, noUndo = _d === void 0 ? false : _d;
        if (noUndo) {
            var side = state.sideMap[sideId];
            if (!side)
                return;
            var updateSid = (_b = sideData.standardIdentity) !== null && _b !== void 0 ? _b : side.standardIdentity !== sideData.standardIdentity;
            Object.assign(side, sideData);
            if (updateSid) {
                var sid_1 = side.standardIdentity;
                walkSide(side.id, function (unit) {
                    unit.sidc = (0, helpers_2.setSid)(unit.sidc, sid_1);
                    (0, unitStyles_1.invalidateUnitStyle)(unit.id);
                    unit._ikey = undefined;
                }, state);
            }
            return;
        }
        update(function (s) {
            var _a;
            var side = s.sideMap[sideId];
            if (!side)
                return;
            var updateSid = (_a = sideData.standardIdentity) !== null && _a !== void 0 ? _a : side.standardIdentity !== sideData.standardIdentity;
            Object.assign(side, sideData);
            if (updateSid) {
                var sid_2 = side.standardIdentity;
                walkSide(side.id, function (unit) {
                    unit.sidc = (0, helpers_2.setSid)(unit.sidc, sid_2);
                    unit._ikey = undefined;
                    (0, unitStyles_1.invalidateUnitStyle)(unit.id);
                }, s);
            }
        });
    }
    function deleteSide(sideId) {
        var side = state.sideMap[sideId];
        if (!side)
            return;
        var sideGroups = __spreadArray([], side.groups, true);
        groupUpdate(function () {
            sideGroups.forEach(function (id) { return deleteSideGroup(id); });
            update(function (s) {
                delete s.sideMap[sideId];
                (0, utils_1.removeElement)(sideId, s.sides);
            });
        });
    }
    function deleteSideGroup(sideGroupId) {
        var sideGroup = state.sideGroupMap[sideGroupId];
        if (!sideGroup)
            return;
        var subUnits = __spreadArray([], sideGroup.subUnits, true);
        groupUpdate(function () {
            subUnits.forEach(function (unitId) { return deleteUnit(unitId); });
            update(function (s) {
                delete s.sideGroupMap[sideGroupId];
                if (!sideGroup._pid)
                    return;
                var parentSide = s.sideMap[sideGroup._pid];
                (0, utils_1.removeElement)(sideGroupId, parentSide.groups);
            });
        });
    }
    function updateSideGroup(sideGroupId, sideGroupData, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.noUndo, noUndo = _c === void 0 ? false : _c;
        if (noUndo) {
            var sideGroup = state.sideGroupMap[sideGroupId];
            if (sideGroup)
                Object.assign(sideGroup, __assign(__assign({}, sideGroupData), { _isNew: false }));
        }
        else {
            update(function (s) {
                var sideGroup = s.sideGroupMap[sideGroupId];
                if (sideGroup)
                    Object.assign(sideGroup, __assign(__assign({}, sideGroupData), { _isNew: false }));
            });
        }
        (0, unitStyles_1.clearUnitStyleCache)();
    }
    function reorderSideGroup(sideGroupId, direction) {
        var sideGroup = state.sideGroupMap[sideGroupId];
        var sideId = sideGroup === null || sideGroup === void 0 ? void 0 : sideGroup._pid;
        if (!sideGroup || !sideId)
            return;
        update(function (s) {
            var parent = s.sideMap[sideId];
            if (parent)
                (0, utils_1.moveElement)(parent.groups, sideGroupId, direction === "up" ? -1 : 1);
        });
    }
    function changeSideGroupParent(sideGroupId, targetSideOrSideGroup, target) {
        update(function (s) {
            var sideGroup = s.sideGroupMap[sideGroupId];
            var targetSideGroup = s.sideGroupMap[targetSideOrSideGroup];
            if (!sideGroup)
                return;
            var originalParent = s.sideMap[sideGroup._pid];
            var targetParent = targetSideGroup
                ? s.sideMap[targetSideGroup._pid]
                : s.sideMap[targetSideOrSideGroup];
            if (!originalParent || !targetParent)
                return;
            (0, utils_1.removeElement)(sideGroupId, originalParent.groups);
            // insert item
            if (target === "on") {
                targetParent.groups.push(sideGroupId);
            }
            else {
                var idx = targetParent.groups.findIndex(function (id) { return id === targetSideOrSideGroup; });
                if (idx < 0)
                    return;
                if (target === "below")
                    targetParent.groups.splice(idx + 1, 0, sideGroupId);
                if (target === "above")
                    targetParent.groups.splice(idx, 0, sideGroupId);
            }
            sideGroup._pid = targetParent.id;
            // update SID if necessary
            var side = s.sideMap[targetParent.id];
            if (!side)
                return;
            walkSide(side.id, function (unit) {
                updateSidIfNecessary(unit, side);
                unit._sid = side.id;
                (0, unitStyles_1.invalidateUnitStyle)(unit.id);
            }, s);
        });
    }
    function reorderSide(sideIdId, direction) {
        update(function (s) {
            (0, utils_1.moveElement)(s.sides, sideIdId, direction === "up" ? -1 : 1);
        });
    }
    function moveSide(sideId, toSideId, target) {
        update(function (s) {
            var side = s.sideMap[sideId];
            if (!side)
                return;
            var idx = s.sides.indexOf(sideId);
            if (idx < 0)
                return;
            s.sides.splice(idx, 1);
            var targetIdx = s.sides.indexOf(toSideId);
            if (target === "above") {
                s.sides.splice(targetIdx, 0, sideId);
            }
            else {
                s.sides.splice(targetIdx + 1, 0, sideId);
            }
        });
    }
    function updateUnit(unitId, data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.doUpdateUnitState, doUpdateUnitState = _c === void 0 ? false : _c, _d = _b.ignoreLocked, ignoreLocked = _d === void 0 ? false : _d, _e = _b.s, s = _e === void 0 ? state : _e, _f = _b.noUndo, noUndo = _f === void 0 ? false : _f;
        var unit = s.unitMap[unitId];
        if (!unit)
            return;
        if (!ignoreLocked && isUnitLocked(unitId))
            return;
        (0, unitStyles_1.invalidateUnitStyle)(unitId);
        if (unit._ikey) {
            (0, unitStyles_1.invalidateUnitStyle)(unit._ikey);
            unit._ikey = undefined;
        }
        if (noUndo) {
            if (!unit)
                return;
            Object.assign(unit, __assign({}, data));
            s.unitMap[unitId] = (0, klona_1.klona)(unit);
        }
        else {
            update(function (s) {
                var unit = s.unitMap[unitId];
                if (!unit)
                    return;
                Object.assign(unit, __assign({}, data));
                s.unitMap[unitId] = (0, klona_1.klona)(unit);
            });
        }
        if (doUpdateUnitState)
            updateUnitState(unitId);
    }
    function batchUpdateUnit(unitIds, data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.doUpdateUnitState, doUpdateUnitState = _c === void 0 ? false : _c, _d = _b.ignoreLocked, ignoreLocked = _d === void 0 ? false : _d;
        var filteredUnitIds = ignoreLocked
            ? unitIds
            : unitIds.filter(function (id) { return !isUnitLocked(id); });
        update(function (s) {
            filteredUnitIds.forEach(function (unitId) {
                var unit = s.unitMap[unitId];
                if (!unit)
                    return;
                Object.assign(unit, __assign({}, data));
                s.unitMap[unitId] = (0, klona_1.klona)(unit);
                (0, unitStyles_1.invalidateUnitStyle)(unitId);
            });
        });
        if (doUpdateUnitState) {
            unitIds.forEach(function (id) { return updateUnitState(id); });
        }
    }
    function batchUpdateUnitStyle(unitIds, data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.doUpdateUnitState, doUpdateUnitState = _c === void 0 ? false : _c, _d = _b.ignoreLocked, ignoreLocked = _d === void 0 ? false : _d;
        var filteredUnitIds = ignoreLocked
            ? unitIds
            : unitIds.filter(function (id) { return !isUnitLocked(id); });
        update(function (s) {
            filteredUnitIds.forEach(function (unitId) {
                var _a;
                var unit = s.unitMap[unitId];
                if (!unit)
                    return;
                var unitStyle = (_a = unit.style) !== null && _a !== void 0 ? _a : {};
                var newStyle = __assign(__assign({}, unitStyle), data);
                Object.assign(unit, { style: newStyle });
                // s.unitMap[unitId] = klona(unit);
                (0, unitStyles_1.invalidateUnitStyle)(unitId);
            });
        });
        if (doUpdateUnitState) {
            unitIds.forEach(function (id) { return updateUnitState(id); });
        }
    }
    function updateUnitLocked(unitId, locked) {
        var unit = state.unitMap[unitId];
        if (!unit)
            return;
        unit.locked = locked;
    }
    function updateUnitProperties(unitId, propertyUpdate) {
        update(function (s) {
            var unit = s.unitMap[unitId];
            if (!unit)
                return;
            var properties = (0, klona_1.klona)(unit.properties || {});
            unit.properties = __assign(__assign({}, properties), propertyUpdate);
        });
    }
    function deleteUnit(id) {
        var unitIds = [];
        walkSubUnits(id, function (unit1) {
            unitIds.push(unit1.id);
        }, { includeParent: true });
        unitIds.reverse();
        update(function (s) {
            for (var _i = 0, unitIds_1 = unitIds; _i < unitIds_1.length; _i++) {
                var id_1 = unitIds_1[_i];
                var u = s.unitMap[id_1];
                if (!u) {
                    continue;
                }
                delete s.unitMap[id_1];
                if (!u._pid) {
                    continue;
                }
                var parentUnit = getUnitOrSideGroupOrSide(u._pid, s);
                if (parentUnit) {
                    (0, utils_1.removeElement)(id_1, parentUnit.subUnits);
                }
                else {
                    return;
                }
            }
        });
    }
    function changeUnitParent(unitId, targetId, target) {
        if (target === void 0) { target = "on"; }
        update(function (s) {
            var _a;
            var unit = s.unitMap[unitId];
            var parentId = targetId;
            if (target === "above" || target === "below") {
                parentId = (_a = getUnitOrSideGroup(targetId)) === null || _a === void 0 ? void 0 : _a._pid;
            }
            var newParent = getUnitOrSideGroupOrSide(parentId, s);
            if (!(unit && newParent))
                return;
            var _b = getUnitHierarchy(newParent.id, s), side = _b.side, sideGroup = _b.sideGroup, parents = _b.parents;
            if (parents.includes(unit)) {
                console.error("Not allowed");
                return;
            }
            var originalParent = getUnitOrSideGroupOrSide(unit._pid, s);
            unit._pid = parentId;
            unit._sid = side.id;
            unit._gid = sideGroup === null || sideGroup === void 0 ? void 0 : sideGroup.id;
            if (originalParent) {
                (0, utils_1.removeElement)(unitId, originalParent.subUnits);
            }
            if (target === "on") {
                newParent.subUnits.push(unitId);
            }
            else {
                var idx = newParent.subUnits.findIndex(function (id) { return id === targetId; });
                if (idx < 0)
                    return;
                if (target === "below")
                    newParent.subUnits.splice(idx + 1, 0, unitId);
                if (target === "above")
                    newParent.subUnits.splice(idx, 0, unitId);
            }
            //update SID if necessary
            if (side) {
                walkSubUnits(unitId, function (u) {
                    updateSidIfNecessary(u, side);
                    u._sid = side.id;
                    u._gid = sideGroup === null || sideGroup === void 0 ? void 0 : sideGroup.id;
                    (0, unitStyles_1.invalidateUnitStyle)(u.id);
                }, { state: s, includeParent: true });
            }
        });
    }
    function walkSubUnits(parentUnitId, callback, options) {
        var _a = options.state, s = _a === void 0 ? state : _a, _b = options.includeParent, includeParent = _b === void 0 ? false : _b;
        function helper(currentUnitId) {
            var currentUnit = s.unitMap[currentUnitId];
            callback(currentUnit);
            currentUnit.subUnits.forEach(function (id) { return helper(id); });
        }
        var parentUnit = s.unitMap[parentUnitId];
        if (includeParent)
            callback(parentUnit);
        parentUnit.subUnits.forEach(function (unitId) { return helper(unitId); });
    }
    function walkSide(sideId, callback, s) {
        var _a;
        if (s === void 0) { s = state; }
        var level = 0;
        var side = s.sideMap[sideId];
        if (!side)
            return;
        function helper(currentUnitId, parent, sideGroup) {
            var currentUnit = s.unitMap[currentUnitId];
            var r = callback(currentUnit, level, parent, sideGroup, side);
            if (r !== undefined)
                return r;
            if (currentUnit.subUnits) {
                level += 1;
                for (var _i = 0, _a = currentUnit.subUnits; _i < _a.length; _i++) {
                    var subUnitId = _a[_i];
                    helper(subUnitId, currentUnit, sideGroup);
                }
                level -= 1;
            }
        }
        for (var _i = 0, _b = side.groups; _i < _b.length; _i++) {
            var sideGroupId = _b[_i];
            var sideGroup = s.sideGroupMap[sideGroupId];
            for (var _c = 0, _d = sideGroup.subUnits; _c < _d.length; _c++) {
                var unitId = _d[_c];
                var r = helper(unitId, sideGroup, sideGroup);
                if (r === true)
                    break;
            }
        }
        for (var _e = 0, _f = (_a = side.subUnits) !== null && _a !== void 0 ? _a : []; _e < _f.length; _e++) {
            var unitId = _f[_e];
            var r = helper(unitId, side);
            if (r === true)
                break;
        }
    }
    function walkItem(itemId, callback, s) {
        var _a;
        if (s === void 0) { s = state; }
        var level = 0;
        function helper(currentUnitId, parent, sideGroup, side) {
            var currentUnit = s.unitMap[currentUnitId];
            var r = callback(currentUnit, level, parent, sideGroup, side);
            if (r !== undefined)
                return r;
            if (currentUnit.subUnits) {
                level += 1;
                for (var _i = 0, _a = currentUnit.subUnits; _i < _a.length; _i++) {
                    var subUnitId = _a[_i];
                    helper(subUnitId, currentUnit, sideGroup, side);
                }
                level -= 1;
            }
        }
        if (itemId in s.sideMap) {
            // item is a side
            var side = s.sideMap[itemId];
            if (!side)
                return;
            for (var _i = 0, _b = side.groups; _i < _b.length; _i++) {
                var sideGroupId = _b[_i];
                var sideGroup = s.sideGroupMap[sideGroupId];
                for (var _c = 0, _d = sideGroup.subUnits; _c < _d.length; _c++) {
                    var unitId = _d[_c];
                    var r = helper(unitId, sideGroup, sideGroup, side);
                    if (r === true)
                        break;
                }
            }
            for (var _e = 0, _f = (_a = side.subUnits) !== null && _a !== void 0 ? _a : []; _e < _f.length; _e++) {
                var unitId = _f[_e];
                var r = helper(unitId, side, undefined, side);
                if (r === true)
                    break;
            }
        }
        else if (itemId in s.sideGroupMap) {
            // item is a side group
            var sideGroup = s.sideGroupMap[itemId];
            if (!sideGroup)
                return;
            var side = s.sideMap[sideGroup._pid];
            for (var _g = 0, _h = sideGroup.subUnits; _g < _h.length; _g++) {
                var unitId = _h[_g];
                var r = helper(unitId, sideGroup, sideGroup, side);
                if (r === true)
                    break;
            }
        }
        else if (itemId in s.unitMap) {
            // item is a unit
            var unit = s.unitMap[itemId];
            if (!unit)
                return;
            var sideGroup = unit._gid ? s.sideGroupMap[unit._gid] : undefined;
            var side = unit._sid ? s.sideMap[unit._sid] : undefined;
            helper(unit.id, unit, sideGroup, side);
        }
    }
    function getUnitHierarchy(entityId, s) {
        if (s === void 0) { s = state; }
        var parents = [];
        var unit = getUnitOrSideGroupOrSide(entityId, s);
        var helper = function (uId) {
            var u = s.unitMap[uId];
            var parent = (u === null || u === void 0 ? void 0 : u._pid) && s.unitMap[u._pid];
            if (parent) {
                parents.push(parent);
                helper(parent.id);
            }
        };
        helper(entityId);
        parents.reverse();
        var sideGroupId, sideId;
        if (parents.length) {
            sideGroupId = parents[0]._pid;
        }
        else if (unit && "_gid" in unit) {
            sideGroupId = unit._gid;
        }
        else {
            sideGroupId = unit && "_pid" in unit ? unit.id : undefined;
        }
        var sideGroup = sideGroupId ? s.sideGroupMap[sideGroupId] : undefined;
        if (sideGroup) {
            sideId = sideGroup._pid;
        }
        else if (unit && "_sid" in unit) {
            sideId = unit._sid;
        }
        else if (unit && "_pid" in unit) {
            sideId = unit._pid;
        }
        else if (unit) {
            sideId = unit.id;
        }
        var side = s.sideMap[sideId];
        return { side: side, sideGroup: sideGroup, parents: parents };
    }
    function getUnitOrSideGroup(id, s) {
        if (s === void 0) { s = state; }
        if (id in s.unitMap)
            return s.unitMap[id];
        return s.sideGroupMap[id] || undefined;
    }
    function getUnitOrSideGroupOrSide(id, s) {
        if (s === void 0) { s = state; }
        if (id in s.unitMap)
            return s.unitMap[id];
        if (id in s.sideGroupMap)
            return s.sideGroupMap[id];
        return s.sideMap[id];
    }
    function addUnit(newUnit, parentId, index, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.noUndo, noUndo = _c === void 0 ? false : _c, _d = _b.updateState, updateState = _d === void 0 ? false : _d, _e = _b.s, s = _e === void 0 ? state : _e;
        var unit = __assign({}, newUnit);
        if (!unit.id) {
            unit.id = (0, utils_1.nanoid)();
        }
        var _f = getUnitHierarchy(parentId, s), side = _f.side, sideGroup = _f.sideGroup;
        unit._pid = parentId;
        unit._gid = sideGroup === null || sideGroup === void 0 ? void 0 : sideGroup.id;
        unit._sid = side.id;
        unit._isOpen = false;
        if (!unit.state || !unit.state.length) {
            unit._state = (0, time_1.createInitialState)(unit);
        }
        if (noUndo) {
            s.unitMap[unit.id] = unit;
            var parent_1 = getUnitOrSideGroupOrSide(unit._pid, s);
            if (!parent_1)
                return unit.id;
            if (index === undefined) {
                parent_1.subUnits.push(unit.id);
            }
            else {
                parent_1.subUnits.splice(index, 0, unit.id);
            }
        }
        else {
            update(function (s) {
                s.unitMap[unit.id] = unit;
                var parent = getUnitOrSideGroupOrSide(unit._pid, s);
                if (!parent)
                    return;
                if (index === undefined) {
                    parent.subUnits.push(unit.id);
                }
                else {
                    parent.subUnits.splice(index, 0, unit.id);
                }
            });
        }
        if (updateState)
            updateUnitState(unit.id);
        return unit.id;
    }
    function createSubordinateUnit(parentId, data) {
        if (data === void 0) { data = {}; }
        var parent = getUnitOrSideGroupOrSide(parentId);
        if (!parent)
            return;
        var sidc;
        if (data.sidc) {
            sidc = new sidc_1.Sidc(data.sidc);
        }
        else if ("sidc" in parent) {
            var parentSidc = new sidc_1.Sidc(parent.sidc);
            sidc = new sidc_1.Sidc(data.sidc || parent.sidc);
            sidc.emt = (0, helpers_2.getNextEchelonBelow)(parentSidc.emt);
        }
        else {
            sidc = new sidc_1.Sidc("10031000000000000000");
            var side = "_pid" in parent ? state.sideMap[parent._pid] : parent;
            sidc.standardIdentity = (side === null || side === void 0 ? void 0 : side.standardIdentity) || "0";
        }
        var newUnit = {
            name: data.name || parent.name + counter++,
            sidc: sidc.toString(),
            id: (0, utils_1.nanoid)(),
            state: [],
            _state: null,
            _pid: parent.id,
            _gid: "",
            _sid: "",
            subUnits: [],
        };
        if (parent.symbolOptions) {
            newUnit.symbolOptions = (0, klona_1.klona)(parent.symbolOptions);
        }
        var newUnitId = addUnit(newUnit, parentId);
        parent._isOpen = true;
        return newUnitId;
    }
    function cloneUnit(unitId, _a) {
        var _b;
        var _c = _a === void 0 ? {} : _a, _d = _c.target, target = _d === void 0 ? "below" : _d, _e = _c.includeSubordinates, includeSubordinates = _e === void 0 ? false : _e, _f = _c.includeState, includeState = _f === void 0 ? false : _f, _g = _c.modifyName, modifyName = _g === void 0 ? false : _g;
        var unit = state.unitMap[unitId];
        if (!unit)
            return;
        var newUnit = __assign(__assign({}, unit), { name: modifyName ? unit.name + counter++ : unit.name, id: (0, utils_1.nanoid)(), state: includeState ? cloneUnitState((_b = unit.state) !== null && _b !== void 0 ? _b : []) : [], _state: null, subUnits: [] });
        var parent = getUnitOrSideGroup(unit._pid);
        var idx;
        if (target !== "end" && parent) {
            idx = parent.subUnits.findIndex(function (id) { return id === unitId; });
            if (target === "below")
                idx = idx + 1;
            if (idx < 0)
                idx = undefined;
        }
        groupUpdate(function () {
            var rootUnitId = addUnit(newUnit, unit._pid, idx, { updateState: includeState });
            var addedUnit = state.unitMap[rootUnitId];
            var _gid = addedUnit._gid, _sid = addedUnit._sid;
            if (includeSubordinates) {
                var clonedUnitIds_1 = [];
                update(function (s) {
                    function helper(currentUnitId, parentId) {
                        var _a;
                        var currentUnit = state.unitMap[currentUnitId];
                        var newUnit = __assign(__assign({}, currentUnit), { id: (0, utils_1.nanoid)(), state: includeState ? cloneUnitState((_a = currentUnit.state) !== null && _a !== void 0 ? _a : []) : [], subUnits: [], _state: null, _pid: parentId, _gid: _gid, _sid: _sid, _isOpen: false });
                        if (!newUnit.state || !newUnit.state.length) {
                            unit._state = (0, time_1.createInitialState)(unit);
                        }
                        s.unitMap[newUnit.id] = newUnit;
                        clonedUnitIds_1.push(newUnit.id);
                        var parent = getUnitOrSideGroup(parentId, s);
                        if (!parent)
                            return;
                        parent.subUnits.push(newUnit.id);
                        currentUnit.subUnits.forEach(function (id) { return helper(id, newUnit.id); });
                    }
                    unit.subUnits.forEach(function (e) { return helper(e, newUnit.id); });
                });
                if (includeState) {
                    clonedUnitIds_1.forEach(function (id) { return updateUnitState(id); });
                }
            }
        });
        return newUnit.id;
    }
    function cloneSideGroup(sideGroupId, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.includeState, includeState = _c === void 0 ? false : _c, _d = _b.modifyName, modifyName = _d === void 0 ? true : _d;
        var sideGroup = state.sideGroupMap[sideGroupId];
        if (!sideGroup)
            return;
        var newSideGroup = __assign(__assign({}, sideGroup), { id: (0, utils_1.nanoid)(), name: modifyName ? "".concat(sideGroup.name, " (copy)") : sideGroup.name, subUnits: [], _isNew: false });
        var newSideGroupId;
        groupUpdate(function () {
            newSideGroupId = addSideGroup(sideGroup._pid, newSideGroup);
            sideGroup.subUnits.forEach(function (unitId) {
                var newUnitId = cloneUnit(unitId, {
                    target: "end",
                    includeSubordinates: true,
                    includeState: includeState,
                    modifyName: false,
                });
                newUnitId && newSideGroupId && changeUnitParent(newUnitId, newSideGroupId);
            });
        });
        return newSideGroupId;
    }
    function cloneSide(sideId, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.includeState, includeState = _c === void 0 ? false : _c;
        var side = state.sideMap[sideId];
        if (!side)
            return;
        var newSide = __assign(__assign({}, side), { id: (0, utils_1.nanoid)(), name: "".concat(side.name, " (copy)"), groups: [], _isNew: false });
        var newSideId;
        groupUpdate(function () {
            newSideId = addSide(newSide, { markAsNew: false, addDefaultGroup: false });
            side.groups.forEach(function (groupId) {
                var newGroupId = cloneSideGroup(groupId, { includeState: includeState, modifyName: false });
                newGroupId && newSideId && changeSideGroupParent(newGroupId, newSideId, "on");
            });
        });
        return newSideId;
    }
    function reorderUnit(unitId, direction) {
        var unit = state.unitMap[unitId];
        if (!unit)
            return;
        update(function (s) {
            var parent = getUnitOrSideGroup(unit._pid, s);
            if (parent)
                (0, utils_1.moveElement)(parent.subUnits, unitId, direction === "up" ? -1 : 1);
        });
    }
    function expandUnit(unit) {
        var _a, _b, _c;
        return __assign(__assign({}, unit), { state: [], subUnits: unit.subUnits.map(function (subUnitId) { return expandUnit(state.unitMap[subUnitId]); }), equipment: (_a = unit.equipment) === null || _a === void 0 ? void 0 : _a.map(function (_a) {
                var id = _a.id, count = _a.count, onHand = _a.onHand;
                return ({
                    name: state.equipmentMap[id].name || "",
                    count: count,
                    onHand: onHand,
                });
            }), personnel: (_b = unit.personnel) === null || _b === void 0 ? void 0 : _b.map(function (_a) {
                var id = _a.id, count = _a.count, onHand = _a.onHand;
                return ({
                    name: state.personnelMap[id].name || "",
                    count: count,
                    onHand: onHand,
                });
            }), supplies: (_c = unit.supplies) === null || _c === void 0 ? void 0 : _c.map(function (_a) {
                var id = _a.id, count = _a.count, onHand = _a.onHand;
                return ({
                    name: state.supplyCategoryMap[id].name || "",
                    count: count,
                    onHand: onHand,
                });
            }) });
    }
    function expandUnitWithSymbolOptions(unit) {
        var _a, _b, _c;
        return __assign(__assign({}, unit), { state: [], symbolOptions: getCombinedSymbolOptions(unit), subUnits: unit.subUnits.map(function (subUnitId) {
                return expandUnitWithSymbolOptions(state.unitMap[subUnitId]);
            }), equipment: (_a = unit.equipment) === null || _a === void 0 ? void 0 : _a.map(function (_a) {
                var id = _a.id, count = _a.count;
                return ({
                    name: state.equipmentMap[id].name || "",
                    count: count,
                });
            }), personnel: (_b = unit.personnel) === null || _b === void 0 ? void 0 : _b.map(function (_a) {
                var id = _a.id, count = _a.count;
                return ({
                    name: state.personnelMap[id].name || "",
                    count: count,
                });
            }), supplies: (_c = unit.supplies) === null || _c === void 0 ? void 0 : _c.map(function (_a) {
                var id = _a.id, count = _a.count;
                return ({
                    name: state.supplyCategoryMap[id].name || "",
                    count: count,
                });
            }) });
    }
    function getCombinedSymbolOptions(unitOrSideGroup, ignoreUnit) {
        var _a, _b;
        if (ignoreUnit === void 0) { ignoreUnit = false; }
        if (!unitOrSideGroup)
            return {};
        var _sid, _gid, reinforcedReduced;
        if ("sidc" in unitOrSideGroup) {
            _sid = unitOrSideGroup._sid;
            _gid = unitOrSideGroup._gid;
            reinforcedReduced = (0, scenarioModels_1.mapReinforcedStatus2Field)(unitOrSideGroup.reinforcedStatus);
        }
        else {
            _sid = unitOrSideGroup._pid;
            _gid = unitOrSideGroup.id;
            ignoreUnit = true;
        }
        return __assign(__assign(__assign(__assign({}, (((_a = state.sideMap[_sid]) === null || _a === void 0 ? void 0 : _a.symbolOptions) || {})), (((_b = state.sideGroupMap[_gid]) === null || _b === void 0 ? void 0 : _b.symbolOptions) || {})), (ignoreUnit ? {} : unitOrSideGroup.symbolOptions || {})), (ignoreUnit ? {} : { reinforcedReduced: reinforcedReduced !== null && reinforcedReduced !== void 0 ? reinforcedReduced : "" }));
    }
    function updateUnitStatus(id, data) {
        update(function (s) {
            var status = s.unitStatusMap[id];
            if (!status)
                return;
            Object.assign(status, data);
        });
    }
    function addUnitStatus(data) {
        var newStatus = __assign({ id: (0, utils_1.nanoid)(), name: "Status" }, (0, klona_1.klona)(data));
        if (newStatus.id === undefined) {
            newStatus.id = (0, utils_1.nanoid)();
        }
        var newId = newStatus.id;
        update(function (s) {
            s.unitStatusMap[newId] = newStatus;
        });
    }
    function deleteUnitStatus(id) {
        // check if status is used
        var isUsed = Object.values(state.unitMap).some(function (unit) {
            var _a;
            if (unit.status && unit.status === id) {
                return true;
            }
            return (_a = unit.state) === null || _a === void 0 ? void 0 : _a.some(function (state) { return state.status === id; });
        });
        if (isUsed)
            return false;
        update(function (s) {
            delete s.unitStatusMap[id];
        });
        return true;
    }
    function isUnitLocked(unitId, _a) {
        var _b, _c, _d, _e;
        var _f = _a === void 0 ? {} : _a, _g = _f.excludeUnit, excludeUnit = _g === void 0 ? false : _g;
        var unit = state.unitMap[unitId];
        if (!unit)
            return false;
        if (excludeUnit) {
            return !!(((_b = state.sideMap[unit._sid]) === null || _b === void 0 ? void 0 : _b.locked) ||
                (unit._gid && ((_c = state.sideGroupMap[unit._gid]) === null || _c === void 0 ? void 0 : _c.locked)));
        }
        return !!(((_d = state.sideMap[unit._sid]) === null || _d === void 0 ? void 0 : _d.locked) ||
            (unit._gid && ((_e = state.sideGroupMap[unit._gid]) === null || _e === void 0 ? void 0 : _e.locked)) ||
            unit.locked);
    }
    function isUnitHidden(unitId) {
        var _a, _b;
        var unit = state.unitMap[unitId];
        if (!unit)
            return false;
        return !!(((_a = state.sideMap[unit._sid]) === null || _a === void 0 ? void 0 : _a.isHidden) ||
            (unit._gid && ((_b = state.sideGroupMap[unit._gid]) === null || _b === void 0 ? void 0 : _b.isHidden)));
    }
    function convertStateEntryToInitialLocation(unitId, index) {
        var _a;
        var u = state.unitMap[unitId];
        var stateEntry = (_a = u === null || u === void 0 ? void 0 : u.state) === null || _a === void 0 ? void 0 : _a[index];
        if (!(stateEntry === null || stateEntry === void 0 ? void 0 : stateEntry.location))
            return;
        var location = __spreadArray([], stateEntry.location, true);
        groupUpdate(function () {
            deleteUnitStateEntry(unitId, index);
            updateUnit(unitId, { location: location });
        }, { label: "addUnitPosition", value: unitId });
        updateUnitState(unitId);
    }
    return {
        addUnit: addUnit,
        deleteUnit: deleteUnit,
        changeUnitParent: changeUnitParent,
        walkSubUnits: walkSubUnits,
        walkSide: walkSide,
        walkItem: walkItem,
        cloneUnit: cloneUnit,
        cloneSide: cloneSide,
        cloneSideGroup: cloneSideGroup,
        reorderUnit: reorderUnit,
        getUnitHierarchy: getUnitHierarchy,
        updateSide: updateSide,
        updateSideGroup: updateSideGroup,
        addSide: addSide,
        addSideGroup: addSideGroup,
        deleteSide: deleteSide,
        deleteSideGroup: deleteSideGroup,
        createSubordinateUnit: createSubordinateUnit,
        updateUnit: updateUnit,
        updateUnitLocked: updateUnitLocked,
        deleteUnitStateEntry: deleteUnitStateEntry,
        deleteUnitStateEntryByStateId: deleteUnitStateEntryByStateId,
        clearUnitState: clearUnitState,
        setUnitState: setUnitState,
        units: (0, vue_1.computed)(function () { return Object.values(state.unitMap); }),
        getUnitOrSideGroup: getUnitOrSideGroup,
        getUnitById: function (id) { return state.unitMap[id]; },
        getUnitByName: function (name) {
            for (var _i = 0, _a = Object.values(state.unitMap); _i < _a.length; _i++) {
                var unit = _a[_i];
                if (unit.name === name)
                    return expandUnit(unit);
            }
            return null;
        },
        expandUnit: expandUnit,
        updateUnitStateVia: updateUnitStateVia,
        updateUnitStateEntry: updateUnitStateEntry,
        addUnitStateEntry: addUnitStateEntry,
        convertStateEntryToInitialLocation: convertStateEntryToInitialLocation,
        reorderSide: reorderSide,
        moveSide: moveSide,
        reorderSideGroup: reorderSideGroup,
        changeSideGroupParent: changeSideGroupParent,
        getCombinedSymbolOptions: getCombinedSymbolOptions,
        expandUnitWithSymbolOptions: expandUnitWithSymbolOptions,
        addRangeRing: addRangeRing,
        deleteRangeRing: deleteRangeRing,
        deleteRangeRingByName: deleteRangeRingByName,
        updateRangeRing: updateRangeRing,
        updateRangeRingByName: updateRangeRingByName,
        updateRangeRingGroup: updateRangeRingGroup,
        addRangeRingGroup: addRangeRingGroup,
        deleteRangeRingGroup: deleteRangeRingGroup,
        updateEquipment: updateEquipment,
        addEquipment: addEquipment,
        updatePersonnel: updatePersonnel,
        addPersonnel: addPersonnel,
        deletePersonnel: deletePersonnel,
        deleteEquipment: deleteEquipment,
        updateUnitEquipment: updateUnitEquipment,
        updateUnitPersonnel: updateUnitPersonnel,
        addUnitStatus: addUnitStatus,
        updateUnitStatus: updateUnitStatus,
        deleteUnitStatus: deleteUnitStatus,
        addSupplyClass: addSupplyClass,
        updateSupplyClass: updateSupplyClass,
        deleteSupplyClass: deleteSupplyClass,
        addSupplyCategory: addSupplyCategory,
        deleteSupplyCategory: deleteSupplyCategory,
        updateSupplyCategory: updateSupplyCategory,
        addSupplyUom: addSupplyUom,
        updateSupplyUom: updateSupplyUom,
        deleteSupplyUom: deleteSupplyUom,
        updateUnitSupply: updateUnitSupply,
        updateUnitProperties: updateUnitProperties,
        isUnitLocked: isUnitLocked,
        isUnitHidden: isUnitHidden,
        updateUnitState: updateUnitState,
        batchUpdateUnit: batchUpdateUnit,
        batchUpdateUnitStyle: batchUpdateUnitStyle,
    };
}
