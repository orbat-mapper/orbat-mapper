"use strict";
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
exports.useUnitHistory = useUnitHistory;
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var proj_1 = require("ol/proj");
var history_1 = require("@/geo/history");
var Modify_1 = require("ol/interaction/Modify");
var vue_1 = require("vue");
var selectedStore_1 = require("@/stores/selectedStore");
var condition_1 = require("ol/events/condition");
var Select_1 = require("ol/interaction/Select");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
var selectedWaypoints_1 = require("@/stores/selectedWaypoints");
var olInteractions_1 = require("@/geo/olInteractions");
var sphere_1 = require("ol/sphere");
var convert_1 = require("@/utils/convert");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
function squaredDistance(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    return dx * dx + dy * dy;
}
function deleteCondition(mapBrowserEvent) {
    return (0, condition_1.altKeyOnly)(mapBrowserEvent) && (0, condition_1.singleClick)(mapBrowserEvent);
}
var ctrlKeyOnly = function (mapBrowserEvent) {
    var originalEvent = 
    /** @type {KeyboardEvent|MouseEvent|TouchEvent} */ mapBrowserEvent.originalEvent;
    return ((originalEvent.metaKey || originalEvent.ctrlKey) &&
        !originalEvent.shiftKey &&
        !originalEvent.altKey);
};
/**
 * Code for displaying and manipulating unit history on the map
 */
function useUnitHistory(olMap, options) {
    if (options === void 0) { options = {}; }
    var showHistoryRef = (0, vue_1.ref)(options.showHistory || true);
    var editHistoryRef = (0, vue_1.ref)(options.editHistory || true);
    var showWaypointTimestampsRef = (0, vue_1.ref)(options.showWaypointTimestamps || true);
    var isInternal = false;
    var selectedWaypointIds = (0, selectedWaypoints_1.useSelectedWaypoints)().selectedWaypointIds;
    selectedWaypointIds.value.clear();
    var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), geo = _a.geo, unitActions = _a.unitActions, _b = _a.store, onUndoRedo = _b.onUndoRedo, state = _b.state, getUnitById = _a.helpers.getUnitById;
    var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
    var selectedUnitIds = (0, selectedStore_1.useSelectedItems)().selectedUnitIds;
    var _c = (0, history_1.createUnitHistoryLayers)(), waypointLayer = _c.waypointLayer, historyLayer = _c.historyLayer, legLayer = _c.legLayer, viaLayer = _c.viaLayer, arcLayer = _c.arcLayer, labelsLayer = _c.labelsLayer;
    var ctrlClickInteraction = new olInteractions_1.MapCtrlClick({ handleCtrlClickEvent: handleCtrlClickEvent });
    ctrlClickInteraction.setActive(false);
    var waypointSelect = new Select_1.default({
        layers: [waypointLayer, labelsLayer],
        condition: condition_1.click,
        style: function (feature) {
            history_1.labelStyle.getText().setText(feature.get("label") || "");
            return [history_1.selectedWaypointStyle, history_1.labelStyle];
        },
    });
    function handleCtrlClickEvent(event) {
        var clickPosition = (0, proj_1.toLonLat)(olMap.getEventCoordinate(event.originalEvent));
        selectedUnitIds.value.forEach(function (unitId) {
            var _a, _b, _c;
            var unit = getUnitById(unitId);
            if (!unit)
                return;
            var lastLocationEntry = (_a = unit.state) === null || _a === void 0 ? void 0 : _a.filter(function (s) { return s.location; }).pop();
            var newTime = undefined;
            if (lastLocationEntry) {
                var location_1 = lastLocationEntry.location, t = lastLocationEntry.t;
                var distance = (0, sphere_1.getDistance)(location_1, clickPosition);
                var speedValue = ((_b = unit.properties) === null || _b === void 0 ? void 0 : _b.averageSpeed) || ((_c = unit.properties) === null || _c === void 0 ? void 0 : _c.maxSpeed);
                var speed = speedValue
                    ? (0, convert_1.convertSpeedToMetric)(speedValue.value, speedValue.uom)
                    : (0, convert_1.convertSpeedToMetric)(30, "km/h");
                var time = distance / speed;
                newTime = Math.round(t + time * 1000);
            }
            geo.addUnitPosition(unitId, clickPosition, newTime);
        });
    }
    (0, openlayersHelpers_1.useOlEvent)(waypointSelect.on("select", function (evt) {
        evt.mapBrowserEvent.stopPropagation();
        isInternal = true;
        evt.selected.forEach(function (f) { return selectedWaypointIds.value.add(f.getId()); });
        evt.deselected.forEach(function (f) {
            return selectedWaypointIds.value.delete(f.getId());
        });
    }));
    function redrawSelectedLayer(v) {
        if (!isInternal) {
            waypointSelect.getFeatures().clear();
            v.forEach(function (fid) {
                var _a;
                var feature = (_a = waypointLayer.getSource()) === null || _a === void 0 ? void 0 : _a.getFeatureById(fid);
                if (feature)
                    waypointSelect.getFeatures().push(feature);
            });
        }
        isInternal = false;
    }
    historyLayer.set("title", "History");
    onUndoRedo(function (_a) {
        var meta = _a.meta;
        if ((meta === null || meta === void 0 ? void 0 : meta.value) && selectedUnitIds.value.has(meta.value))
            drawHistory();
    });
    var historyModify = new Modify_1.default({ source: legLayer.getSource(), deleteCondition: deleteCondition });
    (0, vue_1.watch)(function () { return __spreadArray([], selectedWaypointIds.value, true); }, function (v) { return redrawSelectedLayer(v); }, { immediate: true });
    (0, vue_1.watch)(editHistoryRef, function (v) {
        historyModify.setActive(v);
        drawHistory();
    }, { immediate: true });
    (0, vue_1.watch)(showWaypointTimestampsRef, function (showTimestamps) {
        labelsLayer.setVisible(showTimestamps);
    }, { immediate: true });
    var preGeometry;
    var prePointGeometry;
    function handleLineString(f, evt) {
        var postGeometry = f.getGeometry();
        var action;
        var preLength = (preGeometry === null || preGeometry === void 0 ? void 0 : preGeometry.getCoordinates().length) || 0;
        var postLength = (postGeometry === null || postGeometry === void 0 ? void 0 : postGeometry.getCoordinates().length) || 0;
        var preCoords = (preGeometry === null || preGeometry === void 0 ? void 0 : preGeometry.getCoordinates()) || [];
        var postCoords = (postGeometry === null || postGeometry === void 0 ? void 0 : postGeometry.getCoordinates()) || [];
        var elementIndex = -1;
        var isVia = false;
        if (preLength === postLength) {
            action = "modify";
            postCoords.every(function (v, i, a) {
                var b = preCoords[i];
                var isEq = v[0] === b[0] && v[1] === b[1] && v[2] === b[2];
                if (!isEq) {
                    elementIndex = i;
                    if (v[2] === history_1.VIA_TIME)
                        isVia = true;
                }
                return isEq;
            });
        }
        else if (preLength < postLength) {
            action = "add";
            elementIndex = postCoords.findIndex(function (e) { return e[2] === 0; });
            isVia = true;
        }
        else {
            action = "remove";
            preCoords.every(function (v, i, a) {
                var b = postCoords[i];
                var isEq = b && v[0] === b[0] && v[1] === b[1] && v[2] === b[2];
                if (!isEq) {
                    elementIndex = i;
                    if (v[2] === history_1.VIA_TIME)
                        isVia = true;
                }
                return isEq;
            });
        }
        if (elementIndex === -1) {
            if (postLength === 2) {
                action = "remove";
                var coordinate = evt.mapBrowserEvent.coordinate;
                var dista = squaredDistance(coordinate, postCoords[0]);
                var distb = squaredDistance(coordinate, postCoords[1]);
                if (dista < distb) {
                    elementIndex = 0;
                }
                else {
                    elementIndex = 1;
                }
            }
        }
        return { postGeometry: postGeometry, action: action, preCoords: preCoords, postCoords: postCoords, elementIndex: elementIndex, isVia: isVia };
    }
    historyModify.on(["modifystart", "modifyend"], function (evt) {
        var _a, _b, _c, _d;
        var f = evt.features.item(0);
        var geometryType = (_a = f.getGeometry()) === null || _a === void 0 ? void 0 : _a.getType();
        if (geometryType === "Point") {
        }
        else {
        }
        if (evt.type === "modifystart") {
            preGeometry =
                geometryType === "LineString" ? (_b = f.getGeometry()) === null || _b === void 0 ? void 0 : _b.clone() : undefined;
        }
        else if (evt.type === "modifyend") {
            if (geometryType === "LineString") {
                var _e = handleLineString(f, evt), postGeometry = _e.postGeometry, action = _e.action, preCoords = _e.preCoords, postCoords = _e.postCoords, elementIndex = _e.elementIndex, isVia = _e.isVia;
                if (elementIndex === -1) {
                    console.warn("Cannot modify geometry");
                    return;
                }
                handleHistoryFeatureChange(f.get("unitId"), action, elementIndex, isVia, postCoords, preCoords);
                var updatedGeometry = postGeometry === null || postGeometry === void 0 ? void 0 : postGeometry.getCoordinates().map(function (e) { return [e[0], e[1], e[2] === 0 ? history_1.VIA_TIME : e[2]]; });
                if (updatedGeometry)
                    (_c = f.getGeometry()) === null || _c === void 0 ? void 0 : _c.setCoordinates(updatedGeometry, "XYM");
            }
            else if (geometryType === "Point") {
                var unitId = f.get("unitId");
                var unit = unitActions.getUnitById(unitId);
                if (!unit)
                    return;
                var action = deleteCondition(evt.mapBrowserEvent)
                    ? "remove"
                    : "modify";
                var postCoords = [(_d = f.getGeometry()) === null || _d === void 0 ? void 0 : _d.getCoordinates()];
                var elementIndex = 0;
                handleHistoryFeatureChange(unitId, action, elementIndex, false, postCoords, postCoords);
            }
            drawHistory();
        }
    });
    function handleHistoryFeatureChange(unitId, action, elementIndex, isVia, postCoordinates, preCoordinates) {
        var _a, _b, _c;
        var unit = unitActions.getUnitById(unitId);
        var changedCoords = postCoordinates[elementIndex];
        var llChangedCoords = changedCoords && (0, proj_1.toLonLat)([changedCoords[0], changedCoords[1]]);
        if (!unit)
            return;
        if (isVia) {
            var stateElementIndex_1 = -1;
            var viaElementIndex = -1;
            var newIndex = -1;
            if (action === "remove") {
                var a_1 = __spreadArray([], preCoordinates.entries(), true).filter(function (_a) {
                    var i = _a[0], c = _a[1];
                    return !(c[2] === history_1.VIA_TIME || c[2] === 0);
                });
                stateElementIndex_1 = a_1.findIndex(function (_a) {
                    var i = _a[0];
                    return i > elementIndex;
                });
                viaElementIndex = elementIndex - a_1[stateElementIndex_1 - 1][0] - 1;
                // @ts-ignore
                newIndex = (_a = unit === null || unit === void 0 ? void 0 : unit.state) === null || _a === void 0 ? void 0 : _a.findIndex(function (s) { return s.t === a_1[stateElementIndex_1][1][2]; });
            }
            else {
                var a_2 = __spreadArray([], postCoordinates.entries(), true).filter(function (_a) {
                    var i = _a[0], c = _a[1];
                    return !(c[2] === history_1.VIA_TIME || c[2] === 0);
                });
                stateElementIndex_1 = a_2.findIndex(function (_a, idx) {
                    var i = _a[0];
                    return i > elementIndex;
                });
                viaElementIndex = elementIndex - a_2[stateElementIndex_1 - 1][0] - 1;
                // @ts-ignore
                newIndex = (_b = unit === null || unit === void 0 ? void 0 : unit.state) === null || _b === void 0 ? void 0 : _b.findIndex(function (s) { return s.t === a_2[stateElementIndex_1][1][2]; });
            }
            unitActions.updateUnitStateVia(unitId, action, newIndex, viaElementIndex, llChangedCoords);
        }
        else {
            if (action === "remove") {
                var index = (_c = unit === null || unit === void 0 ? void 0 : unit.state) === null || _c === void 0 ? void 0 : _c.findIndex(function (s) { return s.t === preCoordinates[elementIndex][2]; });
                if (index !== undefined)
                    unitActions.deleteUnitStateEntry(unitId, index);
            }
            else if (action === "modify") {
                geo.addUnitPosition(unitId, llChangedCoords, changedCoords[2]);
            }
        }
    }
    function drawHistory() {
        var historyLayerSource = legLayer.getSource();
        var waypointLayerSource = waypointLayer.getSource();
        var viaLayerSource = viaLayer.getSource();
        var arcLayerSource = arcLayer.getSource();
        arcLayer.setOpacity(editHistoryRef.value ? 0.4 : 1);
        historyLayerSource.clear();
        waypointLayerSource.clear();
        arcLayerSource.clear();
        if (!showHistoryRef.value)
            return;
        selectedUnitIds.value.forEach(function (unitId) {
            var unit = getUnitById(unitId);
            if (!unit)
                return;
            var _a = (0, history_1.createUnitPathFeatures)(unit, {
                isEditMode: editHistoryRef.value,
                timeZone: state.info.timeZone,
            }), legFeatures = _a.legFeatures, waypointFeatures = _a.waypointFeatures, viaPointFeatures = _a.viaPointFeatures, arcFeatures = _a.arcFeatures;
            arcLayerSource.addFeatures(arcFeatures);
            historyLayerSource.addFeatures(editHistoryRef.value ? legFeatures : []);
            waypointLayerSource.addFeatures(waypointFeatures);
            viaLayerSource.addFeatures(viaPointFeatures);
            redrawSelectedLayer(__spreadArray([], selectedWaypointIds.value, true));
        });
    }
    (0, vue_1.watch)(function () { return showHistoryRef.value && __spreadArray([], selectedUnitIds.value.values(), true); }, function (selectedUnitIds) {
        drawHistory();
        waypointSelect.setActive(selectedUnitIds && selectedUnitIds.length > 0);
        ctrlClickInteraction.setActive(selectedUnitIds && selectedUnitIds.length > 0);
    });
    (0, vue_1.watch)(function () { return fmt.trackFormatter; }, function () { return drawHistory(); });
    return {
        historyLayer: historyLayer,
        drawHistory: drawHistory,
        historyModify: historyModify,
        showHistory: showHistoryRef,
        editHistory: editHistoryRef,
        waypointSelect: waypointSelect,
        ctrlClickInteraction: ctrlClickInteraction,
    };
}
