"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMapHover = useMapHover;
var vue_1 = require("vue");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
var Observable_1 = require("ol/Observable");
function useMapHover(olMap, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var enableRef = (0, vue_1.ref)((_a = options.enable) !== null && _a !== void 0 ? _a : true);
    var pointerMoveKey = null;
    (0, vue_1.watch)(enableRef, function (enabled) {
        var touch = matchMedia("(hover: none)").matches;
        if (touch) {
            // Touch device detected, disabling hover
            return;
        }
        if (!enabled) {
            pointerMoveKey && (0, Observable_1.unByKey)(pointerMoveKey);
            pointerMoveKey = null;
            return;
        }
        pointerMoveKey = (0, openlayersHelpers_1.useOlEvent)(olMap.on("pointermove", function (e) {
            var pixel = olMap.getEventPixel(e.originalEvent);
            var hit = olMap.hasFeatureAtPixel(pixel);
            olMap.getTargetElement().style.cursor = hit ? "pointer" : "";
        }));
    }, { immediate: true });
    return { enable: enableRef };
}
