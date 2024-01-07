import "./dayjs";
import { createApp } from "vue";
import { createPinia } from "pinia";
import "inter-ui/inter-variable.css";
import "./styles.css";
import App from "./App.vue";
import { router } from "./router";
import "@imengyu/vue3-context-menu/lib/vue3-context-menu.css";
import { polyfill as dragDropPolyfill } from "mobile-drag-drop";

// needed for some mobile devices (Firefox android)
dragDropPolyfill();

createApp(App).use(router).use(createPinia()).mount("#app");
