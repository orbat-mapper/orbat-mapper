import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import LandingPage from "../views/LandingPage.vue";
import {
  CHART_EDIT_MODE_ROUTE,
  GRID_EDIT_ROUTE,
  LANDING_PAGE_ROUTE,
  MAP_EDIT_MODE_ROUTE,
  NEW_SCENARIO_ROUTE,
  ORBAT_CHART_ROUTE,
  OLD_MAP_ROUTE,
  STORY_MODE_ROUTE,
} from "@/router/names";

declare module "vue-router" {
  interface RouteMeta {
    // is optional
    helpUrl?: string;
  }
}

const ScenarioEditorWrapper = () =>
  import("../modules/scenarioeditor/ScenarioEditorWrapper.vue");
const NewScenarioView = () => import("../modules/scenarioeditor/NewScenarioView.vue");
const StoryModeView = () => import("../modules/storymode/StoryModeWrapper.vue");
const OrbatChartView = () => import("../modules/charteditor/OrbatChartViewWrapper.vue");
const ComponentsTestView = () => import("../views/ComponentsTestView.vue");
const GeoTestView = () => import("../views/GeoTestView.vue");
const GridTestView = () => import("@/modules/grid/GridTestView.vue");
const GridEditView = () => import("@/modules/scenarioeditor/GridEditView.vue");
const ChartEditView = () => import("@/modules/scenarioeditor/ChartEditView.vue");
const ScenarioEditorGeo = () => import("@/modules/scenarioeditor/ScenarioEditorGeo.vue");
const ScenarioEditorMap = () => import("@/modules/scenarioeditor/ScenarioEditorMap.vue");
const routes = [
  {
    path: "/scenario",
    component: ScenarioEditorWrapper,
    beforeEnter: (to, from) => {
      NProgress.start();
    },
    children: [
      {
        path: "",
        name: MAP_EDIT_MODE_ROUTE,
        component: ScenarioEditorMap,
        meta: { helpUrl: "https://docs.orbat-mapper.app/guide/map-edit-mode" },
      },
      {
        path: "map-old",
        name: OLD_MAP_ROUTE,
        component: ScenarioEditorGeo,
        meta: { helpUrl: "https://docs.orbat-mapper.app/guide/map-edit-mode" },
      },
      {
        path: "grid-edit",
        name: GRID_EDIT_ROUTE,
        component: GridEditView,
        meta: { helpUrl: "https://docs.orbat-mapper.app/guide/grid-edit-mode" },
      },
      {
        path: "chart-edit",
        name: CHART_EDIT_MODE_ROUTE,
        component: ChartEditView,
        meta: { helpUrl: "https://docs.orbat-mapper.app/guide/chart-edit-mode" },
      },
    ],
  },
  {
    path: "/newscenario",
    name: NEW_SCENARIO_ROUTE,
    component: NewScenarioView,
    beforeEnter: (to, from) => {
      NProgress.start();
    },
  },
  {
    path: "/storymode",
    name: STORY_MODE_ROUTE,
    component: StoryModeView,
    beforeEnter: (to, from) => {
      NProgress.start();
    },
  },
  {
    path: "/chart",
    name: ORBAT_CHART_ROUTE,
    component: OrbatChartView,
    beforeEnter: (to, from) => {
      NProgress.start();
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
  { path: "/", name: LANDING_PAGE_ROUTE, component: LandingPage },
] as RouteRecordRaw[];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.afterEach((to, from) => {
  // Complete the animation of the route progress bar.
  NProgress.done();
});
