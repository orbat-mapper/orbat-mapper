"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWidthStore = exports.useUiStore = exports.prevToeIncludeSubordinates = void 0;
var pinia_1 = require("pinia");
var core_1 = require("@vueuse/core");
var constants_1 = require("@/types/constants");
exports.prevToeIncludeSubordinates = undefined;
exports.useUiStore = (0, pinia_1.defineStore)("ui", {
    state: function () { return ({
        modalOpen: false,
        editToolbarActive: false,
        measurementActive: false,
        getLocationActive: false,
        activeItem: null,
        activeStateItem: null,
        debugMode: (0, core_1.useLocalStorage)("debugMode", false),
        showFps: (0, core_1.useLocalStorage)("showFps", false),
        mobilePanelOpen: false,
        layersPanelActive: false,
        activeTabIndex: constants_1.TAB_ORBAT,
        showSearch: false,
        searchGeoMode: false,
        mapLayersPanelOpen: true,
        showToolbar: true,
        showTimeline: (0, core_1.useLocalStorage)("showTimeline", true),
        showLeftPanel: true,
        showOrbatBreadcrumbs: (0, core_1.useLocalStorage)("showOrbatBreadcrumbs", true),
        goToNextOnSubmit: (0, core_1.useLocalStorage)("goToNextOnSubmit", true),
        toeTabIndex: 0,
        toeIncludeSubordinates: (0, core_1.useLocalStorage)("toeIncludeSubordinates", true),
        prevToeIncludeSubordinates: undefined,
        prevSuppliesIncludeSubordinates: undefined,
        popperCounter: 0,
    }); },
    getters: {
        shortcutsEnabled: function (state) { return !state.modalOpen; },
        escEnabled: function (state) {
            return !(state.modalOpen ||
                state.editToolbarActive ||
                state.measurementActive ||
                state.getLocationActive ||
                state.popperCounter > 0);
        },
    },
});
exports.useWidthStore = (0, pinia_1.defineStore)("panelWidth", {
    state: function () { return ({
        orbatPanelWidth: (0, core_1.useLocalStorage)("orbatPanelWidth", 400),
        detailsWidth: (0, core_1.useLocalStorage)("detailsPanelWidth", 400),
    }); },
    actions: {
        resetOrbatPanelWidth: function () {
            this.orbatPanelWidth = 400;
        },
        resetDetailsWidth: function () {
            this.detailsWidth = 400;
        },
    },
});
