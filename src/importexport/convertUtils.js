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
exports.orbatToText = orbatToText;
exports.parseApplicationOrbat = parseApplicationOrbat;
exports.addUnitHierarchy = addUnitHierarchy;
var utils_1 = require("@/utils");
var newScenarioStore_1 = require("@/scenariostore/newScenarioStore");
var helpers_ts_1 = require("@/symbology/helpers.ts");
var klona_1 = require("klona");
function orbatToText(root, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var indent = (_a = options.indent) !== null && _a !== void 0 ? _a : "\t";
    var result = [];
    function helper(node, depth) {
        var _a;
        if (depth === void 0) { depth = 0; }
        result.push(indent.repeat(depth) + node.name + "\n");
        (_a = node.subUnits) === null || _a === void 0 ? void 0 : _a.forEach(function (child) { return helper(child, depth + 1); });
    }
    helper(root);
    return result;
}
function parseApplicationOrbat(text) {
    var obj = JSON.parse(text);
    if (Array.isArray(obj)) {
        return obj;
    }
    return null;
}
function addUnitHierarchy(rootUnit, parentId, targetScenario, options) {
    var _a, _b, _c;
    if (options === void 0) { options = {}; }
    var newIds = (_a = options.newIds) !== null && _a !== void 0 ? _a : true;
    var includeState = (_b = options.includeState) !== null && _b !== void 0 ? _b : false;
    var noUndo = true;
    var store = targetScenario.store, unitActions = targetScenario.unitActions;
    var sourceState = options.sourceState;
    var side = unitActions.getUnitHierarchy(parentId).side;
    var tempUnitStatusIdMap = (0, utils_1.createNameToIdMapObject)(store.state.unitStatusMap);
    var supplyNameToIdMap = (0, utils_1.createNameToIdMapObject)(store.state.supplyCategoryMap);
    var equipmentNameToIdMap = (0, utils_1.createNameToIdMapObject)(store.state.equipmentMap);
    var personnelNameToIdMap = (0, utils_1.createNameToIdMapObject)(store.state.personnelMap);
    var sourceSupplyNameToIdMap = (0, utils_1.createNameToIdMapObject)((_c = sourceState === null || sourceState === void 0 ? void 0 : sourceState.supplyCategoryMap) !== null && _c !== void 0 ? _c : {});
    var targetSupplyUomNameToIdMap = (0, utils_1.createNameToIdMapObject)(store.state.supplyUomMap);
    var targetSupplyClassMap = (0, utils_1.createNameToIdMapObject)(store.state.supplyClassMap);
    var sourceCustomSymbolIds = new Set();
    store.update(function (s) {
        function addUnitStatus(unitStatus) {
            var id = (0, utils_1.nanoid)();
            tempUnitStatusIdMap[unitStatus.name] = id;
            s.unitStatusMap[id] = __assign(__assign({}, unitStatus), { id: id });
            return id;
        }
        function helper(unit, parentId, depth) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (depth === void 0) { depth = 0; }
            var equipment = [];
            var personnel = [];
            var rangeRings = [];
            var supplies = [];
            var customSymbolId = (0, helpers_ts_1.getCustomSymbolId)(unit.sidc);
            if (customSymbolId) {
                sourceCustomSymbolIds.add(customSymbolId);
            }
            (_b = (_a = unit.state) === null || _a === void 0 ? void 0 : _a.filter(function (s) { return s.sidc; })) === null || _b === void 0 ? void 0 : _b.forEach(function (s) {
                var csidc = (0, helpers_ts_1.getCustomSymbolId)(s.sidc);
                if (csidc) {
                    sourceCustomSymbolIds.add(csidc);
                }
            });
            (_c = unit.equipment) === null || _c === void 0 ? void 0 : _c.forEach(function (_a) {
                var name = _a.name, count = _a.count, onHand = _a.onHand;
                var id = (s.equipmentMap[name] ||
                    unitActions.addEquipment({ id: name, name: name }, { noUndo: noUndo, s: s })).id;
                equipment.push({ id: id, count: count, onHand: onHand });
            });
            (_d = unit.personnel) === null || _d === void 0 ? void 0 : _d.forEach(function (_a) {
                var name = _a.name, count = _a.count, onHand = _a.onHand;
                var id = (s.personnelMap[name] ||
                    unitActions.addPersonnel({ id: name, name: name }, { noUndo: noUndo, s: s })).id;
                personnel.push({ id: id, count: count, onHand: onHand });
            });
            (_e = unit.supplies) === null || _e === void 0 ? void 0 : _e.forEach(function (unitSupply) {
                var _a, _b, _c, _d, _e, _f;
                // use existing one if it exists. For new supplies we use the name as id
                var supplyId = (_a = supplyNameToIdMap[unitSupply.name]) !== null && _a !== void 0 ? _a : (_c = s.supplyCategoryMap[(_b = unitSupply.name) !== null && _b !== void 0 ? _b : ""]) === null || _c === void 0 ? void 0 : _c.id;
                if (!supplyId) {
                    // the supply category does not exist, create it. Use the source state if available
                    var newSupplyCategory = (_d = sourceState === null || sourceState === void 0 ? void 0 : sourceState.supplyCategoryMap[sourceSupplyNameToIdMap[unitSupply.name]]) !== null && _d !== void 0 ? _d : {
                        id: unitSupply.name,
                        name: unitSupply.name,
                    };
                    var uomId = undefined;
                    if (newSupplyCategory.uom) {
                        var sourceUom = sourceState === null || sourceState === void 0 ? void 0 : sourceState.supplyUomMap[newSupplyCategory.uom];
                        // does the uom name exist in the target scenario?
                        uomId = targetSupplyUomNameToIdMap[(_e = sourceUom === null || sourceUom === void 0 ? void 0 : sourceUom.name) !== null && _e !== void 0 ? _e : ""];
                        if (sourceUom && !uomId) {
                            uomId = unitActions.addSupplyUom(__assign(__assign({}, sourceUom), { id: sourceUom.name }));
                        }
                    }
                    var supplyClassId = undefined;
                    if (newSupplyCategory.supplyClass) {
                        var sourceSupplyClass = sourceState === null || sourceState === void 0 ? void 0 : sourceState.supplyClassMap[newSupplyCategory.supplyClass];
                        supplyClassId = targetSupplyClassMap[(_f = sourceSupplyClass === null || sourceSupplyClass === void 0 ? void 0 : sourceSupplyClass.name) !== null && _f !== void 0 ? _f : ""];
                        if (sourceSupplyClass && !supplyClassId) {
                            supplyClassId = unitActions.addSupplyClass(__assign(__assign({}, sourceSupplyClass), { id: sourceSupplyClass.name }));
                        }
                        var sc = unitActions.addSupplyCategory(__assign(__assign({}, newSupplyCategory), { id: newSupplyCategory.name, uom: uomId, supplyClass: supplyClassId }), { noUndo: noUndo, s: s });
                        supplyId = sc.id;
                    }
                }
                supplies.push(__assign(__assign({}, unitSupply), { id: supplyId }));
            });
            (_f = unit.rangeRings) === null || _f === void 0 ? void 0 : _f.forEach(function (rr) {
                var _a;
                var group = rr.group, rest = __rest(rr, ["group"]);
                if (group) {
                    var groupId = group
                        ? (_a = Object.values(s.rangeRingGroupMap).find(function (g) { return g.name === group; })) === null || _a === void 0 ? void 0 : _a.id
                        : "";
                    if (!groupId) {
                        groupId = (0, utils_1.nanoid)();
                        s.rangeRingGroupMap[groupId] = { id: groupId, name: group };
                    }
                    rangeRings.push(__assign(__assign({}, rest), { group: groupId }));
                }
                else {
                    rangeRings.push(rr);
                }
            });
            var unitState = includeState && unit.state
                ? __spreadArray([], unit.state, true).map(function (s) {
                    return newIds
                        ? (0, newScenarioStore_1.convertStateToInternalFormat)(__assign(__assign({}, s), { id: "" }))
                        : (0, newScenarioStore_1.convertStateToInternalFormat)(s);
                })
                : [];
            unitState
                .filter(function (s) { return s.status; })
                .forEach(function (s) {
                s.status = tempUnitStatusIdMap[s.status] || addUnitStatus({ name: s.status });
            });
            var internalUnitState = unitState.map(function (s) {
                var _a, _b, _c, _d, _e, _f;
                var update = s.update, diff = s.diff, rest = __rest(s, ["update", "diff"]);
                var newUpdate = update
                    ? {
                        equipment: (_a = update.equipment) === null || _a === void 0 ? void 0 : _a.map(function (e) {
                            var _a;
                            var name = e.name, rest = __rest(e, ["name"]);
                            return __assign({ id: (_a = equipmentNameToIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                        }),
                        personnel: (_b = update.personnel) === null || _b === void 0 ? void 0 : _b.map(function (p) {
                            var _a;
                            var name = p.name, rest = __rest(p, ["name"]);
                            return __assign({ id: (_a = personnelNameToIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                        }),
                        supplies: (_c = update.supplies) === null || _c === void 0 ? void 0 : _c.map(function (s) {
                            var _a;
                            var name = s.name, rest = __rest(s, ["name"]);
                            return __assign({ id: (_a = supplyNameToIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                        }),
                    }
                    : undefined;
                var newDiff = diff
                    ? {
                        equipment: (_d = diff.equipment) === null || _d === void 0 ? void 0 : _d.map(function (e) {
                            var _a;
                            var name = e.name, rest = __rest(e, ["name"]);
                            return __assign({ id: (_a = equipmentNameToIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                        }),
                        personnel: (_e = diff.personnel) === null || _e === void 0 ? void 0 : _e.map(function (p) {
                            var _a;
                            var name = p.name, rest = __rest(p, ["name"]);
                            return __assign({ id: (_a = personnelNameToIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                        }),
                        supplies: (_f = diff.supplies) === null || _f === void 0 ? void 0 : _f.map(function (s) {
                            var _a;
                            var name = s.name, rest = __rest(s, ["name"]);
                            return __assign({ id: (_a = supplyNameToIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                        }),
                    }
                    : undefined;
                return __assign(__assign({}, rest), { update: newUpdate, diff: newDiff });
            });
            var status = undefined;
            if (unit.status) {
                status = tempUnitStatusIdMap[unit.status] || addUnitStatus({ name: unit.status });
            }
            var id = newIds ? (0, utils_1.nanoid)() : ((_g = unit.id) !== null && _g !== void 0 ? _g : (0, utils_1.nanoid)());
            if (id in store.state.unitMap) {
                console.warn("Unit  ".concat(unit.name, " with id ").concat(id, " already exists in the scenario. Creating new id."));
                id = (0, utils_1.nanoid)();
            }
            var newUnit = __assign(__assign({}, unit), { id: id, sidc: (0, helpers_ts_1.setSid)(unit.sidc, side.standardIdentity), subUnits: [], equipment: equipment, personnel: personnel, supplies: supplies, state: internalUnitState, rangeRings: rangeRings, status: status });
            unitActions.addUnit(newUnit, parentId, undefined, { noUndo: noUndo, s: s });
            (_h = unit.subUnits) === null || _h === void 0 ? void 0 : _h.forEach(function (child) { return helper(child, newUnit.id); });
        }
        helper(rootUnit, parentId);
        // copy over custom symbols used by the source scenario
        sourceCustomSymbolIds.forEach(function (csid) {
            if (!s.customSymbolMap[csid]) {
                var sourceSymbol = sourceState === null || sourceState === void 0 ? void 0 : sourceState.customSymbolMap[csid];
                if (sourceSymbol) {
                    s.customSymbolMap[csid] = (0, klona_1.klona)(sourceSymbol);
                }
            }
        });
    });
}
