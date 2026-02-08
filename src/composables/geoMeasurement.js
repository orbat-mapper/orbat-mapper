"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMeasurementInteraction = useMeasurementInteraction;
var style_1 = require("ol/style");
var Draw_1 = require("ol/interaction/Draw");
var Modify_1 = require("ol/interaction/Modify");
var geom_1 = require("ol/geom");
var source_1 = require("ol/source");
var layer_1 = require("ol/layer");
var sphere_1 = require("ol/sphere");
var Feature_1 = require("ol/Feature");
var core_1 = require("@vueuse/core");
var vue_1 = require("vue");
var condition_1 = require("ol/events/condition");
var Snap_1 = require("ol/interaction/Snap");
var ol_1 = require("ol");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
var utils_1 = require("@/geo/utils");
var Observable_1 = require("ol/Observable");
var Polygon_1 = require("ol/geom/Polygon");
var style = new style_1.Style({
    fill: new style_1.Fill({
        color: "rgba(255, 255, 255, 0.2)",
    }),
    stroke: new style_1.Stroke({
        color: "rgb(0, 0, 0)",
        lineDash: [10, 10],
        width: 2,
    }),
    image: new style_1.Circle({
        radius: 5,
        stroke: new style_1.Stroke({
            color: "rgba(0, 0, 0, 0.7)",
        }),
        fill: new style_1.Fill({
            color: "rgba(255, 255, 255, 0.2)",
        }),
    }),
});
var circleStyle = new style_1.Style({
    stroke: new style_1.Stroke({
        color: "rgb(0, 0, 0)",
        lineDash: [10, 10],
        width: 2,
    }),
});
var lineBackgroundStyle = new style_1.Style({
    stroke: new style_1.Stroke({
        color: "rgba(255, 255, 255, 0.7)",
        width: 5,
    }),
});
var labelStyle = new style_1.Style({
    text: new style_1.Text({
        font: '14px "Inter Variable", sans-serif',
        fill: new style_1.Fill({
            color: "rgba(255, 255, 255, 1)",
        }),
        backgroundFill: new style_1.Fill({
            color: "rgba(0, 0, 0, 0.7)",
        }),
        padding: [3, 3, 3, 3],
        textBaseline: "bottom",
        offsetY: -15,
    }),
    image: new style_1.RegularShape({
        radius: 8,
        points: 3,
        angle: Math.PI,
        displacement: [0, 10],
        fill: new style_1.Fill({
            color: "rgba(0, 0, 0, 0.7)",
        }),
    }),
});
var tipStyle = new style_1.Style({
    text: new style_1.Text({
        font: "12px Inter Variable, sans-serif",
        fill: new style_1.Fill({
            color: "rgba(255, 255, 255, 1)",
        }),
        backgroundFill: new style_1.Fill({
            color: "rgba(0, 0, 0, 0.4)",
        }),
        padding: [2, 2, 2, 2],
        textAlign: "left",
        offsetX: 15,
    }),
});
var modifyStyle = new style_1.Style({
    image: new style_1.Circle({
        radius: 5,
        stroke: new style_1.Stroke({
            color: "rgba(0, 0, 0, 0.7)",
        }),
        fill: new style_1.Fill({
            color: "rgba(0, 0, 0, 0.4)",
        }),
    }),
    text: new style_1.Text({
        text: "Drag to modify",
        font: '12px "Inter Variable", sans-serif',
        fill: new style_1.Fill({
            color: "rgba(255, 255, 255, 1)",
        }),
        backgroundFill: new style_1.Fill({
            color: "rgba(0, 0, 0, 0.7)",
        }),
        padding: [2, 2, 2, 2],
        textAlign: "left",
        offsetX: 15,
    }),
});
var segmentStyle = new style_1.Style({
    text: new style_1.Text({
        font: '12px "Inter Variable", sans-serif',
        fill: new style_1.Fill({
            color: "rgba(255, 255, 255, 1)",
        }),
        backgroundFill: new style_1.Fill({
            color: "rgba(0, 0, 0, 0.4)",
        }),
        padding: [2, 2, 2, 2],
        textBaseline: "bottom",
        offsetY: -12,
    }),
    image: new style_1.RegularShape({
        radius: 6,
        points: 3,
        angle: Math.PI,
        displacement: [0, 8],
        fill: new style_1.Fill({
            color: "rgba(0, 0, 0, 0.4)",
        }),
    }),
});
function measurementInteractionWrapper(olMap, initialDrawType, options) {
    if (options === void 0) { options = {
        showSegments: true,
        clearPrevious: true,
        measurementUnit: "metric",
        showCircle: true,
    }; }
    var drawType = initialDrawType;
    var showSegments = options.showSegments;
    var clearPrevious = options.clearPrevious;
    var measurementUnit = options.measurementUnit;
    var showCircle = options.showCircle;
    var tipPoint;
    var drawInteraction;
    var eventKeys = [];
    var segmentStyles = [segmentStyle];
    var measurementCircleFeature;
    var circleEventKey;
    var source = new source_1.Vector();
    var vector = new layer_1.Vector({
        source: source,
        style: function (feature) {
            return styleFunction(feature, showSegments);
        },
    });
    var modifyInteraction = new Modify_1.default({
        source: source,
        style: modifyStyle,
        pixelTolerance: 20,
    });
    function styleFunction(feature, segments, drawType, tip) {
        var _a, _b, _c;
        var styles = [lineBackgroundStyle, style];
        var geometry = feature.getGeometry();
        if (!geometry)
            return styles;
        var type = geometry.getType();
        var point;
        var label = "";
        var line;
        if (!drawType || drawType === type) {
            if (type === "Polygon") {
                point = geometry.getInteriorPoint();
                label = (0, utils_1.formatArea)((0, sphere_1.getArea)(geometry), measurementUnit);
                line = new geom_1.LineString(geometry.getCoordinates()[0]);
            }
            else if (type === "LineString") {
                point = new geom_1.Point(geometry.getLastCoordinate());
                label = (0, utils_1.formatLength)((0, sphere_1.getLength)(geometry), measurementUnit);
                line = geometry;
            }
        }
        // Draw segment labels. Skip if there is only one segment.
        if (segments && line && line.getCoordinates().length > 2) {
            var count_1 = 0;
            line.forEachSegment(function (a, b) {
                var _a;
                var segment = new geom_1.LineString([a, b]);
                var label = (0, utils_1.formatLength)((0, sphere_1.getLength)(segment), measurementUnit);
                if (segmentStyles.length - 1 < count_1) {
                    segmentStyles.push(segmentStyle.clone());
                }
                var segmentPoint = new geom_1.Point(segment.getCoordinateAt(0.5));
                segmentStyles[count_1].setGeometry(segmentPoint);
                (_a = segmentStyles[count_1].getText()) === null || _a === void 0 ? void 0 : _a.setText(label);
                styles.push(segmentStyles[count_1]);
                count_1++;
            });
        }
        if (label && point) {
            labelStyle.setGeometry(point);
            (_a = labelStyle.getText()) === null || _a === void 0 ? void 0 : _a.setText(label);
            styles.push(labelStyle);
        }
        if (tip &&
            type === "Point" &&
            !((_b = modifyInteraction.getOverlay().getSource()) === null || _b === void 0 ? void 0 : _b.getFeatures().length)) {
            tipPoint = geometry;
            (_c = tipStyle.getText()) === null || _c === void 0 ? void 0 : _c.setText(tip);
            styles.push(tipStyle);
        }
        return styles;
    }
    function removeMeasurementCircle() {
        if (measurementCircleFeature) {
            source.removeFeature(measurementCircleFeature);
            measurementCircleFeature.dispose();
            measurementCircleFeature = null;
        }
        if (circleEventKey) {
            (0, Observable_1.unByKey)(circleEventKey);
            circleEventKey = null;
        }
    }
    function addDrawInteraction(drawType) {
        var activeTip = "";
        var idleTip = "Click to start measuring";
        var tip = idleTip;
        drawInteraction = new Draw_1.default({
            source: source,
            type: drawType,
            condition: condition_1.primaryAction,
            style: function (feature) {
                return styleFunction(feature, showSegments, drawType, tip);
            },
        });
        var key = drawInteraction.on("drawstart", function (event) {
            if (clearPrevious) {
                source.clear();
            }
            removeMeasurementCircle();
            if (showCircle && drawType === "LineString") {
                measurementCircleFeature = new Feature_1.default({
                    geometry: (0, Polygon_1.circular)([0, 0], 100000),
                });
                measurementCircleFeature.setStyle([lineBackgroundStyle, circleStyle]);
                source.addFeature(measurementCircleFeature);
                circleEventKey = event.feature.on("change", function () {
                    var lineStringGeometry = event.feature.getGeometry();
                    var lastSegment = new geom_1.LineString(lineStringGeometry.getCoordinates().slice(-2));
                    var radius = (0, sphere_1.getLength)(lastSegment, { projection: "EPSG:4326" });
                    lastSegment.transform("EPSG:3857", "EPSG:4326");
                    if (radius === 0)
                        return;
                    // const circle = new Circle(
                    //   lastSegment.getFirstCoordinate(),
                    //   lastSegment.getLength(),
                    // );
                    var circle = (0, Polygon_1.circular)(lastSegment.getFirstCoordinate(), (0, sphere_1.getLength)(lastSegment, { projection: "EPSG:4326" }), 128);
                    circle.transform("EPSG:4326", "EPSG:3857");
                    measurementCircleFeature === null || measurementCircleFeature === void 0 ? void 0 : measurementCircleFeature.setGeometry(circle);
                });
            }
            modifyInteraction.setActive(false);
            tip = activeTip;
        });
        eventKeys.push(key);
        var key2 = drawInteraction.on("drawend", function () {
            removeMeasurementCircle();
            modifyStyle.setGeometry(tipPoint);
            modifyInteraction.setActive(true);
            olMap.once("pointermove", function () {
                // @ts-ignore
                modifyStyle.setGeometry();
            });
            tip = idleTip;
        });
        eventKeys.push(key2);
        modifyInteraction.setActive(true);
        olMap.addInteraction(drawInteraction);
    }
    function changeMeasurementType(type) {
        drawType = type;
        olMap.removeInteraction(drawInteraction);
        addDrawInteraction(type);
    }
    function setShowSegments(v) {
        showSegments = v;
        vector.changed();
        drawInteraction.getOverlay().changed();
    }
    function setShowCircle(v) {
        showCircle = v;
        if (!showCircle) {
            removeMeasurementCircle();
        }
        olMap.removeInteraction(drawInteraction);
        addDrawInteraction(drawType);
    }
    function setClearPrevious(v) {
        clearPrevious = v;
    }
    function setActive(enabled) {
        modifyInteraction.setActive(enabled);
        drawInteraction.setActive(enabled);
    }
    function setUnit(newUnit) {
        measurementUnit = newUnit;
        vector.changed();
        drawInteraction.getOverlay().changed();
    }
    function cleanup() {
        var _a;
        (0, Observable_1.unByKey)(eventKeys);
        eventKeys.length = 0;
        removeMeasurementCircle();
        (_a = vector.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
        olMap.removeLayer(vector);
        olMap.removeInteraction(modifyInteraction);
        olMap.removeInteraction(drawInteraction);
    }
    function clear() {
        var _a;
        (_a = vector.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
    }
    olMap.addLayer(vector);
    addDrawInteraction(drawType);
    olMap.addInteraction(modifyInteraction);
    return {
        changeMeasurementType: changeMeasurementType,
        setShowSegments: setShowSegments,
        setClearPrevious: setClearPrevious,
        setActive: setActive,
        setUnit: setUnit,
        setShowCircle: setShowCircle,
        cleanup: cleanup,
        clear: clear,
    };
}
function useMeasurementInteraction(olMap, measurementType, options) {
    var _a, _b, _c, _d, _e, _f;
    if (options === void 0) { options = {}; }
    var measurementTypeRef = (0, vue_1.ref)(measurementType);
    var showSegmentsRef = (0, vue_1.ref)((_a = options.showSegments) !== null && _a !== void 0 ? _a : true);
    var clearPreviousRef = (0, vue_1.ref)((_b = options.clearPrevious) !== null && _b !== void 0 ? _b : true);
    var enableRef = (0, vue_1.ref)((_c = options.enable) !== null && _c !== void 0 ? _c : true);
    var measurementUnitRef = (0, vue_1.ref)((_d = options.measurementUnit) !== null && _d !== void 0 ? _d : "metric");
    var snapRef = (0, vue_1.ref)((_e = options.snap) !== null && _e !== void 0 ? _e : true);
    var showCircleRef = (0, vue_1.ref)((_f = options.showCircle) !== null && _f !== void 0 ? _f : true);
    var snapInteraction;
    var featureCollection = new ol_1.Collection();
    var _g = measurementInteractionWrapper(olMap, measurementTypeRef.value, {
        clearPrevious: clearPreviousRef.value,
        showSegments: showSegmentsRef.value,
        measurementUnit: measurementUnitRef.value,
        showCircle: showCircleRef.value,
    }), changeMeasurementType = _g.changeMeasurementType, setShowSegments = _g.setShowSegments, setClearPrevious = _g.setClearPrevious, setActive = _g.setActive, setUnit = _g.setUnit, cleanup = _g.cleanup, clear = _g.clear, setShowCircle = _g.setShowCircle;
    (0, vue_1.watch)(showCircleRef, function (v) { return setShowCircle(v); });
    (0, vue_1.watch)(measurementTypeRef, function (type) { return changeMeasurementType(type); });
    (0, vue_1.watch)(showSegmentsRef, function (v) { return setShowSegments(v); });
    (0, vue_1.watch)(clearPreviousRef, function (v) { return setClearPrevious(v); }, { immediate: true });
    (0, vue_1.watch)(enableRef, function (enabled) {
        if (enabled) {
            var features = (0, openlayersHelpers_1.getSnappableFeatures)(olMap);
            featureCollection.clear();
            featureCollection.extend(features);
        }
        else {
            featureCollection.clear();
        }
        setActive(enabled);
    }, { immediate: true });
    (0, vue_1.watch)(measurementUnitRef, function (unit) { return setUnit(unit); }, { immediate: true });
    (0, vue_1.watch)(snapRef, function (snap) {
        if (snap) {
            if (snapInteraction)
                olMap.removeInteraction(snapInteraction);
            snapInteraction = new Snap_1.default({
                features: featureCollection,
            });
            olMap.addInteraction(snapInteraction);
        }
        else {
            if (snapInteraction)
                olMap.removeInteraction(snapInteraction);
        }
    }, { immediate: true });
    (0, core_1.tryOnBeforeUnmount)(function () {
        cleanup();
        if (snapInteraction)
            olMap.removeInteraction(snapInteraction);
        featureCollection.clear();
    });
    return { clear: clear, enabled: enableRef };
}
