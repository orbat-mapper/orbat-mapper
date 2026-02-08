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
exports.createInitialState = createInitialState;
exports.updateCurrentUnitState = updateCurrentUnitState;
exports.useScenarioTime = useScenarioTime;
var dayjs_1 = require("dayjs");
var vue_1 = require("vue");
var length_1 = require("@turf/length");
var along_1 = require("@turf/along");
var helpers_1 = require("@turf/helpers");
var klona_1 = require("klona");
var core_1 = require("@vueuse/core");
var unitStyles_1 = require("@/geo/unitStyles");
var utils_1 = require("@/utils");
var militaryTimeZones_1 = require("@/utils/militaryTimeZones");
function createInitialState(unit) {
    var _a, _b, _c;
    if (unit.location ||
        ((_a = unit.equipment) === null || _a === void 0 ? void 0 : _a.length) ||
        ((_b = unit.personnel) === null || _b === void 0 ? void 0 : _b.length) ||
        ((_c = unit.supplies) === null || _c === void 0 ? void 0 : _c.length))
        return {
            t: Number.MIN_SAFE_INTEGER,
            location: unit.location,
            type: "initial",
            sidc: unit.sidc,
            equipment: (0, klona_1.klona)(unit.equipment),
            personnel: (0, klona_1.klona)(unit.personnel),
            supplies: (0, klona_1.klona)(unit.supplies),
        };
    return null;
}
function updateCurrentUnitState(unit, timestamp) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (!unit.state || !unit.state.length) {
        if (!unit._state) {
            unit._state = createInitialState(unit);
        }
        return;
    }
    var currentState = createInitialState(unit);
    for (var _i = 0, _l = unit.state; _i < _l.length; _i++) {
        var s = _l[_i];
        if (s.t <= timestamp) {
            var diff = s.diff, update = s.update, rest = __rest(s, ["diff", "update"]);
            if ((update === null || update === void 0 ? void 0 : update.equipment) && (currentState === null || currentState === void 0 ? void 0 : currentState.equipment)) {
                var _loop_1 = function (e) {
                    var idx = currentState.equipment.findIndex(function (ee) { return ee.id === e.id; });
                    if (idx !== -1) {
                        currentState.equipment[idx] = __assign(__assign({}, currentState.equipment[idx]), e);
                    }
                    else {
                        console.warn("Equipment not found", e);
                    }
                };
                for (var _m = 0, _o = update.equipment; _m < _o.length; _m++) {
                    var e = _o[_m];
                    _loop_1(e);
                }
            }
            if ((update === null || update === void 0 ? void 0 : update.personnel) && (currentState === null || currentState === void 0 ? void 0 : currentState.personnel)) {
                var _loop_2 = function (p) {
                    var idx = currentState.personnel.findIndex(function (pp) { return pp.id === p.id; });
                    if (idx !== -1) {
                        currentState.personnel[idx] = __assign(__assign({}, currentState.personnel[idx]), p);
                    }
                    else {
                        console.warn("Personnel not found", p);
                    }
                };
                for (var _p = 0, _q = update.personnel; _p < _q.length; _p++) {
                    var p = _q[_p];
                    _loop_2(p);
                }
            }
            if ((update === null || update === void 0 ? void 0 : update.supplies) && (currentState === null || currentState === void 0 ? void 0 : currentState.supplies)) {
                var _loop_3 = function (p) {
                    var idx = currentState.supplies.findIndex(function (pp) { return pp.id === p.id; });
                    if (idx !== -1) {
                        currentState.supplies[idx] = __assign(__assign({}, currentState.supplies[idx]), p);
                    }
                    else {
                        console.warn("Supplies not found", p);
                    }
                };
                for (var _r = 0, _s = update.supplies; _r < _s.length; _r++) {
                    var p = _s[_r];
                    _loop_3(p);
                }
            }
            if ((diff === null || diff === void 0 ? void 0 : diff.equipment) && (currentState === null || currentState === void 0 ? void 0 : currentState.equipment)) {
                var _loop_4 = function (e) {
                    var idx = currentState.equipment.findIndex(function (ee) { return ee.id === e.id; });
                    if (idx !== -1) {
                        var eq = currentState.equipment[idx];
                        var onHand = ((_a = eq === null || eq === void 0 ? void 0 : eq.onHand) !== null && _a !== void 0 ? _a : eq.count) + ((_b = e.onHand) !== null && _b !== void 0 ? _b : 0);
                        currentState.equipment[idx] = __assign(__assign({}, currentState.equipment[idx]), { onHand: onHand });
                    }
                    else {
                        console.warn("Equipment not found", e);
                    }
                };
                for (var _t = 0, _u = diff.equipment; _t < _u.length; _t++) {
                    var e = _u[_t];
                    _loop_4(e);
                }
            }
            if ((diff === null || diff === void 0 ? void 0 : diff.personnel) && (currentState === null || currentState === void 0 ? void 0 : currentState.personnel)) {
                var _loop_5 = function (p) {
                    var idx = currentState.personnel.findIndex(function (pp) { return pp.id === p.id; });
                    if (idx !== -1) {
                        var pe = currentState.personnel[idx];
                        var onHand = ((_c = pe === null || pe === void 0 ? void 0 : pe.onHand) !== null && _c !== void 0 ? _c : pe.count) + ((_d = p.onHand) !== null && _d !== void 0 ? _d : 0);
                        currentState.personnel[idx] = __assign(__assign({}, currentState.personnel[idx]), { onHand: onHand });
                    }
                    else {
                        console.warn("Personnel not found", p);
                    }
                };
                for (var _v = 0, _w = diff.personnel; _v < _w.length; _v++) {
                    var p = _w[_v];
                    _loop_5(p);
                }
            }
            if ((diff === null || diff === void 0 ? void 0 : diff.supplies) && (currentState === null || currentState === void 0 ? void 0 : currentState.supplies)) {
                var _loop_6 = function (p) {
                    var idx = currentState.supplies.findIndex(function (pp) { return pp.id === p.id; });
                    if (idx !== -1) {
                        var pe = currentState.supplies[idx];
                        var onHand = ((_e = pe === null || pe === void 0 ? void 0 : pe.onHand) !== null && _e !== void 0 ? _e : pe.count) + ((_f = p.onHand) !== null && _f !== void 0 ? _f : 0);
                        currentState.supplies[idx] = __assign(__assign({}, currentState.supplies[idx]), { onHand: onHand });
                    }
                    else {
                        console.warn("Supplies not found", p);
                    }
                };
                for (var _x = 0, _y = diff.supplies; _x < _y.length; _x++) {
                    var p = _y[_x];
                    _loop_6(p);
                }
            }
            currentState = __assign(__assign({}, currentState), rest);
        }
        else {
            if ((currentState === null || currentState === void 0 ? void 0 : currentState.location) &&
                s.location &&
                !(s.interpolate === false) &&
                ((_g = s.viaStartTime) !== null && _g !== void 0 ? _g : -Infinity) <= timestamp) {
                var n = (0, helpers_1.lineString)(s.via
                    ? __spreadArray(__spreadArray([currentState.location], s.via, true), [s.location], false) : [currentState.location, s.location]);
                var timeDiff = s.t - ((_h = s.viaStartTime) !== null && _h !== void 0 ? _h : currentState.t);
                var pathLength = (0, length_1.default)(n);
                var averageSpeed = pathLength / timeDiff;
                var p = (0, along_1.default)(n, averageSpeed * (timestamp - ((_j = s.viaStartTime) !== null && _j !== void 0 ? _j : currentState.t)));
                currentState = __assign(__assign({}, currentState), { t: timestamp, location: p.geometry.coordinates, type: "interpolated" });
            }
            break;
        }
    }
    if ((currentState === null || currentState === void 0 ? void 0 : currentState.sidc) !== ((_k = unit._state) === null || _k === void 0 ? void 0 : _k.sidc)) {
        unit._ikey = undefined;
        (0, unitStyles_1.invalidateUnitStyle)(unit.id);
    }
    unit._state = currentState;
}
function createInitialFeatureState(feature) {
    return {
        t: Number.MIN_SAFE_INTEGER,
        geometry: feature.geometry,
    };
}
function useScenarioTime(store) {
    var state = store.state, update = store.update;
    var goToScenarioEventHook = (0, core_1.createEventHook)();
    function setCurrentTime(timestamp) {
        Object.values(state.unitMap).forEach(function (unit) {
            return updateCurrentUnitState(unit, timestamp);
        });
        Object.values(state.layerMap).forEach(function (layer) {
            var visibleFromT = layer.visibleFromT || Number.MIN_SAFE_INTEGER;
            var visibleUntilT = layer.visibleUntilT || Number.MAX_SAFE_INTEGER;
            layer._hidden = timestamp <= visibleFromT || timestamp >= visibleUntilT;
            layer.features.forEach(function (featureId) {
                var _a;
                var feature = state.featureMap[featureId];
                var visibleFromT = feature.meta.visibleFromT || Number.MIN_SAFE_INTEGER;
                var visibleUntilT = feature.meta.visibleUntilT || Number.MAX_SAFE_INTEGER;
                if (!feature)
                    return;
                feature._hidden =
                    timestamp <= visibleFromT ||
                        timestamp >= visibleUntilT ||
                        !!feature.meta.isHidden;
                if ((_a = feature.state) === null || _a === void 0 ? void 0 : _a.length) {
                    var currentState = createInitialFeatureState(feature);
                    for (var _i = 0, _b = feature.state; _i < _b.length; _i++) {
                        var s = _b[_i];
                        if (s.t <= timestamp) {
                            currentState = __assign(__assign({}, currentState), s);
                        }
                        else {
                            break;
                        }
                    }
                    feature._state = currentState;
                }
            });
        });
        state.currentTime = timestamp;
    }
    function add(amount, unit, normalize) {
        if (normalize === void 0) { normalize = false; }
        var newTime = normalize
            ? (0, dayjs_1.default)(state.currentTime)
                .add(amount, unit)
                .tz((0, militaryTimeZones_1.resolveTimeZone)(timeZone.value || "UTC"))
                .hour(12)
            : (0, dayjs_1.default)(state.currentTime).add(amount, unit);
        setCurrentTime(newTime.valueOf());
    }
    function subtract(amount, unit, normalize) {
        if (normalize === void 0) { normalize = false; }
        var newTime = normalize
            ? (0, dayjs_1.default)(state.currentTime)
                .subtract(amount, unit)
                .tz((0, militaryTimeZones_1.resolveTimeZone)(timeZone.value || "UTC"))
                .hour(12)
            : (0, dayjs_1.default)(state.currentTime).subtract(amount, unit);
        setCurrentTime(newTime.valueOf());
    }
    function jumpToNextEvent() {
        var newTime = Number.MAX_SAFE_INTEGER;
        Object.values(state.unitMap).forEach(function (unit) {
            var _a;
            if (!((_a = unit === null || unit === void 0 ? void 0 : unit.state) === null || _a === void 0 ? void 0 : _a.length)) {
                return;
            }
            for (var _i = 0, _b = unit.state; _i < _b.length; _i++) {
                var s = _b[_i];
                if (s.t > state.currentTime) {
                    if (s.t < newTime)
                        newTime = s.t;
                    break;
                }
            }
        });
        if (newTime < Number.MAX_SAFE_INTEGER)
            setCurrentTime(newTime);
    }
    function jumpToPrevEvent() {
        var newTime = Number.MIN_SAFE_INTEGER;
        Object.values(state.unitMap).forEach(function (unit) {
            var _a;
            if (!((_a = unit === null || unit === void 0 ? void 0 : unit.state) === null || _a === void 0 ? void 0 : _a.length)) {
                return;
            }
            for (var _i = 0, _b = unit.state; _i < _b.length; _i++) {
                var s = _b[_i];
                if (s.t < state.currentTime) {
                    if (s.t > newTime)
                        newTime = s.t;
                    break;
                }
            }
        });
        if (newTime > Number.MIN_SAFE_INTEGER)
            setCurrentTime(newTime);
    }
    function computeTimeHistogram() {
        var histogram = {};
        var max = 1;
        Object.values(state.unitMap).forEach(function (unit) {
            ((unit === null || unit === void 0 ? void 0 : unit.state) || []).forEach(function (s) {
                // round to nearest hour
                var t = Math.round(s.t / 3600000) * 3600000;
                histogram[t] = (histogram[t] || 0) + 1;
                max = Math.max(max, histogram[t]);
            });
        });
        Object.values(state.featureMap).forEach(function (feature) {
            ((feature === null || feature === void 0 ? void 0 : feature.state) || []).forEach(function (s) {
                // round to nearest hour
                var t = Math.round(s.t / 3600000) * 3600000;
                histogram[t] = (histogram[t] || 0) + 1;
                max = Math.max(max, histogram[t]);
            });
        });
        return {
            histogram: Object.entries(histogram).map(function (_a) {
                var k = _a[0], v = _a[1];
                return ({ t: +k, count: v });
            }),
            max: max,
        };
    }
    function goToNextScenarioEvent(options) {
        if (options === void 0) { options = {}; }
        var nextEventId = state.events.find(function (event) { return state.eventMap[event].startTime > state.currentTime; });
        var nextEvent = nextEventId && state.eventMap[nextEventId];
        var newTime = nextEvent ? nextEvent.startTime : Number.MAX_SAFE_INTEGER;
        if (newTime < Number.MAX_SAFE_INTEGER)
            goToScenarioEvent(nextEvent, options);
    }
    function goToPrevScenarioEvent(options) {
        if (options === void 0) { options = {}; }
        var prevEventId = state.events
            .slice()
            .reverse()
            .find(function (event) { return state.eventMap[event].startTime < state.currentTime; });
        var prevEvent = prevEventId && state.eventMap[prevEventId];
        var newTime = prevEvent ? prevEvent.startTime : Number.MIN_SAFE_INTEGER;
        if (newTime > Number.MIN_SAFE_INTEGER)
            goToScenarioEvent(prevEvent, options);
    }
    function goToScenarioEvent(eventOrEventId, options) {
        if (options === void 0) { options = {}; }
        var event = typeof eventOrEventId === "string"
            ? state.eventMap[eventOrEventId]
            : eventOrEventId;
        if (event) {
            setCurrentTime(event.startTime);
            if (!options.silent) {
                goToScenarioEventHook.trigger({ event: event }).then();
            }
        }
    }
    var utcTime = (0, vue_1.computed)(function () {
        return dayjs_1.default.utc(state.currentTime);
    });
    var scenarioTime = (0, vue_1.computed)(function () {
        return (0, dayjs_1.default)(state.currentTime).tz((0, militaryTimeZones_1.resolveTimeZone)(state.info.timeZone || "UTC"));
    });
    var timeZone = (0, vue_1.computed)(function () {
        return state.info.timeZone;
    });
    function getEventById(id) {
        return state.eventMap[id];
    }
    function addScenarioEvent(event) {
        var newEvent = (0, klona_1.klona)(event);
        if (!newEvent.id)
            newEvent.id = (0, utils_1.nanoid)();
        if (!newEvent._type)
            newEvent._type = "scenario";
        update(function (s) {
            s.events.push(newEvent.id);
            s.eventMap[newEvent.id] = newEvent;
            s.events.sort(function (a, b) { return s.eventMap[a].startTime - s.eventMap[b].startTime; });
        });
        return newEvent.id;
    }
    function deleteScenarioEvent(id) {
        update(function (s) {
            s.events = s.events.filter(function (e) { return e !== id; });
            delete s.eventMap[id];
        });
    }
    function updateScenarioEvent(id, data) {
        var event = getEventById(id);
        if (!event)
            return;
        if (event._type === "scenario") {
            update(function (s) {
                var e = s.eventMap[id];
                if (!e)
                    return;
                s.eventMap[e.id] = (0, klona_1.klona)(Object.assign(e, __assign({}, data)));
                if ("startTime" in data) {
                    s.events.sort(function (a, b) { return s.eventMap[a].startTime - s.eventMap[b].startTime; });
                }
            });
        }
        else {
            console.warn("Cannot update non-scenario event yet");
        }
    }
    return {
        setCurrentTime: setCurrentTime,
        add: add,
        subtract: subtract,
        utcTime: utcTime,
        scenarioTime: scenarioTime,
        timeZone: timeZone,
        jumpToNextEvent: jumpToNextEvent,
        jumpToPrevEvent: jumpToPrevEvent,
        goToScenarioEvent: goToScenarioEvent,
        goToNextScenarioEvent: goToNextScenarioEvent,
        goToPrevScenarioEvent: goToPrevScenarioEvent,
        getEventById: getEventById,
        addScenarioEvent: addScenarioEvent,
        updateScenarioEvent: updateScenarioEvent,
        deleteScenarioEvent: deleteScenarioEvent,
        computeTimeHistogram: computeTimeHistogram,
        onGoToScenarioEventEvent: goToScenarioEventHook.on,
    };
}
