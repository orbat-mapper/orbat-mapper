"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGetMapLocation = useGetMapLocation;
var core_1 = require("@vueuse/core");
var Observable_1 = require("ol/Observable");
var proj_1 = require("ol/proj");
var vue_1 = require("vue");
var mapSelectStore_1 = require("@/stores/mapSelectStore");
function useGetMapLocation(olMap, options) {
    if (options === void 0) { options = {}; }
    var _a = options.cancelOnClickOutside, cancelOnClickOutside = _a === void 0 ? true : _a, _b = options.stopPropagationOnClickOutside, stopPropagationOnClickOutside = _b === void 0 ? true : _b;
    var isActive = (0, vue_1.ref)(false);
    var mapSelectStore = (0, mapSelectStore_1.useMapSelectStore)();
    var prevCursor = olMap.getTargetElement().style.cursor;
    var clickEventKey;
    var stopEscListener;
    var stopClickOutside;
    var onGetLocationHook = (0, core_1.createEventHook)();
    var onCancelHook = (0, core_1.createEventHook)();
    var onStartHook = (0, core_1.createEventHook)();
    var prevHoverValue = true;
    function start() {
        isActive.value = true;
        onStartHook.trigger(null);
        prevHoverValue = mapSelectStore.hoverEnabled;
        mapSelectStore.hoverEnabled = false;
        olMap.getTargetElement().style.cursor = "crosshair";
        if (cancelOnClickOutside) {
            stopClickOutside = (0, core_1.onClickOutside)(olMap.getTargetElement(), function (e) {
                if (stopPropagationOnClickOutside)
                    e.stopPropagation();
                cancel();
            });
        }
        stopEscListener = (0, core_1.onKeyStroke)("Escape", function () { return cancel(); });
        //@ts-ignore
        clickEventKey = olMap.once("click", handleMapClickEvent);
    }
    function handleMapClickEvent(event) {
        event.stopPropagation();
        cleanUp();
        onGetLocationHook.trigger((0, proj_1.toLonLat)(event.coordinate, olMap.getView().getProjection()));
    }
    function cleanUp() {
        var el = olMap === null || olMap === void 0 ? void 0 : olMap.getTargetElement();
        if (el) {
            el.style.cursor = prevCursor;
        }
        isActive.value = false;
        if (clickEventKey)
            (0, Observable_1.unByKey)(clickEventKey);
        if (stopEscListener)
            stopEscListener();
        if (stopClickOutside)
            stopClickOutside();
        mapSelectStore.hoverEnabled = prevHoverValue;
    }
    function cancel() {
        cleanUp();
        onCancelHook.trigger(null);
    }
    (0, core_1.tryOnBeforeUnmount)(function () { return cleanUp(); });
    return {
        isActive: isActive,
        cancel: cancel,
        start: start,
        onStart: onStartHook.on,
        onGetLocation: onGetLocationHook.on,
        onCancel: onCancelHook.on,
    };
}
