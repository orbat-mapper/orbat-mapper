"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDayNightLayer = useDayNightLayer;
var DayNight_1 = require("ol-ext/source/DayNight");
var Vector_1 = require("ol/layer/Vector");
var Style_1 = require("ol/style/Style");
var Circle_1 = require("ol/style/Circle");
var style_1 = require("ol/style");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var pinia_1 = require("pinia");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
function useDayNightLayer() {
    var state = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store.state;
    var showDayNightTerminator = (0, pinia_1.storeToRefs)((0, mapSettingsStore_1.useMapSettingsStore)()).showDayNightTerminator;
    var vectorSource = new DayNight_1.default();
    var layer = new Vector_1.default({
        properties: { title: "Day/Night" },
        source: vectorSource,
        visible: showDayNightTerminator.value,
        style: new Style_1.default({
            image: new Circle_1.default({
                radius: 5,
                fill: new style_1.Fill({ color: "red" }),
            }),
            fill: new style_1.Fill({
                color: [0, 0, 50, 0.4],
            }),
        }),
    });
    var _a = (0, core_1.watchPausable)(function () { return state.currentTime; }, function (time) {
        vectorSource.setTime(new Date(time));
    }, { immediate: true }), pause = _a.pause, resume = _a.resume;
    (0, vue_1.watch)(showDayNightTerminator, function (show) {
        show ? resume() : pause();
        layer.setVisible(show);
    }, { immediate: true });
    return layer;
}
