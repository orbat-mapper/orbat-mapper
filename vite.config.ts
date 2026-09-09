import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  optimizeDeps: {
    // This is source text for a worker, not a module to execute. Prebundling
    // turns the UMD script into a Promise export even with the ?raw suffix.
    exclude: ["maplibre-rtl-plugin/mapbox-gl-rtl-text.js?raw"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // The package exports its module entry, but MapLibre needs the standalone worker script.
      "maplibre-rtl-plugin": fileURLToPath(
        new URL("./node_modules/@mapbox/mapbox-gl-rtl-text/dist", import.meta.url),
      ),
    },
  },
});
