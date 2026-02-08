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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRangeRingManipulations = useRangeRingManipulations;
var utils_1 = require("@/utils");
var klona_1 = require("klona");
function useRangeRingManipulations(store) {
    var state = store.state, update = store.update;
    function addRangeRing(unitId, rangeRing) {
        update(function (s) {
            var unit = s.unitMap[unitId];
            if (!unit)
                return;
            if (!unit.rangeRings)
                unit.rangeRings = [];
            // does it already exist?
            var existingIndex = unit.rangeRings.findIndex(function (r) { return r.name === rangeRing.name; });
            if (existingIndex >= 0) {
                unit.rangeRings[existingIndex] = rangeRing;
            }
            else {
                unit.rangeRings.push(rangeRing);
            }
        });
    }
    function deleteRangeRing(unitId, index) {
        update(function (s) {
            var unit = s.unitMap[unitId];
            if (!unit)
                return;
            if (!unit.rangeRings)
                return;
            unit.rangeRings.splice(index, 1);
        });
    }
    function deleteRangeRingByName(unitId, name) {
        var unit = state.unitMap[unitId];
        if (!(unit === null || unit === void 0 ? void 0 : unit.rangeRings))
            return;
        var index = unit.rangeRings.findIndex(function (r) { return r.name === name; });
        if (index < 0)
            return;
        deleteRangeRing(unitId, index);
    }
    function updateRangeRing(unitId, index, data) {
        update(function (s) {
            var unit = s.unitMap[unitId];
            if (!unit)
                return;
            if (!unit.rangeRings)
                return;
            var style = data.style, rest = __rest(data, ["style"]);
            Object.assign(unit.rangeRings[index], rest);
            if (style) {
                if (unit.rangeRings[index].style) {
                    Object.assign(unit.rangeRings[index].style, style);
                }
                else {
                    unit.rangeRings[index].style = style;
                }
            }
        });
    }
    function updateRangeRingByName(unitId, name, data, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.addIfNameDoesNotExists, addIfNameDoesNotExists = _c === void 0 ? false : _c;
        var unit = state.unitMap[unitId];
        if (!(unit === null || unit === void 0 ? void 0 : unit.rangeRings))
            return;
        var index = unit.rangeRings.findIndex(function (r) { return r.name === name; });
        if (index < 0) {
            if (!addIfNameDoesNotExists)
                return;
            addRangeRing(unitId, __assign({ name: name, uom: "km", range: 2 }, data));
            return;
        }
        updateRangeRing(unitId, index, data);
    }
    function updateRangeRingGroup(groupId, data) {
        update(function (s) {
            var group = s.rangeRingGroupMap[groupId];
            if (!group)
                return;
            var style = data.style, rest = __rest(data, ["style"]);
            Object.assign(group, rest);
            if (style) {
                if (group.style) {
                    Object.assign(group.style, style);
                }
                else {
                    group.style = style;
                }
            }
        });
    }
    function addRangeRingGroup(data) {
        var newGroup = __assign({ id: (0, utils_1.nanoid)(), name: "Group" }, (0, klona_1.klona)(data));
        if (newGroup.id === undefined) {
            newGroup.id = (0, utils_1.nanoid)();
        }
        var newId = newGroup.id;
        update(function (s) {
            s.rangeRingGroupMap[newId] = newGroup;
        });
    }
    function deleteRangeRingGroup(id) {
        // check if range ring group is used
        var isUsed = Object.values(state.unitMap).some(function (unit) {
            if (unit.rangeRings) {
                return unit.rangeRings.some(function (e) { return e.group === id; });
            }
            return false;
        });
        if (isUsed)
            return false;
        update(function (s) {
            delete s.rangeRingGroupMap[id];
        });
        return true;
    }
    return {
        addRangeRing: addRangeRing,
        deleteRangeRing: deleteRangeRing,
        deleteRangeRingByName: deleteRangeRingByName,
        updateRangeRing: updateRangeRing,
        updateRangeRingByName: updateRangeRingByName,
        updateRangeRingGroup: updateRangeRingGroup,
        addRangeRingGroup: addRangeRingGroup,
        deleteRangeRingGroup: deleteRangeRingGroup,
    };
}
