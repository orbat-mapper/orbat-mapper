"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTabStore = void 0;
var pinia_1 = require("pinia");
var constants_1 = require("@/types/constants");
exports.useTabStore = (0, pinia_1.defineStore)("uiTabs", {
    state: function () { return ({
        activeScenarioTab: constants_1.TAB_ORBAT,
        unitDetailsTab: 0,
        featureDetailsTab: 0,
    }); },
    getters: {
        orbatTabActive: function (state) { return state.activeScenarioTab === constants_1.TAB_ORBAT; },
    },
});
