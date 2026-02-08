"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMapSelectStore = void 0;
var pinia_1 = require("pinia");
exports.useMapSelectStore = (0, pinia_1.defineStore)("uiMapSelect", {
    state: function () { return ({
        unitSelectEnabled: true,
        featureSelectEnabled: true,
        hoverEnabled: true,
    }); },
});
