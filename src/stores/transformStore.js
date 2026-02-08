"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransformSettingsStore = void 0;
var pinia_1 = require("pinia");
var transformations_ts_1 = require("@/geo/transformations.ts");
var vue_1 = require("vue");
exports.useTransformSettingsStore = (0, pinia_1.defineStore)("transformSettings", function () {
    var showPreview = (0, vue_1.ref)(true);
    var transformations = (0, vue_1.ref)([
        (0, transformations_ts_1.createDefaultTransformationOperation)(),
    ]);
    var updateAtTime = (0, vue_1.ref)(false);
    var updateActiveFeature = (0, vue_1.ref)();
    return {
        showPreview: showPreview,
        transformations: transformations,
        updateAtTime: updateAtTime,
        updateActiveFeature: updateActiveFeature,
    };
});
