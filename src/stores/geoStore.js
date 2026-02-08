"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUnitSettingsStore = exports.useMeasurementsStore = exports.useGeoStore = void 0;
var pinia_1 = require("pinia");
var proj_1 = require("ol/proj");
var helpers_1 = require("@turf/helpers");
var GeoJSON_1 = require("ol/format/GeoJSON");
var envelope_1 = require("@turf/envelope");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var SimpleGeometry_1 = require("ol/geom/SimpleGeometry");
exports.useGeoStore = (0, pinia_1.defineStore)("geo", function () {
    var olMap = (0, vue_1.shallowRef)(null);
    function zoomToUnit(unit, duration) {
        var _a;
        if (duration === void 0) { duration = 900; }
        if (!olMap.value)
            return;
        var location = (_a = unit === null || unit === void 0 ? void 0 : unit._state) === null || _a === void 0 ? void 0 : _a.location;
        if (!location)
            return;
        var view = olMap.value.getView();
        view.animate({
            zoom: 15,
            center: (0, proj_1.fromLonLat)(location, view.getProjection()),
            duration: duration,
        });
    }
    function zoomToUnits(units, options) {
        if (options === void 0) { options = {}; }
        var _a = options.duration, duration = _a === void 0 ? 900 : _a, _b = options.maxZoom, maxZoom = _b === void 0 ? 15 : _b;
        var points = units
            .map(function (u) { var _a; return (_a = u._state) === null || _a === void 0 ? void 0 : _a.location; })
            .filter(function (loc) { return !!loc; })
            .map(function (loc) { return (0, helpers_1.point)(loc); });
        if (!points.length)
            return;
        var c = (0, helpers_1.featureCollection)(points);
        zoomToGeometry(c, { duration: duration, maxZoom: maxZoom });
    }
    function zoomToGeometry(geometry, options) {
        if (options === void 0) { options = {}; }
        if (!olMap.value)
            return;
        var _a = options.duration, duration = _a === void 0 ? 900 : _a, _b = options.maxZoom, maxZoom = _b === void 0 ? 15 : _b, padding = options.padding;
        var bb = new GeoJSON_1.default().readFeature((0, envelope_1.default)(geometry), {
            featureProjection: "EPSG:3857",
            dataProjection: "EPSG:4326",
        });
        if (!bb)
            return;
        var geom = bb.getGeometry();
        if (geom instanceof SimpleGeometry_1.default) {
            olMap.value.getView().fit(geom, { maxZoom: maxZoom, duration: duration, padding: padding });
        }
    }
    function zoomToLocation(location, duration) {
        if (duration === void 0) { duration = 900; }
        if (!olMap.value)
            return;
        if (!location)
            return;
        var view = olMap.value.getView();
        view.animate({
            zoom: 10,
            center: (0, proj_1.fromLonLat)(location, view.getProjection()),
            duration: duration,
        });
    }
    function panToUnit(unit, duration) {
        var _a;
        if (duration === void 0) { duration = 900; }
        if (!olMap.value)
            return;
        var location = (_a = unit === null || unit === void 0 ? void 0 : unit._state) === null || _a === void 0 ? void 0 : _a.location;
        if (!location)
            return;
        var view = olMap.value.getView();
        view.animate({
            center: (0, proj_1.fromLonLat)(location, view.getProjection()),
            duration: duration,
        });
    }
    function panToLocation(location, duration) {
        if (duration === void 0) { duration = 900; }
        if (!olMap.value)
            return;
        if (!location)
            return;
        var view = olMap.value.getView();
        view.animate({
            center: (0, proj_1.fromLonLat)(location, view.getProjection()),
            duration: duration,
        });
    }
    function updateMapSize() {
        var _a;
        (_a = olMap.value) === null || _a === void 0 ? void 0 : _a.updateSize();
    }
    function getMapViewBbox() {
        if (!olMap.value)
            return;
        var view = olMap.value.getView();
        var extent = view.calculateExtent(olMap.value.getSize());
        if (!extent)
            return;
        // Convert from EPSG:3857 to EPSG:4326 (lon/lat)
        var bbox = (0, proj_1.transformExtent)(extent, "EPSG:3857", "EPSG:4326");
        return bbox;
    }
    function zoomToBbox(bbox, options) {
        if (options === void 0) { options = {}; }
        if (!olMap.value)
            return;
        var _a = options.duration, duration = _a === void 0 ? 900 : _a, _b = options.maxZoom, maxZoom = _b === void 0 ? 15 : _b, padding = options.padding;
        var extent = (0, proj_1.transformExtent)(bbox, "EPSG:4326", "EPSG:3857");
        olMap.value.getView().fit(extent, { maxZoom: maxZoom, duration: duration, padding: padding });
    }
    return {
        olMap: olMap,
        zoomToUnit: zoomToUnit,
        zoomToUnits: zoomToUnits,
        zoomToGeometry: zoomToGeometry,
        zoomToLocation: zoomToLocation,
        panToUnit: panToUnit,
        panToLocation: panToLocation,
        updateMapSize: updateMapSize,
        getMapViewBbox: getMapViewBbox,
        zoomToBbox: zoomToBbox,
    };
});
exports.useMeasurementsStore = (0, pinia_1.defineStore)("measurements", function () {
    var measurementType = (0, vue_1.ref)("LineString");
    var clearPrevious = (0, vue_1.ref)(true);
    var showSegments = (0, vue_1.ref)(true);
    var measurementUnit = (0, vue_1.ref)("metric");
    var snap = (0, vue_1.ref)(true);
    var showCircle = (0, core_1.useLocalStorage)("showMeasurementCircle", true);
    return {
        measurementType: measurementType,
        clearPrevious: clearPrevious,
        showSegments: showSegments,
        measurementUnit: measurementUnit,
        snap: snap,
        showCircle: showCircle,
    };
});
exports.useUnitSettingsStore = (0, pinia_1.defineStore)("unitSettings", function () {
    var showHistory = (0, core_1.useLocalStorage)("showHistory", true);
    var editHistory = (0, vue_1.ref)(false);
    var moveUnitEnabled = (0, vue_1.ref)(false);
    var showWaypointTimestamps = (0, core_1.useLocalStorage)("showWaypointTimestamps", false);
    return {
        showHistory: showHistory,
        editHistory: editHistory,
        moveUnitEnabled: moveUnitEnabled,
        showWaypointTimestamps: showWaypointTimestamps,
    };
});
