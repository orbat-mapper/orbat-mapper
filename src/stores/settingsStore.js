"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSymbolSettingsStore = exports.useSettingsStore = void 0;
var pinia_1 = require("pinia");
var core_1 = require("@vueuse/core");
exports.useSettingsStore = (0, pinia_1.defineStore)("settings", {
    state: function () {
        return {
            orbatIconSize: (0, core_1.useLocalStorage)("orbatIconSize", 20),
            orbatShortName: (0, core_1.useLocalStorage)("orbatShortName", false),
        };
    },
});
exports.useSymbolSettingsStore = (0, pinia_1.defineStore)("symbolSettings", {
    state: function () {
        return {
            symbologyStandard: "2525",
            simpleStatusModifier: (0, core_1.useLocalStorage)("simpleStatusModifier", false),
        };
    },
    getters: {
        symbolOptions: function (state) { return ({
            symbologyStandard: state.symbologyStandard,
            simpleStatusModifier: state.simpleStatusModifier,
        }); },
    },
});
