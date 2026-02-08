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
exports.calculateZoomToResolution = calculateZoomToResolution;
exports.useUnitLayer = useUnitLayer;
exports.useMapDrop = useMapDrop;
exports.useMoveInteraction = useMoveInteraction;
exports.useUnitSelectInteraction = useUnitSelectInteraction;
var layers_1 = require("@/geo/layers");
// import Fade from "ol-ext/featureanimation/Fade";
var vue_1 = require("vue");
var Vector_1 = require("ol/layer/Vector");
var proj_1 = require("ol/proj");
var geom_1 = require("ol/geom");
var interaction_1 = require("ol/interaction");
var unitStyles_1 = require("@/geo/unitStyles");
var condition_1 = require("ol/events/condition");
var openlayersHelpers_1 = require("./openlayersHelpers");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var selectedStore_1 = require("@/stores/selectedStore");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var draggables_1 = require("@/types/draggables");
var geoConvert_1 = require("@/utils/geoConvert");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var meta_1 = require("@turf/meta");
var centroid_1 = require("@turf/centroid");
var klona_1 = require("klona");
var View_1 = require("ol/View");
var Text_1 = require("ol/style/Text");
var Fill_1 = require("ol/style/Fill");
var Stroke_1 = require("ol/style/Stroke");
var Style_1 = require("ol/style/Style");
var featureLayerUtils_ts_1 = require("@/modules/scenarioeditor/featureLayerUtils.ts");
var zoomResolutions = [];
function calculateZoomToResolution(view) {
    zoomResolutions = [];
    for (var i = 0; i <= 24; i++) {
        zoomResolutions.push(view.getResolutionForZoom(i));
    }
}
calculateZoomToResolution(new View_1.default());
var unitLabelStyle = new Style_1.default({
    text: new Text_1.default({
        textAlign: "center",
        font: '12px "Inter Variable"',
        // fill: new Fill({ color: "#aa3300" }),
        fill: new Fill_1.default({ color: "black" }),
        stroke: new Stroke_1.default({ color: "rgba(255,255,255,0.9)", width: 4 }),
        textBaseline: "top",
    }),
});
var selectedUnitLabelStyle = new Style_1.default({
    text: new Text_1.default({
        textAlign: "center",
        font: '12px "Inter Variable"',
        // fill: new Fill({ color: "#aa3300" }),
        fill: new Fill_1.default({ color: "black" }),
        stroke: new Stroke_1.default({ color: "rgb(232,230,7)", width: 3 }),
        textBaseline: "top",
    }),
});
function useUnitLayer(_a) {
    var _b = _a === void 0 ? {} : _a, activeScenario = _b.activeScenario;
    var scenario = activeScenario || (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
    var _c = scenario.store, state = _c.state, onUndoRedo = _c.onUndoRedo, groupUpdate = _c.groupUpdate, geo = scenario.geo, getCombinedSymbolOptions = scenario.unitActions.getCombinedSymbolOptions, getUnitById = scenario.helpers.getUnitById;
    var mapSettings = (0, mapSettingsStore_1.useMapSettingsStore)();
    var unitLayer = (0, layers_1.createUnitLayer)();
    unitLayer.setStyle(unitStyleFunction);
    var labelLayer = new Vector_1.default({
        declutter: true,
        source: unitLayer.getSource(),
        updateWhileInteracting: true,
        updateWhileAnimating: true,
        properties: {
            id: (0, utils_1.nanoid)(),
            title: "Unit labels",
            layerType: featureLayerUtils_ts_1.LayerTypes.labels,
        },
        style: mapSettings.mapUnitLabelBelow ? labelStyleFunction : undefined,
        visible: mapSettings.mapUnitLabelBelow,
    });
    (0, vue_1.watch)(function () { return mapSettings.mapUnitLabelBelow; }, function (v) {
        labelLayer.setVisible(v);
        labelLayer.setStyle(v ? labelStyleFunction : undefined);
    });
    (0, vue_1.watch)(function () { return mapSettings.mapLabelSize; }, function (v) {
        var _a, _b;
        (_a = unitLabelStyle.getText()) === null || _a === void 0 ? void 0 : _a.setFont("".concat(v, "px \"Inter Variable\""));
        (_b = selectedUnitLabelStyle.getText()) === null || _b === void 0 ? void 0 : _b.setFont("".concat(v, "px \"Inter Variable\""));
    }, { immediate: true });
    function unitStyleFunction(feature, resolution) {
        var _a, _b, _c;
        var unitId = feature === null || feature === void 0 ? void 0 : feature.getId();
        var unit = getUnitById(unitId);
        if (!unit)
            return;
        var _d = (_a = unit.style) !== null && _a !== void 0 ? _a : {}, limitVisibility = _d.limitVisibility, _e = _d.minZoom, minZoom = _e === void 0 ? 0 : _e, _f = _d.maxZoom, maxZoom = _f === void 0 ? 24 : _f;
        if (limitVisibility &&
            (resolution > zoomResolutions[minZoom !== null && minZoom !== void 0 ? minZoom : 0] ||
                resolution < zoomResolutions[maxZoom !== null && maxZoom !== void 0 ? maxZoom : 24])) {
            return;
        }
        var unitStyle = unitStyles_1.unitStyleCache.get((_b = unit._ikey) !== null && _b !== void 0 ? _b : unitId);
        if (!unitStyle) {
            var symbolOptions = getCombinedSymbolOptions(unit);
            var _g = (0, unitStyles_1.createUnitStyle)(unit, symbolOptions, scenario), style = _g.style, cacheKey = _g.cacheKey;
            unitStyle = style;
            unit._ikey = cacheKey;
            unitStyles_1.unitStyleCache.set((_c = unit._ikey) !== null && _c !== void 0 ? _c : unitId, unitStyle);
        }
        return unitStyle;
    }
    function labelStyleFunction(feature, resolution) {
        var _a, _b;
        var unitId = feature === null || feature === void 0 ? void 0 : feature.getId();
        var unit = getUnitById(unitId);
        var _c = (_a = unit.style) !== null && _a !== void 0 ? _a : {}, limitVisibility = _c.limitVisibility, _d = _c.minZoom, minZoom = _d === void 0 ? 0 : _d, _e = _c.maxZoom, maxZoom = _e === void 0 ? 24 : _e;
        if (limitVisibility &&
            (resolution > zoomResolutions[minZoom !== null && minZoom !== void 0 ? minZoom : 0] ||
                resolution < zoomResolutions[maxZoom !== null && maxZoom !== void 0 ? maxZoom : 24])) {
            return;
        }
        var labelData = unitStyles_1.labelStyleCache.get(unitId);
        if (!unit)
            return;
        if (!labelData) {
            var unitStyle = unitStyles_1.unitStyleCache.get((_b = unit._ikey) !== null && _b !== void 0 ? _b : unitId);
            labelData = (0, unitStyles_1.createUnitLabelData)(unit, unitStyle, {
                wrapLabels: mapSettings.mapWrapUnitLabels,
                wrapWidth: mapSettings.mapWrapLabelWidth,
            });
            if (unitStyle) {
                unitStyles_1.labelStyleCache.set(unitId, labelData);
            }
        }
        var textStyle = unitLabelStyle.getText();
        textStyle.setText(labelData.text);
        textStyle.setOffsetY(labelData.yOffset);
        return unitLabelStyle;
    }
    onUndoRedo(function () {
        (0, unitStyles_1.clearUnitStyleCache)();
        state.unitStateCounter++;
    });
    var drawUnits = function () {
        var _a, _b;
        (_a = unitLayer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
        var units = geo.everyVisibleUnit.value.map(function (unit) {
            return (0, layers_1.createUnitFeatureAt)(unit._state.location, unit);
        });
        (_b = unitLayer.getSource()) === null || _b === void 0 ? void 0 : _b.addFeatures(units);
    };
    var animateUnits = function () {
        var _a, _b;
        (_a = unitLayer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
        var units = geo.everyVisibleUnit.value.map(function (unit) {
            return (0, layers_1.createUnitFeatureAt)(unit._state.location, unit);
        });
        (_b = unitLayer.getSource()) === null || _b === void 0 ? void 0 : _b.addFeatures(units);
        // units.forEach((f) =>
        //   //@ts-ignore
        //   unitLayer.animateFeature(f, new Fade({ duration: 1000 }))
        // );
    };
    return { unitLayer: unitLayer, labelLayer: labelLayer, drawUnits: drawUnits, animateUnits: animateUnits };
}
function useMapDrop(mapRef, unitLayer) {
    var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), geo = _a.geo, groupUpdate = _a.store.groupUpdate, getUnitById = _a.helpers.getUnitById;
    var mStore = (0, mapSettingsStore_1.useMapSettingsStore)();
    var selectedUnitIds = (0, selectedStore_1.useSelectedItems)().selectedUnitIds;
    var dndCleanup = function () { };
    var isDragging = (0, vue_1.ref)(false);
    var dropPosition = (0, vue_1.ref)([0, 0]);
    var formattedPosition = (0, vue_1.computed)(function () {
        return isDragging.value
            ? (0, geoConvert_1.getCoordinateFormatFunction)(mStore.coordinateFormat)(dropPosition.value)
            : "";
    });
    (0, vue_1.onMounted)(function () {
        var olMap = (0, vue_1.unref)(mapRef);
        dndCleanup = (0, adapter_1.dropTargetForElements)({
            element: olMap.getTargetElement(),
            canDrop: function (_a) {
                var source = _a.source;
                return (0, draggables_1.isUnitDragItem)(source.data) || (0, draggables_1.isScenarioFeatureDragItem)(source.data);
            },
            getData: function (_a) {
                var input = _a.input;
                return { position: (0, proj_1.toLonLat)(olMap.getEventCoordinate(input)) };
            },
            onDragEnter: function () {
                isDragging.value = true;
            },
            onDragLeave: function () {
                isDragging.value = false;
            },
            onDrag: function (_a) {
                var self = _a.self;
                dropPosition.value = self.data.position;
            },
            onDrop: function (_a) {
                var source = _a.source, self = _a.self;
                var dragData = source.data;
                isDragging.value = false;
                var dropPosition = self.data.position;
                if ((0, draggables_1.isUnitDragItem)(dragData)) {
                    groupUpdate(function () {
                        var selUnits = new Set(__spreadArray(__spreadArray([], selectedUnitIds.value, true), [dragData.unit.id], false));
                        for (var _i = 0, selUnits_1 = selUnits; _i < selUnits_1.length; _i++) {
                            var unitId = selUnits_1[_i];
                            var unitSource = (0, vue_1.unref)(unitLayer).getSource();
                            var existingUnitFeature = unitSource === null || unitSource === void 0 ? void 0 : unitSource.getFeatureById(unitId);
                            geo.addUnitPosition(unitId, dropPosition);
                            if (existingUnitFeature) {
                                existingUnitFeature.setGeometry(new geom_1.Point((0, proj_1.fromLonLat)(dropPosition)));
                            }
                            else {
                                var unit = getUnitById(unitId);
                                unit && (unitSource === null || unitSource === void 0 ? void 0 : unitSource.addFeature((0, layers_1.createUnitFeatureAt)(dropPosition, unit)));
                            }
                        }
                    });
                }
                else if ((0, draggables_1.isScenarioFeatureDragItem)(dragData)) {
                    var geometryCenter = (0, centroid_1.centroid)(dragData.feature).geometry.coordinates;
                    var to = dropPosition;
                    var diff_1 = [to[0] - geometryCenter[0], to[1] - geometryCenter[1]];
                    var geometryCopy = (0, klona_1.klona)(dragData.feature.geometry);
                    (0, meta_1.coordEach)(geometryCopy, function (coord) {
                        coord[0] += diff_1[0];
                        coord[1] += diff_1[1];
                    });
                    geo.updateFeature(dragData.feature.id, { geometry: geometryCopy });
                }
            },
        });
    });
    (0, vue_1.onUnmounted)(function () { return dndCleanup(); });
    return { isDragging: isDragging, dropPosition: dropPosition, formattedPosition: formattedPosition };
}
function useMoveInteraction(mapRef, unitLayer, enabled) {
    var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), geo = _a.geo, isUnitLocked = _a.unitActions.isUnitLocked, state = _a.store.state;
    var modifyInteraction = new interaction_1.Modify({
        hitDetection: unitLayer,
        source: unitLayer.getSource(),
    });
    modifyInteraction.on(["modifystart", "modifyend"], function (evt) {
        var _a;
        mapRef.getTargetElement().style.cursor =
            evt.type === "modifystart" ? "grabbing" : "pointer";
        if (evt.type === "modifystart") {
            evt.features.forEach(function (f) {
                var _a;
                var unitId = f.getId();
                if (isUnitLocked(unitId)) {
                    f.set("_geometry", (_a = f.getGeometry()) === null || _a === void 0 ? void 0 : _a.clone(), true);
                }
            });
        }
        if (evt.type === "modifyend") {
            var unitFeature = evt.features.pop();
            if (unitFeature) {
                var movedUnitId = unitFeature.getId();
                if (!movedUnitId)
                    return;
                var oldGeometry = unitFeature.get("_geometry");
                if (oldGeometry) {
                    unitFeature.setGeometry(oldGeometry);
                    unitFeature.set("_geometry", undefined, true);
                    return;
                }
                var newCoordinate = (_a = unitFeature.getGeometry()) === null || _a === void 0 ? void 0 : _a.getCoordinates();
                if (newCoordinate)
                    geo.addUnitPosition(movedUnitId, (0, proj_1.toLonLat)(newCoordinate));
            }
        }
    });
    var overlaySource = modifyInteraction.getOverlay().getSource();
    overlaySource === null || overlaySource === void 0 ? void 0 : overlaySource.on(["addfeature", "removefeature"], function (evt) {
        mapRef.getTargetElement().style.cursor = evt.type === "addfeature" ? "pointer" : "";
    });
    (0, vue_1.watch)(enabled, function (v) { return modifyInteraction.setActive(v); }, { immediate: true });
    return { moveInteraction: modifyInteraction };
}
function useUnitSelectInteraction(layers, olMap, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var mapSettings = (0, mapSettingsStore_1.useMapSettingsStore)();
    var isInternal = false;
    var enableRef = (0, vue_1.ref)((_a = options.enable) !== null && _a !== void 0 ? _a : true);
    var enableBoxSelectRef = (0, vue_1.ref)((_b = options.enableBoxSelect) !== null && _b !== void 0 ? _b : true);
    var _c = (0, selectedStore_1.useSelectedItems)(), selectedIds = _c.selectedUnitIds, clearSelectedItems = _c.clear;
    var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
    var geo = activeScenario.geo, getCombinedSymbolOptions = activeScenario.unitActions.getCombinedSymbolOptions, getUnitById = activeScenario.helpers.getUnitById;
    var unitSelectInteraction = new interaction_1.Select({
        layers: layers,
        style: selectedUnitStyleFunction,
        condition: condition_1.click,
        removeCondition: condition_1.altKeyOnly,
    });
    function selectedUnitStyleFunction(feature, resolution) {
        var _a, _b, _c, _d;
        var unitId = feature === null || feature === void 0 ? void 0 : feature.getId();
        var unit = getUnitById(unitId);
        if (!unit)
            return;
        var _e = (_a = unit.style) !== null && _a !== void 0 ? _a : {}, limitVisibility = _e.limitVisibility, _f = _e.minZoom, minZoom = _f === void 0 ? 0 : _f, _g = _e.maxZoom, maxZoom = _g === void 0 ? 24 : _g;
        if (limitVisibility &&
            (resolution > zoomResolutions[minZoom !== null && minZoom !== void 0 ? minZoom : 0] ||
                resolution < zoomResolutions[maxZoom !== null && maxZoom !== void 0 ? maxZoom : 24])) {
            return;
        }
        var unitStyle = unitStyles_1.selectedUnitStyleCache.get((_b = unit._ikey) !== null && _b !== void 0 ? _b : unitId);
        if (!unitStyle) {
            var symbolOptions = getCombinedSymbolOptions(unit);
            var _h = (0, unitStyles_1.createUnitStyle)(unit, __assign(__assign({}, symbolOptions), { infoOutlineColor: "yellow", infoOutlineWidth: 8, outlineColor: "yellow", outlineWidth: 21 }), activeScenario, "yellow"), style = _h.style, cacheKey = _h.cacheKey;
            unitStyle = style;
            unitStyles_1.selectedUnitStyleCache.set((_c = unit._ikey) !== null && _c !== void 0 ? _c : unitId, unitStyle);
        }
        if (!mapSettings.mapUnitLabelBelow)
            return unitStyle;
        var labelData = (_d = unitStyles_1.labelStyleCache.get(unitId)) !== null && _d !== void 0 ? _d : (0, unitStyles_1.createUnitLabelData)(unit, unitStyle, {
            wrapLabels: mapSettings.mapWrapUnitLabels,
            wrapWidth: mapSettings.mapWrapLabelWidth,
        });
        if (labelData) {
            var textStyle = selectedUnitLabelStyle.getText();
            textStyle.setText(labelData.text);
            textStyle.setOffsetY(labelData.yOffset);
            return [unitStyle, selectedUnitLabelStyle];
        }
        return unitStyle;
    }
    var boxSelectInteraction = new interaction_1.DragBox({ condition: condition_1.platformModifierKeyOnly });
    var selectedUnitFeatures = unitSelectInteraction.getFeatures();
    (0, vue_1.watch)(enableRef, function (enabled) {
        unitSelectInteraction.setActive(enabled);
        if (!enabled)
            selectedUnitFeatures.clear();
    }, { immediate: true });
    (0, vue_1.watch)(enableBoxSelectRef, function (enabled) {
        boxSelectInteraction.setActive(enabled);
        selectedUnitFeatures.clear();
    }, { immediate: true });
    (0, openlayersHelpers_1.useOlEvent)(unitSelectInteraction.on("select", function (event) {
        isInternal = true;
        if (selectedIds.value.size && !event.mapBrowserEvent.originalEvent.shiftKey) {
            clearSelectedItems();
        }
        if (selectedUnitFeatures.getLength() === 0 &&
            !event.mapBrowserEvent.originalEvent.shiftKey) {
            clearSelectedItems();
            return;
        }
        event.selected.forEach(function (f) { return selectedIds.value.add(f.getId()); });
        event.deselected.forEach(function (f) { return selectedIds.value.delete(f.getId()); });
    }));
    (0, openlayersHelpers_1.useOlEvent)(boxSelectInteraction.on("boxend", function () {
        // from https://openlayers.org/en/latest/examples/box-selection.html
        var extent = boxSelectInteraction.getGeometry().getExtent();
        var boxFeatures = layers
            .map(function (layer) {
            var _a;
            return (_a = layer
                .getSource()) === null || _a === void 0 ? void 0 : _a.getFeaturesInExtent(extent).filter(function (feature) {
                return feature.getGeometry().intersectsExtent(extent);
            });
        })
            .flat();
        // features that intersect the box geometry are added to the
        // collection of selected features
        // if the view is not obliquely rotated the box geometry and
        // its extent are equalivalent so intersecting features can
        // be added directly to the collection
        var rotation = olMap.getView().getRotation();
        var oblique = rotation % (Math.PI / 2) !== 0;
        // when the view is obliquely rotated the box extent will
        // exceed its geometry so both the box and the candidate
        // feature geometries are rotated around a common anchor
        // to confirm that, with the box geometry aligned with its
        // extent, the geometries intersect
        if (oblique) {
            var anchor_1 = [0, 0];
            var geometry = boxSelectInteraction.getGeometry().clone();
            geometry.rotate(-rotation, anchor_1);
            var extent_1 = geometry.getExtent();
            boxFeatures.forEach(function (feature) {
                var geometry = feature.getGeometry().clone();
                geometry.rotate(-rotation, anchor_1);
                if (geometry.intersectsExtent(extent_1)) {
                    selectedIds.value.add(feature.getId());
                    // selectedFeatures.push(feature);
                }
            });
        }
        else {
            boxFeatures.forEach(function (f) { return selectedIds.value.add(f.getId()); });
        }
    }));
    (0, openlayersHelpers_1.useOlEvent)(boxSelectInteraction.on("boxstart", function () {
        clearSelectedItems();
    }));
    (0, vue_1.watch)(function () { return __spreadArray([], selectedIds.value, true); }, function (v) { return redrawSelectedLayer(v); }, { immediate: true });
    (0, vue_1.watch)(geo.everyVisibleUnit, function () {
        isInternal = false;
        redrawSelectedLayer(__spreadArray([], selectedIds.value, true));
    });
    function redrawSelectedLayer(v) {
        if (!isInternal) {
            selectedUnitFeatures.clear();
            v.forEach(function (fid) {
                var _a, _b;
                var feature = (_b = (_a = layers[0]) === null || _a === void 0 ? void 0 : _a.getSource()) === null || _b === void 0 ? void 0 : _b.getFeatureById(fid);
                if (feature)
                    selectedUnitFeatures.push(feature);
            });
        }
        isInternal = false;
    }
    function redraw() {
        redrawSelectedLayer(__spreadArray([], selectedIds.value, true));
    }
    return { unitSelectInteraction: unitSelectInteraction, isEnabled: enableRef, boxSelectInteraction: boxSelectInteraction, redraw: redraw };
}
