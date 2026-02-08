"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGeoEditorViewStore = void 0;
var pinia_1 = require("pinia");
exports.useGeoEditorViewStore = (0, pinia_1.defineStore)("geoEditorView", {
    state: function () { return ({
        panelWidthA: 382,
        detailsPanelWidth: 382,
        detailsRight: true,
        showDetailsPanel: true,
    }); },
});
