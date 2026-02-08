"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUnitActions = useUnitActions;
exports.useUnitMenu = useUnitMenu;
exports.useScenarioFeatureActions = useScenarioFeatureActions;
exports.useToeActions = useToeActions;
var constants_1 = require("@/types/constants");
var geoStore_1 = require("@/stores/geoStore");
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var helpers_1 = require("@turf/helpers");
var envelope_1 = require("@turf/envelope");
var format_1 = require("ol/format");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
var selectedStore_1 = require("@/stores/selectedStore");
var scenarioInfoPanelStore_1 = require("@/stores/scenarioInfoPanelStore");
var uiStore_1 = require("@/stores/uiStore");
function useUnitActions(options) {
    if (options === void 0) { options = {}; }
    var _a = options.activeScenario || (0, utils_1.injectStrict)(injects_1.activeScenarioKey), unitActions = _a.unitActions, groupUpdate = _a.store.groupUpdate;
    var _b = (0, selectedStore_1.useSelectedItems)(), selectedUnitIds = _b.selectedUnitIds, activeUnitId = _b.activeUnitId;
    var geoStore = (0, geoStore_1.useGeoStore)();
    var _onUnitAction = function (unit, action, waypointIds) {
        var _a, _b, _c;
        if (!unit)
            return;
        if (action === constants_1.UnitActions.Expand) {
            unitActions.walkSubUnits(unit.id, function (unit1) {
                unit1._isOpen = true;
            }, { includeParent: true });
        }
        if (action === constants_1.UnitActions.Zoom) {
            if ((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location) {
                geoStore.zoomToUnit(unit, 0);
            }
            else {
                var subUnits_1 = [];
                unitActions.walkSubUnits(unit.id, function (unit1) {
                    subUnits_1.push(unit1);
                }, {});
                var locations = subUnits_1
                    .filter(function (u) { var _a; return (_a = u._state) === null || _a === void 0 ? void 0 : _a.location; })
                    .map(function (u) { var _a; return (_a = u._state) === null || _a === void 0 ? void 0 : _a.location; });
                if (locations.length === 0)
                    return;
                var bb = new format_1.GeoJSON().readFeature((0, envelope_1.default)((0, helpers_1.multiPoint)(locations)), {
                    featureProjection: "EPSG:3857",
                    dataProjection: "EPSG:4326",
                });
                if (!bb)
                    return;
                (_b = geoStore.olMap) === null || _b === void 0 ? void 0 : _b.getView().fit(bb.getGeometry(), { maxZoom: 17 });
            }
        }
        if (action === constants_1.UnitActions.Pan)
            geoStore.panToUnit(unit, 500);
        if (action === constants_1.UnitActions.Lock) {
            unitActions.updateUnitLocked(unit.id, true);
        }
        if (action === constants_1.UnitActions.Unlock) {
            unitActions.updateUnitLocked(unit.id, false);
        }
        if (unitActions.isUnitLocked(unit.id))
            return;
        if (action === constants_1.UnitActions.AddSubordinate) {
            unit._isOpen = true;
            unitActions.createSubordinateUnit(unit.id);
        }
        if (action === constants_1.UnitActions.Edit) {
            selectedUnitIds.value.clear();
            selectedUnitIds.value.add(unit.id);
        }
        action === constants_1.UnitActions.Clone && unitActions.cloneUnit(unit.id);
        action === constants_1.UnitActions.CloneWithState &&
            unitActions.cloneUnit(unit.id, { includeState: true });
        action === constants_1.UnitActions.CloneWithSubordinates &&
            unitActions.cloneUnit(unit.id, { includeSubordinates: true });
        action === constants_1.UnitActions.CloneWithSubordinatesAndState &&
            unitActions.cloneUnit(unit.id, { includeSubordinates: true, includeState: true });
        action === constants_1.UnitActions.MoveUp && unitActions.reorderUnit(unit.id, "up");
        action === constants_1.UnitActions.MoveDown && unitActions.reorderUnit(unit.id, "down");
        if (action === constants_1.UnitActions.Delete ||
            (action === constants_1.UnitActions.ClearStateOrDelete && !((_c = unit.state) === null || _c === void 0 ? void 0 : _c.length))) {
            if (activeUnitId.value === unit.id) {
                activeUnitId.value = null;
            }
            unitActions.deleteUnit(unit.id);
            selectedUnitIds.value.delete(unit.id);
        }
        if (action === constants_1.UnitActions.DeleteWaypoints && waypointIds && waypointIds.length) {
            waypointIds.forEach(function (wid) {
                return unitActions.deleteUnitStateEntryByStateId(unit.id, wid);
            });
        }
        if (action === constants_1.UnitActions.ClearState || action === constants_1.UnitActions.ClearStateOrDelete) {
            unitActions.clearUnitState(unit.id);
        }
    };
    function onUnitAction(unitOrUnits, action, waypointIds) {
        if (!unitOrUnits)
            return;
        if (Array.isArray(unitOrUnits)) {
            groupUpdate(function () {
                if (action === constants_1.UnitActions.Zoom || action === constants_1.UnitActions.Pan) {
                    geoStore.zoomToUnits(unitOrUnits, { duration: 500 });
                }
                else
                    unitOrUnits.forEach(function (unit) { return _onUnitAction(unit, action, waypointIds); });
            });
        }
        else
            _onUnitAction(unitOrUnits, action, waypointIds);
    }
    return { onUnitAction: onUnitAction };
}
function useUnitMenu(item, isLocked, isSideGroupLocked) {
    var unit = "unit" in item ? item.unit : item;
    // todo: item.children is not reactive
    var children = "unit" in item ? item.children : item.subUnits;
    var hasChildren = (0, vue_1.computed)(function () {
        return Boolean(unit.subUnits && unit.subUnits.length);
    });
    var unitMenuItems = (0, vue_1.computed)(function () {
        var _a;
        return [
            {
                label: "Add subordinate",
                action: constants_1.UnitActions.AddSubordinate,
                disabled: isLocked.value,
            },
            { label: "Delete", action: constants_1.UnitActions.Delete, disabled: isLocked.value },
            { label: "Clear state", action: constants_1.UnitActions.ClearState, disabled: isLocked.value },
            { label: "Edit", action: constants_1.UnitActions.Edit, disabled: isLocked.value },
            {
                label: "Expand",
                action: constants_1.UnitActions.Expand,
                disabled: !hasChildren.value,
            },
            {
                label: "Zoom to",
                action: constants_1.UnitActions.Zoom,
                disabled: !((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location),
            },
            // { label: "Copy", action: UnitActions.Copy },
            // { label: "Paste", action: UnitActions.Paste },
            { label: "Duplicate", action: constants_1.UnitActions.Clone, disabled: isLocked.value },
            {
                label: "Duplicate (with state)",
                action: constants_1.UnitActions.CloneWithState,
                disabled: isLocked.value,
            },
            {
                label: "Duplicate hierarchy",
                action: constants_1.UnitActions.CloneWithSubordinates,
                disabled: isLocked.value,
            },
            {
                label: "Duplicate hierarchy (with state)",
                action: constants_1.UnitActions.CloneWithSubordinatesAndState,
                disabled: isLocked.value,
            },
            { label: "Move up", action: constants_1.UnitActions.MoveUp, disabled: isLocked.value },
            { label: "Move down", action: constants_1.UnitActions.MoveDown, disabled: isLocked.value },
            unit.locked
                ? {
                    label: "Unlock",
                    action: constants_1.UnitActions.Unlock,
                    disabled: isSideGroupLocked.value,
                }
                : {
                    label: "Lock",
                    action: constants_1.UnitActions.Lock,
                    disabled: isSideGroupLocked.value,
                },
        ];
    });
    return { unitMenuItems: unitMenuItems };
}
function useScenarioFeatureActions() {
    var mapRef = (0, geoStore_1.useGeoStore)().olMap;
    var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), groupUpdate = _a.store.groupUpdate, geo = _a.geo;
    var _b = (0, featureLayerUtils_1.useFeatureLayerUtils)(mapRef), zoomToFeature = _b.zoomToFeature, panToFeature = _b.panToFeature, zoomToFeatures = _b.zoomToFeatures;
    function onFeatureAction(featureOrFeaturesId, action) {
        var isArray = Array.isArray(featureOrFeaturesId);
        if (isArray && (action === "zoom" || action === "pan")) {
            zoomToFeatures(featureOrFeaturesId);
            return;
        }
        groupUpdate(function () {
            (isArray ? featureOrFeaturesId : [featureOrFeaturesId]).forEach(function (featureId) {
                if (action === "zoom")
                    zoomToFeature(featureId);
                if (action === "pan")
                    panToFeature(featureId);
                if (action === "delete")
                    geo.deleteFeature(featureId);
                if (action === "duplicate") {
                    geo.duplicateFeature(featureId);
                }
            });
        }, { label: "batchLayer", value: "dummy" });
    }
    return { onFeatureAction: onFeatureAction };
}
function useToeActions() {
    var uiStore = (0, uiStore_1.useUiStore)();
    var scenarioInfoPanelStore = (0, scenarioInfoPanelStore_1.useScenarioInfoPanelStore)();
    function goToAddEquipment() {
        uiStore.activeTabIndex = constants_1.TAB_SCENARIO_SETTINGS;
        scenarioInfoPanelStore.showAddEquipment = true;
        scenarioInfoPanelStore.tabIndex = 1;
    }
    function goToAddPersonnel() {
        uiStore.activeTabIndex = constants_1.TAB_SCENARIO_SETTINGS;
        scenarioInfoPanelStore.showAddPersonnel = true;
        scenarioInfoPanelStore.tabIndex = 2;
    }
    function goToAddSupplies() {
        uiStore.activeTabIndex = constants_1.TAB_SCENARIO_SETTINGS;
        scenarioInfoPanelStore.showAddSupplies = true;
        scenarioInfoPanelStore.tabIndex = 3;
    }
    function goToAddGroup() {
        uiStore.activeTabIndex = constants_1.TAB_SCENARIO_SETTINGS;
        scenarioInfoPanelStore.tabIndex = 4;
        scenarioInfoPanelStore.showAddGroup = true;
    }
    return { goToAddEquipment: goToAddEquipment, goToAddPersonnel: goToAddPersonnel, goToAddGroup: goToAddGroup };
}
