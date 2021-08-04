import { createRouter, createWebHistory } from "vue-router";
// import MainView from "./views/MainView.vue";
const MainView = () => import("./views/MainView.vue");
import LandingPage from "./views/LandingPage.vue";

export const SCENARIO_ROUTE = "ScenarioRoute";
export const LANDING_PAGE_ROUTE = "LandingPageRoute";

const routes = [
  { path: "/scenario", name: SCENARIO_ROUTE, component: MainView },
  { path: "/", name: LANDING_PAGE_ROUTE, component: LandingPage },
];

export const router = createRouter({ history: createWebHistory(), routes });
