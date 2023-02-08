import "./dayjs";
import { createApp } from "vue";
import { createPinia } from "pinia";
import "inter-ui/inter.css";
import "./styles.css";
import App from "./App.vue";
import { router } from "./router";
import "@imengyu/vue3-context-menu/lib/vue3-context-menu.css";

createApp(App).use(router).use(createPinia()).mount("#app");
