"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShowLocationControl = useShowLocationControl;
var MousePosition_1 = require("ol/control/MousePosition");
var core_1 = require("@vueuse/core");
var vue_1 = require("vue");
var geoConvert_1 = require("@/utils/geoConvert");
function useShowLocationControl(olMap, options) {
    var _a, _b, _c;
    if (options === void 0) { options = {}; }
    var projectionRef = (0, vue_1.ref)((_a = options.projection) !== null && _a !== void 0 ? _a : "EPSG:4326");
    var coordinateFormatRef = (0, vue_1.ref)((_b = options.coordinateFormat) !== null && _b !== void 0 ? _b : "DecimalDegrees");
    var enableRef = (0, vue_1.ref)((_c = options.enable) !== null && _c !== void 0 ? _c : true);
    var mousePositionControl = new MousePosition_1.default({
        projection: projectionRef.value,
        className: "location-control",
    });
    (0, vue_1.watch)(enableRef, function (enabled) {
        mousePositionControl.setMap(enabled ? olMap : null);
    }, { immediate: true });
    (0, vue_1.watch)(coordinateFormatRef, function (f) {
        mousePositionControl.setCoordinateFormat(getCoordinateFormat());
        // @ts-ignore
        if (enableRef.value)
            mousePositionControl === null || mousePositionControl === void 0 ? void 0 : mousePositionControl.updateHTML_([0, 0]);
    }, { immediate: true });
    (0, core_1.tryOnBeforeUnmount)(function () {
        olMap.removeControl(mousePositionControl);
    });
    function getCoordinateFormat() {
        var format = coordinateFormatRef.value;
        return (0, geoConvert_1.getCoordinateFormatFunction)(format);
    }
    return { enable: enableRef };
}
