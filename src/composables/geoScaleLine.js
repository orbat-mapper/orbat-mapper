"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShowScaleLine = useShowScaleLine;
var core_1 = require("@vueuse/core");
var vue_1 = require("vue");
var control_1 = require("ol/control");
function useShowScaleLine(olMap, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var enableRef = (0, vue_1.ref)((_a = options.enabled) !== null && _a !== void 0 ? _a : true);
    var measurementUnitsRef = (0, vue_1.ref)((_b = options.measurementUnits) !== null && _b !== void 0 ? _b : "metric");
    var scaleLineControl = new control_1.ScaleLine({ units: measurementUnitsRef.value });
    (0, vue_1.watch)(enableRef, function (enabled) {
        scaleLineControl.setMap(enabled ? olMap : null);
    }, { immediate: true });
    (0, vue_1.watch)(measurementUnitsRef, function (units) {
        scaleLineControl.setUnits(units);
    });
    (0, core_1.tryOnBeforeUnmount)(function () {
        olMap.removeControl(scaleLineControl);
    });
    return { enabled: enableRef };
}
