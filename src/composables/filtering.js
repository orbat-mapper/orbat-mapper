"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterUnits = filterUnits;
function filterUnits(units, unitMap, query, locationFilter, resetOpen) {
    if (query === void 0) { query = ""; }
    if (locationFilter === void 0) { locationFilter = false; }
    if (resetOpen === void 0) { resetOpen = true; }
    var filteredUnits = [];
    var re = new RegExp(query, "i");
    function helper(currentUnitId, parentMatched) {
        var _a;
        var _b, _c;
        var currentUnit = unitMap[currentUnitId];
        if (!currentUnit)
            return [];
        var oi = {
            unit: currentUnit,
            children: [],
        };
        if (query && resetOpen)
            oi.unit._isOpen = true;
        var matched = false;
        var childMatched = false;
        var hasPosition = Boolean((_b = currentUnit === null || currentUnit === void 0 ? void 0 : currentUnit._state) === null || _b === void 0 ? void 0 : _b.location);
        var children = [];
        if (currentUnit.name.search(re) >= 0) {
            matched = locationFilter ? hasPosition : true;
        }
        else if (parentMatched && resetOpen) {
            oi.unit._isOpen = false;
        }
        if ((_c = currentUnit.subUnits) === null || _c === void 0 ? void 0 : _c.length) {
            for (var _i = 0, _d = currentUnit.subUnits; _i < _d.length; _i++) {
                var subUnit = _d[_i];
                var su = helper(subUnit, matched || parentMatched);
                if (su.length) {
                    childMatched = true;
                    (_a = oi.children).push.apply(_a, su);
                }
            }
        }
        if (matched || childMatched || (parentMatched && !locationFilter)) {
            oi && children.push(oi);
        }
        return children;
    }
    for (var _i = 0, units_1 = units; _i < units_1.length; _i++) {
        var unitId = units_1[_i];
        filteredUnits.push.apply(filteredUnits, helper(unitId, false));
    }
    return filteredUnits;
}
