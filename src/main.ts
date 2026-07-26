import "./dayjs";
import { createApp } from "vue";
import { createPinia } from "pinia";
import "./styles.css";
import App from "./App.vue";
import { router } from "./router";
import { registerBasemapProtocols } from "@/geo/basemapArchive";

// Global MapLibre protocols — registered once here, not per map instance.
registerBasemapProtocols();

createApp(App).use(router).use(createPinia()).mount("#app");
