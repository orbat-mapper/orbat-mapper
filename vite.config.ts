import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // See https://github.com/maplibre/maplibre-gl-js/issues/6680#issuecomment-3523713122
  build: {
    target: "es2022",
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
  },
});
