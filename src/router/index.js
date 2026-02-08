"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var vue_router_1 = require("vue-router");
var nprogress_1 = require("nprogress");
require("nprogress/nprogress.css");
var LandingPage_vue_1 = require("../views/LandingPage.vue");
var names_1 = require("@/router/names");
var ScenarioEditorWrapper = function () {
    return Promise.resolve().then(function () { return require("../modules/scenarioeditor/ScenarioEditorWrapper.vue"); });
};
var NewScenarioView = function () { return Promise.resolve().then(function () { return require("../modules/scenarioeditor/NewScenarioView.vue"); }); };
var StoryModeView = function () { return Promise.resolve().then(function () { return require("../modules/storymode/StoryModeWrapper.vue"); }); };
var OrbatChartView = function () { return Promise.resolve().then(function () { return require("../modules/charteditor/OrbatChartViewWrapper.vue"); }); };
var ComponentsTestView = function () { return Promise.resolve().then(function () { return require("../views/ComponentsTestView.vue"); }); };
var GeoTestView = function () { return Promise.resolve().then(function () { return require("../views/GeoTestView.vue"); }); };
var GridTestView = function () { return Promise.resolve().then(function () { return require("@/modules/grid/GridTestView.vue"); }); };
var TanstackGridTestView = function () { return Promise.resolve().then(function () { return require("@/modules/grid/TanstackGridTestView.vue"); }); };
var TextToOrbatView = function () { return Promise.resolve().then(function () { return require("@/views/texttoorbat/TextToOrbatView.vue"); }); };
var ImportScenarioView = function () { return Promise.resolve().then(function () { return require("@/views/ImportScenarioView.vue"); }); };
var GridEditView = function () { return Promise.resolve().then(function () { return require("@/modules/scenarioeditor/GridEditView.vue"); }); };
var ChartEditView = function () { return Promise.resolve().then(function () { return require("@/modules/scenarioeditor/ChartEditView.vue"); }); };
var ScenarioEditorMap = function () { return Promise.resolve().then(function () { return require("@/modules/scenarioeditor/ScenarioEditorMap.vue"); }); };
var routes = [
    {
        path: "/scenario/:scenarioId",
        props: true,
        component: ScenarioEditorWrapper,
        beforeEnter: function (to, from) {
            nprogress_1.default.start();
        },
        children: [
            {
                path: "",
                name: names_1.MAP_EDIT_MODE_ROUTE,
                component: ScenarioEditorMap,
                meta: { helpUrl: "https://docs.orbat-mapper.app/guide/map-edit-mode" },
            },
            {
                path: "grid-edit",
                name: names_1.GRID_EDIT_ROUTE,
                component: GridEditView,
                meta: { helpUrl: "https://docs.orbat-mapper.app/guide/grid-edit-mode" },
            },
            {
                path: "chart-edit",
                name: names_1.CHART_EDIT_MODE_ROUTE,
                component: ChartEditView,
                meta: { helpUrl: "https://docs.orbat-mapper.app/guide/chart-edit-mode" },
            },
        ],
    },
    {
        path: "/newscenario",
        name: names_1.NEW_SCENARIO_ROUTE,
        component: NewScenarioView,
        beforeEnter: function (to, from) {
            nprogress_1.default.start();
        },
    },
    {
        path: "/storymode",
        name: names_1.STORY_MODE_ROUTE,
        component: StoryModeView,
        beforeEnter: function (to, from) {
            nprogress_1.default.start();
        },
    },
    {
        path: "/chart",
        name: names_1.ORBAT_CHART_ROUTE,
        component: OrbatChartView,
        beforeEnter: function (to, from) {
            nprogress_1.default.start();
        },
    },
    {
        path: "/testcomponents",
        component: ComponentsTestView,
    },
    {
        path: "/testgeo",
        component: GeoTestView,
    },
    {
        path: "/testgrid",
        component: GridTestView,
    },
    {
        path: "/testgrid2",
        component: TanstackGridTestView,
    },
    {
        path: "/text-to-orbat",
        name: names_1.TEXT_TO_ORBAT_ROUTE,
        component: TextToOrbatView,
    },
    {
        path: "/import",
        name: names_1.IMPORT_SCENARIO_ROUTE,
        component: ImportScenarioView,
    },
    { path: "/", name: names_1.LANDING_PAGE_ROUTE, component: LandingPage_vue_1.default },
];
exports.router = (0, vue_router_1.createRouter)({
    history: (0, vue_router_1.createWebHistory)(),
    routes: routes,
    scrollBehavior: function (to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        else {
            return { top: 0 };
        }
    },
});
exports.router.afterEach(function (to, from) {
    // Complete the animation of the route progress bar.
    nprogress_1.default.done();
});
