"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMainToolbarStore = void 0;
var pinia_1 = require("pinia");
exports.useMainToolbarStore = (0, pinia_1.defineStore)("mainToolbar", {
    state: function () { return ({
        currentToolbar: null,
        addMultiple: false,
        currentDrawStyle: {},
        modifyFeatureState: false,
    }); },
    actions: {
        toggleToolbar: function (toolbar) {
            this.currentToolbar = this.currentToolbar === toolbar ? null : toolbar;
        },
        clearToolbar: function () {
            this.currentToolbar = null;
        },
    },
});
