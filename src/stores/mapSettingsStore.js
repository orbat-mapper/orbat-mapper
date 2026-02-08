"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMapSettingsStore = void 0;
var pinia_1 = require("pinia");
var core_1 = require("@vueuse/core");
var constants_1 = require("@/config/constants");
exports.useMapSettingsStore = (0, pinia_1.defineStore)("mapSettings", {
    state: function () { return ({
        showLocation: (0, core_1.useLocalStorage)("showLocation", true),
        coordinateFormat: (0, core_1.useLocalStorage)("coordinateFormat", "DecimalDegrees"),
        showScaleLine: (0, core_1.useLocalStorage)("showScaleLine", true),
        baseLayerName: constants_1.DEFAULT_BASEMAP_ID,
        showDayNightTerminator: false,
        mapIconSize: (0, core_1.useLocalStorage)("mapIconSize", 30),
        mapCustomIconScale: (0, core_1.useLocalStorage)("mapCustomIconScale", 1.7),
        mapUnitLabelBelow: (0, core_1.useLocalStorage)("mapUnitLabelBelow", false),
        mapWrapUnitLabels: (0, core_1.useLocalStorage)("mapWrapUnitLabels", false),
        mapWrapLabelWidth: (0, core_1.useLocalStorage)("mapWrapLabelWidth", 15),
        mapLabelSize: (0, core_1.useLocalStorage)("mapLabelSize", 12),
    }); },
});
