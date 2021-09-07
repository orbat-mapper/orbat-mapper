import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import LandingPage from "./views/LandingPage.vue";

const MainView = () => import("./views/MainView.vue");
const StoryModeView = () => import("./views/StoryModeView.vue");

export const SCENARIO_ROUTE = "ScenarioRoute";
export const LANDING_PAGE_ROUTE = "LandingPageRoute";
export const STORY_MODE_ROUTE = "StoryModeRoute";
const routes = [
  {
    path: "/scenario",
    name: SCENARIO_ROUTE,
    component: MainView,
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
  { path: "/", name: LANDING_PAGE_ROUTE, component: LandingPage },
] as RouteRecordRaw[];

export const router = createRouter({ history: createWebHistory(), routes });

// router.beforeEach((to, from, next) => {
//   // If this isn't an initial page load.
//   if (to.name) {
//     // Start the route progress bar.
//     NProgress.start()
//   }
//   next()
// })

router.afterEach((to, from) => {
  // Complete the animation of the route progress bar.
  NProgress.done();
});
