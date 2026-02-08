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
exports.convertStateToInternalFormat = convertStateToInternalFormat;
exports.prepareScenario = prepareScenario;
exports.useNewScenarioStore = useNewScenarioStore;
var immerStore_1 = require("@/composables/immerStore");
var dayjs_1 = require("dayjs");
var utils_1 = require("@/utils");
var scenarioStore_1 = require("@/stores/scenarioStore");
var klona_1 = require("klona");
var time_1 = require("./time");
var constants_1 = require("@/config/constants");
var upgrade_1 = require("@/scenariostore/upgrade");
var colors_ts_1 = require("@/config/colors.ts");
function convertStateToInternalFormat(e) {
    return __assign(__assign({}, e), { t: +(0, dayjs_1.default)(e.t), viaStartTime: e.viaStartTime !== undefined ? +(0, dayjs_1.default)(e.viaStartTime) : undefined, id: e.id || (0, utils_1.nanoid)() });
}
function prepareScenario(newScenario) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    var unitMap = {};
    var sideMap = {};
    var sideGroupMap = {};
    var eventMap = {};
    var sides = [];
    var layers = [];
    var mapLayers = [];
    var layerMap = {};
    var featureMap = {};
    var mapLayerMap = {};
    var equipmentMap = {};
    var personnelMap = {};
    var supplyCategoryMap = {};
    var rangeRingGroupMap = {};
    var unitStatusMap = {};
    var supplyClassMap = {};
    var supplyUoMMap = {};
    var symbolFillColorMap = {};
    var customSymbolMap = {};
    var tempSymbolFillColors = new Set();
    var tempEquipmentIdMap = {};
    var tempPersonnelIdMap = {};
    var tempSuppliesIdMap = {};
    var tempRangeRingGroupIdMap = {};
    var tempUnitStatusIdMap = {};
    var tempSupplyClassIdMap = {};
    var tempSupplyUomIdMap = {};
    var scenario = (0, upgrade_1.upgradeScenarioIfNecessary)(newScenario);
    var scenarioId = (_a = scenario.id) !== null && _a !== void 0 ? _a : (0, utils_1.nanoid)();
    var mapSettings = (_c = (_b = scenario.settings) === null || _b === void 0 ? void 0 : _b.map) !== null && _c !== void 0 ? _c : {
        baseMapId: constants_1.DEFAULT_BASEMAP_ID,
    };
    var unitStateCounter = 0;
    var featureStateCounter = 0;
    var settingsStateCounter = 0;
    scenario.events.forEach(function (e) {
        var _a;
        var nEvent = __assign(__assign({}, e), { startTime: +(0, dayjs_1.default)(e.startTime), id: (_a = e.id) !== null && _a !== void 0 ? _a : (0, utils_1.nanoid)(), _type: "scenario" });
        eventMap[nEvent.id] = nEvent;
    });
    (_e = (_d = scenario.settings) === null || _d === void 0 ? void 0 : _d.statuses) === null || _e === void 0 ? void 0 : _e.forEach(function (s) {
        var id = (0, utils_1.nanoid)();
        tempUnitStatusIdMap[s.name] = id;
        unitStatusMap[id] = __assign(__assign({}, s), { id: id });
    });
    (_g = (_f = scenario.settings) === null || _f === void 0 ? void 0 : _f.supplyClasses) === null || _g === void 0 ? void 0 : _g.forEach(function (s) {
        var id = (0, utils_1.nanoid)();
        supplyClassMap[id] = __assign(__assign({}, s), { id: id });
        tempSupplyClassIdMap[s.name] = id;
    });
    (_j = (_h = scenario.settings) === null || _h === void 0 ? void 0 : _h.supplyUoMs) === null || _j === void 0 ? void 0 : _j.forEach(function (s) {
        var id = (0, utils_1.nanoid)();
        supplyUoMMap[id] = __assign(__assign({}, s), { id: id });
        tempSupplyUomIdMap[s.name] = id;
    });
    (_l = (_k = scenario.settings) === null || _k === void 0 ? void 0 : _k.customSymbols) === null || _l === void 0 ? void 0 : _l.forEach(function (s) {
        customSymbolMap[s.id] = s;
    });
    colors_ts_1.SYMBOL_FILL_COLORS.forEach(function (s) { return tempSymbolFillColors.add(s.code); });
    (_o = (_m = scenario.settings) === null || _m === void 0 ? void 0 : _m.symbolFillColors) === null || _o === void 0 ? void 0 : _o.forEach(function (s) {
        var id = (0, utils_1.nanoid)();
        symbolFillColorMap[id] = __assign(__assign({}, s), { id: id });
        tempSymbolFillColors.add(s.code);
    });
    if (scenario.startTime !== undefined) {
        scenario.startTime = +(0, dayjs_1.default)(scenario.startTime);
    }
    function prepareUnit(unit1, level, parent, sideGroup, side) {
        var _a, _b, _c, _d, _e, _f;
        var unit = (0, klona_1.klona)(unit1);
        if (!unit.id) {
            unit.id = (0, utils_1.nanoid)();
        }
        checkFillColor(unit);
        unit._pid = parent.id;
        unit._isOpen = false;
        unit._gid = sideGroup === null || sideGroup === void 0 ? void 0 : sideGroup.id;
        unit._sid = side.id;
        var equipment = [];
        var personnel = [];
        var supplies = [];
        var rangeRings = [];
        (_a = unit.equipment) === null || _a === void 0 ? void 0 : _a.forEach(function (_a) {
            var name = _a.name, count = _a.count;
            var id = tempEquipmentIdMap[name] || addEquipment({ name: name });
            equipment.push({ id: id, count: count });
        });
        (_b = unit.personnel) === null || _b === void 0 ? void 0 : _b.forEach(function (_a) {
            var name = _a.name, count = _a.count;
            var id = tempPersonnelIdMap[name] || addPersonnel({ name: name });
            personnel.push({ id: id, count: count });
        });
        (_c = unit.supplies) === null || _c === void 0 ? void 0 : _c.forEach(function (s) {
            var count = s.count, onHand = s.onHand, name = s.name;
            var id = tempSuppliesIdMap[s.name] || addSupplyCategory(s);
            supplies.push({ id: id, count: count, onHand: onHand });
        });
        (_d = unit.rangeRings) === null || _d === void 0 ? void 0 : _d.forEach(function (rr) {
            var group = rr.group, style = rr.style, rest = __rest(rr, ["group", "style"]);
            if (group) {
                var groupId = tempRangeRingGroupIdMap[group] || addRangeRingGroup({ name: group });
                rangeRings.push(__assign(__assign({}, rest), { group: groupId }));
            }
            else {
                rangeRings.push(rr);
            }
        });
        if (unit.status) {
            unit.status =
                tempUnitStatusIdMap[unit.status] || addUnitStatus({ name: unit.status });
        }
        // convert state as last step since it may reference other entities
        if (!unit.state) {
            unit.state = [];
        }
        else {
            unit.state = unit.state.map(convertStateToInternalFormat);
        }
        (_e = unit.state) === null || _e === void 0 ? void 0 : _e.filter(function (s) { return s.status; }).forEach(function (s) {
            s.status = tempUnitStatusIdMap[s.status] || addUnitStatus({ name: s.status });
        });
        unit._state = null;
        var newState = unit.state.map(function (s) {
            var _a, _b, _c, _d, _e, _f;
            var update = s.update, diff = s.diff, rest = __rest(s, ["update", "diff"]);
            checkFillColor(s);
            var newUpdate = update
                ? {
                    equipment: (_a = update.equipment) === null || _a === void 0 ? void 0 : _a.map(function (e) {
                        var _a;
                        var name = e.name, rest = __rest(e, ["name"]);
                        return __assign({ id: (_a = tempEquipmentIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                    }),
                    personnel: (_b = update.personnel) === null || _b === void 0 ? void 0 : _b.map(function (p) {
                        var _a;
                        var name = p.name, rest = __rest(p, ["name"]);
                        return __assign({ id: (_a = tempPersonnelIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                    }),
                    supplies: (_c = update.supplies) === null || _c === void 0 ? void 0 : _c.map(function (s) {
                        var _a;
                        var name = s.name, rest = __rest(s, ["name"]);
                        return __assign({ id: (_a = tempSuppliesIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                    }),
                }
                : undefined;
            var newDiff = diff
                ? {
                    equipment: (_d = diff.equipment) === null || _d === void 0 ? void 0 : _d.map(function (e) {
                        var _a;
                        var name = e.name, rest = __rest(e, ["name"]);
                        return __assign({ id: (_a = tempEquipmentIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                    }),
                    personnel: (_e = diff.personnel) === null || _e === void 0 ? void 0 : _e.map(function (p) {
                        var _a;
                        var name = p.name, rest = __rest(p, ["name"]);
                        return __assign({ id: (_a = tempPersonnelIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                    }),
                    supplies: (_f = diff.supplies) === null || _f === void 0 ? void 0 : _f.map(function (s) {
                        var _a;
                        var name = s.name, rest = __rest(s, ["name"]);
                        return __assign({ id: (_a = tempSuppliesIdMap[name]) !== null && _a !== void 0 ? _a : name }, rest);
                    }),
                }
                : undefined;
            return __assign(__assign({}, rest), { update: newUpdate, diff: newDiff });
        });
        unitMap[unit1.id] = __assign(__assign({}, unit), { subUnits: ((_f = unit.subUnits) === null || _f === void 0 ? void 0 : _f.map(function (u) { return u.id; })) || [], equipment: equipment, personnel: personnel, supplies: supplies, rangeRings: rangeRings, state: newState });
    }
    (_p = scenario.equipment) === null || _p === void 0 ? void 0 : _p.forEach(function (e) {
        addEquipment(e);
    });
    (_q = scenario.personnel) === null || _q === void 0 ? void 0 : _q.forEach(function (e) {
        addPersonnel(e);
    });
    (_r = scenario.supplyCategories) === null || _r === void 0 ? void 0 : _r.forEach(function (s) {
        addSupplyCategory(s);
    });
    (_t = (_s = scenario.settings) === null || _s === void 0 ? void 0 : _s.rangeRingGroups) === null || _t === void 0 ? void 0 : _t.forEach(function (g) {
        addRangeRingGroup(g);
    });
    function addPersonnel(p) {
        var id = (0, utils_1.nanoid)();
        tempPersonnelIdMap[p.name] = id;
        personnelMap[id] = __assign(__assign({}, p), { id: id });
        return id;
    }
    function addEquipment(e) {
        var id = (0, utils_1.nanoid)();
        tempEquipmentIdMap[e.name] = id;
        equipmentMap[id] = __assign(__assign({}, e), { id: id });
        return id;
    }
    function addSupplyCategory(s) {
        var _a, _b;
        var id = (0, utils_1.nanoid)();
        var sc = __assign(__assign({}, s), { id: id });
        if (sc.supplyClass) {
            sc.supplyClass =
                (_a = tempSupplyClassIdMap[sc.supplyClass]) !== null && _a !== void 0 ? _a : addSupplyClass({ name: sc.supplyClass });
        }
        if (sc.uom) {
            sc.uom = (_b = tempSupplyUomIdMap[sc.uom]) !== null && _b !== void 0 ? _b : addSupplyUom({ name: sc.uom });
        }
        tempSuppliesIdMap[s.name] = id;
        supplyCategoryMap[id] = __assign(__assign({}, sc), { id: id });
        return id;
    }
    function addRangeRingGroup(g) {
        var id = (0, utils_1.nanoid)();
        tempRangeRingGroupIdMap[g.name] = id;
        rangeRingGroupMap[id] = __assign(__assign({}, g), { id: id });
        return id;
    }
    function addUnitStatus(s) {
        var id = (0, utils_1.nanoid)();
        tempUnitStatusIdMap[s.name] = id;
        unitStatusMap[id] = __assign(__assign({}, s), { id: id });
        return id;
    }
    function addSupplyClass(s) {
        var id = (0, utils_1.nanoid)();
        tempSupplyClassIdMap[s.name] = id;
        supplyClassMap[id] = __assign(__assign({}, s), { id: id });
        return id;
    }
    function addSupplyUom(s) {
        var id = (0, utils_1.nanoid)();
        tempSupplyUomIdMap[s.name] = id;
        supplyUoMMap[id] = __assign(__assign({}, s), { id: id });
        return id;
    }
    function checkFillColor(item) {
        var _a;
        if ((_a = item.symbolOptions) === null || _a === void 0 ? void 0 : _a.fillColor) {
            if (!tempSymbolFillColors.has(item.symbolOptions.fillColor)) {
                var newColor = {
                    id: (0, utils_1.nanoid)(),
                    text: "Custom color (".concat(item.symbolOptions.fillColor, ")"),
                    code: item.symbolOptions.fillColor,
                };
                symbolFillColorMap[newColor.id] = newColor;
                tempSymbolFillColors.add(item.symbolOptions.fillColor);
            }
        }
    }
    scenario.sides.forEach(function (side) {
        var _a, _b;
        sideMap[side.id] = __assign(__assign({}, side), { groups: side.groups.map(function (group) { return group.id; }), subUnits: (_b = (_a = side.subUnits) === null || _a === void 0 ? void 0 : _a.map(function (unit) { return unit.id; })) !== null && _b !== void 0 ? _b : [] });
        sides.push(side.id);
        checkFillColor(side);
        side.groups.forEach(function (group) {
            sideGroupMap[group.id] = __assign(__assign({}, group), { _pid: side.id, subUnits: group.subUnits.map(function (unit) { return unit.id; }) });
            checkFillColor(group);
        });
        (0, scenarioStore_1.walkSide)(side, prepareUnit);
    });
    var info = {
        name: scenario.name,
        startTime: scenario.startTime,
        timeZone: scenario.timeZone,
        description: scenario.description,
        symbologyStandard: scenario.symbologyStandard,
    };
    function mapVisibility(l) {
        var r = __assign({}, l);
        if (l.visibleFromT !== undefined) {
            r.visibleFromT = +(0, dayjs_1.default)(l.visibleFromT);
        }
        if (l.visibleUntilT !== undefined) {
            r.visibleUntilT = +(0, dayjs_1.default)(l.visibleUntilT);
        }
        return r;
    }
    scenario.layers.forEach(function (layer) {
        layers.push(layer.id);
        layerMap[layer.id] = __assign(__assign({}, mapVisibility(layer)), { features: layer.features.map(function (f) { return f.id; }) });
        layer.features.forEach(function (feature) {
            var _a;
            var tmp = __assign({}, feature);
            tmp.state = (_a = tmp.state) === null || _a === void 0 ? void 0 : _a.map(function (s) { return (__assign(__assign({}, s), { t: +(0, dayjs_1.default)(s.t), id: s.id || (0, utils_1.nanoid)() })); });
            tmp.meta = mapVisibility(tmp.meta);
            featureMap[feature.id] = __assign(__assign({}, tmp), { _pid: layer.id });
        });
    });
    (_u = scenario.mapLayers) === null || _u === void 0 ? void 0 : _u.forEach(function (layer) {
        mapLayers.push(layer.id);
        mapLayerMap[layer.id] = __assign(__assign({}, layer), mapVisibility(layer));
    });
    var events = Object.values(eventMap).map(function (e) { return e.id; });
    events.sort(function (la, lb) {
        var a = eventMap[la].startTime;
        var b = eventMap[lb].startTime;
        return a < b ? -1 : a > b ? 1 : 0;
    });
    var meta = {
        createdDate: (_w = (_v = scenario.meta) === null || _v === void 0 ? void 0 : _v.createdDate) !== null && _w !== void 0 ? _w : new Date().toISOString(),
        lastModifiedDate: (_y = (_x = scenario.meta) === null || _x === void 0 ? void 0 : _x.lastModifiedDate) !== null && _y !== void 0 ? _y : new Date().toISOString(),
    };
    return {
        id: scenarioId,
        meta: meta,
        layers: layers,
        mapLayers: mapLayers,
        mapLayerMap: mapLayerMap,
        layerMap: layerMap,
        featureMap: featureMap,
        eventMap: eventMap,
        currentTime: scenario.startTime || 0,
        info: info,
        sides: sides,
        unitMap: unitMap,
        sideMap: sideMap,
        sideGroupMap: sideGroupMap,
        events: events,
        equipmentMap: equipmentMap,
        personnelMap: personnelMap,
        supplyCategoryMap: supplyCategoryMap,
        supplyClassMap: supplyClassMap,
        supplyUomMap: supplyUoMMap,
        rangeRingGroupMap: rangeRingGroupMap,
        unitStateCounter: unitStateCounter,
        featureStateCounter: featureStateCounter,
        settingsStateCounter: settingsStateCounter,
        unitStatusMap: unitStatusMap,
        mapSettings: mapSettings,
        symbolFillColorMap: symbolFillColorMap,
        customSymbolMap: customSymbolMap,
        boundingBox: (_0 = (_z = scenario.settings) === null || _z === void 0 ? void 0 : _z.boundingBox) !== null && _0 !== void 0 ? _0 : null,
    };
}
function useNewScenarioStore(data) {
    var inputState = prepareScenario(data);
    var store = (0, immerStore_1.useImmerStore)(inputState);
    (0, time_1.useScenarioTime)(store).setCurrentTime(store.state.currentTime);
    return store;
}
