"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEditingInteraction = useEditingInteraction;
var vue_1 = require("vue");
var Draw_1 = require("ol/interaction/Draw");
var Translate_1 = require("ol/interaction/Translate");
var Snap_1 = require("ol/interaction/Snap");
var Select_1 = require("ol/interaction/Select");
var interaction_1 = require("ol/interaction");
var openlayersHelpers_1 = require("./openlayersHelpers");
var condition_1 = require("ol/events/condition");
var ol_1 = require("ol");
function useEditingInteraction(olMap, vectorLayer, options) {
    var _a, _b, _c, _d;
    if (options === void 0) { options = {}; }
    var snapInteraction;
    var featureCollection = new ol_1.Collection();
    var layerRef = (0, vue_1.ref)(vectorLayer);
    var snapRef = (0, vue_1.ref)((_a = options.snap) !== null && _a !== void 0 ? _a : true);
    var translateRef = (0, vue_1.ref)((_b = options.translate) !== null && _b !== void 0 ? _b : false);
    var currentDrawInteraction;
    var source = layerRef.value.getSource();
    var _e = initializeDrawInteractions(source), lineDraw = _e.lineDraw, polygonDraw = _e.polygonDraw, pointDraw = _e.pointDraw, circleDraw = _e.circleDraw;
    var currentDrawType = (0, vue_1.ref)(null);
    var isModifying = (0, vue_1.ref)(false);
    var isDrawing = (0, vue_1.ref)(false);
    var emit = options.emit;
    var addMultiple = (0, vue_1.ref)((_c = options.addMultiple) !== null && _c !== void 0 ? _c : false);
    olMap.addInteraction(lineDraw);
    olMap.addInteraction(polygonDraw);
    olMap.addInteraction(pointDraw);
    olMap.addInteraction(circleDraw);
    (0, openlayersHelpers_1.useOlEvent)(lineDraw.on("drawend", onDrawEnd));
    (0, openlayersHelpers_1.useOlEvent)(polygonDraw.on("drawend", onDrawEnd));
    (0, openlayersHelpers_1.useOlEvent)(pointDraw.on("drawend", onDrawEnd));
    (0, openlayersHelpers_1.useOlEvent)(circleDraw.on("drawend", onDrawEnd));
    var select = (_d = options.select) !== null && _d !== void 0 ? _d : new Select_1.default({
        layers: [layerRef.value],
        hitTolerance: 20,
        condition: condition_1.click,
    });
    if (!options.select) {
        olMap.addInteraction(select);
        select.setActive(false);
    }
    var modify = new interaction_1.Modify({ features: select.getFeatures(), pixelTolerance: 20 });
    (0, openlayersHelpers_1.useOlEvent)(modify.on("modifyend", function (event) {
        emit && emit("modify", event.features.getArray());
        options.modifyHandler && options.modifyHandler(event.features.getArray());
    }));
    olMap.addInteraction(modify);
    modify.setActive(false);
    var translateInteraction = new Translate_1.default({
        condition: function (event) {
            if (translateRef.value)
                return true;
            return (0, condition_1.primaryAction)(event) && (0, condition_1.platformModifierKeyOnly)(event);
        },
        features: select.getFeatures(),
    });
    translateInteraction.setActive(true);
    (0, openlayersHelpers_1.useOlEvent)(translateInteraction.on("translateend", function (event) {
        emit && emit("modify", event.features.getArray());
        options.modifyHandler && options.modifyHandler(event.features.getArray());
    }));
    olMap.addInteraction(translateInteraction);
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
    function onDrawEnd(e) {
        if (!(0, vue_1.unref)(addMultiple)) {
            // currentDrawInteraction?.setActive(false);
            // currentDrawType.value = null;
            cancel();
        }
        emit && emit("add", e.feature, layerRef.value);
        options.addHandler && options.addHandler(e.feature, layerRef.value);
    }
    function startDrawing(drawType) {
        select.setActive(false);
        select.getFeatures().clear();
        isDrawing.value = true;
        stopModify();
        currentDrawInteraction === null || currentDrawInteraction === void 0 ? void 0 : currentDrawInteraction.setActive(false);
        currentDrawInteraction = null;
        if (drawType === "LineString")
            currentDrawInteraction = lineDraw;
        if (drawType === "Polygon")
            currentDrawInteraction = polygonDraw;
        if (drawType === "Point")
            currentDrawInteraction = pointDraw;
        if (drawType === "Circle")
            currentDrawInteraction = circleDraw;
        currentDrawInteraction === null || currentDrawInteraction === void 0 ? void 0 : currentDrawInteraction.setActive(true);
        currentDrawType.value = drawType;
    }
    function stopModify() {
        modify.setActive(false);
        isModifying.value = false;
    }
    function startModify() {
        if (isModifying.value) {
            stopModify();
            return;
        }
        currentDrawInteraction === null || currentDrawInteraction === void 0 ? void 0 : currentDrawInteraction.setActive(false);
        currentDrawType.value = null;
        isDrawing.value = false;
        select.setActive(true);
        modify.setActive(true);
        isModifying.value = true;
    }
    function cancel() {
        select.setActive(true);
        stopModify();
        currentDrawInteraction === null || currentDrawInteraction === void 0 ? void 0 : currentDrawInteraction.setActive(false);
        currentDrawInteraction = null;
        currentDrawType.value = null;
        isDrawing.value = false;
    }
    (0, vue_1.onUnmounted)(function () {
        snapInteraction && olMap.removeInteraction(snapInteraction);
        olMap.removeInteraction(pointDraw);
        olMap.removeInteraction(lineDraw);
        olMap.removeInteraction(polygonDraw);
        olMap.removeInteraction(circleDraw);
        if (!options.select)
            olMap.removeInteraction(select);
        olMap.removeInteraction(modify);
        olMap.removeInteraction(translateInteraction);
    });
    (0, vue_1.watch)([isDrawing, isModifying], function (_a) {
        var enabledDrawing = _a[0], enabledModifying = _a[1];
        var enabled = enabledDrawing || enabledModifying;
        if (enabled && snapRef.value) {
            var features = (0, openlayersHelpers_1.getSnappableFeatures)(olMap);
            featureCollection.clear();
            featureCollection.extend(features);
        }
        else {
            featureCollection.clear();
        }
    }, { immediate: true });
    return { startDrawing: startDrawing, currentDrawType: currentDrawType, startModify: startModify, isModifying: isModifying, cancel: cancel, isDrawing: isDrawing };
}
function initializeDrawInteractions(source) {
    var lineDraw = new Draw_1.default({ type: "LineString", source: source });
    lineDraw.setActive(false);
    var polygonDraw = new Draw_1.default({ type: "Polygon", source: source });
    polygonDraw.setActive(false);
    var pointDraw = new Draw_1.default({ type: "Point", source: source });
    pointDraw.setActive(false);
    var circleDraw = new Draw_1.default({ type: "Circle", source: source });
    circleDraw.setActive(false);
    return { lineDraw: lineDraw, polygonDraw: polygonDraw, pointDraw: pointDraw, circleDraw: circleDraw };
}
