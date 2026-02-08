"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./dayjs");
var vue_1 = require("vue");
var pinia_1 = require("pinia");
require("./styles.css");
var App_vue_1 = require("./App.vue");
var router_1 = require("./router");
(0, vue_1.createApp)(App_vue_1.default).use(router_1.router).use((0, pinia_1.createPinia)()).mount("#app");
