import "./dayjs";
import { createApp } from "vue";
import { createPinia } from "pinia";
import "./styles.css";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(router).use(createPinia()).mount("#app");
