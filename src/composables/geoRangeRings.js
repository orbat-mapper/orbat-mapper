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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRangeRingsLayer = useRangeRingsLayer;
var Vector_1 = require("ol/layer/Vector");
var Vector_2 = require("ol/source/Vector");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var clusters_1 = require("@turf/clusters");
var circle_1 = require("@turf/circle");
var union_1 = require("@turf/union");
var helpers_1 = require("@turf/helpers");
var format_1 = require("ol/format");
var convert_1 = require("@/utils/convert");
var style_1 = require("ol/style");
var simplestyle_1 = require("@/geo/simplestyle");
function useRangeRingsLayer() {
    var scn = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
    var _a = useRangeRingStyles(scn), rangeRingStyle = _a.rangeRingStyle, clearCache = _a.clearCache;
    var layer = createLayer();
    layer.setStyle(rangeRingStyle);
    var gjf = new format_1.GeoJSON({
        featureProjection: "EPSG:3857",
        dataProjection: "EPSG:4326",
    });
    function drawRangeRings() {
        var _a, _b;
        (_a = layer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
        clearCache();
        var rangeRings = (0, helpers_1.featureCollection)(scn.geo.everyVisibleUnit.value
            .filter(function (u) { var _a; return (_a = u.rangeRings) === null || _a === void 0 ? void 0 : _a.length; })
            .map(createRangeRings)
            .flat());
        var unGrouped = (0, helpers_1.featureCollection)(rangeRings.features.filter(function (r) { return !r.properties.isGroup; }));
        var grouped = (0, helpers_1.featureCollection)(rangeRings.features.filter(function (r) { return r.properties.isGroup; }));
        (0, clusters_1.clusterEach)(grouped, "id", function (cluster) {
            var _a;
            var merged = cluster.features.length > 1
                ? (0, union_1.default)(cluster, {
                    properties: { id: cluster.features[0].properties.id, isGroup: true },
                })
                : cluster.features[0];
            (_a = layer.getSource()) === null || _a === void 0 ? void 0 : _a.addFeature(gjf.readFeature(merged));
        });
        (_b = layer.getSource()) === null || _b === void 0 ? void 0 : _b.addFeatures(gjf.readFeatures(unGrouped));
    }
    return { rangeLayer: layer, drawRangeRings: drawRangeRings };
}
function createRangeRings(unit) {
    var _a;
    return (((_a = unit.rangeRings) === null || _a === void 0 ? void 0 : _a.map(function (r, i) {
        return !r.hidden
            ? (0, circle_1.default)(unit._state.location, (0, convert_1.convertToMetric)(r.range, r.uom || "km") / 1000, {
                properties: {
                    id: r.group ? r.group : "".concat(unit.id, "-").concat(i),
                    isGroup: !!r.group,
                },
            })
            : null;
    }).filter(function (e) { return e !== null; })) || []);
}
var defaultStyle = new style_1.Style({
    stroke: new style_1.Stroke({ width: 2, color: "red" }),
});
function createLayer() {
    var layer = new Vector_1.default({
        source: new Vector_2.default(),
        style: defaultStyle,
    });
    layer.set("title", "Range rings");
    return layer;
}
function useRangeRingStyles(scn) {
    var styleCache = new Map();
    function clearCache() {
        styleCache.clear();
    }
    function rangeRingStyle(feature, resolution) {
        var _a, _b;
        var id = feature.get("id");
        var style = styleCache.get(id);
        if (!style) {
            var isGroup = feature.get("isGroup");
            if (isGroup) {
                var groupStyle = (_a = scn.store.state.rangeRingGroupMap[id]) === null || _a === void 0 ? void 0 : _a.style;
                style = groupStyle
                    ? (0, simplestyle_1.createSimpleStyle)(__assign({ fill: null, stroke: "red" }, groupStyle))
                    : defaultStyle;
            }
            else {
                var parts = id.split("-");
                var index = parts.pop();
                var unitId = parts.join("-");
                var unit = scn.helpers.getUnitById(unitId);
                var ring = (_b = unit.rangeRings) === null || _b === void 0 ? void 0 : _b[index];
                style = (ring === null || ring === void 0 ? void 0 : ring.style)
                    ? (0, simplestyle_1.createSimpleStyle)(__assign({ fill: null, stroke: "red" }, ring.style))
                    : defaultStyle;
            }
            styleCache.set(id, style);
        }
        return style;
    }
    function invalidateStyle(featureId) {
        styleCache.delete(featureId);
    }
    return {
        clearCache: clearCache,
        rangeRingStyle: rangeRingStyle,
        invalidateStyle: invalidateStyle,
    };
}
