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
    // The `link:`-ed tactical-draw packages (see package.json) carry their own
    // node_modules. Dedupe forces a single instance of each engine and the
    // shared core so peer deps and `instanceof` checks stay sound. Remove once
    // those packages are published to npm. Mirrored in tsconfig.app.json paths.
    dedupe: [
      "maplibre-gl",
      "ol",
      "@orbat-mapper/control-measures",
      "@orbat-mapper/tactical-draw",
    ],
  },
});
