"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walkSide = walkSide;
exports.walkSubUnits = walkSubUnits;
function walkSide(side, callback) {
    var level = 0;
    function helper(currentUnit, parent, sideGroup) {
        callback(currentUnit, level, parent, sideGroup, side);
        if (currentUnit.subUnits) {
            level += 1;
            for (var _i = 0, _a = currentUnit.subUnits; _i < _a.length; _i++) {
                var subUnit = _a[_i];
                helper(subUnit, currentUnit, sideGroup);
            }
            level -= 1;
        }
    }
    var _loop_1 = function (sideGroup) {
        sideGroup.subUnits.forEach(function (unit) { return helper(unit, sideGroup, sideGroup); });
    };
    for (var _i = 0, _a = side.groups; _i < _a.length; _i++) {
        var sideGroup = _a[_i];
        _loop_1(sideGroup);
    }
    if (side.subUnits) {
        side.subUnits.forEach(function (unit) { return helper(unit, side); });
    }
}
function walkSubUnits(parentUnit, callback, includeParent) {
    if (includeParent === void 0) { includeParent = false; }
    function helper(currentUnit) {
        callback(currentUnit);
        if (currentUnit.subUnits) {
            for (var _i = 0, _a = currentUnit.subUnits; _i < _a.length; _i++) {
                var subUnit = _a[_i];
                helper(subUnit);
            }
        }
    }
    if (includeParent)
        callback(parentUnit);
    if (!parentUnit.subUnits) {
        return;
    }
    for (var _i = 0, _a = parentUnit.subUnits; _i < _a.length; _i++) {
        var unit = _a[_i];
        helper(unit);
    }
}
