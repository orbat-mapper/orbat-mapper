"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMapViewStore = void 0;
var pinia_1 = require("pinia");
exports.useMapViewStore = (0, pinia_1.defineStore)("mapView", {
    state: function () { return ({
        zoomLevel: 0,
    }); },
});
